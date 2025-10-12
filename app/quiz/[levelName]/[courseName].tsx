import { generateQuizQuestion } from '@/api/gemini';
import { Stack, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
}

export default function QuizScreen() {
  const { levelName, courseName } = useLocalSearchParams<{ levelName: string; courseName: string }>();
  const [question, setQuestion] = useState<QuizQuestion | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  useEffect(() => {
    const fetchQuestion = async () => {
      if (levelName && courseName) {
        setLoading(true);
        const q = await generateQuizQuestion(levelName, courseName);
        setQuestion(q);
        setLoading(false);
      }
    };
    fetchQuestion();
  }, [levelName, courseName]);

  const handleAnswerPress = (answer: string) => {
    if (selectedAnswer) return; // Zaten bir cevap seçilmiş

    setSelectedAnswer(answer);
    const correct = answer === question?.correctAnswer;
    setIsCorrect(correct);

    // Animasyonlu geri bildirim burada eklenebilir.
    // Şimdilik bir alert gösterelim.
    Alert.alert(
      correct ? 'Doğru! 🎉' : 'Yanlış ❌',
      correct ? 'Tebrikler!' : `Doğru cevap: ${question?.correctAnswer}`,
      [{ text: 'Yeni Soru', onPress: () => fetchNewQuestion() }]
    );
  };

  const fetchNewQuestion = () => {
    setSelectedAnswer(null);
    setIsCorrect(null);
    setQuestion(null);
    // Tekrar soru çekmek için useEffect'i tetiklemiyoruz, manuel çağırıyoruz
    const fetchQuestion = async () => {
      if (levelName && courseName) {
        setLoading(true);
        const q = await generateQuizQuestion(levelName, courseName);
        setQuestion(q);
        setLoading(false);
      }
    };
    fetchQuestion();
  };


  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={styles.loadingText}>Soru hazırlanıyor...</Text>
      </View>
    );
  }

  if (!question) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={styles.errorText}>Soru yüklenemedi. Lütfen tekrar deneyin.</Text>
      </View>
    );
  }

  const getOptionStyle = (option: string) => {
    if (!selectedAnswer) return styles.option;
    if (option === question.correctAnswer) return [styles.option, styles.correct];
    if (option === selectedAnswer && !isCorrect) return [styles.option, styles.incorrect];
    return styles.option;
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: `${courseName} Testi` }} />
      <Text style={styles.questionText}>{question.question}</Text>
      <View style={styles.optionsContainer}>
        {question.options.map((option, index) => (
          <TouchableOpacity
            key={index}
            style={getOptionStyle(option)}
            onPress={() => handleAnswerPress(option)}
            disabled={!!selectedAnswer}
          >
            <Text style={styles.optionText}>{option}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F5F5F5',
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  errorText: {
    fontSize: 18,
    color: 'red',
  },
  questionText: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
    color: '#333',
  },
  optionsContainer: {
    width: '100%',
  },
  option: {
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  optionText: {
    fontSize: 18,
  },
  correct: {
    backgroundColor: '#C8E6C9', // Yeşil
    borderColor: '#4CAF50',
  },
  incorrect: {
    backgroundColor: '#FFCDD2', // Kırmızı
    borderColor: '#F44336',
  },
});
