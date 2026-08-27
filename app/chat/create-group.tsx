import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Switch, ScrollView, ActivityIndicator, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Stack } from 'expo-router';
import { supabase } from '../../src/services/supabase';
import { colors } from '../../src/theme/colors';
import { typography } from '../../src/theme/typography';
import { spacing } from '../../src/theme/spacing';
import { Users, Lock, Globe, ChevronRight } from 'lucide-react-native';
import { useToast } from '../../src/context/ToastContext';

export default function CreateGroupScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const themeColors = isDark ? colors.dark : colors;
  const { showToast } = useToast();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isPrivate, setIsPrivate] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!name.trim()) {
      showToast({ message: 'Please enter a group name', type: 'error' });
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Generate a simple 6-char invite code
      const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();

      const { data, error } = await supabase
        .from('chat_rooms')
        .insert({
          name: name.trim(),
          description: description.trim(),
          type: isPrivate ? 'private_group' : 'public_channel',
          created_by: user.id,
          invite_code: inviteCode,
          is_invite_only: isPrivate
        })
        .select()
        .single();

      if (error) throw error;

      // Add creator as admin member
      await supabase.from('chat_members').insert({
        room_id: data.id,
        user_id: user.id,
        role: 'admin'
      });

      showToast({ message: 'Group created successfully!', type: 'success' });
      router.replace(`/chat/channel/${data.id}`);
    } catch (err: any) {
      showToast({ message: err.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]} edges={['top']}>
      <Stack.Screen options={{ title: 'Create Group' }} />
      
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <View style={[styles.iconContainer, { backgroundColor: themeColors.accent + '20' }]}>
            <Users size={32} color={themeColors.accent} />
          </View>
          <Text style={[styles.title, { color: themeColors.text }]}>New Fellowship Group</Text>
          <Text style={[styles.subtitle, { color: themeColors.textSecondary }]}>
            Create a space for your church, school, or study group.
          </Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: themeColors.textSecondary }]}>Group Name</Text>
            <TextInput
              style={[styles.input, { color: themeColors.text, backgroundColor: themeColors.surface, borderColor: themeColors.border }]}
              placeholder="e.g. Wednesday Night Bible Study"
              placeholderTextColor={themeColors.textSecondary}
              value={name}
              onChangeText={setName}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: themeColors.textSecondary }]}>Description (Optional)</Text>
            <TextInput
              style={[styles.input, styles.textArea, { color: themeColors.text, backgroundColor: themeColors.surface, borderColor: themeColors.border }]}
              placeholder="What is this group about?"
              placeholderTextColor={themeColors.textSecondary}
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={3}
            />
          </View>

          <View style={[styles.settingRow, { backgroundColor: themeColors.surface, borderColor: themeColors.border }]}>
            <View style={styles.settingLabel}>
              {isPrivate ? <Lock size={20} color={themeColors.accent} /> : <Globe size={20} color={themeColors.accent} />}
              <View style={{ marginLeft: spacing.md }}>
                <Text style={[styles.settingTitle, { color: themeColors.text }]}>
                  {isPrivate ? 'Private Group' : 'Public Group'}
                </Text>
                <Text style={[styles.settingSubtitle, { color: themeColors.textSecondary }]}>
                  {isPrivate ? 'Invite only via unique code' : 'Anyone can find and join'}
                </Text>
              </View>
            </View>
            <Switch
              value={isPrivate}
              onValueChange={setIsPrivate}
              trackColor={{ false: '#767577', true: themeColors.accent }}
            />
          </View>
        </View>

        <TouchableOpacity 
          style={[styles.createBtn, { backgroundColor: themeColors.accent, opacity: name.trim() ? 1 : 0.6 }]}
          onPress={handleCreate}
          disabled={loading || !name.trim()}
        >
          {loading ? <ActivityIndicator color="white" /> : <Text style={styles.createBtnText}>Create Group</Text>}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  title: {
    ...typography.headingLG,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.body,
    textAlign: 'center',
    opacity: 0.7,
    marginTop: 4,
  },
  form: {
    gap: spacing.lg,
    marginBottom: spacing.xxl,
  },
  inputGroup: {
    gap: spacing.xs,
  },
  label: {
    ...typography.caption,
    marginLeft: 4,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  input: {
    height: 56,
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    fontFamily: 'DMSans_500Medium',
    fontSize: 16,
  },
  textArea: {
    height: 100,
    paddingTop: spacing.md,
    textAlignVertical: 'top',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    borderRadius: 16,
    borderWidth: 1,
  },
  settingLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingTitle: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 16,
  },
  settingSubtitle: {
    fontSize: 12,
    opacity: 0.6,
  },
  createBtn: {
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  createBtnText: {
    color: 'white',
    fontFamily: 'DMSans_700Bold',
    fontSize: 16,
  }
});
