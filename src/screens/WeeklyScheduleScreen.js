import React, { useContext, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView,
  TextInput, Modal, Keyboard, TouchableWithoutFeedback, Animated,
  ActivityIndicator, Dimensions
} from 'react-native';
import { DataContext } from '../context/DataContext';
import { AuthContext } from '../context/AuthContext';
import { colors, typography, spacing, borderRadius, shadows } from '../styles/theme';

const { width } = Dimensions.get('window');

const WeeklyScheduleScreen = () => {
  const {
    workers,
    weeklySchedules,
    addWeeklySchedule,
    removeWeeklySchedule,
    saveScheduleAsDefault,
    loadDefaultSchedule,
    workerUsers
  } = useContext(DataContext);

  const { userRole } = useContext(AuthContext);
  const isAdmin = userRole === 'admin';

  const [currentWeekStart, setCurrentWeekStart] = useState(getWeekStart(new Date()));
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedDay, setSelectedDay] = useState(null);
  const [selectedTimeSlots, setSelectedTimeSlots] = useState([]);
  const [selectedWorker, setSelectedWorker] = useState(null);
  const [workDescription, setWorkDescription] = useState('');
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewSchedule, setViewSchedule] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));

  const daysOfWeek = [
    { key: 'saturday', label: 'السبت', shortLabel: 'Sat', dayOffset: 0, color: colors.primary.main },
    { key: 'sunday', label: 'الأحد', shortLabel: 'Sun', dayOffset: 1, color: colors.primary.light },
    { key: 'monday', label: 'الاثنين', shortLabel: 'Mon', dayOffset: 2, color: colors.primary.main },
    { key: 'tuesday', label: 'الثلاثاء', shortLabel: 'Tue', dayOffset: 3, color: colors.primary.light },
    { key: 'wednesday', label: 'الأربعاء', shortLabel: 'Wed', dayOffset: 4, color: colors.primary.main },
    { key: 'thursday', label: 'الخميس', shortLabel: 'Thu', dayOffset: 5, color: colors.primary.light },
    { key: 'friday', label: 'الجمعة', shortLabel: 'Fri', dayOffset: 6, color: colors.primary.dark }
  ];

  const timeSlots = [
    '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00',
    '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00', '23:00'
  ];

  const showToastNotification = (message, type = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      })
    ]).start();

    setTimeout(() => {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: -50,
          duration: 300,
          useNativeDriver: true,
        })
      ]).start(() => {
        setShowToast(false);
        slideAnim.setValue(50);
      });
    }, 3000);
  };

  function getWeekStart(date) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = day === 6 ? 0 : (day + 1) % 7;
    d.setDate(d.getDate() - diff);
    d.setHours(0, 0, 0, 0);
    return d.toISOString().split('T')[0];
  }

  function getDateForDay(dayOffset) {
    const start = new Date(currentWeekStart);
    const date = new Date(start);
    date.setDate(date.getDate() + dayOffset);
    return date.getDate();
  }

  function getMonthForDay(dayOffset) {
    const start = new Date(currentWeekStart);
    const date = new Date(start);
    date.setDate(date.getDate() + dayOffset);
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return monthNames[date.getMonth()];
  }

  function getWeekId(weekStart) {
    const date = new Date(weekStart);
    const year = date.getFullYear();
    const weekNum = getWeekNumber(date);
    return `${year}-W${String(weekNum).padStart(2, '0')}`;
  }

  function getWeekNumber(date) {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  }

  function getWeekRange(weekStart) {
    const start = new Date(weekStart);
    const end = new Date(start);
    end.setDate(end.getDate() + 6);
    const formatDate = (d) => {
      const day = d.getDate();
      const month = d.toLocaleDateString('en-US', { month: 'short' });
      return `${day} ${month}`;
    };
    return `${formatDate(start)} - ${formatDate(end)}`;
  }

  const changeWeek = (weeks) => {
    const current = new Date(currentWeekStart);
    current.setDate(current.getDate() + (weeks * 7));
    setCurrentWeekStart(current.toISOString().split('T')[0]);
  };

  const isCurrentWeek = () => {
    return currentWeekStart === getWeekStart(new Date());
  };

  const getScheduleForSlot = (day, time) => {
    if (!weeklySchedules) return null;
    const weekId = getWeekId(currentWeekStart);
    return weeklySchedules.find(s =>
      s.weekId === weekId &&
      s.day === day &&
      s.timeSlot === time
    );
  };

  const getWorkerName = (workerId) => {
    const workerUser = workerUsers?.find(w => w.id === workerId);
    if (workerUser) return workerUser.name;
    const worker = workers?.find(w => w.id === workerId);
    return worker ? worker.name : 'غير معروف';
  };

  const formatTime = (time) => {
    const [hour] = time.split(':');
    const h = parseInt(hour);
    if (h === 0) return '12 AM';
    if (h < 12) return `${h} AM`;
    if (h === 12) return '12 PM';
    return `${h - 12} PM`;
  };

  const toggleTimeSlot = (timeSlot) => {
    if (selectedTimeSlots.includes(timeSlot)) {
      setSelectedTimeSlots(selectedTimeSlots.filter(t => t !== timeSlot));
    } else {
      setSelectedTimeSlots([...selectedTimeSlots, timeSlot].sort());
    }
  };

  const handleOpenAddModal = (day) => {
    if (!isAdmin) {
      Alert.alert('تنبيه', 'فقط المسؤول يمكنه تعديل الجدول');
      return;
    }
    setSelectedDay(day);
    setSelectedTimeSlots([]);
    setSelectedWorker(null);
    setWorkDescription('');
    setShowAddModal(true);
  };

  const handleAddWorkerToSlots = async () => {
    if (!selectedWorker) {
      Alert.alert('خطأ', 'يرجى اختيار عامل');
      return;
    }
    if (selectedTimeSlots.length === 0) {
      Alert.alert('خطأ', 'يرجى اختيار فترة زمنية واحدة على الأقل');
      return;
    }
    if (!workDescription.trim()) {
      Alert.alert('خطأ', 'يرجى إدخال وصف العمل');
      return;
    }

    const weekId = getWeekId(currentWeekStart);
    Keyboard.dismiss();
    setShowAddModal(false);
    setIsLoading(true);
    setLoadingMessage(`جاري إضافة ${selectedTimeSlots.length} مهمة...`);

    try {
      for (const timeSlot of selectedTimeSlots) {
        const existing = getScheduleForSlot(selectedDay, timeSlot);
        if (existing) {
          await removeWeeklySchedule(existing.id);
        }
        const newSchedule = {
          weekId,
          weekStart: currentWeekStart,
          day: selectedDay,
          timeSlot,
          workerId: selectedWorker,
          description: workDescription.trim(),
        };
        await addWeeklySchedule(newSchedule);
      }
      setIsLoading(false);
      showToastNotification(`✅ تم إضافة ${selectedTimeSlots.length} مهمة بنجاح`, 'success');
      setSelectedWorker(null);
      setWorkDescription('');
      setSelectedDay(null);
      setSelectedTimeSlots([]);
    } catch (error) {
      setIsLoading(false);
      showToastNotification('فشل إضافة المهام', 'error');
    }
  };

  const handleViewSchedule = (schedule) => {
    setViewSchedule(schedule);
    setShowViewModal(true);
  };

  const handleRemoveSchedule = (scheduleId, workerName, day, time) => {
    if (!isAdmin) {
      Alert.alert('تنبيه', 'فقط المسؤول يمكنه تعديل الجدول');
      return;
    }
    Alert.alert(
      'إزالة من الجدول',
      `هل تريد إزالة ${workerName} من ${formatTime(time)}؟`,
      [
        { text: 'إلغاء', style: 'cancel' },
        {
          text: 'إزالة',
          style: 'destructive',
          onPress: async () => {
            setIsLoading(true);
            setLoadingMessage('جاري إزالة المهمة...');
            const result = await removeWeeklySchedule(scheduleId);
            setIsLoading(false);
            if (result.success) {
              showToastNotification('✅ تم إزالة المهمة بنجاح', 'success');
            } else {
              showToastNotification(result.error || 'فشل إزالة المهمة', 'error');
            }
          }
        }
      ]
    );
  };

  const handleSaveAsDefault = async () => {
    if (!isAdmin) {
      Alert.alert('تنبيه', 'فقط المسؤول يمكنه حفظ الجدول الافتراضي');
      return;
    }
    const weekId = getWeekId(currentWeekStart);
    const weekSchedules = weeklySchedules?.filter(s => s.weekId === weekId);
    if (!weekSchedules || weekSchedules.length === 0) {
      Alert.alert('تنبيه', 'لا توجد جداول لحفظها');
      return;
    }
    Alert.alert(
      '💾 حفظ كجدول افتراضي',
      `هل تريد حفظ هذا الجدول (${weekSchedules.length} مهمة) كنموذج افتراضي؟`,
      [
        { text: 'إلغاء', style: 'cancel' },
        {
          text: '💾 حفظ',
          onPress: async () => {
            setIsLoading(true);
            setLoadingMessage('جاري حفظ الجدول الافتراضي...');
            try {
              const result = await saveScheduleAsDefault(currentWeekStart);
              setIsLoading(false);
              if (result.success) {
                showToastNotification('✅ تم حفظ الجدول الافتراضي بنجاح!', 'success');
              } else {
                Alert.alert('خطأ', result.error || 'فشل حفظ الجدول');
              }
            } catch (error) {
              setIsLoading(false);
              Alert.alert('خطأ', 'حدث خطأ أثناء حفظ الجدول');
            }
          }
        }
      ]
    );
  };

  const handleApplyDefault = async () => {
    if (!isAdmin) {
      Alert.alert('تنبيه', 'فقط المسؤول يمكنه تطبيق الجدول الافتراضي');
      return;
    }
    Alert.alert(
      '📋 تطبيق الجدول الافتراضي',
      'هل تريد تطبيق الجدول الافتراضي المحفوظ على هذا الأسبوع؟',
      [
        { text: 'إلغاء', style: 'cancel' },
        {
          text: '📋 تطبيق',
          onPress: async () => {
            setIsLoading(true);
            setLoadingMessage('جاري تطبيق الجدول الافتراضي...');
            try {
              const result = await loadDefaultSchedule(currentWeekStart);
              setIsLoading(false);
              if (result.success) {
                showToastNotification('✅ تم تطبيق الجدول الافتراضي بنجاح!', 'success');
              } else {
                Alert.alert('خطأ', result.error || 'لا يوجد جدول افتراضي محفوظ');
              }
            } catch (error) {
              setIsLoading(false);
              Alert.alert('خطأ', 'حدث خطأ أثناء تطبيق الجدول');
            }
          }
        }
      ]
    );
  };

  const handleClearWeekSchedule = () => {
    if (!isAdmin) {
      Alert.alert('تنبيه', 'فقط المسؤول يمكنه مسح الجدول');
      return;
    }
    const weekId = getWeekId(currentWeekStart);
    const weekSchedules = weeklySchedules?.filter(s => s.weekId === weekId);
    if (!weekSchedules || weekSchedules.length === 0) {
      Alert.alert('تنبيه', 'لا توجد جداول لحذفها');
      return;
    }
    Alert.alert(
      'مسح جدول الأسبوع',
      `هل أنت متأكد من حذف ${weekSchedules.length} مهمة؟`,
      [
        { text: 'إلغاء', style: 'cancel' },
        {
          text: 'حذف الكل',
          style: 'destructive',
          onPress: async () => {
            setIsLoading(true);
            setLoadingMessage(`جاري حذف ${weekSchedules.length} مهمة...`);
            let count = 0;
            for (const schedule of weekSchedules) {
              const result = await removeWeeklySchedule(schedule.id);
              if (result.success) count++;
            }
            setIsLoading(false);
            showToastNotification(`✅ تم حذف ${count} مهمة بنجاح`, 'success');
          }
        }
      ]
    );
  };

  const renderCell = (day, timeSlot) => {
    const schedule = getScheduleForSlot(day.key, timeSlot);
    const isOccupied = !!schedule;
    const dayColor = day.color;

    return (
      <TouchableOpacity
        key={`${day.key}-${timeSlot}`}
        style={[
          styles.gridCell,
          isOccupied && { ...styles.gridCellOccupied, borderLeftColor: dayColor }
        ]}
        onPress={() => isOccupied ? handleViewSchedule(schedule) : null}
        onLongPress={() => isOccupied && isAdmin ? handleRemoveSchedule(schedule.id, getWorkerName(schedule.workerId), day.key, timeSlot) : null}
        activeOpacity={0.7}
      >
        {isOccupied ? (
          <View style={styles.cellContent}>
            <View style={[styles.cellIndicator, { backgroundColor: dayColor }]} />
            <View style={styles.cellTextContainer}>
              <Text style={styles.cellWorkerName} numberOfLines={1}>
                {getWorkerName(schedule.workerId)}
              </Text>
              <Text style={styles.cellDescription} numberOfLines={1}>
                {schedule.description}
              </Text>
            </View>
          </View>
        ) : (
          <Text style={styles.cellEmpty}>·</Text>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.weekNavigator}>
          <TouchableOpacity style={styles.weekButton} onPress={() => changeWeek(-1)}>
            <Text style={styles.weekButtonText}>→</Text>
          </TouchableOpacity>

          <View style={styles.weekDisplay}>
            <Text style={styles.weekTitle}>الأسبوع {getWeekId(currentWeekStart).split('-W')[1]}</Text>
            <Text style={styles.weekRange}>{getWeekRange(currentWeekStart)}</Text>
            {isCurrentWeek() && (
              <View style={styles.currentWeekBadge}>
                <Text style={styles.currentWeekText}>● الأسبوع الحالي</Text>
              </View>
            )}
          </View>

          <TouchableOpacity style={styles.weekButton} onPress={() => changeWeek(1)}>
            <Text style={styles.weekButtonText}>←</Text>
          </TouchableOpacity>
        </View>

        {isAdmin && (
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.modernButton}
              onPress={handleSaveAsDefault}
            >
              <Text style={styles.buttonIcon}>💾</Text>
              <Text style={styles.buttonText}>حفظ الجدول</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modernButton}
              onPress={handleApplyDefault}
            >
              <Text style={styles.buttonIcon}>📋</Text>
              <Text style={styles.buttonText}>تطبيق الجدول</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modernButton}
              onPress={handleClearWeekSchedule}
            >
              <Text style={styles.buttonIcon}>🗑️</Text>
              <Text style={styles.buttonText}>مسح الجدول</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.infoBar}>
          <Text style={styles.infoIcon}>ℹ️</Text>
          <Text style={styles.infoText}>
            {isAdmin ? 'انقر على التاريخ لإضافة • اضغط مطولاً للحذف' : 'انقر على الخلية لعرض التفاصيل'}
          </Text>
        </View>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={true} style={styles.horizontalScroll}>
        <View style={styles.scheduleGrid}>
          <View style={styles.headerRow}>
            <View style={styles.cornerCell}>
              <Text style={styles.cornerCellText}>اليوم</Text>
              <Text style={styles.cornerCellSubtext}>الوقت</Text>
            </View>
            {timeSlots.map(timeSlot => (
              <View key={timeSlot} style={styles.timeHeader}>
                <Text style={styles.timeHeaderText}>{formatTime(timeSlot)}</Text>
              </View>
            ))}
          </View>

          <ScrollView style={styles.verticalScroll} showsVerticalScrollIndicator={true}>
            {daysOfWeek.map(day => (
              <View key={day.key} style={styles.dayRow}>
                <TouchableOpacity
                  style={[styles.dayLabel, { borderLeftColor: day.color }]}
                  onPress={() => isAdmin ? handleOpenAddModal(day.key) : null}
                  activeOpacity={isAdmin ? 0.7 : 1}
                >
                  <View style={[styles.dayColorStrip, { backgroundColor: day.color }]} />
                  <View style={styles.dayLabelContent}>
                    <Text style={styles.dayDateNumber}>{getDateForDay(day.dayOffset)}</Text>
                    <Text style={styles.dayMonth}>{getMonthForDay(day.dayOffset)}</Text>
                    <Text style={styles.dayName}>{day.label}</Text>
                    {isAdmin && (
                      <View style={styles.addIconContainer}>
                        <Text style={styles.addIcon}>+</Text>
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
                {timeSlots.map(timeSlot => renderCell(day, timeSlot))}
              </View>
            ))}
          </ScrollView>
        </View>
      </ScrollView>

      {isLoading && (
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingCard}>
            <ActivityIndicator size="large" color={colors.accent.purple} />
            <Text style={styles.loadingText}>{loadingMessage}</Text>
          </View>
        </View>
      )}

      {showToast && (
        <Animated.View
          style={[
            styles.toast,
            toastType === 'success' && styles.toastSuccess,
            toastType === 'error' && styles.toastError,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <Text style={styles.toastText}>{toastMessage}</Text>
        </Animated.View>
      )}

      {isAdmin && (
        <Modal
          visible={showAddModal}
          transparent={true}
          animationType="slide"
          onRequestClose={() => {
            Keyboard.dismiss();
            setShowAddModal(false);
          }}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.modalOverlay}>
              <TouchableWithoutFeedback>
                <View style={styles.modalContent}>
                  <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>
                      إضافة مهمة • {daysOfWeek.find(d => d.key === selectedDay)?.label}
                    </Text>
                    <TouchableOpacity
                      onPress={() => {
                        Keyboard.dismiss();
                        setShowAddModal(false);
                      }}
                      style={styles.modalCloseButton}
                    >
                      <Text style={styles.modalCloseIcon}>✕</Text>
                    </TouchableOpacity>
                  </View>

                  <ScrollView style={styles.modalBody} keyboardShouldPersistTaps="handled">
                    <Text style={styles.modalLabel}>⏰ اختر الفترات الزمنية</Text>
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      style={styles.timeSlotSelectorScroll}
                    >
                      <View style={styles.timeSlotSelector}>
                        {timeSlots.map(timeSlot => (
                          <TouchableOpacity
                            key={timeSlot}
                            style={[
                              styles.timeSlotChip,
                              selectedTimeSlots.includes(timeSlot) && styles.timeSlotChipSelected
                            ]}
                            onPress={() => toggleTimeSlot(timeSlot)}
                          >
                            <Text style={[
                              styles.timeSlotChipText,
                              selectedTimeSlots.includes(timeSlot) && styles.timeSlotChipTextSelected
                            ]}>
                              {formatTime(timeSlot)}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </ScrollView>

                    {selectedTimeSlots.length > 0 && (
                      <View style={styles.selectedTimeSummary}>
                        <Text style={styles.selectedTimeSummaryText}>
                          ✓ تم اختيار {selectedTimeSlots.length} فترة زمنية
                        </Text>
                      </View>
                    )}

                    <Text style={styles.modalLabel}>👷 اختر العامل</Text>
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
                              <View style={styles.workerAvatar}>
                                <Text style={styles.workerAvatarText}>
                                  {worker.name?.charAt(0) || '👷'}
                                </Text>
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
                        </View>
                      )}
                    </ScrollView>

                    <Text style={styles.modalLabel}>📋 وصف العمل المطلوب</Text>
                    <TextInput
                      style={styles.modalTextArea}
                      value={workDescription}
                      onChangeText={setWorkDescription}
                      placeholder="مثال: تنظيف الإسطبلات، إطعام الخيول..."
                      placeholderTextColor={colors.text.muted}
                      multiline
                      numberOfLines={3}
                      textAlignVertical="top"
                      returnKeyType="done"
                      onSubmitEditing={Keyboard.dismiss}
                    />

                    <View style={styles.modalActions}>
                      <TouchableOpacity
                        style={[styles.modalButton, styles.modalCancelButton]}
                        onPress={() => {
                          Keyboard.dismiss();
                          setShowAddModal(false);
                        }}
                      >
                        <Text style={styles.modalCancelButtonText}>إلغاء</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.modalButton, styles.modalSaveButton]}
                        onPress={handleAddWorkerToSlots}
                      >
                        <Text style={styles.modalSaveButtonText}>✓ إضافة</Text>
                      </TouchableOpacity>
                    </View>
                  </ScrollView>
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
      )}

      <Modal
        visible={showViewModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowViewModal(false)}
      >
        <TouchableWithoutFeedback onPress={() => setShowViewModal(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.viewModalContent}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>📋 تفاصيل المهمة</Text>
                  <TouchableOpacity
                    onPress={() => setShowViewModal(false)}
                    style={styles.modalCloseButton}
                  >
                    <Text style={styles.modalCloseIcon}>✕</Text>
                  </TouchableOpacity>
                </View>

                {viewSchedule && (
                  <View style={styles.modalBody}>
                    <View style={styles.detailCard}>
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>👷 العامل</Text>
                        <Text style={styles.detailValue}>{getWorkerName(viewSchedule.workerId)}</Text>
                      </View>
                      <View style={styles.detailDivider} />
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>📅 اليوم</Text>
                        <Text style={styles.detailValue}>
                          {daysOfWeek.find(d => d.key === viewSchedule.day)?.label}
                        </Text>
                      </View>
                      <View style={styles.detailDivider} />
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>🕐 الوقت</Text>
                        <Text style={styles.detailValue}>{formatTime(viewSchedule.timeSlot)}</Text>
                      </View>
                      <View style={styles.detailDivider} />
                      <View style={styles.detailColumn}>
                        <Text style={styles.detailLabel}>📋 الوصف</Text>
                        <Text style={styles.detailValueMultiline}>{viewSchedule.description}</Text>
                      </View>
                    </View>

                    {isAdmin && (
                      <TouchableOpacity
                        style={styles.deleteButton}
                        onPress={() => {
                          setShowViewModal(false);
                          handleRemoveSchedule(
                            viewSchedule.id,
                            getWorkerName(viewSchedule.workerId),
                            viewSchedule.day,
                            viewSchedule.timeSlot
                          );
                        }}
                      >
                        <Text style={styles.deleteButtonText}>🗑️ حذف هذه المهمة</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                )}
              </View>
            </TouchableWithoutFeedback>
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
  header: {
    backgroundColor: colors.background.secondary,
    borderBottomLeftRadius: borderRadius.xl,
    borderBottomRightRadius: borderRadius.xl,
    ...shadows.lg,
    overflow: 'hidden',
  },
  weekNavigator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.base,
    backgroundColor: colors.primary.main,
  },
  weekButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary.dark,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.md,
  },
  weekButtonText: {
    color: colors.text.primary,
    fontSize: typography.size.xxxl,
    fontWeight: typography.weight.semibold,
  },
  weekDisplay: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: spacing.base,
  },
  weekTitle: {
    fontSize: typography.size.xl,
    fontWeight: typography.weight.bold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  weekRange: {
    fontSize: typography.size.sm,
    color: colors.text.secondary,
    fontWeight: typography.weight.medium,
  },
  currentWeekBadge: {
    backgroundColor: colors.status.success,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
    marginTop: spacing.sm,
  },
  currentWeekText: {
    color: colors.text.primary,
    fontSize: typography.size.xs,
    fontWeight: typography.weight.semibold,
  },
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
    gap: spacing.xs,
  },
  modernButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.lg,
    gap: spacing.xs,
    backgroundColor: colors.primary.main,
    ...shadows.sm,
  },
  buttonIcon: {
    fontSize: typography.size.md,
  },
  buttonText: {
    color: colors.text.primary,
    fontSize: typography.size.sm,
    fontWeight: typography.weight.semibold,
  },
  infoBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.base,
    backgroundColor: colors.background.tertiary,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
    gap: spacing.sm,
  },
  infoIcon: {
    fontSize: typography.size.md,
  },
  infoText: {
    fontSize: typography.size.sm,
    color: colors.text.tertiary,
    textAlign: 'center',
    fontWeight: typography.weight.medium,
  },
  horizontalScroll: {
    flex: 1,
  },
  scheduleGrid: {
    paddingBottom: spacing.lg,
  },
  headerRow: {
    flexDirection: 'row',
    backgroundColor: colors.background.secondary,
    borderBottomWidth: 2,
    borderBottomColor: colors.border.medium,
  },
  cornerCell: {
    width: 100,
    padding: spacing.md,
    backgroundColor: colors.background.tertiary,
    borderRightWidth: 2,
    borderRightColor: colors.border.medium,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cornerCellText: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.bold,
    color: colors.text.primary,
  },
  cornerCellSubtext: {
    fontSize: typography.size.xs,
    color: colors.text.tertiary,
    marginTop: 2,
  },
  timeHeader: {
    width: 90,
    padding: spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background.secondary,
  },
  timeHeaderText: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.semibold,
    color: colors.text.secondary,
  },
  verticalScroll: {
    flex: 1,
  },
  dayRow: {
    flexDirection: 'row',
  },
  dayLabel: {
    width: 100,
    minHeight: 80,
    backgroundColor: colors.background.secondary,
    borderRightWidth: 2,
    borderRightColor: colors.border.medium,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
    borderLeftWidth: 4,
    justifyContent: 'center',
    position: 'relative',
  },
  dayColorStrip: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
  },
  dayLabelContent: {
    alignItems: 'center',
    padding: spacing.sm,
  },
  dayDateNumber: {
    fontSize: typography.size.xxl,
    fontWeight: typography.weight.bold,
    color: colors.text.primary,
  },
  dayMonth: {
    fontSize: typography.size.xs,
    color: colors.text.tertiary,
    fontWeight: typography.weight.medium,
    marginTop: 2,
  },
  dayName: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.semibold,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  addIconContainer: {
    marginTop: spacing.sm,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.accent.yellow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addIcon: {
    fontSize: typography.size.md,
    color: colors.text.inverse,
    fontWeight: typography.weight.semibold,
  },
  gridCell: {
    width: 90,
    minHeight: 80,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
    borderRightWidth: 1,
    borderRightColor: colors.border.light,
    backgroundColor: colors.background.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.sm,
  },
  gridCellOccupied: {
    backgroundColor: colors.surface.elevated,
    borderLeftWidth: 3,
  },
  cellContent: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
  },
  cellIndicator: {
    width: 4,
    height: 40,
    borderRadius: 2,
    marginRight: spacing.sm,
  },
  cellTextContainer: {
    flex: 1,
  },
  cellWorkerName: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.semibold,
    color: colors.text.primary,
    marginBottom: 2,
  },
  cellDescription: {
    fontSize: typography.size.xs,
    color: colors.text.tertiary,
  },
  cellEmpty: {
    fontSize: typography.size.xl,
    color: colors.border.medium,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.background.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  loadingCard: {
    backgroundColor: colors.background.secondary,
    padding: spacing.xxxl,
    borderRadius: borderRadius.xl,
    alignItems: 'center',
    ...shadows.xl,
    minWidth: 200,
  },
  loadingText: {
    marginTop: spacing.base,
    fontSize: typography.size.md,
    color: colors.text.secondary,
    fontWeight: typography.weight.semibold,
    textAlign: 'center',
  },
  toast: {
    position: 'absolute',
    top: 60,
    left: spacing.lg,
    right: spacing.lg,
    backgroundColor: colors.background.secondary,
    padding: spacing.base,
    borderRadius: borderRadius.lg,
    ...shadows.lg,
    zIndex: 1001,
    borderLeftWidth: 4,
  },
  toastSuccess: {
    borderLeftColor: colors.status.success,
  },
  toastError: {
    borderLeftColor: colors.status.error,
  },
  toastText: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.semibold,
    color: colors.text.primary,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.background.overlay,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: width * 0.9,
    maxHeight: '85%',
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.xxl,
    overflow: 'hidden',
    ...shadows.xl,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    backgroundColor: colors.background.tertiary,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  modalTitle: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.bold,
    color: colors.text.primary,
    flex: 1,
  },
  modalCloseButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.surface.hover,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCloseIcon: {
    fontSize: typography.size.lg,
    color: colors.text.tertiary,
    fontWeight: typography.weight.semibold,
  },
  modalBody: {
    padding: spacing.lg,
  },
  modalLabel: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.semibold,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
    marginTop: spacing.base,
  },
  timeSlotSelectorScroll: {
    marginBottom: spacing.md,
  },
  timeSlotSelector: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingBottom: spacing.xs,
  },
  timeSlotChip: {
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    backgroundColor: colors.background.tertiary,
    borderWidth: 2,
    borderColor: colors.border.medium,
  },
  timeSlotChipSelected: {
    backgroundColor: colors.accent.purple,
    borderColor: colors.accent.purple,
  },
  timeSlotChipText: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.semibold,
    color: colors.text.secondary,
  },
  timeSlotChipTextSelected: {
    color: colors.text.primary,
  },
  selectedTimeSummary: {
    backgroundColor: `${colors.status.success}20`,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.status.success,
  },
  selectedTimeSummaryText: {
    fontSize: typography.size.sm,
    color: colors.status.success,
    fontWeight: typography.weight.semibold,
    textAlign: 'center',
  },
  workerSelectList: {
    maxHeight: 220,
    marginBottom: spacing.md,
  },
  workerSelectOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: colors.background.tertiary,
    marginBottom: spacing.sm,
    borderWidth: 2,
    borderColor: colors.border.light,
  },
  workerSelectOptionSelected: {
    backgroundColor: `${colors.accent.purple}20`,
    borderColor: colors.accent.purple,
  },
  workerSelectLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: spacing.md,
  },
  workerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.accent.purple,
    alignItems: 'center',
    justifyContent: 'center',
  },
  workerAvatarText: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.bold,
    color: colors.text.primary,
  },
  workerSelectName: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.semibold,
    color: colors.text.primary,
  },
  workerSelectNameSelected: {
    color: colors.accent.purple,
  },
  workerSelectRole: {
    fontSize: typography.size.sm,
    color: colors.text.tertiary,
    marginTop: 2,
  },
  workerSelectCheck: {
    fontSize: typography.size.xl,
    color: colors.accent.purple,
    fontWeight: typography.weight.bold,
  },
  emptyWorkerList: {
    padding: spacing.xxxl,
    alignItems: 'center',
  },
  emptyWorkerIcon: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  emptyWorkerText: {
    fontSize: typography.size.sm,
    color: colors.text.tertiary,
  },
  modalTextArea: {
    backgroundColor: colors.background.tertiary,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: typography.size.sm,
    color: colors.text.primary,
    borderWidth: 2,
    borderColor: colors.border.light,
    minHeight: 80,
  },
  modalActions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.xl,
  },
  modalButton: {
    flex: 1,
    padding: spacing.base,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCancelButton: {
    backgroundColor: colors.surface.hover,
  },
  modalCancelButtonText: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.semibold,
    color: colors.text.tertiary,
  },
  modalSaveButton: {
    backgroundColor: colors.accent.purple,
    ...shadows.md,
  },
  modalSaveButtonText: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.bold,
    color: colors.text.primary,
  },
  viewModalContent: {
    width: width * 0.85,
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.xxl,
    overflow: 'hidden',
    ...shadows.xl,
  },
  detailCard: {
    backgroundColor: colors.background.tertiary,
    borderRadius: borderRadius.lg,
    padding: spacing.base,
    marginBottom: spacing.base,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  detailColumn: {
    paddingVertical: spacing.md,
  },
  detailLabel: {
    fontSize: typography.size.sm,
    color: colors.text.tertiary,
    fontWeight: typography.weight.semibold,
  },
  detailValue: {
    fontSize: typography.size.md,
    color: colors.text.primary,
    fontWeight: typography.weight.semibold,
    textAlign: 'right',
    flex: 1,
    marginLeft: spacing.base,
  },
  detailValueMultiline: {
    fontSize: typography.size.sm,
    color: colors.text.primary,
    fontWeight: typography.weight.medium,
    marginTop: spacing.sm,
    lineHeight: 20,
  },
  detailDivider: {
    height: 1,
    backgroundColor: colors.border.light,
  },
  deleteButton: {
    backgroundColor: `${colors.status.error}20`,
    padding: spacing.base,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.status.error,
  },
  deleteButtonText: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.semibold,
    color: colors.status.error,
  },
});

export default WeeklyScheduleScreen;

