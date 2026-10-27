import { Stack, router, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { COURSES_BY_LEVEL } from '@/data/courseCatalog';

export default function LevelScreen() {
  const { levelName } = useLocalSearchParams<{ levelName: string }>();
  const courses = levelName ? COURSES_BY_LEVEL[levelName] ?? [] : [];

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: `${levelName ?? ''} Dersleri` }} />
      <Text style={styles.title}>{levelName}</Text>
      <Text style={styles.subtitle}>Dersi seç; konu, quiz, kaynak ve uygun derslerde pratik moduna geç.</Text>
      <FlatList
        data={courses}
        keyExtractor={(item) => item.name}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            activeOpacity={0.85}
            onPress={() => router.push(`/course/${levelName}/${item.name}`)}>
            <Text style={styles.icon}>{item.icon}</Text>
            <Text style={styles.cardTitle}>{item.name}</Text>
            <Text style={styles.cardText}>{item.description}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F3FB', padding: 16 },
  title: { color: '#1D1A34', fontSize: 28, fontWeight: '800', marginTop: 8 },
  subtitle: { color: '#6B6684', fontSize: 13, lineHeight: 19, marginTop: 5, marginBottom: 16 },
  list: { paddingBottom: 24 },
  row: { gap: 10 },
  card: { flex: 1, minHeight: 170, backgroundColor: '#FFFFFF', borderRadius: 18, padding: 16, marginBottom: 10, borderWidth: 1, borderColor: '#E7E3F5' },
  icon: { fontSize: 30 },
  cardTitle: { color: '#1D1A34', fontSize: 16, fontWeight: '800', marginTop: 10 },
  cardText: { color: '#6B6684', fontSize: 11, lineHeight: 16, marginTop: 5 },
});
