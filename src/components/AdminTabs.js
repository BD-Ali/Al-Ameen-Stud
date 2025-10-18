import React, { useContext } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { TouchableOpacity, Text, StyleSheet, Alert, View, Image } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { colors, typography, spacing, borderRadius } from '../styles/theme';
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

  const handleLogout = async () => {
    Alert.alert(
      'تسجيل الخروج',
      'هل أنت متأكد أنك تريد تسجيل الخروج؟',
      [
        { text: 'إلغاء', style: 'cancel' },
        {
          text: 'تسجيل الخروج',
          onPress: async () => {
            await logOut();
          },
        },
      ]
    );
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
          height: 64,
          paddingBottom: spacing.sm,
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
          <View style={styles.logoHeader}>
            <Image
              source={require('../../assets/icon.png')}
              style={styles.headerLogo}
              resizeMode="contain"
            />
          </View>
        ),
        headerRight: () => (
          <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
            <Text style={styles.logoutText}>خروج</Text>
          </TouchableOpacity>
        ),
      }}
    >
      <Tab.Screen
        name="Announcements"
        component={AnnouncementsScreen}
        options={{
          title: 'الإعلانات',
          tabBarLabel: 'الإعلانات',
          tabBarIcon: ({ focused }) => (
            <Text style={{ fontSize: 20 }}>📢</Text>
          ),
        }}
      />
      <Tab.Screen
        name="Missions"
        component={MissionsScreen}
        options={{
          title: 'المهام',
          tabBarLabel: 'المهام',
          tabBarIcon: ({ focused }) => (
            <Text style={{ fontSize: 20 }}>✓</Text>
          ),
        }}
      />
      <Tab.Screen
        name="Schedule"
        component={WeeklyScheduleScreen}
        options={{
          title: 'جدول العمل الأسبوعي',
          tabBarLabel: 'الجدول',
          tabBarIcon: ({ focused }) => (
            <Text style={{ fontSize: 20 }}>📅</Text>
          ),
        }}
      />
      <Tab.Screen
        name="Horses"
        component={HorsesScreen}
        options={{
          title: 'الخيول',
          tabBarLabel: 'الخيول',
          tabBarIcon: ({ focused }) => (
            <Text style={{ fontSize: 20 }}>🐴</Text>
          ),
        }}
      />
      <Tab.Screen
        name="Feeding"
        component={FeedScreen}
        options={{
          title: 'التغذية',
          tabBarLabel: 'التغذية',
          tabBarIcon: ({ focused }) => (
            <Text style={{ fontSize: 20 }}>🥕</Text>
          ),
        }}
      />
      <Tab.Screen
        name="Lessons"
        component={LessonsScreen}
        options={{
          title: 'الدروس',
          tabBarLabel: 'الدروس',
          tabBarIcon: ({ focused }) => (
            <Text style={{ fontSize: 20 }}>📚</Text>
          ),
        }}
      />
      <Tab.Screen
        name="Clients"
        component={UsersScreen}
        options={{
          title: 'المستخدمين',
          tabBarLabel: 'المستخدمين',
          tabBarIcon: ({ focused }) => (
            <Text style={{ fontSize: 20 }}>👥</Text>
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  logoHeader: {
    marginLeft: spacing.base,
    marginRight: spacing.base,
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerLogo: {
    width: '100%',
    height: '100%',
  },
  logoutButton: {
    marginRight: spacing.base,
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

