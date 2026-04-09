import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity, useColorScheme, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import { colors } from '../../src/theme/colors';
import { typography } from '../../src/theme/typography';
import { spacing } from '../../src/theme/spacing';
import { Bell, Clock, ChevronRight } from 'lucide-react-native';
import { requestNotificationPermissions, scheduleDailyReminder, cancelAllReminders } from '../../src/services/NotificationService';
import { useToast } from '../../src/context/ToastContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function SettingsScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const themeColors = isDark ? colors.dark : colors;
  const { showToast } = useToast();

  const [isEnabled, setIsEnabled] = useState(false);
  const [date, setDate] = useState(new Date(new Date().setHours(7, 0, 0, 0)));
  const [showPicker, setShowPicker] = useState(false);

  useEffect(() => {
    // Load saved settings
    const loadSettings = async () => {
      const savedEnabled = await AsyncStorage.getItem('notifications_enabled');
      const savedTime = await AsyncStorage.getItem('notifications_time');
      
      if (savedEnabled !== null) setIsEnabled(savedEnabled === 'true');
      if (savedTime !== null) setDate(new Date(savedTime));
    };
    loadSettings();
  }, []);

  const toggleSwitch = async () => {
    const newValue = !isEnabled;
    if (newValue) {
      const granted = await requestNotificationPermissions();
      if (!granted) {
        showToast({ message: 'Notification permissions denied', type: 'error' });
        return;
      }
      await scheduleDailyReminder(date.getHours(), date.getMinutes());
      showToast({ message: 'Reminders enabled!', type: 'success' });
    } else {
      await cancelAllReminders();
      showToast({ message: 'Reminders disabled', type: 'info' });
    }
    setIsEnabled(newValue);
    await AsyncStorage.setItem('notifications_enabled', newValue.toString());
  };

  const onTimeChange = async (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || date;
    setShowPicker(Platform.OS === 'ios');
    setDate(currentDate);
    
    if (isEnabled) {
      await scheduleDailyReminder(currentDate.getHours(), currentDate.getMinutes());
      showToast({ message: 'Reminder time updated', type: 'success' });
    }
    await AsyncStorage.setItem('notifications_time', currentDate.toISOString());
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: themeColors.text }]}>Settings</Text>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: themeColors.textSecondary }]}>Notifications</Text>
        
        <View style={[styles.row, { backgroundColor: themeColors.surface, borderColor: themeColors.border }]}>
          <View style={styles.rowLabel}>
            <Bell size={20} color={themeColors.accent} />
            <Text style={[styles.rowText, { color: themeColors.text }]}>Daily Reminders</Text>
          </View>
          <Switch
            trackColor={{ false: '#767577', true: colors.accent }}
            thumbColor={isEnabled ? colors.white : '#f4f3f4'}
            onValueChange={toggleSwitch}
            value={isEnabled}
          />
        </View>

        {isEnabled && (
          <TouchableOpacity 
            style={[styles.row, { backgroundColor: themeColors.surface, borderColor: themeColors.border, marginTop: -1 }]}
            onPress={() => setShowPicker(true)}
          >
            <View style={styles.rowLabel}>
              <Clock size={20} color={themeColors.accent} />
              <Text style={[styles.rowText, { color: themeColors.text }]}>Reminder Time</Text>
            </View>
            <View style={styles.rowValue}>
              <Text style={[styles.valueText, { color: themeColors.textSecondary }]}>
                {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
              <ChevronRight size={18} color={themeColors.textSecondary} />
            </View>
          </TouchableOpacity>
        )}

        {(showPicker || Platform.OS === 'ios') && isEnabled && (
          <View style={styles.pickerContainer}>
            <DateTimePicker
              value={date}
              mode="time"
              is24Hour={false}
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={onTimeChange}
              textColor={themeColors.text}
            />
          </View>
        )}
      </View>

      <View style={styles.footer}>
        <Text style={[styles.versionText, { color: themeColors.textSecondary }]}>Rooted Daily v0.0.3</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: spacing.xl,
    paddingBottom: spacing.md,
  },
  title: {
    ...typography.headingLG,
  },
  section: {
    marginTop: spacing.lg,
  },
  sectionTitle: {
    ...typography.caption,
    marginLeft: spacing.xl,
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.lg,
    paddingHorizontal: spacing.xl,
    borderTopWidth: 1,
    borderBottomWidth: 1,
  },
  rowLabel: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowText: {
    ...typography.body,
    marginLeft: spacing.md,
    fontFamily: 'DMSans_500Medium',
  },
  rowValue: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  valueText: {
    ...typography.body,
    marginRight: spacing.sm,
  },
  pickerContainer: {
    backgroundColor: 'transparent',
    padding: spacing.md,
  },
  footer: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: spacing.xxl,
  },
  versionText: {
    ...typography.caption,
    opacity: 0.6,
  },
});
