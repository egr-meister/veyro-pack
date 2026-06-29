import React, { useCallback, useState } from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';

import { colors } from '../theme/colors';
import { loadTrips } from '../storage/storage';
import {
  computeProgress,
  getMovedToBuyItems,
  getPackingItems,
  packingStatusLabel,
} from '../utils/helpers';
import { TRIP_TYPE_ICONS } from '../data/templates';
import TripCard from '../components/TripCard';
import EmptyState from '../components/EmptyState';
import SuitcaseMeter from '../components/SuitcaseMeter';
import { IconButton, PrimaryButton } from '../components/Buttons';

export default function HomeScreen({ navigation }) {
  const [trips, setTrips] = useState([]);
  const [loaded, setLoaded] = useState(false);

  const refresh = useCallback(() => {
    let active = true;
    (async () => {
      const list = await loadTrips();
      if (!active) return;
      // Most recently updated first.
      const sorted = [...list].sort((a, b) => {
        const ta = a?.updatedAt ?? '';
        const tb = b?.updatedAt ?? '';
        return tb.localeCompare(ta);
      });
      setTrips(sorted);
      setLoaded(true);
    })();
    return () => {
      active = false;
    };
  }, []);

  useFocusEffect(refresh);

  const nextTrip = trips.length > 0 ? trips[0] : null;
  const restTrips = trips.length > 1 ? trips.slice(1) : [];

  const overall = computeOverall(trips);

  function openTrip(trip) {
    if (!trip?.id) return;
    navigation.navigate('TripDetail', { tripId: trip.id });
  }

  function renderHeader() {
    return (
      <View>
        {/* Top header bar */}
        <View style={styles.topBar}>
          <View style={styles.brandRow}>
            <Text style={styles.brandIcon}>🧳</Text>
            <View>
              <Text style={styles.brand}>Veyro Pack</Text>
              <Text style={styles.brandSub}>Your packing board</Text>
            </View>
          </View>
          <IconButton
            glyph="⚙"
            accessibilityLabel="Settings"
            onPress={() => navigation.navigate('Settings')}
          />
        </View>

        {trips.length > 0 ? (
          <View style={styles.dashboard}>
            <View style={styles.dashLeft}>
              <Text style={styles.dashLabel}>OVERALL PACKING</Text>
              <Text style={styles.dashStatus}>
                {packingStatusLabel(overall.total, overall.packed)}
              </Text>
              <Text style={styles.dashCount}>
                {overall.packed} of {overall.total} items packed
              </Text>
              <Text style={styles.dashTrips}>
                {trips.length} {trips.length === 1 ? 'trip' : 'trips'} planned
              </Text>
            </View>
            <SuitcaseMeter percentage={overall.percentage} size={84} />
          </View>
        ) : null}

        {nextTrip ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Next trip</Text>
            <NextTripCard trip={nextTrip} onPress={() => openTrip(nextTrip)} />
          </View>
        ) : null}

        {restTrips.length > 0 ? (
          <Text style={[styles.sectionTitle, styles.allTitle]}>All trips</Text>
        ) : null}
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <FlatList
        data={restTrips}
        keyExtractor={(item) => item?.id ?? Math.random().toString()}
        renderItem={({ item }) => (
          <TripCard trip={item} onPress={() => openTrip(item)} />
        )}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={
          loaded && trips.length === 0 ? (
            <EmptyState
              icon="🧳"
              title="No trips yet"
              subtitle="Create your first packing checklist."
            >
              <PrimaryButton
                label="Create your first trip"
                onPress={() => navigation.navigate('CreateTrip')}
              />
            </EmptyState>
          ) : null
        }
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      {/* Floating create action */}
      <Pressable
        onPress={() => navigation.navigate('CreateTrip')}
        style={({ pressed }) => [styles.fab, pressed && { opacity: 0.9 }]}
        accessibilityLabel="Create new trip"
      >
        <Text style={styles.fabPlus}>＋</Text>
        <Text style={styles.fabText}>New trip</Text>
      </Pressable>
    </SafeAreaView>
  );
}

