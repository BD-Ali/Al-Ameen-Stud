import React, { useContext, useMemo } from 'react';
import { View, Text, SectionList, StyleSheet, Platform, I18nManager } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { DataContext } from '../context/DataContext';
import { AuthContext } from '../context/AuthContext';
import { colors, typography, spacing, borderRadius, shadows } from '../styles/theme';
import CompactHeader from '../components/CompactHeader';
import AnimatedCard from '../components/AnimatedCard';
import RTLText from '../components/RTLText';
import useRTL from '../hooks/useRTL';
import { FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from '../i18n/LanguageContext';

/**
 * ClientHistoryScreen displays the client's lesson history (completed/cancelled)
 * and payment history, each with dates. Tab 2 of the client bottom tabs.
 */
const ClientHistoryScreen = ({ navigation }) => {
  const { clients, horses, workers, getConfirmedLessons, getCancelledLessons, paymentHistory } = useContext(DataContext);
  const { user, logOut } = useContext(AuthContext);
  const { t } = useTranslation();
  const { rowDirection, textAlign, writingDirection } = useRTL();

  const selectedClient = clients.find((c) => c.id === user?.uid);

  // Get completed and cancelled lessons
  const confirmedLessons = getConfirmedLessons ? getConfirmedLessons(user?.uid) : [];
  const cancelledLessons = getCancelledLessons ? getCancelledLessons(user?.uid) : [];

  const getHorseName = (id) => horses.find((h) => h.id === id)?.name || id;
  const getWorkerName = (id) => workers.find((w) => w.id === id)?.name || id;

  // Format date to DD-MM-YYYY
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      return `${day}-${month}-${year}`;
    } catch (error) {
      return dateString;
    }
  };

  // Build lesson history data
  const lessonHistory = useMemo(() => {
    const all = [...confirmedLessons, ...cancelledLessons].sort((a, b) => {
      const dc = new Date(b.date) - new Date(a.date);
      if (dc !== 0) return dc;
      return (b.time || '').localeCompare(a.time || '');
    });
    return all;
  }, [confirmedLessons, cancelledLessons]);

  // Build payment history for this client
  const clientPayments = useMemo(() => {
    return (paymentHistory || [])
      .filter((p) => p.clientId === user?.uid)
      .sort((a, b) => {
        const dc = (b.date || '').localeCompare(a.date || '');
        if (dc !== 0) return dc;
        return (b.time || '').localeCompare(a.time || '');
      });
  }, [paymentHistory, user?.uid]);

  // Sections for SectionList
  const sections = useMemo(() => {
    const result = [];

    // Payment status summary (always show)
    result.push({
      title: 'paymentSummary',
      data: ['paymentSummary'],
    });

    // Lesson history section
    result.push({
      title: 'lessonHistory',
      data: lessonHistory.length > 0 ? lessonHistory : ['empty_lessons'],
    });

    // Payment history section
    result.push({
      title: 'paymentHistory',
      data: clientPayments.length > 0 ? clientPayments : ['empty_payments'],
    });

    return result;
  }, [lessonHistory, clientPayments]);

  const handleProfilePress = () => {
    navigation.navigate('Profile');
  };

  const renderSectionHeader = ({ section }) => {
    if (section.title === 'paymentSummary') return null;

    if (section.title === 'lessonHistory') {
      return (
        <View style={[styles.sectionHeader, { flexDirection: rowDirection }]}>
          <View style={[styles.sectionTitleRow, { flexDirection: rowDirection }]}>
            <FontAwesome5 name="book-open" size={20} color="#9B59B6" solid />
            <RTLText style={styles.sectionTitle}>{t('clientHome.lessonHistory')}</RTLText>
          </View>
          {lessonHistory.length > 0 && (
            <View style={styles.badge}>
              <Text style={[styles.badgeText, { writingDirection, textAlign }]}>{lessonHistory.length}</Text>
            </View>
          )}
        </View>
      );
    }

    if (section.title === 'paymentHistory') {
      return (
        <View style={[styles.sectionHeader, { flexDirection: rowDirection }]}>
          <View style={[styles.sectionTitleRow, { flexDirection: rowDirection }]}>
            <FontAwesome5 name="money-bill-wave" size={20} color="#27AE60" solid />
            <RTLText style={styles.sectionTitle}>{t('clientHome.paymentHistory')}</RTLText>
          </View>
          {clientPayments.length > 0 && (
            <View style={[styles.badge, { backgroundColor: '#27AE60' }]}>
              <Text style={[styles.badgeText, { writingDirection, textAlign }]}>{clientPayments.length}</Text>
            </View>
          )}
        </View>
      );
    }

    return null;
  };

  const renderItem = ({ item, index, section }) => {
    // Payment summary card
    if (section.title === 'paymentSummary' && item === 'paymentSummary') {
      return (
        <AnimatedCard index={0} delay={100} style={styles.paymentSummaryCard}>
          <View style={[styles.paymentHeader, { flexDirection: rowDirection }]}>
            <FontAwesome5 name="wallet" size={20} color="#5DADE2" solid />
            <RTLText style={styles.paymentHeaderTitle}> {t('clientHome.paymentStatus')}</RTLText>
          </View>
          <View style={[styles.paymentRow, { flexDirection: rowDirection }]}>
            <View style={styles.paymentItem}>
              <Text style={[styles.paymentLabel, { writingDirection, textAlign }]}>{t('clientHome.amountPaid')}</Text>
              <Text style={[styles.paymentAmountPaid, { writingDirection, textAlign }]}>₪{selectedClient?.amountPaid || 0}</Text>
            </View>
            <View style={styles.paymentDivider} />
            <View style={styles.paymentItem}>
              <Text style={[styles.paymentLabel, { writingDirection, textAlign }]}>{t('clientHome.amountDue')}</Text>
              <Text style={[styles.paymentAmountDue, { writingDirection, textAlign }]}>₪{selectedClient?.amountDue || 0}</Text>
            </View>
          </View>
        </AnimatedCard>
      );
    }

    // Empty states
    if (item === 'empty_lessons') {
      return (
        <View style={styles.emptyState}>
          <FontAwesome5 name="book-open" size={36} color="#95A5A6" solid />
          <RTLText style={[styles.emptyText, { writingDirection, textAlign }]}>{t('clientHome.noLessonHistory')}</RTLText>
        </View>
      );
    }
    if (item === 'empty_payments') {
      return (
        <View style={styles.emptyState}>
          <FontAwesome5 name="receipt" size={36} color="#95A5A6" solid />
          <RTLText style={[styles.emptyText, { writingDirection, textAlign }]}>{t('clientHome.noPayments')}</RTLText>
        </View>
      );
    }

    // Lesson card
    if (section.title === 'lessonHistory') {
      const isConfirmed = item.confirmed === true || item.status === 'completed';
      const isCancelled = item.status === 'cancelled';

      return (
        <AnimatedCard
          index={index + 1}
          delay={60}
          style={[
            styles.lessonCard,
            isConfirmed && styles.lessonCardCompleted,
            isCancelled && styles.lessonCardCancelled,
          ]}
        >
          <View style={[styles.lessonHeader, { flexDirection: rowDirection }]}>
            <View style={styles.lessonLeftCol}>
              <View style={[styles.lessonDateRow, { flexDirection: rowDirection }]}>
                <FontAwesome5 name="calendar-alt" size={14} color="#5DADE2" solid />
                <Text style={[styles.lessonDate, { writingDirection, textAlign }]}>{formatDate(item.date)}</Text>
              </View>
              <View style={[styles.lessonTimeRow, { flexDirection: rowDirection }]}>
                <FontAwesome5 name="clock" size={13} color="#F39C12" solid />
                <Text style={[styles.lessonTime, { writingDirection, textAlign }]}>{item.time}</Text>
              </View>
            </View>
            <View style={[{ flexDirection: rowDirection, alignItems: 'center', gap: 6 }]}>
              {item.isClinicLesson && (
                <View style={[styles.clinicBadge, { flexDirection: rowDirection }]}>
                  <FontAwesome5 name="ticket-alt" size={10} color="#fff" solid />
                  <Text style={[styles.statusBadgeText, { writingDirection, textAlign }]}> {t('lessons.clinicBadge')}</Text>
                </View>
              )}
              {isConfirmed && (
                <View style={[styles.completedBadge, { flexDirection: rowDirection }]}>
                  <FontAwesome5 name="check-circle" size={12} color="#fff" solid />
                  <Text style={[styles.statusBadgeText, { writingDirection, textAlign }]}> {t('clientHome.completed')}</Text>
                </View>
              )}
              {isCancelled && (
                <View style={[styles.cancelledBadge, { flexDirection: rowDirection }]}>
                  <FontAwesome5 name="times-circle" size={12} color="#fff" solid />
                  <Text style={[styles.statusBadgeText, { writingDirection, textAlign }]}> {t('clientHome.cancelled')}</Text>
                </View>
              )}
            </View>
          </View>
          <View style={styles.lessonDetails}>
            <View style={[styles.lessonDetail, { flexDirection: rowDirection }]}>
              <MaterialCommunityIcons name="horse-variant" size={16} color="#F39C12" />
              <Text style={[styles.lessonDetailText, { writingDirection, textAlign }]}>{getHorseName(item.horseId)}</Text>
            </View>
            <View style={[styles.lessonDetail, { flexDirection: rowDirection }]}>
              <FontAwesome5 name="chalkboard-teacher" size={13} color="#3498DB" solid />
              <Text style={[styles.lessonDetailText, { writingDirection, textAlign }]}>{getWorkerName(item.instructorId)}</Text>
            </View>
          </View>
        </AnimatedCard>
      );
    }

    // Payment card
    if (section.title === 'paymentHistory') {
      return (
        <AnimatedCard index={index + 1} delay={60} style={styles.paymentCard}>
          <View style={[styles.paymentCardRow, { flexDirection: rowDirection }]}>
            <View style={styles.paymentIconContainer}>
              <FontAwesome5 name="shekel-sign" size={16} color="#27AE60" solid />
            </View>
            <View style={styles.paymentCardInfo}>
              <Text style={[styles.paymentCardAmount, { writingDirection, textAlign }]}>₪{item.amount || 0}</Text>
              <View style={[styles.paymentCardDateRow, { flexDirection: rowDirection }]}>
                <FontAwesome5 name="calendar-alt" size={12} color="#5DADE2" solid />
                <Text style={[styles.paymentCardDate, { writingDirection, textAlign }]}>{formatDate(item.date)}</Text>
                {item.time ? (
                  <>
                    <FontAwesome5 name="clock" size={12} color="#F39C12" solid />
                    <Text style={[styles.paymentCardDate, { writingDirection, textAlign }]}>{item.time}</Text>
                  </>
                ) : null}
              </View>
            </View>
            {item.totalAfter != null && (
              <View style={styles.paymentTotalContainer}>
                <Text style={[styles.paymentTotalLabel, { writingDirection, textAlign }]}>{t('clientHome.totalPaid')}</Text>
                <Text style={[styles.paymentTotalValue, { writingDirection, textAlign }]}>₪{item.totalAfter}</Text>
              </View>
            )}
          </View>
        </AnimatedCard>
      );
    }

    return null;
  };

  return (
    <SafeAreaView style={styles.container}>
      <CompactHeader
        userName={selectedClient?.name}
        userRole="client"
        onLogout={logOut}
        onProfilePress={handleProfilePress}
        loading={!selectedClient}
      />

      {selectedClient ? (
        <SectionList
          sections={sections}
          keyExtractor={(item, index) => (typeof item === 'string' ? item : item.id || `item-${index}`)}
          renderItem={renderItem}
          renderSectionHeader={renderSectionHeader}
          contentContainerStyle={styles.content}
          stickySectionHeadersEnabled={false}
        />
      ) : (
        <View style={styles.loadingContainer}>
          <FontAwesome5 name="spinner" size={48} color="#3B82F6" />
          <Text style={[styles.loadingText, { writingDirection, textAlign }]}>{t('clientHome.loadingInfo')}</Text>
        </View>
      )}
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
    marginTop: spacing.lg,
    marginBottom: spacing.md,
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

  // ── Payment Summary Card ─────────────────────────────────────────
  paymentSummaryCard: {
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.lg,
    padding: spacing.base,
    marginBottom: spacing.sm,
    ...shadows.md,
  },
  paymentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  paymentHeaderTitle: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.bold,
    color: colors.text.primary,
  },
  paymentRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  paymentItem: {
    flex: 1,
    alignItems: 'center',
  },
  paymentLabel: {
    fontSize: typography.size.xs,
    color: colors.text.tertiary,
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
    fontWeight: typography.weight.semibold,
  },
  paymentAmountPaid: {
    fontSize: typography.size.xxl,
    fontWeight: typography.weight.bold,
    color: colors.status.success,
  },
  paymentAmountDue: {
    fontSize: typography.size.xxl,
    fontWeight: typography.weight.bold,
    color: colors.status.warning,
  },
  paymentDivider: {
    width: 1.5,
    height: 36,
    backgroundColor: colors.border.light,
  },

  // ── Lesson History Cards ─────────────────────────────────────────
  lessonCard: {
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderStartWidth: 3,
    borderStartColor: colors.primary.main,
    ...shadows.sm,
  },
  lessonCardCompleted: {
    borderStartColor: colors.status.success,
  },
  lessonCardCancelled: {
    borderStartColor: colors.status.error,
    opacity: 0.75,
  },
  lessonHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  lessonLeftCol: {
    gap: spacing.xs,
  },
  lessonDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  lessonDate: {
    fontSize: typography.size.base,
    fontWeight: typography.weight.bold,
    color: colors.text.primary,
  },
  lessonTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  lessonTime: {
    fontSize: typography.size.sm,
    color: colors.text.tertiary,
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.status.success,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: borderRadius.sm,
    gap: 2,
  },
  cancelledBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.status.error,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: borderRadius.sm,
    gap: 2,
  },
  clinicBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#9B59B6',
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: borderRadius.sm,
    gap: 2,
  },
  statusBadgeText: {
    color: '#fff',
    fontSize: typography.size.xs,
    fontWeight: typography.weight.bold,
  },
  lessonDetails: {
    gap: spacing.xs,
  },
  lessonDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  lessonDetailText: {
    fontSize: typography.size.sm,
    color: colors.text.secondary,
    marginStart: spacing.sm,
  },

  // ── Payment History Cards ────────────────────────────────────────
  paymentCard: {
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderStartWidth: 3,
    borderStartColor: '#27AE60',
    ...shadows.sm,
  },
  paymentCardRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  paymentIconContainer: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    backgroundColor: 'rgba(39, 174, 96, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginEnd: spacing.md,
  },
  paymentCardInfo: {
    flex: 1,
  },
  paymentCardAmount: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.bold,
    color: colors.status.success,
    marginBottom: spacing.xs,
  },
  paymentCardDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  paymentCardDate: {
    fontSize: typography.size.xs,
    color: colors.text.tertiary,
    marginEnd: spacing.sm,
  },
  paymentTotalContainer: {
    alignItems: 'center',
    paddingStart: spacing.md,
    borderStartWidth: 1,
    borderStartColor: colors.border.light,
  },
  paymentTotalLabel: {
    fontSize: typography.size.xs,
    color: colors.text.tertiary,
    marginBottom: spacing.xs,
  },
  paymentTotalValue: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.bold,
    color: colors.text.primary,
  },

  // ── Empty State ──────────────────────────────────────────────────
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl,
  },
  emptyText: {
    fontSize: typography.size.md,
    color: colors.text.secondary,
    fontWeight: typography.weight.semibold,
    marginTop: spacing.md,
    lineHeight: typography.size.md * 1.4,
  },

  // ── Loading ──────────────────────────────────────────────────────
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: typography.size.md,
    color: colors.text.secondary,
    marginTop: spacing.md,
  },
});

export default ClientHistoryScreen;
