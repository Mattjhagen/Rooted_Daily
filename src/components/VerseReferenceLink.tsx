// src/components/VerseReferenceLink.tsx

import React from 'react';
import { Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '../theme/colors';

interface VerseReferenceLinkProps {
  reference: string;
}

export const VerseReferenceLink: React.FC<VerseReferenceLinkProps> = ({ reference }) => {
  const router = useRouter();

  const handlePress = () => {
    router.push(`/verse/${encodeURIComponent(reference)}`);
  };

  return (
    <Text
      style={styles.link}
      onPress={handlePress}
    >
      {reference}
    </Text>
  );
};

const styles = StyleSheet.create({
  link: {
    color: colors.accent,
    textDecorationLine: 'underline',
    fontFamily: 'DMSans_600SemiBold',
  },
});
