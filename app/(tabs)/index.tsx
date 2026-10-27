import { useFocusEffect } from '@react-navigation/native';
import { router } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { LEVELS } from '@/data/courseCatalog';
import { getLastTopicVisit, type DailyPlan, type LastTopicVisit } from '@/storage/coachStore';
import { getActiveGoal, getDaysRemaining, type StudyGoal } from '@/storage/goalStore';
import { getGoalAwareDailyPlan } from '@/storage/goalPlanner';
import { getActivityStats, type ActivityStats } from '@/storage/learningStore';
import { getReviewDashboard, type ReviewDashboard } from '@/storage/reviewStore';
import { ensureActiveLearner, type LearnerProfile } from '@/storage/userStore';

const initialStats: ActivityStats = { streakDays: 0, lastStudyDate: null, totalStudyActions: 0 };
const initialReview: ReviewDashboard = { dueCount: 0, trackedCount: 0, nextDueAt: null, weakCourses: [] };
const initialPlan: DailyPlan = { date: '', tasks: [], completedCount: 0, totalMinutes: 0 };

export default function HomeScreen() {
  const [stats, setStats] = useState<ActivityStats>(initialStats);
  const [review, setReview] = useState<ReviewDashboard>(initialReview);
  const [plan, setPlan] = useState<DailyPlan>(initialPlan);
  const [lastTopic, setLastTopic] = useState<LastTopicVisit | null>(null);
  const [goal, setGoal] = useState<StudyGoal | null>(null);
  const [learner, setLearner] = useState<LearnerProfile | null>(null);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      Promise.all([
        getActivityStats(),
        getReviewDashboard(),
        getGoalAwareDailyPlan(),
        getLastTopicVisit(),
        getActiveGoal(),
        ensureActiveLearner(),
      ]).then(([nextStats, nextReview, nextPlan, nextLastTopic, nextGoal, nextLearner]) => {
        if (!active) return;
        setStats(nextStats);
        setReview(nextReview);
        setPlan(nextPlan);
        setLastTopic(nextLastTopic);
        setGoal(nextGoal);
        setLearner(nextLearner);
      });
      return () => {
        active = false;
      };
    }, []),
  );

  const weakest = review.weakCourses[0];
  const goalDays = goal ? getDaysRemaining(goal.targetDate) : null;
  const planPercent = plan.tasks.length
    ? Math.round((plan.completedCount / plan.tasks.length) * 100)
    : 0;
  const preferredLevel = learner?.levelName
    ? LEVELS.find((level) => level.name === learner.levelName)
    : null;
  const levels = preferredLevel
    ? [preferredLevel, ...LEVELS.filter((level) => level.name !== preferredLevel.name)]
    : LEVELS;

  const primaryAction = review.dueCount > 0
    ? {
        label: 'Tekrar zamanı',
        title: `${review.dueCount} soruyu güçlendir`,
        detail: 'Önce bekleyen yanlışları temizle. Kısa ve odaklı bir oturum.',
        action: () => router.push('/review'),
      }
    : lastTopic
      ? {
          label: 'Kaldığın yer',
          title: lastTopic.topicName,
          detail: `${lastTopic.courseName} · ${lastTopic.levelName}`,
          action: () => router.push(`/topic/${lastTopic.levelName}/${lastTopic.courseName}/${lastTopic.topicName}`),
        }
      : {
          label: 'Başlangıç',
          title: 'İlk çalışma oturumunu başlat',
          detail: 'Bir seviye ve ders seç; Koç sonraki oturumları performansına göre düzenlesin.',
          action: () => router.push(preferredLevel ? `/level/${preferredLevel.name}` : '/level/Ortaokul'),
        };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.topRow}>
        <View>
          <Text style={styles.welcome}>Merhaba, {learner?.displayName || 'Öğrenci'}</Text>
          <Text style={styles.dateLine}>Bugün · kişisel çalışma panelin</Text>
        </View>
        <TouchableOpacity style={styles.avatar} onPress={() => router.push('/profile')}>
          <Text style={styles.avatarText}>
            {(learner?.displayName || 'Ö').trim().slice(0, 1).toLocaleUpperCase('tr-TR')}
          </Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity activeOpacity={0.9} style={styles.primaryCard} onPress={primaryAction.action}>
        <Text style={styles.primaryEyebrow}>{primaryAction.label.toUpperCase()}</Text>
        <Text style={styles.primaryTitle}>{primaryAction.title}</Text>
        <Text style={styles.primaryDetail}>{primaryAction.detail}</Text>
        <View style={styles.primaryFooter}>
          <Text style={styles.primaryButtonText}>Çalışmaya başla</Text>
          <Text style={styles.primaryArrow}>→</Text>
        </View>
      </TouchableOpacity>

      <View style={styles.metricRow}>
        <View style={styles.metricCard}>
          <Text style={styles.metricValue}>{stats.streakDays}</Text>
          <Text style={styles.metricLabel}>gün seri</Text>
        </View>
        <View style={styles.metricCard}>
          <Text style={styles.metricValue}>{review.dueCount}</Text>
          <Text style={styles.metricLabel}>bekleyen tekrar</Text>
        </View>
        <View style={styles.metricCard}>
          <Text style={styles.metricValue}>{planPercent}%</Text>
          <Text style={styles.metricLabel}>bugünkü plan</Text>
        </View>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Bugünün rotası</Text>
        <TouchableOpacity onPress={() => router.push('/plan')}>
          <Text style={styles.sectionLink}>Planı aç</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.routeCard} onPress={() => router.push('/plan')}>
        <View style={styles.routeTop}>
          <View>
            <Text style={styles.routeTitle}>
              {plan.tasks.length ? `${plan.completedCount}/${plan.tasks.length} görev tamamlandı` : 'Planın öğrenme verisiyle oluşacak'}
            </Text>
            <Text style={styles.routeMeta}>
              {plan.tasks.length
                ? `Yaklaşık ${plan.totalMinutes} dk · günlük hedef ${learner?.dailyMinutes ?? 25} dk`
                : 'İlk quiz ve konu çalışmasından sonra kişiselleşir.'}
            </Text>
          </View>
          <Text style={styles.routePercent}>{planPercent}%</Text>
        </View>
        <View style={styles.track}>
          <View style={[styles.fill, { width: `${planPercent}%` }]} />
        </View>
      </TouchableOpacity>

      <View style={styles.quickGrid}>
        <TouchableOpacity style={styles.quickCard} onPress={() => router.push('/review')}>
          <Text style={styles.quickIcon}>↻</Text>
          <Text style={styles.quickTitle}>Tekrar</Text>
          <Text style={styles.quickText}>{review.dueCount ? `${review.dueCount} soru hazır` : 'Kuyruk temiz'}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.quickCard} onPress={() => router.push('/mastery')}>
          <Text style={styles.quickIcon}>◎</Text>
          <Text style={styles.quickTitle}>Ustalık</Text>
          <Text style={styles.quickText}>{weakest ? `${weakest.courseName} %${weakest.accuracy}` : 'Konu haritanı aç'}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.quickCard} onPress={() => router.push('/goals')}>
          <Text style={styles.quickIcon}>⌁</Text>
          <Text style={styles.quickTitle}>Hedef</Text>
          <Text style={styles.quickText}>{goal ? `${goalDays} gün kaldı` : 'Hedef belirle'}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{preferredLevel ? 'Senin seviyen' : 'Seviye seç'}</Text>
        <TouchableOpacity onPress={() => router.push('/profile')}>
          <Text style={styles.sectionLink}>Profili düzenle</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.levelList}>
        {levels.map((level, index) => (
          <TouchableOpacity
            key={level.name}
            style={[styles.levelCard, index === 0 && preferredLevel ? styles.levelCardPrimary : null]}
            onPress={() => router.push(`/level/${level.name}`)}>
            <View style={styles.levelIconWrap}>
              <Text style={styles.levelIcon}>{level.icon}</Text>
            </View>
            <View style={styles.levelBody}>
              <Text style={styles.levelName}>{level.name}</Text>
              <Text style={styles.levelDescription}>{level.description}</Text>
            </View>
            <Text style={styles.levelArrow}>→</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.footerNote}>
        Sorular artık rastgele seçilmiyor; görülmemiş ve zorlandığın sorular oturumlarda daha yüksek öncelik alıyor.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F1F2F6' },
  content: { padding: 18, paddingBottom: 42 },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18, marginTop: 4 },
  welcome: { color: '#111827', fontSize: 24, fontWeight: '900' },
  dateLine: { color: '#7A8494', fontSize: 11, fontWeight: '700', marginTop: 3 },
  avatar: { width: 44, height: 44, borderRadius: 16, backgroundColor: '#111827', alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#FFFFFF', fontSize: 17, fontWeight: '900' },
  primaryCard: { backgroundColor: '#111827', borderRadius: 28, padding: 22, marginBottom: 12 },
  primaryEyebrow: { color: '#A7F3D0', fontSize: 10, fontWeight: '900', letterSpacing: 1.2 },
  primaryTitle: { color: '#FFFFFF', fontSize: 27, lineHeight: 33, fontWeight: '900', marginTop: 8 },
  primaryDetail: { color: '#BFC7D4', fontSize: 13, lineHeight: 20, marginTop: 8 },
  primaryFooter: { marginTop: 20, backgroundColor: '#FFFFFF', borderRadius: 14, paddingHorizontal: 15, paddingVertical: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  primaryButtonText: { color: '#111827', fontSize: 13, fontWeight: '900' },
  primaryArrow: { color: '#111827', fontSize: 19, fontWeight: '900' },
  metricRow: { flexDirection: 'row', gap: 8, marginBottom: 22 },
  metricCard: { flex: 1, backgroundColor: '#FFFFFF', borderRadius: 16, padding: 13, borderWidth: 1, borderColor: '#E2E5EC' },
  metricValue: { color: '#111827', fontSize: 20, fontWeight: '900' },
  metricLabel: { color: '#7A8494', fontSize: 9, fontWeight: '800', marginTop: 3 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  sectionTitle: { color: '#111827', fontSize: 17, fontWeight: '900' },
  sectionLink: { color: '#2563EB', fontSize: 11, fontWeight: '900' },
  routeCard: { backgroundColor: '#FFFFFF', borderRadius: 20, padding: 16, borderWidth: 1, borderColor: '#E2E5EC', marginBottom: 10 },
  routeTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 },
  routeTitle: { color: '#111827', fontSize: 14, fontWeight: '900' },
  routeMeta: { color: '#7A8494', fontSize: 10, lineHeight: 15, marginTop: 4 },
  routePercent: { color: '#2563EB', fontSize: 14, fontWeight: '900' },
  track: { height: 6, backgroundColor: '#E8ECF2', borderRadius: 999, overflow: 'hidden', marginTop: 13 },
  fill: { height: '100%', backgroundColor: '#2563EB' },
  quickGrid: { flexDirection: 'row', gap: 8, marginBottom: 24 },
  quickCard: { flex: 1, minHeight: 104, backgroundColor: '#FFFFFF', borderRadius: 18, padding: 13, borderWidth: 1, borderColor: '#E2E5EC' },
  quickIcon: { color: '#2563EB', fontSize: 21, fontWeight: '900' },
  quickTitle: { color: '#111827', fontSize: 13, fontWeight: '900', marginTop: 9 },
  quickText: { color: '#7A8494', fontSize: 9, lineHeight: 13, marginTop: 3 },
  levelList: { gap: 9 },
  levelCard: { backgroundColor: '#FFFFFF', borderRadius: 18, padding: 13, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#E2E5EC' },
  levelCardPrimary: { borderColor: '#93C5FD', backgroundColor: '#EFF6FF' },
  levelIconWrap: { width: 42, height: 42, borderRadius: 13, backgroundColor: '#F5F6F8', alignItems: 'center', justifyContent: 'center' },
  levelIcon: { fontSize: 21 },
  levelBody: { flex: 1, marginLeft: 11 },
  levelName: { color: '#111827', fontSize: 14, fontWeight: '900' },
  levelDescription: { color: '#7A8494', fontSize: 9, marginTop: 3 },
  levelArrow: { color: '#111827', fontSize: 17, fontWeight: '900' },
  footerNote: { color: '#8A93A1', fontSize: 10, lineHeight: 15, textAlign: 'center', marginTop: 18, paddingHorizontal: 12 },
});
