import { useFocusEffect } from '@react-navigation/native';
import { router } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { getProgress, getSources, type CourseProgress, type LocalSource } from '@/storage/learningStore';
import { getReviewDashboard, type ReviewDashboard } from '@/storage/reviewStore';

const initialReview: ReviewDashboard = { dueCount: 0, trackedCount: 0, nextDueAt: null, weakCourses: [] };

export default function ProgressScreen() {
  const [progress, setProgress] = useState<CourseProgress[]>([]);
  const [sources, setSources] = useState<LocalSource[]>([]);
  const [review, setReview] = useState<ReviewDashboard>(initialReview);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      Promise.all([getProgress(), getSources(), getReviewDashboard()]).then(
        ([nextProgress, nextSources, nextReview]) => {
          if (!active) return;
          setProgress(nextProgress);
          setSources(nextSources);
          setReview(nextReview);
        },
      );
      return () => {
        active = false;
      };
    }, []),
  );

  const totals = useMemo(() => {
    const answered = progress.reduce((sum, item) => sum + item.questionsAnswered, 0);
    const correct = progress.reduce((sum, item) => sum + item.correctAnswers, 0);
    const sessions = progress.reduce((sum, item) => sum + item.sessions, 0);
    return { answered, correct, sessions, accuracy: answered ? Math.round((correct / answered) * 100) : 0 };
  }, [progress]);

  const weakest = review.weakCourses[0];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>İlerleme</Text>
      <Text style={styles.subtitle}>Tüm veriler bu cihazda tutulur ve koç önerileri yerel geçmişinden çıkarılır.</Text>

      <View style={styles.summaryRow}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryValue}>{totals.accuracy}%</Text>
          <Text style={styles.summaryLabel}>quiz doğruluğu</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryValue}>{totals.answered}</Text>
          <Text style={styles.summaryLabel}>soru</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryValue}>{review.dueCount}</Text>
          <Text style={styles.summaryLabel}>bekleyen tekrar</Text>
        </View>
      </View>

      <View style={styles.reviewCard}>
        <View style={styles.reviewHeader}>
          <View>
            <Text style={styles.reviewEyebrow}>ARALIKLI TEKRAR</Text>
            <Text style={styles.reviewTitle}>
              {review.dueCount > 0 ? `${review.dueCount} soru bugün tekrar edilmeli` : 'Bugünkü tekrarlar tamam'}
            </Text>
          </View>
          <Text style={styles.reviewBadge}>{review.trackedCount}</Text>
        </View>
        <Text style={styles.reviewText}>
          Yanlış sorular otomatik kaydedilir. Doğru tekrarlarla 1, 3, 7 ve daha uzun gün aralıklarına yayılır.
        </Text>
        <TouchableOpacity style={styles.reviewButton} onPress={() => router.push('/review')}>
          <Text style={styles.reviewButtonText}>{review.dueCount > 0 ? 'Tekrarları çöz' : 'Tekrar planını aç'}</Text>
        </TouchableOpacity>
      </View>

      {weakest ? (
        <View style={styles.coachCard}>
          <Text style={styles.coachEyebrow}>KOÇ ANALİZİ</Text>
          <Text style={styles.coachTitle}>{weakest.courseName} şu anda öncelikli</Text>
          <Text style={styles.coachText}>
            {weakest.questionsAnswered} soruda %{weakest.accuracy} doğruluk
            {weakest.trackedQuestions ? ` · ${weakest.trackedQuestions} soru tekrar planında` : ''}.
          </Text>
          <TouchableOpacity
            style={styles.coachButton}
            onPress={() => router.push(`/quiz/${weakest.levelName}/${weakest.courseName}`)}>
            <Text style={styles.coachButtonText}>Bu dersten quiz çöz</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      <Text style={styles.sectionTitle}>Ders bazında</Text>
      {progress.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>Henüz kayıtlı ilerleme yok</Text>
          <Text style={styles.emptyText}>Bir derse girip konu çalıştığında veya quiz çözdüğünde burada görünür.</Text>
        </View>
      ) : (
        progress
          .slice()
          .sort((a, b) => (b.lastStudiedAt ?? '').localeCompare(a.lastStudiedAt ?? ''))
          .map((item) => {
            const accuracy = item.questionsAnswered
              ? Math.round((item.correctAnswers / item.questionsAnswered) * 100)
              : 0;
            const sourceCount = sources.filter(
              (source) => source.levelName === item.levelName && source.courseName === item.courseName,
            ).length;
            const reviewCourse = review.weakCourses.find(
              (course) => course.levelName === item.levelName && course.courseName === item.courseName,
            );
            return (
              <View key={`${item.levelName}-${item.courseName}`} style={styles.courseCard}>
                <View style={styles.courseHeader}>
                  <View>
                    <Text style={styles.courseName}>{item.courseName}</Text>
                    <Text style={styles.courseLevel}>{item.levelName}</Text>
                  </View>
                  <Text style={styles.accuracy}>{item.questionsAnswered ? `${accuracy}%` : '—'}</Text>
                </View>
                <Text style={styles.courseMeta}>
                  {item.sessions} çalışma · {item.questionsAnswered} soru · {sourceCount} kaynak
                  {reviewCourse?.dueCount ? ` · ${reviewCourse.dueCount} tekrar` : ''}
                </Text>
              </View>
            );
          })
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F3FB' },
  content: { padding: 18, paddingBottom: 36 },
  title: { color: '#1D1A34', fontSize: 30, fontWeight: '800', marginTop: 8 },
  subtitle: { color: '#6B6684', fontSize: 13, lineHeight: 19, marginTop: 4, marginBottom: 18 },
  summaryRow: { flexDirection: 'row', gap: 8, marginBottom: 14 },
  summaryCard: { flex: 1, backgroundColor: '#FFFFFF', padding: 14, borderRadius: 16, borderWidth: 1, borderColor: '#E7E3F5' },
  summaryValue: { color: '#12B3A8', fontSize: 22, fontWeight: '800' },
  summaryLabel: { color: '#6B6684', fontSize: 10, marginTop: 3 },
  reviewCard: { backgroundColor: '#1D1A34', borderRadius: 20, padding: 17, marginBottom: 12 },
  reviewHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 },
  reviewEyebrow: { color: '#CBB5E8', fontSize: 9, fontWeight: '900', letterSpacing: 1 },
  reviewTitle: { color: '#FFFFFF', fontSize: 17, fontWeight: '900', marginTop: 4 },
  reviewBadge: { color: '#1D1A34', backgroundColor: '#FFC145', minWidth: 34, textAlign: 'center', paddingHorizontal: 9, paddingVertical: 7, borderRadius: 999, fontWeight: '900' },
  reviewText: { color: '#D9D5E8', fontSize: 12, lineHeight: 18, marginTop: 8 },
  reviewButton: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 11, alignItems: 'center', marginTop: 13 },
  reviewButtonText: { color: '#1D1A34', fontSize: 12, fontWeight: '900' },
  coachCard: { backgroundColor: '#FFF5D8', borderRadius: 18, padding: 16, borderWidth: 1, borderColor: '#F4D782', marginBottom: 22 },
  coachEyebrow: { color: '#A66B00', fontSize: 9, fontWeight: '900', letterSpacing: 1 },
  coachTitle: { color: '#1D1A34', fontSize: 16, fontWeight: '900', marginTop: 4 },
  coachText: { color: '#6B6684', fontSize: 12, lineHeight: 18, marginTop: 5 },
  coachButton: { alignSelf: 'flex-start', backgroundColor: '#1D1A34', borderRadius: 11, paddingHorizontal: 13, paddingVertical: 9, marginTop: 11 },
  coachButtonText: { color: '#FFFFFF', fontSize: 11, fontWeight: '900' },
  sectionTitle: { color: '#1D1A34', fontSize: 18, fontWeight: '800', marginBottom: 10 },
  emptyCard: { backgroundColor: '#FFFFFF', borderRadius: 18, padding: 18, borderWidth: 1, borderColor: '#E7E3F5' },
  emptyTitle: { color: '#1D1A34', fontWeight: '700' },
  emptyText: { color: '#6B6684', fontSize: 13, lineHeight: 19, marginTop: 6 },
  courseCard: { backgroundColor: '#FFFFFF', borderRadius: 18, padding: 16, borderWidth: 1, borderColor: '#E7E3F5', marginBottom: 10 },
  courseHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  courseName: { color: '#1D1A34', fontSize: 16, fontWeight: '800' },
  courseLevel: { color: '#6B6684', fontSize: 11, marginTop: 2 },
  accuracy: { color: '#FF5C7C', fontSize: 18, fontWeight: '800' },
  courseMeta: { color: '#6B6684', fontSize: 12, marginTop: 12 },
});
