import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { getProgress, getSources, type CourseProgress, type LocalSource } from '@/storage/learningStore';

export default function ProgressScreen() {
  const [progress, setProgress] = useState<CourseProgress[]>([]);
  const [sources, setSources] = useState<LocalSource[]>([]);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      Promise.all([getProgress(), getSources()]).then(([nextProgress, nextSources]) => {
        if (!active) return;
        setProgress(nextProgress);
        setSources(nextSources);
      });
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

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>İlerleme</Text>
      <Text style={styles.subtitle}>Tüm veriler bu cihazda tutulur.</Text>

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
          <Text style={styles.summaryValue}>{sources.length}</Text>
          <Text style={styles.summaryLabel}>kaynak</Text>
        </View>
      </View>

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
  subtitle: { color: '#6B6684', fontSize: 13, marginTop: 4, marginBottom: 18 },
  summaryRow: { flexDirection: 'row', gap: 8, marginBottom: 24 },
  summaryCard: { flex: 1, backgroundColor: '#FFFFFF', padding: 14, borderRadius: 16, borderWidth: 1, borderColor: '#E7E3F5' },
  summaryValue: { color: '#12B3A8', fontSize: 22, fontWeight: '800' },
  summaryLabel: { color: '#6B6684', fontSize: 10, marginTop: 3 },
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
