import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, useColorScheme, Platform, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Stack } from 'expo-router';
import * as Speech from 'expo-speech';
import { colors } from '../../src/theme/colors';
import { typography } from '../../src/theme/typography';
import { spacing } from '../../src/theme/spacing';
import { Mic, Settings, ChevronRight, CheckCircle2, Play, Volume2, Info } from 'lucide-react-native';
import { useAudioStore } from '../../src/features/audio/audioStore';
import { useToast } from '../../src/context/ToastContext';

type Step = 1 | 2 | 3;

export default function PersonalVoiceWizard() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const themeColors = isDark ? colors.dark : colors;
  const { showToast } = useToast();
  
  const { preferredVoiceIdentifier, setPreferredVoiceIdentifier } = useAudioStore();
  
  const [step, setStep] = useState<Step>(1);
  const [voices, setVoices] = useState<Speech.Voice[]>([]);
  const [loadingVoices, setLoadingVoices] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState<string | null>(preferredVoiceIdentifier);

  const fetchVoices = async () => {
    try {
      setLoadingVoices(true);
      const availableVoices = await Speech.getAvailableVoicesAsync();
      // Filter for English voices or the user's locale
      const enVoices = availableVoices.filter(v => v.language.startsWith('en'));
      setVoices(enVoices);
      
      // Try to find a personal voice automatically
      const personalVoice = enVoices.find(v => v.name.toLowerCase().includes('personal voice'));
      if (personalVoice && !selectedVoice) {
        setSelectedVoice(personalVoice.identifier);
      }
    } catch (err) {
      console.error('Failed to fetch voices', err);
    } finally {
      setLoadingVoices(false);
    }
  };

  useEffect(() => {
    if (step === 3) {
      fetchVoices();
    }
  }, [step]);

  const handleTestVoice = (voiceId: string) => {
    Speech.stop();
    Speech.speak("This is a preview of your selected voice in Rooted Daily.", {
      voice: voiceId,
      rate: 1.0
    });
  };

  const handleFinish = () => {
    if (selectedVoice) {
      setPreferredVoiceIdentifier(selectedVoice);
      showToast({ message: 'Personal Voice activated!', type: 'success' });
      router.back();
    }
  };

  const renderStep1 = () => (
    <View style={styles.stepContainer}>
      <View style={styles.iconCircle}>
        <Mic size={40} color={themeColors.accent} />
      </View>
      <Text style={[styles.stepTitle, { color: themeColors.text }]}>Use Your Own Voice</Text>
      <Text style={[styles.stepDescription, { color: themeColors.textSecondary }]}>
        Did you know you can train your iPhone to speak exactly like you? Rooted Daily can use your "Personal Voice" to read the Bible to you.
      </Text>
      
      <View style={[styles.infoBox, { backgroundColor: themeColors.surfaceAlt }]}>
        <Info size={18} color={themeColors.accent} />
        <Text style={[styles.infoText, { color: themeColors.textSecondary }]}>
          This requires iOS 17 or later and about 15 minutes of setup in your iPhone's system settings.
        </Text>
      </View>

      <TouchableOpacity 
        style={[styles.primaryBtn, { backgroundColor: themeColors.accent }]}
        onPress={() => setStep(2)}
      >
        <Text style={styles.primaryBtnText}>Get Started</Text>
        <ChevronRight size={20} color="white" />
      </TouchableOpacity>
    </View>
  );

  const renderStep2 = () => (
    <ScrollView contentContainerStyle={styles.scrollStep}>
      <Settings size={40} color={themeColors.accent} style={{ alignSelf: 'center', marginBottom: spacing.xl }} />
      <Text style={[styles.stepTitle, { color: themeColors.text, textAlign: 'center' }]}>System Setup</Text>
      
      <View style={styles.instructionList}>
        <View style={styles.instructionItem}>
          <View style={[styles.numberCircle, { backgroundColor: themeColors.accent }]}><Text style={styles.numberText}>1</Text></View>
          <Text style={[styles.instructionText, { color: themeColors.text }]}>Open your iPhone <Text style={{ fontWeight: 'bold' }}>Settings</Text></Text>
        </View>
        <View style={styles.instructionItem}>
          <View style={[styles.numberCircle, { backgroundColor: themeColors.accent }]}><Text style={styles.numberText}>2</Text></View>
          <Text style={[styles.instructionText, { color: themeColors.text }]}>Go to <Text style={{ fontWeight: 'bold' }}>Accessibility</Text></Text>
        </View>
        <View style={styles.instructionItem}>
          <View style={[styles.numberCircle, { backgroundColor: themeColors.accent }]}><Text style={styles.numberText}>3</Text></View>
          <Text style={[styles.instructionText, { color: themeColors.text }]}>Tap on <Text style={{ fontWeight: 'bold' }}>Personal Voice</Text></Text>
        </View>
        <View style={styles.instructionItem}>
          <View style={[styles.numberCircle, { backgroundColor: themeColors.accent }]}><Text style={styles.numberText}>4</Text></View>
          <Text style={[styles.instructionText, { color: themeColors.text }]}>Follow the prompts to <Text style={{ fontWeight: 'bold' }}>Create a Personal Voice</Text></Text>
        </View>
      </View>

      <Text style={[styles.noteText, { color: themeColors.textSecondary }]}>
        Note: It takes some time for your phone to process the voice once training is complete. Come back here once it says "Ready."
      </Text>

      <TouchableOpacity 
        style={[styles.primaryBtn, { backgroundColor: themeColors.accent, marginTop: spacing.xl }]}
        onPress={() => setStep(3)}
      >
        <Text style={styles.primaryBtnText}>I've Set It Up</Text>
        <ChevronRight size={20} color="white" />
      </TouchableOpacity>
    </ScrollView>
  );

  const renderStep3 = () => (
    <View style={styles.stepContainer}>
      <Volume2 size={40} color={themeColors.accent} style={{ marginBottom: spacing.xl }} />
      <Text style={[styles.stepTitle, { color: themeColors.text }]}>Select Your Voice</Text>
      <Text style={[styles.stepDescription, { color: themeColors.textSecondary }]}>
        If your Personal Voice is ready, it should appear in the list below.
      </Text>

      {loadingVoices ? (
        <ActivityIndicator size="large" color={themeColors.accent} style={{ marginVertical: spacing.xxl }} />
      ) : (
        <ScrollView style={styles.voiceList}>
          {voices.map((v: any) => (
            <TouchableOpacity 
              key={v.identifier}
              style={[
                styles.voiceItem, 
                { backgroundColor: themeColors.surface, borderColor: selectedVoice === v.identifier ? themeColors.accent : themeColors.border }
              ]}
              onPress={() => setSelectedVoice(v.identifier)}
            >
              <View style={{ flex: 1 }}>
                <Text style={[styles.voiceName, { color: themeColors.text }]}>{v.name}</Text>
                <Text style={[styles.voiceLang, { color: themeColors.textSecondary }]}>{v.language} • {v.quality}</Text>
              </View>
              <TouchableOpacity onPress={() => handleTestVoice(v.identifier)} style={styles.playBtn}>
                <Play size={18} color={themeColors.accent} />
              </TouchableOpacity>
              {selectedVoice === v.identifier && <CheckCircle2 size={20} color={themeColors.accent} />}
            </TouchableOpacity>
          ))}
          {voices.length === 0 && (
            <Text style={[styles.emptyText, { color: themeColors.textSecondary }]}>No voices found. Make sure you have English voices enabled.</Text>
          )}
        </ScrollView>
      )}

      <TouchableOpacity 
        style={[styles.primaryBtn, { backgroundColor: themeColors.accent, opacity: selectedVoice ? 1 : 0.5 }]}
        disabled={!selectedVoice}
        onPress={handleFinish}
      >
        <Text style={styles.primaryBtnText}>Finish Setup</Text>
        <CheckCircle2 size={20} color="white" />
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
      <Stack.Screen options={{ title: 'Personal Voice Setup' }} />
      
      <View style={styles.content}>
        <View style={styles.stepIndicator}>
          {[1, 2, 3].map((i) => (
            <View 
              key={i} 
              style={[
                styles.stepDot, 
                { backgroundColor: step === i ? themeColors.accent : themeColors.border, width: step === i ? 32 : 12 }
              ]} 
            />
          ))}
        </View>

        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: spacing.xl,
  },
  stepIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: spacing.xxl,
  },
  stepDot: {
    height: 6,
    borderRadius: 3,
  },
  stepContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollStep: {
    paddingBottom: spacing.xxl,
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(74, 124, 89, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xxl,
  },
  stepTitle: {
    ...typography.headingLG,
    fontFamily: 'Lora_600SemiBold',
    fontSize: 24,
    marginBottom: spacing.md,
  },
  stepDescription: {
    ...typography.body,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: spacing.xxl,
  },
  infoBox: {
    flexDirection: 'row',
    padding: spacing.lg,
    borderRadius: 16,
    gap: 12,
    marginBottom: spacing.xxl,
  },
  infoText: {
    ...typography.caption,
    fontSize: 13,
    flex: 1,
  },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    padding: spacing.lg,
    borderRadius: 16,
    gap: 12,
  },
  primaryBtnText: {
    color: 'white',
    fontFamily: 'DMSans_600SemiBold',
    fontSize: 18,
  },
  instructionList: {
    width: '100%',
    gap: spacing.lg,
    marginBottom: spacing.xl,
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  numberCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  numberText: {
    color: 'white',
    fontSize: 14,
    fontFamily: 'DMSans_600SemiBold',
  },
  instructionText: {
    ...typography.body,
    fontSize: 16,
  },
  noteText: {
    ...typography.caption,
    textAlign: 'center',
    fontStyle: 'italic',
    paddingHorizontal: spacing.lg,
  },
  voiceList: {
    width: '100%',
    flex: 1,
    marginVertical: spacing.lg,
  },
  voiceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: spacing.sm,
    gap: 12,
  },
  voiceName: {
    fontFamily: 'DMSans_600SemiBold',
    fontSize: 15,
  },
  voiceLang: {
    fontSize: 12,
    opacity: 0.7,
  },
  playBtn: {
    padding: 8,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 40,
    ...typography.caption,
  }
});
