// app/devotionals/submit.tsx

import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  KeyboardAvoidingView, 
  Platform,
  Switch,
  ActivityIndicator,
  useColorScheme 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Stack } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import { ChevronRight, ChevronLeft, CheckCircle2, AlertCircle } from 'lucide-react-native';
import { colors } from '../../src/theme/colors';
import { typography } from '../../src/theme/typography';
import { spacing } from '../../src/theme/spacing';
import { VERSE_REF_REGEX } from '../../src/features/bible/bibleParser';
import { getVerse } from '../../src/features/bible/bibleService';
import { submitDevotional } from '../../src/features/devotionals/devotionalService';
import { useToast } from '../../src/context/ToastContext';

type Step = 1 | 2 | 3 | 'success';

export default function SubmitDevotionalScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const themeColors = isDark ? colors.dark : colors;
  const { showToast } = useToast();

  const [step, setStep] = useState<Step>(1);
  const [loading, setLoading] = useState(false);

  // Form State
  const [orgName, setOrgName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  
  const [authorName, setAuthorName] = useState('');
  const [authorTitle, setAuthorTitle] = useState('');
  const [title, setTitle] = useState('');
  const [verseRef, setVerseRef] = useState('');
  const [theme, setTheme] = useState('');
  const [isScheduled, setIsScheduled] = useState(false);
  const [scheduledFor, setScheduledFor] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [body, setBody] = useState('');
  const [versePreview, setVersePreview] = useState<string | null>(null);

  // Validation
  const isValidEmail = (email: string) => /\S+@\S+\.\S+/.test(email);
  const isValidVerse = (ref: string) => {
    VERSE_REF_REGEX.lastIndex = 0;
    return VERSE_REF_REGEX.test(ref);
  };

  useEffect(() => {
    async function previewVerse() {
      if (isValidVerse(verseRef)) {
        const match = verseRef.match(/(.*)\s(\d+):(\d+)/);
        if (match) {
          const [_, book, chapter, verse] = match;
          const v = await getVerse(book, parseInt(chapter), parseInt(verse));
          if (v) setVersePreview(v.text);
          else setVersePreview(null);
        }
      } else {
        setVersePreview(null);
      }
    }
    previewVerse();
  }, [verseRef]);

  const canMoveToStep2 = orgName.trim() !== '' && isValidEmail(contactEmail);
  const canMoveToStep3 = authorName.trim() !== '' && title.trim() !== '' && isValidVerse(verseRef);
  const canSubmit = body.length >= 200 && body.length <= 2000;

  const handleSubmit = async () => {
    try {
      setLoading(true);
      await submitDevotional({
        orgName,
        contactEmail,
        websiteUrl,
        authorName,
        authorTitle,
        title,
        body,
        verseRef,
        theme: theme || undefined,
        scheduledFor: isScheduled ? scheduledFor.toISOString().split('T')[0] : undefined,
      });
      setStep('success');
    } catch (err) {
      showToast({ message: 'Submission failed. Please try again.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const renderStepIndicator = () => {
    if (step === 'success') return null;
    return (
      <View style={styles.stepIndicator}>
        {[1, 2, 3].map((i) => (
          <View 
            key={i} 
            style={[
              styles.stepDot, 
              { backgroundColor: step === i ? themeColors.accent : themeColors.border }
            ]} 
          />
        ))}
        <Text style={[styles.stepText, { color: themeColors.textSecondary }]}>Step {step} of 3</Text>
      </View>
    );
  };

  const renderStep1 = () => (
    <View style={styles.formContainer}>
      <Text style={[styles.sectionTitle, { color: themeColors.text }]}>Your Organization</Text>
      <Text style={[styles.sectionSubtitle, { color: themeColors.textSecondary }]}>Tell us about your church or organization.</Text>
      
      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: themeColors.textSecondary }]}>Organization Name*</Text>
        <TextInput
          style={[styles.input, { backgroundColor: themeColors.surface, borderColor: themeColors.border, color: themeColors.text }]}
          placeholder="e.g. Grace Fellowship"
          placeholderTextColor={themeColors.textSecondary + '80'}
          value={orgName}
          onChangeText={setOrgName}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: themeColors.textSecondary }]}>Contact Email*</Text>
        <TextInput
          style={[styles.input, { backgroundColor: themeColors.surface, borderColor: themeColors.border, color: themeColors.text }]}
          placeholder="e.g. contact@grace.org"
          placeholderTextColor={themeColors.textSecondary + '80'}
          keyboardType="email-address"
          autoCapitalize="none"
          value={contactEmail}
          onChangeText={setContactEmail}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: themeColors.textSecondary }]}>Website URL (Optional)</Text>
        <TextInput
          style={[styles.input, { backgroundColor: themeColors.surface, borderColor: themeColors.border, color: themeColors.text }]}
          placeholder="e.g. https://grace.org"
          placeholderTextColor={themeColors.textSecondary + '80'}
          keyboardType="url"
          autoCapitalize="none"
          value={websiteUrl}
          onChangeText={setWebsiteUrl}
        />
      </View>
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.formContainer}>
      <Text style={[styles.sectionTitle, { color: themeColors.text }]}>About the Devotional</Text>
      
      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: themeColors.textSecondary }]}>Author Name*</Text>
        <TextInput
          style={[styles.input, { backgroundColor: themeColors.surface, borderColor: themeColors.border, color: themeColors.text }]}
          placeholder="e.g. John Smith"
          placeholderTextColor={themeColors.textSecondary + '80'}
          value={authorName}
          onChangeText={setAuthorName}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: themeColors.textSecondary }]}>Author Title (Optional)</Text>
        <TextInput
          style={[styles.input, { backgroundColor: themeColors.surface, borderColor: themeColors.border, color: themeColors.text }]}
          placeholder="e.g. Senior Pastor"
          placeholderTextColor={themeColors.textSecondary + '80'}
          value={authorTitle}
          onChangeText={setAuthorTitle}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: themeColors.textSecondary }]}>Devotional Title*</Text>
        <TextInput
          style={[styles.input, { backgroundColor: themeColors.surface, borderColor: themeColors.border, color: themeColors.text }]}
          placeholder="e.g. Finding Peace in the Storm"
          placeholderTextColor={themeColors.textSecondary + '80'}
          value={title}
          onChangeText={setTitle}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: themeColors.textSecondary }]}>Bible Verse Reference*</Text>
        <TextInput
          style={[styles.input, { backgroundColor: themeColors.surface, borderColor: themeColors.border, color: themeColors.text }]}
          placeholder="e.g. John 3:16"
          placeholderTextColor={themeColors.textSecondary + '80'}
          value={verseRef}
          onChangeText={setVerseRef}
          autoCorrect={false}
        />
        {versePreview ? (
          <View style={[styles.previewBox, { backgroundColor: themeColors.accentLight }]}>
            <Text style={[styles.previewText, { color: themeColors.accent }]} numberOfLines={2}>"{versePreview}"</Text>
          </View>
        ) : verseRef.length > 3 && !isValidVerse(verseRef) ? (
          <Text style={[styles.errorText, { color: colors.danger }]}>Invalid format: Use "John 3:16"</Text>
        ) : null}
      </View>

      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: themeColors.textSecondary }]}>Theme (Optional)</Text>
        <TextInput
          style={[styles.input, { backgroundColor: themeColors.surface, borderColor: themeColors.border, color: themeColors.text }]}
          placeholder="e.g. Grace, Love, Hope"
          placeholderTextColor={themeColors.textSecondary + '80'}
          value={theme}
          onChangeText={setTheme}
        />
      </View>

      <View style={styles.row}>
        <Text style={[styles.label, { color: themeColors.text }]}>Schedule for a specific date?</Text>
        <Switch 
          value={isScheduled} 
          onValueChange={setIsScheduled} 
          trackColor={{ false: themeColors.border, true: themeColors.accent }}
        />
      </View>

      {isScheduled && (
        <TouchableOpacity 
          style={[styles.input, { backgroundColor: themeColors.surface, borderColor: themeColors.border, justifyContent: 'center' }]}
          onPress={() => setShowDatePicker(true)}
        >
          <Text style={{ color: themeColors.text }}>{scheduledFor.toDateString()}</Text>
        </TouchableOpacity>
      )}

      {showDatePicker && (
        <DateTimePicker
          value={scheduledFor}
          mode="date"
          onChange={(e, date) => {
            setShowDatePicker(false);
            if (date) setScheduledFor(date);
          }}
        />
      )}
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.formContainer}>
      <Text style={[styles.sectionTitle, { color: themeColors.text }]}>Write the Devotional</Text>
      
      <View style={[styles.guidelines, { backgroundColor: themeColors.surfaceAlt }]}>
        <AlertCircle size={16} color={themeColors.textSecondary} />
        <Text style={[styles.guidelineText, { color: themeColors.textSecondary }]}>
          Keep it scripture-centered. Avoid brand promotion. Do not sell products.
        </Text>
      </View>

      <View style={styles.inputGroup}>
        <View style={styles.labelRow}>
          <Text style={[styles.label, { color: themeColors.textSecondary }]}>Full Devotional Body*</Text>
          <Text style={[styles.counter, { color: body.length < 200 ? colors.danger : themeColors.textSecondary }]}>
            {body.length}/2000
          </Text>
        </View>
        <TextInput
          style={[styles.textArea, { backgroundColor: themeColors.surface, borderColor: themeColors.border, color: themeColors.text }]}
          placeholder="Share your reflection through the Word..."
          placeholderTextColor={themeColors.textSecondary + '80'}
          multiline
          numberOfLines={10}
          textAlignVertical="top"
          value={body}
          onChangeText={setBody}
        />
        <Text style={[styles.hint, { color: themeColors.textSecondary }]}>Minimum 200 characters required.</Text>
      </View>
    </View>
  );

  const renderSuccess = () => (
    <View style={styles.successContainer}>
      <CheckCircle2 size={80} color={themeColors.accent} />
      <Text style={[styles.successTitle, { color: themeColors.text }]}>Submission Received!</Text>
      <Text style={[styles.successText, { color: themeColors.textSecondary }]}>
        Your devotional has been submitted and is pending review. You'll hear back within 48 hours.
      </Text>
      <TouchableOpacity 
        style={[styles.finishBtn, { backgroundColor: themeColors.accent }]}
        onPress={() => router.replace('/(tabs)/devotionals')}
      >
        <Text style={[styles.finishBtnText, { color: themeColors.white }]}>Back to Devotionals</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]} edges={['top']}>
      <Stack.Screen options={{ 
        title: 'Submit Devotional',
        headerShown: step !== 'success',
        headerBackVisible: step === 1,
      }} />

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {renderStepIndicator()}
          
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
          {step === 'success' && renderSuccess()}
        </ScrollView>

        {step !== 'success' && (
          <View style={[styles.footer, { borderTopColor: themeColors.border, backgroundColor: themeColors.surface }]}>
            {step > 1 ? (
              <TouchableOpacity 
                style={[styles.navBtn, styles.backBtn]} 
                onPress={() => setStep((step - 1) as Step)}
              >
                <ChevronLeft size={20} color={themeColors.text} />
                <Text style={[styles.navBtnText, { color: themeColors.text }]}>Back</Text>
              </TouchableOpacity>
            ) : <View style={styles.navBtn} />}

            {step < 3 ? (
              <TouchableOpacity 
                style={[styles.navBtn, styles.nextBtn, { opacity: (step === 1 ? canMoveToStep2 : canMoveToStep3) ? 1 : 0.5 }]} 
                onPress={() => setStep((step + 1) as Step)}
                disabled={!(step === 1 ? canMoveToStep2 : canMoveToStep3)}
              >
                <Text style={[styles.navBtnText, { color: themeColors.accent }]}>Next</Text>
                <ChevronRight size={20} color={themeColors.accent} />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity 
                style={[styles.submitBtn, { backgroundColor: themeColors.accent, opacity: canSubmit && !loading ? 1 : 0.5 }]} 
                onPress={handleSubmit}
                disabled={!canSubmit || loading}
              >
                {loading ? (
                  <ActivityIndicator color={themeColors.white} />
                ) : (
                  <Text style={[styles.submitBtnText, { color: themeColors.white }]}>Submit for Review</Text>
                )}
              </TouchableOpacity>
            )}
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: 100,
  },
  stepIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xl,
    gap: 8,
  },
  stepDot: {
    width: 24,
    height: 4,
    borderRadius: 2,
  },
  stepText: {
    ...typography.caption,
    marginLeft: spacing.sm,
    fontFamily: 'DMSans_600SemiBold',
  },
  formContainer: {
    gap: spacing.lg,
  },
  sectionTitle: {
    ...typography.headingLG,
    fontFamily: 'Lora_600SemiBold',
  },
  sectionSubtitle: {
    ...typography.body,
    marginTop: -spacing.md,
    fontSize: 14,
  },
  inputGroup: {
    gap: spacing.xs,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    ...typography.chip,
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    height: 52,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    ...typography.body,
  },
  textArea: {
    height: 180,
    borderRadius: 12,
    borderWidth: 1,
    padding: spacing.md,
    ...typography.body,
    textAlignVertical: 'top',
  },
  counter: {
    ...typography.caption,
    fontSize: 11,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    paddingBottom: Platform.OS === 'ios' ? spacing.xl : spacing.lg,
    borderTopWidth: 1,
  },
  navBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 80,
  },
  backBtn: {
    gap: 4,
  },
  nextBtn: {
    justifyContent: 'flex-end',
    gap: 4,
  },
  navBtnText: {
    fontFamily: 'DMSans_600SemiBold',
    fontSize: 16,
  },
  submitBtn: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: 12,
    minWidth: 160,
    alignItems: 'center',
  },
  submitBtnText: {
    fontFamily: 'DMSans_600SemiBold',
    fontSize: 16,
  },
  previewBox: {
    marginTop: 4,
    padding: spacing.sm,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: colors.accent,
  },
  previewText: {
    ...typography.caption,
    fontSize: 12,
    fontStyle: 'italic',
  },
  errorText: {
    ...typography.caption,
    fontSize: 12,
    marginTop: 2,
  },
  guidelines: {
    flexDirection: 'row',
    padding: spacing.md,
    borderRadius: 12,
    gap: 10,
    alignItems: 'center',
  },
  guidelineText: {
    ...typography.caption,
    fontSize: 12,
    flex: 1,
  },
  hint: {
    ...typography.caption,
    fontSize: 11,
    opacity: 0.7,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  successContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
    gap: spacing.lg,
  },
  successTitle: {
    ...typography.headingLG,
    fontFamily: 'Lora_600SemiBold',
  },
  successText: {
    ...typography.body,
    textAlign: 'center',
    paddingHorizontal: spacing.xxl,
  },
  finishBtn: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: 12,
    marginTop: spacing.lg,
  },
  finishBtnText: {
    fontFamily: 'DMSans_600SemiBold',
    fontSize: 16,
  },
});
