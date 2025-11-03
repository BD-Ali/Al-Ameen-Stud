/**
 * Animation utilities for consistent, smooth animations across the app
 * Provides fade-in, slide-in, scale, and reflection effects
 */

import { useRef, useEffect } from 'react';
import { Animated, Easing } from 'react-native';

/**
 * Fade in animation hook
 * @param {number} duration - Animation duration in ms
 * @param {number} delay - Delay before animation starts
 * @returns {Animated.Value} Animated opacity value
 */
export const useFadeIn = (duration = 600, delay = 0) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration,
      delay,
      useNativeDriver: true,
      easing: Easing.out(Easing.cubic),
    }).start();
  }, [fadeAnim, duration, delay]);

  return fadeAnim;
};

/**
 * Slide in from bottom animation hook
 * @param {number} duration - Animation duration in ms
 * @param {number} delay - Delay before animation starts
 * @returns {Animated.Value} Animated translateY value
 */
export const useSlideInFromBottom = (duration = 500, delay = 0) => {
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: 0,
      duration,
      delay,
      useNativeDriver: true,
      easing: Easing.out(Easing.cubic),
    }).start();
  }, [slideAnim, duration, delay]);

  return slideAnim;
};

/**
 * Slide in from right animation hook (for RTL)
 * @param {number} duration - Animation duration in ms
 * @param {number} delay - Delay before animation starts
 * @returns {Animated.Value} Animated translateX value
 */
export const useSlideInFromRight = (duration = 500, delay = 0) => {
  const slideAnim = useRef(new Animated.Value(100)).current;

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: 0,
      duration,
      delay,
      useNativeDriver: true,
      easing: Easing.out(Easing.cubic),
    }).start();
  }, [slideAnim, duration, delay]);

  return slideAnim;
};

/**
 * Scale animation hook - starts small and grows
 * @param {number} duration - Animation duration in ms
 * @param {number} delay - Delay before animation starts
 * @returns {Animated.Value} Animated scale value
 */
export const useScaleIn = (duration = 400, delay = 0) => {
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      tension: 50,
      friction: 7,
      delay,
      useNativeDriver: true,
    }).start();
  }, [scaleAnim, delay]);

  return scaleAnim;
};

/**
 * Staggered animation for list items
 * @param {number} index - Item index in list
 * @param {number} staggerDelay - Delay between each item
 * @returns {Object} Object with opacity and translateY animations
 */
export const useStaggeredAnimation = (index, staggerDelay = 100) => {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 400,
        delay: index * staggerDelay,
        useNativeDriver: true,
        easing: Easing.out(Easing.ease),
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 400,
        delay: index * staggerDelay,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      }),
    ]).start();
  }, [opacity, translateY, index, staggerDelay]);

  return { opacity, translateY };
};

/**
 * Pulse animation for attention-grabbing elements
 * @returns {Animated.Value} Animated scale value that pulses
 */
export const usePulse = () => {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.ease),
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.ease),
        }),
      ])
    ).start();
  }, [pulseAnim]);

  return pulseAnim;
};

/**
 * Create a combined fade and slide animation
 * @param {number} duration - Animation duration
 * @param {number} delay - Delay before animation
 * @returns {Object} Combined animation values
 */
export const useFadeSlide = (duration = 500, delay = 0) => {
  const opacity = useFadeIn(duration, delay);
  const translateY = useSlideInFromBottom(duration, delay);

  return { opacity, translateY };
};

/**
 * Create a shimmer/loading animation
 * @returns {Animated.Value} Shimmer animation value
 */
export const useShimmer = () => {
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
          easing: Easing.linear,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: true,
          easing: Easing.linear,
        }),
      ])
    ).start();
  }, [shimmerAnim]);

  return shimmerAnim;
};

/**
 * Bouncy entrance animation
 * @param {number} delay - Delay before animation
 * @returns {Animated.Value} Bounce animation value
 */
export const useBounceIn = (delay = 0) => {
  const bounceAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(bounceAnim, {
      toValue: 1,
      friction: 4,
      tension: 40,
      delay,
      useNativeDriver: true,
    }).start();
  }, [bounceAnim, delay]);

  return bounceAnim;
};

/**
 * Animated gradient background effect helper
 * Creates interpolated colors for smooth transitions
 */
export const createGradientAnimation = () => {
  const animValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(animValue, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: false, // Color animations can't use native driver
          easing: Easing.inOut(Easing.ease),
        }),
        Animated.timing(animValue, {
          toValue: 0,
          duration: 3000,
          useNativeDriver: false,
          easing: Easing.inOut(Easing.ease),
        }),
      ])
    ).start();
  }, [animValue]);

  return animValue;
};

/**
 * Press animation that scales down and back
 * @param {Animated.Value} animValue - Animated value to control
 */
export const createPressAnimation = (animValue) => {
  return {
    onPressIn: () => {
      Animated.spring(animValue, {
        toValue: 0.95,
        useNativeDriver: true,
      }).start();
    },
    onPressOut: () => {
      Animated.spring(animValue, {
        toValue: 1,
        useNativeDriver: true,
        friction: 4,
      }).start();
    },
  };
};

