import React, { useContext, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert, ScrollView, TextInput, Modal } from 'react-native';
import { DataContext } from '../context/DataContext';
import { colors, typography, spacing, borderRadius, shadows } from '../styles/theme';

/**
 * ScheduleScreen allows admin to organize worker schedules from 12pm to 12am
 */
const ScheduleScreen = () => {
  const { workers, schedules, addSchedule, removeSchedule, updateSchedule, workerUsers } = useContext(DataContext);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);
  const [selectedWorker, setSelectedWorker] = useState(null);
  const [workDescription, setWorkDescription] = useState('');
  const [showDescriptionModal, setShowDescriptionModal] = useState(false);
  const [currentSchedule, setCurrentSchedule] = useState(null);

  // Generate time slots from 12pm to 12am (24-hour format: 12:00 to 00:00)
  const timeSlots = [
    '12:00', '13:00', '14:00', '15:00', '16:00', '17:00',
    '18:00', '19:00', '20:00', '21:00', '22:00', '23:00', '00:00'
  ];

  // Convert 24-hour format to simple hour:00 format without AM/PM
  const formatTime = (time) => {
    const [hour] = time.split(':');
    return `${parseInt(hour)}:00`;
  };

  // Get schedule for a specific date and time
  const getScheduleForTimeSlot = (date, time) => {
    if (!schedules) return [];
    return schedules.filter(s => s.date === date && s.timeSlot === time);
  };

  // Get worker name by ID
  const getWorkerName = (workerId) => {
    // Try to find in workerUsers first, then fall back to workers
    const workerUser = workerUsers?.find(w => w.id === workerId);
    if (workerUser) return workerUser.name;
    const worker = workers?.find(w => w.id === workerId);
    return worker ? worker.name : 'غير معروف';
  };

  // Open add worker modal
  const handleOpenAddModal = (timeSlot) => {
    setSelectedTimeSlot(timeSlot);
    setSelectedWorker(null);
    setWorkDescription('');
    setShowAddModal(true);
  };

  // Add worker to time slot with description
  const handleAddWorkerToSlot = async () => {
    if (!selectedWorker) {
      Alert.alert('خطأ', 'يرجى اختيار عامل');
      return;
    }

    if (!workDescription.trim()) {
      Alert.alert('خطأ', 'يرجى إدخال وصف العمل');
      return;
    }

    const newSchedule = {
      date: selectedDate,
      timeSlot: selectedTimeSlot,
      workerId: selectedWorker,
      description: workDescription.trim(),
    };

    const result = await addSchedule(newSchedule);

    if (result.success) {
      Alert.alert('نجح', 'تم إضافة العامل والعمل إلى الجدول بنجاح');
      setShowAddModal(false);
      setSelectedWorker(null);
      setWorkDescription('');
      setSelectedTimeSlot(null);
    } else {
      Alert.alert('خطأ', result.error || 'فشل إضافة العامل');
    }
  };

  // Open description modal
  const handleOpenDescriptionModal = (schedule) => {
    setCurrentSchedule(schedule);
    setWorkDescription(schedule.description || '');
    setShowDescriptionModal(true);
  };

  // Save description
  const handleSaveDescription = async () => {
    if (!currentSchedule) return;

    const result = await updateSchedule(currentSchedule.id, {
      description: workDescription.trim(),
    });

    if (result.success) {
      Alert.alert('نجح', 'تم حفظ الوصف بنجاح');
      setShowDescriptionModal(false);
      setCurrentSchedule(null);
      setWorkDescription('');
    } else {
      Alert.alert('خطأ', result.error || 'فشل حفظ الوصف');
    }
  };

  // Remove worker from time slot
  const handleRemoveWorkerFromSlot = (scheduleId, workerName) => {
    Alert.alert(
      'إزالة من الجدول',
      `هل تريد إزالة ${workerName} من هذه الفترة؟`,
      [
        { text: 'إلغاء', style: 'cancel' },
        {
          text: 'إزالة',
          style: 'destructive',
          onPress: async () => {
            const result = await removeSchedule(scheduleId);
            if (result.success) {
              Alert.alert('نجح', 'تم إزالة العامل من الجدول');
            } else {
              Alert.alert('خطأ', result.error || 'فشل إزالة العامل');
            }
          }
        }
      ]
    );
  };

  // Change selected date
  const changeDate = (days) => {
    const currentDate = new Date(selectedDate);
    currentDate.setDate(currentDate.getDate() + days);
    setSelectedDate(currentDate.toISOString().split('T')[0]);
  };

  // Format date for display (Christian calendar)
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', calendar: 'gregory' };
    return date.toLocaleDateString('en-US', options);
  };

  // Get short date format
  const getShortDate = (dateStr) => {
    const date = new Date(dateStr);
    const day = date.getDate();
    const month = date.toLocaleDateString('en-US', { month: 'short' });
    const year = date.getFullYear();
    return { day, month, year };
  };

  // Check if date is today
  const isToday = (dateStr) => {
    const today = new Date().toISOString().split('T')[0];
    return dateStr === today;
  };

  // Render time slot row
  const renderTimeSlot = (timeSlot) => {
    const assignedWorkers = getScheduleForTimeSlot(selectedDate, timeSlot);

    return (
      <View key={timeSlot} style={styles.timeSlotCard}>
        <View style={styles.timeSlotHeader}>
          <View style={styles.timeIconBadge}>
            <Text style={styles.timeIconText}>🕐</Text>
          </View>
          <View style={styles.timeSlotHeaderCenter}>
            <Text style={styles.timeSlotTime}>{formatTime(timeSlot)}</Text>
            <Text style={styles.timeSlotSubtext}>{assignedWorkers.length} عامل</Text>
          </View>
          <TouchableOpacity
            style={styles.addWorkerButton}
            onPress={() => handleOpenAddModal(timeSlot)}
          >
            <Text style={styles.addWorkerButtonText}>➕</Text>
          </TouchableOpacity>
        </View>

        {/* Assigned Workers */}
        {assignedWorkers.length > 0 ? (
          <View style={styles.assignedWorkersContainer}>
            {assignedWorkers.map((schedule) => (
              <View key={schedule.id} style={styles.workerCard}>
                <View style={styles.workerCardHeader}>
                  <View style={styles.workerCardLeft}>
                    <View style={styles.workerCardAvatar}>
                      <Text style={styles.workerCardAvatarText}>👷</Text>
                    </View>
                    <View style={styles.workerCardInfo}>
                      <Text style={styles.workerCardName}>{getWorkerName(schedule.workerId)}</Text>
                      {schedule.description && (
                        <Text style={styles.workerCardDescription} numberOfLines={2}>
                          {schedule.description}
                        </Text>
                      )}
                    </View>
                  </View>
                  <View style={styles.workerCardActions}>
                    <TouchableOpacity
                      onPress={() => handleOpenDescriptionModal(schedule)}
                      style={styles.iconButton}
                    >
                      <Text style={styles.iconButtonText}>✏️</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => handleRemoveWorkerFromSlot(schedule.id, getWorkerName(schedule.workerId))}
                      style={[styles.iconButton, styles.removeIconButton]}
                    >
                      <Text style={styles.iconButtonText}>🗑️</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.emptySlot}>
            <Text style={styles.emptySlotIcon}>📋</Text>
            <Text style={styles.emptySlotText}>لا يوجد عمال مجدولون في هذه الفترة</Text>
          </View>
        )}
      </View>
    );
  };

  const shortDate = getShortDate(selectedDate);

  return (
    <View style={styles.container}>
      {/* Enhanced Date Selector */}
      <View style={styles.dateSelector}>
        <TouchableOpacity style={styles.dateButton} onPress={() => changeDate(-1)}>
          <Text style={styles.dateButtonText}>→</Text>
        </TouchableOpacity>

        <View style={styles.dateDisplayCard}>
          <View style={styles.dateCalendarIcon}>
            <Text style={styles.calendarMonth}>{shortDate.month}</Text>
            <Text style={styles.calendarDay}>{shortDate.day}</Text>
          </View>
          <View style={styles.dateInfo}>
            <Text style={styles.dateText}>{formatDate(selectedDate)}</Text>
            <Text style={styles.dateYear}>{shortDate.year}</Text>
          </View>
          {isToday(selectedDate) && (
            <View style={styles.todayBadge}>
              <Text style={styles.todayBadgeText}>TODAY</Text>
            </View>
          )}
        </View>

        <TouchableOpacity style={styles.dateButton} onPress={() => changeDate(1)}>
          <Text style={styles.dateButtonText}>←</Text>
        </TouchableOpacity>
      </View>

      {/* Schedule List */}
      <FlatList
        data={timeSlots}
        keyExtractor={(item) => item}
        renderItem={({ item, index }) => renderTimeSlot(item, index)}
        contentContainerStyle={styles.contentContainer}
        ListHeaderComponent={
          <View style={styles.headerSection}>
            <View style={styles.headerIconContainer}>
              <Text style={styles.headerIcon}>📅</Text>
            </View>
            <Text style={styles.pageTitle}>Work Schedule</Text>
            <Text style={styles.pageSubtitle}>12:00 - 0:00</Text>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>📅</Text>
            <Text style={styles.emptyText}>لا توجد فترات زمنية</Text>
          </View>
        }
      />

      {/* Add Worker Modal */}
      <Modal
        visible={showAddModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>إضافة عامل للجدول</Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <Text style={styles.modalCloseButton}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <View style={styles.modalTimeInfo}>
                <Text style={styles.modalTimeIcon}>🕐</Text>
                <Text style={styles.modalTimeText}>{selectedTimeSlot && formatTime(selectedTimeSlot)}</Text>
              </View>

              <Text style={styles.modalLabel}>اختر العامل</Text>
              <ScrollView style={styles.workerSelectList} nestedScrollEnabled={true}>
                {workerUsers && workerUsers.length > 0 ? (
                  workerUsers.map((worker) => (
                    <TouchableOpacity
                      key={worker.id}
                      style={[
                        styles.workerSelectOption,
                        selectedWorker === worker.id && styles.workerSelectOptionSelected
                      ]}
                      onPress={() => setSelectedWorker(worker.id)}
                    >
                      <View style={styles.workerSelectLeft}>
                        <View style={[
                          styles.workerSelectAvatar,
                          selectedWorker === worker.id && styles.workerSelectAvatarSelected
                        ]}>
                          <Text style={styles.workerSelectAvatarText}>👷</Text>
                        </View>
                        <View>
                          <Text style={[
                            styles.workerSelectName,
                            selectedWorker === worker.id && styles.workerSelectNameSelected
                          ]}>
                            {worker.name}
                          </Text>
                          <Text style={styles.workerSelectRole}>{worker.email || 'عامل'}</Text>
                        </View>
                      </View>
                      {selectedWorker === worker.id && (
                        <Text style={styles.workerSelectCheck}>✓</Text>
                      )}
                    </TouchableOpacity>
                  ))
                ) : (
                  <View style={styles.emptyWorkerList}>
                    <Text style={styles.emptyWorkerIcon}>👷</Text>
                    <Text style={styles.emptyWorkerText}>لا يوجد عمال متاحون</Text>
                    <Text style={styles.emptyWorkerSubtext}>أضف مستخدمين بدور "worker" أولاً</Text>
                  </View>
                )}
              </ScrollView>

              <Text style={styles.modalLabel}>وصف العمل المطلوب</Text>
              <TextInput
                style={styles.modalTextArea}
                value={workDescription}
                onChangeText={setWorkDescription}
                placeholder="مثال: تنظيف الإسطبلات، إطعام الخيول، صيانة المعدات..."
                placeholderTextColor="#64748b"
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.modalCancelButton]}
                  onPress={() => setShowAddModal(false)}
                >
                  <Text style={styles.modalCancelButtonText}>إلغاء</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.modalSaveButton]}
                  onPress={handleAddWorkerToSlot}
                >
                  <Text style={styles.modalSaveButtonText}>إضافة</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>

      {/* Edit Description Modal */}
      <Modal
        visible={showDescriptionModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowDescriptionModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>تعديل وصف العمل</Text>
              <TouchableOpacity onPress={() => setShowDescriptionModal(false)}>
                <Text style={styles.modalCloseButton}>✕</Text>
              </TouchableOpacity>
            </View>

            {currentSchedule && (
              <View style={styles.modalBody}>
                <View style={styles.modalWorkerInfo}>
                  <View style={styles.modalWorkerAvatar}>
                    <Text style={styles.modalWorkerAvatarText}>👷</Text>
                  </View>
                  <Text style={styles.modalWorkerName}>{getWorkerName(currentSchedule.workerId)}</Text>
                </View>

                <Text style={styles.modalLabel}>وصف المهمة أو العمل المطلوب</Text>
                <TextInput
                  style={styles.modalTextArea}
                  value={workDescription}
                  onChangeText={setWorkDescription}
                  placeholder="مثال: تنظيف الإسطبلات، إطعام الخيول، صيانة المعدات..."
                  placeholderTextColor="#64748b"
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />

                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.modalCancelButton]}
                    onPress={() => setShowDescriptionModal(false)}
                  >
                    <Text style={styles.modalCancelButtonText}>إلغاء</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.modalSaveButton]}
                    onPress={handleSaveDescription}
                  >
                    <Text style={styles.modalSaveButtonText}>حفظ</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
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
  contentContainer: {
    padding: spacing.base,
  },
  headerSection: {
    marginBottom: spacing.lg,
    alignItems: 'center',
  },
  headerIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.surface.elevated,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
    borderWidth: 2,
    borderColor: colors.primary.main,
  },
  headerIcon: {
    fontSize: 32,
  },
  pageTitle: {
    fontSize: typography.size.xxl,
    fontWeight: typography.weight.bold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  pageSubtitle: {
    fontSize: typography.size.base,
    color: colors.text.tertiary,
    fontWeight: typography.weight.semibold,
  },
  dateSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.base,
    backgroundColor: colors.background.secondary,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  dateButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.background.tertiary,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.sm,
  },
  dateButtonText: {
    color: colors.text.primary,
    fontSize: typography.size.xl,
    fontWeight: typography.weight.bold,
  },
  dateDisplayCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface.elevated,
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    marginHorizontal: spacing.md,
    borderWidth: 1.5,
    borderColor: colors.primary.main,
  },
  dateCalendarIcon: {
    width: 50,
    height: 50,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.primary.main,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  calendarMonth: {
    color: '#fff',
    fontSize: typography.size.xs,
    fontWeight: typography.weight.bold,
    textTransform: 'uppercase',
  },
  calendarDay: {
    color: '#fff',
    fontSize: typography.size.xl,
    fontWeight: typography.weight.bold,
  },
  dateInfo: {
    flex: 1,
  },
  dateText: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.bold,
    color: colors.text.primary,
    marginBottom: 2,
  },
  dateYear: {
    fontSize: typography.size.xs,
    color: colors.text.tertiary,
  },
  todayBadge: {
    backgroundColor: colors.status.success,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  todayBadgeText: {
    color: '#fff',
    fontSize: typography.size.xs,
    fontWeight: typography.weight.bold,
  },
  timeSlotCard: {
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.lg,
    padding: spacing.base,
    marginBottom: spacing.md,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary.main,
    ...shadows.md,
  },
  timeSlotHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  timeIconBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary.main,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  timeIconText: {
    fontSize: 20,
  },
  timeSlotHeaderCenter: {
    flex: 1,
  },
  timeSlotTime: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.bold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  timeSlotSubtext: {
    fontSize: typography.size.xs,
    color: colors.text.tertiary,
  },
  addWorkerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary.main,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.sm,
  },
  addWorkerButtonText: {
    color: '#fff',
    fontSize: typography.size.lg,
    fontWeight: typography.weight.bold,
  },
  workerPicker: {
    backgroundColor: colors.surface.elevated,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
    borderWidth: 1.5,
    borderColor: colors.primary.main,
    overflow: 'hidden',
  },
  workerPickerTitle: {
    fontSize: typography.size.base,
    fontWeight: typography.weight.bold,
    color: colors.text.primary,
    padding: spacing.md,
    backgroundColor: colors.background.secondary,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  workerPickerScroll: {
    maxHeight: 200,
  },
  workerOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  workerOptionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  workerAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.background.tertiary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  workerAvatarText: {
    fontSize: 18,
  },
  workerOptionText: {
    fontSize: typography.size.base,
    color: colors.text.secondary,
    fontWeight: typography.weight.semibold,
    marginBottom: 2,
  },
  workerOptionRole: {
    fontSize: typography.size.xs,
    color: colors.text.tertiary,
  },
  addIcon: {
    fontSize: typography.size.xl,
    color: colors.primary.main,
    fontWeight: typography.weight.bold,
  },
  noWorkersText: {
    fontSize: typography.size.sm,
    color: colors.text.muted,
    textAlign: 'center',
    padding: spacing.lg,
  },
  assignedWorkersContainer: {
    gap: spacing.sm,
  },
  workerCard: {
    backgroundColor: colors.surface.elevated,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderWidth: 1.5,
  },
  workerCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  workerCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  workerCardAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  workerCardAvatarText: {
    fontSize: 20,
  },
  workerCardInfo: {
    flex: 1,
  },
  workerCardName: {
    fontSize: typography.size.base,
    color: colors.text.primary,
    fontWeight: typography.weight.bold,
    marginBottom: spacing.xs,
  },
  workerCardDescription: {
    fontSize: typography.size.xs,
    color: colors.text.tertiary,
    lineHeight: 16,
  },
  workerCardActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.sm,
  },
  removeIconButton: {
    backgroundColor: colors.status.error,
  },
  iconButtonText: {
    fontSize: 14,
  },
  emptySlot: {
    padding: spacing.base,
    backgroundColor: colors.surface.elevated,
    borderRadius: borderRadius.sm,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.border.light,
    borderStyle: 'dashed',
  },
  emptySlotIcon: {
    fontSize: 28,
    marginBottom: spacing.sm,
  },
  emptySlotText: {
    fontSize: typography.size.xs,
    color: colors.text.muted,
    fontStyle: 'italic',
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
  },
  // Modal Styles
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
    width: '100%',
    maxWidth: 500,
    overflow: 'hidden',
    ...shadows.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.base,
    backgroundColor: colors.surface.elevated,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  modalTitle: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.bold,
    color: colors.text.primary,
  },
  modalCloseButton: {
    fontSize: typography.size.xl,
    color: colors.text.tertiary,
    fontWeight: typography.weight.bold,
  },
  modalBody: {
    padding: spacing.base,
  },
  modalWorkerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.base,
    padding: spacing.md,
    backgroundColor: colors.surface.elevated,
    borderRadius: borderRadius.md,
  },
  modalWorkerAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary.main,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  modalWorkerAvatarText: {
    fontSize: 24,
  },
  modalWorkerName: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.bold,
    color: colors.text.primary,
  },
  modalLabel: {
    fontSize: typography.size.sm,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
    fontWeight: typography.weight.semibold,
  },
  modalTextArea: {
    backgroundColor: colors.background.primary,
    borderWidth: 1.5,
    borderColor: colors.border.light,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: typography.size.base,
    color: colors.text.primary,
    minHeight: 100,
    marginBottom: spacing.base,
  },
  modalActions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  modalButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    ...shadows.sm,
  },
  modalCancelButton: {
    backgroundColor: colors.background.tertiary,
  },
  modalCancelButtonText: {
    color: colors.text.secondary,
    fontSize: typography.size.base,
    fontWeight: typography.weight.bold,
  },
  modalSaveButton: {
    backgroundColor: colors.primary.main,
    ...shadows.sm,
  },
  modalSaveButtonText: {
    color: '#fff',
    fontSize: typography.size.base,
    fontWeight: typography.weight.bold,
  },
  // Worker Selection Styles for Add Modal
  modalTimeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.base,
    padding: spacing.md,
    backgroundColor: colors.primary.subtle,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.primary.main,
  },
  modalTimeIcon: {
    fontSize: 24,
    marginRight: spacing.sm,
  },
  modalTimeText: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.bold,
    color: colors.primary.main,
  },
  workerSelectList: {
    maxHeight: 200,
    marginBottom: spacing.base,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border.light,
    backgroundColor: colors.surface.elevated,
  },
  workerSelectOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  workerSelectOptionSelected: {
    backgroundColor: colors.primary.subtle,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary.main,
  },
  workerSelectLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  workerSelectAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.background.tertiary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  workerSelectAvatarSelected: {
    backgroundColor: colors.primary.main,
  },
  workerSelectAvatarText: {
    fontSize: 20,
  },
  workerSelectName: {
    fontSize: typography.size.base,
    color: colors.text.primary,
    fontWeight: typography.weight.semibold,
    marginBottom: 2,
  },
  workerSelectNameSelected: {
    color: colors.primary.main,
    fontWeight: typography.weight.bold,
  },
  workerSelectRole: {
    fontSize: typography.size.xs,
    color: colors.text.tertiary,
  },
  workerSelectCheck: {
    fontSize: typography.size.xl,
    color: colors.primary.main,
    fontWeight: typography.weight.bold,
  },
  emptyWorkerList: {
    padding: spacing.md,
    alignItems: 'center',
  },
  emptyWorkerIcon: {
    fontSize: 36,
    marginBottom: spacing.sm,
  },
  emptyWorkerText: {
    fontSize: typography.size.sm,
    color: colors.text.muted,
    textAlign: 'center',
    marginBottom: 4,
  },
  emptyWorkerSubtext: {
    fontSize: typography.size.xs,
    color: colors.text.tertiary,
    textAlign: 'center',
  },
});

export default ScheduleScreen;
