import React, { useContext, useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import { DataContext } from '../context/DataContext';
import { colors, typography, spacing, borderRadius, shadows } from '../styles/theme';
import AnimatedCard from '../components/AnimatedCard';
import RTLText from '../components/RTLText';
import useRTL from '../hooks/useRTL';
import { useFadeIn } from '../utils/animations';
import { useTranslation } from '../i18n/LanguageContext';

/**
 * UserHistoryScreen – full activity timeline for a single user.
 *
 * Route params:
 *   userId   – Firestore document id
 *   userName – display name
 *   userType – 'client' | 'worker'
 */
const UserHistoryScreen = ({ route }) => {
  const { userId, userName, userType } = route.params || {};
  const { lessons, missions, schedules, weeklySchedules, horses, clients, workerUsers, paymentHistory } = useContext(DataContext);
  const { t } = useTranslation();
  const { rowDirection, textAlign, writingDirection } = useRTL();
  const fadeStyle = useFadeIn(0);

  // Active filter tab
  const [activeFilter, setActiveFilter] = useState('all'); // all | lessons | missions | schedules

  // ── helpers ──────────────────────────────────────────────────────────
  const getHorseName = (id) => horses?.find(h => h.id === id)?.name || '';
  const getClientName = (id) => clients?.find(c => c.id === id)?.name || '';
  const getWorkerName = (id) => workerUsers?.find(w => w.id === id)?.name || '';

  const fmtDate = (d) => {
    if (!d) return '';
    try {
      const dt = new Date(d);
      return `${String(dt.getDate()).padStart(2, '0')}-${String(dt.getMonth() + 1).padStart(2, '0')}-${dt.getFullYear()}`;
    } catch { return d; }
  };

  // Status colours & icons
  const lessonStatusMeta = (status, confirmed) => {
    if (confirmed || status === 'completed') return { icon: 'check-circle', color: colors.status.success, label: t('userHistory.completed') };
    if (status === 'cancelled') return { icon: 'times-circle', color: colors.status.error, label: t('userHistory.cancelled') };
    return { icon: 'clock', color: colors.status.info, label: t('userHistory.scheduled') };
  };

  // ── build unified timeline ──────────────────────────────────────────
  const timeline = useMemo(() => {
    const items = [];

    // --- Lessons ---
    const userLessons = userType === 'client'
      ? lessons.filter(l => l.clientId === userId)
      : lessons.filter(l => l.instructorId === userId);

    userLessons.forEach(l => {
      items.push({
        id: `lesson-${l.id}`,
        type: 'lesson',
        date: l.date,
        time: l.time,
        status: l.status,
        confirmed: l.confirmed,
        horseName: getHorseName(l.horseId),
        partnerName: userType === 'client' ? getWorkerName(l.instructorId) : getClientName(l.clientId),
        partnerRole: userType === 'client' ? t('userHistory.instructor') : t('userHistory.client'),
        raw: l,
      });
    });

    // --- Missions (workers) ---
    if (userType === 'worker') {
      const userMissions = missions.filter(m => m.workerId === userId);
      userMissions.forEach(m => {
        // Skip auto-generated lesson missions to avoid duplicates
        if (m.type === 'lesson') return;

        items.push({
          id: `mission-${m.id}`,
          type: 'mission',
          date: m.dueDate,
          time: m.time || '',
          title: m.title,
          description: m.description,
          completed: m.completed,
          priority: m.priority,
          raw: m,
        });
      });

      // --- Weekly schedule tasks (workers) ---
      const userWeekly = weeklySchedules.filter(s => s.workerId === userId && s.type !== 'lesson');
      userWeekly.forEach(s => {
        items.push({
          id: `weekly-${s.id}`,
          type: 'schedule',
          date: s.weekStart || '',
          time: s.timeSlot || '',
          day: s.day,
          description: s.description,
          weekId: s.weekId,
          raw: s,
        });
      });
    }

    // --- Payments (clients) ---
    if (userType === 'client') {
      const userPayments = (paymentHistory || []).filter(p => p.clientId === userId);
      userPayments.forEach(p => {
        items.push({
          id: `payment-${p.id}`,
          type: 'payment',
          date: p.date || '',
          time: p.time || '',
          amount: p.amount,
          totalAfter: p.totalAfter,
          amountDue: p.amountDue,
          raw: p,
        });
      });
    }

    // Sort by date descending, then time descending
    items.sort((a, b) => {
      const dc = (b.date || '').localeCompare(a.date || '');
      if (dc !== 0) return dc;
      return (b.time || '').localeCompare(a.time || '');
    });

    return items;
  }, [userId, userType, lessons, missions, weeklySchedules, horses, clients, workerUsers, paymentHistory]);

  // ── filter ──────────────────────────────────────────────────────────
  const filteredTimeline = useMemo(() => {
    if (activeFilter === 'all') return timeline;
    return timeline.filter(i => i.type === activeFilter);
  }, [timeline, activeFilter]);

  // ── stats ───────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const lessonItems = timeline.filter(i => i.type === 'lesson');
    const completedLessons = lessonItems.filter(i => i.confirmed || i.status === 'completed').length;
    const cancelledLessons = lessonItems.filter(i => i.status === 'cancelled').length;
    const scheduledLessons = lessonItems.filter(i => i.status === 'scheduled' && !i.confirmed).length;
    const missionItems = timeline.filter(i => i.type === 'mission');
    const completedMissions = missionItems.filter(i => i.completed).length;
    const scheduleItems = timeline.filter(i => i.type === 'schedule');
    const paymentItems = timeline.filter(i => i.type === 'payment');
    const totalPaymentAmount = paymentItems.reduce((sum, i) => sum + (i.amount || 0), 0);

    return {
      totalLessons: lessonItems.length,
      completedLessons,
      cancelledLessons,
      scheduledLessons,
      totalMissions: missionItems.length,
      completedMissions,
      totalSchedules: scheduleItems.length,
      totalPayments: paymentItems.length,
      totalPaymentAmount,
      totalItems: timeline.length,
    };
  }, [timeline]);

  // ── filter chips ────────────────────────────────────────────────────
  const filters = useMemo(() => {
    const base = [
      { key: 'all', label: t('userHistory.all'), count: stats.totalItems, icon: 'list' },
      { key: 'lesson', label: t('userHistory.lessons'), count: stats.totalLessons, icon: 'book-open' },
    ];
    if (userType === 'worker') {
      base.push({ key: 'mission', label: t('userHistory.missions'), count: stats.totalMissions, icon: 'tasks' });
      base.push({ key: 'schedule', label: t('userHistory.schedules'), count: stats.totalSchedules, icon: 'calendar-alt' });
    }
    if (userType === 'client') {
      base.push({ key: 'payment', label: t('userHistory.payments'), count: stats.totalPayments, icon: 'money-bill-wave' });
    }
    return base;
  }, [userType, stats]);

  // ── day key helper ─────────────────────────────────────────────────
  const translateDay = (dayKey) => {
    const map = {
      saturday: t('userHistory.saturday'),
      sunday: t('userHistory.sunday'),
      monday: t('userHistory.monday'),
      tuesday: t('userHistory.tuesday'),
      wednesday: t('userHistory.wednesday'),
      thursday: t('userHistory.thursday'),
      friday: t('userHistory.friday'),
    };
    return map[dayKey] || dayKey;
  };

  // ── render a single timeline card ──────────────────────────────────
  const renderItem = ({ item, index }) => {
    if (item.type === 'lesson') return renderLessonCard(item, index);
    if (item.type === 'mission') return renderMissionCard(item, index);
    if (item.type === 'schedule') return renderScheduleCard(item, index);
    if (item.type === 'payment') return renderPaymentCard(item, index);
    return null;
  };

  const renderLessonCard = (item, index) => {
    const meta = lessonStatusMeta(item.status, item.confirmed);
    return (
      <AnimatedCard index={index} delay={50} style={[styles.timelineCard, { borderStartColor: meta.color }]}>
        {/* Type badge */}
        <View style={styles.typeBadgeRow}>
          <View style={[styles.typeBadge, { backgroundColor: colors.accent.purple }]}>
            <FontAwesome5 name="book-open" size={10} color={colors.text.primary} solid />
            <Text style={[styles.typeBadgeText, { writingDirection, textAlign }]}>{t('userHistory.lesson')}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: meta.color }]}>
            <FontAwesome5 name={meta.icon} size={10} color={colors.text.primary} solid />
            <Text style={[styles.statusBadgeText, { writingDirection, textAlign }]}>{meta.label}</Text>
          </View>
        </View>

        {/* Date + time */}
        <View style={[styles.cardRow, { flexDirection: rowDirection }]}>
          <FontAwesome5 name="calendar-alt" size={14} color={colors.accent.teal} solid />
          <Text style={[styles.cardRowText, { writingDirection, textAlign }]}>{fmtDate(item.date)}  •  {item.time}</Text>
        </View>

        {/* Horse */}
        {item.horseName ? (
          <View style={[styles.cardRow, { flexDirection: rowDirection }]}>
            <MaterialCommunityIcons name="horse-variant" size={16} color={colors.status.warning} />
            <Text style={[styles.cardRowText, { writingDirection, textAlign }]}>{item.horseName}</Text>
          </View>
        ) : null}

        {/* Partner (instructor or client) */}
        {item.partnerName ? (
          <View style={[styles.cardRow, { flexDirection: rowDirection }]}>
            <FontAwesome5 name="user" size={13} color={colors.primary.light} solid />
            <Text style={[styles.cardRowText, { writingDirection, textAlign }]}>{item.partnerRole} <Text style={{ fontWeight: typography.weight.bold, color: colors.text.primary }}>{item.partnerName}</Text></Text>
          </View>
        ) : null}
      </AnimatedCard>
    );
  };

  const renderMissionCard = (item, index) => {
    const done = item.completed;
    const priorityColor = item.priority === 'high' ? colors.status.error : item.priority === 'medium' ? colors.status.warning : colors.status.info;
    return (
      <AnimatedCard index={index} delay={50} style={[styles.timelineCard, { borderStartColor: done ? colors.status.success : priorityColor }]}>
        <View style={styles.typeBadgeRow}>
          <View style={[styles.typeBadge, { backgroundColor: colors.accent.amber }]}>
            <FontAwesome5 name="tasks" size={10} color={colors.text.primary} solid />
            <Text style={[styles.typeBadgeText, { writingDirection, textAlign }]}>{t('userHistory.mission')}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: done ? colors.status.success : colors.text.muted }]}>
            <FontAwesome5 name={done ? 'check-circle' : 'hourglass-half'} size={10} color={colors.text.primary} solid />
            <Text style={[styles.statusBadgeText, { writingDirection, textAlign }]}>{done ? t('userHistory.completed') : t('userHistory.pending')}</Text>
          </View>
        </View>

        <RTLText style={styles.missionTitle}>{item.title}</RTLText>
        {item.description ? <RTLText style={styles.missionDesc}>{item.description}</RTLText> : null}

        <View style={[styles.cardRow, { flexDirection: rowDirection }]}>
          <FontAwesome5 name="calendar-alt" size={14} color={colors.accent.teal} solid />
          <Text style={[styles.cardRowText, { writingDirection, textAlign }]}>{fmtDate(item.date)}{item.time ? `  •  ${item.time}` : ''}</Text>
        </View>
      </AnimatedCard>
    );
  };

  const renderPaymentCard = (item, index) => {
    return (
      <AnimatedCard index={index} delay={50} style={[styles.timelineCard, { borderStartColor: colors.status.success }]}>
        {/* Type badge */}
        <View style={styles.typeBadgeRow}>
          <View style={[styles.typeBadge, { backgroundColor: colors.status.success }]}>
            <FontAwesome5 name="money-bill-wave" size={10} color={colors.text.primary} solid />
            <Text style={[styles.typeBadgeText, { writingDirection, textAlign }]}>{t('userHistory.payment')}</Text>
          </View>
        </View>

        {/* Amount */}
        <View style={[styles.cardRow, { flexDirection: rowDirection }]}>
          <FontAwesome5 name="shekel-sign" size={14} color={colors.status.success} solid />
          <Text style={[styles.cardRowText, { fontWeight: 'bold', fontSize: typography.size.lg, color: colors.status.success }]}>
            {item.amount} ₪
          </Text>
        </View>

        {/* Total after payment */}
        {item.totalAfter != null && (
          <View style={[styles.cardRow, { flexDirection: rowDirection }]}>
            <FontAwesome5 name="wallet" size={14} color={colors.primary.light} solid />
            <Text style={[styles.cardRowText, { writingDirection, textAlign }]}>{t('userHistory.totalAfterPayment')} <Text style={{ fontWeight: typography.weight.bold }}>{item.totalAfter} ₪</Text></Text>
          </View>
        )}

        {/* Amount due */}
        {item.amountDue != null && (
          <View style={[styles.cardRow, { flexDirection: rowDirection }]}>
            <FontAwesome5 name="file-invoice-dollar" size={14} color={colors.status.warning} solid />
            <Text style={[styles.cardRowText, { writingDirection, textAlign }]}>{t('userHistory.amountDue')} <Text style={{ fontWeight: typography.weight.bold }}>{item.amountDue} ₪</Text></Text>
          </View>
        )}

        {/* Date + time */}
        <View style={[styles.cardRow, { flexDirection: rowDirection }]}>
          <FontAwesome5 name="calendar-alt" size={14} color={colors.accent.teal} solid />
          <Text style={[styles.cardRowText, { writingDirection, textAlign }]}>{fmtDate(item.date)}{item.time ? `  •  ${item.time}` : ''}</Text>
        </View>
      </AnimatedCard>
    );
  };

  const renderScheduleCard = (item, index) => {
    return (
      <AnimatedCard index={index} delay={50} style={[styles.timelineCard, { borderStartColor: colors.accent.teal }]}>
        <View style={styles.typeBadgeRow}>
          <View style={[styles.typeBadge, { backgroundColor: colors.accent.teal }]}>
            <FontAwesome5 name="calendar-alt" size={10} color={colors.text.primary} solid />
            <Text style={[styles.typeBadgeText, { writingDirection, textAlign }]}>{t('userHistory.scheduleTask')}</Text>
          </View>
          {item.weekId ? (
            <Text style={[styles.weekIdText, { writingDirection, textAlign }]}>{item.weekId}</Text>
          ) : null}
        </View>

        {item.description ? <RTLText style={styles.missionTitle}>{item.description}</RTLText> : null}

        <View style={[styles.cardRow, { flexDirection: rowDirection }]}>
          <FontAwesome5 name="clock" size={14} color={colors.primary.light} solid />
          <Text style={[styles.cardRowText, { writingDirection, textAlign }]}>{translateDay(item.day)}  •  {item.time}</Text>
        </View>
      </AnimatedCard>
    );
  };

  // ── main render ─────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.container}>
      {/* User header */}
      <View style={styles.header}>
        <View style={styles.avatarRow}>
          <View style={[styles.avatar, userType === 'client' ? styles.avatarClient : styles.avatarWorker]}>
            <Text style={[styles.avatarText, { writingDirection, textAlign }]}>{userName?.charAt(0) || '?'}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <RTLText style={styles.userName}>{userName}</RTLText>
            <RTLText style={styles.userRole}>
              {userType === 'client' ? t('userHistory.clientRole') : t('userHistory.workerRole')}
            </RTLText>
          </View>
          <View style={styles.statCard}>
            <FontAwesome5 name="book-open" size={16} color={colors.accent.purple} solid />
            <Text style={[styles.statValue, { writingDirection, textAlign }]}>{stats.totalLessons}</Text>
            <Text style={[styles.statLabel, { writingDirection, textAlign }]}>{t('userHistory.lessons')}</Text>
          </View>
          <View style={styles.statCard}>
            <FontAwesome5 name="check-circle" size={16} color={colors.status.success} solid />
            <Text style={[styles.statValue, { writingDirection, textAlign }]}>{stats.completedLessons}</Text>
            <Text style={[styles.statLabel, { writingDirection, textAlign }]}>{t('userHistory.completed')}</Text>
          </View>
          {userType === 'worker' ? (
            <View style={styles.statCard}>
              <FontAwesome5 name="tasks" size={16} color={colors.accent.amber} solid />
              <Text style={[styles.statValue, { writingDirection, textAlign }]}>{stats.totalMissions}</Text>
              <Text style={[styles.statLabel, { writingDirection, textAlign }]}>{t('userHistory.missions')}</Text>
            </View>
          ) : (
            <View style={styles.statCard}>
              <FontAwesome5 name="money-bill-wave" size={16} color={colors.status.success} solid />
              <Text style={[styles.statValue, { writingDirection, textAlign }]}>{stats.totalPayments}</Text>
              <Text style={[styles.statLabel, { writingDirection, textAlign }]}>{t('userHistory.payments')}</Text>
            </View>
          )}
        </View>

        {/* Filter chips */}
        <View style={styles.filterRow}>
          {filters.map(f => (
            <TouchableOpacity
              key={f.key}
              style={[styles.filterChip, activeFilter === f.key && styles.filterChipActive]}
              onPress={() => setActiveFilter(f.key)}
              activeOpacity={0.7}
            >
              <FontAwesome5 name={f.icon} size={12} color={activeFilter === f.key ? colors.text.primary : colors.text.tertiary} solid />
              <Text style={[styles.filterChipText, activeFilter === f.key && styles.filterChipTextActive, { writingDirection, textAlign }]}>
                {f.label} ({f.count})
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Timeline list */}
      <FlatList
        data={filteredTimeline}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <FontAwesome5 name="history" size={56} color={colors.text.muted} />
            <RTLText style={styles.emptyText}>{t('userHistory.noHistory')}</RTLText>
            <RTLText style={styles.emptySubtext}>{t('userHistory.noHistoryDesc')}</RTLText>
          </View>
        }
      />
    </SafeAreaView>
  );
};

