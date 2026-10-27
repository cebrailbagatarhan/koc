import { Stack, router, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { getTopicsForCatalogCourse } from '@/data/topicCatalog';
import {
  deletePersistedLearningFile,
  formatFileSize,
  pickAndPersistLearningFile,
} from '@/services/sourceIngestion';
import {
  addSource,
  getTopicsForCourse,
  removeSource,
  searchSourcesForCourse,
  type LocalSource,
} from '@/storage/learningStore';

const ALL_TOPICS = '__all__';

export default function ResourcesScreen() {
  const { levelName, courseName, topicName: routeTopicName } = useLocalSearchParams<{
    levelName: string;
    courseName: string;
    topicName?: string;
  }>();
  const catalogTopics = useMemo(
    () => getTopicsForCatalogCourse(levelName, courseName),
    [courseName, levelName],
  );
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [topicName, setTopicName] = useState(routeTopicName ?? '');
  const [query, setQuery] = useState('');
  const [selectedTopic, setSelectedTopic] = useState(routeTopicName ?? ALL_TOPICS);
  const [topics, setTopics] = useState<string[]>(catalogTopics.map((topic) => topic.name));
  const [sources, setSources] = useState<LocalSource[]>([]);
  const [saving, setSaving] = useState(false);
  const [importingFile, setImportingFile] = useState(false);

  useEffect(() => {
    if (!routeTopicName) return;
    setTopicName(routeTopicName);
    setSelectedTopic(routeTopicName);
  }, [routeTopicName]);

  const reload = useCallback(async () => {
    if (!levelName || !courseName) return;
    const [nextSources, storedTopics] = await Promise.all([
      searchSourcesForCourse(
        levelName,
        courseName,
        query,
        selectedTopic === ALL_TOPICS ? null : selectedTopic,
      ),
      getTopicsForCourse(levelName, courseName),
    ]);
    setSources(nextSources);
    setTopics(Array.from(new Set([...catalogTopics.map((topic) => topic.name), ...storedTopics])));
  }, [catalogTopics, courseName, levelName, query, selectedTopic]);

  useEffect(() => {
    const timeout = setTimeout(reload, 180);
    return () => clearTimeout(timeout);
  }, [reload]);

  const clearForm = () => {
    setTitle('');
    setBody('');
  };

  const selectTopicForNewSource = (nextTopic: string) => {
    setTopicName(nextTopic);
    setSelectedTopic(nextTopic);
  };

  const openStudio = () => {
    if (!levelName || !courseName) return;
    router.push({
      pathname: '/studio/[levelName]/[courseName]',
      params: {
        levelName,
        courseName,
        ...(selectedTopic !== ALL_TOPICS ? { topicName: selectedTopic } : {}),
      },
    });
  };

  const handleAddNote = async () => {
    if (!levelName || !courseName || !title.trim() || !body.trim() || saving) return;
    setSaving(true);
    try {
      await addSource({
        levelName,
        courseName,
        topicName,
        kind: 'note',
        title: title.trim(),
        body: body.trim(),
      });
      clearForm();
      await reload();
    } finally {
      setSaving(false);
    }
  };

  const handleAddFile = async () => {
    if (!levelName || !courseName || importingFile) return;
    setImportingFile(true);
    let persistedFileUri: string | null = null;

    try {
      const picked = await pickAndPersistLearningFile();
      if (!picked) return;
      persistedFileUri = picked.fileUri;

      const description = body.trim() || (
        picked.extractedText
          ? `${picked.extractedText.slice(0, 650)}${picked.extractedText.length > 650 ? '…' : ''}`
          : 'Cihazda saklanan dosya kaynağı.'
      );

      await addSource({
        levelName,
        courseName,
        topicName,
        kind: 'file',
        title: title.trim() || picked.fileName,
        body: description,
        fileUri: picked.fileUri,
        fileName: picked.fileName,
        mimeType: picked.mimeType,
        fileSize: picked.fileSize,
        searchContent: [body.trim(), picked.extractedText].filter(Boolean).join('\n\n'),
      });

      clearForm();
      await reload();

      if (picked.textExtractionStatus === 'extracted') {
        Alert.alert(
          'Kaynak hazır',
          `Dosya cihazda saklandı ve ${picked.extractedText.length.toLocaleString('tr-TR')} karakter metin çıkarılıp indekslendi. Artık Kaynak Stüdyosu bu içerikten özet, kart ve quiz hazırlayabilir.`,
        );
      } else if (picked.textExtractionStatus === 'image-only') {
        Alert.alert(
          'PDF saklandı, metin katmanı yok',
          'Bu PDF büyük olasılıkla taranmış görüntülerden oluşuyor. Dosya saklandı ancak içerikten çalışma üretmek için OCR gerekir.',
        );
      } else if (picked.textExtractionStatus === 'not-supported') {
        Alert.alert(
          'Dosya eklendi',
          'Dosya cihazda saklandı. Bu dosya türünde metin çıkarımı yok; arama başlık, konu ve eklediğin not üzerinden çalışacak.',
        );
      } else if (picked.textExtractionStatus === 'too-large') {
        Alert.alert(
          'Dosya eklendi',
          'Dosya saklandı ancak güvenli bellek sınırını aşmamak için metni indekslenmedi.',
        );
      } else if (picked.textExtractionStatus === 'failed') {
        Alert.alert(
          'Dosya saklandı',
          'Metin çıkarımı başarısız oldu. Dosya kaybolmadı; başlık, konu ve not alanı kullanılabilir.',
        );
      }
      persistedFileUri = null;
    } catch (error) {
      if (persistedFileUri) deletePersistedLearningFile(persistedFileUri);
      Alert.alert(
        'Dosya eklenemedi',
        error instanceof Error ? error.message : 'Kaynak dosyası eklenirken bir hata oluştu.',
      );
    } finally {
      setImportingFile(false);
    }
  };

  const handleRemove = (source: LocalSource) => {
    Alert.alert('Kaynağı sil', `“${source.title}” silinsin mi?`, [
      { text: 'Vazgeç', style: 'cancel' },
      {
        text: 'Sil',
        style: 'destructive',
        onPress: async () => {
          const removed = await removeSource(source.id);
          if (removed?.fileUri) deletePersistedLearningFile(removed.fileUri);
          await reload();
        },
      },
    ]);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <Stack.Screen options={{ title: `${courseName ?? 'Ders'} · Kaynaklar` }} />

      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>🗂️ Konuya bağlı yerel kaynaklar</Text>
        <Text style={styles.infoText}>
          Not ve metin dosyaları doğrudan indekslenir. Metin katmanı olan PDF’lerin içeriği de Android ve iOS’ta cihaz üzerinde çıkarılır; taranmış PDF için OCR gerekir.
        </Text>
      </View>

      <TouchableOpacity style={styles.studioCard} activeOpacity={0.88} onPress={openStudio}>
        <View style={styles.studioBody}>
          <Text style={styles.studioEyebrow}>KAYNAK STÜDYOSU</Text>
          <Text style={styles.studioTitle}>Özet · kart · kaynak quizi</Text>
          <Text style={styles.studioText}>Eklediğin okunabilir içerikten kaynak gösteren çalışma materyali üret.</Text>
        </View>
        <Text style={styles.studioArrow}>→</Text>
      </TouchableOpacity>

      <View style={styles.formCard}>
        <Text style={styles.formTitle}>Kaynak ekle</Text>
        {catalogTopics.length > 0 ? (
          <>
            <Text style={styles.fieldLabel}>Katalogdan konu seç</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.catalogTopicRow}>
              {catalogTopics.map((topic) => (
                <TouchableOpacity
                  key={topic.name}
                  style={[styles.catalogTopicChip, topicName === topic.name && styles.catalogTopicChipActive]}
                  onPress={() => selectTopicForNewSource(topic.name)}>
                  <Text style={styles.catalogTopicIcon}>{topic.icon}</Text>
                  <Text style={[styles.catalogTopicText, topicName === topic.name && styles.catalogTopicTextActive]}>{topic.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </>
        ) : null}
        <TextInput
          style={styles.titleInput}
          value={topicName}
          onChangeText={setTopicName}
          placeholder="Konu adı · istersen özel konu yaz"
          placeholderTextColor="#9A95AD"
        />
        <TextInput
          style={[styles.titleInput, styles.inputSpacing]}
          value={title}
          onChangeText={setTitle}
          placeholder="Başlık · dosyada boş bırakabilirsin"
          placeholderTextColor="#9A95AD"
        />
        <TextInput
          style={styles.bodyInput}
          value={body}
          onChangeText={setBody}
          placeholder="Not, özet veya dosya hakkında açıklama..."
          placeholderTextColor="#9A95AD"
          multiline
          textAlignVertical="top"
        />

        <View style={styles.actionRow}>
          <TouchableOpacity
            style={[styles.noteButton, (!title.trim() || !body.trim() || saving) && styles.disabled]}
            disabled={!title.trim() || !body.trim() || saving}
            onPress={handleAddNote}>
            <Text style={styles.noteButtonText}>{saving ? 'Kaydediliyor...' : '📝 Notu kaydet'}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.fileButton, importingFile && styles.disabled]}
            disabled={importingFile}
            onPress={handleAddFile}>
            <Text style={styles.fileButtonText}>{importingFile ? 'Okunuyor...' : '📎 PDF / dosya ekle'}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Kaynaklarda ara</Text>
      <TextInput
        style={styles.searchInput}
        value={query}
        onChangeText={setQuery}
        placeholder="Başlık, konu veya dosya içeriği ara..."
        placeholderTextColor="#9A95AD"
        autoCorrect={false}
      />

      {topics.length > 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.topicRow}>
          <TouchableOpacity
            style={[styles.topicChip, selectedTopic === ALL_TOPICS && styles.topicChipActive]}
            onPress={() => setSelectedTopic(ALL_TOPICS)}>
            <Text style={[styles.topicChipText, selectedTopic === ALL_TOPICS && styles.topicChipTextActive]}>Tümü</Text>
          </TouchableOpacity>
          {topics.map((topic) => (
            <TouchableOpacity
              key={topic}
              style={[styles.topicChip, selectedTopic === topic && styles.topicChipActive]}
              onPress={() => setSelectedTopic(topic)}>
              <Text style={[styles.topicChipText, selectedTopic === topic && styles.topicChipTextActive]}>{topic}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      <View style={styles.listHeader}>
        <Text style={styles.sectionTitleNoMargin}>Kayıtlı kaynaklar</Text>
        <Text style={styles.countText}>{sources.length} sonuç</Text>
      </View>

      {sources.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>
            {query.trim() || selectedTopic !== ALL_TOPICS
              ? 'Bu arama veya konu için kaynak bulunamadı.'
              : 'Henüz kaynak yok. İlk notunu veya dosyanı yukarıdan ekleyebilirsin.'}
          </Text>
        </View>
      ) : (
        sources.map((source) => (
          <View key={source.id} style={styles.sourceCard}>
            <View style={styles.sourceHeader}>
              <View style={styles.sourceTitleArea}>
                <Text style={styles.kindBadge}>{source.kind === 'file' ? 'DOSYA' : 'NOT'}</Text>
                <Text style={styles.sourceTitle}>{source.title}</Text>
              </View>
              <TouchableOpacity onPress={() => handleRemove(source)}>
                <Text style={styles.deleteText}>Sil</Text>
              </TouchableOpacity>
            </View>

            {source.topicName && <Text style={styles.topicLabel}># {source.topicName}</Text>}
            <Text style={styles.sourceBody} numberOfLines={7}>{source.body}</Text>

            {source.kind === 'file' && (
              <View style={styles.fileMetaCard}>
                <Text style={styles.fileMetaTitle}>📄 {source.fileName ?? source.title}</Text>
                <Text style={styles.fileMetaText}>
                  {[source.mimeType, formatFileSize(source.fileSize)].filter(Boolean).join(' · ')}
                </Text>
              </View>
            )}

            <Text style={styles.sourceDate}>{new Date(source.createdAt).toLocaleDateString('tr-TR')}</Text>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F3FB' },
  content: { padding: 18, paddingBottom: 36 },
  infoCard: { backgroundColor: '#DFF6F4', borderRadius: 18, padding: 16, marginBottom: 10 },
  infoTitle: { color: '#0E716B', fontWeight: '800', fontSize: 14 },
  infoText: { color: '#397A76', fontSize: 12, lineHeight: 18, marginTop: 5 },
  studioCard: { backgroundColor: '#1D1A34', borderRadius: 18, padding: 15, marginBottom: 14, flexDirection: 'row', alignItems: 'center' },
  studioBody: { flex: 1 },
  studioEyebrow: { color: '#FFC145', fontSize: 9, fontWeight: '900', letterSpacing: 1 },
  studioTitle: { color: '#FFFFFF', fontSize: 15, fontWeight: '900', marginTop: 3 },
  studioText: { color: '#D9D5E8', fontSize: 10, lineHeight: 15, marginTop: 3 },
  studioArrow: { color: '#FFC145', fontSize: 23, fontWeight: '900', marginLeft: 8 },
  formCard: { backgroundColor: '#FFFFFF', borderRadius: 20, padding: 17, borderWidth: 1, borderColor: '#E7E3F5' },
  formTitle: { color: '#1D1A34', fontSize: 17, fontWeight: '800', marginBottom: 12 },
  fieldLabel: { color: '#6B6684', fontSize: 10, fontWeight: '800', marginBottom: 7 },
  catalogTopicRow: { gap: 7, paddingRight: 10, paddingBottom: 11 },
  catalogTopicChip: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 8, borderRadius: 999, backgroundColor: '#F5F3FB', borderWidth: 1, borderColor: '#E7E3F5' },
  catalogTopicChipActive: { backgroundColor: '#EDE9FF', borderColor: '#6552D9' },
  catalogTopicIcon: { fontSize: 12 },
  catalogTopicText: { color: '#6B6684', fontSize: 10, fontWeight: '700' },
  catalogTopicTextActive: { color: '#4A38B7' },
  titleInput: { backgroundColor: '#F5F3FB', borderRadius: 12, paddingHorizontal: 13, height: 46, borderWidth: 1, borderColor: '#E7E3F5', color: '#1D1A34' },
  inputSpacing: { marginTop: 10 },
  bodyInput: { backgroundColor: '#F5F3FB', borderRadius: 12, padding: 13, minHeight: 115, borderWidth: 1, borderColor: '#E7E3F5', color: '#1D1A34', marginTop: 10 },
  actionRow: { flexDirection: 'row', gap: 9, marginTop: 11 },
  noteButton: { flex: 1, backgroundColor: '#1D1A34', borderRadius: 12, padding: 13, alignItems: 'center', justifyContent: 'center' },
  noteButtonText: { color: '#FFFFFF', fontWeight: '800', fontSize: 12 },
  fileButton: { flex: 1, backgroundColor: '#6552D9', borderRadius: 12, padding: 13, alignItems: 'center', justifyContent: 'center' },
  fileButtonText: { color: '#FFFFFF', fontWeight: '800', fontSize: 12, textAlign: 'center' },
  disabled: { opacity: 0.45 },
  sectionTitle: { color: '#1D1A34', fontSize: 17, fontWeight: '800', marginTop: 24, marginBottom: 10 },
  sectionTitleNoMargin: { color: '#1D1A34', fontSize: 17, fontWeight: '800' },
  searchInput: { backgroundColor: '#FFFFFF', borderRadius: 14, paddingHorizontal: 14, height: 48, borderWidth: 1, borderColor: '#E7E3F5', color: '#1D1A34' },
  topicRow: { gap: 8, paddingVertical: 11, paddingRight: 12 },
  topicChip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E7E3F5' },
  topicChipActive: { backgroundColor: '#1D1A34', borderColor: '#1D1A34' },
  topicChipText: { color: '#6B6684', fontSize: 11, fontWeight: '700' },
  topicChipTextActive: { color: '#FFFFFF' },
  listHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 16, marginBottom: 10 },
  countText: { color: '#9A95AD', fontSize: 11, fontWeight: '700' },
  emptyCard: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#E7E3F5' },
  emptyText: { color: '#6B6684', fontSize: 12, lineHeight: 18 },
  sourceCard: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 15, borderWidth: 1, borderColor: '#E7E3F5', marginBottom: 9 },
  sourceHeader: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  sourceTitleArea: { flex: 1 },
  kindBadge: { color: '#6552D9', fontSize: 9, fontWeight: '900', letterSpacing: 0.8, marginBottom: 3 },
  sourceTitle: { color: '#1D1A34', fontSize: 14, fontWeight: '800' },
  deleteText: { color: '#D9485F', fontSize: 12, fontWeight: '700' },
  topicLabel: { color: '#0E716B', fontSize: 11, fontWeight: '700', marginTop: 7 },
  sourceBody: { color: '#6B6684', fontSize: 12, lineHeight: 18, marginTop: 7 },
  fileMetaCard: { backgroundColor: '#F5F3FB', borderRadius: 11, padding: 10, marginTop: 10 },
  fileMetaTitle: { color: '#1D1A34', fontSize: 11, fontWeight: '700' },
  fileMetaText: { color: '#8A849F', fontSize: 10, marginTop: 3 },
  sourceDate: { color: '#9A95AD', fontSize: 10, marginTop: 10 },
});
