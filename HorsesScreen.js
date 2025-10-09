import React, { useContext, useState } from 'react';
import { View, Text, TextInput, Button, FlatList, StyleSheet, ScrollView } from 'react-native';
import { DataContext } from '../../context/DataContext';

/**
 * HorsesScreen allows administrators to view all horses in the stable and add
 * new horses.  Horses are displayed with their owner, feed schedule and
 * approximate value.  A simple form at the bottom of the screen lets users
 * create new entries.
 */
const HorsesScreen = () => {
  const { horses, addHorse } = useContext(DataContext);

  // State for the add horse form
  const [name, setName] = useState('');
  const [breed, setBreed] = useState('');
  const [owner, setOwner] = useState('');
  const [feedSchedule, setFeedSchedule] = useState('');
  const [value, setValue] = useState('');

  const handleAddHorse = () => {
    if (!name) return;
    // Basic validation: ensure value is numeric if provided
    const numericValue = value ? parseFloat(value) : 0;
    addHorse({ name, breed, owner, feedSchedule, value: numericValue });
    // Clear form fields
    setName('');
    setBreed('');
    setOwner('');
    setFeedSchedule('');
    setValue('');
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.heading}>Horses</Text>
      <FlatList
        data={horses}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text style={styles.itemTitle}>{item.name}</Text>
            <Text>Breed: {item.breed}</Text>
            <Text>Owner: {item.owner}</Text>
            <Text>Feed: {item.feedSchedule}</Text>
            <Text>Value: ₪{item.value}</Text>
          </View>
        )}
      />
      <Text style={styles.subheading}>Add Horse</Text>
      <View style={styles.formRow}>
        <Text>Name</Text>
        <TextInput
          value={name}
          onChangeText={setName}
          style={styles.input}
          placeholder="Horse name"
        />
      </View>
      <View style={styles.formRow}>
        <Text>Breed</Text>
        <TextInput
          value={breed}
          onChangeText={setBreed}
          style={styles.input}
          placeholder="Breed"
        />
      </View>
      <View style={styles.formRow}>
        <Text>Owner</Text>
        <TextInput
          value={owner}
          onChangeText={setOwner}
          style={styles.input}
          placeholder="Owner name"
        />
      </View>
      <View style={styles.formRow}>
        <Text>Feed</Text>
        <TextInput
          value={feedSchedule}
          onChangeText={setFeedSchedule}
          style={styles.input}
          placeholder="e.g. 08:00 hay; 18:00 grain"
        />
      </View>
      <View style={styles.formRow}>
        <Text>Value</Text>
        <TextInput
          value={value}
          onChangeText={setValue}
          style={styles.input}
          placeholder="₪"
          keyboardType="numeric"
        />
      </View>
      <Button title="Add Horse" onPress={handleAddHorse} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  subheading: {
    fontSize: 20,
    marginTop: 16,
    marginBottom: 8,
  },
  item: {
    backgroundColor: '#f0f0f0',
    padding: 12,
    marginBottom: 8,
    borderRadius: 4,
  },
  itemTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  formRow: {
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 8,
    borderRadius: 4,
    marginTop: 4,
  },
});

export default HorsesScreen;