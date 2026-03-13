import React, { useContext } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useNavigation } from '@react-navigation/native';
import { TouchableOpacity, Text, StyleSheet, Alert, View, Image, Platform } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AuthContext } from '../context/AuthContext';
import { useTranslation } from '../i18n/LanguageContext';
import { colors, typography, spacing, borderRadius, shadows } from '../styles/theme';
import ClientHomeScreen from '../screens/ClientHomeScreen';
import ClientHistoryScreen from '../screens/ClientHistoryScreen';

const Tab = createBottomTabNavigator();

const ClientTabs = () => {
  const { logOut } = useContext(AuthContext);
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { t } = useTranslation();

  const handleLogout = async () => {
    Alert.alert(
      t('auth.logout'),
      t('auth.logoutConfirm'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('auth.logout'),
          onPress: async () => {
            await logOut();
          },
        },
      ]
    );
  };

  const handleProfilePress = () => {
    navigation.navigate('Profile');
  };

  return (
    <Tab.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.background.secondary,
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 1,
          borderBottomColor: colors.border.light,
        },
        headerTintColor: colors.text.primary,
        headerTitleStyle: {
          fontWeight: typography.weight.bold,
          fontSize: typography.size.md,
        },
        tabBarStyle: {
          backgroundColor: colors.background.secondary,
          borderTopColor: colors.border.light,
          height: 64 + (Platform.OS === 'android' ? insets.bottom : 0),
          paddingBottom: Platform.OS === 'android' ? insets.bottom + spacing.sm : spacing.sm,
          paddingTop: spacing.sm,
        },
        tabBarActiveTintColor: colors.primary.main,
        tabBarInactiveTintColor: colors.text.tertiary,
        tabBarLabelStyle: {
          fontSize: typography.size.xs,
          fontWeight: typography.weight.semibold,
          marginTop: 2,
        },
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="ClientHome"
        component={ClientHomeScreen}
        options={{
          tabBarLabel: t('nav.clientHome'),
          tabBarIcon: ({ focused }) => (
            <FontAwesome5 name="home" size={20} color={focused ? colors.primary.main : colors.text.tertiary} solid />
          ),
        }}
      />
      <Tab.Screen
        name="ClientHistory"
        component={ClientHistoryScreen}
        options={{
          tabBarLabel: t('nav.clientHistory'),
          tabBarIcon: ({ focused }) => (
            <FontAwesome5 name="history" size={20} color={focused ? colors.accent.purple : colors.text.tertiary} solid />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default ClientTabs;
