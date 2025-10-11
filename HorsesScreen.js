import React, { useContext, useState, useEffect } from 'react';
import { View, Text, TextInput, FlatList, StyleSheet, TouchableOpacity, Alert, Modal, ScrollView, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as Notifications from 'expo-notifications';
import { DataContext } from './DataContext';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

const HorsesScreen = () => {
  const { horses, addHorse, removeHorse, reminders, addReminder, removeReminder, updateReminder } = useContext(DataContext);

  const [name, setName] = useState('');
  const [breed, setBreed] = useState('');
  const [owner, setOwner] = useState('');
  const [feedSchedule, setFeedSchedule] = useState('');
  const [notes, setNotes] = useState('');
  const [expandedHorseId, setExpandedHorseId] = useState(null);

  // Reminder modal states
  const [reminderModalVisible, setReminderModalVisible] = useState(false);
  const [selectedHorseForReminder, setSelectedHorseForReminder] = useState(null);
  const [reminderNote, setReminderNote] = useState('');
  const [reminderDate, setReminderDate] = useState(new Date());
  const [reminderTime, setReminderTime] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  // Request notification permissions on mount
  useEffect(() => {
    registerForPushNotificationsAsync();
  }, []);

  const registerForPushNotificationsAsync = async () => {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      Alert.alert('تنبيه', 'يجب منح إذن الإشعارات لتلقي التذكيرات');
      return;
    }
  };

  const scheduleNotification = async (reminder) => {
    try {
      const notificationDate = new Date(`${reminder.date}T${reminder.time}`);
      const now = new Date();

      if (notificationDate <= now) {
        Alert.alert('خطأ', 'يجب أن يكون موعد التذكير في المستقبل');
        return null;
      }

      const trigger = notificationDate;

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: `تذكير: ${reminder.horseName} 🐴`,
          body: reminder.note,
          sound: true,
          priority: Notifications.AndroidNotificationPriority.HIGH,
        },
        trigger,
      });

      return notificationId;
    } catch (error) {
      console.error('Error scheduling notification:', error);
      Alert.alert('خطأ', 'فشل جدولة الإشعار');
      return null;
    }
  };

  const cancelNotification = async (notificationId) => {
    if (notificationId) {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
    }
  };

  const handleAddHorse = () => {
    if (!name) return;
    addHorse({ name, breed, owner, feedSchedule, notes });
    setName('');
    setBreed('');
    setOwner('');
    setFeedSchedule('');
    setNotes('');
  };

  const handleRemoveHorse = (id) => {
    Alert.alert(
      "حذف الحصان",
      "هل أنت متأكد أنك تريد حذف هذا الحصان؟",
      [
        {
          text: "إلغاء",
          style: "cancel"
        },
        {
          text: "موافق",
          onPress: () => removeHorse(id)
        }
      ]
    );
  };

  const toggleExpand = (id) => {
    setExpandedHorseId(expandedHorseId === id ? null : id);
  };

  const openReminderModal = (horse) => {
    setSelectedHorseForReminder(horse);
    setReminderNote('');
    const now = new Date();
    setReminderDate(now);
    setReminderTime(now);
    setReminderModalVisible(true);
  };

  const handleAddReminder = async () => {
    if (!reminderNote.trim()) {
      Alert.alert('خطأ', 'يرجى إدخال ملاحظة للتذكير');
      return;
    }

    const formattedDate = reminderDate.toISOString().split('T')[0];
    const formattedTime = `${String(reminderTime.getHours()).padStart(2, '0')}:${String(reminderTime.getMinutes()).padStart(2, '0')}`;

    const reminderData = {
      horseId: selectedHorseForReminder.id,
      horseName: selectedHorseForReminder.name,
      note: reminderNote,
      date: formattedDate,
      time: formattedTime,
      isActive: true
    };

    // Schedule notification
    const notificationId = await scheduleNotification(reminderData);

    if (notificationId) {
      reminderData.notificationId = notificationId;
    }

    const result = await addReminder(reminderData);

    if (result.success) {
      Alert.alert('نجح', 'تم إضافة التذكير وجدولة الإشعار بنجاح');
      setReminderModalVisible(false);
      setReminderNote('');
    } else {
      Alert.alert('خطأ', result.error || 'فشل إضافة التذكير');
    }
  };

  const handleDeleteReminder = (reminder) => {
    Alert.alert(
      'حذف التذكير',
      'هل أنت متأكد أنك تريد حذف هذا التذكير؟',
      [
        { text: 'إلغاء', style: 'cancel' },
        {
          text: 'حذف',
          style: 'destructive',
          onPress: async () => {
            // Cancel notification if exists
            if (reminder.notificationId) {
              await cancelNotification(reminder.notificationId);
            }

            const result = await removeReminder(reminder.id);
            if (result.success) {
              Alert.alert('نجح', 'تم حذف التذكير وإلغاء الإشعار بنجاح');
            }
          }
        }
      ]
    );
  };

  const getHorseReminders = (horseId) => {
    return reminders.filter(r => r.horseId === horseId);
  };

  const handleDateChange = (event, selectedDate) => {
    if (Platform.OS === 'android' && event.type === 'dismissed') {
      setShowDatePicker(false);
      return;
    }
    if (selectedDate) {
      setReminderDate(selectedDate);
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
      setReminderTime(selectedTime);
    }
    if (Platform.OS === 'android') {
      setShowTimePicker(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-SA');
  };

  const formatTime = (timeString) => {
    if (!timeString) return '';
    return timeString;
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={horses}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <View style={styles.headerSection}>
            <Text style={styles.pageTitle}>🐴 الخيول</Text>
            <View style={styles.countBadge}>
              <Text style={styles.countText}>{horses.length}</Text>
            </View>
          </View>
        }
        renderItem={({ item }) => {
          const isExpanded = expandedHorseId === item.id;
          const horseReminders = getHorseReminders(item.id);

          return (
            <View style={styles.card}>
              <TouchableOpacity
                onPress={() => toggleExpand(item.id)}
                style={styles.cardHeader}
                activeOpacity={0.7}
              >
                <View style={styles.cardHeaderContent}>
                  <Text style={styles.horseName}>{item.name}</Text>
                  <View style={styles.headerIcons}>
                    {horseReminders.length > 0 && (
                      <View style={styles.reminderBadge}>
                        <Text style={styles.reminderBadgeText}>{horseReminders.length}</Text>
                      </View>
                    )}
                    <Text style={styles.expandIcon}>{isExpanded ? '▼' : '◀'}</Text>
                  </View>
                </View>
              </TouchableOpacity>

              {isExpanded && (
                <View style={styles.expandedContent}>
                  <View style={styles.cardRow}>
                    <Text style={styles.cardLabel}>🏇 السلالة:</Text>
                    <Text style={styles.cardValue}>{item.breed || 'غير محدد'}</Text>
                  </View>
                  <View style={styles.cardRow}>
                    <Text style={styles.cardLabel}>👤 المالك:</Text>
                    <Text style={styles.cardValue}>{item.owner || 'غير محدد'}</Text>
                  </View>
                  <View style={styles.cardRow}>
                    <Text style={styles.cardLabel}>🥕 التغذية:</Text>
                    <Text style={styles.cardValue}>{item.feedSchedule || 'غير محدد'}</Text>
                  </View>
                  {item.notes && (
                    <View style={styles.notesSection}>
                      <Text style={styles.notesLabel}>📝 ملاحظات:</Text>
                      <Text style={styles.notesValue}>{item.notes}</Text>
                    </View>
                  )}

                  {/* Reminders Section */}
                  <View style={styles.remindersSection}>
                    <View style={styles.remindersSectionHeader}>
                      <Text style={styles.remindersSectionTitle}>🔔 التذكيرات</Text>
                      <TouchableOpacity
                        style={styles.addReminderButton}
                        onPress={() => openReminderModal(item)}
                      >
                        <Text style={styles.addReminderButtonText}>+ إضافة تذكير</Text>
                      </TouchableOpacity>
                    </View>

                    {horseReminders.length > 0 ? (
                      <View style={styles.remindersList}>
                        {horseReminders.map((reminder) => (
                          <View key={reminder.id} style={styles.reminderItem}>
                            <View style={styles.reminderInfo}>
                              <Text style={styles.reminderNote}>{reminder.note}</Text>
                              <Text style={styles.reminderDate}>
                                📅 {formatDate(reminder.date)}
                              </Text>
                              <Text style={styles.reminderTime}>
                                ⏰ {formatTime(reminder.time)}
                              </Text>
                            </View>
                            <TouchableOpacity
                              onPress={() => handleDeleteReminder(reminder)}
                              style={styles.deleteReminderButton}
                            >
                              <Text style={styles.deleteReminderText}>🗑️</Text>
                            </TouchableOpacity>
                          </View>
                        ))}
                      </View>
                    ) : (
                      <Text style={styles.noRemindersText}>لا توجد تذكيرات</Text>
                    )}
                  </View>

                  <TouchableOpacity style={styles.removeButton} onPress={() => handleRemoveHorse(item.id)}>
                    <Text style={styles.removeButtonText}>حذف الحصان</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          );
        }}
        ListFooterComponent={
          <View style={styles.formSection}>
            <Text style={styles.formTitle}>➕ إضافة حصان جديد</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>🐴 اسم الحصان</Text>
              <TextInput
                value={name}
                onChangeText={setName}
                style={styles.input}
                placeholder="أدخل اسم الحصان"
                placeholderTextColor="#64748b"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>🏇 السلالة</Text>
              <TextInput
                value={breed}
                onChangeText={setBreed}
                style={styles.input}
                placeholder="عربي، كوارتر، إلخ."
                placeholderTextColor="#64748b"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>👤 المالك</Text>
              <TextInput
                value={owner}
                onChangeText={setOwner}
                style={styles.input}
                placeholder="اسم المالك"
                placeholderTextColor="#64748b"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>🥕 جدول التغذية</Text>
              <TextInput
                value={feedSchedule}
                onChangeText={setFeedSchedule}
                style={styles.input}
                placeholder="مثال: 08:00 تبن؛ 18:00 حبوب"
                placeholderTextColor="#64748b"
                multiline
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>📝 ملاحظات</Text>
              <TextInput
                value={notes}
                onChangeText={setNotes}
                style={[styles.input, styles.notesInput]}
                placeholder="أي ملاحظات إضافية عن الحصان..."
                placeholderTextColor="#64748b"
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>

            <TouchableOpacity style={styles.addButton} onPress={handleAddHorse}>
              <Text style={styles.addButtonText}>إضافة حصان</Text>
            </TouchableOpacity>
          </View>
        }
        contentContainerStyle={styles.contentContainer}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>🐴</Text>
            <Text style={styles.emptyText}>لا توجد خيول بعد</Text>
            <Text style={styles.emptySubtext}>أضف أول حصان أدناه</Text>
          </View>
        }
      />

      {/* Reminder Modal */}
      <Modal
        visible={reminderModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setReminderModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.modalTitle}>
                🔔 إضافة تذكير لـ {selectedHorseForReminder?.name}
              </Text>

              <View style={styles.modalInputGroup}>
                <Text style={styles.modalLabel}>📝 ملاحظة التذكير</Text>
                <TextInput
                  value={reminderNote}
                  onChangeText={setReminderNote}
                  style={[styles.modalInput, styles.modalNotesInput]}
                  placeholder="مثال: موعد الطبيب البيطري، تطعيم، فحص..."
                  placeholderTextColor="#64748b"
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                />
              </View>

              <View style={styles.modalInputGroup}>
                <Text style={styles.modalLabel}>📅 التاريخ</Text>
                <TouchableOpacity
                  style={styles.datePickerButton}
                  onPress={() => setShowDatePicker(true)}
                >
                  <Text style={styles.datePickerText}>
                    {reminderDate.toLocaleDateString('ar-SA')}
                  </Text>
                  <Text style={styles.datePickerIcon}>📅</Text>
                </TouchableOpacity>

                {showDatePicker && (
                  <>
                    <DateTimePicker
                      value={reminderDate}
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
                        <Text style={styles.confirmButtonText}>موافق</Text>
                      </TouchableOpacity>
                    )}
                  </>
                )}
              </View>

              <View style={styles.modalInputGroup}>
                <Text style={styles.modalLabel}>⏰ الوقت</Text>
                <TouchableOpacity
                  style={styles.datePickerButton}
                  onPress={() => setShowTimePicker(true)}
                >
                  <Text style={styles.datePickerText}>
                    {`${String(reminderTime.getHours()).padStart(2, '0')}:${String(reminderTime.getMinutes()).padStart(2, '0')}`}
                  </Text>
                  <Text style={styles.datePickerIcon}>⏰</Text>
                </TouchableOpacity>

                {showTimePicker && (
                  <>
                    <DateTimePicker
                      value={reminderTime}
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
                        <Text style={styles.confirmButtonText}>موافق</Text>
                      </TouchableOpacity>
                    )}
                  </>
                )}
              </View>

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={styles.modalCancelButton}
                  onPress={() => setReminderModalVisible(false)}
                >
                  <Text style={styles.modalCancelButtonText}>إلغاء</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.modalSaveButton}
                  onPress={handleAddReminder}
                >
                  <Text style={styles.modalSaveButtonText}>حفظ التذكير</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
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
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#3b82f6',
    overflow: 'hidden',
  },
  cardHeader: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  cardHeaderContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  horseName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    flex: 1,
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  reminderBadge: {
    backgroundColor: '#f59e0b',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    minWidth: 24,
    alignItems: 'center',
  },
  reminderBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  expandIcon: {
    fontSize: 16,
    color: '#3b82f6',
    marginLeft: 12,
  },
  horseValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#10b981',
    display: 'none',
  },
  expandedContent: {
    padding: 16,
    paddingTop: 8,
  },
  cardRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  cardLabel: {
    fontSize: 14,
    color: '#94a3b8',
    width: 100,
    fontWeight: '600',
  },
  cardValue: {
    flex: 1,
    fontSize: 14,
    color: '#e2e8f0',
  },
  notesSection: {
    marginTop: 8,
    marginBottom: 12,
    padding: 12,
    backgroundColor: '#0f172a',
    borderRadius: 8,
    borderRightWidth: 3,
    borderRightColor: '#3b82f6',
  },
  notesLabel: {
    fontSize: 14,
    color: '#94a3b8',
    fontWeight: '600',
    marginBottom: 8,
  },
  notesValue: {
    fontSize: 14,
    color: '#e2e8f0',
    lineHeight: 20,
  },
  remindersSection: {
    marginTop: 12,
    marginBottom: 12,
    padding: 12,
    backgroundColor: '#0f172a',
    borderRadius: 8,
    borderRightWidth: 3,
    borderRightColor: '#f59e0b',
  },
  remindersSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  remindersSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  addReminderButton: {
    backgroundColor: '#f59e0b',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  addReminderButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  remindersList: {
    gap: 8,
  },
  reminderItem: {
    backgroundColor: '#1e293b',
    padding: 10,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reminderInfo: {
    flex: 1,
  },
  reminderNote: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '600',
    marginBottom: 4,
  },
  reminderDate: {
    fontSize: 12,
    color: '#94a3b8',
    marginBottom: 2,
  },
  reminderTime: {
    fontSize: 12,
    color: '#94a3b8',
  },
  deleteReminderButton: {
    padding: 8,
  },
  deleteReminderText: {
    fontSize: 20,
  },
  noRemindersText: {
    fontSize: 13,
    color: '#64748b',
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 8,
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
  notesInput: {
    minHeight: 100,
    paddingTop: 14,
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
  removeButton: {
    backgroundColor: '#ef4444',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  removeButtonText: {
    color: '#fff',
    fontSize: 14,
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
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#1e293b',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalInputGroup: {
    marginBottom: 20,
  },
  modalLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#e2e8f0',
    marginBottom: 8,
  },
  modalInput: {
    backgroundColor: '#0f172a',
    borderWidth: 2,
    borderColor: '#334155',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: '#fff',
  },
  modalNotesInput: {
    minHeight: 80,
    paddingTop: 14,
  },
  datePickerButton: {
    backgroundColor: '#0f172a',
    borderWidth: 2,
    borderColor: '#334155',
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  datePickerText: {
    fontSize: 16,
    color: '#fff',
  },
  datePickerIcon: {
    fontSize: 20,
  },
  intervalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  intervalButton: {
    flex: 1,
    backgroundColor: '#0f172a',
    borderWidth: 2,
    borderColor: '#334155',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
  },
  intervalButtonActive: {
    backgroundColor: '#f59e0b',
    borderColor: '#f59e0b',
  },
  intervalButtonText: {
    fontSize: 16,
    color: '#94a3b8',
    fontWeight: '600',
  },
  intervalButtonTextActive: {
    color: '#fff',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  modalCancelButton: {
    flex: 1,
    backgroundColor: '#334155',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalCancelButtonText: {
    color: '#e2e8f0',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalSaveButton: {
    flex: 1,
    backgroundColor: '#f59e0b',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalSaveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  confirmButton: {
    backgroundColor: '#3b82f6',
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

export default HorsesScreen;

