import { Stack, router, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View, type ViewStyle } from 'react-native';

import { getCourse } from '@/data/courseCatalog';

export default function CourseScreen() {
  const { levelName, courseName } = useLocalSearchParams<{ levelName: string; courseName: string }>();
  const course = getCourse(levelName, courseName);
  const isEnglish = courseName === 'İngilizce';

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Stack.Screen options={{ title: courseName ?? 'Ders' }} />

      <View style={styles.hero}>
        <Text style={styles.icon}>{course?.icon ?? '📘'}</Text>
        <Text style={styles.title}>{courseName}</Text>
        <Text style={styles.level}>{levelName}</Text>
        <Text style={styles.description}>{course?.description}</Text>
      </View>

      <Text style={styles.sectionTitle}>Çalışma modu</Text>
      <ActionCard
        icon="📘"
        title="Konu Anlatımı"
        description="Yerel konu özeti ve kendi eklediğin kaynaklarla çalış."
        tone="green"
        onPress={() => router.push(`/lesson/${levelName}/${courseName}`)}
      />
      <ActionCard
        icon="❓"
        title="Soru Çözümü"
        description="API gerektirmeyen yerel soru bankasından quiz çöz."
        tone="blue"
        onPress={() => router.push(`/quiz/${levelName}/${courseName}`)}
      />
      <ActionCard
        icon="🗂️"
        title="Kaynaklarım"
        description="Bu ders için kendi notunu veya çalışma kaynağını cihazda sakla."
        tone="yellow"
        onPress={() => router.push(`/resources/${levelName}/${courseName}`)}
      />
      {isEnglish ? (
        <ActionCard
          icon="💬"
          title="Konuşma Labı"
          description="TalkLab’den gelen çevrimdışı senaryolarla İngilizce pratik yap."
          tone="pink"
          onPress={() => router.push(`/chat/${levelName}/${courseName}`)}
        />
      ) : null}

      <View style={styles.apiNote}>
        <Text style={styles.apiTitle}>AI katmanı kapalı</Text>
        <Text style={styles.apiText}>Ders ve quiz akışları API anahtarı olmadan çalışır. AI daha sonra isteğe bağlı sağlayıcı olarak eklenebilir.</Text>
      </View>
    </ScrollView>
  );
}

type ActionCardProps = {
  icon: string;
  title: string;
  description: string;
  tone: 'green' | 'blue' | 'yellow' | 'pink';
  onPress: () => void;
};

const toneStyles: Record<ActionCardProps['tone'], ViewStyle> = {
  green: { backgroundColor: '#E8F8F3', borderColor: '#C4EDE1' },
  blue: { backgroundColor: '#EAF2FF', borderColor: '#CCDDF7' },
  yellow: { backgroundColor: '#FFF6DD', borderColor: '#F1E0AD' },
  pink: { backgroundColor: '#FFE9EF', borderColor: '#F9CBD7' },
};

function ActionCard({ icon, title, description, tone, onPress }: ActionCardProps) {
  return (
    <TouchableOpacity style={[styles.actionCard, toneStyles[tone]]} activeOpacity={0.86} onPress={onPress}>
      <Text style={styles.actionIcon}>{icon}</Text>
      <View style={styles.actionBody}>
        <Text style={styles.actionTitle}>{title}</Text>
        <Text style={styles.actionText}>{description}</Text>
      </View>
      <Text style={styles.arrow}>›</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F3FB' },
  content: { padding: 18, paddingBottom: 36 },
  hero: { backgroundColor: '#1D1A34', borderRadius: 24, padding: 22, marginBottom: 22 },
  icon: { fontSize: 36 },
  title: { color: '#FFFFFF', fontSize: 28, fontWeight: '800', marginTop: 8 },
  level: { color: '#FFC145', fontSize: 12, fontWeight: '700', marginTop: 2 },
  description: { color: '#D9D5E8', fontSize: 13, lineHeight: 19, marginTop: 8 },
  sectionTitle: { color: '#1D1A34', fontSize: 18, fontWeight: '800', marginBottom: 10 },
  actionCard: { flexDirection: 'row', alignItems: 'center', borderRadius: 18, padding: 15, marginBottom: 10, borderWidth: 1 },
  actionIcon: { fontSize: 26, width: 42 },
  actionBody: { flex: 1 },
  actionTitle: { color: '#1D1A34', fontSize: 16, fontWeight: '800' },
  actionText: { color: '#6B6684', fontSize: 12, lineHeight: 17, marginTop: 3 },
  arrow: { color: '#6B6684', fontSize: 28, marginLeft: 8 },
  apiNote: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 14, borderWidth: 1, borderColor: '#E7E3F5', marginTop: 10 },
  apiTitle: { color: '#12B3A8', fontWeight: '800', fontSize: 12 },
  apiText: { color: '#6B6684', fontSize: 11, lineHeight: 16, marginTop: 4 },
});
