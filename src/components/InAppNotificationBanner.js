import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
} from 'react-native';
import { colors, typography, spacing, borderRadius } from '../styles/theme';
import { FontAwesome5 } from '@expo/vector-icons';
import { useTranslation } from '../i18n/LanguageContext';
import useRTL from '../hooks/useRTL';

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
  const { t } = useTranslation();
  const { writingDirection, textAlign } = useRTL();
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
        return { name: 'bullhorn', color: '#3498DB' };
      case 'alert':
        return { name: 'exclamation-triangle', color: '#F39C12' };
      case 'success':
        return { name: 'check-circle', color: '#27AE60' };
      case 'info':
        return { name: 'info-circle', color: '#3498DB' };
      default:
        return { name: 'bell', color: '#F39C12' };
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
      accessibilityLabel={`${t('notifications.reminder')}: ${title}. ${body}`}
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
    >
      <TouchableOpacity
        style={styles.banner}
        onPress={handlePress}
        activeOpacity={0.9}
      >
        <View style={styles.iconContainer}>
          <FontAwesome5 name={getIcon().name} size={20} color={getIcon().color} solid />
        </View>

        <View style={styles.content}>
          <Text style={[styles.title, { writingDirection, textAlign }]} numberOfLines={1}>
            {title}
          </Text>
          <Text style={[styles.body, { writingDirection, textAlign }]} numberOfLines={2}>
            {body}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.dismissButton}
          onPress={handleDismiss}
          accessibilityLabel={t('common.close')}
          accessibilityRole="button"
        >
          <FontAwesome5 name="times" size={14} color={colors.text.secondary} />
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
    backgroundColor: colors.surface.elevated,
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12,
    borderStartWidth: 4,
    borderStartColor: colors.primary.main,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  iconContainer: {
    width: 42,
    height: 42,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary.main + '25',
    justifyContent: 'center',
    alignItems: 'center',
    marginEnd: spacing.md,
  },
  content: {
    flex: 1,
    marginEnd: spacing.sm,
  },
  title: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.bold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
    lineHeight: typography.size.md * 1.4,
    letterSpacing: 0.2,
  },
  body: {
    fontSize: typography.size.sm,
    color: colors.text.secondary,
    lineHeight: typography.size.sm * 1.5,
  },
  dismissButton: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.border.light,
  },
});

export default InAppNotificationBanner;
