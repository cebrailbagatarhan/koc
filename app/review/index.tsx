import { Stack, router } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import { getQuizQuestions, type QuizQuestion } from '@/data/offlineContent';
import {
  getDueReviewItems,
  getReviewDashboard,
  recordQuizOutcome,
  type ReviewDashboard,
  type ReviewItem,
} from '@/storage/reviewStore';

type QueueEntry = {
  review: ReviewItem;
  question: QuizQuestion;
};

const emptyDashboard: ReviewDashboard = {
  dueCount: 0,
  trackedCount: 0,
  nextDueAt: null,
  weakCourses: [],
};

function resolveQuestion(item: ReviewItem) {
  return getQuizQuestions(item.levelName, item.courseName).find(
    (question) => question.id === item.questionId,
  );
}

export default function ReviewScreen() {
  const [queue, setQueue] = useState<QueueEntry[]>([]);
  const [dashboard, setDashboard] = useState<ReviewDashboard>(emptyDashboard);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [finished, setFinished] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const [items, nextDashboard] = await Promise.all([
      getDueReviewItems(),
      getReviewDashboard(),
    ]);
    const resolved = items
      .map((review) => {
        const question = resolveQuestion(review);
        return question ? { review, question } : null;
      })
      .filter((entry): entry is QueueEntry => Boolean(entry));

    setQueue(resolved);
    setDashboard(nextDashboard);
    setIndex(0);
    setSelected(null);
    setCorrectCount(0);
    setFinished(false);
    setLoading(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const current = queue[index];
  const progress = useMemo(
    () => (queue.length ? Math.round(((index + 1) / queue.length) * 100) : 0),
    [index, queue.length],
  );

  const handleAnswer = async (answer: string) => {
    if (!current || selected) return;
    const correct = answer === current.question.correctAnswer;
    setSelected(answer);
    if (correct) setCorrectCount((value) => value + 1);

    await recordQuizOutcome({
      levelName: current.review.levelName,
      courseName: current.review.courseName,
      questionId: current.question.id,
      correct,
      selectedAnswer: answer,
    });
  };

  const handleNext = () => {
    if (index >= queue.length - 1) {
      setFinished(true);
      getReviewDashboard().then(setDashboard);
      return;
    }
    setIndex((value) => value + 1);
    setSelected(null);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <Stack.Screen options={{ title: 'Günlük Tekrar' }} />
        <Text style={styles.bigIcon}>🧠</Text>
        <Text style={styles.centerTitle}>Tekrar kuyruğu hazırlanıyor...</Text>
      </View>
    );
  }

  if (finished) {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <Stack.Screen options={{ title: 'Tekrar Tamamlandı' }} />
        <View style={styles.finishCard}>
          <Text style={styles.bigIcon}>✅</Text>
          <Text style={styles.finishTitle}>Tekrar oturumu tamamlandı</Text>
          <Text style={styles.finishScore}>{correctCount}/{queue.length} doğru</Text>
          <Text style={styles.muted}>
            Doğru bildiğin soruların tekrar aralığı uzatıldı. Yanlışlar daha erken tekrar karşısına çıkacak.
          </Text>
          <TouchableOpacity style={styles.primaryButton} onPress={() => router.back()}>
            <Text style={styles.primaryButtonText}>Derslere dön</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }

  if (!current) {
    const weakest = dashboard.weakCourses[0];
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <Stack.Screen options={{ title: 'Günlük Tekrar' }} />
        <View style={styles.doneCard}>
          <Text style={styles.bigIcon}>🌿</Text>
          <Text style={styles.finishTitle}>Şu anda bekleyen tekrar yok</Text>
          <Text style={styles.muted}>
            Yanlış yaptığın sorular otomatik olarak buraya gelir. Doğru tekrar ettikçe aralıkları uzar.
          </Text>
        </View>

        {weakest ? (
          <View style={styles.coachCard}>
            <Text style={styles.coachEyebrow}>KOÇ ÖNERİSİ</Text>
            <Text style={styles.coachTitle}>{weakest.courseName} üzerinde biraz daha çalış</Text>
            <Text style={styles.muted}>
              {weakest.questionsAnswered} soruda doğruluk %{weakest.accuracy}. Yeni bir quiz çözmek tekrar havuzunu daha doğru kişiselleştirir.
            </Text>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => router.push(`/quiz/${weakest.levelName}/${weakest.courseName}`)}>
              <Text style={styles.primaryButtonText}>Quiz başlat</Text>
            </TouchableOpacity>
          </View>
        ) : null}
      </ScrollView>
    );
  }

  const isCorrectSelection = selected === current.question.correctAnswer;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Stack.Screen options={{ title: 'Günlük Tekrar' }} />

      <View style={styles.headerRow}>
        <View>
          <Text style={styles.eyebrow}>TEKRAR {index + 1}/{queue.length}</Text>
          <Text style={styles.courseLabel}>{current.review.courseName} · {current.review.levelName}</Text>
        </View>
        <Text style={styles.wrongBadge}>↻ {current.review.wrongCount}</Text>
      </View>

      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${progress}%` }]} />
      </View>

      <View style={styles.questionCard}>
        <Text style={styles.questionText}>{current.question.question}</Text>
      </View>

      <View style={styles.options}>
        {current.question.options.map((option) => {
          const correct = selected ? option === current.question.correctAnswer : false;
          const wrong = selected === option && option !== current.question.correctAnswer;
          return (
            <TouchableOpacity
              key={option}
              disabled={Boolean(selected)}
              activeOpacity={0.85}
              style={[styles.option, correct && styles.correct, wrong && styles.wrong]}
              onPress={() => handleAnswer(option)}>
              <Text style={styles.optionText}>{option}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {selected ? (
        <View style={styles.feedbackCard}>
          <Text style={styles.feedbackTitle}>
            {isCorrectSelection ? 'Doğru — tekrar aralığı uzatıldı ✓' : `Doğru cevap: ${current.question.correctAnswer}`}
          </Text>
          <Text style={styles.muted}>{current.question.explanation}</Text>
          {!isCorrectSelection ? (
            <Text style={styles.retryText}>Bu soru tekrar kuyruğunda kalacak ve daha erken yeniden gösterilecek.</Text>
          ) : null}
          <TouchableOpacity style={styles.primaryButton} onPress={handleNext}>
            <Text style={styles.primaryButtonText}>
              {index === queue.length - 1 ? 'Oturumu bitir' : 'Sonraki tekrar'}
            </Text>
          </TouchableOpacity>
        </View>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F3FB' },
  content: { padding: 18, paddingBottom: 40 },
  center: { flex: 1, backgroundColor: '#F5F3FB', alignItems: 'center', justifyContent: 'center', padding: 28 },
  centerTitle: { color: '#1D1A34', fontSize: 18, fontWeight: '800', marginTop: 12 },
  bigIcon: { fontSize: 50 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  eyebrow: { color: '#FF5C7C', fontSize: 11, fontWeight: '900', letterSpacing: 1 },
  courseLabel: { color: '#1D1A34', fontSize: 14, fontWeight: '800', marginTop: 3 },
  wrongBadge: { color: '#9B5DE5', backgroundColor: '#EFE6FA', paddingHorizontal: 11, paddingVertical: 7, borderRadius: 999, fontWeight: '800' },
  progressTrack: { height: 7, backgroundColor: '#E7E3F5', borderRadius: 999, overflow: 'hidden', marginTop: 14 },
  progressFill: { height: '100%', backgroundColor: '#12B3A8' },
  questionCard: { backgroundColor: '#1D1A34', borderRadius: 22, padding: 22, marginTop: 20 },
  questionText: { color: '#FFFFFF', fontSize: 21, lineHeight: 29, fontWeight: '800' },
  options: { gap: 9, marginTop: 14 },
  option: { backgroundColor: '#FFFFFF', borderRadius: 15, padding: 15, borderWidth: 1, borderColor: '#E7E3F5' },
  correct: { backgroundColor: '#DFF6F4', borderColor: '#12B3A8' },
  wrong: { backgroundColor: '#FFE3E9', borderColor: '#FF5C7C' },
  optionText: { color: '#1D1A34', fontSize: 14, fontWeight: '700' },
  feedbackCard: { backgroundColor: '#FFFFFF', borderRadius: 18, padding: 16, borderWidth: 1, borderColor: '#E7E3F5', marginTop: 16 },
  feedbackTitle: { color: '#1D1A34', fontSize: 15, fontWeight: '800' },
  retryText: { color: '#FF5C7C', fontSize: 11, fontWeight: '700', marginTop: 9, lineHeight: 16 },
  primaryButton: { backgroundColor: '#1D1A34', borderRadius: 13, padding: 13, alignItems: 'center', marginTop: 14 },
  primaryButtonText: { color: '#FFFFFF', fontWeight: '800', fontSize: 13 },
  finishCard: { backgroundColor: '#FFFFFF', borderRadius: 24, padding: 24, alignItems: 'center', borderWidth: 1, borderColor: '#E7E3F5', marginTop: 40 },
  doneCard: { backgroundColor: '#FFFFFF', borderRadius: 24, padding: 24, alignItems: 'center', borderWidth: 1, borderColor: '#E7E3F5', marginTop: 22 },
  finishTitle: { color: '#1D1A34', fontSize: 22, fontWeight: '900', textAlign: 'center', marginTop: 10 },
  finishScore: { color: '#12B3A8', fontSize: 28, fontWeight: '900', marginTop: 8 },
  muted: { color: '#6B6684', fontSize: 13, lineHeight: 19, marginTop: 8 },
  coachCard: { backgroundColor: '#FFF5D8', borderRadius: 20, padding: 18, marginTop: 14, borderWidth: 1, borderColor: '#F4D782' },
  coachEyebrow: { color: '#A66B00', fontSize: 10, fontWeight: '900', letterSpacing: 1 },
  coachTitle: { color: '#1D1A34', fontSize: 17, fontWeight: '900', marginTop: 5 },
});
