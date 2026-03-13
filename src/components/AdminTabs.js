import React, { useContext } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useNavigation } from '@react-navigation/native';
import { TouchableOpacity, Text, StyleSheet, Alert, View, Image, Platform } from 'react-native';
import { FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AuthContext } from '../context/AuthContext';
import { useTranslation } from '../i18n/LanguageContext';
import { colors, typography, spacing, borderRadius, shadows } from '../styles/theme';
import HorsesScreen from '../screens/HorsesScreen';
import FeedScreen from '../screens/FeedScreen';
import LessonsScreen from '../screens/LessonsScreen';
import UsersScreen from '../screens/UsersScreen';
import MissionsScreen from '../screens/MissionsScreen';
import WeeklyScheduleScreen from '../screens/WeeklyScheduleScreen';
import AnnouncementsScreen from '../screens/AnnouncementsScreen';

const Tab = createBottomTabNavigator();

const AdminTabs = () => {
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
          height: 64 + (Platform.OS === 'ios' ? Math.round(insets.bottom * 0.65) : insets.bottom),
          paddingBottom: (Platform.OS === 'ios' ? Math.round(insets.bottom * 0.65) : insets.bottom) + spacing.sm,
          paddingTop: spacing.sm,
        },
        tabBarActiveTintColor: colors.primary.main,
        tabBarInactiveTintColor: colors.text.tertiary,
        tabBarLabelStyle: {
          fontSize: typography.size.xs,
          fontWeight: typography.weight.semibold,
          marginTop: 2,
        },
        headerLeft: () => (
          <TouchableOpacity onPress={handleProfilePress} style={styles.logoHeader} activeOpacity={0.7}>
            <Image
              source={require('../../assets/icon.png')}
              style={styles.headerLogo}
              resizeMode="contain"
            />
          </TouchableOpacity>
        ),
        headerRight: () => (
          <View style={styles.headerActions}>
            <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
              <Text style={styles.logoutText}>{t('auth.exit')}</Text>
            </TouchableOpacity>
          </View>
        ),
      }}
    >
      <Tab.Screen
        name="Announcements"
        component={AnnouncementsScreen}
        options={{
          title: t('nav.announcements'),
          tabBarLabel: t('nav.announcements'),
          tabBarIcon: ({ focused }) => (
            <FontAwesome5 name="bullhorn" size={20} color={focused ? colors.status.error : colors.text.tertiary} solid />
          ),
        }}
      />
      <Tab.Screen
        name="Missions"
        component={MissionsScreen}
        options={{
          title: t('nav.missions'),
          tabBarLabel: t('nav.missions'),
          tabBarIcon: ({ focused }) => (
            <FontAwesome5 name="tasks" size={20} color={focused ? colors.accent.teal : colors.text.tertiary} solid />
          ),
        }}
      />
      <Tab.Screen
        name="Schedule"
        component={WeeklyScheduleScreen}
        options={{
          title: t('nav.schedule'),
          tabBarLabel: t('nav.schedule'),
          tabBarIcon: ({ focused }) => (
            <FontAwesome5 name="calendar-alt" size={20} color={focused ? colors.primary.light : colors.text.tertiary} solid />
          ),
        }}
      />
      <Tab.Screen
        name="Horses"
        component={HorsesScreen}
        options={{
          title: t('nav.horses'),
          tabBarLabel: t('nav.horses'),
          tabBarIcon: ({ focused }) => (
            <MaterialCommunityIcons name="horse-variant" size={24} color={focused ? colors.accent.amber : colors.text.tertiary} />
          ),
        }}
      />
      <Tab.Screen
        name="Feeding"
        component={FeedScreen}
        options={{
          title: t('nav.feed'),
          tabBarLabel: t('nav.feed'),
          tabBarIcon: ({ focused }) => (
            <FontAwesome5 name="carrot" size={20} color={focused ? colors.status.warning : colors.text.tertiary} solid />
          ),
        }}
      />
      <Tab.Screen
        name="Lessons"
        component={LessonsScreen}
        options={{
          title: t('nav.lessons'),
          tabBarLabel: t('nav.lessons'),
          tabBarIcon: ({ focused }) => (
            <FontAwesome5 name="book-open" size={20} color={focused ? colors.accent.purple : colors.text.tertiary} solid />
          ),
        }}
      />
      <Tab.Screen
        name="Clients"
        component={UsersScreen}
        options={{
          title: t('nav.users'),
          tabBarLabel: t('nav.users'),
          tabBarIcon: ({ focused }) => (
            <FontAwesome5 name="users" size={20} color={focused ? colors.status.info : colors.text.tertiary} solid />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  logoHeader: {
    marginStart: spacing.base,
    marginEnd: spacing.base,
    width: 44,
    height: 44,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
    backgroundColor: colors.surface.elevated,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.sm,
  },
  headerLogo: {
    width: '100%',
    height: '100%',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginEnd: spacing.base,
  },
  logoutButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.background.tertiary,
  },
  logoutText: {
    color: colors.text.primary,
    fontSize: typography.size.sm,
    fontWeight: typography.weight.bold,
  },
});

export default AdminTabs;

