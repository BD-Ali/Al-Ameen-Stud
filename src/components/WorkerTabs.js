import React, { useContext } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useNavigation } from '@react-navigation/native';
import { StyleSheet, Platform } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from '../i18n/LanguageContext';
import { colors, typography, spacing } from '../styles/theme';
import WorkerHomeScreen from '../screens/WorkerHomeScreen';
import WorkerLessonsScreen from '../screens/WorkerLessonsScreen';

const Tab = createBottomTabNavigator();

const WorkerTabs = () => {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
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
      }}
    >
      <Tab.Screen
        name="WorkerHome"
        component={WorkerHomeScreen}
        options={{
          tabBarLabel: t('nav.workerHome'),
          tabBarIcon: ({ focused }) => (
            <FontAwesome5 name="home" size={20} color={focused ? colors.primary.main : colors.text.tertiary} solid />
          ),
        }}
      />
      <Tab.Screen
        name="WorkerLessons"
        component={WorkerLessonsScreen}
        options={{
          tabBarLabel: t('nav.workerLessons'),
          tabBarIcon: ({ focused }) => (
            <FontAwesome5 name="book-open" size={20} color={focused ? colors.accent.purple : colors.text.tertiary} solid />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default WorkerTabs;
