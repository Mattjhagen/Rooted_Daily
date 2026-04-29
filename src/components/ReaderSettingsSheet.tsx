import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Pressable, useColorScheme, TextInput, ScrollView, Linking, Platform } from 'react-native';
import { useReaderSettings, ReaderTheme, ReaderFont } from '../features/reader/readerSettingsStore';
import { useAudioStore } from '../features/audio/audioStore';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { X, Minus, Plus } from 'lucide-react-native';
import * as Speech from 'expo-speech';

interface ReaderSettingsSheetProps {
  visible: boolean;
  onClose: () => void;
}

export const ReaderSettingsSheet: React.FC<ReaderSettingsSheetProps> = ({ visible, onClose }) => {
  const { theme, fontSize, fontFamily, customVoiceId, setTheme, setFontSize, setFontFamily, setCustomVoiceId } = useReaderSettings();
  const { preferredVoiceIdentifier, setPreferredVoiceIdentifier } = useAudioStore();
  const [nativeVoices, setNativeVoices] = React.useState<Speech.Voice[]>([]);
  const [voiceSource, setVoiceSource] = React.useState<'ai' | 'device'>(customVoiceId ? 'ai' : 'device');
  
  React.useEffect(() => {
    if (visible) {
      Speech.getVoicesAsync().then(voices => {
        // Filter for English voices for best experience
        const filtered = voices.filter(v => v.language.startsWith('en'));
        setNativeVoices(filtered);
      });
    }
  }, [visible]);

  const openiOSAccessibility = () => {
    Linking.openURL('App-Prefs:root=ACCESSIBILITY');
  };

  const themeOptions: { id: ReaderTheme; label: string; color: string; textColor: string }[] = [
    { id: 'parchment', label: 'Parchment', color: '#FAF8F4', textColor: '#1C1917' },
    { id: 'white', label: 'White', color: '#FFFFFF', textColor: '#000000' },
    { id: 'black', label: 'Black', color: '#000000', textColor: '#F0EDE8' },
  ];

  const isDark = theme === 'black';
  const sheetBg = isDark ? '#1A1A1A' : '#FFFFFF';
  const textColor = isDark ? '#FFFFFF' : '#000000';
  const subtextColor = isDark ? '#888' : '#666';
  const inputBg = isDark ? '#222' : '#F5F5F5';

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={[styles.sheet, { backgroundColor: sheetBg }]}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: textColor }]}>Appearance</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={24} color={textColor} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Theme Selection */}
            <View style={styles.section}>
              <Text style={[styles.sectionLabel, { color: subtextColor }]}>THEME</Text>
              <View style={styles.themeRow}>
                {themeOptions.map((opt) => (
                  <TouchableOpacity
                    key={opt.id}
                    style={[
                      styles.themeBtn,
                      { backgroundColor: opt.color, borderColor: theme === opt.id ? colors.accent : (isDark ? '#333' : '#EEE') }
                    ]}
                    onPress={() => setTheme(opt.id)}
                  >
                    <Text style={[styles.themeText, { color: opt.textColor }]}>Ag</Text>
                    <Text style={[styles.themeLabel, { color: subtextColor }]}>{opt.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Font Size */}
            <View style={styles.section}>
              <Text style={[styles.sectionLabel, { color: subtextColor }]}>TEXT SIZE</Text>
              <View style={[styles.sizeRow, { backgroundColor: inputBg }]}>
                <TouchableOpacity
                  onPress={() => setFontSize(Math.max(14, fontSize - 1))}
                  style={styles.sizeBtn}
                >
                  <Minus size={20} color={textColor} />
                </TouchableOpacity>
                <Text style={[styles.sizeText, { color: textColor }]}>{fontSize}</Text>
                <TouchableOpacity
                  onPress={() => setFontSize(Math.min(32, fontSize + 1))}
                  style={styles.sizeBtn}
                >
                  <Plus size={20} color={textColor} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Font Family */}
            <View style={styles.section}>
              <Text style={[styles.sectionLabel, { color: subtextColor }]}>FONTS</Text>
              <View style={styles.fontGrid}>
                {[
                  { id: 'serif', label: 'Serif', font: 'Lora_600SemiBold' },
                  { id: 'scholarly', label: 'Scholarly', font: 'EBGaramond_600SemiBold' },
                  { id: 'academic', label: 'Academic', font: 'PlayfairDisplay_700Bold' },
                  { id: 'sans', label: 'Sans', font: 'DMSans_500Medium' },
                  { id: 'modern', label: 'Modern', font: 'Inter_600SemiBold' },
                  { id: 'clean', label: 'Clean', font: 'Montserrat_600SemiBold' },
                ].map((f) => (
                  <TouchableOpacity
                    key={f.id}
                    style={[
                      styles.fontGridBtn,
                      { 
                        backgroundColor: inputBg, 
                        borderColor: fontFamily === f.id ? colors.accent : 'transparent' 
                      }
                    ]}
                    onPress={() => setFontFamily(f.id as any)}
                  >
                    <Text style={[styles.fontBtnText, { fontFamily: f.font, color: textColor }]} numberOfLines={1}>
                      {f.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Voice Settings */}
            <View style={styles.section}>
              <Text style={[styles.sectionLabel, { color: subtextColor }]}>VOICE NARRATION</Text>
              
              <View style={styles.tabRow}>
                <TouchableOpacity 
                  onPress={() => setVoiceSource('device')}
                  style={[styles.tabBtn, voiceSource === 'device' && { borderBottomColor: colors.accent }]}
                >
                  <Text style={[styles.tabText, { color: voiceSource === 'device' ? colors.accent : subtextColor }]}>Device Voice</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  onPress={() => setVoiceSource('ai')}
                  style={[styles.tabBtn, voiceSource === 'ai' && { borderBottomColor: colors.accent }]}
                >
                  <Text style={[styles.tabText, { color: voiceSource === 'ai' ? colors.accent : subtextColor }]}>AI Clone</Text>
                </TouchableOpacity>
              </View>

              {voiceSource === 'device' ? (
                <View style={styles.voiceSection}>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.voiceScroll}>
                    {nativeVoices.map(v => (
                      <TouchableOpacity 
                        key={v.identifier}
                        onPress={() => setPreferredVoiceIdentifier(v.identifier)}
                        style={[
                          styles.voiceChip,
                          { backgroundColor: inputBg },
                          preferredVoiceIdentifier === v.identifier && { borderColor: colors.accent, borderWidth: 1.5 }
                        ]}
                      >
                        <Text style={[styles.voiceChipText, { color: textColor }]}>{v.name}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                  
                  {Platform.OS === 'ios' && (
                    <TouchableOpacity onPress={openiOSAccessibility} style={styles.settingsLink}>
                      <Text style={styles.settingsLinkText}>Setup "Personal Voice" in iOS Settings →</Text>
                    </TouchableOpacity>
                  )}
                </View>
              ) : (
                <View style={styles.voiceSection}>
                  <TextInput
                    style={[
                      styles.voiceInput,
                      { 
                        backgroundColor: inputBg,
                        color: textColor,
                        borderColor: customVoiceId ? colors.accent : 'transparent'
                      }
                    ]}
                    placeholder="ElevenLabs Voice ID"
                    placeholderTextColor={isDark ? '#666' : '#999'}
                    value={customVoiceId || ''}
                    onChangeText={setCustomVoiceId}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                  <Text style={[styles.helpText, { color: subtextColor }]}>
                    Enter your cloned voice ID from ElevenLabs to hear Scripture in your own voice.
                  </Text>
                </View>
              )}
            </View>

            <View style={{ height: spacing.xxl * 2 }} />
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: spacing.xl,
    paddingBottom: 0,
    maxHeight: '85%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.headingMD,
  },
  closeBtn: {
    padding: spacing.xs,
  },
  section: {
    marginTop: spacing.xl,
  },
  sectionLabel: {
    ...typography.caption,
    fontSize: 11,
    letterSpacing: 1.5,
    marginBottom: spacing.md,
  },
  themeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  themeBtn: {
    width: '30%',
    height: 80,
    borderRadius: 12,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xs,
  },
  themeText: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  themeLabel: {
    fontSize: 10,
    fontWeight: '600',
  },
  sizeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 12,
    padding: spacing.xs,
  },
  sizeBtn: {
    padding: spacing.md,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 10,
  },
  sizeText: {
    fontSize: 18,
    fontWeight: '600',
  },
  fontGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  fontGridBtn: {
    width: '31%',
    padding: spacing.md,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    marginBottom: spacing.xs,
  },
  fontBtnText: {
    fontSize: 13,
  },
  tabRow: {
    flexDirection: 'row',
    marginBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  tabBtn: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabText: {
    fontFamily: 'DMSans_600SemiBold',
    fontSize: 13,
  },
  voiceSection: {
    marginTop: spacing.sm,
  },
  voiceScroll: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
  },
  voiceChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    marginRight: spacing.sm,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  voiceChipText: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 13,
  },
  voiceInput: {
    padding: spacing.md,
    borderRadius: 12,
    borderWidth: 2,
    fontSize: 14,
    fontFamily: 'DMSans_400Regular',
  },
  helpText: {
    ...typography.caption,
    fontSize: 10,
    marginTop: spacing.xs,
    paddingHorizontal: spacing.xs,
  },
  settingsLink: {
    marginTop: spacing.md,
    paddingVertical: spacing.sm,
  },
  settingsLinkText: {
    color: colors.accent,
    fontFamily: 'DMSans_600SemiBold',
    fontSize: 13,
    textDecorationLine: 'underline',
  },
});
