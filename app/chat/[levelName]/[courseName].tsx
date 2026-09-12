import { Stack, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { ENGLISH_SCENARIOS } from '@/data/offlineContent';
import { recordCourseSession, recordStudyActivity } from '@/storage/learningStore';

type Message = {
  id: string;
  role: 'coach' | 'user';
  text: string;
};

export default function ConversationLabScreen() {
  const { levelName, courseName } = useLocalSearchParams<{ levelName: string; courseName: string }>();
  const [scenarioId, setScenarioId] = useState(ENGLISH_SCENARIOS[0].id);
  const scenario = useMemo(
    () => ENGLISH_SCENARIOS.find((item) => item.id === scenarioId) ?? ENGLISH_SCENARIOS[0],
    [scenarioId],
  );
  const [messages, setMessages] = useState<Message[]>([
    { id: 'opening', role: 'coach', text: ENGLISH_SCENARIOS[0].opening },
  ]);
  const [input, setInput] = useState('');
  const [promptIndex, setPromptIndex] = useState(0);
  const [turns, setTurns] = useState(0);

  useEffect(() => {
    if (levelName && courseName) recordCourseSession(levelName, courseName);
  }, [levelName, courseName]);

  const startScenario = (id: string) => {
    const next = ENGLISH_SCENARIOS.find((item) => item.id === id) ?? ENGLISH_SCENARIOS[0];
    setScenarioId(id);
    setMessages([{ id: `${id}-opening`, role: 'coach', text: next.opening }]);
    setPromptIndex(0);
    setTurns(0);
    setInput('');
  };

  const handleSend = async () => {
    const text = input.trim();
    if (!text) return;

    const nextPrompt = scenario.prompts[promptIndex % scenario.prompts.length];
    setMessages((current) => [
      ...current,
      { id: `user-${Date.now()}`, role: 'user', text },
      { id: `coach-${Date.now()}`, role: 'coach', text: nextPrompt },
    ]);
    setInput('');
    setPromptIndex((value) => value + 1);
    setTurns((value) => value + 1);

    await recordStudyActivity();
  };

  if (courseName !== 'İngilizce') {
    return (
      <View style={styles.centerContainer}>
        <Stack.Screen options={{ title: 'Pratik Labı' }} />
        <Text style={styles.centerIcon}>💬</Text>
        <Text style={styles.centerTitle}>Konuşma Labı şu an İngilizce dersi için hazır.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Konuşma Labı' }} />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.hero}>
          <View style={styles.heroTop}>
            <Text style={styles.heroLabel}>TALKLAB · OFFLINE</Text>
            <Text style={styles.badge}>API YOK</Text>
          </View>
          <Text style={styles.heroTitle}>İngilizce konuşma pratiği</Text>
          <Text style={styles.heroText}>Hazır senaryolarla cevap üret, kalıpları kullan ve konuşma turunu artır. Bu mod yapay zekâ kullanmaz.</Text>
          <Text style={styles.turns}>💬 {turns} tur</Text>
        </View>

        <Text style={styles.sectionTitle}>Senaryo</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scenarioRow}>
          {ENGLISH_SCENARIOS.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[styles.scenarioChip, item.id === scenarioId && styles.scenarioChipActive]}
              onPress={() => startScenario(item.id)}>
              <Text style={[styles.scenarioText, item.id === scenarioId && styles.scenarioTextActive]}>{item.title}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.phraseCard}>
          <Text style={styles.phraseTitle}>İşe yarayan kalıplar</Text>
          <View style={styles.phraseWrap}>
            {scenario.phrases.map((phrase) => (
              <TouchableOpacity key={phrase} style={styles.phraseChip} onPress={() => setInput(phrase)}>
                <Text style={styles.phraseText}>{phrase}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.messages}>
          {messages.map((message) => (
            <View
              key={message.id}
              style={[styles.bubble, message.role === 'user' ? styles.userBubble : styles.coachBubble]}>
              <Text style={[styles.bubbleText, message.role === 'user' && styles.userBubbleText]}>{message.text}</Text>
            </View>
          ))}
        </View>

        <View style={styles.inputCard}>
          <TextInput
            style={styles.input}
            value={input}
            onChangeText={setInput}
            placeholder="İngilizce cevabını yaz..."
            placeholderTextColor="#9A95AD"
            multiline
          />
          <TouchableOpacity
            style={[styles.sendButton, !input.trim() && styles.disabled]}
            disabled={!input.trim()}
            onPress={handleSend}>
            <Text style={styles.sendButtonText}>Gönder</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F3FB' },
  content: { padding: 16, paddingBottom: 36 },
  hero: { backgroundColor: '#1D1A34', borderRadius: 22, padding: 19 },
  heroTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  heroLabel: { color: '#FFC145', fontSize: 10, fontWeight: '800', letterSpacing: 1 },
  badge: { color: '#DFF6F4', backgroundColor: '#2F4A50', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999, fontSize: 9, fontWeight: '800' },
  heroTitle: { color: '#FFFFFF', fontSize: 24, fontWeight: '800', marginTop: 10 },
  heroText: { color: '#D9D5E8', fontSize: 12, lineHeight: 18, marginTop: 7 },
  turns: { color: '#FF91A8', fontSize: 12, fontWeight: '800', marginTop: 12 },
  sectionTitle: { color: '#1D1A34', fontSize: 16, fontWeight: '800', marginTop: 20, marginBottom: 9 },
  scenarioRow: { gap: 8, paddingRight: 10 },
  scenarioChip: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E7E3F5', paddingHorizontal: 12, paddingVertical: 9, borderRadius: 999 },
  scenarioChipActive: { backgroundColor: '#FF5C7C', borderColor: '#FF5C7C' },
  scenarioText: { color: '#6B6684', fontSize: 11, fontWeight: '700' },
  scenarioTextActive: { color: '#FFFFFF' },
  phraseCard: { backgroundColor: '#FFFFFF', borderRadius: 18, padding: 14, borderWidth: 1, borderColor: '#E7E3F5', marginTop: 14 },
  phraseTitle: { color: '#1D1A34', fontSize: 12, fontWeight: '800' },
  phraseWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 7, marginTop: 9 },
  phraseChip: { backgroundColor: '#FFF6DD', paddingHorizontal: 10, paddingVertical: 7, borderRadius: 999 },
  phraseText: { color: '#745A14', fontSize: 11 },
  messages: { marginTop: 16, gap: 9 },
  bubble: { maxWidth: '86%', borderRadius: 16, padding: 12 },
  coachBubble: { alignSelf: 'flex-start', backgroundColor: '#DFF6F4', borderBottomLeftRadius: 4 },
  userBubble: { alignSelf: 'flex-end', backgroundColor: '#FF5C7C', borderBottomRightRadius: 4 },
  bubbleText: { color: '#1D1A34', fontSize: 13, lineHeight: 19 },
  userBubbleText: { color: '#FFFFFF' },
  inputCard: { backgroundColor: '#FFFFFF', borderRadius: 18, padding: 11, borderWidth: 1, borderColor: '#E7E3F5', marginTop: 15 },
  input: { minHeight: 54, color: '#1D1A34', fontSize: 13, paddingHorizontal: 5, textAlignVertical: 'top' },
  sendButton: { alignSelf: 'flex-end', backgroundColor: '#1D1A34', paddingHorizontal: 18, paddingVertical: 10, borderRadius: 12, marginTop: 7 },
  sendButtonText: { color: '#FFFFFF', fontSize: 12, fontWeight: '800' },
  disabled: { opacity: 0.4 },
  centerContainer: { flex: 1, backgroundColor: '#F5F3FB', alignItems: 'center', justifyContent: 'center', padding: 28 },
  centerIcon: { fontSize: 48 },
  centerTitle: { color: '#1D1A34', fontSize: 18, fontWeight: '800', textAlign: 'center', marginTop: 12 },
});
