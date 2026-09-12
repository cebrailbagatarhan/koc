import { Stack, useLocalSearchParams } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { type QuizQuestion } from '@/data/offlineContent';
import { getQuizQuestionsForTopic } from '@/data/topicQuiz';
import { recordQuizOutcome } from '@/storage/reviewStore';

function shuffled<T>(items: T[]) {
  return [...items].sort(() => Math.random() - 0.5);
}

export default function QuizScreen() {
  const { levelName, courseName, topicName } = useLocalSearchParams<{
    levelName: string;
    courseName: string;
    topicName?: string;
  }>();
  const questionSet = useMemo(
    () => shuffled(getQuizQuestionsForTopic(levelName, courseName, topicName)).slice(0, 5),
    [levelName, courseName, topicName],
  );
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [finished, setFinished] = useState(false);

  const question: QuizQuestion | undefined = questionSet[index];
  const screenLabel = topicName ? `${courseName ?? 'Ders'} · ${topicName}` : `${courseName ?? 'Ders'} · Quiz`;

  const handleAnswer = async (answer: string) => {
    if (!question || selected || !levelName || !courseName) return;
    const correct = answer === question.correctAnswer;
    setSelected(answer);
    if (correct) setScore((value) => value + 1);
    await recordQuizOutcome({
      levelName,
      courseName,
      questionId: question.id,
      correct,
      selectedAnswer: answer,
    });
  };

  const handleNext = () => {
    if (index >= questionSet.length - 1) {
      setFinished(true);
      return;
    }
    setIndex((value) => value + 1);
    setSelected(null);
  };

  if (!questionSet.length) {
    return (
      <View style={styles.centerContainer}>
        <Stack.Screen options={{ title: screenLabel }} />
        <Text style={styles.emptyIcon}>🧩</Text>
        <Text style={styles.emptyTitle}>
          {topicName ? 'Bu konu için yerel soru bankası hazırlanıyor.' : 'Bu ders için yerel soru bankası hazırlanıyor.'}
        </Text>
        <Text style={styles.emptyText}>
          Eğitim akışı API’ye bağlı değil; bu konuya soru eklendiğinde doğrudan burada çalışacak.
        </Text>
      </View>
    );
  }

  if (finished) {
    const percent = Math.round((score / questionSet.length) * 100);
    return (
      <View style={styles.centerContainer}>
        <Stack.Screen options={{ title: topicName ? `${topicName} · Sonuç` : `${courseName ?? 'Ders'} · Sonuç` }} />
        {topicName ? <Text style={styles.topicBadge}>{topicName}</Text> : null}
        <Text style={styles.resultIcon}>{percent >= 70 ? '🎉' : '💪'}</Text>
        <Text style={styles.resultTitle}>{score}/{questionSet.length} doğru</Text>
        <Text style={styles.resultPercent}>%{percent}</Text>
        <Text style={styles.emptyText}>
          Sonuç ilerlemeye kaydedildi. Yanlış sorular otomatik tekrar kuyruğuna eklendi.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Stack.Screen options={{ title: screenLabel }} />

      {topicName ? (
        <View style={styles.topicHeader}>
          <Text style={styles.topicHeaderLabel}>KONU QUIZİ</Text>
          <Text style={styles.topicHeaderTitle}>{topicName}</Text>
        </View>
      ) : null}

      <View style={styles.topRow}>
        <Text style={styles.counter}>Soru {index + 1}/{questionSet.length}</Text>
        <Text style={styles.score}>Doğru: {score}</Text>
      </View>
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${((index + 1) / questionSet.length) * 100}%` }]} />
      </View>

      <View style={styles.questionCard}>
        <Text style={styles.questionText}>{question.question}</Text>
      </View>

      <View style={styles.options}>
        {question.options.map((option) => {
          const isCorrect = selected ? option === question.correctAnswer : false;
          const isWrongSelection = selected === option && option !== question.correctAnswer;
          return (
            <TouchableOpacity
              key={option}
              activeOpacity={0.85}
              disabled={!!selected}
              style={[
                styles.option,
                isCorrect && styles.optionCorrect,
                isWrongSelection && styles.optionWrong,
              ]}
              onPress={() => handleAnswer(option)}>
              <Text style={styles.optionText}>{option}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {selected ? (
        <View style={styles.feedbackCard}>
          <Text style={styles.feedbackTitle}>
            {selected === question.correctAnswer ? 'Doğru ✓' : `Doğru cevap: ${question.correctAnswer}`}
          </Text>
          <Text style={styles.feedbackText}>{question.explanation}</Text>
          {selected !== question.correctAnswer ? (
            <Text style={styles.reviewHint}>Bu soru 6 saat sonra tekrar kuyruğunda hazır olacak.</Text>
          ) : null}
          <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
            <Text style={styles.nextButtonText}>{index === questionSet.length - 1 ? 'Sonucu gör' : 'Sonraki soru'}</Text>
          </TouchableOpacity>
        </View>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F3FB' },
  content: { padding: 18, paddingBottom: 36 },
  topicHeader: { backgroundColor: '#EDE9FF', borderRadius: 15, padding: 13, marginBottom: 14 },
  topicHeaderLabel: { color: '#6552D9', fontSize: 9, fontWeight: '900', letterSpacing: 0.8 },
  topicHeaderTitle: { color: '#1D1A34', fontSize: 15, fontWeight: '800', marginTop: 3 },
  topRow: { flexDirection: 'row', justifyContent: 'space-between' },
  counter: { color: '#1D1A34', fontWeight: '800', fontSize: 13 },
  score: { color: '#12B3A8', fontWeight: '800', fontSize: 13 },
  progressTrack: { height: 7, borderRadius: 999, backgroundColor: '#E7E3F5', marginTop: 10, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#FF5C7C' },
  questionCard: { backgroundColor: '#1D1A34', borderRadius: 22, padding: 22, marginTop: 20 },
  questionText: { color: '#FFFFFF', fontSize: 21, lineHeight: 29, fontWeight: '800' },
  options: { marginTop: 14, gap: 9 },
  option: { backgroundColor: '#FFFFFF', borderRadius: 15, padding: 15, borderWidth: 1, borderColor: '#E7E3F5' },
  optionCorrect: { backgroundColor: '#DFF6F4', borderColor: '#12B3A8' },
  optionWrong: { backgroundColor: '#FFE3E9', borderColor: '#FF5C7C' },
  optionText: { color: '#1D1A34', fontSize: 14, fontWeight: '600' },
  feedbackCard: { backgroundColor: '#FFFFFF', borderRadius: 18, padding: 16, borderWidth: 1, borderColor: '#E7E3F5', marginTop: 16 },
  feedbackTitle: { color: '#1D1A34', fontSize: 15, fontWeight: '800' },
  feedbackText: { color: '#6B6684', fontSize: 12, lineHeight: 18, marginTop: 5 },
  reviewHint: { color: '#9B5DE5', fontSize: 11, lineHeight: 16, fontWeight: '700', marginTop: 8 },
  nextButton: { backgroundColor: '#1D1A34', borderRadius: 12, padding: 12, alignItems: 'center', marginTop: 13 },
  nextButtonText: { color: '#FFFFFF', fontWeight: '800', fontSize: 13 },
  centerContainer: { flex: 1, backgroundColor: '#F5F3FB', alignItems: 'center', justifyContent: 'center', padding: 28 },
  emptyIcon: { fontSize: 46 },
  emptyTitle: { color: '#1D1A34', fontSize: 20, fontWeight: '800', textAlign: 'center', marginTop: 12 },
  emptyText: { color: '#6B6684', fontSize: 13, lineHeight: 19, textAlign: 'center', marginTop: 7 },
  topicBadge: { color: '#6552D9', fontSize: 11, fontWeight: '900', backgroundColor: '#EDE9FF', paddingHorizontal: 12, paddingVertical: 7, borderRadius: 999, marginBottom: 10 },
  resultIcon: { fontSize: 58 },
  resultTitle: { color: '#1D1A34', fontSize: 28, fontWeight: '800', marginTop: 12 },
  resultPercent: { color: '#FF5C7C', fontSize: 20, fontWeight: '800', marginTop: 4 },
});
