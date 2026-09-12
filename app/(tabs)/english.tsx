import { router } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { LEVELS } from '@/data/courseCatalog';
import { getTopicsForCatalogCourse } from '@/data/topicCatalog';

const ENGLISH_LEVELS = LEVELS.filter((level) => level.courses.some((course) => course.name === 'İngilizce'));

export default function EnglishLabScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.hero}>
        <Text style={styles.eyebrow}>TALKLAB · İNGİLİZCE</Text>
        <Text style={styles.title}>İngilizce her zaman erişilebilir</Text>
        <Text style={styles.subtitle}>
          Eğitim seviyenden bağımsız olarak kelime, gramer, kaynak çalışması ve konuşma senaryolarına buradan ulaş.
        </Text>
      </View>

      <View style={styles.featureRow}>
        <View style={styles.featureCard}>
          <Text style={styles.featureIcon}>💬</Text>
          <Text style={styles.featureTitle}>Konuşma</Text>
          <Text style={styles.featureText}>Kısa rol senaryoları ve hazır cevap kalıpları.</Text>
        </View>
        <View style={styles.featureCard}>
          <Text style={styles.featureIcon}>🧠</Text>
          <Text style={styles.featureTitle}>Kelime</Text>
          <Text style={styles.featureText}>Konu kartları, quiz ve tekrar döngüsü.</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Seviyeni seç</Text>
      <View style={styles.levelList}>
        {ENGLISH_LEVELS.map((level) => {
          const topics = getTopicsForCatalogCourse(level.name, 'İngilizce');
          return (
            <View key={level.name} style={styles.levelCard}>
              <View style={styles.levelTop}>
                <Text style={styles.levelIcon}>{level.icon}</Text>
                <View style={styles.levelBody}>
                  <Text style={styles.levelName}>{level.name} İngilizce</Text>
                  <Text style={styles.levelMeta}>{topics.length} konu · çevrimdışı çalışma</Text>
                </View>
              </View>
              <View style={styles.topicWrap}>
                {topics.slice(0, 4).map((topic) => (
                  <View key={topic.name} style={styles.topicChip}>
                    <Text style={styles.topicChipText}>{topic.icon} {topic.name}</Text>
                  </View>
                ))}
              </View>
              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={styles.primaryButton}
                  onPress={() => router.push(`/course/${level.name}/İngilizce`)}>
                  <Text style={styles.primaryButtonText}>Derse gir</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.secondaryButton}
                  onPress={() => router.push(`/chat/${level.name}/İngilizce`)}>
                  <Text style={styles.secondaryButtonText}>💬 Konuş</Text>
                </TouchableOpacity>
              </View>
              <TouchableOpacity
                style={styles.notebookButton}
                onPress={() =>
                  router.push({
                    pathname: '/studio/[levelName]/[courseName]',
                    params: { levelName: level.name, courseName: 'İngilizce' },
                  })
                }>
                <Text style={styles.notebookButtonText}>📚 İngilizce kaynaklarından çalışma üret →</Text>
              </TouchableOpacity>
            </View>
          );
        })}
      </View>

      <View style={styles.tipCard}>
        <Text style={styles.tipEyebrow}>KOÇ ÖNERİSİ</Text>
        <Text style={styles.tipTitle}>Kısa ama sık İngilizce çalış</Text>
        <Text style={styles.tipText}>
          Bir konuyu aç, 5-10 dakika pratik yap, quiz çöz ve yanlışlarını günlük tekrar kuyruğuna bırak. Eklediğin İngilizce PDF veya notlardan da Kaynak Stüdyosu kart ve soru üretir.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F3FB' },
  content: { padding: 18, paddingBottom: 42 },
  hero: { backgroundColor: '#1D1A34', borderRadius: 24, padding: 22, marginBottom: 12 },
  eyebrow: { color: '#FF8FB1', fontSize: 10, fontWeight: '900', letterSpacing: 1 },
  title: { color: '#FFFFFF', fontSize: 27, lineHeight: 33, fontWeight: '900', marginTop: 6 },
  subtitle: { color: '#D9D5E8', fontSize: 12, lineHeight: 18, marginTop: 8 },
  featureRow: { flexDirection: 'row', gap: 9, marginBottom: 20 },
  featureCard: { flex: 1, backgroundColor: '#FFFFFF', borderRadius: 18, padding: 14, borderWidth: 1, borderColor: '#E7E3F5' },
  featureIcon: { fontSize: 24 },
  featureTitle: { color: '#1D1A34', fontSize: 14, fontWeight: '900', marginTop: 6 },
  featureText: { color: '#6B6684', fontSize: 10, lineHeight: 15, marginTop: 3 },
  sectionTitle: { color: '#1D1A34', fontSize: 18, fontWeight: '900', marginBottom: 10 },
  levelList: { gap: 11 },
  levelCard: { backgroundColor: '#FFFFFF', borderRadius: 20, padding: 16, borderWidth: 1, borderColor: '#E7E3F5' },
  levelTop: { flexDirection: 'row', alignItems: 'center' },
  levelIcon: { fontSize: 28, width: 42 },
  levelBody: { flex: 1 },
  levelName: { color: '#1D1A34', fontSize: 16, fontWeight: '900' },
  levelMeta: { color: '#6B6684', fontSize: 10, marginTop: 2 },
  topicWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 12 },
  topicChip: { backgroundColor: '#F5F3FB', borderRadius: 999, paddingHorizontal: 9, paddingVertical: 6 },
  topicChipText: { color: '#6552D9', fontSize: 9, fontWeight: '800' },
  buttonRow: { flexDirection: 'row', gap: 8, marginTop: 13 },
  primaryButton: { flex: 1, backgroundColor: '#6552D9', borderRadius: 12, paddingVertical: 11, alignItems: 'center' },
  primaryButtonText: { color: '#FFFFFF', fontSize: 11, fontWeight: '900' },
  secondaryButton: { flex: 1, backgroundColor: '#FFE9EF', borderRadius: 12, paddingVertical: 11, alignItems: 'center' },
  secondaryButtonText: { color: '#B9345D', fontSize: 11, fontWeight: '900' },
  notebookButton: { backgroundColor: '#DFF6F4', borderRadius: 12, padding: 11, alignItems: 'center', marginTop: 8 },
  notebookButtonText: { color: '#0E716B', fontSize: 10, fontWeight: '900' },
  tipCard: { backgroundColor: '#FFF5D8', borderRadius: 18, padding: 15, marginTop: 16, borderWidth: 1, borderColor: '#F4D782' },
  tipEyebrow: { color: '#A66B00', fontSize: 9, fontWeight: '900', letterSpacing: 1 },
  tipTitle: { color: '#1D1A34', fontSize: 15, fontWeight: '900', marginTop: 4 },
  tipText: { color: '#735F31', fontSize: 11, lineHeight: 17, marginTop: 5 },
});
