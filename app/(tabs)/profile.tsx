import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { LEVELS } from '@/data/courseCatalog';
import { ensureActiveLearner, updateLearnerProfile, type LearnerProfile } from '@/storage/userStore';

export default function ProfileScreen() {
  const [profile, setProfile] = useState<LearnerProfile | null>(null);
  const [name, setName] = useState('');
  const [levelName, setLevelName] = useState<string | null>(null);
  const [dailyMinutes, setDailyMinutes] = useState(25);
  const [saved, setSaved] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      ensureActiveLearner().then((next) => {
        if (!active) return;
        setProfile(next);
        setName(next.displayName);
        setLevelName(next.levelName);
        setDailyMinutes(next.dailyMinutes);
      });
      return () => {
        active = false;
      };
    }, []),
  );

  const save = async () => {
    const next = await updateLearnerProfile({
      displayName: name,
      levelName,
      dailyMinutes,
    });
    setProfile(next);
    setSaved(true);
    setTimeout(() => setSaved(false), 1800);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>ÖĞRENEN PROFİLİ</Text>
        <Text style={styles.title}>{profile?.displayName || 'Öğrenci'}</Text>
        <Text style={styles.subtitle}>
          Bu profil cihazdaki çalışma geçmişinin sahibi. İleride hesap senkronizasyonuna hazır bir kimlik olarak kullanılacak.
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Ad</Text>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Adın"
          placeholderTextColor="#9B96AE"
          style={styles.input}
          maxLength={40}
        />

        <Text style={[styles.label, styles.spacedLabel]}>Eğitim seviyesi</Text>
        <View style={styles.chips}>
          {LEVELS.map((level) => {
            const active = levelName === level.name;
            return (
              <TouchableOpacity
                key={level.name}
                style={[styles.chip, active && styles.chipActive]}
                onPress={() => setLevelName(level.name)}>
                <Text style={[styles.chipText, active && styles.chipTextActive]}>
                  {level.icon} {level.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={[styles.label, styles.spacedLabel]}>Günlük hedef</Text>
        <View style={styles.minuteRow}>
          {[15, 25, 40, 60].map((minutes) => {
            const active = dailyMinutes === minutes;
            return (
              <TouchableOpacity
                key={minutes}
                style={[styles.minuteButton, active && styles.minuteButtonActive]}
                onPress={() => setDailyMinutes(minutes)}>
                <Text style={[styles.minuteText, active && styles.minuteTextActive]}>{minutes} dk</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <TouchableOpacity style={styles.saveButton} onPress={save}>
          <Text style={styles.saveButtonText}>{saved ? 'Kaydedildi ✓' : 'Profili kaydet'}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>Verin nerede?</Text>
        <Text style={styles.infoText}>
          Profil, quiz geçmişi, tekrar kuyruğu, hedefler ve kaynaklar şu anda cihazdaki Koç SQLite veritabanında tutuluyor.
          Hesap/senkronizasyon katmanı eklendiğinde bu yerel kimlik sunucudaki kullanıcı hesabına bağlanabilecek.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F1F2F6' },
  content: { padding: 18, paddingBottom: 40 },
  header: { backgroundColor: '#111827', borderRadius: 28, padding: 22, marginBottom: 14 },
  eyebrow: { color: '#A7F3D0', fontSize: 10, fontWeight: '900', letterSpacing: 1.2 },
  title: { color: '#FFFFFF', fontSize: 30, fontWeight: '900', marginTop: 7 },
  subtitle: { color: '#C7CFDB', fontSize: 13, lineHeight: 19, marginTop: 8 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 22, padding: 18, borderWidth: 1, borderColor: '#E2E5EC' },
  label: { color: '#111827', fontSize: 12, fontWeight: '900', marginBottom: 7 },
  spacedLabel: { marginTop: 18 },
  input: { backgroundColor: '#F6F7F9', borderRadius: 14, paddingHorizontal: 14, paddingVertical: 13, color: '#111827', fontSize: 15, borderWidth: 1, borderColor: '#E2E5EC' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { backgroundColor: '#F6F7F9', borderRadius: 999, paddingHorizontal: 12, paddingVertical: 9, borderWidth: 1, borderColor: '#E2E5EC' },
  chipActive: { backgroundColor: '#111827', borderColor: '#111827' },
  chipText: { color: '#4B5563', fontSize: 12, fontWeight: '800' },
  chipTextActive: { color: '#FFFFFF' },
  minuteRow: { flexDirection: 'row', gap: 8 },
  minuteButton: { flex: 1, alignItems: 'center', backgroundColor: '#F6F7F9', borderRadius: 12, paddingVertical: 11, borderWidth: 1, borderColor: '#E2E5EC' },
  minuteButtonActive: { backgroundColor: '#D1FAE5', borderColor: '#6EE7B7' },
  minuteText: { color: '#4B5563', fontSize: 11, fontWeight: '900' },
  minuteTextActive: { color: '#065F46' },
  saveButton: { backgroundColor: '#2563EB', borderRadius: 14, paddingVertical: 14, alignItems: 'center', marginTop: 20 },
  saveButtonText: { color: '#FFFFFF', fontWeight: '900', fontSize: 14 },
  infoCard: { backgroundColor: '#E8EEF9', borderRadius: 18, padding: 16, marginTop: 12 },
  infoTitle: { color: '#1E3A8A', fontSize: 13, fontWeight: '900' },
  infoText: { color: '#475569', fontSize: 11, lineHeight: 17, marginTop: 5 },
});
