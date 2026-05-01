/**
 * Animation utilities â€” smooth, premium feel throughout the app.
 * All hooks follow the pattern: call at component top-level, use returned value in Animated props.
 */

import { useRef, useEffect } from 'react';
import { Animated, Easing } from 'react-native';

// â”€â”€ Shared easing curves â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const EASE_OUT_EXPO   = Easing.bezier(0.16, 1, 0.3, 1);
const EASE_OUT_BACK   = Easing.bezier(0.34, 1.56, 0.64, 1);   // slight overshoot
const EASE_IN_OUT     = Easing.bezier(0.4, 0, 0.2, 1);

// â”€â”€ Entrance animations â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

/**
 * Smooth fade-in from transparent.
 */
export const useFadeIn = (duration = 500, delay = 0) => {
  const value = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(value, {
      toValue: 1, duration, delay,
      useNativeDriver: true,
      easing: EASE_OUT_EXPO,
    }).start();
  }, [value, duration, delay]);
  return value;
};

/**
 * Slide up from below â€” primary screen entrance.
 */
export const useSlideInFromBottom = (duration = 480, delay = 0) => {
  const value = useRef(new Animated.Value(40)).current;
  useEffect(() => {
    Animated.timing(value, {
      toValue: 0, duration, delay,
      useNativeDriver: true,
      easing: EASE_OUT_EXPO,
    }).start();
  }, [value, duration, delay]);
  return value;
};

/**
 * Slide in from the right (LTR) / left (RTL).
 */
export const useSlideInFromRight = (duration = 480, delay = 0) => {
  const value = useRef(new Animated.Value(60)).current;
  useEffect(() => {
    Animated.timing(value, {
      toValue: 0, duration, delay,
      useNativeDriver: true,
      easing: EASE_OUT_EXPO,
    }).start();
  }, [value, duration, delay]);
  return value;
};

/**
 * Slide in from the left (LTR) / right (RTL).
 */
export const useSlideInFromLeft = (duration = 480, delay = 0) => {
  const value = useRef(new Animated.Value(-60)).current;
  useEffect(() => {
    Animated.timing(value, {
      toValue: 0, duration, delay,
      useNativeDriver: true,
      easing: EASE_OUT_EXPO,
    }).start();
  }, [value, duration, delay]);
  return value;
};

/**
 * Scale from slightly small to full size â€” use for modals / cards.
 */
export const useScaleIn = (duration = 380, delay = 0) => {
  const value = useRef(new Animated.Value(0.88)).current;
  useEffect(() => {
    Animated.spring(value, {
      toValue: 1,
      tension: 80,
      friction: 9,
      delay,
      useNativeDriver: true,
    }).start();
  }, [value, delay]);
  return value;
};

/**
 * Combined fade + slide-up entrance â€” for screens and large sections.
 * Returns { opacity, translateY } to spread onto Animated.View style.
 */
export const useEntrance = (duration = 500, delay = 0) => {
  const opacity    = useFadeIn(duration, delay);
  const translateY = useSlideInFromBottom(duration, delay);
  return { opacity, translateY };
};

/**
 * Bouncy pop-in with overshoot â€” for attention-grabbing elements.
 */
export const useBounceIn = (delay = 0) => {
  const value = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.spring(value, {
      toValue: 1,
      tension: 65,
      friction: 5,
      delay,
      useNativeDriver: true,
    }).start();
  }, [value, delay]);
  return value;
};

// â”€â”€ List / stagger animations â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

/**
 * Staggered entrance for list items.
 * Use with index to offset each item.
 */
export const useStaggeredAnimation = (index, staggerDelay = 60) => {
  const opacity    = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(16)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 380,
        delay: index * staggerDelay,
        useNativeDriver: true,
        easing: EASE_OUT_EXPO,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 380,
        delay: index * staggerDelay,
        useNativeDriver: true,
        easing: EASE_OUT_EXPO,
      }),
    ]).start();
  }, [opacity, translateY, index, staggerDelay]);

  return { opacity, translateY };
};

// â”€â”€ Looping animations â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

/**
 * Subtle breathing pulse â€” for badges, live indicators.
 */
export const usePulse = () => {
  const value = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(value, {
          toValue: 1.06,
          duration: 900,
          useNativeDriver: true,
          easing: EASE_IN_OUT,
        }),
        Animated.timing(value, {
          toValue: 1,
          duration: 900,
          useNativeDriver: true,
          easing: EASE_IN_OUT,
        }),
      ])
    ).start();
  }, [value]);
  return value;
};

/**
 * Skeleton shimmer â€” for loading placeholders.
 */
export const useShimmer = () => {
  const value = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(value, {
          toValue: 1, duration: 1200,
          useNativeDriver: true,
          easing: Easing.linear,
        }),
        Animated.timing(value, {
          toValue: 0, duration: 1200,
          useNativeDriver: true,
          easing: Easing.linear,
        }),
      ])
    ).start();
  }, [value]);
  return value;
};

// â”€â”€ Interaction animations â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

/**
 * Press-in/out scale animation for interactive elements.
 * Returns { onPressIn, onPressOut } handlers to spread onto TouchableOpacity.
 */
export const createPressAnimation = (animValue) => ({
  onPressIn: () =>
    Animated.spring(animValue, {
      toValue: 0.94,
      tension: 200,
      friction: 10,
      useNativeDriver: true,
    }).start(),
  onPressOut: () =>
    Animated.spring(animValue, {
      toValue: 1,
      tension: 120,
      friction: 8,
      useNativeDriver: true,
    }).start(),
});

/**
 * Combined fade + slide convenience hook (legacy compat).
 */
export const useFadeSlide = (duration = 500, delay = 0) => {
  const opacity    = useFadeIn(duration, delay);
  const translateY = useSlideInFromBottom(duration, delay);
  return { opacity, translateY };
};
