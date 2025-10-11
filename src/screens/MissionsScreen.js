                                                                        import React, { useContext, useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { DataContext } from '../context/DataContext';

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
    backgroundColor: '#0f172a',
  },
  section: {
    marginBottom: 24,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#f1f5f9',
    flex: 1,
  },
  badge: {
    backgroundColor: '#3b82f6',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
    minWidth: 32,
    alignItems: 'center',
  },
  completedBadge: {
    backgroundColor: '#22c55e',
  },
  upcomingBadge: {
    backgroundColor: '#f59e0b',
  },
  badgeText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  missionCard: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#3b82f6',
  },
  completedCard: {
    borderLeftColor: '#22c55e',
    opacity: 0.8,
  },
  upcomingCard: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#f59e0b',
  },
  missionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  missionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  horseIcon: {
    fontSize: 24,
    marginRight: 8,
  },
  horseName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#f1f5f9',
  },
  missionTime: {
    fontSize: 16,
    color: '#94a3b8',
    fontWeight: '600',
  },
  missionNote: {
    fontSize: 16,
    color: '#cbd5e1',
    marginBottom: 12,
    lineHeight: 22,
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: '#94a3b8',
  },
  doneButton: {
    backgroundColor: '#22c55e',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  doneButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  undoneButton: {
    backgroundColor: '#64748b',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  undoneButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  upcomingDate: {
    fontSize: 14,
    color: '#f59e0b',
    fontWeight: 'bold',
  },
  upcomingTime: {
    fontSize: 14,
    color: '#94a3b8',
    marginTop: 8,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    backgroundColor: '#1e293b',
    borderRadius: 12,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    color: '#94a3b8',
    textAlign: 'center',
  },
});

export default MissionsScreen;

