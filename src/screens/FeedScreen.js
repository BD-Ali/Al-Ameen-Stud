import React, { useContext } from 'react';
import { View, Text, FlatList, StyleSheet, Platform } from 'react-native';
import { DataContext } from '../context/DataContext';
import { colors, typography, spacing, borderRadius, shadows } from '../styles/theme';
import AnimatedCard from '../components/AnimatedCard';
import { FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from '../i18n/LanguageContext';

/**
 * FeedScreen shows a consolidated list of feeding plans for all horses.
 */
const FeedScreen = () => {
  const { horses } = useContext(DataContext);
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <FlatList
        data={horses}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <View style={styles.headerSection}>
            <View style={styles.titleRow}>
              <FontAwesome5 name="carrot" size={24} color="#FF9800" solid />
              <Text style={styles.pageTitle}>{t('feed.title')}</Text>
            </View>
            <View style={styles.countBadge}>
              <Text style={styles.countText}>{horses.length}</Text>
            </View>
          </View>
        }
        renderItem={({ item, index }) => (
          <AnimatedCard index={index} delay={80} style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.horseName}>{item.name}</Text>
              <MaterialCommunityIcons name="horse-variant" size={24} color="#F39C12" />
            </View>
            <View style={styles.scheduleContainer}>
              <View style={styles.scheduleLabelRow}>
                <FontAwesome5 name="clipboard-list" size={14} color="#64748b" solid />
                <Text style={styles.scheduleLabel}>{t('feed.feedTimes')}</Text>
              </View>
              <Text style={styles.scheduleValue}>
                {item.feedSchedule || t('feed.noScheduleSet')}
              </Text>
            </View>
          </AnimatedCard>
        )}
        contentContainerStyle={styles.contentContainer}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <FontAwesome5 name="carrot" size={48} color="#FF9800" solid />
            <Text style={styles.emptyText}>{t('feed.noFeedSchedules')}</Text>
            <Text style={styles.emptySubtext}>{t('feed.addHorsesForFeed')}</Text>
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
    paddingBottom: Platform.OS === 'android' ? 80 : spacing.base,
  },
  headerSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
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
    borderStartWidth: 3,
    borderStartColor: colors.accent.amber,
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
  scheduleContainer: {
    gap: spacing.xs,
  },
  scheduleLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  scheduleLabel: {
    fontSize: typography.size.sm,
    color: colors.text.tertiary,
    fontWeight: typography.weight.semibold,
  },
  scheduleValue: {
    fontSize: typography.size.base,
    color: colors.text.secondary,
    lineHeight: 20,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xxxl,
    gap: spacing.md,
  },
  emptyText: {
    fontSize: typography.size.md,
    color: colors.text.secondary,
    fontWeight: typography.weight.semibold,
  },
  emptySubtext: {
    fontSize: typography.size.sm,
    color: colors.text.tertiary,
  },
});

export default FeedScreen;