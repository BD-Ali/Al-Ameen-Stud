import React, { useContext } from 'react';
import { View, Text, StyleSheet, Alert, FlatList, TouchableOpacity, Linking, Image, ScrollView, Animated, I18nManager, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { DataContext } from '../context/DataContext';
import { AuthContext } from '../context/AuthContext';
import { colors, typography, spacing, borderRadius, shadows } from '../styles/theme';
import AnnouncementsFeed from '../components/AnnouncementsFeed';
import CompactHeader from '../components/CompactHeader';
import { useFadeIn, usePulse } from '../utils/animations';
import { FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from '../i18n/LanguageContext';

/**
 * WorkerHomeScreen displays a worker's assigned tasks and schedule
 */
const WorkerHomeScreen = ({ navigation }) => {
  const { schedules, horses, workers, weeklySchedules, loading } = useContext(DataContext);
  const { user, logOut } = useContext(AuthContext);
  const { t } = useTranslation();

  // Animations
  const fadeAnim = useFadeIn(600);
  const pulseAnim = usePulse();

  // Find worker by matching user ID
  const currentWorker = workers?.find((w) => w.id === user?.uid);

  // Get today's date and day of week
  const today = new Date().toISOString().split('T')[0];
  const currentHour = new Date().getHours();

  // Get current day name (saturday, sunday, etc.)
  const getDayName = () => {
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    return dayNames[new Date().getDay()];
  };

  // Get week start (Saturday)
  const getWeekStart = (date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = day === 6 ? 0 : (day + 1) % 7;
    d.setDate(d.getDate() - diff);
    d.setHours(0, 0, 0, 0);
    return d.toISOString().split('T')[0];
  };

  // Get week identifier
  const getWeekId = (weekStart) => {
    const date = new Date(weekStart);
    const year = date.getFullYear();
    const weekNum = getWeekNumber(date);
    return `${year}-W${String(weekNum).padStart(2, '0')}`;
  };

  // Get week number in year
  const getWeekNumber = (date) => {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  };

  const currentWeekStart = getWeekStart(new Date());
  const currentWeekId = getWeekId(currentWeekStart);
  const currentDayName = getDayName();

  // Filter weekly schedules for this worker for today
  const myTodayWeeklySchedules = weeklySchedules?.filter((s) =>
    s.workerId === user?.uid &&
    s.weekId === currentWeekId &&
    s.day === currentDayName
  ) || [];

  // Filter daily schedules for this worker for today (from ScheduleScreen)
  const myTodayDailySchedules = schedules?.filter((s) =>
    s.workerId === user?.uid &&
    s.date === today
  ) || [];

  // Combine both schedule types, deduplicating lesson entries that exist in both
  const allTodaySchedules = (() => {
    const weekly = myTodayWeeklySchedules.map(s => ({ ...s, source: 'weekly' }));
    const daily = myTodayDailySchedules.map(s => ({ ...s, source: 'daily' }));
    // Collect lessonIds already present from weekly schedules
    const weeklyLessonIds = new Set(weekly.filter(s => s.lessonId).map(s => s.lessonId));
    // Keep daily entries only if they don't duplicate a weekly lesson entry
    const dedupedDaily = daily.filter(s => !s.lessonId || !weeklyLessonIds.has(s.lessonId));
    return [...weekly, ...dedupedDaily];
  })();

  // Separate current, upcoming and past tasks
  const currentTasks = allTodaySchedules.filter((s) => {
    const taskHour = parseInt(s.timeSlot.split(':')[0]);
    return taskHour === currentHour;
  });

  const upcomingTasks = allTodaySchedules.filter((s) => {
    const taskHour = parseInt(s.timeSlot.split(':')[0]);
    return taskHour > currentHour;
  }).sort((a, b) => a.timeSlot.localeCompare(b.timeSlot));

  const pastTasks = allTodaySchedules.filter((s) => {
    const taskHour = parseInt(s.timeSlot.split(':')[0]);
    return taskHour < currentHour;
  }).sort((a, b) => b.timeSlot.localeCompare(a.timeSlot));

  const getHorseName = (id) => horses?.find((h) => h.id === id)?.name || id;

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
      t('visitorHome.contactUs'),
      t('visitorHome.contactChooseMethod'),
      [
        {
          text: t('visitorHome.sendEmail'),
          onPress: () => {
            Linking.openURL('mailto:badarne3li@gmail.com').catch(() => {
              Alert.alert(t('common.error'), t('visitorHome.cannotOpenEmail'));
            });
          }
        },
        {
          text: t('visitorHome.phoneCall'),
          onPress: () => {
            Linking.openURL('tel:0503653429').catch(() => {
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

  const formatTime = (time) => {
    const [hour] = time.split(':');
    const h = parseInt(hour);
    const am = t('workerHome.am');
    const pm = t('workerHome.pm');
    if (h === 0) return `12 ${am}`;
    if (h < 12) return `${h} ${am}`;
    if (h === 12) return `12 ${pm}`;
    return `${h - 12} ${pm}`;
  };

  const handleProfilePress = () => {
    navigation.navigate('Profile');
  };

  // Create sections data for FlatList
  const sections = [
    { id: 'announcements', type: 'announcements' },
    { id: 'horses', type: 'horses' },
    { id: 'schedule', type: 'schedule' },
  ];

  const renderSection = ({ item }) => {
    switch (item.type) {
      case 'announcements':
        return <AnnouncementsFeed userRole="worker" />;

      case 'horses':
        return horses && horses.length > 0 ? (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
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
              {horses.map((horse) => (
                <View key={horse.id} style={styles.horseCardCompact}>
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
                </View>
              ))}
            </ScrollView>
          </View>
        ) : null;

      case 'schedule':
        return (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleRow}>
                <FontAwesome5 name="calendar-alt" size={24} color="#5DADE2" solid />
                <Text style={styles.sectionTitle}>{t('workerHome.todaySchedule')}</Text>
              </View>
            </View>

            {allTodaySchedules.length > 0 ? (
              <View style={styles.cardContainer}>
                {/* Current Tasks */}
                {currentTasks.length > 0 && (
                  <View style={styles.taskGroup}>
                    <View style={styles.taskGroupTitleRow}>
                      <FontAwesome5 name="clock" size={16} color="#27AE60" solid />
                      <Text style={styles.taskGroupTitle}>{t('workerHome.currentTask')}</Text>
                    </View>
                    {currentTasks.map((schedule) => (
                      <View key={schedule.id} style={[styles.scheduleCard, styles.currentTaskCard]}>
                        <View style={styles.scheduleHeader}>
                          <View style={[styles.timeBadge, styles.currentTimeBadge]}>
                            <Text style={styles.timeBadgeText}>{formatTime(schedule.timeSlot)}</Text>
                          </View>
                        </View>
                        <Text style={styles.scheduleDescription}>{schedule.description}</Text>
                      </View>
                    ))}
                  </View>
                )}

                {/* Upcoming Tasks */}
                {upcomingTasks.length > 0 && (
                  <View style={styles.taskGroup}>
                    <View style={styles.taskGroupTitleRow}>
                      <FontAwesome5 name="clipboard-list" size={16} color="#3B82F6" solid />
                      <Text style={styles.taskGroupTitle}>{t('workerHome.upcomingTasks')} ({upcomingTasks.length})</Text>
                    </View>
                    {upcomingTasks.map((schedule) => (
                      <View key={schedule.id} style={styles.scheduleCard}>
                        <View style={styles.scheduleHeader}>
                          <View style={styles.timeBadge}>
                            <Text style={styles.timeBadgeText}>{formatTime(schedule.timeSlot)}</Text>
                          </View>
                        </View>
                        <Text style={styles.scheduleDescription}>{schedule.description}</Text>
                      </View>
                    ))}
                  </View>
                )}

                {/* Past Tasks */}
                {pastTasks.length > 0 && (
                  <View style={styles.taskGroup}>
                    <View style={styles.taskGroupTitleRow}>
                      <FontAwesome5 name="check-circle" size={16} color="#27AE60" solid />
                      <Text style={styles.taskGroupTitle}>{t('workerHome.completedTasks')} ({pastTasks.length})</Text>
                    </View>
                    {pastTasks.map((schedule) => (
                      <View key={schedule.id} style={[styles.scheduleCard, styles.pastTaskCard]}>
                        <View style={styles.scheduleHeader}>
                          <View style={[styles.timeBadge, styles.pastTimeBadge]}>
                            <Text style={styles.timeBadgeText}>{formatTime(schedule.timeSlot)}</Text>
                          </View>
                        </View>
                        <Text style={[styles.scheduleDescription, styles.pastTaskText]}>{schedule.description}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            ) : (
              <View style={styles.emptyState}>
                <FontAwesome5 name="clipboard-list" size={48} color="#4A90E2" solid />
                <Text style={styles.emptyText}>{t('workerHome.noTasksToday')}</Text>
              </View>
            )}
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Compact Header */}
      <CompactHeader
        userName={currentWorker?.name || user?.email || t('roles.worker')}
        userRole="worker"
        onLogout={logOut}
        onProfilePress={handleProfilePress}
        loading={loading}
      />

      <FlatList
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        data={sections}
        keyExtractor={(item) => item.id}
        renderItem={renderSection}
      />

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
    flex: 1,
    padding: spacing.base,
  },
  contentContainer: {
    paddingBottom: Platform.OS === 'android' ? 100 : spacing.base,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionHeader: {
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
  cardContainer: {
    gap: spacing.md,
  },
  scheduleCard: {
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.lg,
    padding: spacing.base,
    borderStartWidth: 3,
    borderStartColor: colors.primary.main,
    ...shadows.md,
  },
  currentTaskCard: {
    borderStartColor: colors.status.success,
  },
  pastTaskCard: {
    borderStartColor: colors.status.error,
  },
  scheduleHeader: {
    marginBottom: spacing.sm,
  },
  timeBadge: {
    backgroundColor: colors.primary.main,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    alignSelf: 'flex-start',
  },
  currentTimeBadge: {
    backgroundColor: colors.status.success,
  },
  pastTimeBadge: {
    backgroundColor: colors.status.error,
  },
  timeBadgeText: {
    color: '#fff',
    fontSize: typography.size.sm,
    fontWeight: typography.weight.bold,
  },
  scheduleDescription: {
    fontSize: typography.size.base,
    color: colors.text.secondary,
    lineHeight: 20,
  },
  pastTaskText: {
    opacity: 0.6,
  },
  emptyState: {
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    alignItems: 'center',
    ...shadows.sm,
  },
  emptyText: {
    fontSize: typography.size.base,
    color: colors.text.tertiary,
    fontStyle: 'italic',
    marginTop: spacing.md,
  },
  taskGroup: {
    marginBottom: spacing.md,
  },
  taskGroupTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  taskGroupTitle: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.bold,
    color: colors.text.primary,
  },
  // Horses gallery styles
  horsesBadge: {
    backgroundColor: colors.primary.main,
    borderRadius: borderRadius.full,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xs,
    marginStart: spacing.sm,
  },
  horsesBadgeText: {
    color: '#fff',
    fontSize: typography.size.xs,
    fontWeight: typography.weight.bold,
  },
  horsesScrollView: {
    marginTop: spacing.md,
  },
  horsesScrollContent: {
    paddingEnd: spacing.base,
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

export default WorkerHomeScreen;
