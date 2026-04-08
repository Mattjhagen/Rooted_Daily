import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { CheckCircle, Circle } from 'lucide-react-native';

interface PlanCardProps {
  title: string;
  subtitle: string;
  progress: number; // 0 to 1
  isCompleted: boolean;
  onPress?: () => void;
  onCheck?: () => void;
  themeColors: any;
}

export const PlanCard: React.FC<PlanCardProps> = ({ 
  title, 
  subtitle, 
  progress, 
  isCompleted, 
  onPress, 
  onCheck,
  themeColors 
}) => {
  return (
    <TouchableOpacity 
      style={[
        styles.container, 
        { 
          backgroundColor: themeColors.surface, 
          borderColor: themeColors.border,
          opacity: isCompleted ? 0.7 : 1
        }
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.content}>
        <View style={styles.textContainer}>
          <Text style={[styles.title, { color: themeColors.text }]}>{title}</Text>
          <Text style={[styles.subtitle, { color: themeColors.textSecondary }]}>{subtitle}</Text>
        </View>
        <TouchableOpacity onPress={onCheck} style={styles.checkBtn}>
          {isCompleted ? (
            <CheckCircle size={24} color={colors.accent} fill={colors.accentLight} />
          ) : (
            <Circle size={24} color={themeColors.border} />
          )}
        </TouchableOpacity>
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
    </TouchableOpacity>
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
  checkBtn: {
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
