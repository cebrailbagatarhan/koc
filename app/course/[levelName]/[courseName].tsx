import { Stack, router, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function CourseScreen() {
  const { levelName, courseName } = useLocalSearchParams<{ levelName: string; courseName: string }>();

  const handlePress = (type: 'Konu Anlatımı' | 'Soru Çözümü') => {
    if (type === 'Soru Çözümü') {
      router.push(`/quiz/${levelName}/${courseName}`);
    } else {
      router.push(`/chat/${levelName}/${courseName}`);
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: `${courseName}` }} />
      <Text style={styles.header}>{courseName}</Text>
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.explanationButton]}
          onPress={() => handlePress('Konu Anlatımı')}
        >
          <Text style={styles.buttonIcon}>📘</Text>
          <Text style={styles.buttonText}>Konu Anlatımları</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.quizButton]}
          onPress={() => handlePress('Soru Çözümü')}
        >
          <Text style={styles.buttonIcon}>❓</Text>
          <Text style={styles.buttonText}>Soru Çözümleri</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
  },
  header: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 40,
    textAlign: 'center',
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '90%',
    paddingVertical: 20,
    borderRadius: 15,
    marginBottom: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  explanationButton: {
    backgroundColor: '#4CAF50', // Yeşil
  },
  quizButton: {
    backgroundColor: '#2196F3', // Mavi
  },
  buttonIcon: {
    fontSize: 24,
    marginRight: 10,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
