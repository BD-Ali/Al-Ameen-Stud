import React, { useContext, useState } from 'react';
import { View, Text, TextInput, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { DataContext } from './DataContext';

const HorsesScreen = () => {
  const { horses, addHorse } = useContext(DataContext);

  const [name, setName] = useState('');
  const [breed, setBreed] = useState('');
  const [owner, setOwner] = useState('');
  const [feedSchedule, setFeedSchedule] = useState('');
  const [value, setValue] = useState('');

  const handleAddHorse = () => {
    if (!name) return;
    const numericValue = value ? parseFloat(value) : 0;
    addHorse({ name, breed, owner, feedSchedule, value: numericValue });
    setName('');
    setBreed('');
    setOwner('');
    setFeedSchedule('');
    setValue('');
  };

  // Separate component for the form to prevent re-rendering issues
  const AddHorseForm = React.memo(() => (
    <View style={styles.formSection}>
      <Text style={styles.formTitle}>➕ Add New Horse</Text>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>🐴 Horse Name</Text>
        <TextInput
          value={name}
          onChangeText={setName}
          style={styles.input}
          placeholder="Enter horse name"
          placeholderTextColor="#64748b"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>🏇 Breed</Text>
        <TextInput
          value={breed}
          onChangeText={setBreed}
          style={styles.input}
          placeholder="Arabian, Quarter Horse, etc."
          placeholderTextColor="#64748b"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>👤 Owner</Text>
        <TextInput
          value={owner}
          onChangeText={setOwner}
          style={styles.input}
          placeholder="Owner name"
          placeholderTextColor="#64748b"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>🥕 Feeding Schedule</Text>
        <TextInput
          value={feedSchedule}
          onChangeText={setFeedSchedule}
          style={styles.input}
          placeholder="e.g. 08:00 hay; 18:00 grain"
          placeholderTextColor="#64748b"
          multiline
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>💰 Value (₪)</Text>
        <TextInput
          value={value}
          onChangeText={setValue}
          style={styles.input}
          placeholder="Horse value"
          keyboardType="numeric"
          placeholderTextColor="#64748b"
        />
      </View>

      <TouchableOpacity style={styles.addButton} onPress={handleAddHorse}>
        <Text style={styles.addButtonText}>Add Horse</Text>
      </TouchableOpacity>
    </View>
  ));

  return (
    <View style={styles.container}>
      <FlatList
        data={horses}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <View style={styles.headerSection}>
            <Text style={styles.pageTitle}>🐴 Horses</Text>
            <View style={styles.countBadge}>
              <Text style={styles.countText}>{horses.length}</Text>
            </View>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.horseName}>{item.name}</Text>
              <Text style={styles.horseValue}>₪{item.value}</Text>
            </View>
            <View style={styles.cardRow}>
              <Text style={styles.cardLabel}>🏇 Breed:</Text>
              <Text style={styles.cardValue}>{item.breed}</Text>
            </View>
            <View style={styles.cardRow}>
              <Text style={styles.cardLabel}>👤 Owner:</Text>
              <Text style={styles.cardValue}>{item.owner}</Text>
            </View>
            <View style={styles.cardRow}>
              <Text style={styles.cardLabel}>🥕 Feed:</Text>
              <Text style={styles.cardValue}>{item.feedSchedule}</Text>
            </View>
          </View>
        )}
        ListFooterComponent={<AddHorseForm />}
        contentContainerStyle={styles.contentContainer}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>🐴</Text>
            <Text style={styles.emptyText}>No horses yet</Text>
            <Text style={styles.emptySubtext}>Add your first horse below</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  contentContainer: {
    padding: 16,
  },
  headerSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  countBadge: {
    backgroundColor: '#3b82f6',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  countText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  card: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#3b82f6',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  horseName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  horseValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#10b981',
  },
  cardRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  cardLabel: {
    fontSize: 14,
    color: '#94a3b8',
    width: 100,
  },
  cardValue: {
    flex: 1,
    fontSize: 14,
    color: '#e2e8f0',
  },
  formSection: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 20,
    marginTop: 20,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#e2e8f0',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#0f172a',
    borderWidth: 2,
    borderColor: '#334155',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: '#fff',
  },
  addButton: {
    backgroundColor: '#3b82f6',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
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
    fontSize: 18,
    color: '#e2e8f0',
    fontWeight: '600',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#94a3b8',
  },
});

export default HorsesScreen;