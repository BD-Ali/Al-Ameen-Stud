import React, { useContext, useState, useEffect } from 'react';
import { View, Text, TextInput, FlatList, StyleSheet, TouchableOpacity, Alert, Modal, ScrollView, Platform, TouchableWithoutFeedback, Keyboard, Image, ActivityIndicator } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as Notifications from 'expo-notifications';
import * as ImagePicker from 'expo-image-picker';
import { DataContext } from '../context/DataContext';
import { colors, typography, spacing, borderRadius, shadows } from '../styles/theme';
import { uploadImageToCloudinary, getOptimizedImageUrl } from '../config/cloudinaryConfig';
import AnimatedCard from '../components/AnimatedCard';
import { FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from '../i18n/LanguageContext';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

const HorsesScreen = () => {
  const { t } = useTranslation();
  const { horses, addHorse, removeHorse, reminders, addReminder, removeReminder } = useContext(DataContext);

  const [name, setName] = useState('');
  const [breed, setBreed] = useState('');
  const [owner, setOwner] = useState('');
  const [feedSchedule, setFeedSchedule] = useState('');
  const [notes, setNotes] = useState('');
  const [imageUri, setImageUri] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
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
      Alert.alert(t('common.alert'), t('horses.notificationPermission'));
    }
  };

  // Image picker functions
  const pickImage = async (useCamera = false) => {
    try {
      // Request permissions
      if (useCamera) {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert(t('common.error'), t('horses.needCameraPermission'));
          return;
        }
      } else {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert(t('common.error'), t('horses.needGalleryPermission'));
          return;
        }
      }

      const result = useCamera
        ? await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.8,
          })
        : await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.8,
          });

      if (!result.canceled && result.assets && result.assets[0]) {
        setImageUri(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert(t('common.error'), t('horses.imagePickError'));
      console.error('Image picker error:', error);
    }
  };

  const showImagePickerOptions = () => {
    Alert.alert(
      t('horses.chooseHorseImage'),
      t('horses.imageSourceQuestion'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        { text: t('horses.camera'), onPress: () => pickImage(true) },
        { text: t('horses.gallery'), onPress: () => pickImage(false) },
      ]
    );
  };

  const removeImage = () => {
    Alert.alert(
      t('horses.removeImage'),
      t('horses.confirmRemoveImage'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.remove'),
          style: 'destructive',
          onPress: () => setImageUri(''),
        },
      ]
    );
  };

  const scheduleNotification = async (reminder) => {
    try {
      const notificationDate = new Date(`${reminder.date}T${reminder.time}`);
      const now = new Date();

      if (notificationDate <= now) {
        Alert.alert(t('common.error'), t('horses.reminderMustBeFuture'));
        return null;
      }

      const trigger = {
        type: 'date',
        date: notificationDate
      };

      await Notifications.scheduleNotificationAsync({
        content: {
          title: t('horses.reminderTitle', { name: reminder.horseName }),
          body: reminder.note,
          sound: true,
          priority: Notifications.AndroidNotificationPriority.HIGH,
        },
        trigger,
      });
    } catch (error) {
      console.error('Error scheduling notification:', error);
      Alert.alert(t('common.error'), t('horses.notificationScheduleFailed'));
      return null;
    }
  };

  const cancelNotification = async (notificationId) => {
    if (notificationId) {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
    }
  };

  const handleAddHorse = async () => {
    if (!name) {
      Alert.alert(t('common.error'), t('horses.enterHorseNameRequired'));
      return;
    }

    setUploadingImage(true);
    let cloudinaryImageUrl = '';

    try {
      // Upload image to Cloudinary if exists
      if (imageUri) {
        const uploadResult = await uploadImageToCloudinary(imageUri, 'horses');
        if (uploadResult.success) {
          cloudinaryImageUrl = uploadResult.url;
        } else {
          Alert.alert(t('common.error'), t('horses.uploadFailed') + uploadResult.error);
          setUploadingImage(false);
          return;
        }
      }

      // Add horse with Cloudinary image URL
      const result = await addHorse({
        name,
        breed,
        owner,
        feedSchedule,
        notes,
        imageUrl: cloudinaryImageUrl
      });

      if (result.success) {
        setName('');
        setBreed('');
        setOwner('');
        setFeedSchedule('');
        setNotes('');
        setImageUri('');
        Alert.alert(t('common.success'), t('horses.horseAdded'));
      } else {
        Alert.alert(t('common.error'), result.error || t('horses.horseAddFailed'));
      }
    } catch (error) {
      console.error('Error adding horse:', error);
      Alert.alert(t('common.error'), t('common.unexpectedError'));
    } finally {
      setUploadingImage(false);
    }
  };

  const handleRemoveHorse = (id) => {
    Alert.alert(
      t('horses.deleteHorse'),
      t('horses.confirmDeleteHorse'),
      [
        {
          text: t('common.cancel'),
          style: "cancel"
        },
        {
          text: t('common.ok'),
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
      Alert.alert(t('common.error'), t('horses.enterReminderNote'));
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
      Alert.alert(t('common.success'), t('horses.reminderAdded'));
      setReminderModalVisible(false);
      setReminderNote('');
    } else {
      Alert.alert(t('common.error'), result.error || t('horses.reminderAddFailed'));
    }
  };

  const handleDeleteReminder = (reminder) => {
    Alert.alert(
      t('horses.deleteReminder'),
      t('horses.confirmDeleteReminder'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: async () => {
            // Cancel notification if exists
            if (reminder.notificationId) {
              await cancelNotification(reminder.notificationId);
            }

            const result = await removeReminder(reminder.id);
            if (result.success) {
              Alert.alert(t('common.success'), t('horses.reminderDeleted'));
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
            <View style={styles.titleRow}>
              <MaterialCommunityIcons name="horse-variant" size={28} color="#F39C12" />
              <Text style={styles.pageTitle}>{t('horses.title')}</Text>
            </View>
            <View style={styles.countBadge}>
              <Text style={styles.countText}>{horses.length}</Text>
            </View>
          </View>
        }
        renderItem={({ item, index }) => {
          const isExpanded = expandedHorseId === item.id;
          const horseReminders = getHorseReminders(item.id);

          return (
            <AnimatedCard index={index} delay={80} style={styles.card}>
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
                  {item.imageUrl && (
                    <Image
                      source={{ uri: getOptimizedImageUrl(item.imageUrl, { width: 600, height: 400 }) }}
                      style={styles.horseImage}
                      resizeMode="cover"
                    />
                  )}
                  <View style={styles.cardRow}>
                    <View style={styles.labelRow}>
                      <MaterialCommunityIcons name="horse" size={16} color="#E67E22" />
                      <Text style={styles.cardLabel}>{t('horses.breed')}</Text>
                    </View>
                    <Text style={styles.cardValue}>{item.breed || t('common.notSpecified')}</Text>
                  </View>
                  <View style={styles.cardRow}>
                    <View style={styles.labelRow}>
                      <FontAwesome5 name="user" size={14} color="#1ABC9C" solid />
                      <Text style={styles.cardLabel}>{t('horses.owner')}</Text>
                    </View>
                    <Text style={styles.cardValue}>{item.owner || t('common.notSpecified')}</Text>
                  </View>
                  <View style={styles.cardRow}>
                    <View style={styles.labelRow}>
                      <FontAwesome5 name="carrot" size={14} color="#FF9800" solid />
                      <Text style={styles.cardLabel}>{t('horses.feedLabel')}</Text>
                    </View>
                    <Text style={styles.cardValue}>{item.feedSchedule || t('common.notSpecified')}</Text>
                  </View>
                  {item.notes && (
                    <View style={styles.notesSection}>
                      <View style={styles.labelRow}>
                        <FontAwesome5 name="sticky-note" size={14} color="#F39C12" solid />
                        <Text style={styles.notesLabel}>{t('horses.notes')}</Text>
                      </View>
                      <Text style={styles.notesValue}>{item.notes}</Text>
                    </View>
                  )}

                  {/* Reminders Section */}
                  <View style={styles.remindersSection}>
                    <View style={styles.remindersSectionHeader}>
                      <View style={styles.labelRow}>
                        <FontAwesome5 name="bell" size={16} color="#F39C12" solid />
                        <Text style={styles.remindersSectionTitle}>{t('horses.reminders')}</Text>
                      </View>
                      <TouchableOpacity
                        style={styles.addReminderButton}
                        onPress={() => openReminderModal(item)}
                      >
                        <FontAwesome5 name="plus" size={12} color="#fff" solid />
                        <Text style={styles.addReminderButtonText}>{t('horses.addReminder')}</Text>
                      </TouchableOpacity>
                    </View>

                    {horseReminders.length > 0 ? (
                      <View style={styles.remindersList}>
                        {horseReminders.map((reminder) => (
                          <View key={reminder.id} style={styles.reminderItem}>
                            <View style={styles.reminderInfo}>
                              <Text style={styles.reminderNote}>{reminder.note}</Text>
                              <View style={styles.reminderDateRow}>
                                <FontAwesome5 name="calendar-alt" size={12} color="#5DADE2" solid />
                                <Text style={styles.reminderDate}>{formatDate(reminder.date)}</Text>
                              </View>
                              <View style={styles.reminderDateRow}>
                                <FontAwesome5 name="clock" size={12} color="#F39C12" solid />
                                <Text style={styles.reminderTime}>{formatTime(reminder.time)}</Text>
                              </View>
                            </View>
                            <TouchableOpacity
                              onPress={() => handleDeleteReminder(reminder)}
                              style={styles.deleteReminderButton}
                            >
                              <FontAwesome5 name="trash-alt" size={16} color="#E74C3C" solid />
                            </TouchableOpacity>
                          </View>
                        ))}
                      </View>
                    ) : (
                      <Text style={styles.noRemindersText}>{t('horses.noReminders')}</Text>
                    )}
                  </View>

                  <TouchableOpacity style={styles.removeButton} onPress={() => handleRemoveHorse(item.id)}>
                    <FontAwesome5 name="trash-alt" size={14} color="#fff" solid />
                    <Text style={styles.removeButtonText}>{t('horses.deleteHorse')}</Text>
                  </TouchableOpacity>
                </View>
              )}
            </AnimatedCard>
          );
        }}
        ListFooterComponent={
          <View style={styles.formSection}>
            <View style={styles.formTitleRow}>
              <FontAwesome5 name="plus-circle" size={20} color="#27AE60" solid />
              <Text style={styles.formTitle}>{t('horses.addNewHorse')}</Text>
            </View>

            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <MaterialCommunityIcons name="horse-variant" size={16} color="#F39C12" />
                <Text style={styles.label}>{t('horses.horseName')}</Text>
              </View>
              <TextInput
                value={name}
                onChangeText={setName}
                style={styles.input}
                placeholder={t('horses.enterHorseName')}
                placeholderTextColor="#64748b"
              />
            </View>

            {/* Image Upload Section */}
            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <FontAwesome5 name="camera" size={14} color="#3498DB" solid />
                <Text style={styles.label}>{t('horses.horseImage')}</Text>
              </View>
              {imageUri ? (
                <View style={styles.imagePreviewContainer}>
                  <Image
                    source={{ uri: imageUri }}
                    style={styles.imagePreview}
                    resizeMode="cover"
                  />
                  <TouchableOpacity
                    style={styles.removeImageButton}
                    onPress={removeImage}
                  >
                    <FontAwesome5 name="trash-alt" size={12} color="#fff" solid />
                    <Text style={styles.removeImageText}> {t('horses.removeImage')}</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.imageUploadButton}
                  onPress={showImagePickerOptions}
                  disabled={uploadingImage}
                >
                  {uploadingImage ? (
                    <ActivityIndicator size="small" color={colors.primary.main} />
                  ) : (
                    <>
                      <FontAwesome5 name="camera" size={18} color="#3498DB" solid />
                      <Text style={styles.imageUploadText}> {t('horses.chooseImage')}</Text>
                    </>
                  )}
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <MaterialCommunityIcons name="horse" size={16} color="#E67E22" />
                <Text style={styles.label}>{t('horses.breedLabel')}</Text>
              </View>
              <TextInput
                value={breed}
                onChangeText={setBreed}
                style={styles.input}
                placeholder={t('horses.breedPlaceholder')}
                placeholderTextColor="#64748b"
              />
            </View>

            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <FontAwesome5 name="user" size={14} color="#1ABC9C" solid />
                <Text style={styles.label}>{t('horses.ownerLabel')}</Text>
              </View>
              <TextInput
                value={owner}
                onChangeText={setOwner}
                style={styles.input}
                placeholder={t('horses.ownerPlaceholder')}
                placeholderTextColor="#64748b"
              />
            </View>

            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <FontAwesome5 name="carrot" size={14} color="#FF9800" solid />
                <Text style={styles.label}>{t('horses.feedScheduleLabel')}</Text>
              </View>
              <TextInput
                value={feedSchedule}
                onChangeText={setFeedSchedule}
                style={styles.input}
                placeholder={t('horses.enterFeedSchedule')}
                placeholderTextColor="#64748b"
                multiline
              />
            </View>

            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <FontAwesome5 name="sticky-note" size={14} color="#F39C12" solid />
                <Text style={styles.label}>{t('horses.notesLabel')}</Text>
              </View>
              <TextInput
                value={notes}
                onChangeText={setNotes}
                style={[styles.input, styles.notesInput]}
                placeholder={t('horses.notesPlaceholder')}
                placeholderTextColor="#64748b"
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>

            <TouchableOpacity
              style={[styles.addButton, uploadingImage && styles.disabledButton]}
              onPress={handleAddHorse}
              disabled={uploadingImage}
            >
              {uploadingImage ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color={colors.text.primary} />
                  <Text style={styles.addButtonText}> {t('horses.uploading')}</Text>
                </View>
              ) : (
                <>
                  <FontAwesome5 name="plus" size={14} color="#fff" solid />
                  <Text style={styles.addButtonText}>{t('horses.addHorse')}</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        }
        contentContainerStyle={styles.contentContainer}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="horse-variant" size={64} color="#F39C12" />
            <Text style={styles.emptyText}>{t('horses.noHorsesYet')}</Text>
            <Text style={styles.emptySubtext}>{t('horses.addFirstHorse')}</Text>
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
                <View style={styles.modalTitleRow}>
                  <FontAwesome5 name="bell" size={20} color="#F39C12" solid />
                  <Text style={styles.modalTitle}>
                    {t('horses.addReminderFor', { name: selectedHorseForReminder?.name })}
                  </Text>
                </View>

                <View style={styles.modalInputGroup}>
                  <View style={styles.labelRow}>
                    <FontAwesome5 name="sticky-note" size={14} color="#F39C12" solid />
                    <Text style={styles.modalLabel}>{t('horses.reminderNoteLabel')}</Text>
                  </View>
                  <TextInput
                    value={reminderNote}
                    onChangeText={setReminderNote}
                    style={[styles.modalInput, styles.modalNotesInput]}
                    placeholder={t('horses.enterReminderNotes')}
                    placeholderTextColor="#64748b"
                    multiline
                    numberOfLines={3}
                    textAlignVertical="top"
                  />
                </View>

                <View style={styles.modalInputGroup}>
                  <View style={styles.labelRow}>
                    <FontAwesome5 name="calendar-alt" size={14} color="#5DADE2" solid />
                    <Text style={styles.modalLabel}>{t('horses.date')}</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.datePickerButton}
                    onPress={() => setShowDatePicker(true)}
                  >
                    <Text style={styles.datePickerText}>
                      {reminderDate.toLocaleDateString('en-US')}
                    </Text>
                    <FontAwesome5 name="calendar-alt" size={16} color="#5DADE2" solid />
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
                          <Text style={styles.confirmButtonText}>{t('common.ok')}</Text>
                        </TouchableOpacity>
                      )}
                    </>
                  )}
                </View>

                <View style={styles.modalInputGroup}>
                  <View style={styles.labelRow}>
                    <FontAwesome5 name="clock" size={14} color="#F39C12" solid />
                    <Text style={styles.modalLabel}>{t('horses.time')}</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.datePickerButton}
                    onPress={() => setShowTimePicker(true)}
                  >
                    <Text style={styles.datePickerText}>
                      {`${String(reminderTime.getHours()).padStart(2, '0')}:${String(reminderTime.getMinutes()).padStart(2, '0')}`}
                    </Text>
                    <FontAwesome5 name="clock" size={16} color="#F39C12" solid />
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
                          <Text style={styles.confirmButtonText}>{t('common.ok')}</Text>
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
                    <FontAwesome5 name="times" size={14} color="#fff" solid />
                    <Text style={styles.modalCancelButtonText}>{t('common.cancel')}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.modalSaveButton}
                    onPress={handleAddReminder}
                  >
                    <FontAwesome5 name="check" size={14} color="#fff" solid />
                    <Text style={styles.modalSaveButtonText}>{t('horses.saveReminder')}</Text>
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
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
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
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
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
  reminderDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: 2,
  },
  reminderDate: {
    fontSize: typography.size.xs,
    color: colors.text.tertiary,
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
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
    flexDirection: 'row',
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
  modalTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    marginBottom: spacing.base,
  },
  modalTitle: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.bold,
    color: colors.text.primary,
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  modalSaveButtonText: {
    color: '#fff',
    fontSize: typography.size.base,
    fontWeight: typography.weight.bold,
  },
  // Image upload styles
  horseImage: {
    width: '100%',
    height: 200,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
  },
  imagePreviewContainer: {
    position: 'relative',
    width: '100%',
    height: 200,
    borderRadius: borderRadius.sm,
    overflow: 'hidden',
    marginBottom: spacing.sm,
  },
  imagePreview: {
    width: '100%',
    height: '100%',
    borderRadius: borderRadius.sm,
  },
  removeImageButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: colors.status.error,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.sm,
  },
  removeImageText: {
    fontSize: typography.size.xs,
    color: colors.text.primary,
    fontWeight: typography.weight.bold,
  },
  imageUploadButton: {
    backgroundColor: colors.background.tertiary,
    borderWidth: 1,
    borderColor: colors.border.light,
    borderRadius: borderRadius.sm,
    padding: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  imageUploadText: {
    fontSize: typography.size.sm,
    color: colors.text.secondary,
  },
  disabledButton: {
    opacity: 0.6,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default HorsesScreen;
