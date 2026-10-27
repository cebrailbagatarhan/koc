import { Stack, router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { QuestionVisual } from '@/components/question-visual';
import { getAdaptiveQuestionSession } from '@/storage/adaptiveQuestionStore';
import { completeDailyPlanTopic } from '@/storage/coachStore';
import { getQuestionsFromDatabase, type BankQuestion } from '@/storage/questionBankStore';
import { recordQuizOutcome } from '@/storage/reviewStore';

function shuffled<T>(items: T[]) {
  return [...items].sort(() => Math.random() - 0.5);
}

function difficultyLabel(difficulty: BankQuestion['difficulty']) {
  if (difficulty === 'easy') return 'TEMEL';
  if (difficulty === 'hard') return 'İLERİ';
  return 'ORTA';
}

export default function QuizScreen() {
  const { levelName, courseName, topicName } = useLocalSearchParams<{
    levelName: string;
    courseName: string;
    topicName?: string;
  }>();
  const [availableQuestions, setAvailableQuestions] = useState<BankQuestion[]>([]);
  const [questionSet, setQuestionSet] = useState<BankQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [finished, setFinished] = useState(false);
  const [wrongQuestionIds, setWrongQuestionIds] = useState<string[]>([]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setIndex(0);
    setScore(0);
    setSelected(null);
    setFinished(false);
    setWrongQuestionIds([]);

    Promise.all([
      getQuestionsFromDatabase(levelName, courseName, topicName),
      getAdaptiveQuestionSession(levelName, courseName, topicName, 10),
    ])
      .then(([questions, adaptiveQuestions]) => {
        if (active) {
          setAvailableQuestions(questions);
          setQuestionSet(adaptiveQuestions);
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [courseName, levelName, topicName]);

  const question = questionSet[index];
  const screenLabel = topicName ? `${courseName ?? 'Ders'} · ${topicName}` : `${courseName ?? 'Ders'} · Quiz`;

  const handleAnswer = async (answer: string) => {
    if (!question || selected || !levelName || !courseName) return;
    const correct = answer === question.correctAnswer;
    setSelected(answer);
    if (correct) {
      setScore((value) => value + 1);
    } else {
      setWrongQuestionIds((ids) => (ids.includes(question.id) ? ids : [...ids, question.id]));
    }
    await recordQuizOutcome({
      levelName,
      courseName,
      questionId: question.id,
      correct,
      selectedAnswer: answer,
    });
  };

  const startSession = (questions: BankQuestion[]) => {
    const nextSet = shuffled(questions).slice(0, 10);
    setQuestionSet(nextSet);
    setIndex(0);
    setScore(0);
    setSelected(null);
    setFinished(false);
    setWrongQuestionIds([]);
  };

  const handleRetryWrong = () => {
    const wrongIds = new Set(wrongQuestionIds);
    const wrongQuestions = questionSet.filter((item) => wrongIds.has(item.id));
    if (wrongQuestions.length) startSession(wrongQuestions);
  };

  const handleNewQuiz = () => {
    if (availableQuestions.length) startSession(availableQuestions);
  };

  const handleNext = async () => {
    if (index >= questionSet.length - 1) {
      if (topicName && levelName && courseName) {
        await completeDailyPlanTopic(levelName, courseName, topicName);
      }
      setFinished(true);
      return;
    }
    setIndex((value) => value + 1);
    setSelected(null);
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <Stack.Screen options={{ title: screenLabel }} />
        <Text style={styles.emptyIcon}>🗃️</Text>
        <Text style={styles.emptyTitle}>Soru bankası hazırlanıyor...</Text>
        <Text style={styles.emptyText}>APK içindeki doğrulanmış içerik yerel veritabanına yükleniyor.</Text>
      </View>
    );
  }

  if (!questionSet.length) {
    return (
      <View style={styles.centerContainer}>
        <Stack.Screen options={{ title: screenLabel }} />
        <Text style={styles.emptyIcon}>🧩</Text>
        <Text style={styles.emptyTitle}>
          {topicName ? 'Bu konu için doğrulanmış soru henüz yok.' : 'Bu ders için doğrulanmış soru henüz yok.'}
        </Text>
        <Text style={styles.emptyText}>
          Koç eksik içeriği yapay olarak doldurmaz. Yeni doğrulanmış içerik paketi geldiğinde SQLite bankasına eklenir.
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
        <View style={styles.resultActions}>
          {wrongQuestionIds.length ? (
            <TouchableOpacity style={styles.retryButton} onPress={handleRetryWrong}>
              <Text style={styles.retryButtonText}>Yanlışları hemen tekrar et ({wrongQuestionIds.length})</Text>
            </TouchableOpacity>
          ) : null}
          <TouchableOpacity style={styles.nextButton} onPress={handleNewQuiz}>
            <Text style={styles.nextButtonText}>Yeni quiz çöz</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryButton} onPress={() => router.back()}>
            <Text style={styles.secondaryButtonText}>Derse dön</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (!question) return null;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Stack.Screen options={{ title: screenLabel }} />

      {topicName ? (
        <View style={styles.topicHeader}>
          <Text style={styles.topicHeaderLabel}>DOĞRULANMIŞ KONU QUIZİ</Text>
          <Text style={styles.topicHeaderTitle}>{topicName}</Text>
        </View>
      ) : null}

      <View style={styles.topRow}>
        <Text style={styles.counter}>Soru {index + 1}/{questionSet.length}</Text>
        <View style={styles.metaRow}>
          <Text style={styles.difficultyBadge}>{difficultyLabel(question.difficulty)}</Text>
          <Text style={styles.score}>Doğru: {score}</Text>
        </View>
      </View>
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${((index + 1) / questionSet.length) * 100}%` }]} />
      </View>

      <View style={styles.questionCard}>
        <Text style={styles.bankBadge}>✓ YEREL SORU BANKASI · {question.questionKind.toLocaleUpperCase('tr-TR')}</Text>
        <Text style={styles.questionText}>{question.question}</Text>
        <QuestionVisual
          visual={question.visual}
          hiddenAnswer={selected ? undefined : question.correctAnswer}
        />
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
            <Text style={styles.reviewHint}>Bu soru tekrar kuyruğuna eklendi.</Text>
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
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  difficultyBadge: { color: '#6552D9', backgroundColor: '#EDE9FF', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999, fontSize: 9, fontWeight: '900' },
  counter: { color: '#1D1A34', fontWeight: '800', fontSize: 13 },
  score: { color: '#12B3A8', fontWeight: '800', fontSize: 13 },
  progressTrack: { height: 7, borderRadius: 999, backgroundColor: '#E7E3F5', marginTop: 10, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#FF5C7C' },
  questionCard: { backgroundColor: '#1D1A34', borderRadius: 22, padding: 22, marginTop: 20 },
  bankBadge: { color: '#64D8CF', fontSize: 9, fontWeight: '900', letterSpacing: 0.8, marginBottom: 8 },
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
  resultActions: { width: '100%', gap: 9, marginTop: 20 },
  retryButton: { backgroundColor: '#12B3A8', borderRadius: 12, padding: 13, alignItems: 'center' },
  retryButtonText: { color: '#FFFFFF', fontWeight: '800', fontSize: 13 },
  secondaryButton: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 12, alignItems: 'center', borderWidth: 1, borderColor: '#E7E3F5' },
  secondaryButtonText: { color: '#1D1A34', fontWeight: '800', fontSize: 13 },
});
