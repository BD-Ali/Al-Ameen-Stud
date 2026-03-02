import React, { useContext, useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { DataContext } from '../context/DataContext';
import { colors, typography, spacing, borderRadius, shadows } from '../styles/theme';
import AnimatedCard from '../components/AnimatedCard';
import { FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from '../i18n/LanguageContext';

const MissionsScreen = () => {
  const { t } = useTranslation();
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
      t('common.confirm'),
      t('missions.confirmCompletion'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.yes'),
          onPress: async () => {
            const result = await updateReminder(mission.id, {
              completed: true,
              completedAt: new Date().toISOString()
            });

            if (result.success) {
              Alert.alert(t('common.success'), t('missions.missionCompleted'));
            } else {
              Alert.alert(t('common.error'), result.error || t('missions.missionUpdateFailed'));
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
      Alert.alert(t('common.success'), t('missions.missionUncompleted'));
    } else {
      Alert.alert(t('common.error'), result.error || t('missions.missionUpdateFailed'));
    }
  };

  const renderMission = ({ item, index, showMarkAsDone = true }) => (
    <AnimatedCard index={index} delay={80} style={[styles.missionCard, item.completed && styles.completedCard]}>
      <View style={styles.missionHeader}>
        <View style={styles.missionTitleContainer}>
          <MaterialCommunityIcons name="horse-variant" size={20} color="#F39C12" />
          <Text style={styles.horseName}>{item.horseName}</Text>
        </View>
        <View style={styles.timeRow}>
          <FontAwesome5 name="clock" size={12} color="#5DADE2" solid />
          <Text style={styles.missionTime}>{item.time}</Text>
        </View>
      </View>

      <Text style={[styles.missionNote, item.completed && styles.completedText]}>
        {item.note}
      </Text>

      {showMarkAsDone ? (
        <TouchableOpacity
          style={styles.doneButton}
          onPress={() => handleMarkAsDone(item)}
        >
          <FontAwesome5 name="check" size={14} color="#fff" solid />
          <Text style={styles.doneButtonText}>{t('missions.markAsDone')}</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          style={styles.undoneButton}
          onPress={() => handleMarkAsUndone(item)}
        >
          <FontAwesome5 name="undo" size={14} color="#fff" solid />
          <Text style={styles.undoneButtonText}>{t('missions.undoCompletion')}</Text>
        </TouchableOpacity>
      )}
    </AnimatedCard>
  );

  const renderUpcomingMission = ({ item, index }) => (
    <AnimatedCard index={index} delay={80} style={styles.upcomingCard}>
      <View style={styles.missionHeader}>
        <View style={styles.missionTitleContainer}>
          <MaterialCommunityIcons name="horse-variant" size={20} color="#F39C12" />
          <Text style={styles.horseName}>{item.horseName}</Text>
        </View>
        <View style={styles.dateRow}>
          <FontAwesome5 name="calendar-alt" size={12} color="#5DADE2" solid />
          <Text style={styles.upcomingDate}>{item.date}</Text>
        </View>
      </View>

      <Text style={styles.missionNote}>{item.note}</Text>
      <View style={styles.timeRow}>
        <FontAwesome5 name="clock" size={12} color="#F39C12" solid />
        <Text style={styles.upcomingTime}>{item.time}</Text>
      </View>
    </AnimatedCard>
  );

  return (
    <ScrollView style={styles.container}>
      {/* Today's Missions */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleRow}>
            <FontAwesome5 name="clipboard-list" size={20} color="#9B59B6" solid />
            <Text style={styles.sectionTitle}>{t('missions.todayMissions')}</Text>
          </View>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{todayMissions.length}</Text>
          </View>
        </View>

        {todayMissions.length === 0 ? (
          <View style={styles.emptyState}>
            <FontAwesome5 name="check-circle" size={48} color="#27AE60" solid />
            <Text style={styles.emptyText}>{t('missions.noTasksRemaining')}</Text>
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
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <FontAwesome5 name="check-double" size={20} color="#27AE60" solid />
              <Text style={styles.sectionTitle}>{t('missions.completedToday')}</Text>
            </View>
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
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <FontAwesome5 name="calendar-alt" size={20} color="#5DADE2" solid />
              <Text style={styles.sectionTitle}>{t('missions.upcomingMissions')}</Text>
            </View>
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
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  sectionTitle: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.bold,
    color: colors.text.primary,
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
    color: colors.text.primary,
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
    ...shadows.sm,
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
    ...shadows.sm,
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
    gap: spacing.sm,
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
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  missionTime: {
    fontSize: typography.size.sm,
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  undoneButtonText: {
    color: '#fff',
    fontSize: typography.size.base,
    fontWeight: typography.weight.bold,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  upcomingDate: {
    fontSize: typography.size.sm,
    color: colors.status.warning,
    fontWeight: typography.weight.bold,
  },
  upcomingTime: {
    fontSize: typography.size.sm,
    color: colors.text.tertiary,
    fontWeight: typography.weight.semibold,
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
