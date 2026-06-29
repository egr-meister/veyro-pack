import React, { useCallback, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';

import { colors } from '../theme/colors';
import { CATEGORIES, CATEGORY_ICONS } from '../data/templates';
import { getTrip, updateTrip } from '../storage/storage';
import { makeId, nowIso, getMovedToBuyItems } from '../utils/helpers';
import EmptyState from '../components/EmptyState';
import Chip from '../components/Chip';
import { PrimaryButton } from '../components/Buttons';

export default function BuyBeforeTripScreen({ navigation, route }) {
  const tripId = route?.params?.tripId ?? null;
  const [trip, setTrip] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const [newItem, setNewItem] = useState('');
  const [linkedCategory, setLinkedCategory] = useState(null);

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

  async function persist(nextTrip) {
    setTrip(nextTrip);
    await updateTrip(nextTrip);
  }

  const allItems = Array.isArray(trip?.items) ? trip.items : [];
  const buyItems = Array.isArray(trip?.buyItems) ? trip.buyItems : [];
  const movedItems = getMovedToBuyItems(allItems);

  // ----- Manual buy items -----
  function addBuyItem() {
    const title = newItem.trim();
    if (title.length === 0 || !trip) return;
    const item = {
      id: makeId('buy'),
      title,
      bought: false,
      linkedCategory: linkedCategory,
      createdAt: nowIso(),
    };
    setNewItem('');
    persist({ ...trip, buyItems: [...buyItems, item] });
  }

  function toggleBought(id) {
    if (!trip) return;
    const next = buyItems.map((b) =>
      b?.id === id ? { ...b, bought: !b.bought } : b
    );
    persist({ ...trip, buyItems: next });
  }

  function deleteBuyItem(id) {
    if (!trip) return;
    const next = buyItems.filter((b) => b?.id !== id);
    persist({ ...trip, buyItems: next });
  }

  // Move a bought item into the packing checklist as a packed-ready item.
  function moveToPacking(buyItem) {
    if (!trip || !buyItem?.id) return;
    const category = CATEGORIES.includes(buyItem.linkedCategory)
      ? buyItem.linkedCategory
      : 'Clothes';
    const packingItem = {
      id: makeId('item'),
      title: buyItem.title ?? 'Item',
      category,
      packed: false,
      buyBeforeTrip: false,
      custom: true,
      createdAt: nowIso(),
    };
    const nextBuy = buyItems.filter((b) => b?.id !== buyItem.id);
    persist({ ...trip, items: [...allItems, packingItem], buyItems: nextBuy });
  }

  function buyItemMenu(item) {
    const options = [];
    if (item.bought) {
      options.push({
        text: 'Move to packing list',
        onPress: () => moveToPacking(item),
      });
    }
    options.push({
      text: item.bought ? 'Mark as not bought' : 'Mark as bought',
      onPress: () => toggleBought(item.id),
    });
    options.push({
      text: 'Delete',
      style: 'destructive',
      onPress: () => deleteBuyItem(item.id),
    });
    options.push({ text: 'Cancel', style: 'cancel' });
    Alert.alert(item.title ?? 'Item', 'Choose an action', options);
  }

  // ----- Items moved from packing list -----
  function restoreToPacking(id) {
    if (!trip) return;
    const next = allItems.map((i) =>
      i?.id === id ? { ...i, buyBeforeTrip: false } : i
    );
    persist({ ...trip, items: next });
  }

  if (loaded && !trip) {
    return (
      <SafeAreaView style={styles.safe} edges={['bottom']}>
        <EmptyState
          icon="🧭"
          title="Trip not found"
          subtitle="This trip may have been deleted."
        />
      </SafeAreaView>
    );
  }

  const nothingHere = movedItems.length === 0 && buyItems.length === 0;

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={90}
      >
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.intro}>
            Keep a small list of things to buy or pick up before you leave.
          </Text>

          {nothingHere && loaded ? (
            <EmptyState
              icon="🛒"
              title="Nothing to buy yet"
              subtitle="Add items below, or move things here from your packing list."
            />
          ) : null}

          {/* Items moved from packing list */}
          {movedItems.length > 0 ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>From your packing list</Text>
              {movedItems.map((item) => (
                <View key={item.id} style={styles.row}>
                  <View style={styles.rowTextWrap}>
                    <Text style={styles.rowTitle} numberOfLines={2}>
                      {item.title ?? 'Item'}
                    </Text>
                    <Text style={styles.rowMeta}>
                      {CATEGORY_ICONS[item.category] ?? '📦'} {item.category}
                    </Text>
                  </View>
                  <Pressable
                    onPress={() => restoreToPacking(item.id)}
                    style={({ pressed }) => [
                      styles.restoreBtn,
                      pressed && { opacity: 0.7 },
                    ]}
                  >
                    <Text style={styles.restoreText}>Restore</Text>
                  </Pressable>
                </View>
              ))}
            </View>
          ) : null}

          {/* Manual shopping list */}
          {buyItems.length > 0 ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Shopping list</Text>
              {buyItems.map((item) => {
                const bought = item.bought === true;
                return (
                  <View key={item.id} style={styles.row}>
                    <Pressable
                      onPress={() => toggleBought(item.id)}
                      style={styles.rowLeft}
                      hitSlop={6}
                    >
                      <View style={[styles.checkbox, bought && styles.checkboxOn]}>
                        {bought ? <Text style={styles.check}>✓</Text> : null}
                      </View>
                      <View style={styles.rowTextWrap}>
                        <Text
                          style={[styles.rowTitle, bought && styles.rowTitleDone]}
                          numberOfLines={2}
                        >
                          {item.title ?? 'Item'}
                        </Text>
                        {item.linkedCategory ? (
                          <Text style={styles.rowMeta}>
                            {CATEGORY_ICONS[item.linkedCategory] ?? '📦'}{' '}
                            {item.linkedCategory}
                          </Text>
                        ) : null}
                      </View>
                    </Pressable>
                    <Pressable
                      onPress={() => buyItemMenu(item)}
                      hitSlop={10}
                      style={({ pressed }) => [
                        styles.more,
                        pressed && { opacity: 0.5 },
                      ]}
                    >
                      <Text style={styles.moreGlyph}>⋯</Text>
                    </Pressable>
                  </View>
                );
              })}
              <Text style={styles.tip}>
                Tip: mark an item as bought, then move it into your packing list.
              </Text>
            </View>
          ) : null}
        </ScrollView>

        {/* Add buy item bar */}
        <View style={styles.addArea}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.catRow}
          >
            <Chip
              label="Any"
              selected={linkedCategory === null}
              onPress={() => setLinkedCategory(null)}
            />
            {CATEGORIES.map((cat) => (
              <Chip
                key={cat}
                label={cat}
                icon={CATEGORY_ICONS[cat]}
                selected={linkedCategory === cat}
                onPress={() => setLinkedCategory(cat)}
              />
            ))}
          </ScrollView>
          <View style={styles.addBar}>
            <TextInput
              style={styles.addInput}
              value={newItem}
              onChangeText={setNewItem}
              placeholder="Add something to buy"
              placeholderTextColor={colors.muted}
              returnKeyType="done"
              onSubmitEditing={addBuyItem}
            />
            <PrimaryButton label="Add" onPress={addBuyItem} style={styles.addBtn} />
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex: {
    flex: 1,
  },
  content: {
    padding: 18,
    paddingBottom: 20,
  },
  intro: {
    fontSize: 14,
    color: colors.navySoft,
    lineHeight: 20,
    marginBottom: 16,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.navySoft,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.divider,
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginBottom: 10,
  },
  rowLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 26,
    height: 26,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: colors.skyBlueDark,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    backgroundColor: colors.white,
  },
  checkboxOn: {
    backgroundColor: colors.teal,
    borderColor: colors.teal,
  },
  check: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '900',
    lineHeight: 18,
  },
  rowTextWrap: {
    flex: 1,
  },
  rowTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.navy,
  },
  rowTitleDone: {
    color: colors.muted,
    textDecorationLine: 'line-through',
  },
  rowMeta: {
    marginTop: 2,
    fontSize: 12,
    color: colors.navySoft,
  },
  restoreBtn: {
    backgroundColor: colors.tealSoft,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginLeft: 8,
  },
  restoreText: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.tealDark,
  },
  more: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 6,
  },
  moreGlyph: {
    fontSize: 22,
    color: colors.muted,
    fontWeight: '900',
  },
  tip: {
    marginTop: 2,
    fontSize: 12,
    color: colors.muted,
  },
  addArea: {
    borderTopWidth: 1,
    borderTopColor: colors.divider,
    backgroundColor: colors.background,
    paddingTop: 10,
  },
  catRow: {
    paddingHorizontal: 12,
    paddingBottom: 2,
  },
  addBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    paddingTop: 4,
  },
  addInput: {
    flex: 1,
    backgroundColor: colors.white,
    borderWidth: 1.5,
    borderColor: colors.divider,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: colors.navy,
    marginRight: 10,
  },
  addBtn: {
    minHeight: 48,
    paddingHorizontal: 22,
  },
});
