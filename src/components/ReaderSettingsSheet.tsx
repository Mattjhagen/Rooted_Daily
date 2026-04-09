import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Pressable, useColorScheme } from 'react-native';
import { useReaderSettings, ReaderTheme, ReaderFont } from '../features/reader/readerSettingsStore';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { X, Minus, Plus } from 'lucide-react-native';

interface ReaderSettingsSheetProps {
  visible: boolean;
  onClose: () => void;
}

export const ReaderSettingsSheet: React.FC<ReaderSettingsSheetProps> = ({ visible, onClose }) => {
  const { theme, fontSize, fontFamily, setTheme, setFontSize, setFontFamily } = useReaderSettings();
  
  const themeOptions: { id: ReaderTheme; label: string; color: string; textColor: string }[] = [
    { id: 'parchment', label: 'Parchment', color: '#FAF8F4', textColor: '#1C1917' },
    { id: 'white', label: 'White', color: '#FFFFFF', textColor: '#000000' },
    { id: 'black', label: 'Black', color: '#000000', textColor: '#F0EDE8' },
  ];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={[styles.sheet, { backgroundColor: theme === 'black' ? '#1A1A1A' : '#FFFFFF' }]}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: theme === 'black' ? '#FFFFFF' : '#000000' }]}>Appearance</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={24} color={theme === 'black' ? '#FFFFFF' : '#000000'} />
            </TouchableOpacity>
          </View>

          {/* Theme Selection */}
          <View style={styles.section}>
            <Text style={[styles.sectionLabel, { color: theme === 'black' ? '#888' : '#666' }]}>THEME</Text>
            <View style={styles.themeRow}>
              {themeOptions.map((opt) => (
                <TouchableOpacity
                  key={opt.id}
                  style={[
                    styles.themeBtn,
                    { backgroundColor: opt.color, borderColor: theme === opt.id ? colors.accent : (theme === 'black' ? '#333' : '#EEE') }
                  ]}
                  onPress={() => setTheme(opt.id)}
                >
                  <Text style={[styles.themeText, { color: opt.textColor }]}>Ag</Text>
                  <Text style={[styles.themeLabel, { color: theme === 'black' ? '#888' : '#666' }]}>{opt.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Font Size */}
          <View style={styles.section}>
            <Text style={[styles.sectionLabel, { color: theme === 'black' ? '#888' : '#666' }]}>TEXT SIZE</Text>
            <View style={[styles.sizeRow, { backgroundColor: theme === 'black' ? '#222' : '#F5F5F5' }]}>
              <TouchableOpacity
                onPress={() => setFontSize(Math.max(14, fontSize - 1))}
                style={styles.sizeBtn}
              >
                <Minus size={20} color={theme === 'black' ? '#FFF' : '#000'} />
              </TouchableOpacity>
              <Text style={[styles.sizeText, { color: theme === 'black' ? '#FFF' : '#000' }]}>{fontSize}</Text>
              <TouchableOpacity
                onPress={() => setFontSize(Math.min(32, fontSize + 1))}
                style={styles.sizeBtn}
              >
                <Plus size={20} color={theme === 'black' ? '#FFF' : '#000'} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Font Family */}
          <View style={styles.section}>
            <Text style={[styles.sectionLabel, { color: theme === 'black' ? '#888' : '#666' }]}>FONTS</Text>
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
                      backgroundColor: theme === 'black' ? '#222' : '#F5F5F5', 
                      borderColor: fontFamily === f.id ? colors.accent : 'transparent' 
                    }
                  ]}
                  onPress={() => setFontFamily(f.id as any)}
                >
                  <Text style={[styles.fontBtnText, { fontFamily: f.font, color: theme === 'black' ? '#FFF' : '#000' }]} numberOfLines={1}>
                    {f.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={{ height: spacing.xxl }} />
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
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: spacing.xl,
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
});
