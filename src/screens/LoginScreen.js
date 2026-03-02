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
  SafeAreaView,
} from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { AuthContext } from '../context/AuthContext';
import { colors, typography, spacing, borderRadius, shadows } from '../styles/theme';
import { useFadeIn, useSlideInFromBottom, useScaleIn, createPressAnimation } from '../utils/animations';
import { useTranslation } from '../i18n/LanguageContext';
import LanguageSwitcher from '../components/LanguageSwitcher';

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

  const { t } = useTranslation();

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
      Alert.alert(t('common.error'), t('common.fillAllFields'));
      return;
    }

    if (isSignUp && !name) {
      Alert.alert(t('common.error'), t('auth.enterYourName'));
      return;
    }

    setLoading(true);

    try {
      if (isSignUp) {
        // Only allow client signups - admins must be added via Firebase
        const result = await signUp(email, password, name, 'client');
        if (result.success) {
          Alert.alert(t('common.success'), t('auth.accountCreated'));
        } else {
          Alert.alert(t('common.error'), result.error);
        }
      } else {
        const result = await signIn(email, password);
        if (!result.success) {
          Alert.alert(t('common.error'), result.error);
        }
      }
    } catch (error) {
      Alert.alert(t('common.error'), error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVisitorAccess = () => {
    navigation.navigate('VisitorHome');
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
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
            <Text style={styles.title}>{t('auth.brandName')}</Text>
            <Text style={styles.subtitle}>
              {isSignUp ? t('auth.createClientAccount') : t('auth.welcomeBack')}
            </Text>
            <LanguageSwitcher style={styles.langSwitcher} />
          </View>

          {/* Form Card */}
          <Animated.View style={[styles.formCard, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
            <View style={styles.cardReflection} />
            {isSignUp && (
              <View style={styles.inputContainer}>
                <Text style={styles.label}>{t('auth.fullName')}</Text>
                <View style={styles.inputWrapper}>
                  <FontAwesome5 name="user" size={18} color="#95A5A6" solid style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder={t('auth.enterFullName')}
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
              <Text style={styles.label}>{t('auth.email')}</Text>
              <View style={styles.inputWrapper}>
                <FontAwesome5 name="envelope" size={16} color="#95A5A6" solid style={styles.inputIcon} />
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
              <Text style={styles.label}>{t('auth.password')}</Text>
              <View style={styles.inputWrapper}>
                <FontAwesome5 name="lock" size={18} color="#95A5A6" solid style={styles.inputIcon} />
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
                      {isSignUp ? t('auth.createAccount') : t('auth.signIn')}
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
                  ? `${t('auth.haveAccount')} ${t('auth.signInNow')}`
                  : `${t('auth.noAccount')} ${t('auth.createNewAccount')}`}
              </Text>
            </TouchableOpacity>

            {isSignUp && (
              <View style={styles.infoBox}>
                <FontAwesome5 name="info-circle" size={16} color="#3498DB" solid style={styles.infoIcon} />
                <Text style={styles.infoText}>
                  {t('auth.signUpInfo')}
                </Text>
              </View>
            )}

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>{t('common.or')}</Text>
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
                <FontAwesome5 name="eye" size={18} color="#7F8C8D" solid style={styles.visitorIcon} />
                <Text style={styles.visitorButtonText}>{t('auth.continueAsVisitor')}</Text>
              </Animated.View>
            </TouchableOpacity>
          </Animated.View>

          {/* Footer */}
          <Text style={styles.footer}>
            {t('auth.tagline')}
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
  },
  langSwitcher: {
    marginTop: spacing.md,
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
    fontSize: 42,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: spacing.xs,
    letterSpacing: 1.5,
    fontStyle: 'italic',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 2, height: 3 },
    textShadowRadius: 6,
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
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  infoIcon: {
    marginRight: spacing.sm,
    marginTop: 2,
  },
  infoText: {
    flex: 1,
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
  visitorIcon: {
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
