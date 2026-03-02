import React, { useContext, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import { DataContext } from '../context/DataContext';
import { colors, typography, spacing, borderRadius } from '../styles/theme';
import AnimatedCard from '../components/AnimatedCard';
import { useFadeIn } from '../utils/animations';
import { useTranslation } from '../i18n/LanguageContext';

const WeeklyScheduleScreen = () => {
  const { weeklySchedules, workerUsers, addWeeklySchedule, updateWeeklySchedule, removeWeeklySchedule } = useContext(DataContext);
  const { t } = useTranslation();

  const [currentWeekStart, setCurrentWeekStart] = useState(null);
  const [currentWeekId, setCurrentWeekId] = useState('');
  const [selectedDay, setSelectedDay] = useState('saturday');
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedSlots, setSelectedSlots] = useState([]);
  const [selectedWorker, setSelectedWorker] = useState(null);
  const [workDescription, setWorkDescription] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [editingScheduleId, setEditingScheduleId] = useState(null);
  const [loading, setLoading] = useState(false);

  // Days of the week (Saturday to Friday)
  const daysOfWeek = [
    { key: 'saturday', label: t('weeklySchedule.saturday'), shortLabel: t('weeklySchedule.satShort') },
    { key: 'sunday', label: t('weeklySchedule.sunday'), shortLabel: t('weeklySchedule.sunShort') },
    { key: 'monday', label: t('weeklySchedule.monday'), shortLabel: t('weeklySchedule.monShort') },
    { key: 'tuesday', label: t('weeklySchedule.tuesday'), shortLabel: t('weeklySchedule.tueShort') },
    { key: 'wednesday', label: t('weeklySchedule.wednesday'), shortLabel: t('weeklySchedule.wedShort') },
    { key: 'thursday', label: t('weeklySchedule.thursday'), shortLabel: t('weeklySchedule.thuShort') },
    { key: 'friday', label: t('weeklySchedule.friday'), shortLabel: t('weeklySchedule.friShort') },
  ];

  // Time slots (8 AM to 11 PM)
  const timeSlots = [
    '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00',
    '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00', '23:00'
  ];

  useEffect(() => {
    initializeWeek();
    // Auto-update week on Saturday at midnight
    const interval = setInterval(() => {
      const now = new Date();
      if (now.getDay() === 6 && now.getHours() === 0 && now.getMinutes() === 0) {
        initializeWeek();
      }
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, []);

  const initializeWeek = () => {
    const weekStart = getWeekStart(new Date());
    const weekId = getWeekId(weekStart);
    setCurrentWeekStart(weekStart);
    setCurrentWeekId(weekId);
    // Set selected day to today
    const today = getDayName();
    setSelectedDay(today);
  };

  // Get week start (Saturday)
  const getWeekStart = (date) => {
    const d = new Date(date);
    const day = d.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    const diff = (day + 1) % 7; // Days to subtract to get to Saturday
    d.setDate(d.getDate() - diff);
    d.setHours(0, 0, 0, 0);
    // Return in YYYY-MM-DD format using local date
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const dayOfMonth = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${dayOfMonth}`;
  };

  // Get week identifier
  const getWeekId = (weekStart) => {
    const date = new Date(weekStart);
    const year = date.getFullYear();
    const weekNum = getWeekNumber(date);
    return `${year}-W${String(weekNum).padStart(2, '0')}`;
  };

  // Get week number in year
  const getWeekNumber = (date) => {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  };

  // Get current day name
  const getDayName = () => {
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const jsDay = new Date().getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    return dayNames[jsDay];
  };

  // Get date for each day of the week
  const getDateForDay = (dayKey) => {
    if (!currentWeekStart) return '';

    // Map day keys to their index in the week (0 = Saturday)
    const dayMapping = {
      'saturday': 0,
      'sunday': 1,
      'monday': 2,
      'tuesday': 3,
      'wednesday': 4,
      'thursday': 5,
      'friday': 6
    };

    const dayOffset = dayMapping[dayKey];

    // Parse the week start date properly
    const [year, month, dayOfMonth] = currentWeekStart.split('-').map(Number);
    const weekStartDate = new Date(year, month - 1, dayOfMonth);

    // Calculate the day date
    const dayDate = new Date(weekStartDate);
    dayDate.setDate(weekStartDate.getDate() + dayOffset);

    const day = dayDate.getDate();
    const monthNames = [t('weeklySchedule.january'), t('weeklySchedule.february'), t('weeklySchedule.march'), t('weeklySchedule.april'), t('weeklySchedule.may'), t('weeklySchedule.june'),
                        t('weeklySchedule.july'), t('weeklySchedule.august'), t('weeklySchedule.september'), t('weeklySchedule.october'), t('weeklySchedule.november'), t('weeklySchedule.december')];
    const monthName = monthNames[dayDate.getMonth()];

    return `${day} ${monthName}`;
  };

  // Get schedule for specific day and time
  const getScheduleForSlot = (day, timeSlot) => {
    return weeklySchedules?.find(
      (s) => s.weekId === currentWeekId && s.day === day && s.timeSlot === timeSlot
    );
  };

  // Get worker name by ID
  const getWorkerName = (workerId) => {
    const worker = workerUsers?.find((w) => w.id === workerId);
    return worker?.name || t('common.unknown');
  };

  // Handle slot press
  const handleSlotPress = (timeSlot) => {
    const existingSchedule = getScheduleForSlot(selectedDay, timeSlot);

    if (existingSchedule) {
      // Edit existing schedule
      Alert.alert(
        t('weeklySchedule.editTask'),
        t('weeklySchedule.whatToDo'),
        [
          { text: t('common.cancel'), style: 'cancel' },
          {
            text: t('common.edit'),
            onPress: () => {
              setEditMode(true);
              setEditingScheduleId(existingSchedule.id);
              setSelectedSlots([timeSlot]);
              setSelectedWorker(existingSchedule.workerId);
              setWorkDescription(existingSchedule.description || '');
              setModalVisible(true);
            },
          },
          {
            text: t('weeklySchedule.deleteTask'),
            style: 'destructive',
            onPress: () => handleDeleteSchedule(existingSchedule.id),
          },
        ]
      );
    } else {
      // Add to selected slots for multi-select
      if (selectedSlots.includes(timeSlot)) {
        setSelectedSlots(selectedSlots.filter((s) => s !== timeSlot));
      } else {
        setSelectedSlots([...selectedSlots, timeSlot]);
      }
    }
  };

  // Open modal to assign work
  const openAssignModal = () => {
    if (selectedSlots.length === 0) {
      Alert.alert(t('common.alert'), t('weeklySchedule.selectAtLeastOneTime'));
      return;
    }
    setModalVisible(true);
  };

  // Handle save schedule
  const handleSaveSchedule = async () => {
    if (!selectedWorker) {
      Alert.alert(t('common.error'), t('weeklySchedule.selectWorker'));
      return;
    }

    if (!workDescription.trim()) {
      Alert.alert(t('common.error'), t('weeklySchedule.enterWorkDescription'));
      return;
    }

    setLoading(true);

    try {
      if (editMode) {
        // Update existing schedule
        const result = await updateWeeklySchedule(editingScheduleId, {
          workerId: selectedWorker,
          description: workDescription.trim(),
        });

        if (result.success) {
          Alert.alert(t('common.success'), t('weeklySchedule.taskUpdated'));
          closeModal();
        } else {
          Alert.alert(t('common.error'), result.error || t('weeklySchedule.taskUpdateFailed'));
        }
      } else {
        // Add new schedules for all selected slots
        for (const timeSlot of selectedSlots) {
          const result = await addWeeklySchedule({
            weekId: currentWeekId,
            weekStart: currentWeekStart,
            day: selectedDay,
            timeSlot,
            workerId: selectedWorker,
            description: workDescription.trim(),
          });

          if (!result.success) {
            Alert.alert(t('common.error'), result.error || t('weeklySchedule.taskAddFailed'));
            setLoading(false);
            return;
          }
        }

        Alert.alert(t('common.success'), t('weeklySchedule.tasksAdded', { count: selectedSlots.length }));
        closeModal();
      }
    } catch (error) {
      Alert.alert(t('common.error'), t('weeklySchedule.saveError'));
    }

    setLoading(false);
  };

  // Handle delete schedule
  const handleDeleteSchedule = async (scheduleId) => {
    Alert.alert(
      t('weeklySchedule.confirmDeleteTask'),
      t('weeklySchedule.confirmDeleteTaskQuestion'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('weeklySchedule.deleteTask'),
          style: 'destructive',
          onPress: async () => {
            const result = await removeWeeklySchedule(scheduleId);
            if (result.success) {
              Alert.alert(t('common.success'), t('weeklySchedule.taskDeleted'));
            } else {
              Alert.alert(t('common.error'), result.error || t('weeklySchedule.taskDeleteFailed'));
            }
          },
        },
      ]
    );
  };

  // Close modal and reset
  const closeModal = () => {
    setModalVisible(false);
    setSelectedSlots([]);
    setSelectedWorker(null);
    setWorkDescription('');
    setEditMode(false);
    setEditingScheduleId(null);
  };

  // Clear all selections
  const clearSelections = () => {
    setSelectedSlots([]);
  };


  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.weekInfo}>
          <Text style={styles.weekSubtitle}>{t('weeklySchedule.week')} {currentWeekId}</Text>
        </View>

        {/* Day Selector - Using FlatList instead of ScrollView */}
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.daySelector}
          contentContainerStyle={styles.daySelectorContent}
          data={daysOfWeek}
          keyExtractor={(item) => item.key}
          renderItem={({ item: day }) => (
            <TouchableOpacity
              onPress={() => {
                setSelectedDay(day.key);
                clearSelections();
              }}
              style={[
                styles.dayButton,
                selectedDay === day.key && styles.dayButtonActive,
              ]}
            >
              <Text
                style={[
                  styles.dayButtonText,
                  selectedDay === day.key && styles.dayButtonTextActive,
                ]}
              >
                {day.label}
              </Text>
              <Text
                style={[
                  styles.dayButtonDate,
                  selectedDay === day.key && styles.dayButtonDateActive,
                ]}
              >
                {getDateForDay(day.key)}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Schedule Grid - Using FlatList instead of ScrollView */}
      <FlatList
        style={styles.scheduleContainer}
        contentContainerStyle={styles.timeSlotsList}
        data={timeSlots}
        keyExtractor={(item) => item}
        renderItem={({ item: timeSlot }) => {
          const schedule = getScheduleForSlot(selectedDay, timeSlot);
          const isSelected = selectedSlots.includes(timeSlot);

          return (
            <TouchableOpacity
              onPress={() => handleSlotPress(timeSlot)}
              style={[
                styles.timeSlotCard,
                schedule && styles.timeSlotCardAssigned,
                isSelected && styles.timeSlotCardSelected,
              ]}
            >
              <View style={styles.timeSlotHeader}>
                <View style={styles.timeSlotTimeRow}>
                  <FontAwesome5 name="clock" size={12} color="#5DADE2" solid />
                  <Text style={styles.timeSlotTime}>{timeSlot}</Text>
                </View>
                {isSelected && (
                  <View style={styles.selectedBadge}>
                    <FontAwesome5 name="check" size={12} color="#27AE60" solid />
                  </View>
                )}
              </View>

              {schedule ? (
                <View style={styles.assignmentInfo}>
                  <View style={styles.workerNameRow}>
                    <FontAwesome5 name="user" size={12} color="#1ABC9C" solid />
                    <Text style={styles.workerName}>
                      {getWorkerName(schedule.workerId)}
                    </Text>
                  </View>
                  <Text style={styles.workDescription} numberOfLines={2}>
                    {schedule.description}
                  </Text>
                </View>
              ) : (
                <Text style={styles.emptySlotText}>{t('common.notSpecified')}</Text>
              )}
            </TouchableOpacity>
          );
        }}
      />

      {/* Action Buttons */}
      {selectedSlots.length > 0 && (
        <View style={styles.actionBar}>
          <Text style={styles.selectionCount}>
            {t('weeklySchedule.timeSelected', { count: selectedSlots.length })}
          </Text>
          <View style={styles.actionButtons}>
            <TouchableOpacity onPress={clearSelections} style={styles.clearButton}>
              <Text style={styles.clearButtonText}>{t('common.cancel')}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={openAssignModal} style={styles.assignButton}>
              <Text style={styles.assignButtonText}>{t('weeklySchedule.assignWork')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Assignment Modal */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editMode ? t('weeklySchedule.editTaskTitle') : t('weeklySchedule.assignWork')}
              </Text>
              <TouchableOpacity onPress={closeModal}>
                <FontAwesome5 name="times" size={20} color={colors.text.secondary} solid />
              </TouchableOpacity>
            </View>

            <KeyboardAvoidingView
              style={styles.keyboardAvoidingView}
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              keyboardVerticalOffset={Platform.OS === 'ios' ? 40 : 0}
            >
              <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <ScrollView contentContainerStyle={styles.modalBody}>
                  {/* Selected Time Info */}
                  <View style={styles.selectedTimeInfo}>
                    <Text style={styles.selectedTimeLabel}>{t('weeklySchedule.selectedTime')}</Text>
                    <Text style={styles.selectedTimeText}>
                      {editMode
                        ? selectedSlots[0]
                        : selectedSlots.sort().join(', ')}
                    </Text>
                  </View>

                  {/* Worker Selection - Using FlatList */}
                  <Text style={styles.inputLabel}>{t('weeklySchedule.chooseWorker')}</Text>
                  <FlatList
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.workerSelector}
                    data={workerUsers || []}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item: worker }) => (
                      <TouchableOpacity
                        onPress={() => setSelectedWorker(worker.id)}
                        style={[
                          styles.workerCard,
                          selectedWorker === worker.id && styles.workerCardSelected,
                        ]}
                      >
                        <FontAwesome5
                          name="user-circle"
                          size={24}
                          color={selectedWorker === worker.id ? '#1ABC9C' : colors.text.tertiary}
                          solid
                        />
                        <Text
                          style={[
                            styles.workerCardName,
                            selectedWorker === worker.id && styles.workerCardNameSelected,
                          ]}
                          numberOfLines={1}
                        >
                          {worker.name}
                        </Text>
                      </TouchableOpacity>
                    )}
                  />

                  {/* Work Description */}
                  <Text style={styles.inputLabel}>{t('weeklySchedule.workDescription')}</Text>
                  <TextInput
                    style={styles.textArea}
                    placeholder={t('weeklySchedule.enterWorkDesc')}
                    placeholderTextColor={colors.text.muted}
                    value={workDescription}
                    onChangeText={setWorkDescription}
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                  />

                  {/* Save Button */}
                  <TouchableOpacity
                    onPress={handleSaveSchedule}
                    style={[styles.saveButton, loading && styles.saveButtonDisabled]}
                    disabled={loading}
                  >
                    {loading ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <Text style={styles.saveButtonText}>
                        {editMode ? t('common.update') : t('common.save')}
                      </Text>
                    )}
                  </TouchableOpacity>
                </ScrollView>
              </TouchableWithoutFeedback>
            </KeyboardAvoidingView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  header: {
    backgroundColor: colors.background.secondary,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  weekInfo: {
    alignItems: 'center',
  },
  weekTitle: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.bold,
    color: colors.text.primary,
  },
  weekSubtitle: {
    fontSize: typography.size.sm,
    color: colors.text.tertiary,
    marginTop: spacing.xs,
  },
  daySelector: {
    paddingHorizontal: spacing.base,
  },
  daySelectorContent: {
    alignItems: 'center',
  },
  dayButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginRight: spacing.sm,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.background.tertiary,
  },
  dayButtonActive: {
    backgroundColor: colors.primary.main,
  },
  dayButtonText: {
    fontSize: typography.size.base,
    color: colors.text.secondary,
    fontWeight: typography.weight.semibold,
  },
  dayButtonTextActive: {
    color: '#fff',
  },
  dayButtonDate: {
    fontSize: typography.size.sm,
    color: colors.text.tertiary,
    marginTop: spacing.xs,
  },
  scheduleContainer: {
    flex: 1,
  },
  timeSlotsList: {
    padding: spacing.base,
  },
  timeSlotCard: {
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderLeftWidth: 3,
    borderLeftColor: colors.border.medium,
  },
  timeSlotCardAssigned: {
    borderLeftColor: colors.status.success,
    backgroundColor: colors.surface.elevated,
  },
  timeSlotCardSelected: {
    borderLeftColor: colors.primary.main,
    backgroundColor: colors.primary.subtle,
  },
  timeSlotHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  timeSlotTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  timeSlotTime: {
    fontSize: typography.size.base,
    fontWeight: typography.weight.bold,
    color: colors.text.primary,
  },
  selectedBadge: {
    backgroundColor: colors.status.success,
    borderRadius: borderRadius.sm,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  assignmentInfo: {
    marginTop: spacing.xs,
  },
  workerNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  workerName: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.bold,
    color: colors.text.primary,
  },
  workDescription: {
    fontSize: typography.size.base,
    color: colors.text.secondary,
    lineHeight: 20,
  },
  emptySlotText: {
    fontSize: typography.size.sm,
    color: colors.text.muted,
    fontStyle: 'italic',
  },
  actionBar: {
    backgroundColor: colors.background.secondary,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectionCount: {
    fontSize: typography.size.base,
    color: colors.text.primary,
    fontWeight: typography.weight.semibold,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  clearButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.border.medium,
  },
  clearButtonText: {
    color: '#fff',
    fontSize: typography.size.base,
    fontWeight: typography.weight.bold,
  },
  assignButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.primary.main,
  },
  assignButtonText: {
    color: '#fff',
    fontSize: typography.size.base,
    fontWeight: typography.weight.bold,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.background.overlay,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.background.secondary,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    maxHeight: '85%',
    paddingBottom: spacing.xl,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  modalTitle: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.bold,
    color: colors.text.primary,
  },
  closeButton: {
    fontSize: typography.size.xl,
    color: colors.text.tertiary,
    paddingHorizontal: spacing.sm,
  },
  modalBody: {
    padding: spacing.base,
  },
  selectedTimeInfo: {
    backgroundColor: colors.background.tertiary,
    padding: spacing.md,
    borderRadius: borderRadius.sm,
    marginBottom: spacing.lg,
  },
  selectedTimeLabel: {
    fontSize: typography.size.sm,
    color: colors.text.tertiary,
    marginBottom: spacing.xs,
  },
  selectedTimeText: {
    fontSize: typography.size.base,
    color: colors.text.primary,
    fontWeight: typography.weight.semibold,
  },
  inputLabel: {
    fontSize: typography.size.base,
    fontWeight: typography.weight.semibold,
    color: colors.text.primary,
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },
  workerSelector: {
    marginBottom: spacing.md,
  },
  workerCard: {
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginRight: spacing.sm,
    alignItems: 'center',
    minWidth: 80,
    borderWidth: 2,
    borderColor: colors.border.light,
  },
  workerCardSelected: {
    borderColor: colors.status.success,
    backgroundColor: colors.surface.elevated,
  },
  workerIcon: {
    fontSize: 24,
    marginBottom: spacing.xs,
  },
  workerCardName: {
    fontSize: typography.size.sm,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  workerCardNameSelected: {
    color: colors.primary.main,
    fontWeight: typography.weight.bold,
  },
  textArea: {
    backgroundColor: colors.background.tertiary,
    borderRadius: borderRadius.sm,
    padding: spacing.md,
    color: colors.text.primary,
    fontSize: typography.size.base,
    minHeight: 100,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  saveButton: {
    backgroundColor: colors.primary.main,
    borderRadius: borderRadius.sm,
    padding: spacing.base,
    alignItems: 'center',
    marginTop: spacing.md,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: typography.size.md,
    fontWeight: typography.weight.bold,
  },
});

export default WeeklyScheduleScreen;
