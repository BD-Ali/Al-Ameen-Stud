import React, { useContext } from 'react';
import { View, Text, StyleSheet, Alert, FlatList, TouchableOpacity, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { DataContext } from '../context/DataContext';
import { AuthContext } from '../context/AuthContext';
import { colors, typography, spacing, borderRadius, shadows } from '../styles/theme';
import CompactHeader from '../components/CompactHeader';
import { FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from '../i18n/LanguageContext';

/**
 * WorkerLessonsScreen – Tab 2 for workers.
 * Shows today's lessons (with confirm/cancel actions) and upcoming lessons.
 */
const WorkerLessonsScreen = ({ navigation }) => {
  const { lessons, horses, clients, workers, loading, confirmLesson, cancelLesson } = useContext(DataContext);
  const { user, logOut } = useContext(AuthContext);
  const { t } = useTranslation();

  const currentWorker = workers?.find((w) => w.id === user?.uid);

  const today = new Date().toISOString().split('T')[0];

  // All active lessons for this worker (exclude cancelled)
  const myLessons = lessons?.filter((l) => l.instructorId === user?.uid && l.status !== 'cancelled') || [];
  const todayLessons = myLessons.filter((l) => l.date === today);
  const upcomingLessons = myLessons.filter((l) => l.date > today).sort((a, b) => {
    const dc = a.date.localeCompare(b.date);
    if (dc !== 0) return dc;
    return (a.time || '').localeCompare(b.time || '');
  });

  const getHorseName = (id) => horses?.find((h) => h.id === id)?.name || id;
  const getClientName = (id) => clients?.find((c) => c.id === id)?.name || id;

  // Format date to DD-MM-YYYY
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      return `${day}-${month}-${year}`;
    } catch {
      return dateString;
    }
  };

  const handleConfirmLesson = async (lessonId) => {
    Alert.alert(
      t('workerHome.confirmLesson'),
      t('workerHome.confirmLessonQuestion'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.confirm'),
          onPress: async () => {
            const result = await confirmLesson(lessonId);
            if (result.success) {
              Alert.alert(t('common.success'), t('workerHome.lessonConfirmed'));
            } else {
              Alert.alert(t('common.error'), result.error || t('workerHome.confirmLessonFailed'));
            }
          },
        },
      ]
    );
  };

  const handleCancelLesson = async (lessonId) => {
    Alert.alert(
      t('workerHome.cancelLesson'),
      t('workerHome.cancelLessonQuestion'),
      [
        { text: t('common.back'), style: 'cancel' },
        {
          text: t('workerHome.cancelLesson'),
          style: 'destructive',
          onPress: async () => {
            const result = await cancelLesson(lessonId, t('workerHome.cancelledByInstructor'));
            if (result.success) {
              Alert.alert(t('common.done'), t('workerHome.lessonCancelled'));
            } else {
              Alert.alert(t('common.error'), result.error || t('workerHome.cancelLessonFailed'));
            }
          },
        },
      ]
    );
  };

  const handleProfilePress = () => {
    navigation.navigate('Profile');
  };

  // Build sections data
  const buildData = () => {
    const items = [];

    // Today header
    items.push({ id: 'header-today', type: 'header', title: t('workerHome.todayLessons'), icon: 'calendar-day', iconColor: '#5DADE2', count: todayLessons.length });

    if (todayLessons.length > 0) {
      todayLessons.forEach((l) => items.push({ ...l, type: 'today-lesson' }));
    } else {
      items.push({ id: 'empty-today', type: 'empty', message: t('workerHome.noLessonsToday') });
    }

    // Upcoming header
    items.push({ id: 'header-upcoming', type: 'header', title: t('clientHome.upcomingLessons'), icon: 'calendar-alt', iconColor: '#9B59B6', count: upcomingLessons.length });

    if (upcomingLessons.length > 0) {
      upcomingLessons.forEach((l) => items.push({ ...l, type: 'upcoming-lesson' }));
    } else {
      items.push({ id: 'empty-upcoming', type: 'empty', message: t('clientHome.noUpcomingLessons') });
    }

    return items;
  };

  const renderItem = ({ item, index }) => {
    // Section header
    if (item.type === 'header') {
      return (
        <View style={[styles.sectionHeader, index > 0 && styles.sectionHeaderSpaced]}>
          <View style={styles.sectionTitleRow}>
            <FontAwesome5 name={item.icon} size={22} color={item.iconColor} solid />
            <Text style={styles.sectionTitle}>{item.title}</Text>
          </View>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{item.count}</Text>
          </View>
        </View>
      );
    }

    // Empty state
    if (item.type === 'empty') {
      return (
        <View style={styles.emptyState}>
          <FontAwesome5 name="book-open" size={36} color="#95A5A6" solid />
          <Text style={styles.emptyText}>{item.message}</Text>
        </View>
      );
    }

    // Today's lesson card (with actions)
    if (item.type === 'today-lesson') {
      return (
        <View style={styles.lessonCard}>
          <View style={styles.lessonHeader}>
            <View style={styles.lessonTimeRow}>
              <FontAwesome5 name="clock" size={14} color="#F39C12" solid />
              <Text style={styles.lessonTime}>{item.time}</Text>
            </View>
            {item.confirmed && (
              <View style={styles.completedBadge}>
                <FontAwesome5 name="check" size={10} color="#fff" solid />
                <Text style={styles.statusBadgeText}>{t('clientHome.completed')}</Text>
              </View>
            )}
            {item.status === 'cancelled' && (
              <View style={styles.cancelledBadge}>
                <FontAwesome5 name="times" size={10} color="#fff" solid />
                <Text style={styles.statusBadgeText}>{t('clientHome.cancelled')}</Text>
              </View>
            )}
          </View>
          <View style={styles.lessonDetails}>
            <View style={styles.lessonInfoRow}>
              <FontAwesome5 name="user" size={12} color="#1ABC9C" solid />
              <Text style={styles.lessonLabel}>
                {t('lessons.client')}{' '}
                <Text style={styles.lessonValue}>{getClientName(item.clientId)}</Text>
              </Text>
            </View>
            <View style={styles.lessonInfoRow}>
              <MaterialCommunityIcons name="horse-variant" size={14} color="#F39C12" />
              <Text style={styles.lessonLabel}>
                {t('lessons.horse')}{' '}
                <Text style={styles.lessonValue}>{getHorseName(item.horseId)}</Text>
              </Text>
            </View>
          </View>
          {!item.confirmed && item.status !== 'cancelled' && (
            <View style={styles.lessonActions}>
              <TouchableOpacity style={styles.confirmButton} onPress={() => handleConfirmLesson(item.id)}>
                <FontAwesome5 name="check" size={12} color="#fff" solid />
                <Text style={styles.actionButtonText}>{t('workerHome.confirmCompletion')}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.cancelButton} onPress={() => handleCancelLesson(item.id)}>
                <FontAwesome5 name="times" size={12} color="#fff" solid />
                <Text style={styles.actionButtonText}>{t('common.cancel')}</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      );
    }

    // Upcoming lesson card (read-only)
    if (item.type === 'upcoming-lesson') {
      return (
        <View style={[styles.lessonCard, styles.upcomingCard]}>
          <View style={styles.lessonHeader}>
            <View style={styles.lessonDateRow}>
              <FontAwesome5 name="calendar-alt" size={14} color="#5DADE2" solid />
              <Text style={styles.lessonDate}>{formatDate(item.date)}</Text>
            </View>
            <View style={styles.lessonTimeRow}>
              <FontAwesome5 name="clock" size={14} color="#F39C12" solid />
              <Text style={styles.lessonTime}>{item.time}</Text>
            </View>
          </View>
          <View style={styles.lessonDetails}>
            <View style={styles.lessonInfoRow}>
              <FontAwesome5 name="user" size={12} color="#1ABC9C" solid />
              <Text style={styles.lessonLabel}>
                {t('lessons.client')}{' '}
                <Text style={styles.lessonValue}>{getClientName(item.clientId)}</Text>
              </Text>
            </View>
            <View style={styles.lessonInfoRow}>
              <MaterialCommunityIcons name="horse-variant" size={14} color="#F39C12" />
              <Text style={styles.lessonLabel}>
                {t('lessons.horse')}{' '}
                <Text style={styles.lessonValue}>{getHorseName(item.horseId)}</Text>
              </Text>
            </View>
          </View>
        </View>
      );
    }

    return null;
  };

  return (
    <SafeAreaView style={styles.container}>
      <CompactHeader
        userName={currentWorker?.name || user?.email || t('roles.worker')}
        userRole="worker"
        onLogout={logOut}
        onProfilePress={handleProfilePress}
        loading={loading}
      />

      <FlatList
        data={buildData()}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.content}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  content: {
    padding: spacing.base,
    paddingBottom: Platform.OS === 'android' ? 100 : spacing.xl,
  },

  // ── Section Headers ──────────────────────────────────────────────
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  sectionHeaderSpaced: {
    marginTop: spacing.lg,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  sectionTitle: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.bold,
    color: colors.text.primary,
    lineHeight: typography.size.lg * 1.4,
  },
  badge: {
    backgroundColor: colors.primary.main,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    minWidth: 28,
    alignItems: 'center',
  },
  badgeText: {
    color: '#fff',
    fontWeight: typography.weight.bold,
    fontSize: typography.size.sm,
  },

  // ── Lesson Cards ─────────────────────────────────────────────────
  lessonCard: {
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.lg,
    padding: spacing.base,
    marginBottom: spacing.md,
    borderStartWidth: 3,
    borderStartColor: colors.primary.main,
    ...shadows.md,
  },
  upcomingCard: {
    borderStartColor: colors.accent.purple,
  },
  lessonHeader: {
    marginBottom: spacing.sm,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lessonDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  lessonDate: {
    fontSize: typography.size.sm,
    color: colors.primary.main,
    fontWeight: typography.weight.bold,
  },
  lessonTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  lessonTime: {
    fontSize: typography.size.sm,
    color: colors.text.secondary,
  },
  lessonDetails: {
    gap: spacing.xs,
  },
  lessonInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  lessonLabel: {
    fontSize: typography.size.sm,
    color: colors.text.tertiary,
    lineHeight: typography.size.sm * 1.5,
  },
  lessonValue: {
    fontSize: typography.size.sm,
    color: colors.text.primary,
    fontWeight: typography.weight.semibold,
    lineHeight: typography.size.sm * 1.5,
  },

  // ── Badges ───────────────────────────────────────────────────────
  completedBadge: {
    backgroundColor: colors.status.success,
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  cancelledBadge: {
    backgroundColor: colors.status.error,
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  statusBadgeText: {
    color: '#fff',
    fontSize: typography.size.xs,
    fontWeight: typography.weight.bold,
  },

  // ── Action Buttons ───────────────────────────────────────────────
  lessonActions: {
    flexDirection: 'row',
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  confirmButton: {
    flex: 1,
    backgroundColor: colors.status.success,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: colors.status.error,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: typography.size.sm,
    fontWeight: typography.weight.bold,
  },

  // ── Empty State ──────────────────────────────────────────────────
  emptyState: {
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    alignItems: 'center',
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  emptyText: {
    fontSize: typography.size.base,
    color: colors.text.tertiary,
    fontStyle: 'italic',
    marginTop: spacing.md,
    lineHeight: typography.size.base * 1.5,
  },
});

export default WorkerLessonsScreen;
