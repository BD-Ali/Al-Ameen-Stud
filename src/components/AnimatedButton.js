/**
 * AnimatedButton with press feedback and reflection effects
 */

import React, { useRef } from 'react';
import { Animated, TouchableOpacity, StyleSheet, Text } from 'react-native';
import { createPressAnimation } from '../utils/animations';
import { colors, typography, spacing, borderRadius, shadows } from '../styles/theme';

const AnimatedButton = ({
  onPress,
  title,
  icon,
  style,
  textStyle,
  variant = 'primary',
  disabled = false,
  ...props
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const pressHandlers = createPressAnimation(scaleAnim);

  const getVariantStyle = () => {
    switch (variant) {
      case 'primary':
        return styles.primary;
      case 'secondary':
        return styles.secondary;
      case 'danger':
        return styles.danger;
      case 'success':
        return styles.success;
      default:
        return styles.primary;
    }
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.9}
      {...pressHandlers}
      {...props}
    >
      <Animated.View
        style={[
          styles.button,
          getVariantStyle(),
          disabled && styles.disabled,
          { transform: [{ scale: scaleAnim }] },
          style,
        ]}
      >
        {/* Reflection effect */}
        <Animated.View style={styles.reflection} />
        {icon && <Text style={styles.icon}>{icon}</Text>}
        <Text style={[styles.text, textStyle]}>{title}</Text>
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
    minHeight: 48,
    ...shadows.md,
    overflow: 'hidden',
  },
  primary: {
    backgroundColor: colors.primary.main,
  },
  secondary: {
    backgroundColor: colors.background.tertiary,
    borderWidth: 1,
    borderColor: colors.border.medium,
  },
  danger: {
    backgroundColor: colors.status.error,
  },
  success: {
    backgroundColor: colors.status.success,
  },
  disabled: {
    opacity: 0.5,
  },
  reflection: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  icon: {
    fontSize: 20,
    marginEnd: spacing.sm,
  },
  text: {
    color: colors.text.primary,
    fontSize: typography.size.base,
    fontWeight: typography.weight.semibold,
  },
});

export default AnimatedButton;
