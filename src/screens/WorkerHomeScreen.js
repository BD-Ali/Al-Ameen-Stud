import React, { useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView, SafeAreaView } from 'react-native';
import { DataContext } from '../context/DataContext';
import { AuthContext } from '../context/AuthContext';
import { colors, typography, spacing, borderRadius, shadows } from '../styles/theme';

/**
 * WorkerHomeScreen displays a worker's assigned tasks and schedule
 */
const WorkerHomeScreen = () => {
  const { schedules, horses, workers, lessons, clients } = useContext(DataContext);
  const { user, logOut } = useContext(AuthContext);

  // Find worker by matching user ID
  const currentWorker = workers?.find((w) => w.id === user?.uid);

  // Get today's date
  const today = new Date().toISOString().split('T')[0];

  // Filter schedules and lessons for this worker (with safety checks)
  const mySchedules = schedules?.filter((s) => s.workerId === user?.uid && s.date === today) || [];
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

  const formatTime = (time) => {
    const [hour] = time.split(':');
    return `${parseInt(hour)}:00`;
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={handleLogout} style={styles.logoutButton} activeOpacity={0.7}>
            <Text style={styles.logoutText}>خروج</Text>
          </TouchableOpacity>
          <View style={styles.userInfo}>
            <Text style={styles.greeting}>مرحباً،</Text>
            <Text style={styles.userName}>{currentWorker?.name || 'عامل'} 👷</Text>
          </View>
        </View>
      </View>

      <ScrollView style={styles.content}>
        {/* Today's Schedule */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionIcon}>📅</Text>
            <Text style={styles.sectionTitle}>جدول اليوم</Text>
          </View>

          {mySchedules.length > 0 ? (
            <View style={styles.cardContainer}>
              {mySchedules.map((schedule) => (
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
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyEmoji}>📋</Text>
              <Text style={styles.emptyText}>لا توجد مهام مجدولة لليوم</Text>
            </View>
          )}
        </View>

        {/* My Lessons */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionIcon}>📚</Text>
            <Text style={styles.sectionTitle}>دروسي</Text>
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
                        <Text style={styles.lessonTime}>⏰ {lesson.time}</Text>
                      </View>
                      <View style={styles.lessonDetails}>
                        <View style={styles.lessonInfoRow}>
                          <Text style={styles.lessonLabel}>👤 العميل:</Text>
                          <Text style={styles.lessonValue}>{getClientName(lesson.clientId)}</Text>
                        </View>
                        <View style={styles.lessonInfoRow}>
                          <Text style={styles.lessonLabel}>🐴 الحصان:</Text>
                          <Text style={styles.lessonValue}>{getHorseName(lesson.horseId)}</Text>
                        </View>
                      </View>
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
                        <Text style={styles.lessonDate}>📅 {lesson.date}</Text>
                        <Text style={styles.lessonTime}>⏰ {lesson.time}</Text>
                      </View>
                      <View style={styles.lessonDetails}>
                        <View style={styles.lessonInfoRow}>
                          <Text style={styles.lessonLabel}>👤 العميل:</Text>
                          <Text style={styles.lessonValue}>{getClientName(lesson.clientId)}</Text>
                        </View>
                        <View style={styles.lessonInfoRow}>
                          <Text style={styles.lessonLabel}>🐴 الحصان:</Text>
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
              <Text style={styles.emptyEmoji}>📖</Text>
              <Text style={styles.emptyText}>لا توجد دروس مضافة</Text>
            </View>
          )}
        </View>

        {/* Worker Info */}
        {currentWorker && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionIcon}>ℹ️</Text>
              <Text style={styles.sectionTitle}>معلوماتي</Text>
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
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  header: {
    backgroundColor: colors.background.secondary,
    paddingHorizontal: spacing.base,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.md,
    borderBottomLeftRadius: borderRadius.lg,
    borderBottomRightRadius: borderRadius.lg,
    ...shadows.sm,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userInfo: {
    flex: 1,
    alignItems: 'flex-end',
    marginLeft: spacing.base,
  },
  greeting: {
    fontSize: typography.size.sm,
    color: colors.text.tertiary,
    marginBottom: spacing.xs,
    textAlign: 'right',
  },
  userName: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.bold,
    color: colors.text.primary,
    textAlign: 'right',
  },
  logoutButton: {
    backgroundColor: colors.primary.main,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    minHeight: 44,
    minWidth: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutText: {
    fontSize: typography.size.base,
    fontWeight: typography.weight.bold,
    color: '#fff',
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
    marginBottom: spacing.md,
  },
  sectionIcon: {
    fontSize: 24,
    marginRight: spacing.sm,
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
  emptyEmoji: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  emptyText: {
    fontSize: typography.size.base,
    color: colors.text.tertiary,
    fontStyle: 'italic',
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
    marginBottom: spacing.xs,
  },
  lessonLabel: {
    fontSize: typography.size.sm,
    color: colors.text.tertiary,
    marginRight: spacing.xs,
  },
  lessonValue: {
    fontSize: typography.size.sm,
    color: colors.text.primary,
  },
});

export default WorkerHomeScreen;
