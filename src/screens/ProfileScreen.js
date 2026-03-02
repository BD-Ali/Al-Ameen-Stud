import React, { useContext, useState, useEffect } from 'react';
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
  LayoutAnimation,
  UIManager,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { AuthContext } from '../context/AuthContext';
import { DataContext } from '../context/DataContext';
import { colors, typography, spacing, borderRadius, shadows } from '../styles/theme';
import { updatePassword, updateEmail, EmailAuthProvider, reauthenticateWithCredential, deleteUser } from 'firebase/auth';
import { doc, updateDoc, getDoc, deleteDoc, query, collection, where, getDocs } from 'firebase/firestore';
import { db } from '../config/firebaseConfig';
import AnimatedCard from '../components/AnimatedCard';
import { useTranslation } from '../i18n/LanguageContext';
import LanguageSwitcher from '../components/LanguageSwitcher';

/**
 * ProfileScreen - User profile management screen
 * Allows users to:
 * - View their profile information (name, email, role)
 * - Change their password
 * - Change their email address
 * - Change their name (Admin only)
 * - Delete their account and all associated data
 */
const ProfileScreen = ({ navigation }) => {
  const { user, userRole } = useContext(AuthContext);
  const { clients, workers } = useContext(DataContext);
  const { t } = useTranslation();

  // Enable LayoutAnimation on Android
  if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }

  // Smooth toggle animation helper
  const toggleSection = (setter) => {
    LayoutAnimation.configureNext(LayoutAnimation.create(
      250,
      LayoutAnimation.Types.easeInEaseOut,
      LayoutAnimation.Properties.opacity
    ));
    setter(prev => !prev);
  };

  // Form states
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newName, setNewName] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [showEmailSection, setShowEmailSection] = useState(false);
  const [showNameSection, setShowNameSection] = useState(false);
  const [showDeleteSection, setShowDeleteSection] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [adminData, setAdminData] = useState(null);

  // Fetch admin data from users collection
  useEffect(() => {
    const fetchAdminData = async () => {
      if (userRole === 'admin' && user?.uid) {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            setAdminData(userDoc.data());
          }
        } catch (error) {
          console.error('Error fetching admin data:', error);
        }
      }
    };

    fetchAdminData();
  }, [userRole, user]);

  // Get user data
  const getUserData = () => {
    if (userRole === 'client') {
      return clients?.find((c) => c.id === user?.uid);
    } else if (userRole === 'worker') {
      return workers?.find((w) => w.id === user?.uid);
    } else if (userRole === 'admin') {
      return adminData;
    }
    return null;
  };

  const userData = getUserData();
  const displayName = userData?.name || user?.email?.split('@')[0] || t('profile.defaultUser');
  const displayEmail = user?.email || '';

  // Get role display info
  const getRoleInfo = (role) => {
    const roleMap = {
      'client': { label: t('roles.client'), color: colors.accent.teal, icon: 'user', iconFamily: 'FontAwesome5', iconColor: '#1ABC9C' },
      'worker': { label: t('roles.worker'), color: colors.accent.pink, icon: 'hard-hat', iconFamily: 'FontAwesome5', iconColor: '#E91E63' },
      'admin': { label: t('roles.admin'), color: colors.accent.purple, icon: 'user-shield', iconFamily: 'FontAwesome5', iconColor: '#9B59B6' },
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
      let errorMessage = t('profile.passwordVerifyFailed');
      if (error.code === 'auth/wrong-password') {
        errorMessage = t('profile.wrongPassword');
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = t('profile.tooManyAttempts');
      }
      return { success: false, error: errorMessage };
    }
  };

  // Handle password change
  const handleChangePassword = async () => {
    // Validation
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert(t('common.error'), t('common.fillAllFields'));
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert(t('common.error'), t('profile.passwordsDoNotMatch'));
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert(t('common.error'), t('profile.passwordMinChars'));
      return;
    }

    setLoading(true);

    try {
      // Reauthenticate first
      const reauth = await reauthenticate(currentPassword);
      if (!reauth.success) {
        Alert.alert(t('common.error'), reauth.error);
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

      Alert.alert(t('common.successCheck'), t('profile.passwordChanged'));
    } catch (error) {
      console.error('Password change error:', error);
      let errorMessage = t('profile.passwordChangeFailed');

      if (error.code === 'auth/weak-password') {
        errorMessage = t('auth.weakPassword');
      } else if (error.code === 'auth/requires-recent-login') {
        errorMessage = t('common.reLoginRequired');
      }

      Alert.alert(t('common.error'), errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Handle email change
  const handleChangeEmail = async () => {
    // Validation
    if (!currentPassword || !newEmail) {
      Alert.alert(t('common.error'), t('common.fillAllFields'));
      return;
    }

    if (!newEmail.includes('@') || !newEmail.includes('.')) {
      Alert.alert(t('common.error'), t('profile.enterValidEmail'));
      return;
    }

    if (newEmail === user.email) {
      Alert.alert(t('common.error'), t('profile.sameEmail'));
      return;
    }

    setLoading(true);

    try {
      // Reauthenticate first
      const reauth = await reauthenticate(currentPassword);
      if (!reauth.success) {
        Alert.alert(t('common.error'), reauth.error);
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
      } else if (userRole === 'worker') {
        await updateDoc(doc(db, 'workers', user.uid), {
          email: newEmail,
        });
      }

      // Clear form
      setCurrentPassword('');
      setNewEmail('');
      setShowEmailSection(false);

      Alert.alert(t('common.successCheck'), t('profile.emailChanged'));
    } catch (error) {
      console.error('Email change error:', error);
      let errorMessage = t('profile.emailChangeFailed');

      if (error.code === 'auth/email-already-in-use') {
        errorMessage = t('profile.emailAlreadyInUse');
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = t('auth.invalidEmail');
      } else if (error.code === 'auth/requires-recent-login') {
        errorMessage = t('common.reLoginRequired');
      }

      Alert.alert(t('common.error'), errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Handle name change (Admin only)
  const handleChangeName = async () => {
    // Validation
    if (!newName || newName.trim().length === 0) {
      Alert.alert(t('common.error'), t('profile.enterValidName'));
      return;
    }

    if (newName === displayName) {
      Alert.alert(t('common.error'), t('profile.sameName'));
      return;
    }

    setLoading(true);

    try {
      // Update name in users collection
      await updateDoc(doc(db, 'users', user.uid), {
        name: newName,
        updatedAt: new Date().toISOString(),
      });

      // Update local state
      setAdminData({ ...adminData, name: newName });

      // Clear form
      setNewName('');
      setShowNameSection(false);

      Alert.alert(t('common.successCheck'), t('profile.nameChanged'));
    } catch (error) {
      console.error('Name change error:', error);
      Alert.alert(t('common.error'), t('profile.nameChangeFailed'));
    } finally {
      setLoading(false);
    }
  };

  // Handle account deletion
  const handleDeleteAccount = async () => {
    // Validation
    if (!deletePassword) {
      Alert.alert(t('common.error'), t('profile.enterPasswordToConfirm'));
      return;
    }

    // Double confirmation
    Alert.alert(
      '⚠️ ' + t('common.warning'),
      t('profile.deleteConfirmQuestion'),
      [
        {
          text: t('common.cancel'),
          style: 'cancel',
        },
        {
          text: t('profile.deleteAccount'),
          style: 'destructive',
          onPress: async () => {
            setLoading(true);

            try {
              // Reauthenticate first
              const reauth = await reauthenticate(deletePassword);
              if (!reauth.success) {
                Alert.alert(t('common.error'), reauth.error);
                setLoading(false);
                return;
              }

              // Check if user has upcoming lessons or schedules
              if (userRole === 'client') {
                // First, check if client has outstanding balance
                const clientDoc = await getDoc(doc(db, 'clients', user.uid));
                if (clientDoc.exists()) {
                  const clientData = clientDoc.data();
                  const amountDue = clientData.amountDue || 0;

                  if (amountDue > 0) {
                    Alert.alert(
                      t('profile.cannotDeleteAccount'),
                      t('profile.outstandingBalance', { amount: amountDue })
                    );
                    setLoading(false);
                    return;
                  }
                }

                const clientLessonsQuery = query(
                  collection(db, 'lessons'),
                  where('clientId', '==', user.uid)
                );
                const lessonsSnapshot = await getDocs(clientLessonsQuery);
                const now = new Date();

                const upcomingLessons = lessonsSnapshot.docs.filter(doc => {
                  const lesson = doc.data();
                  const lessonDate = new Date(`${lesson.date}T${lesson.time || '00:00'}`);
                  return lessonDate >= now || lesson.status === 'scheduled';
                });

                if (upcomingLessons.length > 0) {
                  Alert.alert(
                    t('profile.cannotDeleteAccount'),
                    t('profile.hasUpcomingLessons', { count: upcomingLessons.length })
                  );
                  setLoading(false);
                  return;
                }

                // Delete all client's past lessons
                for (const lessonDoc of lessonsSnapshot.docs) {
                  await deleteDoc(doc(db, 'lessons', lessonDoc.id));
                }

                // Delete client document
                await deleteDoc(doc(db, 'clients', user.uid));
              } else if (userRole === 'worker') {
                const workerLessonsQuery = query(
                  collection(db, 'lessons'),
                  where('instructorId', '==', user.uid)
                );
                const lessonsSnapshot = await getDocs(workerLessonsQuery);
                const now = new Date();

                const upcomingLessons = lessonsSnapshot.docs.filter(doc => {
                  const lesson = doc.data();
                  const lessonDate = new Date(`${lesson.date}T${lesson.time || '00:00'}`);
                  return lessonDate >= now || lesson.status === 'scheduled';
                });

                if (upcomingLessons.length > 0) {
                  Alert.alert(
                    t('profile.cannotDeleteAccount'),
                    t('profile.hasUpcomingLessons', { count: upcomingLessons.length })
                  );
                  setLoading(false);
                  return;
                }

                // Check for upcoming schedules
                const schedulesQuery = query(
                  collection(db, 'schedules'),
                  where('workerId', '==', user.uid)
                );
                const schedulesSnapshot = await getDocs(schedulesQuery);

                const upcomingSchedules = schedulesSnapshot.docs.filter(doc => {
                  const schedule = doc.data();
                  const scheduleDate = new Date(schedule.date);
                  return scheduleDate >= now;
                });

                if (upcomingSchedules.length > 0) {
                  Alert.alert(
                    t('profile.cannotDeleteAccount'),
                    t('profile.hasUpcomingSchedules', { count: upcomingSchedules.length })
                  );
                  setLoading(false);
                  return;
                }

                // Delete all worker's past lessons
                for (const lessonDoc of lessonsSnapshot.docs) {
                  await deleteDoc(doc(db, 'lessons', lessonDoc.id));
                }

                // Delete all worker's past schedules
                for (const scheduleDoc of schedulesSnapshot.docs) {
                  await deleteDoc(doc(db, 'schedules', scheduleDoc.id));
                }

                // Delete all worker's missions
                const missionsQuery = query(
                  collection(db, 'missions'),
                  where('workerId', '==', user.uid)
                );
                const missionsSnapshot = await getDocs(missionsQuery);
                for (const missionDoc of missionsSnapshot.docs) {
                  await deleteDoc(doc(db, 'missions', missionDoc.id));
                }

                // Delete worker document
                await deleteDoc(doc(db, 'workers', user.uid));
              }

              // Delete user document from users collection
              try {
                await deleteDoc(doc(db, 'users', user.uid));
              } catch (userError) {
                console.log('User document not found or already deleted');
              }

              // Delete Firebase Auth user account
              await deleteUser(user);

              Alert.alert(t('profile.accountDeleted'), t('profile.accountDeletedSuccess'), [
                {
                  text: t('common.ok'),
                  onPress: () => {
                    // Navigation will happen automatically when user becomes null
                  },
                },
              ]);
            } catch (error) {
              console.error('Account deletion error:', error);
              let errorMessage = t('profile.deleteAccountFailed');

              if (error.code === 'auth/requires-recent-login') {
                errorMessage = t('profile.reloginBeforeDelete');
              } else if (error.code === 'auth/network-request-failed') {
                errorMessage = t('common.networkError');
              }

              Alert.alert(t('common.error'), errorMessage);
            } finally {
              setLoading(false);
              setDeletePassword('');
            }
          },
        },
      ]
    );
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
              <FontAwesome5 name={roleInfo.icon} size={16} color={roleInfo.iconColor} solid style={styles.roleIconLarge} />
              <Text style={[styles.roleBadgeText, { color: roleInfo.color }]}>
                {roleInfo.label}
              </Text>
            </View>
          </AnimatedCard>

          {/* Profile Information (Read-only) */}
          <AnimatedCard index={1} delay={150} style={styles.card}>
            <View style={styles.sectionTitleContainer}>
              <View style={styles.titleWithIcon}>
                <FontAwesome5 name="clipboard-list" size={22} color={colors.primary.light} solid />
                <Text style={styles.cardTitle}>{t('profile.accountInfo')}</Text>
              </View>
            </View>
            <View style={styles.infoContainer}>
              {/* Name Frame */}
              <View style={styles.infoItemFrame}>
                <Text style={styles.infoItemLabel}>{t('profile.name')}</Text>
                <Text style={styles.infoItemValue}>{displayName}</Text>
              </View>

              {/* Email Frame */}
              <View style={styles.infoItemFrame}>
                <Text style={styles.infoItemLabel}>{t('profile.emailLabel')}</Text>
                <Text style={styles.infoItemValue}>{displayEmail}</Text>
              </View>

              {/* Role Frame */}
              <View style={[styles.infoItemFrame, { borderColor: roleInfo.color }]}>
                <Text style={styles.infoItemLabel}>{t('profile.roleLabel')}</Text>
                <Text style={[styles.infoItemValue, { color: roleInfo.color }]}>{roleInfo.label}</Text>
              </View>
            </View>
            <View style={styles.infoNote}>
              <FontAwesome5 name="info-circle" size={18} color={colors.status.info} solid style={styles.infoNoteIcon} />
              <Text style={styles.infoNoteText}>
                {userRole === 'admin'
                  ? t('profile.adminNameChangeNote')
                  : t('profile.nonAdminNameChangeNote')}
              </Text>
            </View>
          </AnimatedCard>

          {/* Change Name Section (Admin Only) */}
          {userRole === 'admin' && (
            <AnimatedCard index={2} delay={175} style={styles.card}>
              <View style={styles.sectionTitleContainer}>
                <TouchableOpacity
                  style={styles.sectionHeaderButton}
                  onPress={() => toggleSection(setShowNameSection)}
                  activeOpacity={0.7}
                >
                  <View style={styles.titleWithIcon}>
                    <FontAwesome5 name="user-edit" size={20} color={colors.accent.teal} solid />
                    <Text style={styles.cardTitle}>{t('profile.changeName')}</Text>
                  </View>
                  <Ionicons name={showNameSection ? "chevron-down" : "chevron-back"} size={22} color={colors.text.tertiary} />
                </TouchableOpacity>
              </View>

              {showNameSection && (
                <View style={styles.framedContent}>
                  <View style={styles.formSection}>
                    <View style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>{t('profile.newName')}</Text>
                      <TextInput
                        style={styles.input}
                        value={newName}
                        onChangeText={setNewName}
                        placeholder={t('profile.enterNewName')}
                        placeholderTextColor={colors.text.muted}
                        autoCapitalize="words"
                        editable={!loading}
                      />
                    </View>

                    <TouchableOpacity
                      style={[styles.actionButton, loading && styles.actionButtonDisabled]}
                      onPress={handleChangeName}
                      disabled={loading}
                      activeOpacity={0.8}
                    >
                      {loading ? (
                        <ActivityIndicator color={colors.text.primary} size="small" />
                      ) : (
                        <Text style={styles.actionButtonText}>{t('profile.saveNewName')}</Text>
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </AnimatedCard>
          )}

          {/* Change Password Section */}
          <AnimatedCard index={userRole === 'admin' ? 3 : 2} delay={200} style={styles.card}>
            <View style={styles.sectionTitleContainer}>
              <TouchableOpacity
                style={styles.sectionHeaderButton}
                onPress={() => toggleSection(setShowPasswordSection)}
                activeOpacity={0.7}
              >
                <View style={styles.titleWithIcon}>
                  <FontAwesome5 name="lock" size={22} color={colors.accent.amber} solid />
                  <Text style={styles.cardTitle}>{t('profile.changePassword')}</Text>
                </View>
                <Ionicons name={showPasswordSection ? "chevron-down" : "chevron-back"} size={22} color={colors.text.tertiary} />
              </TouchableOpacity>
            </View>

            {showPasswordSection && (
              <View style={styles.framedContent}>
                <View style={styles.formSection}>
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>{t('profile.currentPassword')}</Text>
                    <TextInput
                      style={styles.input}
                      value={currentPassword}
                      onChangeText={setCurrentPassword}
                      secureTextEntry
                      placeholder={t('profile.enterCurrentPassword')}
                      placeholderTextColor={colors.text.muted}
                      autoCapitalize="none"
                      editable={!loading}
                    />
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>{t('profile.newPassword')}</Text>
                    <TextInput
                      style={styles.input}
                      value={newPassword}
                      onChangeText={setNewPassword}
                      secureTextEntry
                      placeholder={t('profile.enterNewPassword')}
                      placeholderTextColor={colors.text.muted}
                      autoCapitalize="none"
                      editable={!loading}
                    />
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>{t('profile.confirmNewPassword')}</Text>
                    <TextInput
                      style={styles.input}
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                      secureTextEntry
                      placeholder={t('profile.reenterNewPassword')}
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
                      <Text style={styles.actionButtonText}>{t('profile.saveNewPassword')}</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </AnimatedCard>

          {/* Change Email Section */}
          <AnimatedCard index={userRole === 'admin' ? 4 : 3} delay={250} style={styles.card}>
            <View style={styles.sectionTitleContainer}>
              <TouchableOpacity
                style={styles.sectionHeaderButton}
                onPress={() => toggleSection(setShowEmailSection)}
                activeOpacity={0.7}
              >
                <View style={styles.titleWithIcon}>
                  <FontAwesome5 name="envelope" size={20} color={colors.status.error} solid />
                  <Text style={styles.cardTitle}>{t('profile.changeEmail')}</Text>
                </View>
                <Ionicons name={showEmailSection ? "chevron-down" : "chevron-back"} size={22} color={colors.text.tertiary} />
              </TouchableOpacity>
            </View>

            {showEmailSection && (
              <View style={styles.framedContent}>
                <View style={styles.formSection}>
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>{t('profile.currentPassword')}</Text>
                    <TextInput
                      style={styles.input}
                      value={currentPassword}
                      onChangeText={setCurrentPassword}
                      secureTextEntry
                      placeholder={t('profile.enterPasswordToVerify')}
                      placeholderTextColor={colors.text.muted}
                      autoCapitalize="none"
                      editable={!loading}
                    />
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>{t('profile.newEmail')}</Text>
                    <TextInput
                      style={styles.input}
                      value={newEmail}
                      onChangeText={setNewEmail}
                      placeholder={t('profile.enterNewEmail')}
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
                      <Text style={styles.actionButtonText}>{t('profile.saveNewEmail')}</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </AnimatedCard>

          {/* Delete Account Section */}
          <AnimatedCard index={userRole === 'admin' ? 5 : 4} delay={300} style={styles.card}>
            <View style={styles.sectionTitleContainer}>
              <TouchableOpacity
                style={styles.sectionHeaderButton}
                onPress={() => toggleSection(setShowDeleteSection)}
                activeOpacity={0.7}
              >
                <View style={styles.titleWithIcon}>
                  <FontAwesome5 name="trash-alt" size={20} color={colors.status.error} solid />
                  <Text style={[styles.cardTitle, { color: colors.status.error }]}>{t('profile.deleteAccount')}</Text>
                </View>
                <Ionicons name={showDeleteSection ? "chevron-down" : "chevron-back"} size={22} color={colors.text.tertiary} />
              </TouchableOpacity>
            </View>

            {showDeleteSection && (
              <View style={styles.framedContent}>
                <View style={styles.deleteWarning}>
                  <FontAwesome5 name="exclamation-triangle" size={24} color={colors.status.error} solid style={styles.warningIcon} />
                  <Text style={styles.deleteWarningText}>
                    {t('profile.deleteWarning')}
                  </Text>
                </View>

                <View style={styles.formSection}>
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>{t('profile.passwordForConfirm')}</Text>
                    <TextInput
                      style={styles.input}
                      value={deletePassword}
                      onChangeText={setDeletePassword}
                      secureTextEntry
                      placeholder={t('profile.enterPasswordToDelete')}
                      placeholderTextColor={colors.text.muted}
                      autoCapitalize="none"
                      editable={!loading}
                    />
                  </View>

                  <TouchableOpacity
                    style={[styles.deleteButton, loading && styles.actionButtonDisabled]}
                    onPress={handleDeleteAccount}
                    disabled={loading}
                    activeOpacity={0.8}
                  >
                    {loading ? (
                      <ActivityIndicator color={colors.text.primary} size="small" />
                    ) : (
                      <>
                        <FontAwesome5 name="trash-alt" size={16} color={colors.text.primary} solid />
                        <Text style={styles.deleteButtonText}>{t('profile.deletePermanently')}</Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </AnimatedCard>

          {/* Language Switcher */}
          <AnimatedCard index={userRole === 'admin' ? 6 : 5} delay={350} style={styles.card}>
            <View style={styles.sectionTitleContainer}>
              <View style={styles.titleWithIcon}>
                <FontAwesome5 name="globe" size={22} color={colors.primary.light} solid />
                <Text style={styles.cardTitle}>{t('language.title')}</Text>
              </View>
            </View>
            <View style={{ paddingHorizontal: spacing.lg, paddingBottom: spacing.lg }}>
              <LanguageSwitcher />
            </View>
          </AnimatedCard>

          {/* Security Note */}
          <View style={styles.securityNote}>
            <FontAwesome5 name="shield-alt" size={22} color={colors.status.success} solid style={styles.securityNoteIcon} />
            <Text style={styles.securityNoteText}>
              {t('profile.securityNote')}
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
  titleWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
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
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: spacing.lg,
    padding: spacing.lg,
    backgroundColor: colors.primary.subtle,
    borderRadius: borderRadius.lg,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary.main,
    ...shadows.sm,
    gap: spacing.sm,
  },
  infoNoteIcon: {
    marginTop: 2,
  },
  infoNoteText: {
    flex: 1,
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
    gap: spacing.sm,
  },
  securityNoteIcon: {
    marginTop: 2,
  },
  securityNoteText: {
    flex: 1,
    fontSize: typography.size.sm,
    color: colors.text.tertiary,
    lineHeight: 22,
    letterSpacing: 0.3,
  },
  deleteWarning: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.status.error + '15',
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    borderLeftWidth: 4,
    borderLeftColor: colors.status.error,
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },
  warningIcon: {
    marginTop: 2,
  },
  deleteWarningText: {
    flex: 1,
    fontSize: typography.size.sm,
    color: colors.status.error,
    lineHeight: 22,
    letterSpacing: 0.3,
    fontWeight: typography.weight.semibold,
  },
  deleteButton: {
    backgroundColor: colors.status.error,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.lg,
    alignItems: 'center',
    marginTop: spacing.md,
    minHeight: 54,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.sm,
    ...shadows.lg,
  },
  deleteButtonText: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.bold,
    color: colors.text.primary,
    letterSpacing: 0.5,
  },
  bottomSpacer: {
    height: spacing.xxxl,
  },
});

export default ProfileScreen;

