import { useFocusEffect } from '@react-navigation/native';
import { Stack, router } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import {
  getAllTopicMastery,
  getMasteryLabel,
  type TopicMastery,
} from '@/storage/coachStore';

export default function MasteryScreen() {
  const [items, setItems] = useState<TopicMastery[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      setLoading(true);
      getAllTopicMastery().then((nextItems) => {
        if (!active) return;
        setItems(nextItems);
        setLoading(false);
      });
      return () => {
        active = false;
      };
    }, []),
  );

  const active = useMemo(
    () => items.filter((item) => item.attempts > 0 || item.sourceCount > 0 || item.lastVisitedAt),
    [items],
  );

  const summary = useMemo(() => ({
    mastered: active.filter((item) => item.status === 'mastered').length,
    proficient: active.filter((item) => item.status === 'proficient').length,
    needsWork: active.filter((item) => item.status === 'needs-work').length,
  }), [active]);

  const groups = useMemo(() => {
    const map = new Map<string, TopicMastery[]>();
    for (const item of active) {
      const key = `${item.levelName}::${item.courseName}`;
      const current = map.get(key) ?? [];
      current.push(item);
      map.set(key, current);
    }
    return Array.from(map.entries())
      .map(([key, topics]) => ({ key, topics: topics.sort((a, b) => a.score - b.score) }))
      .sort((a, b) => {
        const aRecent = a.topics.map((item) => item.lastVisitedAt ?? item.lastPracticedAt ?? '').sort().at(-1) ?? '';
        const bRecent = b.topics.map((item) => item.lastVisitedAt ?? item.lastPracticedAt ?? '').sort().at(-1) ?? '';
        return bRecent.localeCompare(aRecent);
      });
  }, [active]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Stack.Screen options={{ title: 'Konu Ustalığı' }} />

      <View style={styles.hero}>
        <Text style={styles.eyebrow}>USTALIK HARİTASI</Text>
        <Text style={styles.title}>Konu bazında gerçek ilerleme</Text>
        <Text style={styles.subtitle}>
          Puan; quiz doğruluğu, kaç soruya dokunduğun ve bekleyen tekrarları birlikte değerlendirir. Yanlışlar ustalık seviyesini aşağı çekebilir.
        </Text>
        <View style={styles.summaryRow}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryValue}>{summary.mastered}</Text>
            <Text style={styles.summaryLabel}>ustalaşılan</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryValue}>{summary.proficient}</Text>
            <Text style={styles.summaryLabel}>iyi</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryValue}>{summary.needsWork}</Text>
            <Text style={styles.summaryLabel}>tekrar et</Text>
          </View>
        </View>
      </View>

      {loading ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>Ustalık haritası hazırlanıyor...</Text>
        </View>
      ) : groups.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyIcon}>🗺️</Text>
          <Text style={styles.emptyTitle}>Henüz aktif konu yok</Text>
          <Text style={styles.emptyText}>Bir konu açıp quiz çözmeye başladığında kişisel ustalık haritan burada oluşacak.</Text>
        </View>
      ) : (
        groups.map((group) => {
          const first = group.topics[0];
          return (
            <View key={group.key} style={styles.group}>
              <View style={styles.groupHeader}>
                <View>
                  <Text style={styles.groupTitle}>{first.courseName}</Text>
                  <Text style={styles.groupSubtitle}>{first.levelName} · {group.topics.length} aktif konu</Text>
                </View>
                <TouchableOpacity onPress={() => router.push(`/course/${first.levelName}/${first.courseName}`)}>
                  <Text style={styles.openCourse}>Dersi aç →</Text>
                </TouchableOpacity>
              </View>

              {group.topics.map((item) => (
                <TouchableOpacity
                  key={item.topicName}
                  activeOpacity={0.86}
                  style={styles.topicCard}
                  onPress={() => router.push(`/topic/${item.levelName}/${item.courseName}/${item.topicName}`)}>
                  <Text style={styles.topicIcon}>{item.icon}</Text>
                  <View style={styles.topicBody}>
                    <View style={styles.topicTopRow}>
                      <Text style={styles.topicName}>{item.topicName}</Text>
                      <Text style={styles.topicScore}>{item.score}/100</Text>
                    </View>
                    <View style={styles.track}>
                      <View style={[styles.fill, { width: `${item.score}%` }]} />
                    </View>
                    <View style={styles.metaRow}>
                      <Text style={styles.status}>{getMasteryLabel(item.status)}</Text>
                      <Text style={styles.meta}>
                        {item.attempts > 0 ? `%${item.accuracy} doğruluk · ${item.attempts} deneme` : 'Henüz quiz yok'}
                        {item.dueCount ? ` · ${item.dueCount} tekrar` : ''}
                        {item.sourceCount ? ` · ${item.sourceCount} kaynak` : ''}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          );
        })
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F3FB' },
  content: { padding: 18, paddingBottom: 40 },
  hero: { backgroundColor: '#1D1A34', borderRadius: 24, padding: 21, marginBottom: 20 },
  eyebrow: { color: '#FFC145', fontSize: 10, fontWeight: '900', letterSpacing: 1 },
  title: { color: '#FFFFFF', fontSize: 27, lineHeight: 33, fontWeight: '900', marginTop: 6 },
  subtitle: { color: '#D9D5E8', fontSize: 12, lineHeight: 18, marginTop: 8 },
  summaryRow: { flexDirection: 'row', gap: 8, marginTop: 18 },
  summaryCard: { flex: 1, backgroundColor: '#2A2647', borderRadius: 14, padding: 12 },
  summaryValue: { color: '#FFFFFF', fontSize: 21, fontWeight: '900' },
  summaryLabel: { color: '#BEB8D6', fontSize: 9, marginTop: 2 },
  group: { marginBottom: 22 },
  groupHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 9 },
  groupTitle: { color: '#1D1A34', fontSize: 18, fontWeight: '900' },
  groupSubtitle: { color: '#6B6684', fontSize: 10, marginTop: 2 },
  openCourse: { color: '#6552D9', fontSize: 10, fontWeight: '900' },
  topicCard: { flexDirection: 'row', backgroundColor: '#FFFFFF', borderRadius: 17, padding: 14, borderWidth: 1, borderColor: '#E7E3F5', marginBottom: 8 },
  topicIcon: { fontSize: 26, width: 42 },
  topicBody: { flex: 1 },
  topicTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  topicName: { flex: 1, color: '#1D1A34', fontSize: 14, fontWeight: '900' },
  topicScore: { color: '#FF5C7C', fontSize: 12, fontWeight: '900' },
  track: { height: 6, backgroundColor: '#ECE9F4', borderRadius: 999, overflow: 'hidden', marginTop: 8 },
  fill: { height: '100%', backgroundColor: '#12B3A8' },
  metaRow: { marginTop: 7 },
  status: { color: '#6552D9', fontSize: 10, fontWeight: '900' },
  meta: { color: '#6B6684', fontSize: 9, lineHeight: 14, marginTop: 2 },
  emptyCard: { backgroundColor: '#FFFFFF', borderRadius: 20, padding: 20, borderWidth: 1, borderColor: '#E7E3F5', alignItems: 'center' },
  emptyIcon: { fontSize: 42 },
  emptyTitle: { color: '#1D1A34', fontSize: 17, fontWeight: '900', textAlign: 'center', marginTop: 8 },
  emptyText: { color: '#6B6684', fontSize: 12, lineHeight: 18, textAlign: 'center', marginTop: 6 },
});
