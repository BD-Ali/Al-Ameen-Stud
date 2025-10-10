import React, { useContext, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { DataContext } from './DataContext';

/**
 * WorkersScreen lists the stable's employees and allows the administrator to
 * add new workers.
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

  const AddWorkerForm = React.memo(() => (
    <View style={styles.formSection}>
      <Text style={styles.formTitle}>➕ Add New Worker</Text>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>👤 Name</Text>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Worker name"
          placeholderTextColor="#64748b"
          style={styles.input}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>💼 Role</Text>
        <TextInput
          value={role}
          onChangeText={setRole}
          placeholder="e.g. Trainer, Groom, Manager"
          placeholderTextColor="#64748b"
          style={styles.input}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>📞 Contact</Text>
        <TextInput
          value={contact}
          onChangeText={setContact}
          placeholder="Phone or email"
          placeholderTextColor="#64748b"
          style={styles.input}
        />
      </View>

      <TouchableOpacity style={styles.addButton} onPress={handleAddWorker}>
        <Text style={styles.addButtonText}>Add Worker</Text>
      </TouchableOpacity>
    </View>
  ));

  return (
    <View style={styles.container}>
      <FlatList
        data={workers}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <View style={styles.headerSection}>
            <Text style={styles.pageTitle}>👷 Workers</Text>
            <View style={styles.countBadge}>
              <Text style={styles.countText}>{workers.length}</Text>
            </View>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.workerName}>{item.name}</Text>
              <Text style={styles.workerEmoji}>👤</Text>
            </View>
            <View style={styles.cardRow}>
              <Text style={styles.cardLabel}>💼 Role:</Text>
              <Text style={styles.cardValue}>{item.role || 'Not specified'}</Text>
            </View>
            <View style={styles.cardRow}>
              <Text style={styles.cardLabel}>📞 Contact:</Text>
              <Text style={styles.cardValue}>{item.contact || 'Not provided'}</Text>
            </View>
          </View>
        )}
        ListFooterComponent={<AddWorkerForm />}
        contentContainerStyle={styles.contentContainer}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>👷</Text>
            <Text style={styles.emptyText}>No workers yet</Text>
            <Text style={styles.emptySubtext}>Add your first worker below</Text>
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
    backgroundColor: '#ec4899',
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
    borderLeftColor: '#ec4899',
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
  workerName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  workerEmoji: {
    fontSize: 24,
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
    backgroundColor: '#ec4899',
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

export default WorkersScreen;