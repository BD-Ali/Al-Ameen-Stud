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
} from 'react-native';
import { DataContext } from '../context/DataContext';
import { colors, typography, spacing, borderRadius } from '../styles/theme';

const WeeklyScheduleScreen = () => {
  const { weeklySchedules, workerUsers, addWeeklySchedule, updateWeeklySchedule, removeWeeklySchedule } = useContext(DataContext);

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

  // Days of the week (Sunday to Saturday)
  const daysOfWeek = [
    { key: 'sunday', label: 'الأحد', shortLabel: 'أحد' },
    { key: 'monday', label: 'الاثنين', shortLabel: 'اثنين' },
    { key: 'tuesday', label: 'الثلاثاء', shortLabel: 'ثلاثاء' },
    { key: 'wednesday', label: 'الأربعاء', shortLabel: 'أربعاء' },
    { key: 'thursday', label: 'الخميس', shortLabel: 'خميس' },
    { key: 'friday', label: 'الجمعة', shortLabel: 'جمعة' },
    { key: 'saturday', label: 'السبت', shortLabel: 'سبت' },
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

  // Get week start (Sunday)
  const getWeekStart = (date) => {
    const d = new Date(date);
    const day = d.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    const diff = day; // Days to subtract to get to Sunday
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
    return dayNames[new Date().getDay()]; // getDay() returns 0-6 where 0 is Sunday
  };

  // Get date for each day of the week
  const getDateForDay = (dayKey) => {
    if (!currentWeekStart) return '';

    // Map day keys to their index in the week (0 = Sunday)
    const dayMapping = {
      'sunday': 0,
      'monday': 1,
      'tuesday': 2,
      'wednesday': 3,
      'thursday': 4,
      'friday': 5,
      'saturday': 6
    };

    const dayOffset = dayMapping[dayKey];

    // Parse the week start date properly
    const [year, month, dayOfMonth] = currentWeekStart.split('-').map(Number);
    const weekStartDate = new Date(year, month - 1, dayOfMonth);

    // Calculate the day date
    const dayDate = new Date(weekStartDate);
    dayDate.setDate(weekStartDate.getDate() + dayOffset);

    const day = dayDate.getDate();
    const monthNames = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
                        'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
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
    return worker?.name || 'غير معروف';
  };

  // Handle slot press
  const handleSlotPress = (timeSlot) => {
    const existingSchedule = getScheduleForSlot(selectedDay, timeSlot);

    if (existingSchedule) {
      // Edit existing schedule
      Alert.alert(
        'تعديل المهمة',
        'ماذا تريد أن تفعل؟',
        [
          { text: 'إلغاء', style: 'cancel' },
          {
            text: 'تعديل',
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
            text: 'حذف',
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
      Alert.alert('تنبيه', 'الرجاء اختيار وقت واحد على الأقل');
      return;
    }
    setModalVisible(true);
  };

  // Handle save schedule
  const handleSaveSchedule = async () => {
    if (!selectedWorker) {
      Alert.alert('خطأ', 'الرجاء اختيار عامل');
      return;
    }

    if (!workDescription.trim()) {
      Alert.alert('خطأ', 'الرجاء إدخال وصف العمل');
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
          Alert.alert('نجح', 'تم تحديث المهمة بنجاح');
          closeModal();
        } else {
          Alert.alert('خطأ', result.error || 'فشل تحديث المهمة');
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
            Alert.alert('خطأ', result.error || 'فشل إضافة المهمة');
            setLoading(false);
            return;
          }
        }

        Alert.alert('نجح', `تم إضافة ${selectedSlots.length} مهمة بنجاح`);
        closeModal();
      }
    } catch (error) {
      Alert.alert('خطأ', 'حدث خطأ أثناء الحفظ');
    }

    setLoading(false);
  };

  // Handle delete schedule
  const handleDeleteSchedule = async (scheduleId) => {
    Alert.alert(
      'تأكيد الحذف',
      'هل أنت متأكد من حذف هذه المهمة؟',
      [
        { text: 'إلغاء', style: 'cancel' },
        {
          text: 'حذف',
          style: 'destructive',
          onPress: async () => {
            const result = await removeWeeklySchedule(scheduleId);
            if (result.success) {
              Alert.alert('نجح', 'تم حذف المهمة بنجاح');
            } else {
              Alert.alert('خطأ', result.error || 'فشل حذف المهمة');
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
          <Text style={styles.weekTitle}>جدول العمل الأسبوعي</Text>
          <Text style={styles.weekSubtitle}>أسبوع {currentWeekId}</Text>
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
                <Text style={styles.timeSlotTime}>⏰ {timeSlot}</Text>
                {isSelected && (
                  <View style={styles.selectedBadge}>
                    <Text style={styles.selectedBadgeText}>✓</Text>
                  </View>
                )}
              </View>

              {schedule ? (
                <View style={styles.assignmentInfo}>
                  <Text style={styles.workerName}>
                    👤 {getWorkerName(schedule.workerId)}
                  </Text>
                  <Text style={styles.workDescription} numberOfLines={2}>
                    {schedule.description}
                  </Text>
                </View>
              ) : (
                <Text style={styles.emptySlotText}>غير محدد</Text>
              )}
            </TouchableOpacity>
          );
        }}
      />

      {/* Action Buttons */}
      {selectedSlots.length > 0 && (
        <View style={styles.actionBar}>
          <Text style={styles.selectionCount}>
            {selectedSlots.length} وقت محدد
          </Text>
          <View style={styles.actionButtons}>
            <TouchableOpacity onPress={clearSelections} style={styles.clearButton}>
              <Text style={styles.clearButtonText}>إلغاء</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={openAssignModal} style={styles.assignButton}>
              <Text style={styles.assignButtonText}>تعيين عمل</Text>
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
                {editMode ? 'تعديل المهمة' : 'تعيين عمل'}
              </Text>
              <TouchableOpacity onPress={closeModal}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              {/* Selected Time Info */}
              <View style={styles.selectedTimeInfo}>
                <Text style={styles.selectedTimeLabel}>الوقت المحدد:</Text>
                <Text style={styles.selectedTimeText}>
                  {editMode
                    ? selectedSlots[0]
                    : selectedSlots.sort().join(', ')}
                </Text>
              </View>

              {/* Worker Selection - Using FlatList */}
              <Text style={styles.inputLabel}>اختر العامل</Text>
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
                    <Text style={styles.workerIcon}>👤</Text>
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
              <Text style={styles.inputLabel}>وصف العمل</Text>
              <TextInput
                style={styles.textArea}
                placeholder="مثال: رعاية الخيول، تنظيف الإسطبل، إطعام..."
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
                    {editMode ? 'تحديث' : 'حفظ'}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
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
    marginBottom: spacing.sm,
  },
  timeSlotTime: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.bold,
    color: colors.text.primary,
  },
  selectedBadge: {
    backgroundColor: colors.primary.main,
    borderRadius: borderRadius.full,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedBadgeText: {
    color: '#fff',
    fontSize: typography.size.sm,
    fontWeight: typography.weight.bold,
  },
  assignmentInfo: {
    marginTop: spacing.xs,
  },
  workerName: {
    fontSize: typography.size.base,
    fontWeight: typography.weight.semibold,
    color: colors.accent.pink,
    marginBottom: spacing.xs,
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
    backgroundColor: colors.background.tertiary,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginRight: spacing.sm,
    alignItems: 'center',
    minWidth: 80,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  workerCardSelected: {
    backgroundColor: colors.primary.subtle,
    borderColor: colors.primary.main,
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
