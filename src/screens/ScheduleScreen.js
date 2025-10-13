import React, { useContext, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert, ScrollView, TextInput, Modal } from 'react-native';
import { DataContext } from '../context/DataContext';

/**
 * ScheduleScreen allows admin to organize worker schedules from 12pm to 12am
 */
const ScheduleScreen = () => {
  const { workers, schedules, addSchedule, removeSchedule, updateSchedule } = useContext(DataContext);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [showWorkerPicker, setShowWorkerPicker] = useState(null); // null or hour index
  const [showDescriptionModal, setShowDescriptionModal] = useState(false);
  const [currentSchedule, setCurrentSchedule] = useState(null);
  const [workDescription, setWorkDescription] = useState('');

  // Generate time slots from 12pm to 12am (24-hour format: 12:00 to 00:00)
  const timeSlots = [
    '12:00', '13:00', '14:00', '15:00', '16:00', '17:00',
    '18:00', '19:00', '20:00', '21:00', '22:00', '23:00', '00:00'
  ];

  // Convert 24-hour format to 12-hour format with AM/PM
  const formatTime = (time) => {
    const [hour] = time.split(':');
    const h = parseInt(hour);
    if (h === 0) return '12:00 صباحاً';
    if (h === 12) return '12:00 ظهراً';
    if (h > 12) return `${h - 12}:00 مساءً`;
    return `${h}:00 صباحاً`;
  };

  // Get schedule for a specific date and time
  const getScheduleForTimeSlot = (date, time) => {
    if (!schedules) return [];
    return schedules.filter(s => s.date === date && s.timeSlot === time);
  };

  // Get worker name by ID
  const getWorkerName = (workerId) => {
    const worker = workers.find(w => w.id === workerId);
    return worker ? worker.name : 'غير معروف';
  };

  // Add worker to time slot with description
  const handleAddWorkerToSlot = async (timeSlot, workerId) => {
    if (!workerId) {
      Alert.alert('خطأ', 'يرجى اختيار عامل');
      return;
    }

    const newSchedule = {
      date: selectedDate,
      timeSlot: timeSlot,
      workerId: workerId,
      description: '',
    };

    const result = await addSchedule(newSchedule);

    if (result.success) {
      Alert.alert('نجح', 'تم إضافة العامل إلى الجدول');
      setShowWorkerPicker(null);
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

  // Get time slot color based on index
  const getTimeSlotColor = (index) => {
    const colors = [
      { bg: '#3b82f6', light: '#60a5fa' }, // Blue
      { bg: '#8b5cf6', light: '#a78bfa' }, // Purple
      { bg: '#ec4899', light: '#f472b6' }, // Pink
      { bg: '#f59e0b', light: '#fbbf24' }, // Amber
      { bg: '#10b981', light: '#34d399' }, // Green
      { bg: '#06b6d4', light: '#22d3ee' }, // Cyan
      { bg: '#6366f1', light: '#818cf8' }, // Indigo
    ];
    return colors[index % colors.length];
  };

  // Render time slot row
  const renderTimeSlot = (timeSlot, index) => {
    const assignedWorkers = getScheduleForTimeSlot(selectedDate, timeSlot);
    const isPickerOpen = showWorkerPicker === index;
    const slotColor = getTimeSlotColor(index);

    return (
      <View key={timeSlot} style={[styles.timeSlotCard, { borderLeftColor: slotColor.bg }]}>
        <View style={styles.timeSlotHeader}>
          <View style={[styles.timeIconBadge, { backgroundColor: slotColor.bg }]}>
            <Text style={styles.timeIconText}>🕐</Text>
          </View>
          <View style={styles.timeSlotHeaderCenter}>
            <Text style={styles.timeSlotTime}>{formatTime(timeSlot)}</Text>
            <Text style={styles.timeSlotSubtext}>{assignedWorkers.length} عامل</Text>
          </View>
          <TouchableOpacity
            style={[styles.addWorkerButton, { backgroundColor: slotColor.bg }]}
            onPress={() => setShowWorkerPicker(isPickerOpen ? null : index)}
          >
            <Text style={styles.addWorkerButtonText}>
              {isPickerOpen ? '✕' : '➕'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Worker Picker */}
        {isPickerOpen && (
          <View style={styles.workerPicker}>
            <Text style={styles.workerPickerTitle}>اختر عامل</Text>
            <ScrollView style={styles.workerPickerScroll} nestedScrollEnabled={true}>
              {workers.length > 0 ? (
                workers.map((worker) => (
                  <TouchableOpacity
                    key={worker.id}
                    style={styles.workerOption}
                    onPress={() => handleAddWorkerToSlot(timeSlot, worker.id)}
                  >
                    <View style={styles.workerOptionLeft}>
                      <View style={styles.workerAvatar}>
                        <Text style={styles.workerAvatarText}>👷</Text>
                      </View>
                      <View>
                        <Text style={styles.workerOptionText}>{worker.name}</Text>
                        <Text style={styles.workerOptionRole}>{worker.role || 'عامل'}</Text>
                      </View>
                    </View>
                    <Text style={styles.addIcon}>+</Text>
                  </TouchableOpacity>
                ))
              ) : (
                <Text style={styles.noWorkersText}>لا يوجد عمال متاحون</Text>
              )}
            </ScrollView>
          </View>
        )}

        {/* Assigned Workers */}
        {assignedWorkers.length > 0 ? (
          <View style={styles.assignedWorkersContainer}>
            {assignedWorkers.map((schedule) => (
              <View key={schedule.id} style={[styles.workerCard, { borderColor: slotColor.light }]}>
                <View style={styles.workerCardHeader}>
                  <View style={styles.workerCardLeft}>
                    <View style={[styles.workerCardAvatar, { backgroundColor: slotColor.bg }]}>
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
                      style={[styles.iconButton, { backgroundColor: slotColor.bg }]}
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
          <Text style={styles.dateButtonText}>‹</Text>
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
          <Text style={styles.dateButtonText}>›</Text>
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
            <Text style={styles.pageSubtitle}>12:00 PM - 12:00 AM</Text>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>📅</Text>
            <Text style={styles.emptyText}>لا توجد فترات زمنية</Text>
          </View>
        }
      />

      {/* Description Modal */}
      <Modal
        visible={showDescriptionModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowDescriptionModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>وصف العمل</Text>
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

                <Text style={styles.modalLabel}>اكتب وصف المهمة أو العمل المطلوب</Text>
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
    backgroundColor: '#0a0e1a',
  },
  contentContainer: {
    padding: 16,
  },
  headerSection: {
    marginBottom: 24,
    alignItems: 'center',
  },
  headerIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#1e293b',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 3,
    borderColor: '#3b82f6',
  },
  headerIcon: {
    fontSize: 40,
  },
  pageTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  pageSubtitle: {
    fontSize: 16,
    color: '#94a3b8',
    fontWeight: '600',
  },
  dateSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#1e293b',
    borderBottomWidth: 2,
    borderBottomColor: '#334155',
  },
  dateButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#334155',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateButtonText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  dateDisplayCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0f172a',
    borderRadius: 16,
    padding: 12,
    marginHorizontal: 12,
    borderWidth: 2,
    borderColor: '#3b82f6',
  },
  dateCalendarIcon: {
    width: 60,
    height: 60,
    borderRadius: 12,
    backgroundColor: '#3b82f6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  calendarMonth: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  calendarDay: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  dateInfo: {
    flex: 1,
  },
  dateText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  dateYear: {
    fontSize: 14,
    color: '#94a3b8',
  },
  todayBadge: {
    backgroundColor: '#10b981',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  todayBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
  },
  timeSlotCard: {
    backgroundColor: '#1e293b',
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
    borderLeftWidth: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  timeSlotHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  timeIconBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  timeIconText: {
    fontSize: 24,
  },
  timeSlotHeaderCenter: {
    flex: 1,
  },
  timeSlotTime: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  timeSlotSubtext: {
    fontSize: 13,
    color: '#94a3b8',
  },
  addWorkerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addWorkerButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  workerPicker: {
    backgroundColor: '#0f172a',
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#3b82f6',
    overflow: 'hidden',
  },
  workerPickerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    padding: 16,
    backgroundColor: '#1e293b',
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  workerPickerScroll: {
    maxHeight: 250,
  },
  workerOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  workerOptionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  workerAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#334155',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  workerAvatarText: {
    fontSize: 20,
  },
  workerOptionText: {
    fontSize: 16,
    color: '#e2e8f0',
    fontWeight: '600',
    marginBottom: 2,
  },
  workerOptionRole: {
    fontSize: 13,
    color: '#94a3b8',
  },
  addIcon: {
    fontSize: 24,
    color: '#3b82f6',
    fontWeight: 'bold',
  },
  noWorkersText: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    padding: 24,
  },
  assignedWorkersContainer: {
    gap: 12,
  },
  workerCard: {
    backgroundColor: '#0f172a',
    borderRadius: 16,
    padding: 14,
    borderWidth: 2,
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
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  workerCardAvatarText: {
    fontSize: 22,
  },
  workerCardInfo: {
    flex: 1,
  },
  workerCardName: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
    marginBottom: 4,
  },
  workerCardDescription: {
    fontSize: 13,
    color: '#94a3b8',
    lineHeight: 18,
  },
  workerCardActions: {
    flexDirection: 'row',
    gap: 8,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeIconButton: {
    backgroundColor: '#ef4444',
  },
  iconButtonText: {
    fontSize: 16,
  },
  emptySlot: {
    padding: 20,
    backgroundColor: '#0f172a',
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#334155',
    borderStyle: 'dashed',
  },
  emptySlotIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  emptySlotText: {
    fontSize: 13,
    color: '#64748b',
    fontStyle: 'italic',
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
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#1e293b',
    borderRadius: 24,
    width: '100%',
    maxWidth: 500,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#0f172a',
    borderBottomWidth: 2,
    borderBottomColor: '#334155',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
  },
  modalCloseButton: {
    fontSize: 24,
    color: '#94a3b8',
    fontWeight: 'bold',
  },
  modalBody: {
    padding: 20,
  },
  modalWorkerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    padding: 16,
    backgroundColor: '#0f172a',
    borderRadius: 16,
  },
  modalWorkerAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#3b82f6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  modalWorkerAvatarText: {
    fontSize: 28,
  },
  modalWorkerName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  modalLabel: {
    fontSize: 15,
    color: '#e2e8f0',
    marginBottom: 12,
    fontWeight: '600',
  },
  modalTextArea: {
    backgroundColor: '#0f172a',
    borderWidth: 2,
    borderColor: '#334155',
    borderRadius: 16,
    padding: 16,
    fontSize: 15,
    color: '#fff',
    minHeight: 120,
    marginBottom: 20,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalCancelButton: {
    backgroundColor: '#334155',
  },
  modalCancelButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalSaveButton: {
    backgroundColor: '#3b82f6',
  },
  modalSaveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ScheduleScreen;
