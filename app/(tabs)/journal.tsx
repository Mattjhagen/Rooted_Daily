// app/(tabs)/journal.tsx

import React from 'react';
import { View, Text, StyleSheet, FlatList, useColorScheme, TouchableOpacity, SafeAreaView } from 'react-native';
import { colors } from '../../src/theme/colors';
import { typography } from '../../src/theme/typography';
import { spacing } from '../../src/theme/spacing';
import { useJournalStore, JournalEntry } from '../../src/features/journal/journalStore';
import { Edit3, Heart } from 'lucide-react-native';

export default function JournalScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const themeColors = isDark ? colors.dark : colors;

  const { entries, toggleFavorite } = useJournalStore();

  const renderItem = ({ item }: { item: JournalEntry }) => (
    <TouchableOpacity style={[styles.item, { backgroundColor: themeColors.surface, borderColor: themeColors.border }]}>
      <View style={styles.itemHeader}>
        <Text style={[styles.itemRef, { color: themeColors.accent }]}>{item.verseRef}</Text>
        <TouchableOpacity onPress={() => toggleFavorite(item.id)}>
          <Heart size={20} color={item.isFavorite ? colors.danger : themeColors.textSecondary} fill={item.isFavorite ? colors.danger : 'transparent'} />
        </TouchableOpacity>
      </View>
      <Text style={[styles.itemText, { color: themeColors.text }]} numberOfLines={2}>
        {item.verseText}
      </Text>
      <Text style={[styles.itemNote, { color: themeColors.textSecondary }]} numberOfLines={3}>
        {item.note}
      </Text>
      <View style={styles.itemFooter}>
        <Text style={[styles.itemDate, { color: themeColors.textSecondary }]}>{item.date}</Text>
        <View style={[styles.typeBadge, { backgroundColor: item.type === 'prayer' ? themeColors.goldLight : themeColors.accentLight }]}>
          <Text style={[styles.typeText, { color: item.type === 'prayer' ? themeColors.gold : themeColors.accent }]}>
            {item.type}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: themeColors.text }]}>My Journal</Text>
      </View>

      {entries.length === 0 ? (
        <View style={styles.emptyState}>
          <Edit3 size={48} color={themeColors.border} />
          <Text style={[styles.emptyText, { color: themeColors.textSecondary }]}>
            Your reflections and prayers will appear here. Start a chat about a verse to save a note!
          </Text>
        </View>
      ) : (
        <FlatList
          data={entries}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ListFooterComponent={
            <View style={styles.disclaimerContainer}>
              <Text style={[styles.disclaimerText, { color: themeColors.textSecondary }]}>
                AI responses are for reflection purposes only. They do not constitute theological instruction or replace the guidance of a pastor or church community.
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: spacing.lg,
  },
  title: {
    fontFamily: 'Lora_600SemiBold',
    fontSize: 28,
  },
  listContent: {
    padding: spacing.lg,
    paddingTop: 0,
  },
  item: {
    borderRadius: 16,
    padding: spacing.md,
    borderWidth: 1,
    marginBottom: spacing.md,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  itemRef: {
    fontFamily: 'DMSans_600SemiBold',
    fontSize: 16,
  },
  itemText: {
    ...typography.scriptureMD,
    marginBottom: spacing.sm,
  },
  itemNote: {
    ...typography.body,
    marginBottom: spacing.md,
  },
  itemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemDate: {
    ...typography.caption,
  },
  typeBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: 4,
  },
  typeText: {
    fontFamily: 'DMSans_600SemiBold',
    fontSize: 11,
    textTransform: 'capitalize',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  emptyText: {
    ...typography.body,
    textAlign: 'center',
    marginTop: spacing.md,
  },
  disclaimerContainer: {
    padding: spacing.lg,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.xxl,
    opacity: 0.6,
  },
  disclaimerText: {
    ...typography.caption,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
