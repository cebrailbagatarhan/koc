import { Stack, router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { getLessonSeed } from '@/data/offlineContent';
import { getSourcesForCourse, recordCourseSession, type LocalSource } from '@/storage/learningStore';

export default function LessonScreen() {
  const { levelName, courseName } = useLocalSearchParams<{ levelName: string; courseName: string }>();
  const lesson = getLessonSeed(courseName);
  const [sources, setSources] = useState<LocalSource[]>([]);

  useEffect(() => {
    if (!levelName || !courseName) return;
    recordCourseSession(levelName, courseName);
    getSourcesForCourse(levelName, courseName).then(setSources);
  }, [levelName, courseName]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Stack.Screen options={{ title: `${courseName ?? 'Ders'} · Konu` }} />

      {lesson ? (
        <View style={styles.lessonCard}>
          <Text style={styles.eyebrow}>YEREL BAŞLANGIÇ İÇERİĞİ</Text>
          <Text style={styles.title}>{lesson.title}</Text>
          <Text style={styles.summary}>{lesson.summary}</Text>
          <View style={styles.points}>
            {lesson.points.map((point, index) => (
              <View key={point} style={styles.pointRow}>
                <Text style={styles.pointIndex}>{index + 1}</Text>
                <Text style={styles.pointText}>{point}</Text>
              </View>
            ))}
          </View>
          <View style={styles.practiceBox}>
            <Text style={styles.practiceLabel}>Mini çalışma</Text>
            <Text style={styles.practiceText}>{lesson.practicePrompt}</Text>
          </View>
        </View>
      ) : (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>Bu ders için başlangıç içeriği henüz eklenmedi.</Text>
          <Text style={styles.emptyText}>Kendi kaynaklarını ekleyerek çevrimdışı çalışma alanını hemen kullanabilirsin.</Text>
        </View>
      )}

      <View style={styles.sectionHeader}>
        <View>
          <Text style={styles.sectionTitle}>Benim kaynaklarım</Text>
          <Text style={styles.sectionSubtitle}>{sources.length} kayıt</Text>
        </View>
        <TouchableOpacity style={styles.addButton} onPress={() => router.push(`/resources/${levelName}/${courseName}`)}>
          <Text style={styles.addButtonText}>+ Kaynak</Text>
        </TouchableOpacity>
      </View>

      {sources.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>Bu derse henüz kişisel kaynak eklenmedi.</Text>
        </View>
      ) : (
        sources.map((source) => (
          <View key={source.id} style={styles.sourceCard}>
            <Text style={styles.sourceTitle}>{source.title}</Text>
            <Text style={styles.sourceBody}>{source.body}</Text>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F3FB' },
  content: { padding: 18, paddingBottom: 36 },
  lessonCard: { backgroundColor: '#FFFFFF', borderRadius: 22, padding: 20, borderWidth: 1, borderColor: '#E7E3F5' },
  eyebrow: { color: '#12B3A8', fontSize: 10, fontWeight: '800', letterSpacing: 1 },
  title: { color: '#1D1A34', fontSize: 24, fontWeight: '800', marginTop: 8 },
  summary: { color: '#6B6684', fontSize: 14, lineHeight: 21, marginTop: 9 },
  points: { marginTop: 18, gap: 10 },
  pointRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  pointIndex: { width: 24, height: 24, borderRadius: 12, backgroundColor: '#DFF6F4', color: '#0E8F86', textAlign: 'center', lineHeight: 24, fontSize: 11, fontWeight: '800' },
  pointText: { flex: 1, color: '#1D1A34', fontSize: 13, lineHeight: 19 },
  practiceBox: { backgroundColor: '#FFF6DD', borderRadius: 14, padding: 14, marginTop: 18 },
  practiceLabel: { color: '#9A7412', fontSize: 11, fontWeight: '800' },
  practiceText: { color: '#6B571B', fontSize: 13, lineHeight: 19, marginTop: 4 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 24, marginBottom: 10 },
  sectionTitle: { color: '#1D1A34', fontSize: 18, fontWeight: '800' },
  sectionSubtitle: { color: '#6B6684', fontSize: 11, marginTop: 2 },
  addButton: { backgroundColor: '#1D1A34', paddingHorizontal: 13, paddingVertical: 9, borderRadius: 12 },
  addButtonText: { color: '#FFFFFF', fontSize: 12, fontWeight: '800' },
  sourceCard: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 15, borderWidth: 1, borderColor: '#E7E3F5', marginBottom: 9 },
  sourceTitle: { color: '#1D1A34', fontWeight: '800', fontSize: 14 },
  sourceBody: { color: '#6B6684', fontSize: 12, lineHeight: 18, marginTop: 5 },
  emptyCard: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#E7E3F5' },
  emptyTitle: { color: '#1D1A34', fontWeight: '700', fontSize: 14 },
  emptyText: { color: '#6B6684', fontSize: 12, lineHeight: 18, marginTop: 4 },
});
