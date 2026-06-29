import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, categoryColors } from '../theme/colors';
import { CATEGORY_ICONS } from '../data/templates';
import { computeProgress } from '../utils/helpers';
import ProgressBar from './ProgressBar';

// A "packing compartment" card representing one category inside a trip.
export default function CategoryCard({ category, items, onPress }) {
  const list = Array.isArray(items) ? items : [];
  const { total, packed, percentage } = computeProgress(list);
  const accent = categoryColors[category] ?? colors.teal;
  const icon = CATEGORY_ICONS[category] ?? '📦';

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && { opacity: 0.92 }]}
    >
      <View style={[styles.accentBar, { backgroundColor: accent }]} />
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={[styles.iconWrap, { backgroundColor: `${accent}22` }]}>
            <Text style={styles.icon}>{icon}</Text>
          </View>
          <View style={styles.titleWrap}>
            <Text style={styles.title} numberOfLines={1}>
              {category}
            </Text>
            <Text style={styles.count}>
              {packed} / {total} packed
            </Text>
          </View>
          <Text style={styles.chevron}>›</Text>
        </View>
        <View style={styles.progressRow}>
          <ProgressBar percentage={percentage} color={accent} height={6} />
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.divider,
    marginBottom: 12,
    overflow: 'hidden',
  },
  accentBar: {
    width: 6,
  },
  content: {
    flex: 1,
    padding: 14,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconWrap: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  icon: {
    fontSize: 20,
  },
  titleWrap: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.navy,
  },
  count: {
    marginTop: 2,
    fontSize: 13,
    color: colors.navySoft,
  },
  chevron: {
    fontSize: 26,
    color: colors.muted,
    marginLeft: 8,
  },
  progressRow: {
    marginTop: 12,
  },
});
