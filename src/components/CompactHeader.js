import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Animated } from 'react-native';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius, shadows } from '../styles/theme';
import { useTranslation } from '../i18n/LanguageContext';

/**
 * CompactHeader - A compact, modern header for user home screens
 * Features: Avatar initials, welcome message, role badge, logout action
 * Supports: RTL, loading states, accessibility
 */
const CompactHeader = ({
  userName,
  userRole = 'user',
  onLogout,
  loading = false,
  onAvatarPress = null,
  onProfilePress = null
}) => {
  const [pressAnim] = useState(new Animated.Value(1));
  const { t } = useTranslation();

  // Get greeting
  const getGreeting = () => {
    return t('header.hello');
  };

  // Get initials from name
  const getInitials = (name) => {
    if (!name) return '👤';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  // Get role display info
  const getRoleInfo = (role) => {
    const roleMap = {
      'client': { label: t('roles.client'), color: colors.accent.teal, icon: 'user', iconFamily: 'FontAwesome5', iconColor: '#1ABC9C' },
      'worker': { label: t('roles.worker'), color: colors.accent.pink, icon: 'hard-hat', iconFamily: 'FontAwesome5', iconColor: '#E91E63' },
      'admin': { label: t('roles.admin'), color: colors.accent.purple, icon: 'user-shield', iconFamily: 'FontAwesome5', iconColor: '#9B59B6' },
    };
    return roleMap[role.toLowerCase()] || roleMap['client'];
  };

  const roleInfo = getRoleInfo(userRole);

  const handleLogoutPress = () => {
    Alert.alert(
      t('auth.logout'),
      t('auth.logoutConfirm'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('auth.exit'),
          style: 'destructive',
          onPress: onLogout,
        },
      ],
      { cancelable: true }
    );
  };

  const handleAvatarPress = () => {
    if (onProfilePress) {
      Animated.sequence([
        Animated.timing(pressAnim, {
          toValue: 0.9,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(pressAnim, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();
      onProfilePress();
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Left: Avatar + User Info */}
        <TouchableOpacity
          style={styles.userSection}
          onPress={handleAvatarPress}
          activeOpacity={onProfilePress ? 0.7 : 1}
          disabled={!onProfilePress || loading}
        >
          {loading ? (
            <View style={[styles.avatar, styles.avatarLoading]}>
              <Text style={styles.avatarText}>⏳</Text>
            </View>
          ) : (
            <Animated.View
              style={[
                styles.avatar,
                { transform: [{ scale: pressAnim }] },
                { backgroundColor: roleInfo.color + '30' }
              ]}
            >
              <Text style={[styles.avatarText, { color: roleInfo.color }]}>
                {getInitials(userName)}
              </Text>
            </Animated.View>
          )}

          <View style={styles.userInfo}>
            <Text style={styles.welcomeText} numberOfLines={1}>
              {loading ? t('common.loading') : `${getGreeting()} ${userName || t('profile.defaultUser')}`}
            </Text>
          </View>
        </TouchableOpacity>

        {/* Right: Logout Button */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleLogoutPress}
            activeOpacity={0.6}
            disabled={loading}
            accessibilityLabel={t('auth.logout')}
            accessibilityRole="button"
            accessibilityHint={t('auth.logoutHint')}
          >
            <FontAwesome5 name="sign-out-alt" size={20} color="#EF4444" solid />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background.secondary,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
    // Compact height
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
    paddingHorizontal: spacing.base,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    // Minimum height for accessibility (44dp)
    minHeight: 44,
  },
  userSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginEnd: spacing.sm,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    marginEnd: spacing.md,
    borderWidth: 2,
    borderColor: colors.border.light,
  },
  avatarLoading: {
    backgroundColor: colors.background.tertiary,
  },
  avatarText: {
    fontSize: typography.size.base,
    fontWeight: typography.weight.bold,
  },
  userInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  welcomeText: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.bold,
    color: colors.text.primary,
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoutButton: {
    width: 46,
    height: 46,
    borderRadius: borderRadius.full,
    backgroundColor: colors.background.tertiary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: colors.border.medium,
    ...shadows.sm,
  },
  logoutIcon: {
    fontSize: 20,
    color: colors.text.secondary,
  },
});

export default CompactHeader;
