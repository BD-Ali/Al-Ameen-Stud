import React, { useState, useContext, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  Linking,
  ActivityIndicator,
  Image,
} from 'react-native';
import { DataContext } from '../context/DataContext';
import { AuthContext } from '../context/AuthContext';
import { colors, typography, spacing, borderRadius } from '../styles/theme';
import notificationService from '../services/notificationService';
import { getOptimizedImageUrl } from '../config/cloudinaryConfig';

/**
 * AnnouncementsFeed - Displays announcements to users based on their role
 * Features: Filtering by audience, pinned posts, pagination, detail view, image display, unread tracking
 */
const AnnouncementsFeed = ({ userRole = 'visitor', highlightId = null }) => {
  const { announcements, loading } = useContext(DataContext);
  const { user } = useContext(AuthContext);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [displayCount, setDisplayCount] = useState(10);
  const [unreadIds, setUnreadIds] = useState([]);

  useEffect(() => {
    // Load unread announcement IDs
    loadUnreadIds();
  }, []);

  // Handle deep link - open announcement if highlightId provided
  useEffect(() => {
    if (highlightId && announcements.length > 0) {
      const announcement = announcements.find(a => a.id === highlightId);
      if (announcement) {
        openDetail(announcement);
      }
    }
  }, [highlightId, announcements]);

  const loadUnreadIds = async () => {
    if (user) {
      const ids = await notificationService.getUnreadIds(user.uid);
      setUnreadIds(ids);
    }
  };

  const markAsRead = async (announcementId) => {
    if (user) {
      await notificationService.markAsRead(user.uid, announcementId);
      setUnreadIds(prev => prev.filter(id => id !== announcementId));
    }
  };

  const markAllAsRead = async () => {
    if (user) {
      await notificationService.markAllAsRead(user.uid);
      setUnreadIds([]);
    }
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

  const getTagColor = (tag) => {
    const colors_map = {
      'Update': colors.primary.main,
      'Promo': colors.accent.amber,
      'Alert': colors.status.error,
      'Event': colors.accent.purple,
      'Info': colors.accent.teal,
    };
    return colors_map[tag] || colors.primary.main;
  };

  // Filter announcements based on user role and visibility criteria
  const getVisibleAnnouncements = () => {
    const now = new Date();

    return (announcements || [])
      .filter((announcement) => {
        // Check status - only show published
        if (announcement.status !== 'published') return false;

        // Check target audience
        const { targetAudience } = announcement;
        if (targetAudience === 'all') return true;
        if (targetAudience === 'clients' && userRole === 'client') return true;
        if (targetAudience === 'visitors' && userRole === 'visitor') return true;
        if (targetAudience === 'workers' && userRole === 'worker') return true;

        return false;
      })
      .filter((announcement) => {
        // Check scheduled date
        if (announcement.scheduledDate) {
          const scheduledDate = new Date(announcement.scheduledDate);
          if (scheduledDate > now) return false;
        }

        // Check expiry date
        if (announcement.expiryDate) {
          const expiryDate = new Date(announcement.expiryDate);
          if (expiryDate < now) return false;
        }

        return true;
      })
      .sort((a, b) => {
        // Pinned posts first
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;

        // Then by creation date (newest first)
        const dateA = a.createdAt?.toDate?.() || new Date(a.createdAt);
        const dateB = b.createdAt?.toDate?.() || new Date(b.createdAt);
        return dateB - dateA;
      });
  };

  const visibleAnnouncements = getVisibleAnnouncements();
  const displayedAnnouncements = visibleAnnouncements.slice(0, displayCount);
  const hasMore = visibleAnnouncements.length > displayCount;

  const formatDate = (date) => {
    if (!date) return '';
    const d = date.toDate ? date.toDate() : new Date(date);
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const openDetail = (announcement) => {
    setSelectedAnnouncement(announcement);
    setDetailModalVisible(true);
    // Mark as read when opening
    markAsRead(announcement.id);
  };

  const handleLinkPress = async (url) => {
    try {
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
      }
    } catch (error) {
      console.error('Error opening link:', error);
    }
  };

  const loadMore = () => {
    setDisplayCount(prev => prev + 10);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary.main} />
        <Text style={styles.loadingText}>جاري التحميل...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      {visibleAnnouncements.length > 0 && (
        <View style={styles.header}>
          <Text style={styles.headerIcon}>📢</Text>
          <Text style={styles.headerTitle}>الإعلانات والتحديثات</Text>
        </View>
      )}

      {/* Announcements List */}
      {displayedAnnouncements.length > 0 ? (
        <>
          {displayedAnnouncements.map((item, index) => {
            const tagColor = getTagColor(item.tag);
            return (
              <View
                key={item.id}
                style={styles.card}
              >
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => openDetail(item)}
                >
                  {item.isPinned && (
                    <View style={styles.pinnedBadge}>
                      <Text style={styles.pinnedText}>📌 مثبت</Text>
                    </View>
                  )}

                  <View style={styles.cardHeader}>
                    <View style={[styles.tagBadge, { backgroundColor: tagColor + '20' }]}>
                      <Text style={styles.tagEmoji}>{getTagEmoji(item.tag)}</Text>
                      <Text style={[styles.tagText, { color: tagColor }]}>{item.tag}</Text>
                    </View>
                  </View>

                  <Text style={styles.cardTitle} numberOfLines={2}>
                    {item.title}
                  </Text>

                  {item.imageUri && (
                    <Image
                      source={{ uri: getOptimizedImageUrl(item.imageUri, { width: 600, height: 400 }) }}
                      style={styles.cardImage}
                      resizeMode="cover"
                    />
                  )}

                  <Text style={styles.cardContent} numberOfLines={3}>
                    {item.content}
                  </Text>

                  <View style={styles.cardFooter}>
                    <Text style={styles.dateText}>{formatDate(item.createdAt)}</Text>
                    <Text style={styles.readMore}>اقرأ المزيد ←</Text>
                  </View>
                </TouchableOpacity>
              </View>
            );
          })}

          {/* Load More Button */}
          {hasMore && (
            <TouchableOpacity
              style={styles.loadMoreButton}
              onPress={loadMore}
            >
              <Text style={styles.loadMoreText}>عرض المزيد ↓</Text>
            </TouchableOpacity>
          )}
        </>
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyEmoji}>📭</Text>
          <Text style={styles.emptyText}>لا توجد إعلانات حالياً</Text>
          <Text style={styles.emptySubtext}>سنقوم بإعلامك عند وجود تحديثات جديدة</Text>
        </View>
      )}

      {/* Detail Modal */}
      <Modal
        visible={detailModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setDetailModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <TouchableOpacity
                onPress={() => setDetailModalVisible(false)}
                style={styles.closeButton}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent}>
              {selectedAnnouncement && (
                <>
                  {selectedAnnouncement.isPinned && (
                    <View style={[styles.pinnedBadge, { marginBottom: spacing.md }]}>
                      <Text style={styles.pinnedText}>📌 إعلان مثبت</Text>
                    </View>
                  )}

                  <View style={[
                    styles.tagBadge,
                    { backgroundColor: getTagColor(selectedAnnouncement.tag) + '20', alignSelf: 'flex-start' }
                  ]}>
                    <Text style={styles.tagEmoji}>{getTagEmoji(selectedAnnouncement.tag)}</Text>
                    <Text style={[styles.tagText, { color: getTagColor(selectedAnnouncement.tag) }]}>
                      {selectedAnnouncement.tag}
                    </Text>
                  </View>

                  <Text style={styles.modalTitle}>{selectedAnnouncement.title}</Text>

                  {selectedAnnouncement.imageUri && (
                    <Image
                      source={{ uri: getOptimizedImageUrl(selectedAnnouncement.imageUri, { width: 800, height: 600 }) }}
                      style={styles.modalImage}
                      resizeMode="cover"
                    />
                  )}

                  <Text style={styles.modalText}>{selectedAnnouncement.content}</Text>

                  {selectedAnnouncement.linkUrl && (
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => handleLinkPress(selectedAnnouncement.linkUrl)}
                    >
                      <Text style={styles.actionButtonText}>
                        {selectedAnnouncement.linkText || 'اضغط هنا'} →
                      </Text>
                    </TouchableOpacity>
                  )}

                  <View style={styles.modalFooter}>
                    <Text style={styles.footerText}>
                      📅 {formatDate(selectedAnnouncement.createdAt)}
                    </Text>
                  </View>
                </>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    // Removed flex: 1 to allow proper nesting in other ScrollViews/FlatLists
    minHeight: 100, // Ensure minimum height so it's visible in FlatList
    backgroundColor: colors.background.primary, // Explicit background color
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xxxl,
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: typography.size.base,
    color: colors.text.tertiary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.base,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  headerIcon: {
    fontSize: typography.size.xl,
    marginRight: spacing.sm,
  },
  headerTitle: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.bold,
    color: colors.text.primary,
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
    alignSelf: 'flex-start',
    backgroundColor: colors.accent.amber + '30',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    marginBottom: spacing.sm,
  },
  pinnedText: {
    fontSize: typography.size.xs,
    color: colors.accent.amber,
    fontWeight: typography.weight.bold,
  },
  cardHeader: {
    marginBottom: spacing.sm,
  },
  tagBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    alignSelf: 'flex-start',
  },
  tagEmoji: {
    fontSize: typography.size.sm,
    marginRight: spacing.xs,
  },
  tagText: {
    fontSize: typography.size.xs,
    fontWeight: typography.weight.bold,
  },
  cardTitle: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.bold,
    color: colors.text.primary,
    marginBottom: spacing.sm,
    lineHeight: 22,
  },
  cardImage: {
    height: 120,
    width: '100%',
    backgroundColor: colors.background.tertiary,
    borderRadius: borderRadius.sm,
    marginBottom: spacing.sm,
  },
  cardContent: {
    fontSize: typography.size.base,
    color: colors.text.secondary,
    lineHeight: 20,
    marginBottom: spacing.sm,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  dateText: {
    fontSize: typography.size.xs,
    color: colors.text.tertiary,
  },
  readMore: {
    fontSize: typography.size.sm,
    color: colors.primary.main,
    fontWeight: typography.weight.semibold,
  },
  emptyContainer: {
    // Removed flexGrow to prevent layout issues
  },
  emptyState: {
    // Removed flex: 1 which was causing issues
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xxxl,
    paddingHorizontal: spacing.base,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: spacing.md,
  },
  emptyText: {
    fontSize: typography.size.lg,
    color: colors.text.secondary,
    fontWeight: typography.weight.semibold,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: typography.size.sm,
    color: colors.text.tertiary,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  loadMoreButton: {
    backgroundColor: colors.background.secondary,
    marginHorizontal: spacing.base,
    marginVertical: spacing.md,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  loadMoreText: {
    fontSize: typography.size.base,
    color: colors.primary.main,
    fontWeight: typography.weight.semibold,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: colors.background.primary,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  closeButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: colors.background.secondary,
  },
  closeButtonText: {
    fontSize: typography.size.xl,
    color: colors.text.primary,
    fontWeight: typography.weight.bold,
  },
  modalContent: {
    padding: spacing.base,
  },
  modalTitle: {
    fontSize: typography.size.xl,
    fontWeight: typography.weight.bold,
    color: colors.text.primary,
    marginTop: spacing.md,
    marginBottom: spacing.base,
    lineHeight: 28,
  },
  modalImage: {
    height: 200,
    width: '100%',
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.md,
    marginBottom: spacing.base,
  },
  modalText: {
    fontSize: typography.size.base,
    color: colors.text.secondary,
    lineHeight: 24,
    marginBottom: spacing.base,
  },
  actionButton: {
    backgroundColor: colors.primary.main,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.base,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    marginTop: spacing.md,
    marginBottom: spacing.base,
  },
  actionButtonText: {
    fontSize: typography.size.base,
    fontWeight: typography.weight.bold,
    color: colors.text.primary,
  },
  modalFooter: {
    paddingTop: spacing.base,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
    marginTop: spacing.md,
  },
  footerText: {
    fontSize: typography.size.sm,
    color: colors.text.tertiary,
    textAlign: 'center',
  },
});

export default AnnouncementsFeed;

