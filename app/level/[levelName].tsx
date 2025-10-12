import { Stack, router, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// Veri yapısını burada tanımlıyoruz
const coursesByLevel: { [key: string]: { name: string; icon: string }[] } = {
  'İlkokul': [
    { name: 'Matematik', icon: '🔢' },
    { name: 'Türkçe', icon: '🇹🇷' },
    { name: 'Hayat Bilgisi', icon: '🌍' },
    { name: 'İngilizce', icon: '🇬🇧' },
  ],
  'Ortaokul': [
    { name: 'Matematik', icon: '📊' },
    { name: 'Türkçe', icon: '📖' },
    { name: 'Fen Bilimleri', icon: '🔬' },
    { name: 'Sosyal Bilgiler', icon: '🏛️' },
    { name: 'İngilizce', icon: '🇬🇧' },
  ],
  'Lise': [
    { name: 'Matematik', icon: '📐' },
    { name: 'Fizik', icon: '⚛️' },
    { name: 'Kimya', icon: '🧪' },
    { name: 'Biyoloji', icon: '🧬' },
    { name: 'Edebiyat', icon: '📚' },
    { name: 'Tarih', icon: '📜' },
  ],
  'ALES': [
    { name: 'Sayısal', icon: '📈' },
    { name: 'Sözel', icon: '🗣️' },
  ],
};


export default function LevelScreen() {
  const { levelName } = useLocalSearchParams<{ levelName: string }>();
  const courses = levelName ? coursesByLevel[levelName] : [];

  const handleCoursePress = (courseName: string) => {
    router.push(`/course/${levelName}/${courseName}`);
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: `${levelName} Dersleri` }} />
      <FlatList
        data={courses}
        keyExtractor={(item) => item.name}
        numColumns={2}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card} onPress={() => handleCoursePress(item.name)}>
            <Text style={styles.cardIcon}>{item.icon}</Text>
            <Text style={styles.cardText}>{item.name}</Text>
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#F5F5F5',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  levelName: {
    fontSize: 18,
    color: '#666',
  },
  listContainer: {
    alignItems: 'center',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 20,
    margin: 8,
    width: 150,
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardIcon: {
    fontSize: 40,
    marginBottom: 10,
  },
  cardText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});
