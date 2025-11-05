import React, { useContext, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { AuthContext } from '../context/AuthContext';
import { DataContext } from '../context/DataContext';
import { colors, typography, spacing, borderRadius, shadows } from '../styles/theme';
import { updatePassword, updateEmail, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebaseConfig';
import AnimatedCard from '../components/AnimatedCard';

/**
 * ProfileScreen - User profile management screen
 * Allows users to:
 * - View their profile information (name, email, role)
 * - Change their password
 * - Change their email address
 * - Cannot change name or delete account (as per requirements)
 */
const ProfileScreen = ({ navigation }) => {
  const { user, userRole } = useContext(AuthContext);
  const { clients, workers } = useContext(DataContext);

  // Form states
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [showEmailSection, setShowEmailSection] = useState(false);

  // Get user data
  const getUserData = () => {
    if (userRole === 'client') {
      return clients?.find((c) => c.id === user?.uid);
    } else if (userRole === 'worker') {
      return workers?.find((w) => w.id === user?.uid);
    }
    return null;
  };

  const userData = getUserData();
  const displayName = userData?.name || user?.email?.split('@')[0] || 'مستخدم';
  const displayEmail = user?.email || '';

  // Get role display info
  const getRoleInfo = (role) => {
    const roleMap = {
      'client': { label: 'عميل', color: colors.accent.teal, icon: 'person', iconFamily: 'Ionicons' },
      'worker': { label: 'عامل', color: colors.accent.pink, icon: 'hammer-wrench', iconFamily: 'MaterialCommunityIcons' },
      'admin': { label: 'مدير', color: colors.accent.purple, icon: 'shield-checkmark', iconFamily: 'Ionicons' },
    };
    return roleMap[role?.toLowerCase()] || roleMap['client'];
  };

  const roleInfo = getRoleInfo(userRole);

  // Reauthenticate user before sensitive operations
  const reauthenticate = async (currentPassword) => {
    try {
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);
      return { success: true };
    } catch (error) {
      let errorMessage = 'فشل التحقق من كلمة المرور';
      if (error.code === 'auth/wrong-password') {
        errorMessage = 'كلمة المرور الحالية غير صحيحة';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'محاولات كثيرة جداً. حاول مرة أخرى لاحقاً';
      }
      return { success: false, error: errorMessage };
    }
  };

  // Handle password change
  const handleChangePassword = async () => {
    // Validation
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert('خطأ', 'الرجاء ملء جميع الحقول');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('خطأ', 'كلمة المرور الجديدة وتأكيد كلمة المرور غير متطابقتين');
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert('خطأ', 'يجب أن تكون كلمة المرور الجديدة 6 أحرف على الأقل');
      return;
    }

    setLoading(true);

    try {
      // Reauthenticate first
      const reauth = await reauthenticate(currentPassword);
      if (!reauth.success) {
        Alert.alert('خطأ', reauth.error);
        setLoading(false);
        return;
      }

      // Update password
      await updatePassword(user, newPassword);

      // Clear form
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setShowPasswordSection(false);

      Alert.alert('نجح ✓', 'تم تغيير كلمة المرور بنجاح');
    } catch (error) {
      console.error('Password change error:', error);
      let errorMessage = 'فشل تغيير كلمة المرور';

      if (error.code === 'auth/weak-password') {
        errorMessage = 'كلمة المرور ضعيفة جداً';
      } else if (error.code === 'auth/requires-recent-login') {
        errorMessage = 'يرجى تسجيل الخروج ثم الدخول مرة أخرى';
      }

      Alert.alert('خطأ', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Handle email change
  const handleChangeEmail = async () => {
    // Validation
    if (!currentPassword || !newEmail) {
      Alert.alert('خطأ', 'الرجاء ملء جميع الحقول');
      return;
    }

    if (!newEmail.includes('@') || !newEmail.includes('.')) {
      Alert.alert('خطأ', 'الرجاء إدخال بريد إلكتروني صحيح');
      return;
    }

    if (newEmail === user.email) {
      Alert.alert('خطأ', 'البريد الإلكتروني الجديد هو نفسه البريد الحالي');
      return;
    }

    setLoading(true);

    try {
      // Reauthenticate first
      const reauth = await reauthenticate(currentPassword);
      if (!reauth.success) {
        Alert.alert('خطأ', reauth.error);
        setLoading(false);
        return;
      }

      // Update email in Firebase Auth
      await updateEmail(user, newEmail);

      // Update email in Firestore
      await updateDoc(doc(db, 'users', user.uid), {
        email: newEmail,
        updatedAt: new Date().toISOString(),
      });

      // Update email in client/worker document if applicable
      if (userRole === 'client') {
        await updateDoc(doc(db, 'clients', user.uid), {
          email: newEmail,
        });
      }

      // Clear form
      setCurrentPassword('');
      setNewEmail('');
      setShowEmailSection(false);

      Alert.alert('نجح ✓', 'تم تغيير البريد الإلكتروني بنجاح');
    } catch (error) {
      console.error('Email change error:', error);
      let errorMessage = 'فشل تغيير البريد الإلكتروني';

      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'هذا البريد الإلكتروني مستخدم بالفعل';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'البريد الإلكتروني غير صحيح';
      } else if (error.code === 'auth/requires-recent-login') {
        errorMessage = 'يرجى تسجيل الخروج ثم الدخول مرة أخرى';
      }

      Alert.alert('خطأ', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Profile Header */}
          <AnimatedCard index={0} delay={100} style={styles.headerCard}>
            <View style={[styles.avatarLarge, { backgroundColor: roleInfo.color + '15', borderColor: roleInfo.color }]}>
              <Text style={[styles.avatarTextLarge, { color: roleInfo.color }]}>
                {displayName.substring(0, 2).toUpperCase()}
              </Text>
            </View>
            <Text style={styles.displayName}>{displayName}</Text>
            <Text style={styles.displayEmail}>{displayEmail}</Text>
            <View style={[styles.roleBadgeLarge, { backgroundColor: roleInfo.color + '15', borderColor: roleInfo.color }]}>
              {roleInfo.iconFamily === 'Ionicons' ? (
                <Ionicons name={roleInfo.icon} size={16} color={roleInfo.color} style={styles.roleIconLarge} />
              ) : (
                <MaterialCommunityIcons name={roleInfo.icon} size={16} color={roleInfo.color} style={styles.roleIconLarge} />
              )}
              <Text style={[styles.roleBadgeText, { color: roleInfo.color }]}>
                {roleInfo.label}
              </Text>
            </View>
          </AnimatedCard>

          {/* Profile Information (Read-only) */}
          <AnimatedCard index={1} delay={150} style={styles.card}>
            <View style={styles.sectionTitleContainer}>
              <Text style={styles.cardTitle}>📋 معلومات الحساب</Text>
            </View>
            <View style={styles.infoContainer}>
              {/* Name Frame */}
              <View style={styles.infoItemFrame}>
                <Text style={styles.infoItemLabel}>الاسم:</Text>
                <Text style={styles.infoItemValue}>{displayName}</Text>
              </View>

              {/* Email Frame */}
              <View style={styles.infoItemFrame}>
                <Text style={styles.infoItemLabel}>البريد الإلكتروني:</Text>
                <Text style={styles.infoItemValue}>{displayEmail}</Text>
              </View>

              {/* Role Frame */}
              <View style={[styles.infoItemFrame, { borderColor: roleInfo.color }]}>
                <Text style={styles.infoItemLabel}>الدور:</Text>
                <Text style={[styles.infoItemValue, { color: roleInfo.color }]}>{roleInfo.label}</Text>
              </View>
            </View>
            <View style={styles.infoNote}>
              <Text style={styles.infoNoteText}>
                ℹ️ لا يمكن تغيير الاسم. للقيام بذلك، تواصل مع الإدارة.
              </Text>
            </View>
          </AnimatedCard>

          {/* Change Password Section */}
          <AnimatedCard index={2} delay={200} style={styles.card}>
            <View style={styles.sectionTitleContainer}>
              <TouchableOpacity
                style={styles.sectionHeaderButton}
                onPress={() => setShowPasswordSection(!showPasswordSection)}
                activeOpacity={0.7}
              >
                <Text style={styles.cardTitle}>🔒 تغيير كلمة المرور</Text>
                <Text style={styles.expandIcon}>{showPasswordSection ? '▼' : '◀'}</Text>
              </TouchableOpacity>
            </View>

            {showPasswordSection && (
              <View style={styles.framedContent}>
                <View style={styles.formSection}>
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>كلمة المرور الحالية</Text>
                    <TextInput
                      style={styles.input}
                      value={currentPassword}
                      onChangeText={setCurrentPassword}
                      secureTextEntry
                      placeholder="أدخل كلمة المرور الحالية"
                      placeholderTextColor={colors.text.muted}
                      autoCapitalize="none"
                      editable={!loading}
                    />
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>كلمة المرور الجديدة</Text>
                    <TextInput
                      style={styles.input}
                      value={newPassword}
                      onChangeText={setNewPassword}
                      secureTextEntry
                      placeholder="أدخل كلمة المرور الجديدة (6 أحرف على الأقل)"
                      placeholderTextColor={colors.text.muted}
                      autoCapitalize="none"
                      editable={!loading}
                    />
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>تأكيد كلمة المرور الجديدة</Text>
                    <TextInput
                      style={styles.input}
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                      secureTextEntry
                      placeholder="أعد إدخال كلمة المرور الجديدة"
                      placeholderTextColor={colors.text.muted}
                      autoCapitalize="none"
                      editable={!loading}
                    />
                  </View>

                  <TouchableOpacity
                    style={[styles.actionButton, loading && styles.actionButtonDisabled]}
                    onPress={handleChangePassword}
                    disabled={loading}
                    activeOpacity={0.8}
                  >
                    {loading ? (
                      <ActivityIndicator color={colors.text.primary} size="small" />
                    ) : (
                      <Text style={styles.actionButtonText}>✓ حفظ كلمة المرور الجديدة</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </AnimatedCard>

          {/* Change Email Section */}
          <AnimatedCard index={3} delay={250} style={styles.card}>
            <View style={styles.sectionTitleContainer}>
              <TouchableOpacity
                style={styles.sectionHeaderButton}
                onPress={() => setShowEmailSection(!showEmailSection)}
                activeOpacity={0.7}
              >
                <Text style={styles.cardTitle}>📧 تغيير البريد الإلكتروني</Text>
                <Text style={styles.expandIcon}>{showEmailSection ? '▼' : '◀'}</Text>
              </TouchableOpacity>
            </View>

            {showEmailSection && (
              <View style={styles.framedContent}>
                <View style={styles.formSection}>
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>كلمة المرور الحالية</Text>
                    <TextInput
                      style={styles.input}
                      value={currentPassword}
                      onChangeText={setCurrentPassword}
                      secureTextEntry
                      placeholder="أدخل كلمة المرور للتحقق"
                      placeholderTextColor={colors.text.muted}
                      autoCapitalize="none"
                      editable={!loading}
                    />
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>البريد الإلكتروني الجديد</Text>
                    <TextInput
                      style={styles.input}
                      value={newEmail}
                      onChangeText={setNewEmail}
                      placeholder="أدخل البريد الإلكتروني الجديد"
                      placeholderTextColor={colors.text.muted}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      editable={!loading}
                    />
                  </View>

                  <TouchableOpacity
                    style={[styles.actionButton, loading && styles.actionButtonDisabled]}
                    onPress={handleChangeEmail}
                    disabled={loading}
                    activeOpacity={0.8}
                  >
                    {loading ? (
                      <ActivityIndicator color={colors.text.primary} size="small" />
                    ) : (
                      <Text style={styles.actionButtonText}>✓ حفظ البريد الإلكتروني الجديد</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </AnimatedCard>

          {/* Security Note */}
          <View style={styles.securityNote}>
            <Text style={styles.securityNoteIcon}>🛡️</Text>
            <Text style={styles.securityNoteText}>
              لحماية حسابك، يرجى استخدام كلمة مرور قوية وعدم مشاركتها مع أي شخص.
            </Text>
          </View>

          {/* Bottom spacing */}
          <View style={styles.bottomSpacer} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  headerCard: {
    alignItems: 'center',
    paddingVertical: spacing.xxxl,
    marginBottom: spacing.lg,
    borderRadius: borderRadius.xl,
  },
  avatarLarge: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
    borderWidth: 4,
    ...shadows.lg,
  },
  avatarTextLarge: {
    fontSize: 38,
    fontWeight: typography.weight.bold,
    letterSpacing: 1,
  },
  displayName: {
    fontSize: typography.size.xxl,
    fontWeight: typography.weight.bold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
    letterSpacing: 0.5,
  },
  displayEmail: {
    fontSize: typography.size.md,
    color: colors.text.tertiary,
    marginBottom: spacing.lg,
    letterSpacing: 0.3,
  },
  roleBadgeLarge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.xl,
    borderWidth: 2,
    gap: spacing.xs,
    ...shadows.sm,
  },
  roleIconLarge: {
    marginTop: 2,
  },
  roleBadgeText: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.bold,
    letterSpacing: 0.5,
  },
  card: {
    marginBottom: spacing.lg,
    borderRadius: borderRadius.lg,
    ...shadows.md,
  },
  sectionTitleContainer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  sectionHeaderButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: spacing.xs,
  },
  framedContent: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    padding: spacing.lg,
    backgroundColor: colors.background.tertiary,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    borderColor: colors.border.medium,
    ...shadows.sm,
  },
  cardTitle: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.bold,
    color: colors.text.primary,
    letterSpacing: 0.3,
  },
  expandIcon: {
    fontSize: typography.size.xl,
    color: colors.text.tertiary,
  },
  infoContainer: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    gap: spacing.md,
  },
  infoItemFrame: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.tertiary,
    borderWidth: 2,
    borderColor: colors.border.medium,
    borderRadius: borderRadius.lg,
    padding: spacing.base,
    paddingHorizontal: spacing.lg,
    ...shadows.sm,
  },
  infoItemLabel: {
    fontSize: typography.size.md,
    color: colors.text.tertiary,
    fontWeight: typography.weight.bold,
    marginRight: spacing.sm,
    letterSpacing: 0.3,
  },
  infoItemValue: {
    flex: 1,
    fontSize: typography.size.md,
    color: colors.text.primary,
    fontWeight: typography.weight.semibold,
    letterSpacing: 0.3,
    textAlign: 'right',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.base,
  },
  infoLabel: {
    fontSize: typography.size.md,
    color: colors.text.tertiary,
    fontWeight: typography.weight.semibold,
    letterSpacing: 0.3,
  },
  infoValue: {
    fontSize: typography.size.md,
    color: colors.text.primary,
    fontWeight: typography.weight.bold,
    letterSpacing: 0.3,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border.light,
    opacity: 0.5,
  },
  infoNote: {
    marginTop: spacing.lg,
    padding: spacing.lg,
    backgroundColor: colors.primary.subtle,
    borderRadius: borderRadius.lg,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary.main,
    ...shadows.sm,
  },
  infoNoteText: {
    fontSize: typography.size.sm,
    color: colors.text.secondary,
    lineHeight: 22,
    letterSpacing: 0.3,
  },
  formSection: {
    // No extra margin needed since we're inside framedContent
  },
  inputGroup: {
    marginBottom: spacing.lg,
  },
  inputLabel: {
    fontSize: typography.size.md,
    color: colors.text.secondary,
    fontWeight: typography.weight.bold,
    marginBottom: spacing.sm,
    letterSpacing: 0.3,
    paddingHorizontal: spacing.xs,
  },
  input: {
    backgroundColor: colors.background.primary,
    borderWidth: 2,
    borderColor: colors.border.light,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.base,
    fontSize: typography.size.md,
    color: colors.text.primary,
    textAlign: 'right',
    minHeight: 50,
    ...shadows.sm,
  },
  actionButton: {
    backgroundColor: colors.primary.main,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.lg,
    alignItems: 'center',
    marginTop: spacing.md,
    minHeight: 54,
    ...shadows.lg,
  },
  actionButtonDisabled: {
    opacity: 0.5,
  },
  actionButtonText: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.bold,
    color: colors.text.primary,
    letterSpacing: 0.5,
  },
  securityNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.background.secondary,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    marginTop: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border.medium,
    ...shadows.sm,
  },
  securityNoteIcon: {
    fontSize: typography.size.xl,
    marginRight: spacing.md,
  },
  securityNoteText: {
    flex: 1,
    fontSize: typography.size.sm,
    color: colors.text.tertiary,
    lineHeight: 22,
    letterSpacing: 0.3,
  },
  bottomSpacer: {
    height: spacing.xxxl,
  },
});

export default ProfileScreen;

