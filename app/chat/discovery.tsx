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
import * as Contacts from 'expo-contacts';
import { Share } from 'react-native';

interface Profile {
  id: string;
  display_name: string;
  username: string;
  unique_code: string;
  avatar_url: string;
  email?: string;
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
  const [contactsSynced, setContactsSynced] = useState(false);
  const [nonMatchingContacts, setNonMatchingContacts] = useState<Contacts.Contact[]>([]);

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

  const handleSyncContacts = async () => {
    try {
      setLoading(true);
      const { status } = await Contacts.requestPermissionsAsync();
      if (status !== 'granted') {
        showToast({ message: 'Permission to access contacts was denied', type: 'error' });
        setLoading(false);
        return;
      }

      const { data } = await Contacts.getContactsAsync({
        fields: [Contacts.Fields.Emails, Contacts.Fields.PhoneNumbers],
      });

      if (data.length > 0) {
        const emails = data
          .map(c => c.emails?.[0]?.email)
          .filter(e => e && e.trim() !== '') as string[];

        if (emails.length === 0) {
          showToast({ message: 'No emails found in contacts', type: 'info' });
          setLoading(false);
          return;
        }

        // Chunk emails to avoid URL length limits in Supabase API
        const matchResults: Profile[] = [];
        const chunkSize = 50;
        for (let i = 0; i < emails.length; i += chunkSize) {
          const chunk = emails.slice(i, i + chunkSize);
          const { data: matchedProfiles } = await supabase
            .from('profiles')
            .select('*')
            .in('email', chunk);
          if (matchedProfiles) {
            matchResults.push(...matchedProfiles);
          }
        }

        const filteredMatches = matchResults.filter(p => p.id !== myProfile?.id);
        
        // Find contacts that didn't match to invite them
        const matchedEmails = matchResults.map(p => p.email);
        const unmatched = data.filter(c => {
          const cEmail = c.emails?.[0]?.email;
          if (!cEmail) return true; // Keep if no email, can invite via phone
          return !matchedEmails.includes(cEmail);
        });

        setResults(filteredMatches);
        setNonMatchingContacts(unmatched.slice(0, 30)); // limit invite list
        setContactsSynced(true);
        showToast({ message: `Found ${filteredMatches.length} friends!`, type: 'success' });
      }
    } catch (err: any) {
      showToast({ message: 'Failed to sync contacts: ' + err.message, type: 'error' });
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

  const handleInvite = async (contact: Contacts.Contact) => {
    try {
      const result = await Share.share({
        message: `Hey! I'm using Rooted Daily to study the Word. Add me using my unique code: ${myProfile?.unique_code || ''}. Download the app here!`,
      });
      if (result.action === Share.sharedAction) {
        showToast({ message: 'Invite sent!', type: 'success' });
      }
    } catch (error: any) {
      showToast({ message: error.message, type: 'error' });
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
        <TouchableOpacity 
          style={[styles.syncBtn, { backgroundColor: themeColors.surface, borderColor: themeColors.border }]}
          onPress={handleSyncContacts}
          disabled={loading}
        >
          <UserPlus size={16} color={themeColors.accent} />
          <Text style={[styles.syncBtnText, { color: themeColors.accent }]}>Find Friends from Contacts</Text>
        </TouchableOpacity>
      </View>

      {myProfile && !contactsSynced && (
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
          ListHeaderComponent={() => contactsSynced && results.length > 0 ? (
            <Text style={[styles.sectionTitle, { color: themeColors.textSecondary }]}>Found on Rooted</Text>
          ) : null}
          ListFooterComponent={() => contactsSynced && nonMatchingContacts.length > 0 ? (
            <View style={{ marginTop: spacing.xl }}>
              <Text style={[styles.sectionTitle, { color: themeColors.textSecondary }]}>Invite Friends</Text>
              {nonMatchingContacts.map((contact, i) => (
                <View key={`contact-${i}`} style={[styles.resultItem, { backgroundColor: themeColors.surface, borderColor: themeColors.border }]}>
                  <View style={[styles.resultAvatar, { backgroundColor: themeColors.accent + '20', justifyContent: 'center', alignItems: 'center' }]}>
                    <Text style={{ color: themeColors.accent, fontFamily: 'DMSans_700Bold' }}>
                      {contact.name ? contact.name.charAt(0).toUpperCase() : '?'}
                    </Text>
                  </View>
                  <View style={styles.resultInfo}>
                    <Text style={[styles.resultName, { color: themeColors.text }]}>{contact.name || 'Unknown'}</Text>
                    <Text style={[styles.resultCode, { color: themeColors.textSecondary }]}>
                      {contact.phoneNumbers?.[0]?.number || contact.emails?.[0]?.email || 'No contact info'}
                    </Text>
                  </View>
                  <TouchableOpacity 
                    style={[styles.addBtn, { backgroundColor: 'transparent', borderWidth: 1, borderColor: themeColors.accent }]}
                    onPress={() => handleInvite(contact)}
                  >
                    <Text style={[styles.addBtnText, { color: themeColors.accent }]}>Invite</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          ) : null}
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
  },
  syncBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
    borderRadius: 16,
    borderWidth: 1,
    marginTop: spacing.sm,
    gap: spacing.sm,
  },
  syncBtnText: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 14,
  },
  sectionTitle: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing.md,
    marginTop: spacing.md,
  }
});
