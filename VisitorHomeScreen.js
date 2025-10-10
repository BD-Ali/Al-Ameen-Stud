import React, { useContext } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { DataContext } from './DataContext';

/**
 * VisitorHomeScreen is the public‑facing section of the app.  It shows a
 * friendly welcome message and lists the horses currently boarded at the
 * stable along with their breeds.  No sensitive information such as owner,
 * feeding schedule or value is shown.
 */
const VisitorHomeScreen = ({ navigation }) => {
  const { horses } = useContext(DataContext);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.emoji}>🐴</Text>
        <Text style={styles.heading}>Welcome to Al-Ameen Stable!</Text>
        <Text style={styles.paragraph}>
          We are proud to care for a variety of wonderful horses. Feel free to look around and learn about them.
        </Text>
      </View>

      <Text style={styles.subheading}>🏇 Our Horses</Text>
      <FlatList
        data={horses}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.horseName}>{item.name}</Text>
            <View style={styles.breedRow}>
              <Text style={styles.breedLabel}>Breed:</Text>
              <Text style={styles.breedValue}>{item.breed}</Text>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>🐴</Text>
            <Text style={styles.emptyText}>No horses to display yet</Text>
          </View>
        }
      />

      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.backButtonText}>← Back to Login</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#0f172a',
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
    paddingVertical: 20,
  },
  emoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  heading: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#fff',
    textAlign: 'center',
  },
  paragraph: {
    fontSize: 16,
    marginBottom: 12,
    color: '#94a3b8',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  subheading: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 12,
    color: '#fff',
  },
  card: {
    backgroundColor: '#1e293b',
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#3b82f6',
  },
  horseName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#fff',
  },
  breedRow: {
    flexDirection: 'row',
  },
  breedLabel: {
    fontSize: 14,
    color: '#94a3b8',
    marginRight: 8,
  },
  breedValue: {
    fontSize: 14,
    color: '#e2e8f0',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 16,
    color: '#94a3b8',
  },
  backButton: {
    backgroundColor: '#3b82f6',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 16,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default VisitorHomeScreen;