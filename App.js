import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { DataProvider } from './src/context/DataContext';
import LoginScreen from './src/screens/LoginScreen';
import AdminTabs from './src/screens/admin/AdminTabs';
import ClientHomeScreen from './src/screens/ClientHomeScreen';
import VisitorHomeScreen from './src/screens/VisitorHomeScreen';

// Root stack navigator controlling the high‑level flows: login, admin, client
// and visitor sections.
const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <DataProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Login">
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="AdminTabs"
            component={AdminTabs}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="ClientHome"
            component={ClientHomeScreen}
            options={{ title: 'Client Area' }}
          />
          <Stack.Screen
            name="VisitorHome"
            component={VisitorHomeScreen}
            options={{ title: 'Visitor Area' }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </DataProvider>
  );
}