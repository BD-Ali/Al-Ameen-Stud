import React, { useState, useContext, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Modal,
  ScrollView,
  Alert,
  Switch,
  Platform,
  Image,
  ActivityIndicator,
  KeyboardAvoidingView,
  Keyboard,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { DataContext } from '../context/DataContext';
import { AuthContext } from '../context/AuthContext';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import { colors, typography, spacing, borderRadius, shadows } from '../styles/theme';
import { uploadImageToCloudinary, getOptimizedImageUrl } from '../config/cloudinaryConfig';
import AnimatedCard from '../components/AnimatedCard';
import AnimatedButton from '../components/AnimatedButton';
import { FontAwesome5 } from '@expo/vector-icons';
import { useTranslation } from '../i18n/LanguageContext';

/**
 * Toast Notification Component
 */
const Toast = ({ visible, message, type, onHide }) => {
  const translateY = useRef(new Animated.Value(-100)).current;

  React.useEffect(() => {
    if (visible) {
      Animated.sequence([
        Animated.timing(translateY, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.delay(3000),
        Animated.timing(translateY, {
          toValue: -100,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        onHide();
      });
    }
  }, [visible]);

  if (!visible) return null;

  const bgColor = type === 'success' ? colors.status.success : colors.status.error;

  return (
    <Animated.View
      style={[
        styles.toast,
        { backgroundColor: bgColor, transform: [{ translateY }] },
      ]}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
        <FontAwesome5
          name={type === 'success' ? 'check-circle' : 'times-circle'}
          size={16}
          color="#fff"
          solid
        />
        <Text style={styles.toastText}>{message}</Text>
      </View>
    </Animated.View>
  );
};

/**
 * AnnouncementsScreen - Admin interface for managing announcements/ads
 * Features: Create, Edit, Delete, Schedule, Target audiences, Pin posts, Image upload, Notifications
 */
const AnnouncementsScreen = () => {
  const { announcements, addAnnouncement, updateAnnouncement, deleteAnnouncement } = useContext(DataContext);
  const { user } = useContext(AuthContext);
  const { t } = useTranslation();

  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' });

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    imageUri: '',
    tag: 'Update',
    targetAudience: 'all',
    status: 'draft',
    isPinned: false,
    scheduledDate: null,
    expiryDate: null,
    sendNotification: true,
  });

  const tags = ['Update', 'Promo', 'Alert', 'Event', 'Info'];
  const audiences = [
    { value: 'all', label: t('announcements.everyone') },
    { value: 'clients', label: t('announcements.clientsOnly') },
    { value: 'visitors', label: t('announcements.visitorsOnly') },
    { value: 'workers', label: t('announcements.workersOnly') },
  ];

  const statusOptions = [
    { value: 'draft', label: t('announcements.draft'), color: colors.text.tertiary },
    { value: 'scheduled', label: t('announcements.scheduled'), color: colors.accent.amber },
    { value: 'published', label: t('announcements.published'), color: colors.status.success },
    { value: 'expired', label: t('announcements.expired'), color: colors.text.muted },
  ];

  const showToast = (message, type = 'success') => {
    setToast({ visible: true, message, type });
  };

  const hideToast = () => {
    setToast({ visible: false, message: '', type: 'success' });
  };

  // Get sorted announcements (pinned first, then by date)
  const sortedAnnouncements = [...(announcements || [])].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    const dateA = a.createdAt?.toDate?.() || new Date(a.createdAt);
    const dateB = b.createdAt?.toDate?.() || new Date(b.createdAt);
    return dateB - dateA;
  });

  const openCreateModal = () => {
    setEditingId(null);
    setFormData({
      title: '',
      content: '',
      imageUri: '',
      tag: 'Update',
      targetAudience: 'all',
      status: 'draft',
      isPinned: false,
      scheduledDate: null,
      expiryDate: null,
      sendNotification: true,
    });
    setModalVisible(true);
    setPreviewMode(false);
  };

  const openEditModal = (announcement) => {
    setEditingId(announcement.id);
    setFormData({
      title: announcement.title || '',
      content: announcement.content || '',
      imageUri: announcement.imageUri || '',
      tag: announcement.tag || 'Update',
      targetAudience: announcement.targetAudience || 'all',
      status: announcement.status || 'draft',
      isPinned: announcement.isPinned || false,
      scheduledDate: announcement.scheduledDate ? new Date(announcement.scheduledDate) : null,
      expiryDate: announcement.expiryDate ? new Date(announcement.expiryDate) : null,
      sendNotification: announcement.sendNotification !== undefined ? announcement.sendNotification : true,
    });
    setModalVisible(true);
    setPreviewMode(false);
  };

  // Request permissions and pick image
  const pickImage = async (useCamera = false) => {
    try {
      // Request permissions
      if (useCamera) {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
          showToast(t('announcements.cameraPermissionNeeded'), 'error');
          return;
        }
      } else {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          showToast(t('announcements.galleryPermissionNeeded'), 'error');
          return;
        }
      }

      setUploadingImage(true);

      const result = useCamera
        ? await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            aspect: [16, 9],
            quality: 0.8,
          })
        : await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [16, 9],
            quality: 0.8,
          });

      if (!result.canceled && result.assets && result.assets[0]) {
        setFormData({ ...formData, imageUri: result.assets[0].uri });
      }
    } catch (error) {
      showToast(t('announcements.imagePickError'), 'error');
      console.error('Image picker error:', error);
    } finally {
      setUploadingImage(false);
    }
  };

  const removeImage = () => {
    Alert.alert(
      t('announcements.removeImage'),
      t('announcements.confirmRemoveImage'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.remove'),
          style: 'destructive',
          onPress: () => setFormData({ ...formData, imageUri: '' }),
        },
      ]
    );
  };

  const showImagePickerOptions = () => {
    Alert.alert(
      t('announcements.imageSource'),
      t('announcements.imageSourceQuestion'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        { text: t('announcements.camera'), onPress: () => pickImage(true) },
        { text: t('announcements.gallery'), onPress: () => pickImage(false) },
      ]
    );
  };

  const handleSave = async () => {
    // Dismiss keyboard
    Keyboard.dismiss();

    // Validation
    if (!formData.title.trim() || !formData.content.trim()) {
      showToast(t('announcements.fillTitleContent'), 'error');
      return;
    }

    // Prevent double submission
    if (isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    setUploadingImage(true);

    try {
      let cloudinaryImageUrl = formData.imageUri;

      // Upload image to Cloudinary if it's a local URI (not already uploaded)
      if (formData.imageUri && !formData.imageUri.includes('cloudinary.com')) {
        const uploadResult = await uploadImageToCloudinary(formData.imageUri, 'announcements');
        if (uploadResult.success) {
          cloudinaryImageUrl = uploadResult.url;
        } else {
          showToast(t('announcements.uploadFailed') + uploadResult.error, 'error');
          setIsSubmitting(false);
          setUploadingImage(false);
          return;
        }
      }

      const announcementData = {
        ...formData,
        imageUri: cloudinaryImageUrl, // Use Cloudinary URL
        status: 'published', // Always publish immediately
        scheduledDate: formData.scheduledDate?.toISOString() || null,
        expiryDate: formData.expiryDate?.toISOString() || null,
        lastEditedBy: user?.email || user?.uid,
        lastEditedAt: new Date().toISOString(),
      };

      let result;
      if (editingId) {
        result = await updateAnnouncement(editingId, announcementData);
        if (result.success) {
          setModalVisible(false);
          setTimeout(() => {
            showToast(t('announcements.updateSuccess'), 'success');
          }, 300);
        } else {
          showToast(result.error || t('announcements.updateFailed'), 'error');
        }
      } else {
        announcementData.createdBy = user?.email || user?.uid;
        result = await addAnnouncement(announcementData);
        if (result.success) {
          setModalVisible(false);
          setTimeout(() => {
            showToast(t('announcements.publishSuccess'), 'success');
          }, 300);
        } else {
          showToast(result.error || t('announcements.publishFailed'), 'error');
        }
      }
    } catch (error) {
      console.error('Save error:', error);
      showToast(t('common.unexpectedError'), 'error');
    } finally {
      setIsSubmitting(false);
      setUploadingImage(false);
    }
  };

  const handleDelete = (id) => {
    Alert.alert(
      t('announcements.confirmDelete'),
      t('announcements.confirmDeleteQuestion'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: async () => {
            const result = await deleteAnnouncement(id);
            if (result.success) {
              showToast(t('announcements.deleteSuccess'), 'success');
            } else {
              showToast(result.error || t('announcements.deleteFailed'), 'error');
            }
          },
        },
      ]
    );
  };

  const formatDate = (date) => {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusInfo = (status) => {
    return statusOptions.find(s => s.value === status) || statusOptions[0];
  };

  const getTagIcon = (tag) => {
    const icons = {
      'Update': { name: 'bullhorn', color: '#3498DB' },
      'Promo': { name: 'gift', color: '#E91E63' },
      'Alert': { name: 'exclamation-triangle', color: '#E74C3C' },
      'Event': { name: 'calendar-check', color: '#9C27B0' },
      'Info': { name: 'info-circle', color: '#2196F3' },
    };
    return icons[tag] || { name: 'thumbtack', color: '#F39C12' };
  };


  const renderAnnouncementCard = ({ item, index }) => {
    const statusInfo = getStatusInfo(item.status);
    const audienceLabel = audiences.find(a => a.value === item.targetAudience)?.label || t('announcements.everyone');

    return (
      <AnimatedCard index={index} delay={80} style={styles.card}>
        {item.isPinned && (
          <View style={styles.pinnedBadge}>
            <FontAwesome5 name="thumbtack" size={12} color="#F39C12" solid />
            <Text style={styles.pinnedText}>{t('common.pinned')}</Text>
          </View>
        )}

        <View style={styles.cardHeader}>
          <View style={styles.cardTitleRow}>
            <FontAwesome5
              name={getTagIcon(item.tag).name}
              size={16}
              color={getTagIcon(item.tag).color}
              solid
              style={styles.cardTagIcon}
            />
            <Text style={styles.cardTitle} numberOfLines={2}>{item.title}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusInfo.color + '20' }]}>
            <Text style={[styles.statusText, { color: statusInfo.color }]}>
              {statusInfo.label}
            </Text>
          </View>
        </View>

        <Text style={styles.cardContent} numberOfLines={3}>{item.content}</Text>

        <View style={styles.cardMeta}>
          <Text style={styles.metaText}>👥 {audienceLabel}</Text>
          <Text style={styles.metaText}>
            {item.createdAt ? formatDate(item.createdAt.toDate?.() || item.createdAt) : ''}
          </Text>
        </View>

        {item.scheduledDate && (
          <Text style={styles.scheduledText}>
            {t('announcements.scheduledAt', { date: formatDate(item.scheduledDate) })}
          </Text>
        )}

        {item.expiryDate && (
          <Text style={styles.expiryText}>
            {t('announcements.expiresAt', { date: formatDate(item.expiryDate) })}
          </Text>
        )}

        {/* Notification Status */}
        {item.notificationSentAt && (
          <View style={styles.notificationStatus}>
            <Text style={styles.notificationText}>
              {t('announcements.notificationSent', { count: item.notificationSentCount || 0 })}
            </Text>
          </View>
        )}

        <View style={styles.cardActions}>
          <TouchableOpacity
            style={[styles.actionButton, styles.editButton]}
            onPress={() => openEditModal(item)}
            accessibilityLabel={t('announcements.editAnnouncementAccessibility')}
            accessibilityRole="button"
          >
            <Text style={styles.actionButtonText}>{t('announcements.editAction')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.deleteButton]}
            onPress={() => handleDelete(item.id)}
            accessibilityLabel={t('announcements.deleteAnnouncementAccessibility')}
            accessibilityRole="button"
          >
            <Text style={styles.actionButtonText}>{t('announcements.deleteAction')}</Text>
          </TouchableOpacity>
        </View>

        {item.lastEditedBy && (
          <Text style={styles.editInfo}>
            {t('announcements.lastEditedBy', { name: item.lastEditedBy })}
          </Text>
        )}
      </AnimatedCard>
    );
  };

  return (
    <View style={styles.container}>
      {/* Toast Notification */}
      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onHide={hideToast}
      />

      {/* Header Stats */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{announcements?.filter(a => a.status === 'published').length || 0}</Text>
          <Text style={styles.statLabel}>{t('announcements.published')}</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{announcements?.filter(a => a.status === 'draft').length || 0}</Text>
          <Text style={styles.statLabel}>{t('announcements.draft')}</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{announcements?.filter(a => a.isPinned).length || 0}</Text>
          <Text style={styles.statLabel}>{t('common.pinned')}</Text>
        </View>
      </View>

      <FlatList
        data={sortedAnnouncements}
        keyExtractor={(item) => item.id}
        renderItem={renderAnnouncementCard}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <FontAwesome5 name="bullhorn" size={64} color="#95A5A6" solid />
            <Text style={styles.emptyText}>{t('announcements.noAnnouncementsYet')}</Text>
            <Text style={styles.emptySubtext}>{t('announcements.startCreating')}</Text>
          </View>
        }
        contentContainerStyle={sortedAnnouncements.length === 0 && styles.emptyContainer}
      />

      {/* Create Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={openCreateModal}
        accessibilityLabel={t('announcements.createNew')}
        accessibilityRole="button"
      >
        <FontAwesome5 name="plus" size={20} color="#fff" solid />
      </TouchableOpacity>

      {/* Create/Edit Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={false}
        onRequestClose={() => {
          if (!isSubmitting) {
            setModalVisible(false);
          }
        }}
      >
        <SafeAreaView style={styles.modalContainer} edges={['top', 'bottom']}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.keyboardAvoid}
            keyboardVerticalOffset={0}
          >
            {/* Modal Header with Safe Area */}
            <View style={styles.modalHeader}>
              <TouchableOpacity
                onPress={() => !isSubmitting && setModalVisible(false)}
                style={styles.closeButtonContainer}
                accessibilityLabel={t('common.close')}
                accessibilityRole="button"
                disabled={isSubmitting}
              >
                <FontAwesome5
                  name="times"
                  size={20}
                  color={isSubmitting ? colors.text.disabled : colors.text.secondary}
                  solid
                />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>
                {previewMode ? t('announcements.preview') : editingId ? t('announcements.editAnnouncement') : t('announcements.newAnnouncement')}
              </Text>
              <TouchableOpacity
                onPress={() => setPreviewMode(!previewMode)}
                accessibilityLabel={previewMode ? t('common.edit') : t('announcements.preview')}
                accessibilityRole="button"
              >
                <Text style={styles.previewButton}>{previewMode ? '✏️' : '👁️'}</Text>
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.modalContent}
              contentContainerStyle={styles.modalContentContainer}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              {previewMode ? (
                <View style={styles.previewContainer}>
                  <View style={styles.previewCard}>
                    {formData.isPinned && (
                      <View style={styles.pinnedBadge}>
                        <FontAwesome5 name="thumbtack" size={12} color="#F39C12" solid />
                        <Text style={styles.pinnedText}>{t('common.pinned')}</Text>
                      </View>
                    )}
                    <View style={styles.previewHeader}>
                      <FontAwesome5
                        name={getTagIcon(formData.tag).name}
                        size={18}
                        color={getTagIcon(formData.tag).color}
                        solid
                        style={styles.previewTagIcon}
                      />
                      <Text style={styles.previewTitle}>{formData.title || t('announcements.announcementTitle')}</Text>
                    </View>
                    {formData.imageUri && (
                      <Image
                        source={{ uri: getOptimizedImageUrl(formData.imageUri, { width: 600, height: 400 }) }}
                        style={styles.previewImage}
                        resizeMode="cover"
                      />
                    )}
                    <Text style={styles.previewContent}>{formData.content || t('announcements.announcementContent')}</Text>
                    {formData.linkUrl && (
                      <TouchableOpacity style={styles.previewLink}>
                        <Text style={styles.previewLinkText}>
                          {formData.linkText || t('announcements.linkTextPlaceholder')} <FontAwesome5 name="external-link-alt" size={12} color={colors.primary.main} />
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              ) : (
                <>
                  {/* Title */}
                  <Text style={styles.label}>{t('announcements.titleLabel')}</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.title}
                    onChangeText={(text) => setFormData({ ...formData, title: text })}
                    placeholder={t('announcements.titlePlaceholder')}
                    placeholderTextColor={colors.text.muted}
                    maxLength={100}
                    editable={!isSubmitting}
                    accessibilityLabel={t('announcements.announcementTitle')}
                  />

                  {/* Content */}
                  <Text style={styles.label}>{t('announcements.contentLabel')}</Text>
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    value={formData.content}
                    onChangeText={(text) => setFormData({ ...formData, content: text })}
                    placeholder={t('announcements.contentPlaceholder')}
                    placeholderTextColor={colors.text.muted}
                    multiline
                    numberOfLines={4}
                    maxLength={500}
                    editable={!isSubmitting}
                    accessibilityLabel={t('announcements.announcementContent')}
                  />

                  {/* Image Upload */}
                  <Text style={styles.label}>{t('announcements.uploadImage')}</Text>
                  {formData.imageUri ? (
                    <View style={styles.imagePreviewContainer}>
                      <Image
                        source={{ uri: formData.imageUri }}
                        style={styles.imagePreview}
                        resizeMode="cover"
                      />
                      <TouchableOpacity
                        style={styles.removeImageButton}
                        onPress={removeImage}
                        disabled={isSubmitting}
                      >
                        <FontAwesome5 name="trash-alt" size={12} color="#E74C3C" solid />
                        <Text style={styles.removeImageText}> {t('announcements.removeImage')}</Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <TouchableOpacity
                      style={styles.imageUploadButton}
                      onPress={showImagePickerOptions}
                      disabled={uploadingImage || isSubmitting}
                    >
                      {uploadingImage ? (
                        <ActivityIndicator size="small" color={colors.primary.main} />
                      ) : (
                        <Text style={styles.imageUploadText}>{t('announcements.chooseImage')}</Text>
                      )}
                    </TouchableOpacity>
                  )}

                  {/* Link */}
                  <Text style={styles.label}>{t('announcements.linkLabel')}</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.linkUrl}
                    onChangeText={(text) => setFormData({ ...formData, linkUrl: text })}
                    placeholder={t('announcements.linkPlaceholder')}
                    placeholderTextColor={colors.text.muted}
                    editable={!isSubmitting}
                  />

                  {formData.linkUrl && (
                    <>
                      <Text style={styles.label}>{t('announcements.linkTextLabel')}</Text>
                      <TextInput
                        style={styles.input}
                        value={formData.linkText}
                        onChangeText={(text) => setFormData({ ...formData, linkText: text })}
                        placeholder={t('announcements.linkTextPlaceholder')}
                        placeholderTextColor={colors.text.muted}
                        editable={!isSubmitting}
                      />
                    </>
                  )}

                  {/* Tag */}
                  <Text style={styles.label}>{t('announcements.tagLabel')}</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tagScroll}>
                    {tags.map((tag) => (
                      <TouchableOpacity
                        key={tag}
                        style={[
                          styles.tagChip,
                          formData.tag === tag && styles.tagChipActive,
                        ]}
                        onPress={() => setFormData({ ...formData, tag })}
                        disabled={isSubmitting}
                      >
                        <View style={styles.tagChipContent}>
                          <FontAwesome5
                            name={getTagIcon(tag).name}
                            size={14}
                            color={formData.tag === tag ? colors.primary.main : getTagIcon(tag).color}
                            solid
                          />
                          <Text style={[
                            styles.tagChipText,
                            formData.tag === tag && styles.tagChipTextActive,
                          ]}>
                            {tag}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>

                  {/* Target Audience */}
                  <Text style={styles.label}>{t('announcements.targetAudience')}</Text>
                  <View style={styles.audienceGrid}>
                    {audiences.map((aud) => (
                      <TouchableOpacity
                        key={aud.value}
                        style={[
                          styles.audienceChip,
                          formData.targetAudience === aud.value && styles.audienceChipActive,
                        ]}
                        onPress={() => setFormData({ ...formData, targetAudience: aud.value })}
                        disabled={isSubmitting}
                      >
                        <Text style={[
                          styles.audienceChipText,
                          formData.targetAudience === aud.value && styles.audienceChipTextActive,
                        ]}>
                          {aud.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  {/* Status */}
                  <Text style={styles.label}>{t('announcements.statusLabel')}</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tagScroll}>
                    {statusOptions.map((status) => (
                      <TouchableOpacity
                        key={status.value}
                        style={[
                          styles.statusChip,
                          formData.status === status.value && { backgroundColor: status.color + '30' },
                        ]}
                        onPress={() => setFormData({ ...formData, status: status.value })}
                        disabled={isSubmitting}
                      >
                        <Text style={[
                          styles.statusChipText,
                          formData.status === status.value && { color: status.color },
                        ]}>
                          {status.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>

                  {/* Pin Toggle */}
                  <View style={styles.switchRow}>
                    <Switch
                      value={formData.isPinned}
                      onValueChange={(value) => setFormData({ ...formData, isPinned: value })}
                      trackColor={{ false: colors.border.medium, true: colors.primary.light }}
                      thumbColor={formData.isPinned ? colors.primary.main : colors.text.muted}
                      disabled={isSubmitting}
                    />
                    <Text style={styles.switchLabel}>{t('announcements.pinAnnouncement')}</Text>
                  </View>

                  {/* Scheduled Date */}
                  <Text style={styles.label}>{t('announcements.scheduleDateLabel')}</Text>
                  <TouchableOpacity
                    style={styles.dateButton}
                    onPress={() => setShowStartPicker(true)}
                    disabled={isSubmitting}
                  >
                    <Text style={styles.dateButtonText}>
                      {formData.scheduledDate ? formatDate(formData.scheduledDate) : t('announcements.publishNow')}
                    </Text>
                  </TouchableOpacity>
                  {formData.scheduledDate && (
                    <TouchableOpacity
                      onPress={() => setFormData({ ...formData, scheduledDate: null })}
                      disabled={isSubmitting}
                    >
                      <Text style={styles.clearDate}>{t('announcements.clearDate')}</Text>
                    </TouchableOpacity>
                  )}

                  {showStartPicker && (
                    <DateTimePicker
                      value={formData.scheduledDate || new Date()}
                      mode="datetime"
                      display="default"
                      onChange={(event, date) => {
                        setShowStartPicker(Platform.OS === 'ios');
                        if (date) {
                          setFormData({ ...formData, scheduledDate: date, status: 'scheduled' });
                        }
                      }}
                    />
                  )}

                  {/* Expiry Date */}
                  <Text style={styles.label}>{t('announcements.expiryDateLabel')}</Text>
                  <TouchableOpacity
                    style={styles.dateButton}
                    onPress={() => setShowEndPicker(true)}
                    disabled={isSubmitting}
                  >
                    <Text style={styles.dateButtonText}>
                      {formData.expiryDate ? formatDate(formData.expiryDate) : t('announcements.noExpiryDate')}
                    </Text>
                  </TouchableOpacity>
                  {formData.expiryDate && (
                    <TouchableOpacity
                      onPress={() => setFormData({ ...formData, expiryDate: null })}
                      disabled={isSubmitting}
                    >
                      <Text style={styles.clearDate}>{t('announcements.clearDate')}</Text>
                    </TouchableOpacity>
                  )}

                  {showEndPicker && (
                    <DateTimePicker
                      value={formData.expiryDate || new Date()}
                      mode="datetime"
                      display="default"
                      minimumDate={formData.scheduledDate || new Date()}
                      onChange={(event, date) => {
                        setShowEndPicker(Platform.OS === 'ios');
                        if (date) {
                          setFormData({ ...formData, expiryDate: date });
                        }
                      }}
                    />
                  )}

                  {/* Notification Toggle */}
                  <View style={styles.switchRow}>
                    <Switch
                      value={formData.sendNotification}
                      onValueChange={(value) => setFormData({ ...formData, sendNotification: value })}
                      trackColor={{ false: colors.border.medium, true: colors.primary.light }}
                      thumbColor={formData.sendNotification ? colors.primary.main : colors.text.muted}
                      disabled={isSubmitting}
                    />
                    <Text style={styles.switchLabel}>{t('announcements.sendNotification')}</Text>
                  </View>

                  {/* Extra padding for keyboard */}
                  <View style={styles.keyboardPadding} />
                </>
              )}
            </ScrollView>

            {/* Fixed Footer with Safe Area */}
            {!previewMode && (
              <View style={styles.modalFooter}>
                <TouchableOpacity
                  style={[styles.saveButton, isSubmitting && styles.disabledButton]}
                  onPress={handleSave}
                  disabled={isSubmitting}
                  accessibilityLabel={editingId ? t('common.update') : t('common.save')}
                  accessibilityRole="button"
                >
                  {isSubmitting ? (
                    <ActivityIndicator size="small" color={colors.text.primary} />
                  ) : (
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <FontAwesome5
                        name={editingId ? 'check' : 'paper-plane'}
                        size={14}
                        color={colors.text.primary}
                        solid
                      />
                      <Text style={styles.saveButtonText}>
                        {editingId ? t('common.update') : t('common.publish')}
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              </View>
            )}
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  statsRow: {
    flexDirection: 'row',
    padding: spacing.base,
    gap: spacing.md,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.background.secondary,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    ...shadows.sm,
  },
  statNumber: {
    fontSize: typography.size.xxl,
    fontWeight: typography.weight.bold,
    color: colors.primary.main,
  },
  statLabel: {
    fontSize: typography.size.sm,
    color: colors.text.tertiary,
    marginTop: spacing.xs,
  },
  card: {
    backgroundColor: colors.background.secondary,
    marginHorizontal: spacing.base,
    marginBottom: spacing.md,
    padding: spacing.base,
    borderRadius: borderRadius.md,
    borderStartWidth: 3,
    borderStartColor: colors.primary.main,
    ...shadows.sm,
  },
  pinnedBadge: {
    position: 'absolute',
    top: spacing.sm,
    start: spacing.sm,
    backgroundColor: colors.accent.amber + '30',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  pinnedText: {
    fontSize: typography.size.xs,
    color: colors.accent.amber,
    fontWeight: typography.weight.bold,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
    marginTop: spacing.base,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginEnd: spacing.sm,
  },
  cardTagIcon: {
    marginEnd: spacing.sm,
  },
  cardTitle: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.bold,
    color: colors.text.primary,
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  statusText: {
    fontSize: typography.size.xs,
    fontWeight: typography.weight.semibold,
  },
  cardContent: {
    fontSize: typography.size.base,
    color: colors.text.secondary,
    marginBottom: spacing.md,
    lineHeight: 20,
  },
  cardMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  metaText: {
    fontSize: typography.size.xs,
    color: colors.text.tertiary,
  },
  scheduledText: {
    fontSize: typography.size.xs,
    color: colors.accent.amber,
    marginBottom: spacing.xs,
  },
  expiryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: spacing.sm,
  },
  expiryText: {
    fontSize: typography.size.xs,
    color: colors.text.muted,
  },
  notificationStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.background.tertiary,
    padding: spacing.sm,
    borderRadius: borderRadius.sm,
    marginBottom: spacing.sm,
  },
  notificationText: {
    fontSize: typography.size.xs,
    color: colors.text.primary,
  },
  cardActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  actionButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.sm,
    alignItems: 'center',
    minHeight: 48, // Accessibility tap target
  },
  editButton: {
    backgroundColor: colors.primary.main + '20',
  },
  deleteButton: {
    backgroundColor: colors.status.error + '20',
  },
  actionButtonText: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.semibold,
  },
  editInfo: {
    fontSize: typography.size.xs,
    color: colors.text.muted,
    marginTop: spacing.sm,
    fontStyle: 'italic',
  },
  emptyContainer: {
    flex: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xxxl * 2,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: spacing.md,
  },
  emptyText: {
    fontSize: typography.size.lg,
    color: colors.text.secondary,
    fontWeight: typography.weight.semibold,
  },
  emptySubtext: {
    fontSize: typography.size.sm,
    color: colors.text.tertiary,
    marginTop: spacing.xs,
  },
  fab: {
    position: 'absolute',
    bottom: spacing.xl,
    end: spacing.xl,
    width: 56,
    height: 56,
    borderRadius: borderRadius.xxxl,
    backgroundColor: colors.primary.main,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  fabText: {
    fontSize: typography.size.xxl,
    color: colors.text.primary,
  },
  // Modal styles with safe area support
  modalContainer: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  keyboardAvoid: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
    backgroundColor: colors.background.secondary,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  closeButtonContainer: {
    minWidth: 48,
    minHeight: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginStart: -spacing.sm,
  },
  closeButton: {
    fontSize: typography.size.xxl,
    color: colors.text.primary,
    fontWeight: typography.weight.bold,
  },
  modalTitle: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.bold,
    color: colors.text.primary,
    flex: 1,
    textAlign: 'center',
  },
  previewButton: {
    fontSize: typography.size.xl,
    minWidth: 48,
    minHeight: 48,
    textAlign: 'center',
    lineHeight: 48,
  },
  modalContent: {
    flex: 1,
  },
  modalContentContainer: {
    padding: spacing.base,
    paddingBottom: spacing.xxxl,
  },
  label: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.semibold,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },
  input: {
    backgroundColor: colors.background.secondary,
    borderWidth: 1,
    borderColor: colors.border.light,
    borderRadius: borderRadius.sm,
    padding: spacing.md,
    fontSize: typography.size.base,
    color: colors.text.primary,
    minHeight: 48,
  },
  textArea: {
    minHeight: 120,
    textAlignVertical: 'top',
  },
  tagScroll: {
    marginBottom: spacing.sm,
  },
  tagChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    backgroundColor: colors.background.secondary,
    borderWidth: 1,
    borderColor: colors.border.light,
    marginEnd: spacing.sm,
    minHeight: 44,
    justifyContent: 'center',
  },
  tagChipContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  tagChipActive: {
    backgroundColor: colors.primary.main + '30',
    borderColor: colors.primary.main,
  },
  tagChipText: {
    fontSize: typography.size.sm,
    color: colors.text.secondary,
  },
  tagChipTextActive: {
    color: colors.primary.main,
    fontWeight: typography.weight.bold,
  },
  audienceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  audienceChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.background.secondary,
    borderWidth: 1,
    borderColor: colors.border.light,
    minHeight: 44,
    justifyContent: 'center',
  },
  audienceChipActive: {
    backgroundColor: colors.primary.main + '30',
    borderColor: colors.primary.main,
  },
  audienceChipText: {
    fontSize: typography.size.sm,
    color: colors.text.secondary,
  },
  audienceChipTextActive: {
    color: colors.primary.main,
    fontWeight: typography.weight.bold,
  },
  statusChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    backgroundColor: colors.background.secondary,
    borderWidth: 1,
    borderColor: colors.border.light,
    marginEnd: spacing.sm,
    minHeight: 44,
    justifyContent: 'center',
  },
  statusChipText: {
    fontSize: typography.size.sm,
    color: colors.text.secondary,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.md,
    marginBottom: spacing.sm,
    minHeight: 48,
  },
  switchLabel: {
    fontSize: typography.size.base,
    color: colors.text.primary,
    marginStart: spacing.md,
    flex: 1,
  },
  dateButton: {
    backgroundColor: colors.background.secondary,
    borderWidth: 1,
    borderColor: colors.border.light,
    borderRadius: borderRadius.sm,
    padding: spacing.md,
    minHeight: 48,
    justifyContent: 'center',
  },
  dateButtonText: {
    fontSize: typography.size.base,
    color: colors.text.primary,
  },
  clearDate: {
    fontSize: typography.size.sm,
    color: colors.status.error,
    marginTop: spacing.xs,
    textAlign: 'center',
    paddingVertical: spacing.sm,
  },
  modalFooter: {
    flexDirection: 'row',
    padding: spacing.base,
    gap: spacing.md,
    backgroundColor: colors.background.secondary,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
  publishButton: {
    flex: 1,
    backgroundColor: colors.status.success,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  publishButtonText: {
    fontSize: typography.size.base,
    fontWeight: typography.weight.bold,
    color: colors.text.primary,
  },
  saveButton: {
    flex: 1,
    backgroundColor: colors.primary.main,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  saveButtonText: {
    fontSize: typography.size.base,
    fontWeight: typography.weight.bold,
    color: colors.text.primary,
  },
  disabledButton: {
    opacity: 0.6,
  },
  disabledText: {
    opacity: 0.5,
  },
  previewContainer: {
    flex: 1,
  },
  previewCard: {
    backgroundColor: colors.background.secondary,
    padding: spacing.base,
    borderRadius: borderRadius.md,
    borderStartWidth: 3,
    borderStartColor: colors.primary.main,
  },
  previewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  previewTitle: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.bold,
    color: colors.text.primary,
    flex: 1,
  },
  previewImage: {
    width: '100%',
    height: 200,
    borderRadius: borderRadius.sm,
    marginBottom: spacing.md,
  },
  previewContent: {
    fontSize: typography.size.base,
    color: colors.text.secondary,
    lineHeight: 22,
    marginBottom: spacing.md,
  },
  previewLink: {
    backgroundColor: colors.primary.main,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.base,
    borderRadius: borderRadius.sm,
    alignItems: 'center',
  },
  previewLinkText: {
    fontSize: typography.size.base,
    fontWeight: typography.weight.bold,
    color: colors.text.primary,
  },
  imageUploadButton: {
    backgroundColor: colors.background.tertiary,
    borderWidth: 1,
    borderColor: colors.border.light,
    borderRadius: borderRadius.sm,
    padding: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
    minHeight: 48,
  },
  imageUploadText: {
    fontSize: typography.size.sm,
    color: colors.text.secondary,
  },
  imagePreviewContainer: {
    position: 'relative',
    width: '100%',
    height: 200,
    borderRadius: borderRadius.sm,
    overflow: 'hidden',
    marginBottom: spacing.md,
  },
  imagePreview: {
    width: '100%',
    height: '100%',
    borderRadius: borderRadius.sm,
  },
  removeImageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'absolute',
    top: 8,
    end: 8,
    backgroundColor: colors.status.error,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.sm,
    minHeight: 44,
    justifyContent: 'center',
    gap: 4,
  },
  removeImageText: {
    fontSize: typography.size.xs,
    color: colors.text.primary,
    fontWeight: typography.weight.bold,
  },
  keyboardPadding: {
    height: spacing.xxxl * 2,
  },
  // Toast notification styles
  toast: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.base,
    paddingTop: spacing.xl + spacing.md, // Extra padding for status bar
    zIndex: 9999,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  toastText: {
    color: colors.text.primary,
    fontSize: typography.size.base,
    fontWeight: typography.weight.semibold,
    textAlign: 'center',
  },
});

export default AnnouncementsScreen;
