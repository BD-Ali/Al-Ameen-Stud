import 'react-native-gesture-handler';
import React, { useContext, useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthProvider, AuthContext } from './src/context/AuthContext';
import { DataProvider } from './src/context/DataContext';
import LoginScreen from './src/screens/LoginScreen';
import AdminTabs from './src/components/AdminTabs';
import ClientHomeScreen from './src/screens/ClientHomeScreen';
import WorkerHomeScreen from './src/screens/WorkerHomeScreen';
import VisitorHomeScreen from './src/screens/VisitorHomeScreen';
import InAppNotificationBanner from './src/components/InAppNotificationBanner';
import notificationService from './src/services/notificationService';
import lessonReminderService from './src/services/lessonReminderService';
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
  const [bannerVisible, setBannerVisible] = useState(false);
  const [bannerData, setBannerData] = useState(null);
  const [deepLinkAnnouncementId, setDeepLinkAnnouncementId] = useState(null);
  const [deepLinkLessonId, setDeepLinkLessonId] = useState(null);

  useEffect(() => {
    // Request notification permissions
    if (user) {
      notificationService.requestPermissions();

      // Setup lesson reminder notification channels and categories
      lessonReminderService.setupNotificationChannel();
      lessonReminderService.setupNotificationCategories();
    }

    // Setup notification listeners
    notificationService.setupListeners(
      // On notification received (in-app)
      (notification) => {
        const data = notification.request.content;

        // Handle announcement notifications
        if (data.data?.type === 'announcement') {
          setBannerData({
            title: data.title,
            body: data.body,
            announcementId: data.data.announcementId,
            type: 'announcement',
          });
          setBannerVisible(true);
        }

        // Handle lesson reminder notifications
        if (data.data?.type === 'lesson_reminder' || data.data?.type === 'lesson_reminder_grouped') {
          setBannerData({
            title: data.title,
            body: data.body,
            lessonId: data.data.lessonId,
            lessonIds: data.data.lessonIds,
            type: data.data.type,
          });
          setBannerVisible(true);
        }
      },
      // On notification tapped
      (dataOrId) => {
        // Handle both old format (just ID) and new format (data object)
        if (typeof dataOrId === 'string') {
          setDeepLinkAnnouncementId(dataOrId);
        } else if (dataOrId?.type === 'announcement') {
          setDeepLinkAnnouncementId(dataOrId.announcementId);
        } else if (dataOrId?.type === 'lesson_reminder') {
          setDeepLinkLessonId(dataOrId.lessonId);
          // Mark reminder as seen
          if (dataOrId.lessonId && dataOrId.reminderType) {
            lessonReminderService.markReminderAsSeen(dataOrId.lessonId, dataOrId.reminderType);
          }
        }
      }
    );

    return () => {
      notificationService.removeListeners();
    };
  }, [user]);

  const handleBannerPress = () => {
    if (bannerData?.type === 'announcement' && bannerData?.announcementId) {
      setDeepLinkAnnouncementId(bannerData.announcementId);
    } else if (bannerData?.type === 'lesson_reminder' && bannerData?.lessonId) {
      setDeepLinkLessonId(bannerData.lessonId);
      // Mark as seen
      lessonReminderService.markReminderAsSeen(bannerData.lessonId, 'banner');
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  return (
    <>
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
                initialParams={{ highlightAnnouncementId: deepLinkAnnouncementId }}
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
          ) : userRole === 'worker' ? (
            // Worker user - show worker home
            <>
              <Stack.Screen
                name="WorkerHome"
                component={WorkerHomeScreen}
                options={{
                  headerShown: false,
                }}
                initialParams={{ highlightAnnouncementId: deepLinkAnnouncementId }}
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
                initialParams={{ highlightAnnouncementId: deepLinkAnnouncementId }}
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

      {/* In-App Notification Banner */}
      <InAppNotificationBanner
        visible={bannerVisible}
        title={bannerData?.title || ''}
        body={bannerData?.body || ''}
        onPress={handleBannerPress}
        onDismiss={() => setBannerVisible(false)}
        type="announcement"
      />
    </>
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
