import { useFocusEffect } from '@react-navigation/native';
import { Stack, router } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { getDailyPlan, type DailyPlan } from '@/storage/coachStore';

const emptyPlan: DailyPlan = { date: '', tasks: [], completedCount: 0, totalMinutes: 0 };

const kindMeta = {
  review: { label: 'TEKRAR', icon: '🧠' },
  strengthen: { label: 'GÜÇLENDİR', icon: '🎯' },
  advance: { label: 'İLERLE', icon: '🚀' },
} as const;

export default function DailyPlanScreen() {
  const [plan, setPlan] = useState<DailyPlan>(emptyPlan);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      setLoading(true);
      getDailyPlan().then((nextPlan) => {
        if (!active) return;
        setPlan(nextPlan);
        setLoading(false);
      });
      return () => {
        active = false;
      };
    }, []),
  );

  const percent = plan.tasks.length
    ? Math.round((plan.completedCount / plan.tasks.length) * 100)
    : 0;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Stack.Screen options={{ title: 'Bugünün Planı' }} />

      <View style={styles.hero}>
        <Text style={styles.eyebrow}>KİŞİSEL ÇALIŞMA ROTASI</Text>
        <Text style={styles.title}>Bugünün Planı</Text>
        <Text style={styles.subtitle}>
          Plan seri sayacından ayrıdır. Önce tekrar, sonra zayıf konu, ardından yeni ilerleme dengesiyle hazırlanır.
        </Text>
        <View style={styles.progressRow}>
          <Text style={styles.progressValue}>{plan.completedCount}/{plan.tasks.length}</Text>
          <Text style={styles.progressLabel}>görev · yaklaşık {plan.totalMinutes} dk</Text>
        </View>
        <View style={styles.track}>
          <View style={[styles.fill, { width: `${percent}%` }]} />
        </View>
      </View>

      {loading ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>Plan hazırlanıyor...</Text>
        </View>
      ) : plan.tasks.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyIcon}>🌱</Text>
          <Text style={styles.emptyTitle}>Kişisel plan için biraz çalışma verisi gerekiyor</Text>
          <Text style={styles.emptyText}>
            Bir seviye ve ders seçip ilk konu quizini çöz. Koç bundan sonra günlük rotanı otomatik oluşturmaya başlayacak.
          </Text>
          <TouchableOpacity style={styles.primaryButton} onPress={() => router.replace('/')}>
            <Text style={styles.primaryButtonText}>Ders seç</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.taskList}>
          {plan.tasks.map((task, index) => {
            const meta = kindMeta[task.kind];
            const completed = Boolean(task.completedAt);
            return (
              <TouchableOpacity
                key={task.id}
                activeOpacity={0.86}
                style={[styles.taskCard, completed && styles.taskCardDone]}
                onPress={() => router.push(task.route as never)}>
                <View style={[styles.taskNumber, completed && styles.taskNumberDone]}>
                  <Text style={styles.taskNumberText}>{completed ? '✓' : index + 1}</Text>
                </View>
                <View style={styles.taskBody}>
                  <Text style={styles.taskEyebrow}>{meta.icon} {meta.label} · {task.estimatedMinutes} DK</Text>
                  <Text style={[styles.taskTitle, completed && styles.taskTitleDone]}>{task.title}</Text>
                  <Text style={styles.taskText}>{task.description}</Text>
                </View>
                <Text style={styles.arrow}>{completed ? '✓' : '›'}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      <TouchableOpacity style={styles.masteryLink} onPress={() => router.push('/mastery')}>
        <View>
          <Text style={styles.masteryEyebrow}>KONU USTALIĞI</Text>
          <Text style={styles.masteryTitle}>Nerede güçlü, nerede zayıf olduğunu gör</Text>
        </View>
        <Text style={styles.masteryArrow}>→</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F3FB' },
  content: { padding: 18, paddingBottom: 40 },
  hero: { backgroundColor: '#1D1A34', borderRadius: 24, padding: 21, marginBottom: 14 },
  eyebrow: { color: '#FFC145', fontSize: 10, fontWeight: '900', letterSpacing: 1 },
  title: { color: '#FFFFFF', fontSize: 29, fontWeight: '900', marginTop: 6 },
  subtitle: { color: '#D9D5E8', fontSize: 12, lineHeight: 18, marginTop: 8 },
  progressRow: { flexDirection: 'row', alignItems: 'baseline', gap: 8, marginTop: 18 },
  progressValue: { color: '#FFFFFF', fontSize: 23, fontWeight: '900' },
  progressLabel: { color: '#BEB8D6', fontSize: 11 },
  track: { height: 7, borderRadius: 999, backgroundColor: '#393454', overflow: 'hidden', marginTop: 9 },
  fill: { height: '100%', backgroundColor: '#12B3A8' },
  taskList: { gap: 10 },
  taskCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 19, padding: 15, borderWidth: 1, borderColor: '#E7E3F5' },
  taskCardDone: { backgroundColor: '#F1FBF8', borderColor: '#BFE8DE' },
  taskNumber: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#1D1A34', alignItems: 'center', justifyContent: 'center' },
  taskNumberDone: { backgroundColor: '#12B3A8' },
  taskNumberText: { color: '#FFFFFF', fontWeight: '900', fontSize: 13 },
  taskBody: { flex: 1, marginLeft: 12 },
  taskEyebrow: { color: '#6552D9', fontSize: 9, fontWeight: '900', letterSpacing: 0.7 },
  taskTitle: { color: '#1D1A34', fontSize: 15, fontWeight: '900', marginTop: 3 },
  taskTitleDone: { textDecorationLine: 'line-through', color: '#6B6684' },
  taskText: { color: '#6B6684', fontSize: 11, lineHeight: 16, marginTop: 4 },
  arrow: { color: '#9A95AD', fontSize: 24, marginLeft: 8 },
  emptyCard: { backgroundColor: '#FFFFFF', borderRadius: 20, padding: 20, borderWidth: 1, borderColor: '#E7E3F5', alignItems: 'center' },
  emptyIcon: { fontSize: 42 },
  emptyTitle: { color: '#1D1A34', fontSize: 17, fontWeight: '900', textAlign: 'center', marginTop: 8 },
  emptyText: { color: '#6B6684', fontSize: 12, lineHeight: 18, textAlign: 'center', marginTop: 7 },
  primaryButton: { backgroundColor: '#1D1A34', borderRadius: 12, paddingHorizontal: 18, paddingVertical: 11, marginTop: 14 },
  primaryButtonText: { color: '#FFFFFF', fontSize: 12, fontWeight: '900' },
  masteryLink: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#EDE9FF', borderRadius: 18, padding: 16, marginTop: 18 },
  masteryEyebrow: { color: '#6552D9', fontSize: 9, fontWeight: '900', letterSpacing: 0.8 },
  masteryTitle: { color: '#1D1A34', fontSize: 13, fontWeight: '800', marginTop: 3 },
  masteryArrow: { color: '#6552D9', fontSize: 23, fontWeight: '900' },
});
