import React, { useState, useContext } from 'react';
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
} from 'react-native';
import { AuthContext } from './AuthContext';

/**
 * LoginScreen provides authentication with sign in and sign up functionality.
 * Users can create accounts or log in with email/password.
 * Different user roles (admin, client, visitor) determine access levels.
 */
const LoginScreen = ({ navigation }) => {
  const { signIn, signUp, loading: authLoading } = useContext(AuthContext);
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

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
          <Text style={styles.emoji}>🐴</Text>
          <Text style={styles.title}>إسطبل الأمين</Text>
          <Text style={styles.subtitle}>
            {isSignUp ? 'إنشاء حساب عميل' : 'مرحباً بعودتك'}
          </Text>
        </View>

        {/* Form Card */}
        <View style={styles.formCard}>
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
              />
            </View>
          </View>

          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleAuth}
            disabled={loading}
            activeOpacity={0.8}
          >
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
                ℹ️ التسجيل ينشئ حساب عميل. يجب منح صلاحية المسؤول من قبل إدارة الإسطبل.
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
            activeOpacity={0.8}
          >
            <Text style={styles.visitorEmoji}>👁️</Text>
            <Text style={styles.visitorButtonText}>متابعة كزائر</Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <Text style={styles.footer}>
          إدارة احترافية للإسطبلات
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  emoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 18,
    color: '#94a3b8',
    fontWeight: '500',
  },
  formCard: {
    backgroundColor: '#1e293b',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#e2e8f0',
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0f172a',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#334155',
    paddingHorizontal: 16,
  },
  inputIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  input: {
    flex: 1,
    padding: 16,
    fontSize: 16,
    color: '#fff',
  },
  primaryButton: {
    backgroundColor: '#3b82f6',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 8,
  },
  buttonArrow: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  switchButton: {
    marginTop: 16,
    alignItems: 'center',
    padding: 8,
  },
  switchButtonText: {
    color: '#60a5fa',
    fontSize: 14,
    fontWeight: '600',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#334155',
  },
  dividerText: {
    marginHorizontal: 16,
    color: '#64748b',
    fontSize: 12,
    fontWeight: '600',
  },
  visitorButton: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#475569',
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    backgroundColor: '#334155',
  },
  visitorEmoji: {
    fontSize: 20,
    marginRight: 8,
  },
  visitorButtonText: {
    color: '#e2e8f0',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    textAlign: 'center',
    color: '#64748b',
    fontSize: 12,
    marginTop: 24,
    fontStyle: 'italic',
  },
  infoBox: {
    backgroundColor: '#334155',
    borderRadius: 8,
    padding: 12,
    marginTop: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#60a5fa',
  },
  infoText: {
    color: '#94a3b8',
    fontSize: 12,
    lineHeight: 18,
  },
});

export default LoginScreen;