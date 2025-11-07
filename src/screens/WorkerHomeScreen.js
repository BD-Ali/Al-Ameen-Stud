import React, { useContext } from 'react';
import { View, Text, StyleSheet, Alert, FlatList, SafeAreaView, TouchableOpacity, Linking, Image, ScrollView, Animated } from 'react-native';
import { DataContext } from '../context/DataContext';
import { AuthContext } from '../context/AuthContext';
import { colors, typography, spacing, borderRadius, shadows } from '../styles/theme';
import AnnouncementsFeed from '../components/AnnouncementsFeed';
import CompactHeader from '../components/CompactHeader';
import { useFadeIn, usePulse } from '../utils/animations';
import { FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';

/**
 * WorkerHomeScreen displays a worker's assigned tasks and schedule
 */
const WorkerHomeScreen = ({ navigation }) => {
  const { schedules, horses, workers, lessons, clients, weeklySchedules, loading, confirmLesson, cancelLesson } = useContext(DataContext);
  const { user, logOut } = useContext(AuthContext);

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

  // Combine both schedule types
  const allTodaySchedules = [
    ...myTodayWeeklySchedules.map(s => ({ ...s, source: 'weekly' })),
    ...myTodayDailySchedules.map(s => ({ ...s, source: 'daily' }))
  ];

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

  // Filter lessons for this worker
  const myLessons = lessons?.filter((l) => l.instructorId === user?.uid) || [];
  const todayLessons = myLessons.filter((l) => l.date === today);
  const upcomingLessons = myLessons.filter((l) => l.date > today).slice(0, 5);

  const getHorseName = (id) => horses?.find((h) => h.id === id)?.name || id;
  const getClientName = (id) => clients?.find((c) => c.id === id)?.name || id;

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
          text: 'إرسال بريد إلكتروني',
          onPress: () => {
            Linking.openURL('mailto:badarne3li@gmail.com').catch(() => {
              Alert.alert('خطأ', 'لا يمكن فتح تطبيق البريد الإلكتروني');
            });
          }
        },
        {
          text: 'اتصال هاتفي',
          onPress: () => {
            Linking.openURL('tel:0503653429').catch(() => {
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

  const formatTime = (time) => {
    const [hour] = time.split(':');
    const h = parseInt(hour);
    if (h === 0) return '12 AM';
    if (h < 12) return `${h} AM`;
    if (h === 12) return '12 PM';
    return `${h - 12} PM`;
  };

  const handleConfirmLesson = async (lessonId) => {
    Alert.alert(
      'تأكيد إتمام الدرس',
      'هل تريد تأكيد أن هذا الدرس قد تم بنجاح؟ سيتم تحديث عدد دروس العميل تلقائياً.',
      [
        { text: 'إلغاء', style: 'cancel' },
        {
          text: 'تأكيد',
          onPress: async () => {
            const result = await confirmLesson(lessonId);
            if (result.success) {
              Alert.alert('نجح', 'تم تأكيد إتمام الدرس بنجاح ✓');
            } else {
              Alert.alert('خطأ', result.error || 'فشل تأكيد الدرس');
            }
          }
        }
      ]
    );
  };

  const handleCancelLesson = async (lessonId) => {
    Alert.alert(
      'إلغاء الدرس',
      'هل تريد إلغاء هذا الدرس؟ لن يتم تحديث عدد دروس العميل.',
      [
        { text: 'رجوع', style: 'cancel' },
        {
          text: 'إلغاء الدرس',
          style: 'destructive',
          onPress: async () => {
            const result = await cancelLesson(lessonId, 'ألغي من قبل المدرب');
            if (result.success) {
              Alert.alert('تم', 'تم إلغاء الدرس');
            } else {
              Alert.alert('خطأ', result.error || 'فشل إلغاء الدرس');
            }
          }
        }
      ]
    );
  };

  const handleProfilePress = () => {
    navigation.navigate('Profile');
  };

  // Create sections data for FlatList
  const sections = [
    { id: 'announcements', type: 'announcements' },
    { id: 'horses', type: 'horses' },
    { id: 'schedule', type: 'schedule' },
    { id: 'lessons', type: 'lessons' },
    { id: 'info', type: 'info' },
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
                <Text style={styles.sectionTitle}>جدول اليوم</Text>
              </View>
            </View>

            {allTodaySchedules.length > 0 ? (
              <View style={styles.cardContainer}>
                {/* Current Tasks */}
                {currentTasks.length > 0 && (
                  <View style={styles.taskGroup}>
                    <View style={styles.taskGroupTitleRow}>
                      <FontAwesome5 name="clock" size={16} color="#27AE60" solid />
                      <Text style={styles.taskGroupTitle}>المهمة الحالية</Text>
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
                      <Text style={styles.taskGroupTitle}>المهام القادمة ({upcomingTasks.length})</Text>
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
                      <Text style={styles.taskGroupTitle}>المهام المكتملة ({pastTasks.length})</Text>
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
                <Text style={styles.emptyText}>لا توجد مهام مجدولة لليوم</Text>
              </View>
            )}
          </View>
        );

      case 'lessons':
        return (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleRow}>
                <FontAwesome5 name="book-open" size={22} color="#9B59B6" solid />
                <Text style={styles.sectionTitle}>دروسي</Text>
              </View>
            </View>

            {myLessons.length > 0 ? (
              <View style={styles.cardContainer}>
                {/* Today's Lessons */}
                {todayLessons.length > 0 && (
                  <View style={styles.lessonGroup}>
                    <Text style={styles.lessonGroupTitle}>دروس اليوم</Text>
                    {todayLessons.map((lesson) => (
                      <View key={lesson.id} style={styles.lessonCard}>
                        <View style={styles.lessonHeader}>
                          <View style={styles.lessonTimeRow}>
                            <FontAwesome5 name="clock" size={14} color="#F39C12" solid />
                            <Text style={styles.lessonTime}>{lesson.time}</Text>
                          </View>
                          {lesson.confirmed && (
                            <View style={styles.confirmedBadge}>
                              <FontAwesome5 name="check" size={10} color="#fff" solid />
                              <Text style={styles.confirmedBadgeText}>مكتمل</Text>
                            </View>
                          )}
                          {lesson.status === 'cancelled' && (
                            <View style={styles.cancelledBadge}>
                              <FontAwesome5 name="times" size={10} color="#fff" solid />
                              <Text style={styles.cancelledBadgeText}>ملغي</Text>
                            </View>
                          )}
                        </View>
                        <View style={styles.lessonDetails}>
                          <View style={styles.lessonInfoRow}>
                            <FontAwesome5 name="user" size={12} color="#1ABC9C" solid />
                            <Text style={styles.lessonLabel}>العميل:</Text>
                            <Text style={styles.lessonValue}>{getClientName(lesson.clientId)}</Text>
                          </View>
                          <View style={styles.lessonInfoRow}>
                            <MaterialCommunityIcons name="horse-variant" size={14} color="#F39C12" />
                            <Text style={styles.lessonLabel}>الحصان:</Text>
                            <Text style={styles.lessonValue}>{getHorseName(lesson.horseId)}</Text>
                          </View>
                        </View>
                        {!lesson.confirmed && lesson.status !== 'cancelled' && (
                          <View style={styles.lessonActions}>
                            <TouchableOpacity
                              style={styles.confirmButton}
                              onPress={() => handleConfirmLesson(lesson.id)}
                            >
                              <FontAwesome5 name="check" size={12} color="#fff" solid />
                              <Text style={styles.confirmButtonText}>تأكيد الإتمام</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                              style={styles.cancelButton}
                              onPress={() => handleCancelLesson(lesson.id)}
                            >
                              <FontAwesome5 name="times" size={12} color="#fff" solid />
                              <Text style={styles.cancelButtonText}>إلغاء</Text>
                            </TouchableOpacity>
                          </View>
                        )}
                      </View>
                    ))}
                  </View>
                )}

                {/* Upcoming Lessons */}
                {upcomingLessons.length > 0 && (
                  <View style={styles.lessonGroup}>
                    <Text style={styles.lessonGroupTitle}>الدروس القادمة</Text>
                    {upcomingLessons.map((lesson) => (
                      <View key={lesson.id} style={styles.lessonCard}>
                        <View style={styles.lessonHeader}>
                          <View style={styles.lessonDateRow}>
                            <FontAwesome5 name="calendar-alt" size={14} color="#5DADE2" solid />
                            <Text style={styles.lessonDate}>{lesson.date}</Text>
                          </View>
                          <View style={styles.lessonTimeRow}>
                            <FontAwesome5 name="clock" size={14} color="#F39C12" solid />
                            <Text style={styles.lessonTime}>{lesson.time}</Text>
                          </View>
                        </View>
                        <View style={styles.lessonDetails}>
                          <View style={styles.lessonInfoRow}>
                            <FontAwesome5 name="user" size={12} color="#1ABC9C" solid />
                            <Text style={styles.lessonLabel}>العميل:</Text>
                            <Text style={styles.lessonValue}>{getClientName(lesson.clientId)}</Text>
                          </View>
                          <View style={styles.lessonInfoRow}>
                            <MaterialCommunityIcons name="horse-variant" size={14} color="#F39C12" />
                            <Text style={styles.lessonLabel}>الحصان:</Text>
                            <Text style={styles.lessonValue}>{getHorseName(lesson.horseId)}</Text>
                          </View>
                        </View>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            ) : (
              <View style={styles.emptyState}>
                <FontAwesome5 name="book-open" size={48} color="#9B59B6" solid />
                <Text style={styles.emptyText}>لا توجد دروس مضافة</Text>
              </View>
            )}
          </View>
        );

      case 'info':
        return currentWorker ? (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleRow}>
                <FontAwesome5 name="info-circle" size={24} color="#3B82F6" solid />
                <Text style={styles.sectionTitle}>معلوماتي</Text>
              </View>
            </View>

            <View style={styles.infoCard}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>الوظيفة:</Text>
                <Text style={styles.infoValue}>{currentWorker.role || 'عامل'}</Text>
              </View>
              {currentWorker.contact && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>الاتصال:</Text>
                  <Text style={styles.infoValue}>{currentWorker.contact}</Text>
                </View>
              )}
            </View>
          </View>
        ) : null;

      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Compact Header */}
      <CompactHeader
        userName={currentWorker?.name || user?.email || 'عامل'}
        userRole="worker"
        onLogout={logOut}
        onProfilePress={handleProfilePress}
        loading={loading}
      />

      <FlatList
        style={styles.content}
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
    flex: 1,
    padding: spacing.base,
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
    borderLeftWidth: 3,
    borderLeftColor: colors.primary.main,
    ...shadows.md,
  },
  currentTaskCard: {
    borderLeftColor: colors.status.success,
  },
  pastTaskCard: {
    borderLeftColor: colors.status.error,
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
  infoCard: {
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.lg,
    padding: spacing.base,
    ...shadows.md,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  infoLabel: {
    fontSize: typography.size.base,
    color: colors.text.tertiary,
    fontWeight: typography.weight.semibold,
  },
  infoValue: {
    fontSize: typography.size.base,
    color: colors.text.primary,
    fontWeight: typography.weight.bold,
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
  lessonGroup: {
    marginBottom: spacing.md,
  },
  lessonGroupTitle: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.bold,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  lessonCard: {
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.lg,
    padding: spacing.base,
    ...shadows.md,
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
  lessonTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  lessonDate: {
    fontSize: typography.size.sm,
    color: colors.primary.main,
    fontWeight: typography.weight.semibold,
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
  },
  lessonValue: {
    fontSize: typography.size.sm,
    color: colors.text.primary,
    fontWeight: typography.weight.semibold,
  },
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
  confirmButtonText: {
    color: '#fff',
    fontSize: typography.size.sm,
    fontWeight: typography.weight.bold,
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
  cancelButtonText: {
    color: '#fff',
    fontSize: typography.size.sm,
    fontWeight: typography.weight.bold,
  },
  confirmedBadge: {
    backgroundColor: colors.status.success,
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  confirmedBadgeText: {
    color: '#fff',
    fontSize: typography.size.xs,
    fontWeight: typography.weight.bold,
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
  cancelledBadgeText: {
    color: '#fff',
    fontSize: typography.size.xs,
    fontWeight: typography.weight.bold,
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
    marginLeft: spacing.sm,
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
    paddingRight: spacing.base,
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
});

export default WorkerHomeScreen;
