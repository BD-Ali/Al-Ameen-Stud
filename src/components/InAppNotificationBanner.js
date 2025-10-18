import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
} from 'react-native';
import { colors, typography, spacing, borderRadius } from '../styles/theme';

/**
 * InAppNotificationBanner - Shows notification banner when user is active in app
 * Features: Auto-dismiss, tap to navigate, accessible, RTL support
 */
const InAppNotificationBanner = ({
  visible,
  title,
  body,
  onPress,
  onDismiss,
  duration = 5000,
  type = 'announcement'
}) => {
  const slideAnim = useRef(new Animated.Value(-100)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const dismissTimer = useRef(null);

  useEffect(() => {
    if (visible) {
      // Slide down and fade in
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
          tension: 50,
          friction: 7,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto dismiss after duration
      dismissTimer.current = setTimeout(() => {
        handleDismiss();
      }, duration);
    } else {
      // Clear timer if dismissed manually
      if (dismissTimer.current) {
        clearTimeout(dismissTimer.current);
      }
    }

    return () => {
      if (dismissTimer.current) {
        clearTimeout(dismissTimer.current);
      }
    };
  }, [visible]);

  const handleDismiss = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: -100,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      if (onDismiss) onDismiss();
    });
  };

  const handlePress = () => {
    handleDismiss();
    if (onPress) onPress();
  };

  const getIcon = () => {
    switch (type) {
      case 'announcement':
        return '📢';
      case 'alert':
        return '⚠️';
      case 'success':
        return '✅';
      case 'info':
        return 'ℹ️';
      default:
        return '🔔';
    }
  };

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY: slideAnim }],
          opacity: opacityAnim,
        },
      ]}
      accessibilityLabel={`إشعار: ${title}. ${body}`}
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
    >
      <TouchableOpacity
        style={styles.banner}
        onPress={handlePress}
        activeOpacity={0.9}
      >
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>{getIcon()}</Text>
        </View>

        <View style={styles.content}>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
          <Text style={styles.body} numberOfLines={2}>
            {body}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.dismissButton}
          onPress={handleDismiss}
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
    left: 0,
    right: 0,
    zIndex: 9999,
    paddingTop: spacing.md,
    paddingHorizontal: spacing.md,
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface.card,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary.main,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary.main + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  icon: {
    fontSize: 24,
  },
  content: {
    flex: 1,
    marginRight: spacing.sm,
  },
  title: {
    ...typography.h4,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  body: {
    ...typography.body2,
    color: colors.text.secondary,
  },
  dismissButton: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.text.muted + '20',
  },
  dismissText: {
    fontSize: 18,
    color: colors.text.tertiary,
  },
});

export default InAppNotificationBanner;
