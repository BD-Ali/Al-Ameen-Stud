import React, { useContext, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { DataContext } from './DataContext';

/**
 * LessonsScreen lists all scheduled lessons and allows the administrator to add
 * new lessons.
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

  const getHorseName = (id) => horses.find((h) => h.id === id)?.name || id;
  const getClientName = (id) => clients.find((c) => c.id === id)?.name || id;
  const getWorkerName = (id) => workers.find((w) => w.id === id)?.name || id;

  const AddLessonForm = React.memo(() => (
    <View style={styles.formSection}>
      <Text style={styles.formTitle}>➕ Schedule New Lesson</Text>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>📅 Date (YYYY-MM-DD)</Text>
        <TextInput
          value={date}
          onChangeText={setDate}
          placeholder="2025-10-12"
          placeholderTextColor="#64748b"
          style={styles.input}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>⏰ Time (HH:MM)</Text>
        <TextInput
          value={time}
          onChangeText={setTime}
          placeholder="14:00"
          placeholderTextColor="#64748b"
          style={styles.input}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>🐴 Horse ID</Text>
        <TextInput
          value={horseId}
          onChangeText={setHorseId}
          placeholder={horses.length > 0 ? `e.g. ${horses[0].id}` : 'Add horses first'}
          placeholderTextColor="#64748b"
          style={styles.input}
        />
        {horses.length > 0 && (
          <Text style={styles.helpText}>
            Available: {horses.map((h) => `${h.id}:${h.name}`).join(', ')}
          </Text>
        )}
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>👤 Client ID</Text>
        <TextInput
          value={clientId}
          onChangeText={setClientId}
          placeholder={clients.length > 0 ? `e.g. ${clients[0].id}` : 'Add clients first'}
          placeholderTextColor="#64748b"
          style={styles.input}
        />
        {clients.length > 0 && (
          <Text style={styles.helpText}>
            Available: {clients.map((c) => `${c.id}:${c.name}`).join(', ')}
          </Text>
        )}
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>👨‍🏫 Instructor ID</Text>
        <TextInput
          value={instructorId}
          onChangeText={setInstructorId}
          placeholder={workers.length > 0 ? `e.g. ${workers[0].id}` : 'Add workers first'}
          placeholderTextColor="#64748b"
          style={styles.input}
        />
        {workers.length > 0 && (
          <Text style={styles.helpText}>
            Available: {workers.map((w) => `${w.id}:${w.name}`).join(', ')}
          </Text>
        )}
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>💰 Price (₪)</Text>
        <TextInput
          value={price}
          onChangeText={setPrice}
          placeholder="100"
          keyboardType="numeric"
          placeholderTextColor="#64748b"
          style={styles.input}
        />
      </View>

      <TouchableOpacity style={styles.addButton} onPress={handleAddLesson}>
        <Text style={styles.addButtonText}>Schedule Lesson</Text>
      </TouchableOpacity>
    </View>
  ));

  return (
    <View style={styles.container}>
      <FlatList
        data={lessons}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <View style={styles.headerSection}>
            <Text style={styles.pageTitle}>📚 Lessons</Text>
            <View style={styles.countBadge}>
              <Text style={styles.countText}>{lessons.length}</Text>
            </View>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.lessonDateTime}>📅 {item.date}</Text>
              <Text style={styles.lessonTime}>⏰ {item.time}</Text>
            </View>
            <View style={styles.cardRow}>
              <Text style={styles.cardLabel}>🐴 Horse:</Text>
              <Text style={styles.cardValue}>{getHorseName(item.horseId)}</Text>
            </View>
            <View style={styles.cardRow}>
              <Text style={styles.cardLabel}>👤 Client:</Text>
              <Text style={styles.cardValue}>{getClientName(item.clientId)}</Text>
            </View>
            <View style={styles.cardRow}>
              <Text style={styles.cardLabel}>👨‍🏫 Instructor:</Text>
              <Text style={styles.cardValue}>{getWorkerName(item.instructorId)}</Text>
            </View>
            <View style={styles.priceContainer}>
              <Text style={styles.priceLabel}>Price:</Text>
              <Text style={styles.priceValue}>₪{item.price}</Text>
            </View>
          </View>
        )}
        ListFooterComponent={<AddLessonForm />}
        contentContainerStyle={styles.contentContainer}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>📚</Text>
            <Text style={styles.emptyText}>No lessons scheduled</Text>
            <Text style={styles.emptySubtext}>Schedule your first lesson below</Text>
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
    backgroundColor: '#8b5cf6',
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
    borderLeftColor: '#8b5cf6',
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
  lessonDateTime: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  lessonTime: {
    fontSize: 16,
    color: '#94a3b8',
  },
  cardRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  cardLabel: {
    fontSize: 14,
    color: '#94a3b8',
    width: 110,
  },
  cardValue: {
    flex: 1,
    fontSize: 14,
    color: '#e2e8f0',
  },
  priceContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#334155',
  },
  priceLabel: {
    fontSize: 14,
    color: '#94a3b8',
    marginRight: 8,
  },
  priceValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#10b981',
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
  helpText: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 4,
    fontStyle: 'italic',
  },
  addButton: {
    backgroundColor: '#8b5cf6',
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

export default LessonsScreen;