import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { colors, typography, spacing, borderRadius } from '../styles/theme';

/**
 * NotificationBanner - In-app notification banner for new announcements
 * Features: Slide-in animation, dismissible, tap to view, auto-dismiss
 */
const NotificationBanner = ({ announcement, onPress, onDismiss, duration = 5000 }) => {
  const [slideAnim] = useState(new Animated.Value(-100));
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    // Slide in
    Animated.spring(slideAnim, {
      toValue: 0,
      tension: 50,
      friction: 8,
      useNativeDriver: true,
    }).start();

    // Auto-dismiss after duration
    const timer = setTimeout(() => {
      handleDismiss();
    }, duration);

    return () => clearTimeout(timer);
  }, []);

  const handleDismiss = () => {
    Animated.timing(slideAnim, {
      toValue: -100,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setVisible(false);
      if (onDismiss) onDismiss();
    });
  };

  const handlePress = () => {
    handleDismiss();
    if (onPress) onPress(announcement);
  };

  if (!visible || !announcement) return null;

  const getTagEmoji = (tag) => {
    const emojis = {
      'Update': '📢',
      'Promo': '🎁',
      'Alert': '⚠️',
      'Event': '🎉',
      'Info': 'ℹ️',
    };
    return emojis[tag] || '📌';
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <TouchableOpacity
        style={styles.banner}
        onPress={handlePress}
        activeOpacity={0.9}
        accessibilityLabel={`إعلان جديد: ${announcement.title}`}
        accessibilityRole="button"
        accessibilityHint="اضغط لفتح الإعلان"
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.emoji}>{getTagEmoji(announcement.tag)}</Text>
            <View style={styles.textContainer}>
              <Text style={styles.label}>إعلان جديد</Text>
              <Text style={styles.title} numberOfLines={1}>
                {announcement.title}
              </Text>
              <Text style={styles.body} numberOfLines={2}>
                {announcement.content}
              </Text>
            </View>
          </View>
        </View>

        <TouchableOpacity
          style={styles.dismissButton}
          onPress={(e) => {
            e.stopPropagation();
            handleDismiss();
          }}
          accessibilityLabel="إغلاق الإشعار"
          accessibilityRole="button"
        >
          <Text style={styles.dismissText}>✕</Text>
        </TouchableOpacity>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: spacing.base,
    right: spacing.base,
    zIndex: 9999,
    elevation: 10,
  },
  banner: {
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary.main,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  content: {
    flex: 1,
    marginRight: spacing.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  emoji: {
    fontSize: 24,
    marginRight: spacing.sm,
  },
  textContainer: {
    flex: 1,
  },
  label: {
    fontSize: typography.size.xs,
    color: colors.primary.main,
    fontWeight: typography.weight.bold,
    marginBottom: 2,
  },
  title: {
    fontSize: typography.size.base,
    fontWeight: typography.weight.bold,
    color: colors.text.primary,
    marginBottom: 2,
  },
  body: {
    fontSize: typography.size.sm,
    color: colors.text.secondary,
    lineHeight: 18,
  },
  dismissButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.background.tertiary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dismissText: {
    fontSize: typography.size.md,
    color: colors.text.tertiary,
    fontWeight: typography.weight.bold,
  },
});

export default NotificationBanner;

