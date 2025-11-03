import React, { useContext } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert, SafeAreaView } from 'react-native';
import { DataContext } from '../context/DataContext';
import { AuthContext } from '../context/AuthContext';
import { colors, typography, spacing, borderRadius, shadows } from '../styles/theme';
import AnnouncementsFeed from '../components/AnnouncementsFeed';
import CompactHeader from '../components/CompactHeader';

/**
 * ClientHomeScreen displays a client's upcoming and past lessons along with
 * their current payment status. The client is automatically identified from
 * their authenticated account.
 */
const ClientHomeScreen = () => {
  const { clients, lessons, horses, workers, getConfirmedLessons, getScheduledLessons } = useContext(DataContext);
  const { user, logOut } = useContext(AuthContext);

  // Find client by matching user ID
  const selectedClient = clients.find((c) => c.id === user?.uid);

  // Get confirmed lessons (completed) and scheduled lessons separately
  const confirmedLessons = getConfirmedLessons ? getConfirmedLessons(user?.uid) : [];
  const scheduledLessons = getScheduledLessons ? getScheduledLessons(user?.uid) : [];

  // Combine for display: show both confirmed and scheduled, but only confirmed count toward totals
  const clientLessons = [...confirmedLessons, ...scheduledLessons].sort((a, b) => {
    // Sort by date descending (newest first)
    const dateCompare = new Date(b.date) - new Date(a.date);
    if (dateCompare !== 0) return dateCompare;
    // Then by time descending
    return b.time.localeCompare(a.time);
  });

  const getHorseName = (id) => horses.find((h) => h.id === id)?.name || id;
  const getWorkerName = (id) => workers.find((w) => w.id === id)?.name || id;

  // Format date to numerical format (DD-MM-YYYY)
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      return `${day}-${month}-${year}`;
    } catch (error) {
      return dateString; // Return original if parsing fails
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'تسجيل الخروج',
      'هل أنت متأكد أنك تريد تسجيل الخروج؟',
      [
        { text: 'إلغاء', style: 'cancel' },
        {
          text: 'تسجيل الخروج',
          onPress: async () => {
            await logOut();
          },
        },
      ]
    );
  };

  const handleContactUs = () => {
    Alert.alert(
      '📞 تواصل معنا',
      'للتواصل مع الإدارة:\n\n' +
      '📧 البريد الإلكتروني:\nbadarne3li@gmail.com\n\n' +
      '📱 رقم الهاتف:\n0503653429',
      [{ text: 'حسناً', style: 'default' }]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Compact Header */}
      <CompactHeader
        userName={selectedClient?.name}
        userRole="client"
        onLogout={logOut}
        loading={!selectedClient}
      />

      {selectedClient ? (
        <FlatList
          data={clientLessons}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={
            <>
              {/* Announcements Feed */}
              <AnnouncementsFeed userRole="client" />

              {/* Payment Status Card */}
              <View style={styles.paymentCard}>
                <View style={styles.paymentHeader}>
                  <Text style={styles.paymentEmoji}>💰</Text>
                  <Text style={styles.paymentTitle}>حالة الدفع</Text>
                </View>
                <View style={styles.paymentRow}>
                  <View style={styles.paymentItem}>
                    <Text style={styles.paymentLabel}>المدفوع</Text>
                    <Text style={styles.paymentAmountPaid}>₪{selectedClient.amountPaid || 0}</Text>
                  </View>
                  <View style={styles.paymentDivider} />
                  <View style={styles.paymentItem}>
                    <Text style={styles.paymentLabel}>المستحق</Text>
                    <Text style={styles.paymentAmountDue}>₪{selectedClient.amountDue || 0}</Text>
                  </View>
                </View>
              </View>

              {/* Subscription Card - Only show if client has subscription */}
              {selectedClient.hasSubscription && (
                <View style={styles.subscriptionCard}>
                  <View style={styles.subscriptionHeader}>
                    <View style={styles.subscriptionTitleContainer}>
                      <Text style={styles.subscriptionEmoji}>🎫</Text>
                      <Text style={styles.subscriptionTitle}>اشتراك العيادة</Text>
                    </View>
                    <View style={[styles.subscriptionStatusBadge, selectedClient.subscriptionActive && styles.subscriptionActiveBadge]}>
                      <Text style={styles.subscriptionStatusText}>
                        {selectedClient.subscriptionActive ? '✓ نشط' : '✕ منتهي'}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.subscriptionStats}>
                    <View style={styles.subscriptionStatItem}>
                      <Text style={styles.subscriptionStatLabel}>الدروس المتبقية</Text>
                      <Text style={styles.subscriptionStatValue}>{selectedClient.subscriptionLessons || 0}</Text>
                    </View>
                    <View style={styles.subscriptionDivider} />
                    <View style={styles.subscriptionStatItem}>
                      <Text style={styles.subscriptionStatLabel}>الدروس المستخدمة</Text>
                      <Text style={styles.subscriptionStatValue}>{selectedClient.subscriptionUsedLessons || 0}</Text>
                    </View>
                    <View style={styles.subscriptionDivider} />
                    <View style={styles.subscriptionStatItem}>
                      <Text style={styles.subscriptionStatLabel}>إجمالي الاشتراك</Text>
                      <Text style={styles.subscriptionStatValue}>{selectedClient.subscriptionTotalLessons || 0}</Text>
                    </View>
                  </View>
                  {selectedClient.subscriptionStartDate && (
                    <View style={styles.subscriptionFooter}>
                      <Text style={styles.subscriptionDate}>
                        📅 تاريخ البدء: {formatDate(selectedClient.subscriptionStartDate)}
                      </Text>
                    </View>
                  )}
                </View>
              )}

              {/* Lessons Section */}
              <View style={styles.lessonsHeader}>
                <Text style={styles.sectionTitle}>🗓️ دروسك</Text>
                <View style={styles.lessonsBadge}>
                  <Text style={styles.lessonsBadgeText}>{clientLessons.length}</Text>
                </View>
              </View>
            </>
          }
          renderItem={({ item }) => {
            const isConfirmed = item.confirmed === true || item.status === 'completed';
            const isCancelled = item.status === 'cancelled';

            return (
              <View style={[
                styles.lessonCard,
                isConfirmed && styles.lessonCardConfirmed,
                isCancelled && styles.lessonCardCancelled
              ]}>
                <View style={styles.lessonHeader}>
                  <View style={styles.lessonDateContainer}>
                    <Text style={styles.lessonDate}>📅 {formatDate(item.date)}</Text>
                    {isConfirmed && (
                      <View style={styles.confirmedBadge}>
                        <Text style={styles.confirmedBadgeText}>✓ مكتمل</Text>
                      </View>
                    )}
                    {!isConfirmed && !isCancelled && (
                      <View style={styles.scheduledBadge}>
                        <Text style={styles.scheduledBadgeText}>⏳ مجدول</Text>
                      </View>
                    )}
                    {isCancelled && (
                      <View style={styles.cancelledBadge}>
                        <Text style={styles.cancelledBadgeText}>✕ ملغي</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.lessonTime}>⏰ {item.time}</Text>
                </View>
                <View style={styles.lessonDetails}>
                  <View style={styles.lessonDetail}>
                    <Text style={styles.lessonDetailIcon}>🐴</Text>
                    <Text style={styles.lessonDetailText}>{getHorseName(item.horseId)}</Text>
                  </View>
                  <View style={styles.lessonDetail}>
                    <Text style={styles.lessonDetailIcon}>👨‍🏫</Text>
                    <Text style={styles.lessonDetailText}>{getWorkerName(item.instructorId)}</Text>
                  </View>
                </View>
              </View>
            );
          }}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyEmoji}>📭</Text>
              <Text style={styles.emptyText}>لا توجد دروس مجدولة بعد</Text>
              <Text style={styles.emptySubtext}>اتصل بنا لحجز درسك الأول!</Text>
            </View>
          }
          contentContainerStyle={styles.content}
        />
      ) : (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingEmoji}>🔄</Text>
          <Text style={styles.loadingText}>جاري تحميل معلوماتك...</Text>
        </View>
      )}

      {/* Contact Us Floating Button */}
      <TouchableOpacity
        style={styles.contactButton}
        onPress={handleContactUs}
        activeOpacity={0.8}
      >
        <Text style={styles.contactButtonIcon}>📞</Text>
      </TouchableOpacity>
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
  },
  paymentCard: {
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.lg,
    padding: spacing.base,
    marginBottom: spacing.lg,
    ...shadows.md,
  },
  paymentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  paymentEmoji: {
    fontSize: 20,
    marginRight: spacing.sm,
  },
  paymentTitle: {
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
  lessonsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.bold,
    color: colors.text.primary,
  },
  lessonsBadge: {
    backgroundColor: colors.primary.main,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    minWidth: 28,
    alignItems: 'center',
  },
  lessonsBadgeText: {
    color: '#fff',
    fontWeight: typography.weight.bold,
    fontSize: typography.size.sm,
  },
  lessonCard: {
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary.main,
    ...shadows.sm,
  },
  lessonCardConfirmed: {
    borderLeftColor: colors.status.success,
    opacity: 0.9,
  },
  lessonCardCancelled: {
    borderLeftColor: colors.status.error,
    opacity: 0.7,
  },
  lessonHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  lessonDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  lessonDate: {
    fontSize: typography.size.base,
    fontWeight: typography.weight.bold,
    color: colors.text.primary,
  },
  confirmedBadge: {
    backgroundColor: colors.status.success,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  confirmedBadgeText: {
    color: '#fff',
    fontSize: typography.size.xs,
    fontWeight: typography.weight.bold,
  },
  scheduledBadge: {
    backgroundColor: colors.primary.main,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  scheduledBadgeText: {
    color: '#fff',
    fontSize: typography.size.xs,
    fontWeight: typography.weight.bold,
  },
  cancelledBadge: {
    backgroundColor: colors.status.error,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  cancelledBadgeText: {
    color: '#fff',
    fontSize: typography.size.xs,
    fontWeight: typography.weight.bold,
  },
  lessonTime: {
    fontSize: typography.size.sm,
    color: colors.text.tertiary,
  },
  lessonDetails: {
    gap: spacing.xs,
  },
  lessonDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  lessonDetailIcon: {
    fontSize: 16,
    marginRight: spacing.sm,
  },
  lessonDetailText: {
    fontSize: typography.size.sm,
    color: colors.text.secondary,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
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
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingEmoji: {
    fontSize: 40,
    marginBottom: spacing.md,
  },
  // Subscription card styles
  subscriptionCard: {
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.lg,
    padding: spacing.base,
    marginBottom: spacing.base,
    borderWidth: 2,
    borderColor: colors.accent.teal,
    ...shadows.md,
  },
  subscriptionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  subscriptionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  subscriptionEmoji: {
    fontSize: 24,
    marginRight: spacing.sm,
  },
  subscriptionTitle: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.bold,
    color: colors.text.primary,
  },
  subscriptionStatusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.status.error,
  },
  subscriptionActiveBadge: {
    backgroundColor: colors.status.success,
  },
  subscriptionStatusText: {
    fontSize: typography.size.xs,
    fontWeight: typography.weight.bold,
    color: colors.text.primary,
  },
  subscriptionStats: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: spacing.md,
  },
  subscriptionStatItem: {
    alignItems: 'center',
    flex: 1,
  },
  subscriptionStatLabel: {
    fontSize: typography.size.xs,
    color: colors.text.tertiary,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  subscriptionStatValue: {
    fontSize: typography.size.xxl,
    fontWeight: typography.weight.bold,
    color: colors.accent.teal,
  },
  subscriptionDivider: {
    width: 1,
    height: 50,
    backgroundColor: colors.border.light,
  },
  subscriptionFooter: {
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
  subscriptionDate: {
    fontSize: typography.size.xs,
    color: colors.text.muted,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  contactButton: {
    position: 'absolute',
    bottom: spacing.xl,
    right: spacing.xl,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary.main,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.lg,
    elevation: 5,
  },
  contactButtonIcon: {
    fontSize: 24,
  },
});

export default ClientHomeScreen;
