import React, { useContext, useState, useEffect } from 'react';
import { View, Text, TextInput, FlatList, StyleSheet, TouchableOpacity, Alert, Modal, ScrollView, Platform, TouchableWithoutFeedback, Keyboard } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as Notifications from 'expo-notifications';
import { DataContext } from '../context/DataContext';
import { colors, typography, spacing, borderRadius, shadows } from '../styles/theme';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

const HorsesScreen = () => {
  const { horses, addHorse, removeHorse, reminders, addReminder, removeReminder } = useContext(DataContext);

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

      const trigger = {
        type: 'date',
        date: notificationDate
      };

      await Notifications.scheduleNotificationAsync({
        content: {
          title: `تذكير: ${reminder.horseName} 🐴`,
          body: reminder.note,
          sound: true,
          priority: Notifications.AndroidNotificationPriority.HIGH,
        },
        trigger,
      });
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
    // Return the date in YYYY-MM-DD format, same as LessonsScreen
    return dateString;
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
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
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
                      {reminderDate.toLocaleDateString('en-US')}
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
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  contentContainer: {
    padding: spacing.base,
  },
  headerSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  pageTitle: {
    fontSize: typography.size.xxl,
    fontWeight: typography.weight.bold,
    color: colors.text.primary,
  },
  countBadge: {
    backgroundColor: colors.primary.main,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    minWidth: 32,
    alignItems: 'center',
  },
  countText: {
    color: colors.text.primary,
    fontWeight: typography.weight.bold,
    fontSize: typography.size.base,
  },
  card: {
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary.main,
    overflow: 'hidden',
    ...shadows.md,
  },
  cardHeader: {
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  cardHeaderContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  horseName: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.bold,
    color: colors.text.primary,
    flex: 1,
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  reminderBadge: {
    backgroundColor: colors.status.warning,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    minWidth: 24,
    alignItems: 'center',
  },
  reminderBadgeText: {
    color: '#fff',
    fontSize: typography.size.xs,
    fontWeight: typography.weight.bold,
  },
  expandIcon: {
    fontSize: 14,
    color: colors.primary.main,
    marginLeft: spacing.sm,
  },
  expandedContent: {
    padding: spacing.md,
    paddingTop: spacing.sm,
  },
  cardRow: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
  },
  cardLabel: {
    fontSize: typography.size.sm,
    color: colors.text.tertiary,
    width: 90,
    fontWeight: typography.weight.semibold,
  },
  cardValue: {
    flex: 1,
    fontSize: typography.size.sm,
    color: colors.text.secondary,
  },
  notesSection: {
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
    padding: spacing.md,
    backgroundColor: colors.surface.elevated,
    borderRadius: borderRadius.sm,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary.main,
  },
  notesLabel: {
    fontSize: typography.size.sm,
    color: colors.text.tertiary,
    fontWeight: typography.weight.semibold,
    marginBottom: spacing.sm,
  },
  notesValue: {
    fontSize: typography.size.sm,
    color: colors.text.secondary,
    lineHeight: 18,
  },
  remindersSection: {
    marginTop: spacing.md,
    marginBottom: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.surface.elevated,
    borderRadius: borderRadius.sm,
    borderLeftWidth: 3,
    borderLeftColor: colors.status.warning,
  },
  remindersSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  remindersSectionTitle: {
    fontSize: typography.size.base,
    fontWeight: typography.weight.bold,
    color: colors.text.primary,
  },
  addReminderButton: {
    backgroundColor: colors.status.warning,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  addReminderButtonText: {
    color: '#fff',
    fontSize: typography.size.xs,
    fontWeight: typography.weight.bold,
  },
  remindersList: {
    gap: spacing.sm,
  },
  reminderItem: {
    backgroundColor: colors.background.secondary,
    padding: spacing.sm,
    borderRadius: borderRadius.sm,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reminderInfo: {
    flex: 1,
  },
  reminderNote: {
    fontSize: typography.size.sm,
    color: colors.text.primary,
    fontWeight: typography.weight.semibold,
    marginBottom: spacing.xs,
  },
  reminderDate: {
    fontSize: typography.size.xs,
    color: colors.text.tertiary,
    marginBottom: 2,
  },
  reminderTime: {
    fontSize: typography.size.xs,
    color: colors.text.tertiary,
  },
  deleteReminderButton: {
    padding: spacing.sm,
  },
  deleteReminderText: {
    fontSize: 18,
  },
  noRemindersText: {
    fontSize: typography.size.xs,
    color: colors.text.muted,
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: spacing.sm,
  },
  formSection: {
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.md,
    padding: spacing.base,
    marginTop: spacing.base,
  },
  formTitle: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.bold,
    color: colors.text.primary,
    marginBottom: spacing.base,
  },
  inputGroup: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.semibold,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
  },
  input: {
    backgroundColor: colors.background.primary,
    borderWidth: 1.5,
    borderColor: colors.border.light,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: typography.size.base,
    color: colors.text.primary,
    height: 48,
  },
  notesInput: {
    minHeight: 90,
    paddingTop: spacing.md,
    height: 'auto',
  },
  addButton: {
    backgroundColor: colors.primary.main,
    height: 48,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.sm,
    ...shadows.md,
  },
  addButtonText: {
    color: '#fff',
    fontSize: typography.size.base,
    fontWeight: typography.weight.bold,
  },
  removeButton: {
    backgroundColor: colors.status.error,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.sm,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  removeButtonText: {
    color: '#fff',
    fontSize: typography.size.sm,
    fontWeight: typography.weight.bold,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xxxl,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  emptyText: {
    fontSize: typography.size.md,
    color: colors.text.secondary,
    fontWeight: typography.weight.semibold,
    marginBottom: spacing.xs,
  },
  emptySubtext: {
    fontSize: typography.size.sm,
    color: colors.text.tertiary,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.background.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  modalContent: {
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    width: '100%',
    maxHeight: '80%',
    ...shadows.lg,
  },
  modalTitle: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.bold,
    color: colors.text.primary,
    marginBottom: spacing.base,
    textAlign: 'center',
  },
  modalInputGroup: {
    marginBottom: spacing.base,
  },
  modalLabel: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.semibold,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
  },
  modalInput: {
    backgroundColor: colors.background.primary,
    borderWidth: 1.5,
    borderColor: colors.border.light,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: typography.size.base,
    color: colors.text.primary,
    height: 48,
  },
  modalNotesInput: {
    minHeight: 80,
    paddingTop: spacing.md,
    height: 'auto',
  },
  datePickerButton: {
    backgroundColor: colors.background.primary,
    borderWidth: 1.5,
    borderColor: colors.border.light,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  datePickerText: {
    fontSize: typography.size.base,
    color: colors.text.primary,
  },
  datePickerIcon: {
    fontSize: 18,
  },
  confirmButton: {
    backgroundColor: colors.primary.main,
    padding: spacing.sm,
    borderRadius: borderRadius.sm,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: typography.size.sm,
    fontWeight: typography.weight.bold,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.base,
  },
  modalCancelButton: {
    flex: 1,
    backgroundColor: colors.background.tertiary,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  modalCancelButtonText: {
    color: colors.text.secondary,
    fontSize: typography.size.base,
    fontWeight: typography.weight.bold,
  },
  modalSaveButton: {
    flex: 1,
    backgroundColor: colors.status.warning,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  modalSaveButtonText: {
    color: '#fff',
    fontSize: typography.size.base,
    fontWeight: typography.weight.bold,
  },
});

export default HorsesScreen;
