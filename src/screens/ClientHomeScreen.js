import React, { useContext } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert, SafeAreaView, Linking, Image, ScrollView, Animated } from 'react-native';
import { DataContext } from '../context/DataContext';
import { AuthContext } from '../context/AuthContext';
import { colors, typography, spacing, borderRadius, shadows } from '../styles/theme';
import AnnouncementsFeed from '../components/AnnouncementsFeed';
import CompactHeader from '../components/CompactHeader';
import AnimatedCard from '../components/AnimatedCard';
import { useFadeIn, usePulse } from '../utils/animations';
import { FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';

/**
 * ClientHomeScreen displays a client's upcoming and past lessons along with
 * their current payment status. The client is automatically identified from
 * their authenticated account.
 */
const ClientHomeScreen = ({ navigation }) => {
  const { clients, lessons, horses, workers, getConfirmedLessons, getScheduledLessons } = useContext(DataContext);
  const { user, logOut } = useContext(AuthContext);

  // Animations
  const fadeAnim = useFadeIn(600);
  const pulseAnim = usePulse();

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
      'تواصل معنا',
      'اختر طريقة التواصل مع الإدارة:',
      [
        {
          text: '📧 إرسال بريد إلكتروني',
          onPress: () => {
            Linking.openURL('mailto:badarne3li@gmail.com').catch(err => {
              Alert.alert('خطأ', 'لا يمكن فتح تطبيق البريد الإلكتروني');
            });
          }
        },
        {
          text: '📱 اتصال هاتفي',
          onPress: () => {
            Linking.openURL('tel:0503653429').catch(err => {
              Alert.alert('خطأ', 'لا يمكن إجراء المكالمة');
            });
          }
        },
        {
          text: 'إلغاء',
          style: 'cancel'
        }
      ]
    );
  };

  const handleProfilePress = () => {
    navigation.navigate('Profile');
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Compact Header */}
      <CompactHeader
        userName={selectedClient?.name}
        userRole="client"
        onLogout={logOut}
        onProfilePress={handleProfilePress}
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
              <AnimatedCard index={0} delay={100} style={styles.paymentCard}>
                <View style={styles.paymentHeader}>
                  <FontAwesome5 name="wallet" size={20} color="#27AE60" solid />
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
              </AnimatedCard>

              {/* Subscription Card - Only show if client has subscription */}
              {selectedClient.hasSubscription && (
                <AnimatedCard index={1} delay={100} style={styles.subscriptionCard}>
                  <View style={styles.subscriptionHeader}>
                    <View style={styles.subscriptionTitleContainer}>
                      <FontAwesome5 name="ticket-alt" size={18} color="#9B59B6" solid />
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
                      <View style={styles.subscriptionDateRow}>
                        <FontAwesome5 name="calendar-alt" size={14} color="#5DADE2" solid />
                        <Text style={styles.subscriptionDate}>
                          تاريخ البدء: {formatDate(selectedClient.subscriptionStartDate)}
                        </Text>
                      </View>
                    </View>
                  )}
                </AnimatedCard>
              )}

              {/* Horses Gallery Section */}
              {horses && horses.length > 0 && (
                <>
                  <View style={styles.horsesHeader}>
                    <View style={styles.sectionTitleRow}>
                      <MaterialCommunityIcons name="horse-variant" size={24} color="#F39C12" />
                      <Text style={styles.sectionTitle}>خيولنا</Text>
                    </View>
                    <View style={styles.horsesBadge}>
                      <Text style={styles.horsesBadgeText}>{horses.length}</Text>
                    </View>
                  </View>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.horsesScrollView}
                    contentContainerStyle={styles.horsesScrollContent}
                  >
                    {horses.map((horse, index) => (
                      <AnimatedCard key={horse.id} index={index} delay={60} style={styles.horseCardCompact}>
                        {horse.imageUrl ? (
                          <Image
                            source={{ uri: horse.imageUrl }}
                            style={styles.horseImageCompact}
                            resizeMode="cover"
                          />
                        ) : (
                          <View style={styles.horseImagePlaceholder}>
                            <MaterialCommunityIcons name="horse-variant" size={40} color="#F39C12" />
                          </View>
                        )}
                        <View style={styles.horseCardCompactInfo}>
                          <Text style={styles.horseCardCompactName}>{horse.name}</Text>
                          <Text style={styles.horseCardCompactBreed}>{horse.breed}</Text>
                        </View>
                      </AnimatedCard>
                    ))}
                  </ScrollView>
                </>
              )}

              {/* Lessons Section */}
              <View style={styles.lessonsHeader}>
                <View style={styles.sectionTitleRow}>
                  <FontAwesome5 name="calendar-check" size={22} color="#9B59B6" solid />
                  <Text style={styles.sectionTitle}>دروسك</Text>
                </View>
                <View style={styles.lessonsBadge}>
                  <Text style={styles.lessonsBadgeText}>{clientLessons.length}</Text>
                </View>
              </View>
            </>
          }
          renderItem={({ item, index }) => {
            const isConfirmed = item.confirmed === true || item.status === 'completed';
            const isCancelled = item.status === 'cancelled';

            return (
              <AnimatedCard
                index={index + 2}
                delay={80}
                style={[
                  styles.lessonCard,
                  isConfirmed && styles.lessonCardConfirmed,
                  isCancelled && styles.lessonCardCancelled
                ]}
              >
                <View style={styles.lessonHeader}>
                  <View style={styles.lessonDateContainer}>
                    <View style={styles.lessonDateRow}>
                      <FontAwesome5 name="calendar-alt" size={14} color="#5DADE2" solid />
                      <Text style={styles.lessonDate}>{formatDate(item.date)}</Text>
                    </View>
                    {isConfirmed && (
                      <View style={styles.confirmedBadge}>
                        <FontAwesome5 name="check-circle" size={12} color="#27AE60" solid />
                        <Text style={styles.confirmedBadgeText}> مكتمل</Text>
                      </View>
                    )}
                    {!isConfirmed && !isCancelled && (
                      <View style={styles.scheduledBadge}>
                        <FontAwesome5 name="hourglass-half" size={12} color="#F39C12" solid />
                        <Text style={styles.scheduledBadgeText}> مجدول</Text>
                      </View>
                    )}
                    {isCancelled && (
                      <View style={styles.cancelledBadge}>
                        <FontAwesome5 name="times-circle" size={12} color="#E74C3C" solid />
                        <Text style={styles.cancelledBadgeText}> ملغي</Text>
                      </View>
                    )}
                  </View>
                  <View style={styles.lessonTimeRow}>
                    <FontAwesome5 name="clock" size={14} color="#F39C12" solid />
                    <Text style={styles.lessonTime}>{item.time}</Text>
                  </View>
                </View>
                <View style={styles.lessonDetails}>
                  <View style={styles.lessonDetail}>
                    <MaterialCommunityIcons name="horse-variant" size={16} color="#F39C12" />
                    <Text style={styles.lessonDetailText}>{getHorseName(item.horseId)}</Text>
                  </View>
                  <View style={styles.lessonDetail}>
                    <FontAwesome5 name="chalkboard-teacher" size={14} color="#3498DB" solid />
                    <Text style={styles.lessonDetailText}>{getWorkerName(item.instructorId)}</Text>
                  </View>
                </View>
              </AnimatedCard>
            );
          }}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <FontAwesome5 name="calendar-times" size={48} color="#95A5A6" solid />
              <Text style={styles.emptyText}>لا توجد دروس مجدولة بعد</Text>
              <Text style={styles.emptySubtext}>اتصل بنا لحجز درسك الأول!</Text>
            </View>
          }
          contentContainerStyle={styles.content}
        />
      ) : (
        <View style={styles.loadingContainer}>
          <FontAwesome5 name="spinner" size={48} color="#3B82F6" />
          <Text style={styles.loadingText}>جاري تحميل معلوماتك...</Text>
        </View>
      )}

      {/* Contact Us Floating Button */}
      <TouchableOpacity
        style={styles.contactButton}
        onPress={handleContactUs}
        activeOpacity={0.8}
      >
        <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
          <FontAwesome5 name="phone" size={20} color="#fff" solid />
        </Animated.View>
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
    gap: spacing.sm,
    marginBottom: spacing.md,
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
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  sectionTitle: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.bold,
    color: colors.text.primary,
  },
  subscriptionDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  lessonDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  lessonTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
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
    gap: spacing.sm,
  },
  subscriptionTitle: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.bold,
    color: colors.text.primary,
  },
  subscriptionStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.status.error,
    gap: 4,
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
  // Horses gallery styles
  horsesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
    paddingHorizontal: spacing.xs,
  },
  horsesBadge: {
    backgroundColor: colors.primary.main,
    borderRadius: borderRadius.full,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xs,
  },
  horsesBadgeText: {
    color: '#fff',
    fontSize: typography.size.xs,
    fontWeight: typography.weight.bold,
  },
  horsesScrollView: {
    marginBottom: spacing.base,
  },
  horsesScrollContent: {
    paddingHorizontal: spacing.xs,
  },
  horseCardCompact: {
    width: 160,
    marginRight: spacing.md,
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    ...shadows.sm,
  },
  horseImageCompact: {
    width: '100%',
    height: 120,
    backgroundColor: colors.background.tertiary,
  },
  horseImagePlaceholder: {
    width: '100%',
    height: 120,
    backgroundColor: colors.background.tertiary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  horseImagePlaceholderText: {
    fontSize: 48,
  },
  horseCardCompactInfo: {
    padding: spacing.sm,
  },
  horseCardCompactName: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.bold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  horseCardCompactBreed: {
    fontSize: typography.size.sm,
    color: colors.text.tertiary,
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
