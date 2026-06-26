import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, FlatList, useColorScheme, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { X, Check } from 'lucide-react-native';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing } from '../theme/spacing';
import { getBibleVersions } from '../services/youversion/YouVersionManager';
import { useYouVersionStore } from '../features/bible/youVersionStore';

interface BibleVersionSelectorProps {
  isVisible: boolean;
  onClose: () => void;
}

export const BibleVersionSelector: React.FC<BibleVersionSelectorProps> = ({ isVisible, onClose }) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const themeColors = isDark ? colors.dark : colors;

  const { selectedVersionId, setSelectedVersion } = useYouVersionStore();
  const [versions, setVersions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isVisible && versions.length === 0) {
      loadVersions();
    }
  }, [isVisible]);

  const loadVersions = async () => {
    setLoading(true);
    const data = await getBibleVersions();
    setVersions(data);
    setLoading(false);
  };

  const handleSelect = (item: any) => {
    setSelectedVersion(item.id, item.abbreviation);
    onClose();
  };

  const renderItem = ({ item }: { item: any }) => {
    const isSelected = item.id === selectedVersionId;
    return (
      <TouchableOpacity 
        style={[styles.versionRow, { borderBottomColor: themeColors.border }]} 
        onPress={() => handleSelect(item)}
      >
        <View style={styles.versionInfo}>
          <Text style={[styles.versionAbbreviation, { color: themeColors.text }]}>{item.abbreviation}</Text>
          <Text style={[styles.versionTitle, { color: themeColors.textSecondary }]} numberOfLines={1}>{item.title}</Text>
        </View>
        {isSelected && <Check size={20} color={themeColors.accent} />}
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]} edges={['top', 'bottom']}>
        <View style={[styles.header, { borderBottomColor: themeColors.border }]}>
          <Text style={[styles.title, { color: themeColors.text }]}>Select Bible Version</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <X size={24} color={themeColors.text} />
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={themeColors.accent} />
          </View>
        ) : (
          <FlatList
            data={versions}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderItem}
            contentContainerStyle={styles.listContent}
          />
        )}
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
  },
  title: {
    fontFamily: 'DMSans_600SemiBold',
    fontSize: 18,
  },
  closeBtn: {
    position: 'absolute',
    right: spacing.lg,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingBottom: spacing.xxl,
  },
  versionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
  },
  versionInfo: {
    flex: 1,
    paddingRight: spacing.md,
  },
  versionAbbreviation: {
    fontFamily: 'DMSans_600SemiBold',
    fontSize: 16,
    marginBottom: 4,
  },
  versionTitle: {
    ...typography.caption,
  },
});
