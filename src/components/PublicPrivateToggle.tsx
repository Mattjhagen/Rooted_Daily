// src/components/PublicPrivateToggle.tsx

import React from 'react';
import { TouchableOpacity, StyleSheet, Text, View } from 'react-native';
import { Lock, Users } from 'lucide-react-native';
import { useReaderSettings } from '../features/reader/readerSettingsStore';
import { colors } from '../theme/colors';

export const PublicPrivateToggle = () => {
  const { isPublicMode, setPublicMode } = useReaderSettings();

  return (
    <TouchableOpacity 
      style={[
        styles.container, 
        { backgroundColor: isPublicMode ? colors.accent : colors.surface }
      ]} 
      onPress={() => setPublicMode(!isPublicMode)}
      activeOpacity={0.8}
    >
      <View style={styles.content}>
        {isPublicMode ? (
          <Users size={18} color="white" />
        ) : (
          <Lock size={18} color={colors.textSecondary} />
        )}
        <Text style={[
          styles.text, 
          { color: isPublicMode ? 'white' : colors.textSecondary }
        ]}>
          {isPublicMode ? 'Public' : 'Private'}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  text: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 14,
  },
});
