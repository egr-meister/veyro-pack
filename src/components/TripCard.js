import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '../theme/colors';
import { TRIP_TYPE_ICONS } from '../data/templates';
import {
  computeProgress,
  formatDate,
  getMovedToBuyItems,
  getPackingItems,
  packingStatusLabel,
} from '../utils/helpers';
import ProgressBar from './ProgressBar';

// Boarding-pass-like trip card for the home board.
export default function TripCard({ trip, onPress }) {
  const safeTrip = trip ?? {};
  const allItems = Array.isArray(safeTrip.items) ? safeTrip.items : [];
  const items = getPackingItems(allItems);
  const buyItems = Array.isArray(safeTrip.buyItems) ? safeTrip.buyItems : [];
  const { total, packed, percentage } = computeProgress(items);
  const buyCount =
    buyItems.filter((b) => b?.bought !== true).length +
    getMovedToBuyItems(allItems).length;
  const icon = TRIP_TYPE_ICONS[safeTrip.type] ?? '🧳';

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && { opacity: 0.92 }]}
    >
      {/* Left stub */}
      <View style={styles.stub}>
        <Text style={styles.stubIcon}>{icon}</Text>
        <Text style={styles.stubType} numberOfLines={1}>
          {safeTrip.type ?? 'Trip'}
        </Text>
      </View>

      {/* Perforation */}
      <View style={styles.perforation} />

      {/* Main body */}
      <View style={styles.body}>
        <View style={styles.topRow}>
          <Text style={styles.name} numberOfLines={1}>
            {safeTrip.name ?? 'Trip'}
          </Text>
          {buyCount > 0 ? (
            <View style={styles.buyBadge}>
              <Text style={styles.buyBadgeText}>🛒 {buyCount}</Text>
            </View>
          ) : null}
        </View>

        {safeTrip.destination ? (
          <Text style={styles.destination} numberOfLines={1}>
            ✈ {safeTrip.destination}
          </Text>
        ) : null}

        <View style={styles.progressRow}>
          <ProgressBar percentage={percentage} />
        </View>

        <View style={styles.metaRow}>
          <Text style={styles.statusText}>{packingStatusLabel(total, packed)}</Text>
          <Text style={styles.percentText}>{percentage}%</Text>
        </View>

        {safeTrip.updatedAt ? (
          <Text style={styles.updated}>Updated {formatDate(safeTrip.updatedAt)}</Text>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.divider,
    marginBottom: 14,
    overflow: 'hidden',
  },
  stub: {
    width: 70,
    backgroundColor: colors.sand,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
  },
  stubIcon: {
    fontSize: 24,
  },
  stubType: {
    marginTop: 6,
    fontSize: 11,
    fontWeight: '700',
    color: colors.navySoft,
  },
  perforation: {
    width: 1,
    backgroundColor: colors.divider,
    borderStyle: 'dashed',
  },
  body: {
    flex: 1,
    padding: 14,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  name: {
    flex: 1,
    fontSize: 17,
    fontWeight: '800',
    color: colors.navy,
    marginRight: 8,
  },
  buyBadge: {
    backgroundColor: colors.tealSoft,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  buyBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.tealDark,
  },
  destination: {
    marginTop: 3,
    fontSize: 13,
    color: colors.navySoft,
  },
  progressRow: {
    marginTop: 12,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.teal,
  },
  percentText: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.navy,
  },
  updated: {
    marginTop: 8,
    fontSize: 11,
    color: colors.muted,
  },
});