// ── styles ──────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  header: {
    backgroundColor: colors.background.secondary,
    paddingTop: spacing.base,
    paddingHorizontal: spacing.base,
    paddingBottom: spacing.md,
    borderBottomLeftRadius: borderRadius.xl,
    borderBottomRightRadius: borderRadius.xl,
    ...shadows.lg,
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.base,
    gap: spacing.md,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.xxxl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarClient: {
    backgroundColor: colors.status.info,
  },
  avatarWorker: {
    backgroundColor: colors.accent.pink,
  },
  avatarText: {
    fontSize: typography.size.xxl,
    fontWeight: typography.weight.bold,
    color: colors.text.primary,
  },
  userName: {
    fontSize: typography.size.xl,
    fontWeight: typography.weight.bold,
    color: colors.text.primary,
  },
  userRole: {
    fontSize: typography.size.sm,
    color: colors.text.tertiary,
    marginTop: 2,
  },

  // Stats
  statsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.surface.elevated,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
    gap: spacing.xs,
    ...shadows.sm,
  },
  statValue: {
    fontSize: typography.size.xl,
    fontWeight: typography.weight.bold,
    color: colors.text.primary,
  },
  statLabel: {
    fontSize: typography.size.xs,
    color: colors.text.tertiary,
    fontWeight: typography.weight.semibold,
  },

  // Filter chips
  filterRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.surface.elevated,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1.5,
    borderColor: colors.border.light,
  },
  filterChipActive: {
    backgroundColor: colors.primary.main,
    borderColor: colors.primary.main,
  },
  filterChipText: {
    fontSize: typography.size.sm,
    color: colors.text.tertiary,
    fontWeight: typography.weight.semibold,
  },
  filterChipTextActive: {
    color: colors.text.primary,
    fontWeight: typography.weight.bold,
  },

  // Timeline list
  listContent: {
    padding: spacing.base,
    paddingBottom: spacing.xxxl,
  },
  timelineCard: {
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.lg,
    padding: spacing.base,
    marginBottom: spacing.md,
    borderStartWidth: 4,
    ...shadows.md,
  },
  typeBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: borderRadius.sm,
  },
  typeBadgeText: {
    fontSize: typography.size.xs,
    fontWeight: typography.weight.bold,
    color: colors.text.primary,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: borderRadius.sm,
  },
  statusBadgeText: {
    fontSize: typography.size.xs,
    fontWeight: typography.weight.bold,
    color: colors.text.primary,
  },
  weekIdText: {
    fontSize: typography.size.xs,
    color: colors.text.muted,
    fontStyle: 'italic',
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  cardRowText: {
    fontSize: typography.size.sm,
    color: colors.text.secondary,
    fontWeight: typography.weight.semibold,
  },
  missionTitle: {
    fontSize: typography.size.base,
    fontWeight: typography.weight.bold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  missionDesc: {
    fontSize: typography.size.sm,
    color: colors.text.tertiary,
    marginBottom: spacing.sm,
  },

  // Empty state
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xxxl * 2,
    gap: spacing.sm,
  },
  emptyText: {
    fontSize: typography.size.lg,
    color: colors.text.secondary,
    fontWeight: typography.weight.semibold,
  },
  emptySubtext: {
    fontSize: typography.size.sm,
    color: colors.text.muted,
    textAlign: 'center',
    paddingHorizontal: spacing.xxl,
  },
});

export default UserHistoryScreen;
