import { Stack, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

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
  const { levelName, courseName } = useLocalSearchParams<{ levelName: string; courseName: string }>();
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [topicName, setTopicName] = useState('');
  const [query, setQuery] = useState('');
  const [selectedTopic, setSelectedTopic] = useState(ALL_TOPICS);
  const [topics, setTopics] = useState<string[]>([]);
  const [sources, setSources] = useState<LocalSource[]>([]);
  const [saving, setSaving] = useState(false);
  const [importingFile, setImportingFile] = useState(false);

  const reload = useCallback(async () => {
    if (!levelName || !courseName) return;
    const [nextSources, nextTopics] = await Promise.all([
      searchSourcesForCourse(
        levelName,
        courseName,
        query,
        selectedTopic === ALL_TOPICS ? null : selectedTopic,
      ),
      getTopicsForCourse(levelName, courseName),
    ]);
    setSources(nextSources);
    setTopics(nextTopics);
  }, [courseName, levelName, query, selectedTopic]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      reload();
    }, 180);
    return () => clearTimeout(timeout);
  }, [reload]);

  const clearForm = () => {
    setTitle('');
    setBody('');
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

      if (picked.textExtractionStatus === 'not-supported') {
        Alert.alert(
          'Dosya eklendi',
          'Dosya cihazda saklandı. Bu dosya türünün metni henüz çıkarılmadığı için arama başlık, konu ve eklediğin not üzerinden çalışacak.',
        );
      } else if (picked.textExtractionStatus === 'too-large') {
        Alert.alert(
          'Dosya eklendi',
          'Dosya saklandı ancak büyük olduğu için içeriği indekslenmedi. Başlık, konu ve not alanı aranabilir.',
        );
      } else if (picked.textExtractionStatus === 'failed') {
        Alert.alert(
          'Dosya eklendi',
          'Dosya saklandı fakat metin içeriği okunamadı. Başlık, konu ve not alanı aranabilir.',
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
        <Text style={styles.infoTitle}>🗂️ Yerel kaynak kütüphanesi v2</Text>
        <Text style={styles.infoText}>
          Kaynaklar SQLite içinde ders ve konuya bağlanır. Metin tabanlı dosyalar parçalara ayrılıp cihazda aranır;
          PDF ve diğer dosyalar cihazın kalıcı alanında saklanır.
        </Text>
      </View>

      <View style={styles.formCard}>
        <Text style={styles.formTitle}>Kaynak ekle</Text>
        <TextInput
          style={styles.titleInput}
          value={topicName}
          onChangeText={setTopicName}
          placeholder="Konu (örn. Üslü sayılar) · isteğe bağlı"
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
            <Text style={styles.fileButtonText}>{importingFile ? 'Ekleniyor...' : '📎 PDF / dosya ekle'}</Text>
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
              ? 'Bu arama için kaynak bulunamadı.'
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
  infoCard: { backgroundColor: '#DFF6F4', borderRadius: 18, padding: 16, marginBottom: 14 },
  infoTitle: { color: '#0E716B', fontWeight: '800', fontSize: 14 },
  infoText: { color: '#397A76', fontSize: 12, lineHeight: 18, marginTop: 5 },
  formCard: { backgroundColor: '#FFFFFF', borderRadius: 20, padding: 17, borderWidth: 1, borderColor: '#E7E3F5' },
  formTitle: { color: '#1D1A34', fontSize: 17, fontWeight: '800', marginBottom: 12 },
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
