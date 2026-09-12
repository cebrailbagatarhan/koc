import { Stack, router } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { LEVELS } from '@/data/courseCatalog';
import {
  clearStudyGoal,
  getActiveGoal,
  getDaysRemaining,
  getGoalPaceLabel,
  saveStudyGoal,
} from '@/storage/goalStore';

function localDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function dateAfter(days: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return localDateKey(date);
}

const minuteOptions = [15, 30, 45, 60];
const dayOptions = [7, 14, 30, 60];

export default function GoalsScreen() {
  const [title, setTitle] = useState('Sınava hazırlan');
  const [targetDate, setTargetDate] = useState(dateAfter(30));
  const [levelName, setLevelName] = useState<string | null>(null);
  const [courseName, setCourseName] = useState<string | null>(null);
  const [dailyMinutes, setDailyMinutes] = useState(30);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getActiveGoal().then((goal) => {
      if (goal) {
        setTitle(goal.title);
        setTargetDate(goal.targetDate);
        setLevelName(goal.levelName);
        setCourseName(goal.courseName);
        setDailyMinutes(goal.dailyMinutes);
      }
      setLoading(false);
    });
  }, []);

  const selectedLevel = useMemo(
    () => LEVELS.find((level) => level.name === levelName),
    [levelName],
  );
  const daysRemaining = getDaysRemaining(targetDate);

  const handleSave = async () => {
    try {
      await saveStudyGoal({ title, targetDate, levelName, courseName, dailyMinutes });
      router.back();
    } catch (error) {
      Alert.alert('Hedef kaydedilemedi', error instanceof Error ? error.message : 'Bilgileri kontrol et.');
    }
  };

  const handleClear = () => {
    Alert.alert('Hedefi kaldır', 'Aktif hedef ve bugünkü hedef planı silinsin mi?', [
      { text: 'Vazgeç', style: 'cancel' },
      {
        text: 'Kaldır',
        style: 'destructive',
        onPress: async () => {
          await clearStudyGoal();
          router.back();
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <Stack.Screen options={{ title: 'Çalışma Hedefi' }} />
        <Text style={styles.loadingText}>Hedef hazırlanıyor...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Stack.Screen options={{ title: 'Çalışma Hedefi' }} />

      <View style={styles.hero}>
        <Text style={styles.eyebrow}>HEDEF ODAKLI KOÇ</Text>
        <Text style={styles.title}>Bir tarih koy, Koç yükü dağıtsın.</Text>
        <Text style={styles.subtitle}>
          Hedef, günlük planın yönünü değiştirir. Seri sayacı ayrı kalır; Koç kalan güne göre tekrar ve konu önceliğini dengeler.
        </Text>
        <View style={styles.heroRow}>
          <Text style={styles.heroMetric}>{daysRemaining}</Text>
          <View>
            <Text style={styles.heroMetricLabel}>gün kaldı</Text>
            <Text style={styles.heroPace}>{getGoalPaceLabel(targetDate)}</Text>
          </View>
        </View>
      </View>

      <Text style={styles.label}>Hedef adı</Text>
      <TextInput
        value={title}
        onChangeText={setTitle}
        placeholder="Örn. ALES 2026"
        placeholderTextColor="#A29DB5"
        style={styles.input}
      />

      <Text style={styles.label}>Hedef tarihi</Text>
      <TextInput
        value={targetDate}
        onChangeText={setTargetDate}
        autoCapitalize="none"
        keyboardType="numbers-and-punctuation"
        placeholder="YYYY-AA-GG"
        placeholderTextColor="#A29DB5"
        style={styles.input}
      />
      <View style={styles.chipRow}>
        {dayOptions.map((days) => (
          <TouchableOpacity
            key={days}
            style={styles.chip}
            onPress={() => setTargetDate(dateAfter(days))}>
            <Text style={styles.chipText}>+{days} gün</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Seviye</Text>
      <View style={styles.chipWrap}>
        <TouchableOpacity
          style={[styles.choiceChip, levelName === null && styles.choiceChipSelected]}
          onPress={() => {
            setLevelName(null);
            setCourseName(null);
          }}>
          <Text style={[styles.choiceText, levelName === null && styles.choiceTextSelected]}>Tümü</Text>
        </TouchableOpacity>
        {LEVELS.map((level) => (
          <TouchableOpacity
            key={level.name}
            style={[styles.choiceChip, levelName === level.name && styles.choiceChipSelected]}
            onPress={() => {
              setLevelName(level.name);
              setCourseName(null);
            }}>
            <Text style={[styles.choiceText, levelName === level.name && styles.choiceTextSelected]}>
              {level.icon} {level.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {selectedLevel ? (
        <>
          <Text style={styles.label}>Ders odağı</Text>
          <View style={styles.chipWrap}>
            <TouchableOpacity
              style={[styles.choiceChip, courseName === null && styles.choiceChipSelected]}
              onPress={() => setCourseName(null)}>
              <Text style={[styles.choiceText, courseName === null && styles.choiceTextSelected]}>Tüm dersler</Text>
            </TouchableOpacity>
            {selectedLevel.courses.map((course) => (
              <TouchableOpacity
                key={course.name}
                style={[styles.choiceChip, courseName === course.name && styles.choiceChipSelected]}
                onPress={() => setCourseName(course.name)}>
                <Text style={[styles.choiceText, courseName === course.name && styles.choiceTextSelected]}>
                  {course.icon} {course.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </>
      ) : null}

      <Text style={styles.label}>Günlük hedef süre</Text>
      <View style={styles.minuteRow}>
        {minuteOptions.map((minutes) => (
          <TouchableOpacity
            key={minutes}
            style={[styles.minuteCard, dailyMinutes === minutes && styles.minuteCardSelected]}
            onPress={() => setDailyMinutes(minutes)}>
            <Text style={[styles.minuteValue, dailyMinutes === minutes && styles.minuteValueSelected]}>{minutes}</Text>
            <Text style={[styles.minuteLabel, dailyMinutes === minutes && styles.minuteLabelSelected]}>dk</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>Plan nasıl değişecek?</Text>
        <Text style={styles.infoText}>
          Hedef yakınlaştıkça Koç, hedef kapsamındaki düşük ustalık konularını daha yukarı taşır. Bekleyen tekrarlar yine korunur; çünkü unutmayı önlemek sınavdan hemen önce de önemlidir.
        </Text>
      </View>

      <TouchableOpacity style={styles.primaryButton} onPress={handleSave}>
        <Text style={styles.primaryButtonText}>Hedefi kaydet</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.clearButton} onPress={handleClear}>
        <Text style={styles.clearButtonText}>Aktif hedefi kaldır</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F3FB' },
  content: { padding: 18, paddingBottom: 42 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F5F3FB' },
  loadingText: { color: '#6B6684', fontWeight: '700' },
  hero: { backgroundColor: '#1D1A34', borderRadius: 24, padding: 21, marginBottom: 22 },
  eyebrow: { color: '#FFC145', fontSize: 10, fontWeight: '900', letterSpacing: 1 },
  title: { color: '#FFFFFF', fontSize: 27, lineHeight: 33, fontWeight: '900', marginTop: 7 },
  subtitle: { color: '#D9D5E8', fontSize: 12, lineHeight: 18, marginTop: 8 },
  heroRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 18 },
  heroMetric: { color: '#FFFFFF', fontSize: 36, fontWeight: '900' },
  heroMetricLabel: { color: '#D9D5E8', fontSize: 11, fontWeight: '700' },
  heroPace: { color: '#FFC145', fontSize: 11, fontWeight: '900', marginTop: 2 },
  label: { color: '#1D1A34', fontSize: 13, fontWeight: '900', marginTop: 16, marginBottom: 7 },
  input: { backgroundColor: '#FFFFFF', borderRadius: 15, borderWidth: 1, borderColor: '#E1DDED', color: '#1D1A34', paddingHorizontal: 14, paddingVertical: 13, fontSize: 14 },
  chipRow: { flexDirection: 'row', gap: 7, marginTop: 8 },
  chip: { backgroundColor: '#EDE9FF', paddingHorizontal: 10, paddingVertical: 7, borderRadius: 999 },
  chipText: { color: '#6552D9', fontSize: 10, fontWeight: '800' },
  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  choiceChip: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E1DDED', borderRadius: 999, paddingHorizontal: 12, paddingVertical: 9 },
  choiceChipSelected: { backgroundColor: '#6552D9', borderColor: '#6552D9' },
  choiceText: { color: '#5C5672', fontSize: 11, fontWeight: '800' },
  choiceTextSelected: { color: '#FFFFFF' },
  minuteRow: { flexDirection: 'row', gap: 8 },
  minuteCard: { flex: 1, backgroundColor: '#FFFFFF', borderRadius: 15, paddingVertical: 12, alignItems: 'center', borderWidth: 1, borderColor: '#E1DDED' },
  minuteCardSelected: { backgroundColor: '#DFF6F4', borderColor: '#12B3A8' },
  minuteValue: { color: '#1D1A34', fontSize: 19, fontWeight: '900' },
  minuteValueSelected: { color: '#0E716B' },
  minuteLabel: { color: '#8B859E', fontSize: 9, marginTop: 1 },
  minuteLabelSelected: { color: '#0E716B' },
  infoCard: { backgroundColor: '#FFF5D8', borderRadius: 17, padding: 15, borderWidth: 1, borderColor: '#F4D782', marginTop: 20 },
  infoTitle: { color: '#75500A', fontSize: 12, fontWeight: '900' },
  infoText: { color: '#735F31', fontSize: 11, lineHeight: 17, marginTop: 5 },
  primaryButton: { backgroundColor: '#1D1A34', borderRadius: 15, padding: 14, alignItems: 'center', marginTop: 18 },
  primaryButtonText: { color: '#FFFFFF', fontSize: 13, fontWeight: '900' },
  clearButton: { borderRadius: 15, padding: 13, alignItems: 'center', marginTop: 8 },
  clearButtonText: { color: '#D94D69', fontSize: 12, fontWeight: '800' },
});
