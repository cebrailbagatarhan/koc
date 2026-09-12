import { Stack, router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { getTopic } from '@/data/topicCatalog';
import { getQuizQuestionsForTopic } from '@/data/topicQuiz';
import { recordTopicVisit } from '@/storage/coachStore';
import { recordCourseSession, searchSourcesForCourse, type LocalSource } from '@/storage/learningStore';

export default function TopicScreen() {
  const { levelName, courseName, topicName } = useLocalSearchParams<{
    levelName: string;
    courseName: string;
    topicName: string;
  }>();
  const topic = getTopic(levelName, courseName, topicName);
  const questionCount = useMemo(
    () => getQuizQuestionsForTopic(levelName, courseName, topicName).length,
    [courseName, levelName, topicName],
  );
  const [sources, setSources] = useState<LocalSource[]>([]);

  useEffect(() => {
    if (!levelName || !courseName || !topicName) return;
    recordCourseSession(levelName, courseName);
    recordTopicVisit(levelName, courseName, topicName);
    searchSourcesForCourse(levelName, courseName, '', topicName).then(setSources);
  }, [courseName, levelName, topicName]);

  if (!topic) {
    return (
      <View style={styles.centerContainer}>
        <Stack.Screen options={{ title: 'Konu' }} />
        <Text style={styles.emptyIcon}>📚</Text>
        <Text style={styles.emptyTitle}>Bu konu katalogda bulunamadı.</Text>
        <Text style={styles.emptyText}>Ders ekranına dönüp mevcut konulardan birini seçebilirsin.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Stack.Screen options={{ title: topic.name }} />

      <View style={styles.hero}>
        <Text style={styles.heroIcon}>{topic.icon}</Text>
        <Text style={styles.eyebrow}>{levelName} · {courseName}</Text>
        <Text style={styles.title}>{topic.name}</Text>
        <Text style={styles.summary}>{topic.summary}</Text>
      </View>

      <View style={styles.lessonCard}>
        <Text style={styles.sectionTitle}>Bu konuda ne kazanacağız?</Text>
        <View style={styles.goalList}>
          {topic.goals.map((goal, index) => (
            <View key={goal} style={styles.goalRow}>
              <Text style={styles.goalIndex}>{index + 1}</Text>
              <Text style={styles.goalText}>{goal}</Text>
            </View>
          ))}
        </View>

        <View style={styles.practiceBox}>
          <Text style={styles.practiceLabel}>Mini çalışma</Text>
          <Text style={styles.practiceText}>{topic.practicePrompt}</Text>
        </View>
      </View>

      <View style={styles.actionRow}>
        <TouchableOpacity
          style={[styles.actionButton, styles.quizButton, questionCount === 0 && styles.disabled]}
          disabled={questionCount === 0}
          onPress={() =>
            router.push({
              pathname: '/quiz/[levelName]/[courseName]',
              params: { levelName, courseName, topicName: topic.name },
            })
          }>
          <Text style={styles.quizButtonText}>❓ {questionCount > 0 ? `Konu quizi · ${questionCount}` : 'Quiz hazırlanıyor'}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.resourceButton]}
          onPress={() =>
            router.push({
              pathname: '/resources/[levelName]/[courseName]',
              params: { levelName, courseName, topicName: topic.name },
            })
          }>
          <Text style={styles.resourceButtonText}>📎 Kaynak ekle</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.sectionHeader}>
        <View>
          <Text style={styles.sectionTitle}>Bu konuya bağlı kaynaklar</Text>
          <Text style={styles.sectionSubtitle}>{sources.length} yerel kayıt</Text>
        </View>
        <TouchableOpacity
          onPress={() =>
            router.push({
              pathname: '/resources/[levelName]/[courseName]',
              params: { levelName, courseName, topicName: topic.name },
            })
          }>
          <Text style={styles.manageText}>Yönet →</Text>
        </TouchableOpacity>
      </View>

      {sources.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>
            Bu konuya henüz not veya dosya bağlanmadı. Kaynak eklediğinde burada yalnızca bu konuyla ilişkili içerikler görünecek.
          </Text>
        </View>
      ) : (
        sources.map((source) => (
          <View key={source.id} style={styles.sourceCard}>
            <View style={styles.sourceTopRow}>
              <Text style={styles.kindBadge}>{source.kind === 'file' ? 'DOSYA' : 'NOT'}</Text>
              <Text style={styles.sourceDate}>{new Date(source.createdAt).toLocaleDateString('tr-TR')}</Text>
            </View>
            <Text style={styles.sourceTitle}>{source.title}</Text>
            <Text style={styles.sourceBody} numberOfLines={6}>{source.body}</Text>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F3FB' },
  content: { padding: 18, paddingBottom: 36 },
  hero: { backgroundColor: '#1D1A34', borderRadius: 24, padding: 21 },
  heroIcon: { fontSize: 36 },
  eyebrow: { color: '#FFC145', fontSize: 10, fontWeight: '800', letterSpacing: 0.8, marginTop: 10 },
  title: { color: '#FFFFFF', fontSize: 26, fontWeight: '800', marginTop: 5 },
  summary: { color: '#D9D5E8', fontSize: 13, lineHeight: 20, marginTop: 9 },
  lessonCard: { backgroundColor: '#FFFFFF', borderRadius: 20, padding: 18, borderWidth: 1, borderColor: '#E7E3F5', marginTop: 14 },
  sectionTitle: { color: '#1D1A34', fontSize: 17, fontWeight: '800' },
  sectionSubtitle: { color: '#6B6684', fontSize: 11, marginTop: 2 },
  goalList: { marginTop: 13, gap: 9 },
  goalRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 9 },
  goalIndex: { width: 23, height: 23, borderRadius: 12, backgroundColor: '#DFF6F4', color: '#0E8F86', textAlign: 'center', lineHeight: 23, fontSize: 10, fontWeight: '900' },
  goalText: { flex: 1, color: '#1D1A34', fontSize: 12, lineHeight: 18 },
  practiceBox: { backgroundColor: '#FFF6DD', borderRadius: 14, padding: 13, marginTop: 16 },
  practiceLabel: { color: '#9A7412', fontSize: 10, fontWeight: '900' },
  practiceText: { color: '#6B571B', fontSize: 12, lineHeight: 18, marginTop: 4 },
  actionRow: { flexDirection: 'row', gap: 9, marginTop: 14 },
  actionButton: { flex: 1, minHeight: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 10 },
  quizButton: { backgroundColor: '#1D1A34' },
  resourceButton: { backgroundColor: '#6552D9' },
  quizButtonText: { color: '#FFFFFF', fontSize: 11, fontWeight: '800', textAlign: 'center' },
  resourceButtonText: { color: '#FFFFFF', fontSize: 11, fontWeight: '800' },
  disabled: { opacity: 0.45 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 24, marginBottom: 10 },
  manageText: { color: '#6552D9', fontSize: 11, fontWeight: '800' },
  emptyCard: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#E7E3F5' },
  emptyText: { color: '#6B6684', fontSize: 12, lineHeight: 18 },
  sourceCard: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 15, borderWidth: 1, borderColor: '#E7E3F5', marginBottom: 9 },
  sourceTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  kindBadge: { color: '#6552D9', fontSize: 9, fontWeight: '900', letterSpacing: 0.7 },
  sourceDate: { color: '#9A95AD', fontSize: 9 },
  sourceTitle: { color: '#1D1A34', fontSize: 14, fontWeight: '800', marginTop: 6 },
  sourceBody: { color: '#6B6684', fontSize: 12, lineHeight: 18, marginTop: 5 },
  centerContainer: { flex: 1, backgroundColor: '#F5F3FB', alignItems: 'center', justifyContent: 'center', padding: 28 },
  emptyIcon: { fontSize: 46 },
  emptyTitle: { color: '#1D1A34', fontSize: 20, fontWeight: '800', textAlign: 'center', marginTop: 12 },
});
