import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, ActivityIndicator, useColorScheme, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Stack } from 'expo-router';
import { supabase } from '../../src/services/supabase';
import { colors } from '../../src/theme/colors';
import { typography } from '../../src/theme/typography';
import { spacing } from '../../src/theme/spacing';
import { Search, UserPlus, UserCircle, QrCode, Copy, Check } from 'lucide-react-native';
import { useToast } from '../../src/context/ToastContext';
import * as Clipboard from 'expo-clipboard';

interface Profile {
  id: string;
  display_name: string;
  username: string;
  unique_code: string;
  avatar_url: string;
}

export default function DiscoveryScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const themeColors = isDark ? colors.dark : colors;
  const { showToast } = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(false);
  const [myProfile, setMyProfile] = useState<Profile | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchMyProfile();
  }, []);

  const fetchMyProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      setMyProfile(data);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setLoading(true);
    try {
      // Search by username or unique code
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .or(`username.ilike.%${searchQuery}%,unique_code.eq.${searchQuery.toUpperCase()}`)
        .limit(20);

      if (error) throw error;
      setResults(data || []);
    } catch (err: any) {
      showToast({ message: err.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const startConversation = async (targetUserId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    try {
      // Check if conversation already exists
      const { data: existing } = await supabase
        .from('conversations')
        .select('id')
        .or(`and(user1_id.eq.${user.id},user2_id.eq.${targetUserId}),and(user1_id.eq.${targetUserId},user2_id.eq.${user.id})`)
        .single();

      if (existing) {
        router.push(`/chat/dm/${existing.id}`);
        return;
      }

      // Create new conversation
      const { data: newConv, error } = await supabase
        .from('conversations')
        .insert({
          user1_id: user.id,
          user2_id: targetUserId,
          last_message: 'New conversation started'
        })
        .select()
        .single();

      if (error) throw error;
      router.push(`/chat/dm/${newConv.id}`);
    } catch (err: any) {
      showToast({ message: 'Failed to start chat', type: 'error' });
    }
  };

  const copyToClipboard = async () => {
    if (myProfile?.unique_code) {
      await Clipboard.setStringAsync(myProfile.unique_code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      showToast({ message: 'Code copied to clipboard!', type: 'success' });
    }
  };

  const renderItem = ({ item }: { item: Profile }) => {
    if (item.id === myProfile?.id) return null;
    return (
      <View style={[styles.resultItem, { backgroundColor: themeColors.surface, borderColor: themeColors.border }]}>
        {item.avatar_url ? (
          <Image source={{ uri: item.avatar_url }} style={styles.resultAvatar} />
        ) : (
          <UserCircle size={40} color={themeColors.accent} />
        )}
        <View style={styles.resultInfo}>
          <Text style={[styles.resultName, { color: themeColors.text }]}>{item.display_name || item.username || 'User'}</Text>
          <Text style={[styles.resultCode, { color: themeColors.textSecondary }]}>{item.unique_code}</Text>
        </View>
        <TouchableOpacity 
          style={[styles.addBtn, { backgroundColor: themeColors.accent }]}
          onPress={() => startConversation(item.id)}
        >
          <UserPlus size={18} color="white" />
          <Text style={styles.addBtnText}>Chat</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]} edges={['top']}>
      <Stack.Screen options={{ title: 'Find Community' }} />
      
      <View style={styles.header}>
        <Text style={[styles.title, { color: themeColors.text }]}>Find Friends</Text>
        <Text style={[styles.subtitle, { color: themeColors.textSecondary }]}>Search by username or unique Rooted code</Text>
      </View>

      <View style={styles.searchSection}>
        <View style={[styles.searchContainer, { backgroundColor: themeColors.surface, borderColor: themeColors.border }]}>
          <Search size={20} color={themeColors.textSecondary} />
          <TextInput
            style={[styles.input, { color: themeColors.text }]}
            placeholder="Username or #CODE"
            placeholderTextColor={themeColors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={handleSearch}>
              <Text style={{ color: themeColors.accent, fontFamily: 'DMSans_700Bold' }}>Search</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {myProfile && (
        <View style={[styles.myCodeSection, { backgroundColor: themeColors.surface + '80', borderColor: themeColors.border }]}>
          <QrCode size={20} color={themeColors.accent} />
          <View style={{ flex: 1, marginLeft: spacing.md }}>
            <Text style={[styles.myCodeLabel, { color: themeColors.textSecondary }]}>Your Unique Code</Text>
            <Text style={[styles.myCodeValue, { color: themeColors.text }]}>{myProfile.unique_code}</Text>
          </View>
          <TouchableOpacity onPress={copyToClipboard} style={styles.copyBtn}>
            {copied ? <Check size={18} color={themeColors.accent} /> : <Copy size={18} color={themeColors.textSecondary} />}
          </TouchableOpacity>
        </View>
      )}

      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} color={themeColors.accent} />
      ) : (
        <FlatList
          data={results}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={() => searchQuery.length > 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={[styles.emptyText, { color: themeColors.textSecondary }]}>No users found matching "{searchQuery}"</Text>
            </View>
          ) : null}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: spacing.lg,
  },
  title: {
    ...typography.headingLG,
    fontSize: 28,
  },
  subtitle: {
    ...typography.body,
    fontSize: 14,
    opacity: 0.7,
    marginTop: 4,
  },
  searchSection: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    height: 56,
    borderRadius: 16,
    borderWidth: 1,
    gap: spacing.sm,
  },
  input: {
    flex: 1,
    fontFamily: 'DMSans_500Medium',
    fontSize: 16,
  },
  myCodeSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.lg,
    padding: spacing.md,
    borderRadius: 16,
    borderWidth: 1,
    borderStyle: 'dashed',
    marginBottom: spacing.xl,
  },
  myCodeLabel: {
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  myCodeValue: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 18,
    letterSpacing: 1,
  },
  copyBtn: {
    padding: spacing.sm,
  },
  listContent: {
    paddingHorizontal: spacing.lg,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: spacing.sm,
  },
  resultAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  resultInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  resultName: {
    fontFamily: 'DMSans_600SemiBold',
    fontSize: 16,
  },
  resultCode: {
    fontSize: 12,
    opacity: 0.6,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 12,
    gap: 6,
  },
  addBtnText: {
    color: 'white',
    fontFamily: 'DMSans_700Bold',
    fontSize: 13,
  },
  emptyContainer: {
    marginTop: 40,
    alignItems: 'center',
  },
  emptyText: {
    ...typography.body,
    textAlign: 'center',
  }
});
