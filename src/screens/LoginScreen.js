import React, { useState, useContext, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
  TouchableWithoutFeedback,
  Keyboard,
  Animated,
} from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { colors, typography, spacing, borderRadius, shadows } from '../styles/theme';
import { useFadeIn, useSlideInFromBottom, useScaleIn, createPressAnimation } from '../utils/animations';

/**
 * LoginScreen provides authentication with sign in and sign up functionality.
 * Users can create accounts or log in with email/password.
 * Different user roles (admin, client, visitor) determine access levels.
 */
const LoginScreen = ({ navigation }) => {
  const { signIn, signUp } = useContext(AuthContext);
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  // Animation values
  const fadeAnim = useFadeIn(800);
  const slideAnim = useSlideInFromBottom(700, 100);
  const scaleAnim = useScaleIn(600, 200);
  const buttonScale = useRef(new Animated.Value(1)).current;
  const visitorButtonScale = useRef(new Animated.Value(1)).current;

  const buttonPressHandlers = createPressAnimation(buttonScale);
  const visitorPressHandlers = createPressAnimation(visitorButtonScale);

  const handleAuth = async () => {
    if (!email || !password) {
      Alert.alert('خطأ', 'يرجى ملء جميع الحقول');
      return;
    }

    if (isSignUp && !name) {
      Alert.alert('خطأ', 'يرجى إدخال اسمك');
      return;
    }

    setLoading(true);

    try {
      if (isSignUp) {
        // Only allow client signups - admins must be added via Firebase
        const result = await signUp(email, password, name, 'client');
        if (result.success) {
          Alert.alert('نجح', 'تم إنشاء الحساب بنجاح!');
        } else {
          Alert.alert('خطأ', result.error);
        }
      } else {
        const result = await signIn(email, password);
        if (!result.success) {
          Alert.alert('خطأ', result.error);
        }
      }
    } catch (error) {
      Alert.alert('خطأ', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVisitorAccess = () => {
    navigation.navigate('VisitorHome');
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header with gradient */}
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <Image
                source={require('../../assets/icon.png')}
                style={styles.logo}
                resizeMode="contain"
              />
            </View>
            <Text style={styles.title}>مربط الأمين</Text>
            <Text style={styles.subtitle}>
              {isSignUp ? 'إنشاء حساب عميل' : 'مرحباً بعودتك'}
            </Text>
          </View>

          {/* Form Card */}
          <Animated.View style={[styles.formCard, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
            <View style={styles.cardReflection} />
            {isSignUp && (
              <View style={styles.inputContainer}>
                <Text style={styles.label}>الاسم الكامل</Text>
                <View style={styles.inputWrapper}>
                  <Text style={styles.inputIcon}>👤</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="أدخل اسمك"
                    placeholderTextColor="#95a5a6"
                    value={name}
                    onChangeText={setName}
                    autoCapitalize="words"
                    returnKeyType="next"
                  />
                </View>
              </View>
            )}

            <View style={styles.inputContainer}>
              <Text style={styles.label}>البريد الإلكتروني</Text>
              <View style={styles.inputWrapper}>
                <Text style={styles.inputIcon}>✉️</Text>
                <TextInput
                  style={styles.input}
                  placeholder="your@email.com"
                  placeholderTextColor="#95a5a6"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  returnKeyType="next"
                />
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>كلمة المرور</Text>
              <View style={styles.inputWrapper}>
                <Text style={styles.inputIcon}>🔒</Text>
                <TextInput
                  style={styles.input}
                  placeholder="••••••••"
                  placeholderTextColor="#95a5a6"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  returnKeyType="done"
                  onSubmitEditing={handleAuth}
                />
              </View>
            </View>

            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleAuth}
              disabled={loading}
              activeOpacity={0.9}
              {...buttonPressHandlers}
            >
              <Animated.View style={[styles.buttonContent, { transform: [{ scale: buttonScale }] }]}>
                <View style={styles.buttonReflection} />
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Text style={styles.primaryButtonText}>
                      {isSignUp ? 'إنشاء حساب' : 'تسجيل الدخول'}
                    </Text>
                    <Text style={styles.buttonArrow}>←</Text>
                  </>
                )}
              </Animated.View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.switchButton}
              onPress={() => {
                setIsSignUp(!isSignUp);
                setEmail('');
                setPassword('');
                setName('');
              }}
              activeOpacity={0.7}
            >
              <Text style={styles.switchButtonText}>
                {isSignUp
                  ? 'هل لديك حساب؟ تسجيل الدخول'
                  : 'ليس لديك حساب؟ إنشاء حساب'}
              </Text>
            </TouchableOpacity>

            {isSignUp && (
              <View style={styles.infoBox}>
                <Text style={styles.infoText}>
                  ℹ️ التسجيل ينشئ حساب عميل. يجب منح صلاحية المسؤول من قبل إدارة المربط.
                </Text>
              </View>
            )}

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>أو</Text>
              <View style={styles.dividerLine} />
            </View>

            <TouchableOpacity
              style={styles.visitorButton}
              onPress={handleVisitorAccess}
              activeOpacity={0.9}
              {...visitorPressHandlers}
            >
              <Animated.View style={[styles.visitorButtonContent, { transform: [{ scale: visitorButtonScale }] }]}>
                <View style={styles.buttonReflection} />
                <Text style={styles.visitorEmoji}>👁️</Text>
                <Text style={styles.visitorButtonText}>متابعة كزائر</Text>
              </Animated.View>
            </TouchableOpacity>
          </Animated.View>

          {/* Footer */}
          <Text style={styles.footer}>
            إدارة احترافية للمرابط
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  logoContainer: {
    width: 100,
    height: 100,
    marginBottom: spacing.base,
    borderRadius: 50,
    overflow: 'hidden',
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.lg,
    position: 'relative',
  },
  logoReflection: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '40%',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 50,
  },
  logo: {
    width: '100%',
    height: '100%',
  },
  title: {
    fontSize: typography.size.xxxl,
    fontWeight: typography.weight.bold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: typography.size.md,
    color: colors.text.tertiary,
    fontWeight: typography.weight.medium,
  },
  formCard: {
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    ...shadows.lg,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  cardReflection: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  inputContainer: {
    marginBottom: spacing.base,
  },
  label: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.semibold,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.md,
    borderWidth: 1.5,
    borderColor: colors.border.light,
    paddingHorizontal: spacing.md,
    height: 48,
  },
  inputIcon: {
    fontSize: 18,
    marginRight: spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: typography.size.base,
    color: colors.text.primary,
    paddingVertical: spacing.md,
  },
  primaryButton: {
    backgroundColor: colors.primary.main,
    borderRadius: borderRadius.md,
    marginTop: spacing.sm,
    ...shadows.md,
    overflow: 'hidden',
  },
  buttonContent: {
    minHeight: 50,
    paddingVertical: spacing.md,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  buttonReflection: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: typography.size.md,
    fontWeight: typography.weight.bold,
    marginRight: spacing.sm,
  },
  buttonArrow: {
    color: '#fff',
    fontSize: typography.size.lg,
    fontWeight: typography.weight.bold,
  },
  switchButton: {
    marginTop: spacing.md,
    alignItems: 'center',
    paddingVertical: spacing.md,
    minHeight: 44,
  },
  switchButtonText: {
    color: colors.primary.light,
    fontSize: typography.size.base,
    fontWeight: typography.weight.semibold,
  },
  infoBox: {
    backgroundColor: colors.background.tertiary,
    padding: spacing.md,
    borderRadius: borderRadius.sm,
    marginTop: spacing.md,
    borderLeftWidth: 3,
    borderLeftColor: colors.status.info,
  },
  infoText: {
    fontSize: typography.size.xs,
    color: colors.text.tertiary,
    lineHeight: 16,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border.light,
  },
  dividerText: {
    marginHorizontal: spacing.md,
    color: colors.text.muted,
    fontSize: typography.size.xs,
    fontWeight: typography.weight.semibold,
  },
  visitorButton: {
    borderRadius: borderRadius.md,
    borderWidth: 1.5,
    borderColor: colors.border.medium,
    backgroundColor: colors.background.tertiary,
    overflow: 'hidden',
  },
  visitorButtonContent: {
    height: 48,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    position: 'relative',
  },
  visitorEmoji: {
    fontSize: 18,
    marginRight: spacing.sm,
  },
  visitorButtonText: {
    color: colors.text.secondary,
    fontSize: typography.size.base,
    fontWeight: typography.weight.semibold,
  },
  footer: {
    marginTop: spacing.xl,
    textAlign: 'center',
    color: colors.text.muted,
    fontSize: typography.size.xs,
  },
});

export default LoginScreen;
