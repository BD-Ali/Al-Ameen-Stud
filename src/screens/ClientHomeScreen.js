import React, { useContext } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert, SafeAreaView, Linking, Image, ScrollView, Animated, I18nManager } from 'react-native';
import { DataContext } from '../context/DataContext';
import { AuthContext } from '../context/AuthContext';
import { colors, typography, spacing, borderRadius, shadows } from '../styles/theme';
import AnnouncementsFeed from '../components/AnnouncementsFeed';
import CompactHeader from '../components/CompactHeader';
import AnimatedCard from '../components/AnimatedCard';
import { useFadeIn, usePulse } from '../utils/animations';
import { FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from '../i18n/LanguageContext';

/**
 * ClientHomeScreen displays a client's upcoming and past lessons along with
 * their current payment status. The client is automatically identified from
 * their authenticated account.
 */
const ClientHomeScreen = ({ navigation }) => {
  const { clients, lessons, horses, workers, getConfirmedLessons, getScheduledLessons, getCancelledLessons } = useContext(DataContext);
  const { user, logOut } = useContext(AuthContext);
  const { t } = useTranslation();

  // Animations
  const fadeAnim = useFadeIn(600);
  const pulseAnim = usePulse();

  // Find client by matching user ID
  const selectedClient = clients.find((c) => c.id === user?.uid);

  // Get confirmed lessons (completed) and scheduled lessons separately
  const confirmedLessons = getConfirmedLessons ? getConfirmedLessons(user?.uid) : [];
  const scheduledLessons = getScheduledLessons ? getScheduledLessons(user?.uid) : [];
  const cancelledLessons = getCancelledLessons ? getCancelledLessons(user?.uid) : [];

  // Combine for display: show confirmed, scheduled, and cancelled lessons
  const clientLessons = [...confirmedLessons, ...scheduledLessons, ...cancelledLessons].sort((a, b) => {
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
      t('auth.logout'),
      t('auth.logoutConfirm'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('auth.logout'),
          onPress: async () => {
            await logOut();
          },
        },
      ]
    );
  };

  const handleContactUs = () => {
    Alert.alert(
      t('clientHome.contactUs'),
      t('visitorHome.contactChooseMethod'),
      [
        {
          text: t('visitorHome.sendEmail'),
          onPress: () => {
            Linking.openURL('mailto:Lina.b.96@hotmail.com').catch(err => {
              Alert.alert(t('common.error'), t('visitorHome.cannotOpenEmail'));
            });
          }
        },
        {
          text: t('visitorHome.phoneCall'),
          onPress: () => {
            Linking.openURL('tel:0526913008').catch(err => {
              Alert.alert(t('common.error'), t('visitorHome.cannotMakeCall'));
            });
          }
        },
        {
          text: t('common.cancel'),
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
                  <FontAwesome5 name="money-bill-wave" size={20} color="#27AE60" solid />
                  <Text style={styles.paymentTitle}> {t('clientHome.paymentStatus')}</Text>
                </View>
                <View style={styles.paymentRow}>
                  <View style={styles.paymentItem}>
                    <Text style={styles.paymentLabel}>{t('clientHome.amountPaid')}</Text>
                    <Text style={styles.paymentAmountPaid}>₪{selectedClient.amountPaid || 0}</Text>
                  </View>
                  <View style={styles.paymentDivider} />
                  <View style={styles.paymentItem}>
                    <Text style={styles.paymentLabel}>{t('clientHome.amountDue')}</Text>
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
                      <Text style={styles.subscriptionTitle}>{t('clientHome.clinicSubscription')}</Text>
                    </View>
                    <View style={[styles.subscriptionStatusBadge, selectedClient.subscriptionActive && styles.subscriptionActiveBadge]}>
                      <FontAwesome5
                        name={selectedClient.subscriptionActive ? 'check' : 'times'}
                        size={10}
                        color="#fff"
                        solid
                      />
                      <Text style={styles.subscriptionStatusText}>
                        {selectedClient.subscriptionActive ? ` ${t('clientHome.active')}` : ` ${t('clientHome.expired')}`}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.subscriptionStats}>
                    <View style={styles.subscriptionStatItem}>
                      <Text style={styles.subscriptionStatLabel}>{t('clientHome.remainingLessons')}</Text>
                      <Text style={styles.subscriptionStatValue}>{selectedClient.subscriptionLessons || 0}</Text>
                    </View>
                    <View style={styles.subscriptionDivider} />
                    <View style={styles.subscriptionStatItem}>
                      <Text style={styles.subscriptionStatLabel}>{t('clientHome.usedLessons')}</Text>
                      <Text style={styles.subscriptionStatValue}>{selectedClient.subscriptionUsedLessons || 0}</Text>
                    </View>
                    <View style={styles.subscriptionDivider} />
                    <View style={styles.subscriptionStatItem}>
                      <Text style={styles.subscriptionStatLabel}>{t('clientHome.totalLessons')}</Text>
                      <Text style={styles.subscriptionStatValue}>{selectedClient.subscriptionTotalLessons || 0}</Text>
                    </View>
                  </View>
                  {selectedClient.subscriptionStartDate && (
                    <View style={styles.subscriptionFooter}>
                      <View style={styles.subscriptionDateRow}>
                        <FontAwesome5 name="calendar-alt" size={14} color="#5DADE2" solid />
                        <Text style={styles.subscriptionDate}>
                          {t('clientHome.startDate')} {formatDate(selectedClient.subscriptionStartDate)}
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
                      <Text style={styles.sectionTitle}>{t('workerHome.ourHorses')}</Text>
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
                  <Text style={styles.sectionTitle}>{t('clientHome.yourLessons')}</Text>
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
                        <Text style={styles.confirmedBadgeText}> {t('clientHome.completed')}</Text>
                      </View>
                    )}
                    {!isConfirmed && !isCancelled && (
                      <View style={styles.scheduledBadge}>
                        <FontAwesome5 name="hourglass-half" size={12} color="#F39C12" solid />
                        <Text style={styles.scheduledBadgeText}> {t('clientHome.scheduled')}</Text>
                      </View>
                    )}
                    {isCancelled && (
                      <View style={styles.cancelledBadge}>
                        <FontAwesome5 name="times-circle" size={12} color="#E74C3C" solid />
                        <Text style={styles.cancelledBadgeText}> {t('clientHome.cancelled')}</Text>
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
              <Text style={styles.emptyText}>{t('clientHome.noScheduledLessons')}</Text>
              <Text style={styles.emptySubtext}>{t('clientHome.contactToBook')}</Text>
            </View>
          }
          contentContainerStyle={styles.content}
        />
      ) : (
        <View style={styles.loadingContainer}>
          <FontAwesome5 name="spinner" size={48} color="#3B82F6" />
          <Text style={styles.loadingText}>{t('clientHome.loadingInfo')}</Text>
        </View>
      )}

      {/* Contact Us Floating Button */}
      <TouchableOpacity
        style={styles.contactButton}
        onPress={handleContactUs}
        activeOpacity={0.8}
      >
        <Animated.View style={{ transform: [{ scale: pulseAnim }, { scaleX: I18nManager.isRTL ? -1 : 1 }] }}>
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
    marginBottom: spacing.md,
  },
  paymentEmoji: {
    fontSize: 20,
    marginEnd: spacing.sm,
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
    borderStartWidth: 3,
    borderStartColor: colors.primary.main,
    ...shadows.sm,
  },
  lessonCardConfirmed: {
    borderStartColor: colors.status.success,
    opacity: 0.9,
  },
  lessonCardCancelled: {
    borderStartColor: colors.status.error,
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
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.status.success,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
    gap: 2,
  },
  confirmedBadgeText: {
    color: '#fff',
    fontSize: typography.size.xs,
    fontWeight: typography.weight.bold,
  },
  scheduledBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary.main,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
    gap: 2,
  },
  scheduledBadgeText: {
    color: '#fff',
    fontSize: typography.size.xs,
    fontWeight: typography.weight.bold,
  },
  cancelledBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.status.error,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
    gap: 2,
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
    marginEnd: spacing.sm,
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
    marginEnd: spacing.sm,
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
    marginEnd: spacing.md,
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
    end: spacing.xl,
    width: 56,
    height: 56,
    borderRadius: borderRadius.xxxl,
    backgroundColor: colors.primary.main,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.lg,
    elevation: 5,
  },

});

export default ClientHomeScreen;