// A wider "boarding pass" highlight card for the next trip.
function NextTripCard({ trip, onPress }) {
  const safe = trip ?? {};
  const allItems = Array.isArray(safe.items) ? safe.items : [];
  const items = getPackingItems(allItems);
  const buyItems = Array.isArray(safe.buyItems) ? safe.buyItems : [];
  const { total, packed, percentage } = computeProgress(items);
  const buyCount =
    buyItems.filter((b) => b?.bought !== true).length +
    getMovedToBuyItems(allItems).length;
  const icon = TRIP_TYPE_ICONS[safe.type] ?? '🧳';

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.nextCard, pressed && { opacity: 0.95 }]}
    >
      <View style={styles.nextLeft}>
        <Text style={styles.nextIcon}>{icon}</Text>
      </View>
      <View style={styles.nextBody}>
        <Text style={styles.nextName} numberOfLines={1}>
          {safe.name ?? 'Trip'}
        </Text>
        <Text style={styles.nextMeta} numberOfLines={1}>
          {safe.type ?? 'Weekend'}
          {safe.destination ? `  •  ✈ ${safe.destination}` : ''}
        </Text>
        <View style={styles.nextStrip}>
          {buildStrip(items).map((cell, idx) => (
            <View
              key={idx}
              style={[
                styles.stripCell,
                { backgroundColor: cell ? colors.teal : colors.divider },
              ]}
            />
          ))}
        </View>
        <View style={styles.nextFooter}>
          <Text style={styles.nextStatus}>
            {packingStatusLabel(total, packed)}
          </Text>
          <Text style={styles.nextPct}>{percentage}%</Text>
        </View>
        {buyCount > 0 ? (
          <Text style={styles.nextBuy}>🛒 {buyCount} to buy before trip</Text>
        ) : null}
      </View>
    </Pressable>
  );
}

// Build up to 10 strip cells representing packed/unpacked items.
function buildStrip(items) {
  const list = Array.isArray(items) ? items : [];
  const maxCells = 10;
  if (list.length === 0) return new Array(maxCells).fill(false);
  const cells = list.slice(0, maxCells).map((i) => i?.packed === true);
  while (cells.length < maxCells) cells.push(false);
  return cells;
}

function computeOverall(trips) {
  const list = Array.isArray(trips) ? trips : [];
  let total = 0;
  let packed = 0;
  list.forEach((trip) => {
    const items = getPackingItems(trip?.items);
    total += items.length;
    packed += items.filter((i) => i?.packed === true).length;
  });
  const percentage = total > 0 ? Math.round((packed / total) * 100) : 0;
  return { total, packed, percentage };
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  listContent: {
    paddingHorizontal: 18,
    paddingBottom: 110,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 10,
    paddingBottom: 8,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandIcon: {
    fontSize: 28,
    marginRight: 10,
  },
  brand: {
    fontSize: 22,
    fontWeight: '900',
    color: colors.navy,
  },
  brandSub: {
    fontSize: 12,
    color: colors.muted,
    fontWeight: '600',
  },
  dashboard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.sand,
    borderRadius: 18,
    padding: 18,
    marginTop: 10,
  },
  dashLeft: {
    flex: 1,
    paddingRight: 12,
  },
  dashLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.navySoft,
    letterSpacing: 1,
  },
  dashStatus: {
    marginTop: 4,
    fontSize: 20,
    fontWeight: '900',
    color: colors.navy,
  },
  dashCount: {
    marginTop: 4,
    fontSize: 13,
    color: colors.navySoft,
  },
  dashTrips: {
    marginTop: 2,
    fontSize: 13,
    color: colors.teal,
    fontWeight: '700',
  },
  section: {
    marginTop: 22,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.navySoft,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  allTitle: {
    marginTop: 24,
  },
  nextCard: {
    flexDirection: 'row',
    backgroundColor: colors.navy,
    borderRadius: 18,
    padding: 16,
  },
  nextLeft: {
    width: 56,
    height: 56,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  nextIcon: {
    fontSize: 28,
  },
  nextBody: {
    flex: 1,
  },
  nextName: {
    fontSize: 18,
    fontWeight: '900',
    color: colors.white,
  },
  nextMeta: {
    marginTop: 2,
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
  },
  nextStrip: {
    flexDirection: 'row',
    marginTop: 12,
    marginBottom: 4,
  },
  stripCell: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    marginRight: 4,
  },
  nextFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  nextStatus: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.tealSoft,
  },
  nextPct: {
    fontSize: 16,
    fontWeight: '900',
    color: colors.white,
  },
  nextBuy: {
    marginTop: 8,
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '600',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 24,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.teal,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 28,
    elevation: 4,
    shadowColor: colors.shadow,
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
  },
  fabPlus: {
    color: colors.white,
    fontSize: 20,
    fontWeight: '900',
    marginRight: 8,
  },
  fabText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '800',
  },
});
