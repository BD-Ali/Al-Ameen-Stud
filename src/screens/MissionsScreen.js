import React, { useContext, useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { DataContext } from '../context/DataContext';
import { colors, typography, spacing, borderRadius, shadows } from '../styles/theme';

const MissionsScreen = () => {
  const { reminders, updateReminder } = useContext(DataContext);
  const [todayMissions, setTodayMissions] = useState([]);
  const [completedMissions, setCompletedMissions] = useState([]);
  const [upcomingMissions, setUpcomingMissions] = useState([]);

  useEffect(() => {
    categorizeReminders();
  }, [reminders]);

  const categorizeReminders = () => {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    const todayTasks = [];
    const completedTasks = [];
    const upcomingTasks = [];

    reminders.forEach(reminder => {
      if (reminder.date === todayStr) {
        if (reminder.completed) {
          completedTasks.push(reminder);
        } else {
          todayTasks.push(reminder);
        }
      } else if (reminder.date > todayStr) {
        upcomingTasks.push(reminder);
      }
    });

    // Sort by time
    todayTasks.sort((a, b) => a.time.localeCompare(b.time));
    completedTasks.sort((a, b) => a.time.localeCompare(b.time));
    upcomingTasks.sort((a, b) => {
      if (a.date === b.date) {
        return a.time.localeCompare(b.time);
      }
      return a.date.localeCompare(b.date);
    });

    setTodayMissions(todayTasks);
    setCompletedMissions(completedTasks);
    setUpcomingMissions(upcomingTasks);
  };

  const handleMarkAsDone = async (mission) => {
    Alert.alert(
      'تأكيد',
      'هل تريد تحديد هذه المهمة كمنجزة؟',
      [
        { text: 'إلغاء', style: 'cancel' },
        {
          text: 'نعم',
          onPress: async () => {
            const result = await updateReminder(mission.id, {
              completed: true,
              completedAt: new Date().toISOString()
            });

            if (result.success) {
              Alert.alert('نجح', 'تم تحديد المهمة كمنجزة');
            } else {
              Alert.alert('خطأ', result.error || 'فشل تحديث المهمة');
            }
          }
        }
      ]
    );
  };

  const handleMarkAsUndone = async (mission) => {
    const result = await updateReminder(mission.id, {
      completed: false,
      completedAt: null
    });

    if (result.success) {
      Alert.alert('نجح', 'تم إلغاء تحديد المهمة');
    } else {
      Alert.alert('خطأ', result.error || 'فشل تحديث المهمة');
    }
  };

  const renderMission = ({ item, showMarkAsDone = true }) => (
    <View style={[styles.missionCard, item.completed && styles.completedCard]}>
      <View style={styles.missionHeader}>
        <View style={styles.missionTitleContainer}>
          <Text style={styles.horseIcon}>🐴</Text>
          <Text style={styles.horseName}>{item.horseName}</Text>
        </View>
        <Text style={styles.missionTime}>{item.time}</Text>
      </View>

      <Text style={[styles.missionNote, item.completed && styles.completedText]}>
        {item.note}
      </Text>

      {showMarkAsDone ? (
        <TouchableOpacity
          style={styles.doneButton}
          onPress={() => handleMarkAsDone(item)}
        >
          <Text style={styles.doneButtonText}>✓ تحديد كمنجز</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          style={styles.undoneButton}
          onPress={() => handleMarkAsUndone(item)}
        >
          <Text style={styles.undoneButtonText}>↺ إلغاء الإنجاز</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderUpcomingMission = ({ item }) => (
    <View style={styles.upcomingCard}>
      <View style={styles.missionHeader}>
        <View style={styles.missionTitleContainer}>
          <Text style={styles.horseIcon}>🐴</Text>
          <Text style={styles.horseName}>{item.horseName}</Text>
        </View>
        <Text style={styles.upcomingDate}>{item.date}</Text>
      </View>

      <Text style={styles.missionNote}>{item.note}</Text>
      <Text style={styles.upcomingTime}>⏰ {item.time}</Text>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      {/* Today's Missions */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>📋 مهام اليوم</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{todayMissions.length}</Text>
          </View>
        </View>

        {todayMissions.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>✓</Text>
            <Text style={styles.emptyText}>لا توجد مهام متبقية لليوم!</Text>
          </View>
        ) : (
          <FlatList
            data={todayMissions}
            renderItem={(props) => renderMission({ ...props, showMarkAsDone: true })}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
          />
        )}
      </View>

      {/* Completed Missions */}
      {completedMissions.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>✅ المهام المنجزة اليوم</Text>
            <View style={[styles.badge, styles.completedBadge]}>
              <Text style={styles.badgeText}>{completedMissions.length}</Text>
            </View>
          </View>

          <FlatList
            data={completedMissions}
            renderItem={(props) => renderMission({ ...props, showMarkAsDone: false })}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
          />
        </View>
      )}

      {/* Upcoming Missions */}
      {upcomingMissions.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>📅 المهام القادمة</Text>
            <View style={[styles.badge, styles.upcomingBadge]}>
              <Text style={styles.badgeText}>{upcomingMissions.length}</Text>
            </View>
          </View>

          <FlatList
            data={upcomingMissions.slice(0, 5)}
            renderItem={renderUpcomingMission}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
          />
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  section: {
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.base,
    paddingTop: spacing.base,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.bold,
    color: colors.text.primary,
    flex: 1,
  },
  badge: {
    backgroundColor: colors.primary.main,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    minWidth: 28,
    alignItems: 'center',
  },
  completedBadge: {
    backgroundColor: colors.status.success,
  },
  upcomingBadge: {
    backgroundColor: colors.status.warning,
  },
  badgeText: {
    color: '#fff',
    fontWeight: typography.weight.bold,
    fontSize: typography.size.sm,
  },
  missionCard: {
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary.main,
  },
  completedCard: {
    borderLeftColor: colors.status.success,
    opacity: 0.8,
  },
  upcomingCard: {
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderLeftWidth: 3,
    borderLeftColor: colors.status.warning,
  },
  missionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  missionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  horseIcon: {
    fontSize: 20,
    marginRight: spacing.sm,
  },
  horseName: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.bold,
    color: colors.text.primary,
  },
  missionTime: {
    fontSize: typography.size.base,
    color: colors.text.tertiary,
    fontWeight: typography.weight.semibold,
  },
  missionNote: {
    fontSize: typography.size.base,
    color: colors.text.secondary,
    marginBottom: spacing.md,
    lineHeight: 20,
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: colors.text.tertiary,
  },
  doneButton: {
    backgroundColor: colors.status.success,
    borderRadius: borderRadius.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
  },
  doneButtonText: {
    color: '#fff',
    fontSize: typography.size.base,
    fontWeight: typography.weight.bold,
  },
  undoneButton: {
    backgroundColor: colors.border.medium,
    borderRadius: borderRadius.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
  },
  undoneButtonText: {
    color: '#fff',
    fontSize: typography.size.base,
    fontWeight: typography.weight.bold,
  },
  upcomingDate: {
    fontSize: typography.size.sm,
    color: colors.status.warning,
    fontWeight: typography.weight.bold,
  },
  upcomingTime: {
    fontSize: typography.size.sm,
    color: colors.text.tertiary,
    marginTop: spacing.sm,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxxl,
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.md,
  },
  emptyIcon: {
    fontSize: 40,
    marginBottom: spacing.md,
  },
  emptyText: {
    fontSize: typography.size.md,
    color: colors.text.tertiary,
    textAlign: 'center',
  },
});

export default MissionsScreen;
