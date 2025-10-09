import React, { useContext, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TextInput, Button } from 'react-native';
import { DataContext } from '../../context/DataContext';

/**
 * LessonsScreen lists all scheduled lessons and allows the administrator to add
 * new lessons.  A lesson ties together a horse, client and instructor at a
 * specific date and time with an associated price.  Payment tracking is done
 * via the Clients tab by updating the client's paid and due amounts.
 */
const LessonsScreen = () => {
  const { lessons, addLesson, horses, clients, workers } = useContext(DataContext);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [horseId, setHorseId] = useState('');
  const [clientId, setClientId] = useState('');
  const [instructorId, setInstructorId] = useState('');
  const [price, setPrice] = useState('');

  const handleAddLesson = () => {
    if (!date || !time || !horseId || !clientId || !instructorId) return;
    const numericPrice = price ? parseFloat(price) : 0;
    addLesson({ date, time, horseId, clientId, instructorId, price: numericPrice });
    setDate('');
    setTime('');
    setHorseId('');
    setClientId('');
    setInstructorId('');
    setPrice('');
  };

  // Helper functions to convert IDs to names
  const getHorseName = (id) => horses.find((h) => h.id === id)?.name || id;
  const getClientName = (id) => clients.find((c) => c.id === id)?.name || id;
  const getWorkerName = (id) => workers.find((w) => w.id === id)?.name || id;

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Lessons</Text>
      <FlatList
        data={lessons}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text style={styles.itemTitle}>{item.date} {item.time}</Text>
            <Text>Horse: {getHorseName(item.horseId)}</Text>
            <Text>Client: {getClientName(item.clientId)}</Text>
            <Text>Instructor: {getWorkerName(item.instructorId)}</Text>
            <Text>Price: ₪{item.price}</Text>
          </View>
        )}
      />
      <Text style={styles.subheading}>Schedule Lesson</Text>
      <View style={styles.formRow}>
        <Text>Date (YYYY-MM-DD)</Text>
        <TextInput
          value={date}
          onChangeText={setDate}
          placeholder="2025-10-12"
          style={styles.input}
        />
      </View>
      <View style={styles.formRow}>
        <Text>Time (HH:MM)</Text>
        <TextInput
          value={time}
          onChangeText={setTime}
          placeholder="14:00"
          style={styles.input}
        />
      </View>
      <View style={styles.formRow}>
        <Text>Horse ID</Text>
        <TextInput
          value={horseId}
          onChangeText={setHorseId}
          placeholder={`Choose from: ${horses.map((h) => h.id + ':' + h.name).join(', ')}`}
          style={styles.input}
        />
      </View>
      <View style={styles.formRow}>
        <Text>Client ID</Text>
        <TextInput
          value={clientId}
          onChangeText={setClientId}
          placeholder={`Choose from: ${clients.map((c) => c.id + ':' + c.name).join(', ')}`}
          style={styles.input}
        />
      </View>
      <View style={styles.formRow}>
        <Text>Instructor ID</Text>
        <TextInput
          value={instructorId}
          onChangeText={setInstructorId}
          placeholder={`Choose from: ${workers.map((w) => w.id + ':' + w.name).join(', ')}`}
          style={styles.input}
        />
      </View>
      <View style={styles.formRow}>
        <Text>Price</Text>
        <TextInput
          value={price}
          onChangeText={setPrice}
          placeholder="100"
          keyboardType="numeric"
          style={styles.input}
        />
      </View>
      <Button title="Add Lesson" onPress={handleAddLesson} />
    </View>
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
    marginBottom: 4,
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

export default LessonsScreen;