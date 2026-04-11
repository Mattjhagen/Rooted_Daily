import { Platform } from 'react-native';
import Constants from 'expo-constants';

/**
 * Detect if we are running in Expo Go (Store Client)
 * In some Android versions of Expo Go, certain notification features can cause instability.
 */
const isExpoGo = Constants.executionEnvironment === 'storeClient';

// Internal library holder
let _Notifications: any = null;

/**
 * Safely retrieves the notifications library.
 * Returns null if running in Expo Go on Android or if the library fails to load.
 */
const getNotifications = () => {
  if (_Notifications) return _Notifications;
  
  if (isExpoGo && Platform.OS === 'android') {
    console.log('[NotificationService] Notifications disabled in Expo Go on Android for stability.');
    return null;
  }

  try {
    // We use a try-catch for the require to handle environments where the native module is missing
    _Notifications = require('expo-notifications');
    return _Notifications;
  } catch (e) {
    console.warn('[NotificationService] Failed to load expo-notifications. This is expected in some development environments.', e);
    return null;
  }
};

/**
 * Ensures the notification handler is set up exactly once.
 */
let isHandlerSet = false;
const ensureHandler = () => {
  if (isHandlerSet) return;
  try {
    const Notifications = getNotifications();
    if (Notifications && typeof Notifications.setNotificationHandler === 'function') {
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
  } catch (err) {
    console.error('[NotificationService] Failed to set notification handler:', err);
  }
};

/**
 * Requests permissions and sets up the notification channel on Android.
 */
export const requestNotificationPermissions = async () => {
  try {
    const Notifications = getNotifications();
    if (!Notifications) {
      console.log('[NotificationService] Cannot request permissions: Notifications library not available.');
      return false;
    }
    
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
      // Safely access AndroidImportance, fallback to HIGH (4) if not found
      const importance = Notifications.AndroidImportance?.MAX || 4;
      
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    return true;
  } catch (err) {
    console.error('[NotificationService] Error in requestNotificationPermissions:', err);
    return false;
  }
};

/**
 * Schedules a daily reminder at the specified time.
 */
export const scheduleDailyReminder = async (hour: number, minute: number) => {
  try {
    const Notifications = getNotifications();
    if (!Notifications) return;

    ensureHandler();

    // Cancel all existing notifications first to avoid duplicates
    await Notifications.cancelAllScheduledNotificationsAsync();

    // Get the trigger type safely
    const triggerType = Notifications.SchedulableTriggerInputTypes?.DAILY || 'daily';

    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Rooted Daily Reminder",
        body: "It's time for your daily reflection. Open the app to continue your journey through the Word.",
        data: { url: '/(tabs)' },
      },
      trigger: {
        hour,
        minute,
        type: triggerType
      } as any,
    });
    console.log(`[NotificationService] Daily reminder scheduled for ${hour}:${minute}`);
  } catch (err) {
    console.error('[NotificationService] Failed to schedule daily reminder:', err);
  }
};

/**
 * Cancels all scheduled reminders.
 */
export const cancelAllReminders = async () => {
  try {
    const Notifications = getNotifications();
    if (!Notifications) return;
    await Notifications.cancelAllScheduledNotificationsAsync();
    console.log('[NotificationService] All reminders cancelled.');
  } catch (err) {
    console.error('[NotificationService] Failed to cancel reminders:', err);
  }
};
