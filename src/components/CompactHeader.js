import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Animated } from 'react-native';
import { colors, typography, spacing, borderRadius, shadows } from '../styles/theme';

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

  // Get time-based greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'صباح الخير';
    if (hour < 18) return 'مساء الخير';
    return 'مساء الخير';
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
      'client': { label: 'عميل', color: colors.accent.teal, emoji: '👤' },
      'worker': { label: 'عامل', color: colors.accent.pink, emoji: '👷' },
      'admin': { label: 'مدير', color: colors.accent.purple, emoji: '⚙️' },
    };
    return roleMap[role.toLowerCase()] || roleMap['client'];
  };

  const roleInfo = getRoleInfo(userRole);

  const handleLogoutPress = () => {
    Alert.alert(
      'تسجيل الخروج',
      'هل أنت متأكد أنك تريد تسجيل الخروج؟',
      [
        { text: 'إلغاء', style: 'cancel' },
        {
          text: 'خروج',
          style: 'destructive',
          onPress: onLogout,
        },
      ],
      { cancelable: true }
    );
  };

  const handleAvatarPress = () => {
    if (onAvatarPress) {
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
      onAvatarPress();
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Left: Avatar + User Info */}
        <TouchableOpacity
          style={styles.userSection}
          onPress={handleAvatarPress}
          activeOpacity={onAvatarPress ? 0.7 : 1}
          disabled={!onAvatarPress || loading}
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
            <View style={styles.greetingRow}>
              <Text style={styles.greeting}>{getGreeting()}</Text>
              <View style={[styles.roleBadge, { backgroundColor: roleInfo.color + '20' }]}>
                <Text style={[styles.roleText, { color: roleInfo.color }]}>
                  {roleInfo.emoji} {roleInfo.label}
                </Text>
              </View>
            </View>
            <Text style={styles.userName} numberOfLines={1}>
              {loading ? 'جاري التحميل...' : userName || 'مستخدم'}
            </Text>
          </View>
        </TouchableOpacity>

        {/* Right: Profile and Logout Buttons */}
        <View style={styles.actionButtons}>
          {onProfilePress && (
            <TouchableOpacity
              style={styles.profileButton}
              onPress={onProfilePress}
              activeOpacity={0.6}
              disabled={loading}
              accessibilityLabel="الملف الشخصي"
              accessibilityRole="button"
              accessibilityHint="اضغط لفتح الملف الشخصي"
            >
              <Text style={styles.profileIcon}>👤</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleLogoutPress}
            activeOpacity={0.6}
            disabled={loading}
            accessibilityLabel="تسجيل الخروج"
            accessibilityRole="button"
            accessibilityHint="اضغط لتسجيل الخروج من حسابك"
          >
            <Text style={styles.logoutIcon}>⎋</Text>
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
    marginRight: spacing.sm,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
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
  greetingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  greeting: {
    fontSize: typography.size.xs,
    color: colors.text.tertiary,
    marginRight: spacing.xs,
  },
  roleBadge: {
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  roleText: {
    fontSize: typography.size.xs - 1,
    fontWeight: typography.weight.semibold,
  },
  userName: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.bold,
    color: colors.text.primary,
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  profileButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: colors.primary.main + '18',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.primary.main,
    ...shadows.sm,
  },
  profileIcon: {
    fontSize: 22,
    color: colors.primary.main,
  },
  logoutButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
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

