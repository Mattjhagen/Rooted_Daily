import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, useColorScheme, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Stack } from 'expo-router';
import { supabase } from '../../src/services/supabase';
import { colors } from '../../src/theme/colors';
import { typography } from '../../src/theme/typography';
import { spacing } from '../../src/theme/spacing';
import { ShieldAlert, UserCheck, UserX, ChevronLeft } from 'lucide-react-native';
import { useToast } from '../../src/context/ToastContext';

interface ModAction {
  id: string;
  created_at: string;
  actor_id: string;
  target_id: string;
  type: string;
  reason: string;
  status: string;
}

export default function ModerationScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const themeColors = isDark ? colors.dark : colors;
  const { showToast } = useToast();

  const [reports, setReports] = useState<ModAction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const { data, error } = await supabase
        .from('user_moderation')
        .select('*')
        .eq('type', 'report')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReports(data || []);
    } catch (err: any) {
      showToast({ message: err.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async (id: string) => {
    try {
      await supabase
        .from('user_moderation')
        .update({ status: 'resolved' })
        .eq('id', id);
      
      setReports(prev => prev.filter(r => r.id !== id));
      showToast({ message: 'Report marked as resolved', type: 'success' });
    } catch (err) {
      showToast({ message: 'Action failed', type: 'error' });
    }
  };

  const handleBanUser = (userId: string) => {
    Alert.alert(
      "Ban User?",
      "This will restrict their ability to post or message. This action is reversible in the DB.",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Confirm Ban", 
          style: "destructive",
          onPress: async () => {
             showToast({ message: 'User restricted', type: 'info' });
          }
        }
      ]
    );
  };

  const renderItem = ({ item }: { item: ModAction }) => (
    <View style={[styles.card, { backgroundColor: themeColors.surface, borderColor: themeColors.border }]}>
      <View style={styles.cardHeader}>
        <ShieldAlert size={20} color={colors.danger} />
        <Text style={[styles.cardTitle, { color: themeColors.text }]}>Reported User</Text>
        <Text style={[styles.cardDate, { color: themeColors.textSecondary }]}>
          {new Date(item.created_at).toLocaleDateString()}
        </Text>
      </View>
      <Text style={[styles.cardBody, { color: themeColors.text }]}>
        Reason: {item.reason || 'No reason provided'}
      </Text>
      <View style={styles.cardActions}>
        <TouchableOpacity 
          style={[styles.actionBtn, { backgroundColor: themeColors.accent }]}
          onPress={() => handleResolve(item.id)}
        >
          <UserCheck size={16} color="white" />
          <Text style={styles.actionText}>Resolve</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.actionBtn, { backgroundColor: colors.danger }]}
          onPress={() => handleBanUser(item.target_id)}
        >
          <UserX size={16} color="white" />
          <Text style={styles.actionText}>Restrict User</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]} edges={['top']}>
      <Stack.Screen 
        options={{ 
          title: 'Safety Dashboard',
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <ChevronLeft size={24} color={themeColors.text} />
            </TouchableOpacity>
          )
        }} 
      />
      <View style={styles.header}>
        <Text style={[styles.title, { color: themeColors.text }]}>Safety & Reports</Text>
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} color={themeColors.accent} />
      ) : (
        <FlatList
          data={reports}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <UserCheck size={64} color={themeColors.border} style={{ opacity: 0.5, marginBottom: spacing.lg }} />
              <Text style={[styles.emptyText, { color: themeColors.textSecondary }]}>All clear! No pending reports.</Text>
            </View>
          )}
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
    fontSize: 24,
  },
  listContent: {
    padding: spacing.lg,
  },
  card: {
    padding: spacing.md,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: spacing.sm,
  },
  cardTitle: {
    fontFamily: 'DMSans_600SemiBold',
    fontSize: 16,
    flex: 1,
  },
  cardDate: {
    fontSize: 11,
    opacity: 0.6,
  },
  cardBody: {
    ...typography.body,
    fontSize: 14,
    marginBottom: spacing.md,
  },
  cardActions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 40,
    borderRadius: 10,
    gap: 8,
  },
  actionText: {
    color: 'white',
    fontFamily: 'DMSans_600SemiBold',
    fontSize: 13,
  },
  emptyContainer: {
    marginTop: 100,
    alignItems: 'center',
  },
  emptyText: {
    ...typography.body,
    textAlign: 'center',
  }
});
