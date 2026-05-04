import React from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const BG_IMAGE = require('../../assets/backgpic.png');

const ScreenBackground = ({ children, style, safeAreaStyle, edges, noSafeArea }) => (
  <View style={[styles.container, style]}>
    {/* Image anchored to top – extends 25% beyond container so the star at the bottom is cropped out */}
    <Image
      source={BG_IMAGE}
      style={styles.bgImage}
      resizeMode="cover"
    />
    {/* Dark overlay – keeps text readable and fits the dark theme */}
    <View style={styles.overlay} pointerEvents="none" />
    {noSafeArea ? (
      <View style={styles.safe}>{children}</View>
    ) : (
      <SafeAreaView style={[styles.safe, safeAreaStyle]} edges={edges}>
        {children}
      </SafeAreaView>
    )}
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden',
  },
  bgImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '125%',  // taller than the container so the bottom (star) overflows and is clipped
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(10, 15, 30, 0.83)',
  },
  safe: {
    flex: 1,
  },
});

export default ScreenBackground;
