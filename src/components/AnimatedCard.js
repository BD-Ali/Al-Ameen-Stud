/**
 * AnimatedCard component with reflection and fade effects
 * Provides a reusable card with smooth entrance animations
 */

import React, { useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { useStaggeredAnimation } from '../utils/animations';
import { colors, borderRadius, shadows } from '../styles/theme';

const AnimatedCard = ({ children, index = 0, delay = 0, style, ...props }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const { opacity, translateY } = useStaggeredAnimation(index, delay);

  return (
    <Animated.View
      style={[
        styles.card,
        {
          opacity,
          transform: [
            { translateY },
            { scale: scaleAnim },
          ],
        },
        style,
      ]}
      {...props}
    >
      {/* Reflection effect - subtle top border glow */}
      <View style={styles.reflection} />
      {children}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    ...shadows.md,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  reflection: {
    position: 'absolute',
    top: 0,
    start: 0,
    end: 0,
    height: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderTopLeftRadius: borderRadius.lg,
    borderTopRightRadius: borderRadius.lg,
  },
});

export default AnimatedCard;

