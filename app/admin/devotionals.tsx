// app/admin/devotionals.tsx

import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  TextInput, 
  Modal, 
  ActivityIndicator, 
  LayoutAnimation,
  useColorScheme,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Stack } from 'expo-router';
import { 
  Check, 
  X, 
  Lock, 
  AlertCircle,
  ChevronLeft,
  CheckCircle2
} from 'lucide-react-native';
import { colors } from '../../src/theme/colors';
import { typography } from '../../src/theme/typography';
import { spacing } from '../../src/theme/spacing';
import { 
  getPendingDevotionals, 
  approveDevotional, 
  rejectDevotional 
} from '../../src/features/devotionals/devotionalService';
import { Devotional } from '../../src/features/devotionals/types';
import { DevotionalCard } from '../../src/components/DevotionalCard';
import { getVerse, getVersesInRange } from '../../src/features/bible/bibleService';
import { useAdminStore } from '../../src/features/devotionals/adminStore';
import { useToast } from '../../src/context/ToastContext';

export default function AdminDevotionalsScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const themeColors = isDark ? colors.dark : colors;
  const { showToast } = useToast();

  const { isAdminAuthenticated, setAuthenticated } = useAdminStore();
  const [pin, setPin] = useState('');
  const [showPinModal, setShowPinModal] = useState(!isAdminAuthenticated);
  const [pinError, setPinError] = useState(false);

  const [pendingList, setPendingList] = useState<Devotional[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [selectedDevotional, setSelectedDevotional] = useState<Devotional | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  const ADMIN_PIN = process.env.EXPO_PUBLIC_ADMIN_PIN || '1234';

  const fetchPending = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getPendingDevotionals();
      setPendingList(data);
    } catch (err) {
      console.error('Failed to fetch pending devotionals:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAdminAuthenticated) {
      fetchPending();
    }
  }, [isAdminAuthenticated, fetchPending]);

  const handlePinSubmit = () => {
    if (pin === ADMIN_PIN) {
      setAuthenticated(true);
      setShowPinModal(false);
      setPinError(false);
    } else {
      setPinError(true);
      setPin('');
    }
  };

  const handleApprove = async (devotional: Devotional) => {
    try {
      setActionLoading(devotional.id);
      
      // Fetch verse text from local DB before approval
      let verseText = '';
      const match = devotional.verseRef.match(/(.*)\s(\d+):(\d+)(?:-(\d+))?/);
      if (match) {
        const [_, book, chapter, start, end] = match;
        if (end) {
          const verses = await getVersesInRange(book, parseInt(chapter), parseInt(start), parseInt(end));
          verseText = verses.map(v => v.text).join(' ');
        } else {
          const v = await getVerse(book, parseInt(chapter), parseInt(start));
          verseText = v?.text || '';
        }
      }

      await approveDevotional(devotional.id, verseText);
      
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setPendingList(prev => prev.filter(d => d.id !== devotional.id));
      showToast({ message: 'Devotional approved!', type: 'success' });
    } catch (err) {
      showToast({ message: 'Approval failed', type: 'error' });
    } finally {
      setActionLoading(null);
    }
  };

  const handleShowReject = (devotional: Devotional) => {
    setSelectedDevotional(devotional);
    setRejectModalVisible(true);
  };

  const handleReject = async () => {
    if (!selectedDevotional || !rejectionReason.trim()) return;
    try {
      setActionLoading(selectedDevotional.id);
      await rejectDevotional(selectedDevotional.id, rejectionReason.trim());
      
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setPendingList(prev => prev.filter(d => d.id !== selectedDevotional.id));
      setRejectModalVisible(false);
      setRejectionReason('');
      setSelectedDevotional(null);
      showToast({ message: 'Devotional rejected', type: 'info' });
    } catch (err) {
      showToast({ message: 'Rejection failed', type: 'error' });
    } finally {
      setActionLoading(null);
    }
  };

  if (showPinModal) {
    return (
      <View style={[styles.pinOverlay, { backgroundColor: themeColors.background }]}>
        <Stack.Screen options={{ title: 'Admin' }} />
        <View style={styles.pinContent}>
          <Lock size={48} color={themeColors.accent} style={{ marginBottom: spacing.lg }} />
          <Text style={[styles.pinTitle, { color: themeColors.text }]}>Admin Verification</Text>
          <Text style={[styles.pinSubtitle, { color: themeColors.textSecondary }]}>Enter your 4-digit PIN to access moderator tools.</Text>
          
          <TextInput
            style={[styles.pinInput, { backgroundColor: themeColors.surface, borderColor: pinError ? colors.danger : themeColors.border, color: themeColors.text }]}
            maxLength={4}
            keyboardType="number-pad"
            secureTextEntry
            autoFocus
            value={pin}
            onChangeText={(text) => {
              setPin(text);
              if (text.length === 4) {
                // We'll let the user tap submit or handle automatically
              }
            }}
          />
          
          {pinError && <Text style={[styles.errorText, { color: colors.danger }]}>Incorrect PIN. Please try again.</Text>}
          
          <TouchableOpacity 
            style={[styles.submitBtn, { backgroundColor: themeColors.accent, marginTop: spacing.xl }]}
            onPress={handlePinSubmit}
          >
            <Text style={[styles.submitBtnText, { color: themeColors.white }]}>Verify PIN</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]} edges={['top']}>
      <Stack.Screen options={{ 
        title: 'Review Submissions',
        headerLeft: () => (
          <TouchableOpacity onPress={() => router.back()}>
            <ChevronLeft size={24} color={themeColors.text} />
          </TouchableOpacity>
        )
      }} />

      <View style={styles.listHeader}>
        <Text style={[styles.countText, { color: themeColors.textSecondary }]}>
          {pendingList.length} submissions pending
        </Text>
      </View>

      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={themeColors.accent} />
        </View>
      ) : (
        <FlatList
          data={pendingList}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <View style={styles.itemContainer}>
              <DevotionalCard devotional={item} fullBody />
              <View style={styles.actions}>
                <TouchableOpacity 
                  style={[styles.actionBtn, styles.approveBtn, { backgroundColor: themeColors.accent }]}
                  onPress={() => handleApprove(item)}
                  disabled={actionLoading === item.id}
                >
                  {actionLoading === item.id ? (
                    <ActivityIndicator color={themeColors.white} size="small" />
                  ) : (
                    <>
                      <Check size={20} color={themeColors.white} />
                      <Text style={[styles.actionBtnText, { color: themeColors.white }]}>Approve</Text>
                    </>
                  )}
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.actionBtn, styles.rejectBtn, { borderColor: colors.danger }]}
                  onPress={() => handleShowReject(item)}
                  disabled={actionLoading === item.id}
                >
                  <X size={20} color={colors.danger} />
                  <Text style={[styles.actionBtnText, { color: colors.danger }]}>Reject</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <CheckCircle2 size={64} color={themeColors.accent} style={{ opacity: 0.5, marginBottom: spacing.lg }} />
              <Text style={[styles.emptyText, { color: themeColors.textSecondary }]}>
                You're all caught up. No pending devotionals.
              </Text>
            </View>
          )}
        />
      )}

      <Modal
        visible={rejectModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setRejectModalVisible(false)}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={[styles.modalContent, { backgroundColor: themeColors.surface }]}>
            <Text style={[styles.modalTitle, { color: themeColors.text }]}>Reject Submission</Text>
            <Text style={[styles.modalSubtitle, { color: themeColors.textSecondary }]}>
              Please provide a reason for the submitter.
            </Text>
            
            <TextInput
              style={[styles.modalInput, { backgroundColor: themeColors.surfaceAlt, borderColor: themeColors.border, color: themeColors.text }]}
              placeholder="e.g. Body text too short, content policy violation..."
              placeholderTextColor={themeColors.textSecondary + '80'}
              multiline
              numberOfLines={4}
              value={rejectionReason}
              onChangeText={setRejectionReason}
              autoFocus
            />

            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={[styles.modalBtn, { backgroundColor: themeColors.border }]}
                onPress={() => setRejectModalVisible(false)}
              >
                <Text style={[styles.modalBtnText, { color: themeColors.text }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalBtn, { backgroundColor: colors.danger, opacity: rejectionReason.trim() ? 1 : 0.5 }]}
                onPress={handleReject}
                disabled={!rejectionReason.trim()}
              >
                <Text style={[styles.modalBtnText, { color: themeColors.white }]}>Confirm Rejection</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  pinOverlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xxl,
  },
  pinContent: {
    width: '100%',
    alignItems: 'center',
    maxWidth: 320,
  },
  pinTitle: {
    ...typography.headingLG,
    fontFamily: 'Lora_600SemiBold',
    marginBottom: spacing.xs,
  },
  pinSubtitle: {
    ...typography.body,
    textAlign: 'center',
    marginBottom: spacing.xxl,
    opacity: 0.8,
  },
  pinInput: {
    width: 200,
    height: 60,
    borderRadius: 16,
    borderWidth: 2,
    textAlign: 'center',
    fontSize: 24,
    fontFamily: 'DMSans_600SemiBold',
    letterSpacing: 10,
  },
  errorText: {
    ...typography.caption,
    marginTop: spacing.md,
  },
  submitBtn: {
    width: '100%',
    padding: spacing.md,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitBtnText: {
    fontFamily: 'DMSans_600SemiBold',
    fontSize: 16,
  },
  listHeader: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  countText: {
    ...typography.caption,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  listContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  itemContainer: {
    marginBottom: spacing.xl,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.md,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  approveBtn: {
    // bg set dynamically
  },
  rejectBtn: {
    borderWidth: 1,
  },
  actionBtnText: {
    fontFamily: 'DMSans_600SemiBold',
    fontSize: 15,
  },
  loaderContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 120,
  },
  emptyText: {
    ...typography.body,
    textAlign: 'center',
    opacity: 0.7,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    padding: spacing.xl,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    gap: spacing.md,
  },
  modalTitle: {
    ...typography.headingLG,
    fontFamily: 'Lora_600SemiBold',
  },
  modalSubtitle: {
    ...typography.body,
    fontSize: 14,
    marginBottom: spacing.sm,
  },
  modalInput: {
    height: 120,
    borderRadius: 12,
    borderWidth: 1,
    padding: spacing.md,
    ...typography.body,
    textAlignVertical: 'top',
  },
  modalActions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.md,
    marginBottom: Platform.OS === 'ios' ? spacing.lg : 0,
  },
  modalBtn: {
    flex: 1,
    height: 52,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBtnText: {
    fontFamily: 'DMSans_600SemiBold',
    fontSize: 16,
  },
});
