import { Stack, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { addSource, getSourcesForCourse, removeSource, type LocalSource } from '@/storage/learningStore';

export default function ResourcesScreen() {
  const { levelName, courseName } = useLocalSearchParams<{ levelName: string; courseName: string }>();
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [sources, setSources] = useState<LocalSource[]>([]);
  const [saving, setSaving] = useState(false);

  const reload = async () => {
    if (!levelName || !courseName) return;
    setSources(await getSourcesForCourse(levelName, courseName));
  };

  useEffect(() => {
    reload();
  }, [levelName, courseName]);

  const handleAdd = async () => {
    if (!levelName || !courseName || !title.trim() || !body.trim() || saving) return;
    setSaving(true);
    try {
      await addSource({ levelName, courseName, title: title.trim(), body: body.trim() });
      setTitle('');
      setBody('');
      await reload();
    } finally {
      setSaving(false);
    }
  };

  const handleRemove = (source: LocalSource) => {
    Alert.alert('Kaynağı sil', `“${source.title}” silinsin mi?`, [
      { text: 'Vazgeç', style: 'cancel' },
      {
        text: 'Sil',
        style: 'destructive',
        onPress: async () => {
          await removeSource(source.id);
          await reload();
        },
      },
    ]);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <Stack.Screen options={{ title: `${courseName ?? 'Ders'} · Kaynaklar` }} />

      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>🗂️ Cihaz içi kaynak havuzu</Text>
        <Text style={styles.infoText}>Şimdilik metin/not kaynağı yerel olarak saklanır. Bu katman daha sonra SQLite’a taşınabilecek şekilde ekranlardan ayrıdır.</Text>
      </View>

      <View style={styles.formCard}>
        <Text style={styles.formTitle}>Yeni kaynak ekle</Text>
        <TextInput
          style={styles.titleInput}
          value={title}
          onChangeText={setTitle}
          placeholder="Başlık (örn. Üslü sayılar özeti)"
          placeholderTextColor="#9A95AD"
        />
        <TextInput
          style={styles.bodyInput}
          value={body}
          onChangeText={setBody}
          placeholder="Notu, özeti veya önemli bilgiyi buraya yaz..."
          placeholderTextColor="#9A95AD"
          multiline
          textAlignVertical="top"
        />
        <TouchableOpacity
          style={[styles.saveButton, (!title.trim() || !body.trim() || saving) && styles.disabled]}
          disabled={!title.trim() || !body.trim() || saving}
          onPress={handleAdd}>
          <Text style={styles.saveButtonText}>{saving ? 'Kaydediliyor...' : 'Kaynağı kaydet'}</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>Kayıtlı kaynaklar ({sources.length})</Text>
      {sources.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>Henüz kaynak yok. İlk notunu yukarıdan ekleyebilirsin.</Text>
        </View>
      ) : (
        sources.map((source) => (
          <View key={source.id} style={styles.sourceCard}>
            <View style={styles.sourceHeader}>
              <Text style={styles.sourceTitle}>{source.title}</Text>
              <TouchableOpacity onPress={() => handleRemove(source)}>
                <Text style={styles.deleteText}>Sil</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.sourceBody}>{source.body}</Text>
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
  bodyInput: { backgroundColor: '#F5F3FB', borderRadius: 12, padding: 13, minHeight: 130, borderWidth: 1, borderColor: '#E7E3F5', color: '#1D1A34', marginTop: 10 },
  saveButton: { backgroundColor: '#1D1A34', borderRadius: 12, padding: 13, alignItems: 'center', marginTop: 11 },
  saveButtonText: { color: '#FFFFFF', fontWeight: '800', fontSize: 13 },
  disabled: { opacity: 0.45 },
  sectionTitle: { color: '#1D1A34', fontSize: 17, fontWeight: '800', marginTop: 24, marginBottom: 10 },
  emptyCard: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#E7E3F5' },
  emptyText: { color: '#6B6684', fontSize: 12, lineHeight: 18 },
  sourceCard: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 15, borderWidth: 1, borderColor: '#E7E3F5', marginBottom: 9 },
  sourceHeader: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  sourceTitle: { flex: 1, color: '#1D1A34', fontSize: 14, fontWeight: '800' },
  deleteText: { color: '#D9485F', fontSize: 12, fontWeight: '700' },
  sourceBody: { color: '#6B6684', fontSize: 12, lineHeight: 18, marginTop: 7 },
  sourceDate: { color: '#9A95AD', fontSize: 10, marginTop: 10 },
});
