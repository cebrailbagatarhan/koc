import { useFocusEffect } from '@react-navigation/native';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

import {
  buildSourceStudy,
  searchSourcePassages,
  type SourceStudy,
  type StudyCitation,
} from '@/services/sourceStudy';

type Mode = 'guide' | 'cards' | 'quiz';

const emptyStudy: SourceStudy = {
  sourceCount: 0,
  chunkCount: 0,
  keyPoints: [],
  flashcards: [],
  questions: [],
};

export default function SourceStudioScreen() {
  const { levelName, courseName, topicName } = useLocalSearchParams<{
    levelName: string;
    courseName: string;
    topicName?: string;
  }>();
  const [study, setStudy] = useState<SourceStudy>(emptyStudy);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<Mode>('guide');
  const [revealedCard, setRevealedCard] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [query, setQuery] = useState('');
  const [matches, setMatches] = useState<StudyCitation[]>([]);
  const [searching, setSearching] = useState(false);

  const reload = useCallback(async () => {
    if (!levelName || !courseName) return;
    setLoading(true);
    try {
      const next = await buildSourceStudy(levelName, courseName, topicName);
      setStudy(next);
    } finally {
      setLoading(false);
    }
  }, [courseName, levelName, topicName]);

  useFocusEffect(
    useCallback(() => {
      reload();
      return undefined;
    }, [reload]),
  );

  const answeredCount = useMemo(() => Object.keys(answers).length, [answers]);

  const handleSearch = async () => {
    if (!levelName || !courseName || !query.trim()) {
      setMatches([]);
      return;
    }
    setSearching(true);
    try {
      setMatches(await searchSourcePassages(levelName, courseName, query, topicName));
    } finally {
      setSearching(false);
    }
  };

  const resourceRoute = {
    pathname: '/resources/[levelName]/[courseName]' as const,
    params: {
      levelName,
      courseName,
      ...(topicName ? { topicName } : {}),
    },
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <Stack.Screen options={{ title: `${courseName ?? 'Ders'} · Kaynak Stüdyosu` }} />

      <View style={styles.hero}>
        <Text style={styles.heroEyebrow}>KAYNAK STÜDYOSU · OFFLINE</Text>
        <Text style={styles.heroTitle}>Kaynağından çalış</Text>
        <Text style={styles.heroText}>
          {topicName ? `${topicName} · ` : ''}Özet, kart ve sorular yalnızca eklediğin okunabilir kaynak metninden türetilir.
        </Text>
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{study.sourceCount}</Text>
            <Text style={styles.statLabel}>kaynak</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{study.chunkCount}</Text>
            <Text style={styles.statLabel}>metin parçası</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{study.questions.length}</Text>
            <Text style={styles.statLabel}>kaynak sorusu</Text>
          </View>
        </View>
      </View>

      <View style={styles.searchCard}>
        <Text style={styles.searchEyebrow}>KAYNAKLARA SOR</Text>
        <Text style={styles.searchTitle}>İlgili pasajları bul</Text>
        <Text style={styles.searchText}>
          Burada uydurma cevap yok: yazdığın ifadeyle eşleşen gerçek kaynak parçalarını gösterir.
        </Text>
        <View style={styles.searchRow}>
          <TextInput
            style={styles.searchInput}
            value={query}
            onChangeText={setQuery}
            placeholder="Örn. yüzde problemi nasıl çözülür?"
            placeholderTextColor="#9A95AD"
            returnKeyType="search"
            onSubmitEditing={handleSearch}
          />
          <TouchableOpacity style={styles.searchButton} onPress={handleSearch} disabled={searching}>
            <Text style={styles.searchButtonText}>{searching ? '…' : 'Ara'}</Text>
          </TouchableOpacity>
        </View>
        {matches.map((match, index) => (
          <CitationCard key={`${match.sourceId}-${index}`} citation={match} />
        ))}
        {query.trim() && !searching && matches.length === 0 ? (
          <Text style={styles.noMatch}>Bu ifadeyle eşleşen kaynak pasajı bulunamadı.</Text>
        ) : null}
      </View>

      {loading ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>Kaynaklar hazırlanıyor...</Text>
        </View>
      ) : study.chunkCount === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyIcon}>📚</Text>
          <Text style={styles.emptyTitle}>Henüz çalışılabilir kaynak metni yok</Text>
          <Text style={styles.emptyText}>
            Not, metin dosyası veya metin katmanı olan PDF ekle. PDF okunursa içerik otomatik parçalanıp bu stüdyoya gelir.
          </Text>
          <TouchableOpacity style={styles.primaryButton} onPress={() => router.push(resourceRoute)}>
            <Text style={styles.primaryButtonText}>Kaynak ekle</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <View style={styles.modeRow}>
            <ModeButton active={mode === 'guide'} label="🧭 Özet" onPress={() => setMode('guide')} />
            <ModeButton active={mode === 'cards'} label={`🗂️ Kartlar ${study.flashcards.length}`} onPress={() => setMode('cards')} />
            <ModeButton active={mode === 'quiz'} label={`❓ Quiz ${study.questions.length}`} onPress={() => setMode('quiz')} />
          </View>

          {mode === 'guide' ? (
            <View style={styles.sectionCard}>
              <Text style={styles.sectionEyebrow}>ÇALIŞMA REHBERİ</Text>
              <Text style={styles.sectionTitle}>Kaynaklardan öne çıkanlar</Text>
              <Text style={styles.sectionText}>
                Ana cümleler kaynak metnindeki tekrar ve içerik yoğunluğuna göre seçilir; dışarıdan bilgi eklenmez.
              </Text>
              {study.keyPoints.map((point, index) => (
                <View key={`${point.citation.sourceId}-${index}`} style={styles.pointRow}>
                  <View style={styles.pointNumber}><Text style={styles.pointNumberText}>{index + 1}</Text></View>
                  <View style={styles.pointBody}>
                    <Text style={styles.pointText}>{point.text}</Text>
                    <Text style={styles.citationLabel}>↳ {point.citation.sourceTitle}{point.citation.topicName ? ` · ${point.citation.topicName}` : ''}</Text>
                  </View>
                </View>
              ))}
            </View>
          ) : null}

          {mode === 'cards' ? (
            <View style={styles.cardList}>
              {study.flashcards.length === 0 ? (
                <View style={styles.emptyCard}><Text style={styles.emptyText}>Kart üretmek için kaynakta biraz daha açıklayıcı metin gerekiyor.</Text></View>
              ) : study.flashcards.map((card) => {
                const revealed = revealedCard === card.id;
                return (
                  <TouchableOpacity
                    key={card.id}
                    activeOpacity={0.88}
                    style={[styles.flashcard, revealed && styles.flashcardRevealed]}
                    onPress={() => setRevealedCard(revealed ? null : card.id)}>
                    <Text style={styles.cardEyebrow}>{revealed ? 'CEVAP' : 'KAYNAKTAN KART'}</Text>
                    <Text style={styles.cardQuestion}>{revealed ? card.back : card.front}</Text>
                    {revealed ? <Text style={styles.cardExcerpt}>{card.citation.excerpt}</Text> : <Text style={styles.tapHint}>Cevabı görmek için dokun</Text>}
                    <Text style={styles.citationLabel}>↳ {card.citation.sourceTitle}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          ) : null}

          {mode === 'quiz' ? (
            <View style={styles.quizList}>
              <View style={styles.quizHeader}>
                <Text style={styles.sectionTitle}>Kaynak Quizi</Text>
                <Text style={styles.quizProgress}>{answeredCount}/{study.questions.length}</Text>
              </View>
              {study.questions.length === 0 ? (
                <View style={styles.emptyCard}><Text style={styles.emptyText}>Soru üretmek için kaynak metninde yeterli ayırt edici kavram bulunamadı.</Text></View>
              ) : study.questions.map((question, questionIndex) => {
                const selected = answers[question.id];
                const answered = selected !== undefined;
                return (
                  <View key={question.id} style={styles.questionCard}>
                    <Text style={styles.questionNumber}>SORU {questionIndex + 1}</Text>
                    <Text style={styles.questionText}>{question.prompt}</Text>
                    <View style={styles.optionList}>
                      {question.options.map((option, optionIndex) => {
                        const isCorrect = optionIndex === question.correctIndex;
                        const isSelected = selected === optionIndex;
                        return (
                          <TouchableOpacity
                            key={`${question.id}-${option}`}
                            disabled={answered}
                            style={[
                              styles.option,
                              answered && isCorrect && styles.optionCorrect,
                              answered && isSelected && !isCorrect && styles.optionWrong,
                            ]}
                            onPress={() => setAnswers((current) => ({ ...current, [question.id]: optionIndex }))}>
                            <Text style={styles.optionText}>{option}</Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                    {answered ? (
                      <View style={styles.answerBox}>
                        <Text style={styles.answerTitle}>{selected === question.correctIndex ? '✓ Doğru' : 'Kaynağa göre doğru cevap yukarıda işaretlendi'}</Text>
                        <Text style={styles.answerText}>{question.explanation}</Text>
                        <Text style={styles.citationLabel}>↳ {question.citation.sourceTitle}</Text>
                      </View>
                    ) : null}
                  </View>
                );
              })}
            </View>
          ) : null}
        </>
      )}
    </ScrollView>
  );
}

function ModeButton({ active, label, onPress }: { active: boolean; label: string; onPress: () => void }) {
  return (
    <TouchableOpacity style={[styles.modeButton, active && styles.modeButtonActive]} onPress={onPress}>
      <Text style={[styles.modeButtonText, active && styles.modeButtonTextActive]}>{label}</Text>
    </TouchableOpacity>
  );
}

function CitationCard({ citation }: { citation: StudyCitation }) {
  return (
    <View style={styles.citationCard}>
      <Text style={styles.citationSource}>📎 {citation.sourceTitle}{citation.topicName ? ` · ${citation.topicName}` : ''}</Text>
      <Text style={styles.citationExcerpt}>{citation.excerpt}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F3FB' },
  content: { padding: 18, paddingBottom: 42 },
  hero: { backgroundColor: '#1D1A34', borderRadius: 24, padding: 21, marginBottom: 12 },
  heroEyebrow: { color: '#FFC145', fontSize: 10, fontWeight: '900', letterSpacing: 1 },
  heroTitle: { color: '#FFFFFF', fontSize: 27, fontWeight: '900', marginTop: 6 },
  heroText: { color: '#D9D5E8', fontSize: 12, lineHeight: 18, marginTop: 7 },
  statsRow: { flexDirection: 'row', gap: 8, marginTop: 16 },
  statBox: { flex: 1, backgroundColor: '#2A2647', borderRadius: 14, padding: 11 },
  statValue: { color: '#FFFFFF', fontSize: 19, fontWeight: '900' },
  statLabel: { color: '#BEB8D6', fontSize: 9, marginTop: 2 },
  searchCard: { backgroundColor: '#DFF6F4', borderRadius: 19, padding: 15, marginBottom: 12 },
  searchEyebrow: { color: '#0E716B', fontSize: 9, fontWeight: '900', letterSpacing: 1 },
  searchTitle: { color: '#1D1A34', fontSize: 16, fontWeight: '900', marginTop: 3 },
  searchText: { color: '#397A76', fontSize: 10, lineHeight: 15, marginTop: 4 },
  searchRow: { flexDirection: 'row', gap: 8, marginTop: 11 },
  searchInput: { flex: 1, height: 44, borderRadius: 12, backgroundColor: '#FFFFFF', paddingHorizontal: 12, color: '#1D1A34', borderWidth: 1, borderColor: '#C7EAE6' },
  searchButton: { borderRadius: 12, backgroundColor: '#0E716B', paddingHorizontal: 15, alignItems: 'center', justifyContent: 'center' },
  searchButtonText: { color: '#FFFFFF', fontWeight: '900', fontSize: 12 },
  citationCard: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 11, marginTop: 8, borderWidth: 1, borderColor: '#C7EAE6' },
  citationSource: { color: '#0E716B', fontSize: 10, fontWeight: '900' },
  citationExcerpt: { color: '#4E4A61', fontSize: 11, lineHeight: 17, marginTop: 4 },
  noMatch: { color: '#397A76', fontSize: 11, marginTop: 9 },
  modeRow: { flexDirection: 'row', gap: 7, marginBottom: 11 },
  modeButton: { flex: 1, backgroundColor: '#FFFFFF', borderRadius: 12, paddingVertical: 10, alignItems: 'center', borderWidth: 1, borderColor: '#E7E3F5' },
  modeButtonActive: { backgroundColor: '#6552D9', borderColor: '#6552D9' },
  modeButtonText: { color: '#6B6684', fontSize: 10, fontWeight: '900' },
  modeButtonTextActive: { color: '#FFFFFF' },
  sectionCard: { backgroundColor: '#FFFFFF', borderRadius: 20, padding: 17, borderWidth: 1, borderColor: '#E7E3F5' },
  sectionEyebrow: { color: '#6552D9', fontSize: 9, fontWeight: '900', letterSpacing: 1 },
  sectionTitle: { color: '#1D1A34', fontSize: 18, fontWeight: '900', marginTop: 3 },
  sectionText: { color: '#6B6684', fontSize: 11, lineHeight: 17, marginTop: 5, marginBottom: 7 },
  pointRow: { flexDirection: 'row', gap: 10, paddingVertical: 10, borderTopWidth: 1, borderTopColor: '#F0EDF7' },
  pointNumber: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#EDE9FF', alignItems: 'center', justifyContent: 'center' },
  pointNumberText: { color: '#6552D9', fontWeight: '900', fontSize: 11 },
  pointBody: { flex: 1 },
  pointText: { color: '#1D1A34', fontSize: 12, lineHeight: 18 },
  citationLabel: { color: '#0E716B', fontSize: 9, fontWeight: '800', marginTop: 5 },
  cardList: { gap: 9 },
  flashcard: { backgroundColor: '#FFFFFF', borderRadius: 18, padding: 17, borderWidth: 1, borderColor: '#E7E3F5', minHeight: 140 },
  flashcardRevealed: { backgroundColor: '#FFF5D8', borderColor: '#F4D782' },
  cardEyebrow: { color: '#6552D9', fontSize: 9, fontWeight: '900', letterSpacing: 1 },
  cardQuestion: { color: '#1D1A34', fontSize: 16, lineHeight: 23, fontWeight: '800', marginTop: 9 },
  cardExcerpt: { color: '#6B6684', fontSize: 11, lineHeight: 17, marginTop: 8 },
  tapHint: { color: '#9A95AD', fontSize: 10, marginTop: 12 },
  quizList: { gap: 10 },
  quizHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  quizProgress: { color: '#6552D9', fontWeight: '900', fontSize: 12 },
  questionCard: { backgroundColor: '#FFFFFF', borderRadius: 19, padding: 16, borderWidth: 1, borderColor: '#E7E3F5' },
  questionNumber: { color: '#6552D9', fontSize: 9, fontWeight: '900', letterSpacing: 1 },
  questionText: { color: '#1D1A34', fontSize: 15, lineHeight: 22, fontWeight: '800', marginTop: 6 },
  optionList: { gap: 7, marginTop: 12 },
  option: { borderRadius: 12, padding: 12, backgroundColor: '#F5F3FB', borderWidth: 1, borderColor: '#E7E3F5' },
  optionCorrect: { backgroundColor: '#DFF6F4', borderColor: '#7ED4CB' },
  optionWrong: { backgroundColor: '#FFE9EF', borderColor: '#F0A7B8' },
  optionText: { color: '#1D1A34', fontSize: 12, fontWeight: '700' },
  answerBox: { backgroundColor: '#F5F3FB', borderRadius: 12, padding: 11, marginTop: 11 },
  answerTitle: { color: '#0E716B', fontSize: 11, fontWeight: '900' },
  answerText: { color: '#6B6684', fontSize: 10, lineHeight: 16, marginTop: 4 },
  emptyCard: { backgroundColor: '#FFFFFF', borderRadius: 20, padding: 20, borderWidth: 1, borderColor: '#E7E3F5', alignItems: 'center' },
  emptyIcon: { fontSize: 42 },
  emptyTitle: { color: '#1D1A34', fontSize: 17, fontWeight: '900', textAlign: 'center', marginTop: 7 },
  emptyText: { color: '#6B6684', fontSize: 12, lineHeight: 18, textAlign: 'center', marginTop: 6 },
  primaryButton: { backgroundColor: '#6552D9', borderRadius: 12, paddingHorizontal: 18, paddingVertical: 11, marginTop: 14 },
  primaryButtonText: { color: '#FFFFFF', fontSize: 12, fontWeight: '900' },
});
