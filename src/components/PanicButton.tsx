import React from 'react';
import { TouchableOpacity, StyleSheet, useColorScheme } from 'react-native';
import { Shield } from 'lucide-react-native';
import { useStealthStore } from '../features/stealth/stealthStore';
import { colors } from '../theme/colors';

export const PanicButton: React.FC = () => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const themeColors = isDark ? colors.dark : colors;
  
  const { mode, resetToCalculator } = useStealthStore();

  if (mode !== 'BIBLE_MODE') return null;

  return (
    <TouchableOpacity 
      style={[styles.container, { backgroundColor: themeColors.surface, borderColor: themeColors.border }]}
      onPress={resetToCalculator}
      activeOpacity={0.7}
    >
      <Shield size={20} color={themeColors.textSecondary} opacity={0.3} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 100, // Above tab bar if any
    right: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
    // Minimal shadow to be discreet
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
});
