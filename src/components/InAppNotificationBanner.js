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
    backgroundColor: colors.surface.card,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    borderStartWidth: 4,
    borderStartColor: colors.primary.main,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary.main + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginEnd: spacing.sm,
  },

  content: {
    flex: 1,
    marginEnd: spacing.sm,
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
    width: 44,
    height: 44,
    borderRadius: borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.text.muted + '20',
  },

});

export default InAppNotificationBanner;
