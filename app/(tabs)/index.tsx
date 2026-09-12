import { useFocusEffect } from '@react-navigation/native';
import { router } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { LEVELS } from '@/data/courseCatalog';
import { getActivityStats, type ActivityStats } from '@/storage/learningStore';
import { getReviewDashboard, type ReviewDashboard } from '@/storage/reviewStore';

const initialStats: ActivityStats = { streakDays: 0, lastStudyDate: null, totalStudyActions: 0 };
const initialReview: ReviewDashboard = { dueCount: 0, trackedCount: 0, nextDueAt: null, weakCourses: [] };

export default function HomeScreen() {
  const [stats, setStats] = useState<ActivityStats>(initialStats);
  const [review, setReview] = useState<ReviewDashboard>(initialReview);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      Promise.all([getActivityStats(), getReviewDashboard()]).then(([nextStats, nextReview]) => {
        if (!active) return;
        setStats(nextStats);
        setReview(nextReview);
      });
      return () => {
        active = false;
      };
    }, []),
  );

  const weakest = review.weakCourses[0];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.hero}>
        <Text style={styles.eyebrow}>KOÇ · ÇEVRİMDIŞI ÖĞRENME</Text>
        <Text style={styles.title}>Bugün ne çalışıyoruz?</Text>
        <Text style={styles.subtitle}>
          Dersler, testler, kaynaklar ve ilerleme cihazında çalışır. AI entegrasyonu daha sonra eklenebilir.
        </Text>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>🔥 {stats.streakDays}</Text>
            <Text style={styles.statLabel}>gün seri</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>✓ {stats.totalStudyActions}</Text>
            <Text style={styles.statLabel}>çalışma adımı</Text>
          </View>
        </View>
      </View>

      <TouchableOpacity
        activeOpacity={0.88}
        style={[styles.reviewCard, review.dueCount > 0 && styles.reviewCardDue]}
        onPress={() => router.push('/review')}>
        <View style={styles.reviewIconWrap}>
          <Text style={styles.reviewIcon}>{review.dueCount > 0 ? '🧠' : '🌿'}</Text>
        </View>
        <View style={styles.reviewTextWrap}>
          <Text style={styles.reviewEyebrow}>GÜNLÜK TEKRAR</Text>
          <Text style={styles.reviewTitle}>
            {review.dueCount > 0 ? `${review.dueCount} soru seni bekliyor` : 'Tekrar kuyruğun temiz'}
          </Text>
          <Text style={styles.reviewSubtitle}>
            {review.dueCount > 0
              ? 'Yanlışlarını kısa bir oturumla güçlendir.'
              : review.trackedCount > 0
                ? `${review.trackedCount} soru aralıklı tekrar planında.`
                : 'Yanlış yaptığın sorular burada otomatik planlanacak.'}
          </Text>
        </View>
        <Text style={styles.reviewArrow}>→</Text>
      </TouchableOpacity>

      {weakest ? (
        <View style={styles.coachHint}>
          <Text style={styles.coachHintEyebrow}>KOÇ ÖNERİSİ</Text>
          <Text style={styles.coachHintText}>
            Şimdilik en çok dikkat isteyen ders: <Text style={styles.coachHintStrong}>{weakest.courseName}</Text> · doğruluk %{weakest.accuracy}.
          </Text>
        </View>
      ) : null}

      <Text style={styles.sectionTitle}>Eğitim seviyeni seç</Text>
      <View style={styles.levelGrid}>
        {LEVELS.map((level) => (
          <TouchableOpacity
            key={level.name}
            style={styles.levelCard}
            activeOpacity={0.86}
            onPress={() => router.push(`/level/${level.name}`)}>
            <Text style={styles.levelIcon}>{level.icon}</Text>
            <Text style={styles.levelName}>{level.name}</Text>
            <Text style={styles.levelDescription}>{level.description}</Text>
            <Text style={styles.courseCount}>{level.courses.length} ders →</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F3FB' },
  content: { padding: 18, paddingBottom: 36 },
  hero: { backgroundColor: '#1D1A34', borderRadius: 24, padding: 22, marginBottom: 14 },
  eyebrow: { color: '#FFC145', fontSize: 11, fontWeight: '800', letterSpacing: 1.2 },
  title: { color: '#FFFFFF', fontSize: 30, lineHeight: 36, fontWeight: '800', marginTop: 8 },
  subtitle: { color: '#D9D5E8', fontSize: 14, lineHeight: 21, marginTop: 10 },
  statsRow: { flexDirection: 'row', gap: 10, marginTop: 18 },
  statCard: { flex: 1, backgroundColor: '#2A2647', borderRadius: 16, padding: 14 },
  statValue: { color: '#FFFFFF', fontSize: 18, fontWeight: '800' },
  statLabel: { color: '#BEB8D6', fontSize: 11, marginTop: 2 },
  reviewCard: { backgroundColor: '#FFFFFF', borderRadius: 20, padding: 16, borderWidth: 1, borderColor: '#E7E3F5', flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  reviewCardDue: { borderColor: '#D8C1F2', backgroundColor: '#FBF8FF' },
  reviewIconWrap: { width: 48, height: 48, borderRadius: 16, backgroundColor: '#EFE6FA', alignItems: 'center', justifyContent: 'center' },
  reviewIcon: { fontSize: 24 },
  reviewTextWrap: { flex: 1, marginLeft: 12 },
  reviewEyebrow: { color: '#9B5DE5', fontSize: 9, fontWeight: '900', letterSpacing: 1 },
  reviewTitle: { color: '#1D1A34', fontSize: 16, fontWeight: '900', marginTop: 2 },
  reviewSubtitle: { color: '#6B6684', fontSize: 11, lineHeight: 16, marginTop: 3 },
  reviewArrow: { color: '#9B5DE5', fontSize: 22, fontWeight: '800', marginLeft: 8 },
  coachHint: { backgroundColor: '#FFF5D8', borderRadius: 16, padding: 14, marginBottom: 20, borderWidth: 1, borderColor: '#F4D782' },
  coachHintEyebrow: { color: '#A66B00', fontSize: 9, fontWeight: '900', letterSpacing: 1 },
  coachHintText: { color: '#6B6684', fontSize: 12, lineHeight: 18, marginTop: 4 },
  coachHintStrong: { color: '#1D1A34', fontWeight: '900' },
  sectionTitle: { color: '#1D1A34', fontSize: 18, fontWeight: '800', marginBottom: 12 },
  levelGrid: { gap: 12 },
  levelCard: { backgroundColor: '#FFFFFF', borderRadius: 20, padding: 18, borderWidth: 1, borderColor: '#E7E3F5' },
  levelIcon: { fontSize: 30 },
  levelName: { color: '#1D1A34', fontSize: 20, fontWeight: '800', marginTop: 8 },
  levelDescription: { color: '#6B6684', fontSize: 13, lineHeight: 19, marginTop: 4 },
  courseCount: { color: '#FF5C7C', fontSize: 12, fontWeight: '700', marginTop: 12 },
});
