import React, { useContext } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { TouchableOpacity, Text, StyleSheet, Alert, View } from 'react-native';
import { AuthContext } from './AuthContext';
import HorsesScreen from './HorsesScreen';
import FeedScreen from './FeedScreen';
import LessonsScreen from './LessonsScreen';
import ClientsScreen from './ClientsScreen';
import WorkersScreen from './WorkersScreen';

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
          backgroundColor: '#1e293b',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
          fontSize: 18,
        },
        tabBarStyle: {
          backgroundColor: '#1e293b',
          borderTopColor: '#334155',
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarActiveTintColor: '#3b82f6',
        tabBarInactiveTintColor: '#94a3b8',
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
        headerRight: () => (
          <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
            <Text style={styles.logoutIcon}>🚪</Text>
          </TouchableOpacity>
        ),
      }}
    >
      <Tab.Screen
        name="Horses"
        component={HorsesScreen}
        options={{
          title: 'الخيول',
          tabBarLabel: 'الخيول',
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 24 }}>🐴</Text>
          ),
        }}
      />
      <Tab.Screen
        name="Feeding"
        component={FeedScreen}
        options={{
          title: 'التغذية',
          tabBarLabel: 'التغذية',
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 24 }}>🥕</Text>
          ),
        }}
      />
      <Tab.Screen
        name="Lessons"
        component={LessonsScreen}
        options={{
          title: 'الدروس',
          tabBarLabel: 'الدروس',
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 24 }}>📚</Text>
          ),
        }}
      />
      <Tab.Screen
        name="Clients"
        component={ClientsScreen}
        options={{
          title: 'العملاء',
          tabBarLabel: 'العملاء',
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 24 }}>👥</Text>
          ),
        }}
      />
      <Tab.Screen
        name="Workers"
        component={WorkersScreen}
        options={{
          title: 'العمال',
          tabBarLabel: 'العمال',
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 24 }}>👷</Text>
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  logoutButton: {
    marginRight: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#334155',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutIcon: {
    fontSize: 20,
  },
});

export default AdminTabs;