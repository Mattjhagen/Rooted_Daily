import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  TextInput, 
  useColorScheme, 
  ScrollView,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, Shield, Lock, Calculator as CalcIcon, CheckCircle2 } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { colors } from '../../src/theme/colors';
import { typography } from '../../src/theme/typography';
import { spacing } from '../../src/theme/spacing';
import { useStealthStore } from '../../src/features/stealth/stealthStore';

export default function StealthSetupScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const themeColors = isDark ? colors.dark : colors;

  const { setMode, setPin, mode, pin: storedPin } = useStealthStore();
  
  const [step, setStep] = useState(mode === 'NORMAL_MODE' ? 1 : 4);
  const [pin, setLocalPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');

  const handleStart = () => setStep(2);

  const handlePinSubmit = () => {
    if (pin.length < 4 || pin.length > 6) {
      Alert.alert('Invalid PIN', 'Please choose a 4 to 6 digit code.');
      return;
    }
    setStep(3);
  };

  const handleConfirmSubmit = () => {
    if (pin !== confirmPin) {
      Alert.alert('Error', 'Those codes don\'t match. Please try again.');
      setConfirmPin('');
      return;
    }
    setStep(4);
  };

  const handleActivate = () => {
    setPin(pin);
    setMode('CALCULATOR_MODE');
    Alert.alert(
      'Stealth Mode Active',
      'Your app is now disguised. To open your Bible, type your PIN followed by the = key in the calculator.',
      [{ text: 'Got it', onPress: () => router.replace('/(tabs)') }]
    );
  };

  const handleDisable = () => {
    Alert.alert(
      'Disable Stealth Mode?',
      'This will restore the normal app icon and remove the calculator disguise.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Disable', 
          style: 'destructive',
          onPress: () => {
            setMode('NORMAL_MODE');
            setPin(null);
            router.back();
          } 
        }
      ]
    );
  };

  const renderStep1 = () => (
    <View style={styles.stepContainer}>
      <Shield size={64} color={themeColors.accent} style={styles.heroIcon} />
      <Text style={[styles.headline, { color: themeColors.text }]}>Keep your Bible private</Text>
      <Text style={[styles.body, { color: themeColors.textSecondary }]}>
        Stealth Mode disguises this app as a calculator on your home screen and in your app list. Only you will know what's inside.
      </Text>
      
      <View style={styles.featureList}>
        <View style={styles.featureItem}>
          <CalcIcon size={20} color={themeColors.accent} />
          <Text style={[styles.featureText, { color: themeColors.text }]}>App icon changes to a calculator</Text>
        </View>
        <View style={styles.featureItem}>
          <CalcIcon size={20} color={themeColors.accent} />
          <Text style={[styles.featureText, { color: themeColors.text }]}>Opens as a fully working calculator</Text>
        </View>
        <View style={styles.featureItem}>
          <Lock size={20} color={themeColors.accent} />
          <Text style={[styles.featureText, { color: themeColors.text }]}>Entering your secret code unlocks your Bible</Text>
        </View>
      </View>

      <TouchableOpacity 
        style={[styles.primaryBtn, { backgroundColor: themeColors.accent }]}
        onPress={handleStart}
      >
        <Text style={styles.primaryBtnText}>Set up stealth mode</Text>
      </TouchableOpacity>
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContainer}>
      <Text style={[styles.headline, { color: themeColors.text }]}>Create your secret code</Text>
      <Text style={[styles.body, { color: themeColors.textSecondary }]}>
        Choose a 4 to 6 digit code. You'll enter this followed by the = key to open your Bible.
      </Text>
      
      <View style={styles.inputWrapper}>
        <TextInput
          style={[styles.input, { color: themeColors.text, borderBottomColor: themeColors.accent }]}
          placeholder="Enter code"
          placeholderTextColor={themeColors.textSecondary + '80'}
          keyboardType="number-pad"
          secureTextEntry
          maxLength={6}
          value={pin}
          onChangeText={setLocalPin}
          autoFocus
        />
        <Text style={[styles.subtext, { color: themeColors.textSecondary }]}>
          Avoid using obvious numbers like 1234 or your birth year.
        </Text>
      </View>

      <TouchableOpacity 
        style={[styles.primaryBtn, { backgroundColor: pin.length >= 4 ? themeColors.accent : themeColors.border }]}
        disabled={pin.length < 4}
        onPress={handlePinSubmit}
      >
        <Text style={styles.primaryBtnText}>Continue</Text>
      </TouchableOpacity>
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.stepContainer}>
      <Text style={[styles.headline, { color: themeColors.text }]}>Enter your code again</Text>
      <Text style={[styles.body, { color: themeColors.textSecondary }]}>
        Confirm your code to make sure you have it right.
      </Text>
      
      <View style={styles.inputWrapper}>
        <TextInput
          style={[styles.input, { color: themeColors.text, borderBottomColor: themeColors.accent }]}
          placeholder="Re-enter code"
          placeholderTextColor={themeColors.textSecondary + '80'}
          keyboardType="number-pad"
          secureTextEntry
          maxLength={6}
          value={confirmPin}
          onChangeText={setConfirmPin}
          autoFocus
        />
      </View>

      <TouchableOpacity 
        style={[styles.primaryBtn, { backgroundColor: confirmPin === pin ? themeColors.accent : themeColors.border }]}
        disabled={confirmPin !== pin}
        onPress={handleConfirmSubmit}
      >
        <Text style={styles.primaryBtnText}>Confirm</Text>
      </TouchableOpacity>
    </View>
  );

  const renderStep4 = () => (
    <View style={styles.stepContainer}>
      <CheckCircle2 size={64} color={themeColors.accent} style={styles.heroIcon} />
      <Text style={[styles.headline, { color: themeColors.text }]}>Ready to activate</Text>
      <Text style={[styles.body, { color: themeColors.textSecondary }]}>
        Here's what will change when you turn this on:
      </Text>
      
      <View style={[styles.summaryCard, { backgroundColor: themeColors.surface, borderColor: themeColors.border }]}>
        <Text style={[styles.summaryItem, { color: themeColors.text }]}>• App icon becomes a calculator</Text>
        <Text style={[styles.summaryItem, { color: themeColors.text }]}>• Opens as a calculator by default</Text>
        <Text style={[styles.summaryItem, { color: themeColors.text }]}>• To open Bible: type {pin || storedPin} then =</Text>
        <Text style={[styles.summaryItem, { color: themeColors.text }]}>• To lock: tap shield icon or lock screen</Text>
      </View>

      {mode === 'NORMAL_MODE' ? (
        <TouchableOpacity 
          style={[styles.primaryBtn, { backgroundColor: themeColors.accent }]}
          onPress={handleActivate}
        >
          <Text style={styles.primaryBtnText}>Activate stealth mode</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity 
          style={[styles.primaryBtn, { backgroundColor: themeColors.danger }]}
          onPress={handleDisable}
        >
          <Text style={styles.primaryBtnText}>Disable stealth mode</Text>
        </TouchableOpacity>
      )}
      
      <TouchableOpacity onPress={() => router.back()} style={styles.cancelLink}>
        <Text style={{ color: themeColors.textSecondary }}>Cancel</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ChevronLeft size={24} color={themeColors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: themeColors.text }]}>Stealth Mode</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
        {step === 4 && renderStep4()}
      </ScrollView>
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
    flexGrow: 1,
    padding: spacing.xl,
  },
  stepContainer: {
    alignItems: 'center',
    paddingTop: spacing.xxl,
  },
  heroIcon: {
    marginBottom: spacing.xl,
  },
  headline: {
    ...typography.headingLG,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  body: {
    ...typography.body,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: spacing.xxl,
  },
  featureList: {
    width: '100%',
    marginBottom: spacing.xxxl,
    gap: spacing.md,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: 'rgba(0,0,0,0.02)',
    padding: spacing.md,
    borderRadius: 12,
  },
  featureText: {
    ...typography.body,
    fontSize: 15,
  },
  primaryBtn: {
    width: '100%',
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.xl,
  },
  primaryBtnText: {
    color: 'white',
    fontFamily: 'DMSans_700Bold',
    fontSize: 18,
  },
  inputWrapper: {
    width: '100%',
    alignItems: 'center',
    marginBottom: spacing.xxxl,
  },
  input: {
    width: '80%',
    fontSize: 32,
    textAlign: 'center',
    borderBottomWidth: 2,
    paddingVertical: spacing.md,
    fontFamily: 'DMSans_700Bold',
    letterSpacing: 8,
  },
  subtext: {
    ...typography.caption,
    marginTop: spacing.md,
    textAlign: 'center',
  },
  summaryCard: {
    width: '100%',
    padding: spacing.xl,
    borderRadius: 20,
    borderWidth: 1,
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  summaryItem: {
    ...typography.body,
    fontSize: 15,
  },
  cancelLink: {
    marginTop: spacing.xl,
    padding: spacing.md,
  }
});
