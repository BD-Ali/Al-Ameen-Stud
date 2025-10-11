import 'react-native-gesture-handler';
import React, { useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthProvider, AuthContext } from './src/context/AuthContext';
import { DataProvider } from './src/context/DataContext';
import LoginScreen from './src/screens/LoginScreen';
import AdminTabs from './src/components/AdminTabs';
import ClientHomeScreen from './src/screens/ClientHomeScreen';
import VisitorHomeScreen from './src/screens/VisitorHomeScreen';
import { ActivityIndicator, View, StyleSheet, I18nManager } from 'react-native';

// Enable RTL for Arabic
I18nManager.allowRTL(true);
I18nManager.forceRTL(true);

const Stack = createNativeStackNavigator();

/**
 * Navigation component that routes users based on authentication status and role
 */
function AppNavigator() {
  const { user, userRole, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {!user ? (
          // Not logged in - show login and visitor screens
          <>
            <Stack.Screen
              name="Login"
              component={LoginScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="VisitorHome"
              component={VisitorHomeScreen}
              options={{
                headerShown: true,
                title: 'منطقة الزوار',
                headerStyle: { backgroundColor: '#1e293b' },
                headerTintColor: '#fff',
              }}
            />
          </>
        ) : userRole === 'admin' ? (
          // Admin user - show admin tabs
          <>
            <Stack.Screen
              name="AdminTabs"
              component={AdminTabs}
              options={{ headerShown: false }}
            />
          </>
        ) : userRole === 'client' ? (
          // Client user - show client home
          <>
            <Stack.Screen
              name="ClientHome"
              component={ClientHomeScreen}
              options={{
                headerShown: false,
              }}
            />
          </>
        ) : (
          // Fallback for unknown roles
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{ headerShown: false }}
          />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <AppNavigator />
      </DataProvider>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0f172a',
  },
});
