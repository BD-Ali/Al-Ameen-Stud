import React, { useContext, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { DataContext } from './DataContext';

/**
 * LessonsScreen lists all scheduled lessons and allows the administrator to add
 * new lessons.
 */
const LessonsScreen = () => {
  const { lessons, addLesson, removeLesson, horses, clients, workers } = useContext(DataContext);
  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [horseId, setHorseId] = useState('');
  const [clientId, setClientId] = useState('');
  const [instructorId, setInstructorId] = useState('');
  const [price, setPrice] = useState('');
  const [showHorsePicker, setShowHorsePicker] = useState(false);
  const [showClientPicker, setShowClientPicker] = useState(false);
  const [showInstructorPicker, setShowInstructorPicker] = useState(false);

  const handleDateChange = (event, selectedDate) => {
    if (Platform.OS === 'android' && event.type === 'dismissed') {
      setShowDatePicker(false);
      return;
    }
    if (selectedDate) {
      setDate(selectedDate);
    }
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
  };

  const handleTimeChange = (event, selectedTime) => {
    if (Platform.OS === 'android' && event.type === 'dismissed') {
      setShowTimePicker(false);
      return;
    }
    if (selectedTime) {
      setTime(selectedTime);
    }
    if (Platform.OS === 'android') {
      setShowTimePicker(false);
    }
  };

  const handleRemoveLesson = async (id) => {
    Alert.alert(
      'Delete Lesson',
      'Are you sure you want to delete this lesson?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const result = await removeLesson(id);
            if (result.success) {
              Alert.alert('Success', 'Lesson deleted successfully');
            } else {
              Alert.alert('Error', result.error || 'Failed to delete lesson');
            }
          }
        }
      ]
    );
  };

  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const formatTime = (time) => {
    const hours = String(time.getHours()).padStart(2, '0');
    const minutes = String(time.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const handleAddLesson = async () => {
    if (!horseId || !clientId || !instructorId) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    const numericPrice = price ? parseFloat(price) : 0;
    const formattedDate = formatDate(date);
    const formattedTime = formatTime(time);

    const result = await addLesson({
      date: formattedDate,
      time: formattedTime,
      horseId,
      clientId,
      instructorId,
      price: numericPrice
    });

    if (result.success) {
      Alert.alert('Success', 'Lesson scheduled successfully');
      setDate(new Date());
      setTime(new Date());
      setHorseId('');
      setClientId('');
      setInstructorId('');
      setPrice('');
    } else {
      Alert.alert('Error', result.error || 'Failed to schedule lesson');
    }
  };

  const getHorseName = (id) => horses.find((h) => h.id === id)?.name || id;
  const getClientName = (id) => clients.find((c) => c.id === id)?.name || id;
  const getWorkerName = (id) => workers.find((w) => w.id === id)?.name || id;

  const getSelectedHorseName = () => {
    const horse = horses.find(h => h.id === horseId);
    return horse ? horse.name : 'Select a horse';
  };

  const getSelectedClientName = () => {
    const client = clients.find(c => c.id === clientId);
    return client ? client.name : 'Select a client';
  };

  const getSelectedInstructorName = () => {
    const instructor = workers.find(w => w.id === instructorId);
    return instructor ? instructor.name : 'Select an instructor';
  };

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
            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => handleRemoveLesson(item.id)}
            >
              <Text style={styles.removeButtonText}>🗑️ Remove Lesson</Text>
            </TouchableOpacity>
          </View>
        )}
        ListFooterComponent={
          <View style={styles.formSection}>
            <Text style={styles.formTitle}>➕ Schedule New Lesson</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>📅 Select Date</Text>
              <TouchableOpacity
                style={styles.pickerButton}
                onPress={() => setShowDatePicker(true)}
              >
                <Text style={styles.pickerButtonText}>
                  {formatDate(date)}
                </Text>
                <Text style={styles.dropdownArrow}>📅</Text>
              </TouchableOpacity>

              {showDatePicker && (
                <>
                  <DateTimePicker
                    value={date}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={handleDateChange}
                    minimumDate={new Date()}
                  />
                  {Platform.OS === 'ios' && (
                    <TouchableOpacity
                      style={styles.confirmButton}
                      onPress={() => setShowDatePicker(false)}
                    >
                      <Text style={styles.confirmButtonText}>OK</Text>
                    </TouchableOpacity>
                  )}
                </>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>⏰ Select Time</Text>
              <TouchableOpacity
                style={styles.pickerButton}
                onPress={() => setShowTimePicker(true)}
              >
                <Text style={styles.pickerButtonText}>
                  {formatTime(time)}
                </Text>
                <Text style={styles.dropdownArrow}>⏰</Text>
              </TouchableOpacity>

              {showTimePicker && (
                <>
                  <DateTimePicker
                    value={time}
                    mode="time"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={handleTimeChange}
                    is24Hour={true}
                  />
                  {Platform.OS === 'ios' && (
                    <TouchableOpacity
                      style={styles.confirmButton}
                      onPress={() => setShowTimePicker(false)}
                    >
                      <Text style={styles.confirmButtonText}>OK</Text>
                    </TouchableOpacity>
                  )}
                </>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>🐴 Select Horse</Text>
              <TouchableOpacity
                style={styles.pickerButton}
                onPress={() => {
                  setShowHorsePicker(!showHorsePicker);
                  setShowClientPicker(false);
                  setShowInstructorPicker(false);
                }}
              >
                <Text style={[styles.pickerButtonText, !horseId && styles.placeholderText]}>
                  {getSelectedHorseName()}
                </Text>
                <Text style={styles.dropdownArrow}>{showHorsePicker ? '▲' : '▼'}</Text>
              </TouchableOpacity>

              {showHorsePicker && horses.length > 0 && (
                <ScrollView style={styles.pickerDropdown} nestedScrollEnabled={true}>
                  {horses.map((horse) => (
                    <TouchableOpacity
                      key={horse.id}
                      style={[
                        styles.pickerOption,
                        horseId === horse.id && styles.pickerOptionSelected
                      ]}
                      onPress={() => {
                        setHorseId(horse.id);
                        setShowHorsePicker(false);
                      }}
                    >
                      <Text style={[
                        styles.pickerOptionText,
                        horseId === horse.id && styles.pickerOptionTextSelected
                      ]}>
                        {horse.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              )}

              {horses.length === 0 && (
                <Text style={styles.helpText}>Add horses first</Text>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>👤 Select Client</Text>
              <TouchableOpacity
                style={styles.pickerButton}
                onPress={() => {
                  setShowClientPicker(!showClientPicker);
                  setShowHorsePicker(false);
                  setShowInstructorPicker(false);
                }}
              >
                <Text style={[styles.pickerButtonText, !clientId && styles.placeholderText]}>
                  {getSelectedClientName()}
                </Text>
                <Text style={styles.dropdownArrow}>{showClientPicker ? '▲' : '▼'}</Text>
              </TouchableOpacity>

              {showClientPicker && clients.length > 0 && (
                <ScrollView style={styles.pickerDropdown} nestedScrollEnabled={true}>
                  {clients.map((client) => (
                    <TouchableOpacity
                      key={client.id}
                      style={[
                        styles.pickerOption,
                        clientId === client.id && styles.pickerOptionSelected
                      ]}
                      onPress={() => {
                        setClientId(client.id);
                        setShowClientPicker(false);
                      }}
                    >
                      <Text style={[
                        styles.pickerOptionText,
                        clientId === client.id && styles.pickerOptionTextSelected
                      ]}>
                        {client.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              )}

              {clients.length === 0 && (
                <Text style={styles.helpText}>Add clients first</Text>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>👨‍🏫 Select Instructor</Text>
              <TouchableOpacity
                style={styles.pickerButton}
                onPress={() => {
                  setShowInstructorPicker(!showInstructorPicker);
                  setShowHorsePicker(false);
                  setShowClientPicker(false);
                }}
              >
                <Text style={[styles.pickerButtonText, !instructorId && styles.placeholderText]}>
                  {getSelectedInstructorName()}
                </Text>
                <Text style={styles.dropdownArrow}>{showInstructorPicker ? '▲' : '▼'}</Text>
              </TouchableOpacity>

              {showInstructorPicker && workers.length > 0 && (
                <ScrollView style={styles.pickerDropdown} nestedScrollEnabled={true}>
                  {workers.map((worker) => (
                    <TouchableOpacity
                      key={worker.id}
                      style={[
                        styles.pickerOption,
                        instructorId === worker.id && styles.pickerOptionSelected
                      ]}
                      onPress={() => {
                        setInstructorId(worker.id);
                        setShowInstructorPicker(false);
                      }}
                    >
                      <Text style={[
                        styles.pickerOptionText,
                        instructorId === worker.id && styles.pickerOptionTextSelected
                      ]}>
                        {worker.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              )}

              {workers.length === 0 && (
                <Text style={styles.helpText}>Add workers first</Text>
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
        }
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
  pickerButton: {
    backgroundColor: '#0f172a',
    borderWidth: 2,
    borderColor: '#334155',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pickerButtonText: {
    fontSize: 16,
    color: '#fff',
  },
  placeholderText: {
    color: '#64748b',
  },
  dropdownArrow: {
    color: '#64748b',
    fontSize: 12,
  },
  pickerDropdown: {
    backgroundColor: '#1e293b',
    borderWidth: 2,
    borderColor: '#334155',
    borderRadius: 12,
    marginTop: 8,
    maxHeight: 200,
  },
  pickerOption: {
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  pickerOptionSelected: {
    backgroundColor: '#8b5cf6',
  },
  pickerOptionText: {
    fontSize: 16,
    color: '#e2e8f0',
  },
  pickerOptionTextSelected: {
    color: '#fff',
    fontWeight: 'bold',
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
  removeButton: {
    backgroundColor: '#ef4444',
    borderRadius: 12,
    padding: 10,
    marginTop: 12,
    alignItems: 'center',
  },
  removeButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  confirmButton: {
    backgroundColor: '#8b5cf6',
    borderRadius: 12,
    padding: 10,
    marginTop: 8,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default LessonsScreen;

