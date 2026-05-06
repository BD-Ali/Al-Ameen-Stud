import React, { useContext, useMemo, useState } from 'react';
import { View, Text, SectionList, StyleSheet, Platform, I18nManager, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import ScreenBackground from '../components/ScreenBackground';
import { DataContext } from '../context/DataContext';
import { AuthContext } from '../context/AuthContext';
import { colors, typography, spacing, borderRadius, shadows } from '../styles/theme';
import CompactHeader from '../components/CompactHeader';
import AnimatedCard from '../components/AnimatedCard';
import RTLText from '../components/RTLText';
import useRTL from '../hooks/useRTL';
import AppIcon from '../components/AppIcon';
import { useTranslation } from '../i18n/LanguageContext';
import useTabBottomPadding from '../hooks/useTabBottomPadding';

/**
 * ClientHistoryScreen displays the client's lesson history (completed/cancelled)
 * and payment history, each with dates. Tab 2 of the client bottom tabs.
 */
const ClientHistoryScreen = ({ navigation }) => {
  const bottomPadding = useTabBottomPadding();
  const { clients, horses, workers, getConfirmedLessons, getCancelledLessons, paymentHistory } = useContext(DataContext);
  const { user, logOut } = useContext(AuthContext);
  const { t } = useTranslation();
  const { rowDirection, textAlign, writingDirection } = useRTL();

  const selectedClient = clients.find((c) => c.id === user?.uid);
  const [isExporting, setIsExporting] = useState(false);

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

  const handleExportPDF = async () => {
    setIsExporting(true);
    try {
      const lessonRows = lessonHistory.length > 0
        ? lessonHistory.map(l => `<tr><td>${formatDate(l.date)}</td><td>${l.time || '-'}</td><td>${getHorseName(l.horseId)}</td><td>${l.confirmed ? 'Completed' : (l.status === 'cancelled' ? 'Cancelled' : l.status || '-')}</td></tr>`).join('')
        : '<tr><td colspan="4" style="text-align:center;color:#999">No records</td></tr>';
      const paymentRows = clientPayments.length > 0
        ? clientPayments.map(p => `<tr><td>${formatDate(p.date)}</td><td>&#8362;${p.amount || 0}</td><td>&#8362;${p.totalAfter ?? '-'}</td></tr>`).join('')
        : '<tr><td colspan="3" style="text-align:center;color:#999">No records</td></tr>';
      const html = `<!DOCTYPE html><html><head><meta charset="utf-8"/><title>Client History</title><style>body{font-family:Arial,sans-serif;padding:24px;color:#1a1a2e}h1{font-size:22px;margin-bottom:4px}h2{font-size:16px;margin:20px 0 8px;border-bottom:2px solid #2563EB;padding-bottom:4px;color:#2563EB}.summary{display:flex;gap:32px;margin-bottom:8px}.summary-item{text-align:center}.summary-label{font-size:12px;color:#666}.summary-value{font-size:22px;font-weight:bold}.paid{color:#27AE60}.due{color:#E74C3C}table{width:100%;border-collapse:collapse;margin-bottom:8px}th{background:#2563EB;color:white;padding:8px;text-align:left;font-size:13px}td{padding:7px 8px;font-size:12px;border-bottom:1px solid #eee}tr:nth-child(even) td{background:#f7f9fc}</style></head><body><h1>${selectedClient?.name || 'Client'}</h1><h2>Payment Summary</h2><div class="summary"><div class="summary-item"><div class="summary-label">Amount Paid</div><div class="summary-value paid">&#8362;${selectedClient?.amountPaid || 0}</div></div><div class="summary-item"><div class="summary-label">Amount Due</div><div class="summary-value due">&#8362;${selectedClient?.amountDue || 0}</div></div></div><h2>Lesson History (${lessonHistory.length})</h2><table><thead><tr><th>Date</th><th>Time</th><th>Horse</th><th>Status</th></tr></thead><tbody>${lessonRows}</tbody></table><h2>Payment History (${clientPayments.length})</h2><table><thead><tr><th>Date</th><th>Amount</th><th>Total Paid</th></tr></thead><tbody>${paymentRows}</tbody></table></body></html>`;
      const { uri } = await Print.printToFileAsync({ html });
      await Sharing.shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf', dialogTitle: `${selectedClient?.name || 'Client'} History` });
    } catch (err) {
      Alert.alert('Error', err.message || 'Failed to export PDF');
    } finally {
      setIsExporting(false);
    }
  };

  const renderSectionHeader = ({ section }) => {
    if (section.title === 'paymentSummary') return null;

    if (section.title === 'lessonHistory') {
      return (
        <View style={[styles.sectionHeader, { flexDirection: rowDirection }]}>
          <View style={[styles.sectionTitleRow, { flexDirection: rowDirection }]}>
            <AppIcon name="book-outline" size={20} />
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
            <AppIcon name="cash-outline" size={20} />
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
            <AppIcon name="wallet-outline" size={20} />
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
          <TouchableOpacity
            style={styles.exportButton}
            onPress={handleExportPDF}
            disabled={isExporting}
            activeOpacity={0.7}
          >
            {isExporting
              ? <ActivityIndicator size="small" color={colors.text.primary} />
              : <AppIcon name="share-outline" size={16} color={colors.text.primary} />}
            <Text style={styles.exportButtonText}>{isExporting ? t('common.loading') : t('common.export')}</Text>
          </TouchableOpacity>
        </AnimatedCard>
      );
    }

    // Empty states
    if (item === 'empty_lessons') {
      return (
        <View style={styles.emptyState}>
          <AppIcon name="book-outline" size={36} />
          <RTLText style={[styles.emptyText, { writingDirection, textAlign }]}>{t('clientHome.noLessonHistory')}</RTLText>
        </View>
      );
    }
    if (item === 'empty_payments') {
      return (
        <View style={styles.emptyState}>
          <AppIcon name="receipt-outline" size={36} />
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
                <AppIcon name="calendar-outline" size={14} />
                <Text style={[styles.lessonDate, { writingDirection, textAlign }]}>{formatDate(item.date)}</Text>
              </View>
              <View style={[styles.lessonTimeRow, { flexDirection: rowDirection }]}>
                <AppIcon name="time-outline" size={13} />
                <Text style={[styles.lessonTime, { writingDirection, textAlign }]}>{item.time}</Text>
              </View>
            </View>
            <View style={[{ flexDirection: rowDirection, alignItems: 'center', gap: 6 }]}>
              {item.isClinicLesson && (
                <View style={[styles.clinicBadge, { flexDirection: rowDirection }]}>
                  <AppIcon name="ticket-outline" size={10} />
                  <Text style={[styles.statusBadgeText, { writingDirection, textAlign }]}> {t('lessons.clinicBadge')}</Text>
                </View>
              )}
              {isConfirmed && (
                <View style={[styles.completedBadge, { flexDirection: rowDirection }]}>
                  <AppIcon name="checkmark-circle-outline" size={12} />
                  <Text style={[styles.statusBadgeText, { writingDirection, textAlign }]}> {t('clientHome.completed')}</Text>
                </View>
              )}
              {isCancelled && (
                <View style={[styles.cancelledBadge, { flexDirection: rowDirection }]}>
                  <AppIcon name="close-circle-outline" size={12} />
                  <Text style={[styles.statusBadgeText, { writingDirection, textAlign }]}> {t('clientHome.cancelled')}</Text>
                </View>
              )}
            </View>
          </View>
          <View style={styles.lessonDetails}>
            <View style={[styles.lessonDetail, { flexDirection: rowDirection }]}>
              <AppIcon name="paw-outline" size={16} />
              <Text style={[styles.lessonDetailText, { writingDirection, textAlign }]}>{getHorseName(item.horseId)}</Text>
            </View>
            <View style={[styles.lessonDetail, { flexDirection: rowDirection }]}>
              <AppIcon name="school-outline" size={13} />
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
              <AppIcon name="cash-outline" size={16} />
            </View>
            <View style={styles.paymentCardInfo}>
              <Text style={[styles.paymentCardAmount, { writingDirection, textAlign }]}>₪{item.amount || 0}</Text>
              <View style={[styles.paymentCardDateRow, { flexDirection: rowDirection }]}>
                <AppIcon name="calendar-outline" size={12} />
                <Text style={[styles.paymentCardDate, { writingDirection, textAlign }]}>{formatDate(item.date)}</Text>
                {item.time ? (
                  <>
                    <AppIcon name="time-outline" size={12} />
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
    <ScreenBackground noSafeArea>
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
          contentContainerStyle={[styles.content, { paddingBottom: bottomPadding }]}
          stickySectionHeadersEnabled={false}
        />
      ) : (
        <View style={styles.loadingContainer}>
          <AppIcon name="sync-outline" size={48} />
          <Text style={[styles.loadingText, { writingDirection, textAlign }]}>{t('clientHome.loadingInfo')}</Text>
        </View>
      )}
    </ScreenBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    backgroundColor: 'rgba(15, 23, 42, 0.70)',
    borderRadius: borderRadius.xl,
    padding: spacing.base,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
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
    backgroundColor: 'rgba(15, 23, 42, 0.70)',
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
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
    backgroundColor: 'rgba(15, 23, 42, 0.70)',
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
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
  exportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    marginTop: spacing.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.base,
    backgroundColor: colors.primary.main,
    borderRadius: borderRadius.lg,
  },
  exportButtonText: {
    color: colors.text.primary,
    fontSize: typography.size.sm,
    fontWeight: typography.weight.semibold,
  },
});

export default ClientHistoryScreen;
