import React from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, ScrollView, useColorScheme } from 'react-native';
import { X, Check } from 'lucide-react-native';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing } from '../theme/spacing';
import { usePersistenceStore } from '../features/persistence/persistenceStore';
import { COMMON_THEMES } from '../features/devotionals/PersonalizedDevotionalService';

interface InterestsModalProps {
  isVisible: boolean;
  onClose: () => void;
  onGenerate: () => void;
}

export const InterestsModal = ({ isVisible, onClose, onGenerate }: InterestsModalProps) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const themeColors = isDark ? colors.dark : colors;
  const { interests, toggleInterest } = usePersistenceStore();

  return (
    <Modal visible={isVisible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={[styles.content, { backgroundColor: themeColors.surface }]}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: themeColors.text }]}>What's on your heart?</Text>
            <TouchableOpacity onPress={onClose}>
              <X color={themeColors.textSecondary} size={24} />
            </TouchableOpacity>
          </View>
          
          <Text style={[styles.subtitle, { color: themeColors.textSecondary }]}>
            Rooted AI will create a personalized devotion based on what you're facing today.
          </Text>

          <ScrollView style={styles.scroll} contentContainerStyle={styles.chipGrid}>
            {COMMON_THEMES.map((theme) => {
              const isSelected = interests.includes(theme.id);
              return (
                <TouchableOpacity
                  key={theme.id}
                  style={[
                    styles.chip,
                    { 
                      backgroundColor: isSelected ? themeColors.accent + '20' : themeColors.border + '30',
                      borderColor: isSelected ? themeColors.accent : 'transparent'
                    }
                  ]}
                  onPress={() => toggleInterest(theme.id)}
                >
                  <Text style={[
                    styles.chipLabel,
                    { color: isSelected ? themeColors.accent : themeColors.textSecondary }
                  ]}>
                    {theme.label}
                  </Text>
                  {isSelected && <Check size={14} color={themeColors.accent} />}
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <TouchableOpacity 
            style={[styles.generateBtn, { backgroundColor: themeColors.accent }]}
            onPress={() => {
              onClose();
              onGenerate();
            }}
          >
            <Text style={styles.generateBtnText}>Create My Devotion</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  content: {
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: spacing.xl,
    paddingBottom: 40,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  title: {
    ...typography.headingMD,
  },
  subtitle: {
    ...typography.caption,
    marginBottom: spacing.lg,
  },
  scroll: {
    marginBottom: spacing.xl,
  },
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
  },
  chipLabel: {
    ...typography.body,
    fontSize: 14,
    fontFamily: 'DMSans_700Bold',
  },
  generateBtn: {
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  generateBtnText: {
    color: '#FFFFFF',
    ...typography.headingSM,
    fontFamily: 'DMSans_700Bold',
  },
});
