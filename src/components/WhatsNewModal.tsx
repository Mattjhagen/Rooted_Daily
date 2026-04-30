import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, useColorScheme, ScrollView, Platform } from 'react-native';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing } from '../theme/spacing';
import { usePersistenceStore } from '../features/persistence/persistenceStore';
import { MessageSquare, Users, ShieldCheck, UserCircle, Zap } from 'lucide-react-native';

const CURRENT_VERSION = '0.0.9';

export const WhatsNewModal = () => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const themeColors = isDark ? colors.dark : colors;

  const lastSeenVersion = usePersistenceStore(state => state.lastSeenVersion);
  const setLastSeenVersion = usePersistenceStore(state => state.setLastSeenVersion);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // If lastSeenVersion is null, it's a first install or first update after tracking
    if (lastSeenVersion !== CURRENT_VERSION) {
      // Small delay to let the app settle
      const timer = setTimeout(() => setVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, [lastSeenVersion]);

  const handleClose = () => {
    setLastSeenVersion(CURRENT_VERSION);
    setVisible(false);
  };

  const features = [
    {
      title: 'Use Your Own Voice',
      description: 'Clone your voice on ElevenLabs and hear Scripture in your own voice.',
      icon: <Zap size={24} color={colors.gold} />
    },
    {
      title: 'Heirloom Insights',
      description: 'Look for the glowing ✦ markers to discover deep theological study notes.',
      icon: <Users size={24} color={themeColors.accent} />
    },
    {
      title: 'Real-time Sync',
      description: 'Your journal and legacy notes now sync instantly across web and mobile.',
      icon: <ShieldCheck size={24} color={themeColors.accent} />
    }
  ];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <View style={[styles.content, { backgroundColor: themeColors.surface }]}>
          <View style={styles.header}>
            <View style={[styles.sparkleBox, { backgroundColor: colors.gold + '22' }]}>
              <Zap size={32} color={colors.gold} />
            </View>
            <Text style={[styles.title, { color: themeColors.text }]}>What's New</Text>
            <Text style={[styles.subtitle, { color: themeColors.textSecondary }]}>
              Version {CURRENT_VERSION} brings major community updates!
            </Text>
          </View>

          <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
            {features.map((f, i) => (
              <View key={i} style={styles.featureRow}>
                <View style={[styles.iconBox, { backgroundColor: themeColors.accent + '22' }]}>
                  {f.icon}
                </View>
                <View style={styles.featureText}>
                  <Text style={[styles.featureTitle, { color: themeColors.text }]}>{f.title}</Text>
                  <Text style={[styles.featureDesc, { color: themeColors.textSecondary }]}>{f.description}</Text>
                </View>
              </View>
            ))}
          </ScrollView>

          <TouchableOpacity 
            style={[styles.doneBtn, { backgroundColor: themeColors.accent }]}
            onPress={handleClose}
          >
            <Text style={styles.doneBtnText}>Explore New Features</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  content: {
    borderRadius: 32,
    padding: spacing.xl,
    maxHeight: '85%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  sparkleBox: {
    width: 64,
    height: 64,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  title: {
    ...typography.headingLG,
    fontSize: 28,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.body,
    textAlign: 'center',
    marginTop: spacing.xs,
    fontSize: 15,
  },
  list: {
    marginBottom: spacing.xl,
  },
  featureRow: {
    flexDirection: 'row',
    marginBottom: spacing.xl,
    gap: spacing.md,
  },
  iconBox: {
    width: 52,
    height: 52,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    fontFamily: 'DMSans_600SemiBold',
    fontSize: 18,
    marginBottom: 4,
  },
  featureDesc: {
    ...typography.caption,
    fontSize: 14,
    lineHeight: 22,
  },
  doneBtn: {
    height: 60,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  doneBtnText: {
    color: 'white',
    fontFamily: 'DMSans_600SemiBold',
    fontSize: 17,
  }
});
