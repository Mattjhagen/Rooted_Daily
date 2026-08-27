import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { CheckCircle, Circle, BookOpen } from 'lucide-react-native';

interface PlanCardProps {
  title: string;
  subtitle: string;
  progress: number; // 0 to 1
  isCompleted: boolean;
  onPress?: () => void;
  onCheck?: () => void;
  onReaderPress?: () => void;
  themeColors: any;
}

export const PlanCard: React.FC<PlanCardProps> = ({ 
  title, 
  subtitle, 
  progress, 
  isCompleted, 
  onPress, 
  onCheck,
  onReaderPress,
  themeColors 
}) => {
  return (
    <Pressable 
      style={({ pressed, focused }) => [
        styles.container, 
        { 
          backgroundColor: themeColors.surface, 
          borderColor: focused ? themeColors.accent : themeColors.border,
          borderWidth: focused ? 2 : 1,
          opacity: isCompleted ? 0.7 : (pressed ? 0.8 : 1)
        }
      ]}
      onPress={onPress}
    >
      <View style={styles.content}>
        <View style={styles.textContainer}>
          <Text style={[styles.title, { color: themeColors.text }]}>{title}</Text>
          <Text style={[styles.subtitle, { color: themeColors.textSecondary }]}>{subtitle}</Text>
        </View>
        <View style={styles.actions}>
          <Pressable 
            onPress={onReaderPress} 
            style={({ pressed, focused }) => [
              styles.actionBtn, 
              { marginRight: spacing.sm },
              pressed && { opacity: 0.7 },
              focused && { opacity: 0.8, backgroundColor: themeColors.border, borderRadius: 8 }
            ]}
          >
            <BookOpen size={20} color={themeColors.accent} />
          </Pressable>
          <Pressable 
            onPress={onCheck} 
            style={({ pressed, focused }) => [
              styles.actionBtn,
              pressed && { opacity: 0.7 },
              focused && { opacity: 0.8, backgroundColor: themeColors.border, borderRadius: 8 }
            ]}
          >
            {isCompleted ? (
              <CheckCircle size={24} color={colors.accent} fill={colors.accentLight} />
            ) : (
              <Circle size={24} color={themeColors.border} />
            )}
          </Pressable>
        </View>
      </View>
      
      <View style={styles.progressTrack}>
        <View 
          style={[
            styles.progressFill, 
            { 
              width: `${progress * 100}%`,
              backgroundColor: isCompleted ? colors.accent : themeColors.accent
            }
          ]} 
        />
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: spacing.md,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: spacing.md,
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  textContainer: {
    flex: 1,
    marginRight: spacing.sm,
  },
  title: {
    ...typography.headingMD,
    marginBottom: 2,
  },
  subtitle: {
    ...typography.caption,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionBtn: {
    padding: spacing.xs,
  },
  progressTrack: {
    height: 4,
    backgroundColor: colors.surface,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
});
