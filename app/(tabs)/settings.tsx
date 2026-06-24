import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity, useColorScheme, Platform, ActivityIndicator, ScrollView, Modal, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'react-native';
import { colors } from '../../src/theme/colors';
import { typography } from '../../src/theme/typography';
import { spacing } from '../../src/theme/spacing';
import { Bell, Clock, ChevronRight, Mic, MessageSquare } from 'lucide-react-native';
import { requestNotificationPermissions, scheduleDailyReminder, cancelAllReminders } from '../../src/services/NotificationService';
import { useToast } from '../../src/context/ToastContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { HelpCircle, Heart, Mail, ExternalLink, Sparkles } from 'lucide-react-native';
import * as Linking from 'expo-linking';
import { usePersistenceStore } from '../../src/features/persistence/persistenceStore';
import { useAudioStore } from '../../src/features/audio/audioStore';
import { useRouter } from 'expo-router';
import { AuthService } from '../../src/services/auth/AuthService';
import { User, LogIn, LogOut, UserCircle, Settings, X } from 'lucide-react-native';
import { supabase } from '../../src/services/supabase';

export default function SettingsScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const themeColors = isDark ? colors.dark : colors;
  const { setHasSeenTutorial } = usePersistenceStore();
  const { preferredVoiceIdentifier } = useAudioStore();
  const { showToast } = useToast();
  const router = useRouter();

  const [isEnabled, setIsEnabled] = useState(false);
  const [date, setDate] = useState(new Date(new Date().setHours(7, 0, 0, 0)));
  const [showPicker, setShowPicker] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [uploading, setUploading] = useState(false);
  const [showUsernameModal, setShowUsernameModal] = useState(false);
  const [editingUsername, setEditingUsername] = useState('');
  const [savingUsername, setSavingUsername] = useState(false);

  useEffect(() => {
    AuthService.getCurrentUser().then(currUser => {
      setUser(currUser);
      if (currUser) fetchProfile(currUser.id);
    });
    const { data: { subscription } } = AuthService.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
      if (session?.user) fetchProfile(session.user.id);
    });
    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    const { data } = await supabase.from('profiles').select('*').eq('id', userId).single();
    if (data) setProfile(data);
  };

  const handleSignOut = async () => {
    try {
      await AuthService.signOut();
      showToast({ message: 'Signed out successfully', type: 'info' });
    } catch (err: any) {
      showToast({ message: err.message, type: 'error' });
    }
  };

  const handleReplayTutorial = () => {
    setHasSeenTutorial(false);
    showToast({ message: 'Tutorial will show on next Home visit!', type: 'success' });
  };

  const handleShowWhatsNew = () => {
    usePersistenceStore.getState().setLastSeenVersion('');
    showToast({ message: 'Update notes will show on next restart', type: 'success' });
  };

  const handleDonate = () => {
    Linking.openURL('https://www.venmo.com/u/RootedDaily');
  };

  const handleContact = () => {
    Linking.openURL('mailto:rootedapp@p3lending.space');
  };

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

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
      });

      if (!result.canceled && result.assets[0].uri) {
        uploadAvatar(result.assets[0].uri);
      }
    } catch (err) {
      showToast({ message: 'Failed to pick image', type: 'error' });
    }
  };

  const uploadAvatar = async (uri: string) => {
    if (!user) return;
    setUploading(true);
    try {
      const fileName = `${user.id}-${Date.now()}.jpg`;
      const formData = new FormData();
      formData.append('file', {
        uri,
        name: fileName,
        type: 'image/jpeg',
      } as any);

      // Using direct fetch/upload if a custom service isn't defined
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, formData);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(fileName);

      await supabase.from('profiles').update({ avatar_url: publicUrl }).eq('id', user.id);
      setProfile({ ...profile, avatar_url: publicUrl });
      showToast({ message: 'Profile picture updated!', type: 'success' });
    } catch (err: any) {
      showToast({ message: 'Failed to upload photo. Ensure "avatars" bucket exists.', type: 'error' });
    } finally {
      setUploading(false);
    }
  };

  const handleSaveUsername = async () => {
    if (!editingUsername.trim() || !user) return;
    setSavingUsername(true);
    try {
      const cleanUsername = editingUsername.trim();
      await AuthService.updateUserMetadata({ username: cleanUsername });
      
      // Sync the custom username back to the searchable profiles table
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ username: cleanUsername })
        .eq('id', user.id);
        
      if (profileError) console.error("Error updating profile username:", profileError);

      setUser({ ...user, user_metadata: { ...user.user_metadata, username: cleanUsername } });
      setShowUsernameModal(false);
      showToast({ message: 'Username updated!', type: 'success' });
    } catch (err) {
      showToast({ message: 'Failed to save username', type: 'error' });
    } finally {
      setSavingUsername(false);
    }
  };

  const openUsernameModal = () => {
    setEditingUsername(user?.user_metadata?.username || '');
    setShowUsernameModal(true);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: themeColors.text }]}>Settings</Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: themeColors.textSecondary }]}>Account</Text>
          {user ? (
            <>
              <View style={[styles.row, { backgroundColor: themeColors.surface, borderColor: themeColors.border }]}>
                <View style={styles.rowLabel}>
                  <TouchableOpacity onPress={pickImage} disabled={uploading}>
                    {profile?.avatar_url ? (
                      <Image source={{ uri: profile.avatar_url }} style={styles.avatar} />
                    ) : (
                    <View style={[styles.avatarPlaceholder, { backgroundColor: themeColors.accent + '20' }]}>
                      <UserCircle size={40} color={themeColors.accent} />
                    </View>
                  )}
                  {uploading && <ActivityIndicator style={styles.avatarLoader} size="small" color={themeColors.accent} />}
                </TouchableOpacity>
                <View style={{ marginLeft: spacing.md, flex: 1 }}>
                  <Text style={[styles.rowText, { color: themeColors.text, marginLeft: 0, marginBottom: 4 }]} numberOfLines={1}>{user.email}</Text>
                  <TouchableOpacity onPress={handleSignOut}>
                    <Text style={{ color: colors.danger, fontSize: 12, fontFamily: 'DMSans_600SemiBold' }}>Sign Out</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
            <TouchableOpacity 
              style={[styles.row, { backgroundColor: themeColors.surface, borderColor: themeColors.border, marginTop: -1 }]}
              onPress={openUsernameModal}
            >
              <View style={styles.rowLabel}>
                <UserCircle size={20} color={themeColors.accent} />
                <Text style={[styles.rowText, { color: themeColors.text }]}>Username: <Text style={{ fontFamily: 'DMSans_700Bold' }}>{user.user_metadata?.username || 'Not set'}</Text></Text>
              </View>
              <ChevronRight size={18} color={themeColors.textSecondary} />
            </TouchableOpacity>
          </>
        ) : (
          <TouchableOpacity 
            style={[styles.row, { backgroundColor: themeColors.surface, borderColor: themeColors.border }]}
            onPress={() => router.push('/auth/login')}
          >
            <View style={styles.rowLabel}>
              <LogIn size={20} color={themeColors.accent} />
              <Text style={[styles.rowText, { color: themeColors.text }]}>Sign In / Create Account</Text>
            </View>
            <ChevronRight size={18} color={themeColors.textSecondary} />
          </TouchableOpacity>
        )}
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

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: themeColors.textSecondary }]}>Accessibility</Text>
        <TouchableOpacity 
          style={[styles.row, { backgroundColor: themeColors.surface, borderColor: themeColors.border }]}
          onPress={() => router.push('/settings/advanced')}
        >
          <View style={styles.rowLabel}>
            <Settings size={20} color={themeColors.accent} />
            <Text style={[styles.rowText, { color: themeColors.text }]}>Advanced</Text>
          </View>
          <ChevronRight size={18} color={themeColors.textSecondary} />
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: themeColors.textSecondary }]}>Support the Mission</Text>
        <View style={[styles.infoBox, { backgroundColor: themeColors.surface, borderColor: themeColors.border }]}>
          <Text style={[styles.infoText, { color: themeColors.textSecondary }]}>
            Rooted Daily will always be a free resource. As a solo developer, I cover the significant costs for hosting and high-speed AI personally. If this app has blessed you, please consider a small donation to help keep our mission growing and the Word spreading.
          </Text>
          
          <TouchableOpacity 
            style={[styles.donateBtn, { backgroundColor: themeColors.accent }]}
            onPress={handleDonate}
          >
            <Heart size={18} color="white" fill="white" />
            <Text style={styles.donateBtnText}>Support on Venmo</Text>
            <ExternalLink size={14} color="white" opacity={0.7} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          style={[styles.row, { backgroundColor: themeColors.surface, borderColor: themeColors.border, marginTop: spacing.md }]}
          onPress={handleContact}
        >
          <View style={styles.rowLabel}>
            <Mail size={20} color={themeColors.accent} />
            <Text style={[styles.rowText, { color: themeColors.text }]}>Got Feedback? Contact Me</Text>
          </View>
          <ChevronRight size={18} color={themeColors.textSecondary} />
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.row, { backgroundColor: themeColors.surface, borderColor: themeColors.border, marginTop: -1 }]}
          onPress={handleReplayTutorial}
        >
          <View style={styles.rowLabel}>
            <Sparkles size={20} color={themeColors.accent} />
            <Text style={[styles.rowText, { color: themeColors.text }]}>Replay Tutorial</Text>
          </View>
          <ChevronRight size={18} color={themeColors.textSecondary} />
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.row, { backgroundColor: themeColors.surface, borderColor: themeColors.border, marginTop: -1 }]}
          onPress={handleShowWhatsNew}
        >
          <View style={styles.rowLabel}>
            <Sparkles size={20} color={colors.gold} />
            <Text style={[styles.rowText, { color: themeColors.text }]}>What's New in v1.0.1</Text>
          </View>
          <ChevronRight size={18} color={themeColors.textSecondary} />
        </TouchableOpacity>
      </View>

        <View style={styles.footer}>
          <Text style={[styles.versionText, { color: themeColors.textSecondary }]}>Rooted Daily v1.0.1</Text>
        </View>
      </ScrollView>

      {/* Username Edit Modal */}
      <Modal visible={showUsernameModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: themeColors.surface, borderColor: themeColors.border }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: themeColors.text }]}>Edit Username</Text>
              <TouchableOpacity onPress={() => setShowUsernameModal(false)}>
                <X size={24} color={themeColors.textSecondary} />
              </TouchableOpacity>
            </View>
            
            <Text style={[styles.modalSubtitle, { color: themeColors.textSecondary }]}>
              This name will be displayed when you post insights or message others in the community.
            </Text>

            <TextInput
              style={[styles.input, { color: themeColors.text, borderColor: themeColors.border, backgroundColor: themeColors.background }]}
              value={editingUsername}
              onChangeText={setEditingUsername}
              placeholder="Enter username"
              placeholderTextColor={themeColors.textSecondary}
              autoCapitalize="none"
              autoCorrect={false}
              maxLength={20}
            />

            <TouchableOpacity 
              style={[styles.saveBtn, { backgroundColor: themeColors.accent, opacity: savingUsername || !editingUsername.trim() ? 0.7 : 1 }]}
              onPress={handleSaveUsername}
              disabled={savingUsername || !editingUsername.trim()}
            >
              {savingUsername ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.saveBtnText}>Save Username</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
    flex: 1,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  avatarPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarLoader: {
    position: 'absolute',
    top: 20,
    left: 20,
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
    paddingVertical: spacing.xxl,
    alignItems: 'center',
  },
  versionText: {
    ...typography.caption,
    opacity: 0.6,
  },
  infoBox: {
    marginHorizontal: spacing.xl,
    padding: spacing.lg,
    borderRadius: 16,
    borderWidth: 1,
    gap: spacing.md,
  },
  infoText: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 14,
    lineHeight: 20,
  },
  donateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    borderRadius: 12,
    gap: 8,
  },
  donateBtnText: {
    color: 'white',
    fontFamily: 'DMSans_600SemiBold',
    fontSize: 15,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  modalContent: {
    width: '100%',
    borderRadius: 20,
    padding: spacing.xl,
    borderWidth: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  modalTitle: {
    ...typography.headingLG,
    fontSize: 20,
  },
  modalSubtitle: {
    ...typography.body,
    fontSize: 14,
    marginBottom: spacing.xl,
    lineHeight: 20,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: spacing.md,
    fontFamily: 'DMSans_500Medium',
    fontSize: 16,
    marginBottom: spacing.xl,
  },
  saveBtn: {
    padding: spacing.md,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveBtnText: {
    color: 'white',
    fontFamily: 'DMSans_700Bold',
    fontSize: 16,
  },
});
