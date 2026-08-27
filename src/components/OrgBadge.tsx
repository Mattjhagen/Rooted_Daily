// src/components/OrgBadge.tsx

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { CheckCircle2 } from 'lucide-react-native';
import { colors } from '../theme/colors';

interface OrgBadgeProps {
  isVerified: boolean;
  size?: number;
}

export const OrgBadge: React.FC<OrgBadgeProps> = ({ isVerified, size = 14 }) => {
  if (!isVerified) return null;

  return (
    <View style={styles.container}>
      <CheckCircle2 size={size} color={colors.accent} fill={colors.accentLight} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginLeft: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
