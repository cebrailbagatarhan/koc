import { useFocusEffect } from '@react-navigation/native';
import { router } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { LEVELS } from '@/data/courseCatalog';
import { getActivityStats, type ActivityStats } from '@/storage/learningStore';

const initialStats: ActivityStats = { streakDays: 0, lastStudyDate: null, totalStudyActions: 0 };

export default function HomeScreen() {
  const [stats, setStats] = useState<ActivityStats>(initialStats);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      getActivityStats().then((value) => active && setStats(value));
      return () => {
        active = false;
      };
    }, []),
  );

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
  hero: { backgroundColor: '#1D1A34', borderRadius: 24, padding: 22, marginBottom: 24 },
  eyebrow: { color: '#FFC145', fontSize: 11, fontWeight: '800', letterSpacing: 1.2 },
  title: { color: '#FFFFFF', fontSize: 30, lineHeight: 36, fontWeight: '800', marginTop: 8 },
  subtitle: { color: '#D9D5E8', fontSize: 14, lineHeight: 21, marginTop: 10 },
  statsRow: { flexDirection: 'row', gap: 10, marginTop: 18 },
  statCard: { flex: 1, backgroundColor: '#2A2647', borderRadius: 16, padding: 14 },
  statValue: { color: '#FFFFFF', fontSize: 18, fontWeight: '800' },
  statLabel: { color: '#BEB8D6', fontSize: 11, marginTop: 2 },
  sectionTitle: { color: '#1D1A34', fontSize: 18, fontWeight: '800', marginBottom: 12 },
  levelGrid: { gap: 12 },
  levelCard: { backgroundColor: '#FFFFFF', borderRadius: 20, padding: 18, borderWidth: 1, borderColor: '#E7E3F5' },
  levelIcon: { fontSize: 30 },
  levelName: { color: '#1D1A34', fontSize: 20, fontWeight: '800', marginTop: 8 },
  levelDescription: { color: '#6B6684', fontSize: 13, lineHeight: 19, marginTop: 4 },
  courseCount: { color: '#FF5C7C', fontSize: 12, fontWeight: '700', marginTop: 12 },
});
