// src/components/TutorialModal.tsx

import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, useColorScheme, Dimensions } from 'react-native';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing } from '../theme/spacing';
import { BookOpen, MessageSquare, Award, CheckCircle2, ChevronRight, X } from 'lucide-react-native';

const { width } = Dimensions.get('window');

interface TutorialModalProps {
  isVisible: boolean;
  onClose: () => void;
}

const STEPS = [
  {
    title: 'Welcome to Rooted',
    description: 'A space for daily spiritual growth. We focus on one key verse each day, helping you keep God\'s Word in your heart.',
    icon: <BookOpen size={48} color={colors.accent} />,
  },
  {
    title: 'The Daily Three',
    description: 'Grow in three steps:\n1. READ the verse out loud.\n2. REFLECT by chatting with AI.\n3. DONE - check it off for points!',
    icon: <CheckCircle2 size={48} color={colors.accent} />,
  },
  {
    title: 'Points & Streaks',
    description: 'Earn 10 points every day you finish your devotional. Keep a streak alive to see your spirit (and points) grow!',
    icon: <Award size={48} color={colors.gold} />,
  },
  {
    title: 'Deeper Learning',
    description: 'Want more? Use the Bible tab to read full chapters or follow a Reading Plan to read the Bible in a year.',
    icon: <MessageSquare size={48} color={colors.accent} />,
  }
];

export const TutorialModal: React.FC<TutorialModalProps> = ({ isVisible, onClose }) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const themeColors = isDark ? colors.dark : colors;
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onClose();
    }
  };

  return (
    <Modal
      visible={isVisible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.content, { backgroundColor: themeColors.surface }]}>
          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <X size={24} color={themeColors.textSecondary} />
          </TouchableOpacity>

          <View style={styles.iconContainer}>
            {STEPS[currentStep].icon}
          </View>

          <Text style={[styles.title, { color: themeColors.text }]}>
            {STEPS[currentStep].title}
          </Text>

          <Text style={[styles.description, { color: themeColors.textSecondary }]}>
            {STEPS[currentStep].description}
          </Text>

          <View style={styles.footer}>
            <View style={styles.dots}>
              {STEPS.map((_, i) => (
                <View 
                  key={i} 
                  style={[
                    styles.dot, 
                    { backgroundColor: i === currentStep ? themeColors.accent : themeColors.border }
                  ]} 
                />
              ))}
            </View>

            <TouchableOpacity 
              style={[styles.nextBtn, { backgroundColor: themeColors.accent }]} 
              onPress={handleNext}
            >
              <Text style={styles.nextText}>
                {currentStep === STEPS.length - 1 ? 'Start Growing' : 'Next'}
              </Text>
              {currentStep < STEPS.length - 1 && <ChevronRight size={18} color="white" />}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  content: {
    width: '100%',
    borderRadius: 24,
    padding: spacing.xl,
    alignItems: 'center',
  },
  closeBtn: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    padding: 8,
  },
  iconContainer: {
    marginBottom: spacing.xl,
    padding: 20,
    borderRadius: 30,
    backgroundColor: 'rgba(74, 115, 93, 0.1)',
  },
  title: {
    fontFamily: 'Lora_600SemiBold',
    fontSize: 24,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  description: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: spacing.xxl,
  },
  footer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dots: {
    flexDirection: 'row',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  nextBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: 16,
    gap: 8,
  },
  nextText: {
    color: 'white',
    fontFamily: 'DMSans_600SemiBold',
    fontSize: 16,
  },
});
