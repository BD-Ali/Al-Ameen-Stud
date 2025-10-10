import React, { useContext } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { DataContext } from './DataContext';

/**
 * FeedScreen shows a consolidated list of feeding plans for all horses.
 */
const FeedScreen = () => {
  const { horses } = useContext(DataContext);

  return (
    <View style={styles.container}>
      <FlatList
        data={horses}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <View style={styles.headerSection}>
            <Text style={styles.pageTitle}>🥕 جدول التغذية</Text>
            <View style={styles.countBadge}>
              <Text style={styles.countText}>{horses.length}</Text>
            </View>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.horseName}>{item.name}</Text>
              <Text style={styles.horseEmoji}>🐴</Text>
            </View>
            <View style={styles.scheduleContainer}>
              <Text style={styles.scheduleLabel}>📋 أوقات التغذية:</Text>
              <Text style={styles.scheduleValue}>
                {item.feedSchedule || 'لا يوجد جدول محدد'}
              </Text>
            </View>
          </View>
        )}
        contentContainerStyle={styles.contentContainer}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>🥕</Text>
            <Text style={styles.emptyText}>لا توجد جداول تغذية</Text>
            <Text style={styles.emptySubtext}>أضف خيولاً لتعيين جداول التغذية</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  contentContainer: {
    padding: 16,
  },
  headerSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  countBadge: {
    backgroundColor: '#f59e0b',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  countText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  card: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#f59e0b',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  horseName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  horseEmoji: {
    fontSize: 24,
  },
  scheduleContainer: {
    marginTop: 4,
  },
  scheduleLabel: {
    fontSize: 14,
    color: '#94a3b8',
    marginBottom: 8,
  },
  scheduleValue: {
    fontSize: 15,
    color: '#e2e8f0',
    lineHeight: 22,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    color: '#e2e8f0',
    fontWeight: '600',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#94a3b8',
  },
});

export default FeedScreen;