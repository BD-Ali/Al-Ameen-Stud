import React, { useContext, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ScrollView, Alert, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { DataContext } from '../context/DataContext';
import { colors, typography, spacing, borderRadius, shadows } from '../styles/theme';
import AnimatedCard from '../components/AnimatedCard';
import { FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from '../i18n/LanguageContext';

/**
 * LessonsScreen lists all scheduled lessons and allows the administrator to add
 * new lessons.
 */
const LessonsScreen = () => {
  const { t } = useTranslation();
  const { lessons, addLesson, removeLesson, horses, clients, workers, workerUsers } = useContext(DataContext);
  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [horseId, setHorseId] = useState('');
  const [clientId, setClientId] = useState('');
  const [instructorId, setInstructorId] = useState('');
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
      t('lessons.deleteLesson'),
      t('lessons.confirmDeleteLesson'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: async () => {
            const result = await removeLesson(id);
            if (result.success) {
              Alert.alert(t('common.success'), t('lessons.lessonDeleted'));
            } else {
              Alert.alert(t('common.error'), result.error || t('lessons.lessonDeleteFailed'));
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
      Alert.alert(t('common.error'), t('common.fillAllFields'));
      return;
    }
    const formattedDate = formatDate(date);
    const formattedTime = formatTime(time);

    const result = await addLesson({
      date: formattedDate,
      time: formattedTime,
      horseId,
      clientId,
      instructorId
    });

    if (result.success) {
      Alert.alert(t('common.success'), t('lessons.lessonScheduled'));
      setDate(new Date());
      setTime(new Date());
      setHorseId('');
      setClientId('');
      setInstructorId('');
    } else {
      Alert.alert(t('common.error'), result.error || t('lessons.lessonScheduleFailed'));
    }
  };

  const getHorseName = (id) => horses?.find((h) => h.id === id)?.name || id;
  const getClientName = (id) => clients?.find((c) => c.id === id)?.name || id;
  const getWorkerName = (id) => {
    // Try to find in workerUsers first, then fall back to workers
    const workerUser = workerUsers?.find((w) => w.id === id);
    if (workerUser) return workerUser.name;
    const worker = workers?.find((w) => w.id === id);
    return worker?.name || id;
  };

  const getSelectedHorseName = () => {
    const horse = horses?.find(h => h.id === horseId);
    return horse ? horse.name : t('lessons.chooseHorse');
  };

  const getSelectedClientName = () => {
    const client = clients?.find(c => c.id === clientId);
    return client ? client.name : t('lessons.chooseClient');
  };

  const getSelectedInstructorName = () => {
    const instructor = workerUsers?.find(w => w.id === instructorId);
    return instructor ? instructor.name : t('lessons.chooseInstructor');
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={lessons}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <View style={styles.headerSection}>
            <View style={styles.titleRow}>
              <FontAwesome5 name="book-open" size={24} color="#9B59B6" solid />
              <Text style={styles.pageTitle}>{t('lessons.title')}</Text>
            </View>
            <View style={styles.countBadge}>
              <Text style={styles.countText}>{lessons.length}</Text>
            </View>
          </View>
        }
        renderItem={({ item, index }) => (
          <AnimatedCard index={index} delay={80} style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.dateTimeContainer}>
                <View style={styles.dateTimeRow}>
                  <FontAwesome5 name="calendar-alt" size={14} color="#5DADE2" solid />
                  <Text style={styles.lessonDateTime}>{item.date}</Text>
                </View>
                <View style={styles.dateTimeRow}>
                  <FontAwesome5 name="clock" size={14} color="#F39C12" solid />
                  <Text style={styles.lessonTime}>{item.time}</Text>
                </View>
              </View>
              {item.confirmed && (
                <View style={styles.confirmedBadge}>
                  <FontAwesome5 name="check-circle" size={14} color="#27AE60" solid />
                  <Text style={styles.confirmedBadgeText}>{t('lessons.completed')}</Text>
                </View>
              )}
              {item.status === 'cancelled' && (
                <View style={styles.cancelledBadge}>
                  <FontAwesome5 name="times-circle" size={14} color="#E74C3C" solid />
                  <Text style={styles.cancelledBadgeText}>{t('lessons.cancelled')}</Text>
                </View>
              )}
              {item.status === 'scheduled' && !item.confirmed && (
                <View style={styles.scheduledBadge}>
                  <FontAwesome5 name="hourglass-half" size={14} color="#F39C12" solid />
                  <Text style={styles.scheduledBadgeText}>{t('lessons.scheduledStatus')}</Text>
                </View>
              )}
            </View>
            <View style={styles.cardRow}>
              <View style={styles.labelRow}>
                <MaterialCommunityIcons name="horse-variant" size={16} color="#F39C12" />
                <Text style={styles.cardLabel}>{t('lessons.horse')}</Text>
              </View>
              <Text style={styles.cardValue}>{getHorseName(item.horseId)}</Text>
            </View>
            <View style={styles.cardRow}>
              <View style={styles.labelRow}>
                <FontAwesome5 name="user" size={14} color="#1ABC9C" solid />
                <Text style={styles.cardLabel}>{t('lessons.client')}</Text>
              </View>
              <Text style={styles.cardValue}>{getClientName(item.clientId)}</Text>
            </View>
            <View style={styles.cardRow}>
              <View style={styles.labelRow}>
                <FontAwesome5 name="chalkboard-teacher" size={14} color="#3498DB" solid />
                <Text style={styles.cardLabel}>{t('lessons.instructor')}</Text>
              </View>
              <Text style={styles.cardValue}>{getWorkerName(item.instructorId)}</Text>
            </View>
            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => handleRemoveLesson(item.id)}
            >
              <FontAwesome5 name="trash-alt" size={14} color="#E74C3C" solid />
              <Text style={styles.removeButtonText}>{t('lessons.deleteLesson')}</Text>
            </TouchableOpacity>
          </AnimatedCard>
        )}
        ListFooterComponent={
          <View style={styles.formSection}>
            <View style={styles.formTitleRow}>
              <FontAwesome5 name="plus-circle" size={20} color="#27AE60" solid />
              <Text style={styles.formTitle}>{t('lessons.scheduleNewLesson')}</Text>
            </View>

            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <FontAwesome5 name="calendar-alt" size={14} color="#5DADE2" solid />
                <Text style={styles.label}>{t('lessons.selectDate')}</Text>
              </View>
              <TouchableOpacity
                style={styles.pickerButton}
                onPress={() => setShowDatePicker(true)}
              >
                <Text style={styles.pickerButtonText}>
                  {formatDate(date)}
                </Text>
                <FontAwesome5 name="calendar-alt" size={16} color="#5DADE2" solid />
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
                      <Text style={styles.confirmButtonText}>{t('common.ok')}</Text>
                    </TouchableOpacity>
                  )}
                </>
              )}
            </View>

            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <FontAwesome5 name="clock" size={14} color="#F39C12" solid />
                  <Text style={styles.label}>{t('lessons.selectTime')}</Text>
              </View>
              <TouchableOpacity
                style={styles.pickerButton}
                onPress={() => setShowTimePicker(true)}
              >
                <Text style={styles.pickerButtonText}>
                  {formatTime(time)}
                </Text>
                <FontAwesome5 name="clock" size={16} color="#F39C12" solid />
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
                      <Text style={styles.confirmButtonText}>{t('common.ok')}</Text>
                    </TouchableOpacity>
                  )}
                </>
              )}
            </View>

            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <MaterialCommunityIcons name="horse-variant" size={16} color="#F39C12" />
                <Text style={styles.label}>{t('lessons.selectHorse')}</Text>
              </View>
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
                <FontAwesome5 name={showHorsePicker ? 'chevron-up' : 'chevron-down'} size={12} color={colors.text.tertiary} solid />
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
                <Text style={styles.helpText}>{t('lessons.addHorsesFirst')}</Text>
              )}
            </View>

            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <FontAwesome5 name="user" size={14} color="#1ABC9C" solid />
                <Text style={styles.label}>{t('lessons.selectClient')}</Text>
              </View>
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
                <FontAwesome5 name={showClientPicker ? 'chevron-up' : 'chevron-down'} size={12} color={colors.text.tertiary} solid />
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
                <Text style={styles.helpText}>{t('lessons.addClientsFirst')}</Text>
              )}
            </View>

            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <FontAwesome5 name="chalkboard-teacher" size={14} color="#3498DB" solid />
                <Text style={styles.label}>{t('lessons.selectInstructor')}</Text>
              </View>
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
                <FontAwesome5 name={showInstructorPicker ? 'chevron-up' : 'chevron-down'} size={12} color={colors.text.tertiary} solid />
              </TouchableOpacity>

              {showInstructorPicker && (
                <ScrollView style={styles.pickerDropdown} nestedScrollEnabled={true}>
                  {workerUsers && workerUsers.length > 0 ? (
                    workerUsers.map((worker) => (
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
                    ))
                  ) : (
                    <View style={styles.emptyPickerState}>
                      <Text style={styles.emptyPickerText}>{t('lessons.noInstructorsAvailable')}</Text>
                      <Text style={styles.emptyPickerSubtext}>{t('lessons.addWorkersFirst')}</Text>
                    </View>
                  )}
                </ScrollView>
              )}

              {!workerUsers || workerUsers.length === 0 ? (
                <Text style={styles.helpText}>{t('lessons.noWorkersHint')}</Text>
              ) : null}
            </View>

            <TouchableOpacity style={styles.addButton} onPress={handleAddLesson}>
              <Text style={styles.addButtonText}>{t('lessons.scheduleLesson')}</Text>
            </TouchableOpacity>
          </View>
        }
        contentContainerStyle={styles.contentContainer}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <FontAwesome5 name="book-open" size={64} color="#9B59B6" solid />
            <Text style={styles.emptyText}>{t('lessons.noScheduledLessons')}</Text>
            <Text style={styles.emptySubtext}>{t('lessons.scheduleFirstLesson')}</Text>
          </View>
        }
      />
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
    paddingBottom: Platform.OS === 'android' ? 80 : spacing.base,
  },
  headerSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  pageTitle: {
    fontSize: typography.size.xxl,
    fontWeight: typography.weight.bold,
    color: colors.text.primary,
  },
  countBadge: {
    backgroundColor: colors.accent.purple,
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
    padding: spacing.md,
    marginBottom: spacing.md,
    borderStartWidth: 3,
    borderStartColor: colors.accent.purple,
    ...shadows.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  lessonDateTime: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.bold,
    color: colors.text.primary,
  },
  lessonTime: {
    fontSize: typography.size.base,
    color: colors.text.tertiary,
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  cardLabel: {
    fontSize: typography.size.sm,
    color: colors.text.tertiary,
    fontWeight: typography.weight.semibold,
  },
  cardValue: {
    flex: 1,
    fontSize: typography.size.sm,
    color: colors.text.secondary,
  },
  removeButton: {
    flexDirection: 'row',
    backgroundColor: colors.status.error,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  removeButtonText: {
    color: '#fff',
    fontSize: typography.size.sm,
    fontWeight: typography.weight.bold,
  },
  formSection: {
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.md,
    padding: spacing.base,
    marginTop: spacing.base,
  },
  formTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.base,
  },
  formTitle: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.bold,
    color: colors.text.primary,
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
  pickerButton: {
    backgroundColor: colors.background.primary,
    borderWidth: 1.5,
    borderColor: colors.border.light,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 48,
  },
  pickerButtonText: {
    fontSize: typography.size.base,
    color: colors.text.primary,
  },
  placeholderText: {
    color: colors.text.muted,
  },
  dropdownArrow: {
    fontSize: 16,
    color: colors.text.tertiary,
  },
  pickerDropdown: {
    maxHeight: 180,
    backgroundColor: colors.background.primary,
    borderWidth: 1.5,
    borderColor: colors.border.light,
    borderRadius: borderRadius.md,
    marginTop: spacing.sm,
  },
  pickerOption: {
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  pickerOptionSelected: {
    backgroundColor: colors.primary.subtle,
    borderStartWidth: 3,
    borderStartColor: colors.accent.purple,
  },
  pickerOptionText: {
    fontSize: typography.size.base,
    color: colors.text.secondary,
  },
  pickerOptionTextSelected: {
    color: colors.accent.purple,
    fontWeight: typography.weight.semibold,
  },
  helpText: {
    fontSize: typography.size.xs,
    color: colors.text.muted,
    fontStyle: 'italic',
    marginTop: spacing.xs,
  },
  confirmButton: {
    backgroundColor: colors.primary.main,
    padding: spacing.sm,
    borderRadius: borderRadius.sm,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  confirmButtonText: {
    color: colors.text.primary,
    fontSize: typography.size.sm,
    fontWeight: typography.weight.bold,
  },
  addButton: {
    backgroundColor: colors.accent.purple,
    height: 48,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.sm,
    ...shadows.md,
  },
  addButtonText: {
    color: colors.text.primary,
    fontSize: typography.size.base,
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
  dateTimeContainer: {
    gap: spacing.xs,
  },
  dateTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  confirmedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.status.success,
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  confirmedBadgeText: {
    color: '#fff',
    fontSize: typography.size.xs,
    fontWeight: typography.weight.bold,
  },
  cancelledBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.status.error,
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  cancelledBadgeText: {
    color: '#fff',
    fontSize: typography.size.xs,
    fontWeight: typography.weight.bold,
  },
  scheduledBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.primary.main,
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  scheduledBadgeText: {
    color: '#fff',
    fontSize: typography.size.xs,
    fontWeight: typography.weight.bold,
  },
  emptyPickerState: {
    padding: spacing.md,
    alignItems: 'center',
  },
  emptyPickerText: {
    fontSize: typography.size.sm,
    color: colors.text.muted,
    fontWeight: typography.weight.semibold,
  },
  emptyPickerSubtext: {
    fontSize: typography.size.xs,
    color: colors.text.tertiary,
    textAlign: 'center',
  },
});

export default LessonsScreen;
