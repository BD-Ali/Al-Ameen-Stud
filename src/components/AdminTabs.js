import React, { useContext } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useNavigation } from '@react-navigation/native';
import { TouchableOpacity, Text, StyleSheet, Alert, View, Image } from 'react-native';
import { Ionicons, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
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
  const navigation = useNavigation();

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
          <View style={styles.headerActions}>
            <TouchableOpacity onPress={handleProfilePress} style={styles.profileButton}>
              <FontAwesome5 name="user-circle" size={22} color="#3B82F6" solid />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
              <Text style={styles.logoutText}>خروج</Text>
            </TouchableOpacity>
          </View>
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
            <FontAwesome5 name="bullhorn" size={20} color={focused ? '#FF6B6B' : '#95A5A6'} solid />
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
            <FontAwesome5 name="tasks" size={20} color={focused ? '#4ECDC4' : '#95A5A6'} solid />
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
            <FontAwesome5 name="calendar-alt" size={20} color={focused ? '#5DADE2' : '#95A5A6'} solid />
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
            <MaterialCommunityIcons name="horse-variant" size={24} color={focused ? '#F39C12' : '#95A5A6'} />
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
            <FontAwesome5 name="carrot" size={20} color={focused ? '#FF9800' : '#95A5A6'} solid />
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
            <FontAwesome5 name="book-open" size={20} color={focused ? '#9B59B6' : '#95A5A6'} solid />
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
            <FontAwesome5 name="users" size={20} color={focused ? '#1ABC9C' : '#95A5A6'} solid />
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
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: spacing.base,
    gap: spacing.sm,
  },
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary.main + '18',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.primary.main,
  },
  profileIcon: {
    fontSize: 20,
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

