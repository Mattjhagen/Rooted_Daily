import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, useColorScheme, ScrollView, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../src/theme/colors';
import { typography } from '../../src/theme/typography';
import { spacing } from '../../src/theme/spacing';
import { ChevronLeft, Key, ExternalLink, HelpCircle, Check, Info } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useAudioStore } from '../../src/features/audio/audioStore';
import * as Linking from 'expo-linking';
import { useToast } from '../../src/context/ToastContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function AdvancedSettingsScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const themeColors = isDark ? colors.dark : colors;
  const router = useRouter();
  const { showToast } = useToast();
  
  const [apiKey, setApiKey] = useState('');
  const [showWalkthrough, setShowWalkthrough] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    // Load existing key
    AsyncStorage.getItem('elevenlabs_api_key').then(val => {
      if (val) setApiKey(val);
    });
  }, []);

  const handleSave = async () => {
    try {
      await AsyncStorage.setItem('elevenlabs_api_key', apiKey);
      // Also update the store if we add it there
      showToast({ message: 'API Key saved successfully', type: 'success' });
    } catch (err) {
      showToast({ message: 'Failed to save API Key', type: 'error' });
    }
  };

  const openElevenLabs = () => {
    Linking.openURL('https://elevenlabs.io/app/settings/api-keys');
  };

  const steps = [
    {
      title: 'Create an Account',
      description: 'Visit ElevenLabs.io and sign up for an account. You can start with their free tier.',
      icon: <ExternalLink size={32} color={themeColors.accent} />
    },
    {
      title: 'Go to API Keys',
      description: 'Navigate to your Profile Settings and find the "API Keys" section.',
      icon: <Key size={32} color={themeColors.accent} />
    },
    {
      title: 'Copy Your Key',
      description: 'Click the "Show" or "Copy" icon next to your API key. Keep this key private!',
      icon: <Check size={32} color={themeColors.accent} />
    },
    {
      title: 'Paste and Save',
      description: 'Return to this screen, paste the key into the input field, and tap "Save Changes".',
      icon: <Info size={32} color={themeColors.accent} />
    }
  ];

  const renderWalkthrough = () => (
    <Modal
      visible={showWalkthrough}
      transparent
      animationType="fade"
      onRequestClose={() => setShowWalkthrough(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: themeColors.surface }]}>
          <Text style={[styles.modalTitle, { color: themeColors.text }]}>How to setup ElevenLabs</Text>
          
          <View style={styles.stepIndicator}>
            {steps.map((_, i) => (
              <View 
                key={i} 
                style={[
                  styles.stepDot, 
                  { backgroundColor: i === currentStep ? themeColors.accent : themeColors.border }
                ]} 
              />
            ))}
          </View>

          <View style={styles.stepContent}>
            <View style={[styles.stepIconContainer, { backgroundColor: themeColors.accent + '15' }]}>
              {steps[currentStep].icon}
            </View>
            <Text style={[styles.stepTitle, { color: themeColors.text }]}>{steps[currentStep].title}</Text>
            <Text style={[styles.stepDescription, { color: themeColors.textSecondary }]}>
              {steps[currentStep].description}
            </Text>
          </View>

          <View style={styles.modalFooter}>
            <TouchableOpacity 
              style={[styles.modalBtn, { borderColor: themeColors.border, borderWidth: 1 }]}
              onPress={() => {
                if (currentStep > 0) {
                  setCurrentStep(currentStep - 1);
                } else {
                  setShowWalkthrough(false);
                }
              }}
            >
              <Text style={[styles.modalBtnText, { color: themeColors.textSecondary }]}>
                {currentStep === 0 ? 'Close' : 'Back'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.modalBtn, { backgroundColor: themeColors.accent }]}
              onPress={() => {
                if (currentStep < steps.length - 1) {
                  setCurrentStep(currentStep + 1);
                } else {
                  setShowWalkthrough(false);
                  setCurrentStep(0);
                }
              }}
            >
              <Text style={[styles.modalBtnText, { color: 'white' }]}>
                {currentStep === steps.length - 1 ? 'Got it!' : 'Next'}
              </Text>
            </TouchableOpacity>
          </View>
          
          {currentStep === 1 && (
            <TouchableOpacity onPress={openElevenLabs} style={styles.deepLinkBtn}>
              <Text style={{ color: themeColors.accent, fontFamily: 'DMSans_600SemiBold' }}>Open ElevenLabs Settings</Text>
              <ExternalLink size={14} color={themeColors.accent} />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ChevronLeft size={24} color={themeColors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: themeColors.text }]}>Advanced Settings</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: themeColors.textSecondary }]}>AI Voice Integration</Text>
            <TouchableOpacity onPress={() => setShowWalkthrough(true)}>
              <HelpCircle size={20} color={themeColors.accent} />
            </TouchableOpacity>
          </View>
          
          <View style={[styles.card, { backgroundColor: themeColors.surface, borderColor: themeColors.border }]}>
            <Text style={[styles.cardLabel, { color: themeColors.textSecondary }]}>ElevenLabs API Key</Text>
            <View style={[styles.inputWrapper, { backgroundColor: themeColors.background, borderColor: themeColors.border }]}>
              <Key size={18} color={themeColors.textSecondary} />
              <TextInput
                style={[styles.input, { color: themeColors.text }]}
                value={apiKey}
                onChangeText={setApiKey}
                placeholder="Paste your key here..."
                placeholderTextColor={themeColors.textSecondary + '80'}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
            <Text style={[styles.cardInfo, { color: themeColors.textSecondary }]}>
              Adding your own key allows for higher quality voices and faster synthesis. Your key is stored only on this device.
            </Text>
            
            <TouchableOpacity 
              style={[styles.saveBtn, { backgroundColor: themeColors.accent }]}
              onPress={handleSave}
            >
              <Text style={styles.saveBtnText}>Save Changes</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity 
            style={[styles.linkBtn, { borderColor: themeColors.border }]}
            onPress={openElevenLabs}
          >
            <View style={styles.rowLabel}>
              <ExternalLink size={20} color={themeColors.accent} />
              <Text style={[styles.rowText, { color: themeColors.text }]}>Get API Key from ElevenLabs</Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: themeColors.textSecondary }]}>Privacy & Safety</Text>
          <TouchableOpacity 
            style={[styles.card, { backgroundColor: themeColors.surface, borderColor: themeColors.border, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }]}
            onPress={() => router.push('/settings/stealth')}
          >
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <Shield size={20} color={themeColors.accent} />
                <Text style={[styles.cardLabel, { color: themeColors.text, marginBottom: 0 }]}>Stealth Mode</Text>
              </View>
              <Text style={[styles.cardInfo, { color: themeColors.textSecondary }]}>
                Disguise this app as a calculator for added privacy in sensitive regions.
              </Text>
            </View>
            <ChevronLeft size={20} color={themeColors.textSecondary} style={{ transform: [{ rotate: '180deg' }] }} />
          </TouchableOpacity>
        </View>
      </ScrollView>

      {renderWalkthrough()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.xl,
    paddingBottom: spacing.md,
  },
  backBtn: {
    marginRight: spacing.md,
  },
  title: {
    ...typography.headingLG,
  },
  content: {
    padding: spacing.xl,
  },
  section: {
    marginBottom: spacing.xxl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.caption,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  card: {
    padding: spacing.lg,
    borderRadius: 20,
    borderWidth: 1,
    gap: spacing.md,
  },
  cardLabel: {
    ...typography.headingMD,
    fontSize: 14,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    height: 50,
    borderRadius: 12,
    borderWidth: 1,
    gap: spacing.sm,
  },
  input: {
    flex: 1,
    fontFamily: 'DMSans_400Regular',
    fontSize: 15,
  },
  cardInfo: {
    ...typography.caption,
    lineHeight: 18,
  },
  saveBtn: {
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  saveBtnText: {
    color: 'white',
    fontFamily: 'DMSans_600SemiBold',
    fontSize: 16,
  },
  linkBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.lg,
    borderWidth: 1,
    borderRadius: 16,
    marginTop: spacing.md,
    borderStyle: 'dashed',
  },
  rowLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  rowText: {
    ...typography.body,
    fontFamily: 'DMSans_500Medium',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  modalContent: {
    width: '100%',
    borderRadius: 24,
    padding: spacing.xl,
    alignItems: 'center',
  },
  modalTitle: {
    ...typography.headingLG,
    fontSize: 20,
    marginBottom: spacing.lg,
  },
  stepIndicator: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: spacing.xl,
  },
  stepDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  stepContent: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  stepIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  stepTitle: {
    ...typography.headingMD,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  stepDescription: {
    ...typography.body,
    textAlign: 'center',
    lineHeight: 22,
  },
  modalFooter: {
    flexDirection: 'row',
    gap: spacing.md,
    width: '100%',
  },
  modalBtn: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBtnText: {
    fontFamily: 'DMSans_600SemiBold',
    fontSize: 15,
  },
  deepLinkBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: spacing.lg,
    paddingVertical: 8,
  }
});
