import React, { useContext } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert, Linking, Image, ScrollView, Animated, I18nManager, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { DataContext } from '../context/DataContext';
import { AuthContext } from '../context/AuthContext';
import { colors, typography, spacing, borderRadius, shadows } from '../styles/theme';
import AnnouncementsFeed from '../components/AnnouncementsFeed';
import CompactHeader from '../components/CompactHeader';
import AnimatedCard from '../components/AnimatedCard';
import RTLText from '../components/RTLText';
import useRTL from '../hooks/useRTL';
import { useFadeIn, usePulse } from '../utils/animations';
import { FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from '../i18n/LanguageContext';

/**
 * ClientHomeScreen displays announcements, upcoming scheduled lessons,
 * horses gallery, and contact FAB. Payment and lesson history live in
 * the ClientHistoryScreen (second tab).
 */
const ClientHomeScreen = ({ navigation }) => {
  const { clients, horses, workers, getScheduledLessons } = useContext(DataContext);
  const { user, logOut } = useContext(AuthContext);
  const { t } = useTranslation();
  const { rowDirection, textAlign, writingDirection } = useRTL();

  // Animations
  const fadeAnim = useFadeIn(600);
  const pulseAnim = usePulse();

  // Find client by matching user ID
  const selectedClient = clients.find((c) => c.id === user?.uid);

  // Only upcoming scheduled lessons (not completed/cancelled)
  const scheduledLessons = getScheduledLessons ? getScheduledLessons(user?.uid) : [];

  // Sort scheduled lessons: nearest first (ascending date)
  const upcomingLessons = [...scheduledLessons].sort((a, b) => {
    const dateCompare = new Date(a.date) - new Date(b.date);
    if (dateCompare !== 0) return dateCompare;
    return a.time.localeCompare(b.time);
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
          text: t('visitorHome.instagram'),
          onPress: () => {
            Linking.openURL('https://www.instagram.com/alamein_stud').catch(() => {
              Alert.alert(t('common.error'), t('visitorHome.cannotOpenInstagram'));
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
          data={upcomingLessons}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={
            <>
              {/* Announcements Feed */}
              <AnnouncementsFeed userRole="client" />

              {/* Subscription Card - Only show if client has subscription */}
              {selectedClient.hasSubscription && (
                <AnimatedCard index={0} delay={100} style={styles.subscriptionCard}>
                  <View style={[styles.subscriptionHeader, { flexDirection: rowDirection }]}>
                    <View style={[styles.subscriptionTitleContainer, { flexDirection: rowDirection }]}>
                      <FontAwesome5 name="ticket-alt" size={18} color="#9B59B6" solid />
                      <RTLText style={styles.subscriptionTitle}>{t('clientHome.clinicSubscription')}</RTLText>
                    </View>
                    <View style={[styles.subscriptionStatusBadge, selectedClient.subscriptionActive && styles.subscriptionActiveBadge]}>
                      <FontAwesome5
                        name={selectedClient.subscriptionActive ? 'check' : 'times'}
                        size={10}
                        color="#fff"
                        solid
                      />
                      <Text style={[styles.subscriptionStatusText, { writingDirection, textAlign }]}>
                        {selectedClient.subscriptionActive ? ` ${t('clientHome.active')}` : ` ${t('clientHome.expired')}`}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.subscriptionStats}>
                    <View style={styles.subscriptionStatItem}>
                      <Text style={[styles.subscriptionStatLabel, { writingDirection, textAlign }]}>{t('clientHome.remainingLessons')}</Text>
                      <Text style={[styles.subscriptionStatValue, { writingDirection, textAlign }]}>{selectedClient.subscriptionLessons || 0}</Text>
                    </View>
                    <View style={styles.subscriptionDivider} />
                    <View style={styles.subscriptionStatItem}>
                      <Text style={[styles.subscriptionStatLabel, { writingDirection, textAlign }]}>{t('clientHome.usedLessons')}</Text>
                      <Text style={[styles.subscriptionStatValue, { writingDirection, textAlign }]}>{selectedClient.subscriptionUsedLessons || 0}</Text>
                    </View>
                    <View style={styles.subscriptionDivider} />
                    <View style={styles.subscriptionStatItem}>
                      <Text style={[styles.subscriptionStatLabel, { writingDirection, textAlign }]}>{t('clientHome.totalLessons')}</Text>
                      <Text style={[styles.subscriptionStatValue, { writingDirection, textAlign }]}>{selectedClient.subscriptionTotalLessons || 0}</Text>
                    </View>
                  </View>
                  {selectedClient.subscriptionStartDate && (
                    <View style={styles.subscriptionFooter}>
                      <View style={[styles.subscriptionDateRow, { flexDirection: rowDirection }]}>
                        <FontAwesome5 name="calendar-alt" size={14} color="#5DADE2" solid />
                        <RTLText style={[styles.subscriptionDate, { writingDirection, textAlign }]}>
                          {t('clientHome.startDate')} {formatDate(selectedClient.subscriptionStartDate)}
                        </RTLText>
                      </View>
                    </View>
                  )}
                </AnimatedCard>
              )}

              {/* Horses Gallery Section */}
              {horses && horses.length > 0 && (
                <>
                  <View style={[styles.horsesHeader, { flexDirection: rowDirection }]}>
                    <View style={[styles.sectionTitleRow, { flexDirection: rowDirection }]}>
                      <MaterialCommunityIcons name="horse-variant" size={24} color="#F39C12" />
                      <RTLText style={styles.sectionTitle}>{t('workerHome.ourHorses')}</RTLText>
                    </View>
                    <View style={styles.horsesBadge}>
                      <Text style={[styles.horsesBadgeText, { writingDirection, textAlign }]}>{horses.length}</Text>
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
                          <RTLText style={styles.horseCardCompactName}>{horse.name}</RTLText>
                          <RTLText style={styles.horseCardCompactBreed}>{horse.breed}</RTLText>
                        </View>
                      </AnimatedCard>
                    ))}
                  </ScrollView>
                </>
              )}

              {/* Upcoming Lessons Section */}
              <View style={[styles.lessonsHeader, { flexDirection: rowDirection }]}>
                <View style={[styles.sectionTitleRow, { flexDirection: rowDirection }]}>
                  <FontAwesome5 name="calendar-check" size={22} color="#9B59B6" solid />
                  <RTLText style={styles.sectionTitle}>{t('clientHome.upcomingLessons')}</RTLText>
                </View>
                <View style={styles.lessonsBadge}>
                  <Text style={[styles.lessonsBadgeText, { writingDirection, textAlign }]}>{upcomingLessons.length}</Text>
                </View>
              </View>
            </>
          }
          renderItem={({ item, index }) => (
            <AnimatedCard
              index={index + 2}
              delay={80}
              style={styles.lessonCard}
            >
              <View style={styles.lessonHeader}>
                <View style={styles.lessonDateContainer}>
                  <View style={[styles.lessonDateRow, { flexDirection: rowDirection }]}>
                    <FontAwesome5 name="calendar-alt" size={14} color="#5DADE2" solid />
                    <Text style={[styles.lessonDate, { writingDirection, textAlign }]}>{formatDate(item.date)}</Text>
                  </View>
                  <View style={styles.scheduledBadge}>
                    <FontAwesome5 name="hourglass-half" size={12} color="#F39C12" solid />
                    <Text style={[styles.scheduledBadgeText, { writingDirection, textAlign }]}> {t('clientHome.scheduled')}</Text>
                  </View>
                </View>
                <View style={[styles.lessonTimeRow, { flexDirection: rowDirection }]}>
                  <FontAwesome5 name="clock" size={14} color="#F39C12" solid />
                  <Text style={[styles.lessonTime, { writingDirection, textAlign }]}>{item.time}</Text>
                </View>
              </View>
              <View style={styles.lessonDetails}>
                <View style={[styles.lessonDetail, { flexDirection: rowDirection }]}>
                  <MaterialCommunityIcons name="horse-variant" size={16} color="#F39C12" />
                  <Text style={[styles.lessonDetailText, { writingDirection, textAlign }]}>{getHorseName(item.horseId)}</Text>
                </View>
                <View style={[styles.lessonDetail, { flexDirection: rowDirection }]}>
                  <FontAwesome5 name="chalkboard-teacher" size={14} color="#3498DB" solid />
                  <Text style={[styles.lessonDetailText, { writingDirection, textAlign }]}>{getWorkerName(item.instructorId)}</Text>
                </View>
              </View>
            </AnimatedCard>
          )}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <FontAwesome5 name="calendar-times" size={48} color="#95A5A6" solid />
              <RTLText style={[styles.emptyText, { writingDirection, textAlign }]}>{t('clientHome.noScheduledLessons')}</RTLText>
              <RTLText style={[styles.emptySubtext, { writingDirection, textAlign }]}>{t('clientHome.contactToBook')}</RTLText>
            </View>
          }
          contentContainerStyle={styles.content}
        />
      ) : (
        <View style={styles.loadingContainer}>
          <FontAwesome5 name="spinner" size={48} color="#3B82F6" />
          <Text style={[styles.loadingText, { writingDirection, textAlign }]}>{t('clientHome.loadingInfo')}</Text>
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
    paddingBottom: Platform.OS === 'android' ? 100 : spacing.xl,
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
    lineHeight: typography.size.lg * 1.4,
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
    lineHeight: typography.size.md * 1.4,
  },
  emptySubtext: {
    fontSize: typography.size.sm,
    color: colors.text.tertiary,
    lineHeight: typography.size.sm * 1.5,
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
    lineHeight: typography.size.lg * 1.4,
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
    lineHeight: typography.size.md * 1.4,
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
