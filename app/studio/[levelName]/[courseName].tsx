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
  quality: {
    kind: 'unknown',
    label: 'Kaynak bekleniyor',
    score: 0,
    nativeQuestionCount: 0,
    gradedQuestionCount: 0,
    note: '',
  },
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
  const [revealedQuestions, setRevealedQuestions] = useState<Record<string, boolean>>({});
  const [query, setQuery] = useState('');
  const [matches, setMatches] = useState<StudyCitation[]>([]);
  const [searching, setSearching] = useState(false);

  const reload = useCallback(async () => {
    if (!levelName || !courseName) return;
    setLoading(true);
    try {
      const next = await buildSourceStudy(levelName, courseName, topicName);
      setStudy(next);
      setAnswers({});
      setRevealedQuestions({});
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

  const completedQuestionCount = useMemo(
    () => Object.keys(answers).length + Object.values(revealedQuestions).filter(Boolean).length,
    [answers, revealedQuestions],
  );

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
        <Text style={styles.heroEyebrow}>KAYNAK STÜDYOSU · KAYNAĞA BAĞLI</Text>
        <Text style={styles.heroTitle}>Kaynağından çalış</Text>
        <Text style={styles.heroText}>
          {topicName ? `${topicName} · ` : ''}Koç önce kaynak türünü algılar; güvenemediği doğru cevabı veya seçeneği uydurmaz.
        </Text>
        <View style={styles.statsRow}>
          <Stat value={study.sourceCount} label="kaynak" />
          <Stat value={study.chunkCount} label="metin parçası" />
          <Stat value={study.questions.length} label="güvenli soru" />
        </View>
      </View>

      {!loading && study.chunkCount > 0 ? (
        <View style={styles.qualityCard}>
          <View style={styles.qualityTop}>
            <View>
              <Text style={styles.qualityEyebrow}>KAYNAK ANALİZİ</Text>
              <Text style={styles.qualityTitle}>{study.quality.label}</Text>
            </View>
            <View style={styles.qualityScore}>
              <Text style={styles.qualityScoreValue}>{study.quality.score}</Text>
              <Text style={styles.qualityScoreLabel}>güven</Text>
            </View>
          </View>
          <Text style={styles.qualityText}>{study.quality.note}</Text>
          {study.quality.nativeQuestionCount > 0 ? (
            <View style={styles.qualityMetaRow}>
              <Text style={styles.qualityMeta}>📄 {study.quality.nativeQuestionCount} gerçek soru algılandı</Text>
              <Text style={styles.qualityMeta}>✓ {study.quality.gradedQuestionCount} cevap anahtarlı</Text>
            </View>
          ) : null}
        </View>
      ) : null}

      <View style={styles.searchCard}>
        <Text style={styles.searchEyebrow}>KAYNAKLARA SOR</Text>
        <Text style={styles.searchTitle}>İlgili pasajları bul</Text>
        <Text style={styles.searchText}>Arama sonucu doğrudan cihazdaki gerçek kaynak parçalarından gelir.</Text>
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
        {matches.map((match, index) => <CitationCard key={`${match.sourceId}-${index}`} citation={match} />)}
        {query.trim() && !searching && matches.length === 0 ? (
          <Text style={styles.noMatch}>Bu ifadeyle eşleşen kaynak pasajı bulunamadı.</Text>
        ) : null}
      </View>

      {loading ? (
        <View style={styles.emptyCard}><Text style={styles.emptyTitle}>Kaynaklar analiz ediliyor...</Text></View>
      ) : study.chunkCount === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyIcon}>📚</Text>
          <Text style={styles.emptyTitle}>Henüz çalışılabilir kaynak metni yok</Text>
          <Text style={styles.emptyText}>Not, metin dosyası veya metin katmanı olan PDF ekle.</Text>
          <TouchableOpacity style={styles.primaryButton} onPress={() => router.push(resourceRoute)}>
            <Text style={styles.primaryButtonText}>Kaynak ekle</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <View style={styles.modeRow}>
            <ModeButton active={mode === 'guide'} label="🧭 Özet" onPress={() => setMode('guide')} />
            <ModeButton active={mode === 'cards'} label={`🗂️ Kart ${study.flashcards.length}`} onPress={() => setMode('cards')} />
            <ModeButton active={mode === 'quiz'} label={`❓ Soru ${study.questions.length}`} onPress={() => setMode('quiz')} />
          </View>

          {mode === 'guide' ? (
            <View style={styles.sectionCard}>
              <Text style={styles.sectionEyebrow}>ÇALIŞMA REHBERİ</Text>
              <Text style={styles.sectionTitle}>Kaynaklardan güvenilir parçalar</Text>
              <Text style={styles.sectionText}>Soru kökleri, cevap anahtarı ve yayın mizanpajı özet cümlesi gibi kullanılmaz.</Text>
              {study.keyPoints.length === 0 ? (
                <Text style={styles.emptyText}>{study.quality.note}</Text>
              ) : study.keyPoints.map((point, index) => (
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
                <View style={styles.emptyCard}>
                  <Text style={styles.emptyTitle}>Zorla kart üretmedim</Text>
                  <Text style={styles.emptyText}>Bu kaynakta güvenilir tanım/açıklama cümlesi yeterli değil. Rastgele kelime silmek yerine kart üretimi atlandı.</Text>
                </View>
              ) : study.flashcards.map((card) => {
                const revealed = revealedCard === card.id;
                return (
                  <TouchableOpacity
                    key={card.id}
                    activeOpacity={0.88}
                    style={[styles.flashcard, revealed && styles.flashcardRevealed]}
                    onPress={() => setRevealedCard(revealed ? null : card.id)}>
                    <Text style={styles.cardEyebrow}>{revealed ? 'KAYNAK CEVABI' : 'KAVRAM KARTI'}</Text>
                    <Text style={styles.cardQuestion}>{revealed ? card.back : card.front}</Text>
                    <Text style={styles.tapHint}>{revealed ? 'Kart kaynağın açıklama cümlesinden üretildi.' : 'Cevabı görmek için dokun'}</Text>
                    <Text style={styles.citationLabel}>↳ {card.citation.sourceTitle}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          ) : null}

          {mode === 'quiz' ? (
            <View style={styles.quizList}>
              <View style={styles.quizHeader}>
                <View>
                  <Text style={styles.sectionTitle}>Kaynak Soruları</Text>
                  <Text style={styles.sectionText}>Gerçek soru korunur; cevap bilinmiyorsa doğru şık uydurulmaz.</Text>
                </View>
                <Text style={styles.quizProgress}>{completedQuestionCount}/{study.questions.length}</Text>
              </View>
              {study.questions.length === 0 ? (
                <View style={styles.emptyCard}>
                  <Text style={styles.emptyTitle}>Güvenilir soru çıkarılamadı</Text>
                  <Text style={styles.emptyText}>Kaynak metni var ancak soru yapısı yeterince güvenilir değil. AI üretim katmanı devreye alındığında bu kaynak grounding olarak kullanılacak.</Text>
                </View>
              ) : study.questions.map((question, questionIndex) => {
                const selected = answers[question.id];
                const answered = selected !== undefined;
                const revealed = revealedQuestions[question.id] === true;
                const graded = question.mode === 'graded' && question.correctIndex !== null;
                return (
                  <View key={question.id} style={styles.questionCard}>
                    <View style={styles.questionTopRow}>
                      <Text style={styles.questionNumber}>SORU {questionIndex + 1}{question.sourceQuestionNumber ? ` · PDF #${question.sourceQuestionNumber}` : ''}</Text>
                      <Text style={[styles.modeBadge, graded ? styles.gradedBadge : styles.selfBadge]}>{graded ? 'CEVAP ANAHTARLI' : 'ÖZ KONTROL'}</Text>
                    </View>
                    <Text style={styles.questionText}>{question.prompt}</Text>

                    {question.options.length > 0 ? (
                      <View style={styles.optionList}>
                        {question.options.map((option, optionIndex) => {
                          const isCorrect = graded && optionIndex === question.correctIndex;
                          const isSelected = selected === optionIndex;
                          return (
                            <TouchableOpacity
                              key={`${question.id}-${optionIndex}`}
                              disabled={!graded || answered}
                              style={[
                                styles.option,
                                !graded && styles.optionReadOnly,
                                answered && isCorrect && styles.optionCorrect,
                                answered && isSelected && !isCorrect && styles.optionWrong,
                              ]}
                              onPress={() => graded && setAnswers((current) => ({ ...current, [question.id]: optionIndex }))}>
                              <Text style={styles.optionLetter}>{String.fromCharCode(65 + optionIndex)}</Text>
                              <Text style={styles.optionText}>{option}</Text>
                            </TouchableOpacity>
                          );
                        })}
                      </View>
                    ) : null}

                    {graded && answered ? (
                      <View style={styles.answerBox}>
                        <Text style={styles.answerTitle}>{selected === question.correctIndex ? '✓ Doğru' : 'Doğru cevap kaynak anahtarına göre işaretlendi'}</Text>
                        <Text style={styles.answerText}>{question.explanation}</Text>
                        <Text style={styles.citationLabel}>↳ {question.citation.sourceTitle}</Text>
                      </View>
                    ) : !graded ? (
                      <>
                        <TouchableOpacity
                          style={styles.revealButton}
                          onPress={() => setRevealedQuestions((current) => ({ ...current, [question.id]: !revealed }))}>
                          <Text style={styles.revealButtonText}>{revealed ? 'Kaynak kontrolünü gizle' : 'Kaynak kontrolünü göster'}</Text>
                        </TouchableOpacity>
                        {revealed ? (
                          <View style={styles.answerBox}>
                            <Text style={styles.answerTitle}>Kaynak kontrolü</Text>
                            <Text style={styles.answerText}>{question.explanation}</Text>
                            <Text style={styles.cardExcerpt}>{question.citation.excerpt}</Text>
                            <Text style={styles.citationLabel}>↳ {question.citation.sourceTitle}</Text>
                          </View>
                        ) : null}
                      </>
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

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <View style={styles.statBox}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
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
  content: { padding: 18, paddingBottom: 46 },
  hero: { backgroundColor: '#1D1A34', borderRadius: 24, padding: 21, marginBottom: 12 },
  heroEyebrow: { color: '#FFC145', fontSize: 10, fontWeight: '900', letterSpacing: 1 },
  heroTitle: { color: '#FFFFFF', fontSize: 27, fontWeight: '900', marginTop: 6 },
  heroText: { color: '#D9D5E8', fontSize: 12, lineHeight: 18, marginTop: 7 },
  statsRow: { flexDirection: 'row', gap: 8, marginTop: 16 },
  statBox: { flex: 1, backgroundColor: '#2A2647', borderRadius: 14, padding: 11 },
  statValue: { color: '#FFFFFF', fontSize: 19, fontWeight: '900' },
  statLabel: { color: '#BEB8D6', fontSize: 9, marginTop: 2 },
  qualityCard: { backgroundColor: '#FFF7D6', borderRadius: 19, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#F1DEA1' },
  qualityTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  qualityEyebrow: { color: '#8A5A00', fontSize: 9, fontWeight: '900', letterSpacing: 1 },
  qualityTitle: { color: '#342A16', fontSize: 18, fontWeight: '900', marginTop: 2 },
  qualityText: { color: '#6B5730', fontSize: 11, lineHeight: 17, marginTop: 8 },
  qualityScore: { minWidth: 54, backgroundColor: '#FFFFFF', borderRadius: 13, padding: 8, alignItems: 'center' },
  qualityScoreValue: { color: '#8A5A00', fontSize: 18, fontWeight: '900' },
  qualityScoreLabel: { color: '#8A734B', fontSize: 8, fontWeight: '800' },
  qualityMetaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 },
  qualityMeta: { color: '#6B5730', fontSize: 10, fontWeight: '800', backgroundColor: '#FFFDF5', paddingHorizontal: 9, paddingVertical: 6, borderRadius: 10 },
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
  modeButton: { flex: 1, backgroundColor: '#FFFFFF', borderRadius: 12, paddingVertical: 11, alignItems: 'center', borderWidth: 1, borderColor: '#E7E3F5' },
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
  pointText: { color: '#29243F', fontSize: 12, lineHeight: 18, fontWeight: '700' },
  citationLabel: { color: '#0E716B', fontSize: 9, fontWeight: '800', marginTop: 6 },
  cardList: { gap: 10 },
  flashcard: { backgroundColor: '#FFFFFF', borderRadius: 20, padding: 18, borderWidth: 1, borderColor: '#E7E3F5' },
  flashcardRevealed: { backgroundColor: '#F1EEFF', borderColor: '#CFC7FF' },
  cardEyebrow: { color: '#6552D9', fontSize: 9, fontWeight: '900', letterSpacing: 1 },
  cardQuestion: { color: '#1D1A34', fontSize: 16, lineHeight: 23, fontWeight: '900', marginTop: 8 },
  cardExcerpt: { color: '#57516F', fontSize: 10, lineHeight: 16, marginTop: 8 },
  tapHint: { color: '#9A95AD', fontSize: 10, marginTop: 10 },
  quizList: { gap: 12 },
  quizHeader: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 },
  quizProgress: { color: '#6552D9', fontWeight: '900', fontSize: 12, backgroundColor: '#EDE9FF', borderRadius: 10, paddingHorizontal: 9, paddingVertical: 6 },
  questionCard: { backgroundColor: '#FFFFFF', borderRadius: 20, padding: 17, borderWidth: 1, borderColor: '#E7E3F5' },
  questionTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  questionNumber: { color: '#6552D9', fontSize: 9, fontWeight: '900', letterSpacing: 1, flex: 1 },
  modeBadge: { fontSize: 8, fontWeight: '900', borderRadius: 8, paddingHorizontal: 7, paddingVertical: 5, overflow: 'hidden' },
  gradedBadge: { backgroundColor: '#DDF7E8', color: '#16734A' },
  selfBadge: { backgroundColor: '#FFF1D6', color: '#8A5A00' },
  questionText: { color: '#1D1A34', fontSize: 16, lineHeight: 23, fontWeight: '900', marginTop: 10 },
  optionList: { gap: 7, marginTop: 12 },
  option: { flexDirection: 'row', alignItems: 'center', gap: 9, backgroundColor: '#F7F5FC', borderWidth: 1, borderColor: '#E5E1EF', borderRadius: 13, padding: 12 },
  optionReadOnly: { backgroundColor: '#FAF9FD' },
  optionCorrect: { backgroundColor: '#E4F8EC', borderColor: '#75CA98' },
  optionWrong: { backgroundColor: '#FFE9EC', borderColor: '#E79AA5' },
  optionLetter: { width: 24, height: 24, textAlign: 'center', textAlignVertical: 'center', borderRadius: 12, backgroundColor: '#EDE9FF', color: '#6552D9', fontSize: 10, fontWeight: '900' },
  optionText: { flex: 1, color: '#312B47', fontSize: 12, lineHeight: 18, fontWeight: '700' },
  answerBox: { backgroundColor: '#EDF8F6', borderRadius: 13, padding: 12, marginTop: 10 },
  answerTitle: { color: '#0E716B', fontSize: 11, fontWeight: '900' },
  answerText: { color: '#3F645F', fontSize: 10, lineHeight: 16, marginTop: 4 },
  revealButton: { backgroundColor: '#1D1A34', borderRadius: 12, paddingVertical: 11, alignItems: 'center', marginTop: 11 },
  revealButtonText: { color: '#FFFFFF', fontSize: 11, fontWeight: '900' },
  emptyCard: { backgroundColor: '#FFFFFF', borderRadius: 19, padding: 17, borderWidth: 1, borderColor: '#E7E3F5' },
  emptyIcon: { fontSize: 28 },
  emptyTitle: { color: '#1D1A34', fontSize: 16, fontWeight: '900' },
  emptyText: { color: '#6B6684', fontSize: 11, lineHeight: 17, marginTop: 5 },
  primaryButton: { backgroundColor: '#6552D9', borderRadius: 12, paddingVertical: 12, alignItems: 'center', marginTop: 13 },
  primaryButtonText: { color: '#FFFFFF', fontSize: 12, fontWeight: '900' },
});
