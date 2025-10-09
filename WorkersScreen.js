import React, { useContext, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TextInput, Button } from 'react-native';
import { DataContext } from '../../context/DataContext';

/**
 * WorkersScreen lists the stable's employees and allows the administrator to
 * add new workers.  These details are private and only visible to admins.
 */
const WorkersScreen = () => {
  const { workers, addWorker } = useContext(DataContext);
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [contact, setContact] = useState('');

  const handleAddWorker = () => {
    if (!name) return;
    addWorker({ name, role, contact });
    setName('');
    setRole('');
    setContact('');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Workers</Text>
      <FlatList
        data={workers}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text style={styles.itemTitle}>{item.name}</Text>
            <Text>Role: {item.role}</Text>
            <Text>Contact: {item.contact}</Text>
          </View>
        )}
      />
      <Text style={styles.subheading}>Add Worker</Text>
      <View style={styles.formRow}>
        <Text>Name</Text>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Worker name"
          style={styles.input}
        />
      </View>
      <View style={styles.formRow}>
        <Text>Role</Text>
        <TextInput
          value={role}
          onChangeText={setRole}
          placeholder="e.g. Trainer, Groom"
          style={styles.input}
        />
      </View>
      <View style={styles.formRow}>
        <Text>Contact</Text>
        <TextInput
          value={contact}
          onChangeText={setContact}
          placeholder="Phone or email"
          style={styles.input}
        />
      </View>
      <Button title="Add Worker" onPress={handleAddWorker} />
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

export default WorkersScreen;