import React, { useCallback, useLayoutEffect, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import { colors } from '../theme/colors';
import { deleteTrip, getTrip } from '../storage/storage';
import { CATEGORIES } from '../data/templates';
import {
  computeProgress,
  formatDate,
  getMovedToBuyItems,
  getPackingItems,
  groupByCategory,
  packingStatusLabel,
} from '../utils/helpers';
import SuitcaseMeter from '../components/SuitcaseMeter';
import CategoryCard from '../components/CategoryCard';
import EmptyState from '../components/EmptyState';
import { IconButton, SecondaryButton, TextButton } from '../components/Buttons';

export default function TripDetailScreen({ navigation, route }) {
  const tripId = route?.params?.tripId ?? null;
  const [trip, setTrip] = useState(null);
  const [loaded, setLoaded] = useState(false);

  const refresh = useCallback(() => {
    let active = true;
    (async () => {
      const t = await getTrip(tripId);
      if (!active) return;
      setTrip(t);
      setLoaded(true);
    })();
    return () => {
      active = false;
    };
  }, [tripId]);

  useFocusEffect(refresh);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: trip?.name ?? 'Trip',
      headerRight: () => (
        <IconButton glyph="⋯" accessibilityLabel="Trip options" onPress={openMenu} />
      ),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigation, trip]);

  function openMenu() {
    Alert.alert(trip?.name ?? 'Trip', 'Choose an action', [
      {
        text: 'Duplicate trip',
        onPress: () => {
          if (trip?.id) navigation.navigate('DuplicateTrip', { tripId: trip.id });
        },
      },
      {
        text: 'Delete trip',
        style: 'destructive',
        onPress: confirmDelete,
      },
      { text: 'Cancel', style: 'cancel' },
    ]);
  }

  function confirmDelete() {
    Alert.alert(
      'Delete trip',
      `Delete "${trip?.name ?? 'this trip'}"? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            if (tripId) await deleteTrip(tripId);
            navigation.navigate('Home');
          },
        },
      ]
    );
  }

  if (loaded && !trip) {
    return (
      <View style={styles.center}>
        <EmptyState
          icon="🧭"
          title="Trip not found"
          subtitle="This trip may have been deleted."
        >
          <SecondaryButton
            label="Back to trips"
            onPress={() => navigation.navigate('Home')}
          />
        </EmptyState>
      </View>
    );
  }

  if (!trip) {
    return <View style={styles.center} />;
  }

  const allItems = Array.isArray(trip.items) ? trip.items : [];
  const items = getPackingItems(allItems);
  const movedToBuy = getMovedToBuyItems(allItems);
  const buyItems = Array.isArray(trip.buyItems) ? trip.buyItems : [];
  const { total, packed, percentage } = computeProgress(items);
  const grouped = groupByCategory(items, CATEGORIES);
  const buyRemaining =
    buyItems.filter((b) => b?.bought !== true).length + movedToBuy.length;
  const buyTotal = buyItems.length + movedToBuy.length;
  const allPacked = total > 0 && packed >= total;

  return (
    <ScrollView
      style={styles.flex}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Suitcase interior header */}
      <View style={styles.suitcase}>
        <View style={styles.suitcaseText}>
          <Text style={styles.tripType}>{trip.type ?? 'Weekend'}</Text>
          {trip.destination ? (
            <Text style={styles.tripDest} numberOfLines={1}>
              ✈ {trip.destination}
            </Text>
          ) : null}
          {trip.startDate || trip.endDate ? (
            <Text style={styles.tripDates}>
              {[trip.startDate, trip.endDate].filter(Boolean).join('  →  ')}
            </Text>
          ) : null}
          <Text style={styles.status}>{packingStatusLabel(total, packed)}</Text>
          <Text style={styles.countLine}>
            {packed} of {total} items
          </Text>
        </View>
        <SuitcaseMeter percentage={percentage} size={92} />
      </View>

      {allPacked ? (
        <View style={styles.doneBanner}>
          <Text style={styles.doneTitle}>Your bag is ready.</Text>
          <Text style={styles.doneSub}>Everything is packed for this trip.</Text>
        </View>
      ) : null}

      {/* Side pocket: Buy Before Trip */}
      <Pressable
        onPress={() => navigation.navigate('BuyBeforeTrip', { tripId: trip.id })}
        style={({ pressed }) => [styles.pocket, pressed && { opacity: 0.92 }]}
      >
        <View style={styles.pocketIcon}>
          <Text style={styles.pocketGlyph}>🛒</Text>
        </View>
        <View style={styles.pocketText}>
          <Text style={styles.pocketTitle}>Buy Before Trip</Text>
          <Text style={styles.pocketSub}>
            {buyTotal === 0
              ? 'Add things to pick up before you leave'
              : `${buyRemaining} to buy • ${buyTotal} total`}
          </Text>
        </View>
        <Text style={styles.pocketChevron}>›</Text>
      </Pressable>

      <Text style={styles.sectionTitle}>Packing compartments</Text>

      {grouped.length === 0 ? (
        <EmptyState
          icon="📦"
          title="No items yet"
          subtitle="This trip has no packing items."
        />
      ) : (
        grouped.map((group) => (
          <CategoryCard
            key={group.category}
            category={group.category}
            items={group.items}
            onPress={() =>
              navigation.navigate('Category', {
                tripId: trip.id,
                category: group.category,
              })
            }
          />
        ))
      )}

      <View style={styles.footer}>
        <SecondaryButton
          label="Duplicate this trip"
          onPress={() => navigation.navigate('DuplicateTrip', { tripId: trip.id })}
        />
        <TextButton
          label="Delete trip"
          color={colors.danger}
          onPress={confirmDelete}
          style={styles.deleteBtn}
        />
      </View>

      {trip.updatedAt ? (
        <Text style={styles.updated}>Last updated {formatDate(trip.updatedAt)}</Text>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: colors.background,
  },
  center: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    padding: 18,
    paddingBottom: 40,
  },
  suitcase: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.navy,
    borderRadius: 18,
    padding: 18,
  },
  suitcaseText: {
    flex: 1,
    paddingRight: 12,
  },
  tripType: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.tealSoft,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  tripDest: {
    marginTop: 6,
    fontSize: 15,
    color: colors.white,
    fontWeight: '600',
  },
  tripDates: {
    marginTop: 4,
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
  },
  status: {
    marginTop: 10,
    fontSize: 18,
    fontWeight: '900',
    color: colors.white,
  },
  countLine: {
    marginTop: 2,
    fontSize: 13,
    color: 'rgba(255,255,255,0.75)',
  },
  doneBanner: {
    backgroundColor: colors.tealSoft,
    borderRadius: 14,
    padding: 16,
    marginTop: 14,
  },
  doneTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: colors.tealDark,
  },
  doneSub: {
    marginTop: 2,
    fontSize: 14,
    color: colors.tealDark,
  },
  pocket: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.sand,
    borderRadius: 14,
    padding: 14,
    marginTop: 14,
  },
  pocketIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  pocketGlyph: {
    fontSize: 20,
  },
  pocketText: {
    flex: 1,
  },
  pocketTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.navy,
  },
  pocketSub: {
    marginTop: 2,
    fontSize: 13,
    color: colors.navySoft,
  },
  pocketChevron: {
    fontSize: 26,
    color: colors.muted,
    marginLeft: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.navySoft,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 24,
    marginBottom: 12,
  },
  footer: {
    marginTop: 14,
  },
  deleteBtn: {
    alignSelf: 'center',
    marginTop: 6,
  },
  updated: {
    marginTop: 14,
    fontSize: 12,
    color: colors.muted,
    textAlign: 'center',
  },
});
