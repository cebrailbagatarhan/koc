import { router } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const levels = [
  { name: 'İlkokul', color: '#FFDDC1' },
  { name: 'Ortaokul', color: '#C2EABD' },
  { name: 'Lise', color: '#AED9E0' },
  { name: 'ALES', color: '#FFB7B2' },
];

export default function HomeScreen() {
  const handlePress = (levelName: string) => {
    router.push(`/level/${levelName}`);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Eğitim Seviyenizi Seçin</Text>
      <View style={styles.cardContainer}>
        {levels.map((level) => (
          <TouchableOpacity
            key={level.name}
            style={[styles.card, { backgroundColor: level.color }]}
            onPress={() => handlePress(level.name)}
          >
            <Text style={styles.cardText}>{level.name}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F5F5F5',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 40,
    color: '#333',
  },
  cardContainer: {
    width: '100%',
    alignItems: 'center',
  },
  card: {
    width: '90%',
    paddingVertical: 25,
    paddingHorizontal: 20,
    borderRadius: 15,
    marginBottom: 20,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
});
