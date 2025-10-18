import React, { useState, useContext } from 'react';
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
} from 'react-native';
import { DataContext } from '../context/DataContext';
import { AuthContext } from '../context/AuthContext';
import DateTimePicker from '@react-native-community/datetimepicker';
import { colors, typography, spacing, borderRadius } from '../styles/theme';

/**
 * AnnouncementsScreen - Admin interface for managing announcements/ads
 * Features: Create, Edit, Delete, Schedule, Target audiences, Pin posts
 */
const AnnouncementsScreen = () => {
  const { announcements, addAnnouncement, updateAnnouncement, deleteAnnouncement } = useContext(DataContext);
  const { user } = useContext(AuthContext);

  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    imageUrl: '',
    linkUrl: '',
    linkText: '',
    tag: 'Update',
    targetAudience: 'all',
    status: 'draft',
    isPinned: false,
    scheduledDate: null,
    expiryDate: null,
  });

  const tags = ['Update', 'Promo', 'Alert', 'Event', 'Info'];
  const audiences = [
    { value: 'all', label: 'الجميع' },
    { value: 'clients', label: 'العملاء فقط' },
    { value: 'visitors', label: 'الزوار فقط' },
    { value: 'workers', label: 'العاملين فقط' },
  ];

  const statusOptions = [
    { value: 'draft', label: 'مسودة', color: colors.text.tertiary },
    { value: 'scheduled', label: 'مجدول', color: colors.accent.amber },
    { value: 'published', label: 'منشور', color: colors.status.success },
    { value: 'expired', label: 'منتهي', color: colors.text.muted },
  ];

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
      imageUrl: '',
      linkUrl: '',
      linkText: '',
      tag: 'Update',
      targetAudience: 'all',
      status: 'draft',
      isPinned: false,
      scheduledDate: null,
      expiryDate: null,
    });
    setModalVisible(true);
    setPreviewMode(false);
  };

  const openEditModal = (announcement) => {
    setEditingId(announcement.id);
    setFormData({
      title: announcement.title || '',
      content: announcement.content || '',
      imageUrl: announcement.imageUrl || '',
      linkUrl: announcement.linkUrl || '',
      linkText: announcement.linkText || '',
      tag: announcement.tag || 'Update',
      targetAudience: announcement.targetAudience || 'all',
      status: announcement.status || 'draft',
      isPinned: announcement.isPinned || false,
      scheduledDate: announcement.scheduledDate ? new Date(announcement.scheduledDate) : null,
      expiryDate: announcement.expiryDate ? new Date(announcement.expiryDate) : null,
    });
    setModalVisible(true);
    setPreviewMode(false);
  };

  const handleSave = async () => {
    if (!formData.title.trim() || !formData.content.trim()) {
      Alert.alert('خطأ', 'الرجاء إدخال العنوان والمحتوى');
      return;
    }

    const announcementData = {
      ...formData,
      scheduledDate: formData.scheduledDate?.toISOString() || null,
      expiryDate: formData.expiryDate?.toISOString() || null,
      lastEditedBy: user?.email || user?.uid,
      lastEditedAt: new Date().toISOString(),
    };

    if (editingId) {
      const result = await updateAnnouncement(editingId, announcementData);
      if (result.success) {
        Alert.alert('نجح', 'تم تحديث الإعلان بنجاح');
        setModalVisible(false);
      } else {
        Alert.alert('خطأ', result.error);
      }
    } else {
      announcementData.createdBy = user?.email || user?.uid;
      const result = await addAnnouncement(announcementData);
      if (result.success) {
        Alert.alert('نجح', 'تم إضافة الإعلان بنجاح');
        setModalVisible(false);
      } else {
        Alert.alert('خطأ', result.error);
      }
    }
  };

  const handleDelete = (id) => {
    Alert.alert(
      'تأكيد الحذف',
      'هل أنت متأكد من حذف هذا الإعلان؟',
      [
        { text: 'إلغاء', style: 'cancel' },
        {
          text: 'حذف',
          style: 'destructive',
          onPress: async () => {
            const result = await deleteAnnouncement(id);
            if (!result.success) {
              Alert.alert('خطأ', result.error);
            }
          },
        },
      ]
    );
  };

  const handlePublishNow = () => {
    setFormData({ ...formData, status: 'published', scheduledDate: null });
  };

  const formatDate = (date) => {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('ar-SA', {
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

  const getTagEmoji = (tag) => {
    const emojis = {
      'Update': '📢',
      'Promo': '🎁',
      'Alert': '⚠️',
      'Event': '🎉',
      'Info': 'ℹ️',
    };
    return emojis[tag] || '📌';
  };

  const renderAnnouncementCard = ({ item }) => {
    const statusInfo = getStatusInfo(item.status);
    const audienceLabel = audiences.find(a => a.value === item.targetAudience)?.label || 'الجميع';

    return (
      <View style={styles.card}>
        {item.isPinned && (
          <View style={styles.pinnedBadge}>
            <Text style={styles.pinnedText}>📌 مثبت</Text>
          </View>
        )}

        <View style={styles.cardHeader}>
          <View style={styles.cardTitleRow}>
            <Text style={styles.cardTag}>{getTagEmoji(item.tag)}</Text>
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
            🕐 مجدول: {formatDate(item.scheduledDate)}
          </Text>
        )}

        {item.expiryDate && (
          <Text style={styles.expiryText}>
            ⏰ ينتهي: {formatDate(item.expiryDate)}
          </Text>
        )}

        <View style={styles.cardActions}>
          <TouchableOpacity
            style={[styles.actionButton, styles.editButton]}
            onPress={() => openEditModal(item)}
          >
            <Text style={styles.actionButtonText}>✏️ تعديل</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.deleteButton]}
            onPress={() => handleDelete(item.id)}
          >
            <Text style={styles.actionButtonText}>🗑️ حذف</Text>
          </TouchableOpacity>
        </View>

        {item.lastEditedBy && (
          <Text style={styles.editInfo}>
            آخر تعديل بواسطة: {item.lastEditedBy}
          </Text>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header Stats */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{announcements?.filter(a => a.status === 'published').length || 0}</Text>
          <Text style={styles.statLabel}>منشور</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{announcements?.filter(a => a.status === 'draft').length || 0}</Text>
          <Text style={styles.statLabel}>مسودة</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{announcements?.filter(a => a.isPinned).length || 0}</Text>
          <Text style={styles.statLabel}>مثبت</Text>
        </View>
      </View>

      <FlatList
        data={sortedAnnouncements}
        keyExtractor={(item) => item.id}
        renderItem={renderAnnouncementCard}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>📢</Text>
            <Text style={styles.emptyText}>لا توجد إعلانات بعد</Text>
            <Text style={styles.emptySubtext}>ابدأ بإنشاء إعلان جديد</Text>
          </View>
        }
        contentContainerStyle={sortedAnnouncements.length === 0 && styles.emptyContainer}
      />

      {/* Create Button */}
      <TouchableOpacity style={styles.fab} onPress={openCreateModal}>
        <Text style={styles.fabText}>➕</Text>
      </TouchableOpacity>

      {/* Create/Edit Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>
              {previewMode ? 'معاينة' : editingId ? 'تعديل إعلان' : 'إعلان جديد'}
            </Text>
            <TouchableOpacity onPress={() => setPreviewMode(!previewMode)}>
              <Text style={styles.previewButton}>{previewMode ? '✏️' : '👁️'}</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            {previewMode ? (
              <View style={styles.previewContainer}>
                <View style={styles.previewCard}>
                  {formData.isPinned && (
                    <View style={styles.pinnedBadge}>
                      <Text style={styles.pinnedText}>📌 مثبت</Text>
                    </View>
                  )}
                  <View style={styles.previewHeader}>
                    <Text style={styles.previewTag}>{getTagEmoji(formData.tag)}</Text>
                    <Text style={styles.previewTitle}>{formData.title || 'عنوان الإعلان'}</Text>
                  </View>
                  {formData.imageUrl && (
                    <View style={styles.previewImagePlaceholder}>
                      <Text style={styles.previewImageText}>🖼️ {formData.imageUrl}</Text>
                    </View>
                  )}
                  <Text style={styles.previewContent}>{formData.content || 'محتوى الإعلان'}</Text>
                  {formData.linkUrl && (
                    <TouchableOpacity style={styles.previewLink}>
                      <Text style={styles.previewLinkText}>
                        {formData.linkText || 'اضغط هنا'} →
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ) : (
              <>
                {/* Title */}
                <Text style={styles.label}>العنوان *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.title}
                  onChangeText={(text) => setFormData({ ...formData, title: text })}
                  placeholder="اكتب عنوان الإعلان"
                  placeholderTextColor={colors.text.muted}
                  maxLength={100}
                />

                {/* Content */}
                <Text style={styles.label}>المحتوى *</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={formData.content}
                  onChangeText={(text) => setFormData({ ...formData, content: text })}
                  placeholder="اكتب محتوى الإعلان"
                  placeholderTextColor={colors.text.muted}
                  multiline
                  numberOfLines={4}
                  maxLength={500}
                />

                {/* Image URL */}
                <Text style={styles.label}>رابط الصورة (اختياري)</Text>
                <TextInput
                  style={styles.input}
                  value={formData.imageUrl}
                  onChangeText={(text) => setFormData({ ...formData, imageUrl: text })}
                  placeholder="https://example.com/image.jpg"
                  placeholderTextColor={colors.text.muted}
                />

                {/* Link */}
                <Text style={styles.label}>رابط الإجراء (اختياري)</Text>
                <TextInput
                  style={styles.input}
                  value={formData.linkUrl}
                  onChangeText={(text) => setFormData({ ...formData, linkUrl: text })}
                  placeholder="https://example.com"
                  placeholderTextColor={colors.text.muted}
                />

                {formData.linkUrl && (
                  <>
                    <Text style={styles.label}>نص الزر</Text>
                    <TextInput
                      style={styles.input}
                      value={formData.linkText}
                      onChangeText={(text) => setFormData({ ...formData, linkText: text })}
                      placeholder="اضغط هنا"
                      placeholderTextColor={colors.text.muted}
                    />
                  </>
                )}

                {/* Tag */}
                <Text style={styles.label}>التصنيف</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tagScroll}>
                  {tags.map((tag) => (
                    <TouchableOpacity
                      key={tag}
                      style={[
                        styles.tagChip,
                        formData.tag === tag && styles.tagChipActive,
                      ]}
                      onPress={() => setFormData({ ...formData, tag })}
                    >
                      <Text style={[
                        styles.tagChipText,
                        formData.tag === tag && styles.tagChipTextActive,
                      ]}>
                        {getTagEmoji(tag)} {tag}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                {/* Target Audience */}
                <Text style={styles.label}>الجمهور المستهدف</Text>
                <View style={styles.audienceGrid}>
                  {audiences.map((aud) => (
                    <TouchableOpacity
                      key={aud.value}
                      style={[
                        styles.audienceChip,
                        formData.targetAudience === aud.value && styles.audienceChipActive,
                      ]}
                      onPress={() => setFormData({ ...formData, targetAudience: aud.value })}
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
                <Text style={styles.label}>الحالة</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tagScroll}>
                  {statusOptions.map((status) => (
                    <TouchableOpacity
                      key={status.value}
                      style={[
                        styles.statusChip,
                        formData.status === status.value && { backgroundColor: status.color + '30' },
                      ]}
                      onPress={() => setFormData({ ...formData, status: status.value })}
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
                  />
                  <Text style={styles.switchLabel}>📌 تثبيت الإعلان (يظهر في الأعلى)</Text>
                </View>

                {/* Scheduled Date */}
                <Text style={styles.label}>تاريخ النشر (اختياري)</Text>
                <TouchableOpacity
                  style={styles.dateButton}
                  onPress={() => setShowStartPicker(true)}
                >
                  <Text style={styles.dateButtonText}>
                    {formData.scheduledDate ? formatDate(formData.scheduledDate) : 'نشر الآن'}
                  </Text>
                </TouchableOpacity>
                {formData.scheduledDate && (
                  <TouchableOpacity onPress={() => setFormData({ ...formData, scheduledDate: null })}>
                    <Text style={styles.clearDate}>مسح التاريخ</Text>
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
                <Text style={styles.label}>تاريخ الانتهاء (اختياري)</Text>
                <TouchableOpacity
                  style={styles.dateButton}
                  onPress={() => setShowEndPicker(true)}
                >
                  <Text style={styles.dateButtonText}>
                    {formData.expiryDate ? formatDate(formData.expiryDate) : 'بدون تاريخ انتهاء'}
                  </Text>
                </TouchableOpacity>
                {formData.expiryDate && (
                  <TouchableOpacity onPress={() => setFormData({ ...formData, expiryDate: null })}>
                    <Text style={styles.clearDate}>مسح التاريخ</Text>
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
              </>
            )}
          </ScrollView>

          {!previewMode && (
            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.publishButton}
                onPress={handlePublishNow}
              >
                <Text style={styles.publishButtonText}>🚀 نشر الآن</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleSave}
              >
                <Text style={styles.saveButtonText}>💾 حفظ</Text>
              </TouchableOpacity>
            </View>
          )}
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
    borderLeftWidth: 3,
    borderLeftColor: colors.primary.main,
  },
  pinnedBadge: {
    position: 'absolute',
    top: spacing.sm,
    left: spacing.sm,
    backgroundColor: colors.accent.amber + '30',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
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
    marginRight: spacing.sm,
  },
  cardTag: {
    fontSize: typography.size.lg,
    marginRight: spacing.sm,
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
  expiryText: {
    fontSize: typography.size.xs,
    color: colors.text.muted,
    marginBottom: spacing.sm,
  },
  cardActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  actionButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.sm,
    alignItems: 'center',
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
    right: spacing.xl,
    width: 56,
    height: 56,
    borderRadius: 28,
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
  modalContainer: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.base,
    backgroundColor: colors.background.secondary,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  closeButton: {
    fontSize: typography.size.xxl,
    color: colors.text.primary,
    width: 40,
  },
  modalTitle: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.bold,
    color: colors.text.primary,
  },
  previewButton: {
    fontSize: typography.size.xl,
    width: 40,
    textAlign: 'center',
  },
  modalContent: {
    flex: 1,
    padding: spacing.base,
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
  },
  textArea: {
    minHeight: 100,
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
    marginRight: spacing.sm,
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
    marginRight: spacing.sm,
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
  },
  switchLabel: {
    fontSize: typography.size.base,
    color: colors.text.primary,
    marginLeft: spacing.md,
  },
  dateButton: {
    backgroundColor: colors.background.secondary,
    borderWidth: 1,
    borderColor: colors.border.light,
    borderRadius: borderRadius.sm,
    padding: spacing.md,
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
  },
  saveButtonText: {
    fontSize: typography.size.base,
    fontWeight: typography.weight.bold,
    color: colors.text.primary,
  },
  previewContainer: {
    flex: 1,
  },
  previewCard: {
    backgroundColor: colors.background.secondary,
    padding: spacing.base,
    borderRadius: borderRadius.md,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary.main,
  },
  previewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  previewTag: {
    fontSize: typography.size.xl,
    marginRight: spacing.sm,
  },
  previewTitle: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.bold,
    color: colors.text.primary,
    flex: 1,
  },
  previewImagePlaceholder: {
    backgroundColor: colors.background.tertiary,
    padding: spacing.lg,
    borderRadius: borderRadius.sm,
    marginBottom: spacing.md,
    alignItems: 'center',
  },
  previewImageText: {
    fontSize: typography.size.sm,
    color: colors.text.tertiary,
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
});

export default AnnouncementsScreen;

