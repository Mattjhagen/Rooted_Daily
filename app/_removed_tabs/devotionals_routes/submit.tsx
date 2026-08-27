// app/_removed_tabs/devotionals_routes/submit.tsx

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
import { colors } from '../../../src/theme/colors';
import { typography } from '../../../src/theme/typography';
import { spacing } from '../../../src/theme/spacing';
import { VERSE_REF_REGEX } from '../../../src/features/bible/bibleParser';
import { getVerse } from '../../../src/features/bible/bibleService';
import { submitDevotional } from '../../../src/features/devotionals/devotionalService';
import { useToast } from '../../../src/context/ToastContext';

type Step = 1 | 2 | 'success';

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

  const canMoveToStep2 = 
    orgName.trim() !== '' && 
    isValidEmail(contactEmail) && 
    authorName.trim() !== '' && 
    title.trim() !== '' && 
    isValidVerse(verseRef);

  const canSubmit = body.length >= 100 && body.length <= 3000;

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
        {[1, 2].map((i) => (
          <View 
            key={i} 
            style={[
              styles.stepDot, 
              { backgroundColor: step === i ? themeColors.accent : themeColors.border, width: step === i ? 40 : 24 }
            ]} 
          />
        ))}
        <Text style={[styles.stepText, { color: themeColors.textSecondary }]}>Step {step} of 2</Text>
      </View>
    );
  };

  const renderStep1 = () => (
    <View style={styles.formContainer}>
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: themeColors.text }]}>General Info</Text>
        <Text style={[styles.sectionSubtitle, { color: themeColors.textSecondary }]}>About you and your organization.</Text>
      </View>
      
      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: themeColors.textSecondary }]}>Organization & Author*</Text>
        <View style={styles.row}>
          <TextInput
            style={[styles.input, { flex: 1, backgroundColor: themeColors.surface, borderColor: themeColors.border, color: themeColors.text, marginRight: spacing.sm }]}
            placeholder="Org Name"
            placeholderTextColor={themeColors.textSecondary + '80'}
            value={orgName}
            onChangeText={setOrgName}
          />
          <TextInput
            style={[styles.input, { flex: 1, backgroundColor: themeColors.surface, borderColor: themeColors.border, color: themeColors.text }]}
            placeholder="Author Name"
            placeholderTextColor={themeColors.textSecondary + '80'}
            value={authorName}
            onChangeText={setAuthorName}
          />
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: themeColors.textSecondary }]}>Contact Email*</Text>
        <TextInput
          style={[styles.input, { backgroundColor: themeColors.surface, borderColor: themeColors.border, color: themeColors.text }]}
          placeholder="e.g. contact@church.org"
          placeholderTextColor={themeColors.textSecondary + '80'}
          keyboardType="email-address"
          autoCapitalize="none"
          value={contactEmail}
          onChangeText={setContactEmail}
        />
      </View>

      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: themeColors.text }]}>Devotional Details</Text>
      </View>

      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: themeColors.textSecondary }]}>Title & Verse*</Text>
        <TextInput
          style={[styles.input, { backgroundColor: themeColors.surface, borderColor: themeColors.border, color: themeColors.text, marginBottom: spacing.sm }]}
          placeholder="Devotional Title (e.g. Grace Abounds)"
          placeholderTextColor={themeColors.textSecondary + '80'}
          value={title}
          onChangeText={setTitle}
        />
        <TextInput
          style={[styles.input, { backgroundColor: themeColors.surface, borderColor: themeColors.border, color: themeColors.text }]}
          placeholder="Verse Reference (e.g. John 3:16)"
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

      <TouchableOpacity 
        style={[styles.row, { paddingVertical: spacing.sm }]}
        onPress={() => setIsScheduled(!isScheduled)}
      >
        <View>
          <Text style={[styles.label, { color: themeColors.text }]}>Schedule Release?</Text>
          <Text style={[styles.caption, { color: themeColors.textSecondary }]}>{isScheduled ? scheduledFor.toDateString() : 'Publish as soon as approved'}</Text>
        </View>
        <Switch 
          value={isScheduled} 
          onValueChange={setIsScheduled} 
          trackColor={{ false: themeColors.border, true: themeColors.accent }}
        />
      </TouchableOpacity>

      {isScheduled && (
        <DateTimePicker
          value={scheduledFor}
          mode="date"
          display="default"
          onChange={(e, date) => {
            setShowDatePicker(false);
            if (date) setScheduledFor(date);
          }}
        />
      )}
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.formContainer}>
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: themeColors.text }]}>Write Reflection</Text>
      </View>
      
      <View style={[styles.guidelines, { backgroundColor: themeColors.surfaceAlt }]}>
        <AlertCircle size={16} color={themeColors.textSecondary} />
        <Text style={[styles.guidelineText, { color: themeColors.textSecondary }]}>
          Keep it scripture-centered. Minimum 100 characters.
        </Text>
      </View>

      <View style={styles.inputGroup}>
        <View style={styles.labelRow}>
          <Text style={[styles.label, { color: themeColors.textSecondary }]}>Devotional Body*</Text>
          <Text style={[styles.counter, { color: body.length < 100 ? colors.danger : themeColors.textSecondary }]}>
            {body.length}/3000
          </Text>
        </View>
        <TextInput
          style={[styles.textArea, { backgroundColor: themeColors.surface, borderColor: themeColors.border, color: themeColors.text }]}
          placeholder="Share your reflection through the Word..."
          placeholderTextColor={themeColors.textSecondary + '80'}
          multiline
          numberOfLines={12}
          textAlignVertical="top"
          value={body}
          onChangeText={setBody}
          autoFocus
        />
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
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]} edges={['top', 'bottom']}>
      <Stack.Screen options={{ 
        title: 'Submit Devotional',
        headerShown: step !== 'success',
        headerBackVisible: step === 1,
      }} />

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined} 
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {renderStepIndicator()}
          
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 'success' && renderSuccess()}
        </ScrollView>

        {step !== 'success' && (
          <View style={[styles.footer, { borderTopColor: themeColors.border, backgroundColor: themeColors.surface }]}>
            {step === 2 ? (
              <TouchableOpacity 
                style={[styles.navBtn, styles.backBtn]} 
                onPress={() => setStep(1)}
              >
                <ChevronLeft size={20} color={themeColors.text} />
                <Text style={[styles.navBtnText, { color: themeColors.text }]}>Back</Text>
              </TouchableOpacity>
            ) : <View style={styles.navBtn} />}

            {step === 1 ? (
              <TouchableOpacity 
                style={[styles.navBtn, styles.nextBtn, { opacity: canMoveToStep2 ? 1 : 0.5 }]} 
                onPress={() => setStep(2)}
                disabled={!canMoveToStep2}
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
  sectionHeader: {
    marginBottom: spacing.md,
  },
  caption: {
    ...typography.caption,
    marginTop: spacing.xs,
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
