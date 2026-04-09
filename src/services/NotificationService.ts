import { Platform } from 'react-native';
import Constants from 'expo-constants';

// Detect if we are running in Expo Go
// We check for 'expo' or null/undefined ifOwnership is flaky
const isExpoGo = !Constants.appOwnership || Constants.appOwnership === 'expo';

// Internal library holder
let _Notifications: any = null;

const getNotifications = () => {
  if (_Notifications) return _Notifications;
  
  if (isExpoGo && Platform.OS === 'android') {
    return null;
  }

  try {
    _Notifications = require('expo-notifications');
    return _Notifications;
  } catch (e) {
    console.warn('Failed to load expo-notifications', e);
    return null;
  }
};

/**
 * Ensures the notification handler is set up exactly once.
 */
let isHandlerSet = false;
const ensureHandler = () => {
  if (isHandlerSet) return;
  const Notifications = getNotifications();
  if (Notifications) {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });
    isHandlerSet = true;
  }
};

export const requestNotificationPermissions = async () => {
  const Notifications = getNotifications();
  if (!Notifications) return false;
  
  ensureHandler();

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  
  if (finalStatus !== 'granted') {
    return false;
  }
  
  if (Platform.OS === 'android') {
    Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  return true;
};

export const scheduleDailyReminder = async (hour: number, minute: number) => {
  const Notifications = getNotifications();
  if (!Notifications) return;

  ensureHandler();

  // Cancel all existing notifications first to avoid duplicates
  await Notifications.cancelAllScheduledNotificationsAsync();

  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Rooted Daily Reminder",
      body: "It's time for your daily reflection. Open the app to continue your journey through the Word.",
      data: { url: '/(tabs)' },
    },
    trigger: {
      hour,
      minute,
      type: Notifications.SchedulableTriggerInputTypes.DAILY
    } as any,
  });
};

export const cancelAllReminders = async () => {
  const Notifications = getNotifications();
  if (!Notifications) return;
  await Notifications.cancelAllScheduledNotificationsAsync();
};
