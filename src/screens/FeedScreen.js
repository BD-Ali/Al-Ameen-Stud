import React, { useContext } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { DataContext } from '../context/DataContext';
import { colors, typography, spacing, borderRadius, shadows } from '../styles/theme';

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
    backgroundColor: colors.background.primary,
  },
  contentContainer: {
    padding: spacing.base,
  },
  headerSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  pageTitle: {
    fontSize: typography.size.xxl,
    fontWeight: typography.weight.bold,
    color: colors.text.primary,
  },
  countBadge: {
    backgroundColor: colors.accent.amber,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    minWidth: 32,
    alignItems: 'center',
  },
  countText: {
    color: colors.text.primary,
    fontWeight: typography.weight.bold,
    fontSize: typography.size.base,
  },
  card: {
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderLeftWidth: 3,
    borderLeftColor: colors.accent.amber,
    ...shadows.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  horseName: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.bold,
    color: colors.text.primary,
  },
  horseEmoji: {
    fontSize: 20,
  },
  scheduleContainer: {
    gap: spacing.xs,
  },
  scheduleLabel: {
    fontSize: typography.size.sm,
    color: colors.text.tertiary,
    fontWeight: typography.weight.semibold,
    marginBottom: spacing.xs,
  },
  scheduleValue: {
    fontSize: typography.size.base,
    color: colors.text.secondary,
    lineHeight: 20,
  },
  emptyState: {
    alignItems: 'center',
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
});

export default FeedScreen;