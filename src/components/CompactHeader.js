import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Animated } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
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
    if (!name) return null;
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
              <FontAwesome5 name="hourglass-half" size={18} color={colors.text.secondary} />
            </View>
          ) : (
            <Animated.View
              style={[
                styles.avatar,
                { transform: [{ scale: pressAnim }] },
                { backgroundColor: roleInfo.color + '30' }
              ]}
            >
              {getInitials(userName) ? (
                <Text style={[styles.avatarText, { color: roleInfo.color }]}>
                  {getInitials(userName)}
                </Text>
              ) : (
                <FontAwesome5 name="user" size={18} color={roleInfo.color} solid />
              )}
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
            <Text style={styles.logoutText}>{t('auth.exit')}</Text>
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
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
    paddingHorizontal: spacing.base,
    // Subtle top highlight for depth
    borderTopWidth: 0,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 48,
  },
  userSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginEnd: spacing.sm,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.xxl,
    alignItems: 'center',
    justifyContent: 'center',
    marginEnd: spacing.md,
    borderWidth: 2,
    borderColor: colors.border.medium,
    ...shadows.sm,
  },
  avatarLoading: {
    backgroundColor: colors.background.tertiary,
    borderColor: colors.border.light,
  },
  avatarText: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.bold,
    letterSpacing: 0.5,
  },
  userInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  welcomeText: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.bold,
    color: colors.text.primary,
    lineHeight: typography.size.md * 1.4,
    letterSpacing: 0.2,
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoutButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surface.elevated,
    borderWidth: 1,
    borderColor: colors.border.medium,
  },
  logoutText: {
    color: colors.text.secondary,
    fontSize: typography.size.sm,
    fontWeight: typography.weight.semibold,
    letterSpacing: 0.3,
  },
});

export default CompactHeader;
