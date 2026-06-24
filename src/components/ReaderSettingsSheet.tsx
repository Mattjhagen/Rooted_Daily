import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Pressable, useColorScheme, TextInput, ScrollView, Linking, Platform } from 'react-native';
import { useReaderSettings, ReaderTheme, ReaderFont } from '../features/reader/readerSettingsStore';
import { useAudioStore } from '../features/audio/audioStore';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { X, Minus, Plus, RefreshCw, Settings } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface ReaderSettingsSheetProps {
  visible: boolean;
  onClose: () => void;
}

export const ReaderSettingsSheet: React.FC<ReaderSettingsSheetProps> = ({ visible, onClose }) => {
  const { theme, fontSize, fontFamily, selectedVersion, setTheme, setFontSize, setFontFamily, setSelectedVersion } = useReaderSettings();

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

            {/* Translation Selection */}
            <View style={styles.section}>
              <Text style={[styles.sectionLabel, { color: subtextColor }]}>TRANSLATION</Text>
              <View style={[styles.sizeRow, { backgroundColor: inputBg }]}>
                <TouchableOpacity
                  style={[styles.translationBtn, selectedVersion === 'WEB' && { backgroundColor: colors.accent }]}
                  onPress={() => setSelectedVersion('WEB')}
                >
                  <Text style={[styles.translationText, selectedVersion === 'WEB' ? { color: 'white' } : { color: textColor }]}>World English Bible (WEB)</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.translationBtn, selectedVersion === 'RT' && { backgroundColor: colors.accent }]}
                  onPress={() => setSelectedVersion('RT')}
                >
                  <Text style={[styles.translationText, selectedVersion === 'RT' ? { color: 'white' } : { color: textColor }]}>Rooted Translation (RT)</Text>
                </TouchableOpacity>
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
  translationBtn: {
    flex: 1,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: spacing.xs,
  },
  translationText: {
    fontFamily: 'DMSans_600SemiBold',
    fontSize: 14,
    textAlign: 'center',
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
