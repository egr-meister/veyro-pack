import React, { useCallback, useLayoutEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';

import { colors, categoryColors } from '../theme/colors';
import { CATEGORIES, CATEGORY_ICONS } from '../data/templates';
import { getTrip, updateTrip } from '../storage/storage';
import { makeId, nowIso, computeProgress, getPackingItems } from '../utils/helpers';
import ChecklistRow from '../components/ChecklistRow';
import ProgressBar from '../components/ProgressBar';
import EmptyState from '../components/EmptyState';
import { PrimaryButton } from '../components/Buttons';

export default function CategoryScreen({ navigation, route }) {
  const tripId = route?.params?.tripId ?? null;
  const category = CATEGORIES.includes(route?.params?.category)
    ? route.params.category
    : 'Clothes';

  const [trip, setTrip] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const [newItem, setNewItem] = useState('');

  // Edit modal state.
  const [editVisible, setEditVisible] = useState(false);
  const [editId, setEditId] = useState(null);
  const [editText, setEditText] = useState('');

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
    navigation.setOptions({ title: category });
  }, [navigation, category]);

  // Persist a new items array onto the trip and update local state.
  async function persistItems(nextItems) {
    if (!trip) return;
    const updated = { ...trip, items: nextItems };
    setTrip(updated);
    await updateTrip(updated);
  }

  const allItems = Array.isArray(trip?.items) ? trip.items : [];
  const categoryItems = getPackingItems(allItems).filter(
    (i) => i?.category === category
  );
  const { total, packed, percentage } = computeProgress(categoryItems);
  const accent = categoryColors[category] ?? colors.teal;

  function toggleItem(id) {
    const next = allItems.map((i) =>
      i?.id === id ? { ...i, packed: !i.packed } : i
    );
    persistItems(next);
  }

  function addCustomItem() {
    const title = newItem.trim();
    if (title.length === 0) return;
    const item = {
      id: makeId('item'),
      title,
      category,
      packed: false,
      buyBeforeTrip: false,
      custom: true,
      createdAt: nowIso(),
    };
    setNewItem('');
    persistItems([...allItems, item]);
  }

  function moveToBuy(id) {
    const next = allItems.map((i) =>
      i?.id === id ? { ...i, buyBeforeTrip: true, packed: false } : i
    );
    persistItems(next);
  }

  function deleteItem(id) {
    const next = allItems.filter((i) => i?.id !== id);
    persistItems(next);
  }

  function openItemMenu(item) {
    if (!item?.id) return;
    const options = [
      {
        text: 'Move to Buy Before Trip',
        onPress: () => moveToBuy(item.id),
      },
    ];
    if (item.custom) {
      options.unshift({
        text: 'Edit name',
        onPress: () => openEdit(item),
      });
      options.push({
        text: 'Delete item',
        style: 'destructive',
        onPress: () =>
          Alert.alert('Delete item', `Delete "${item.title}"?`, [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Delete',
              style: 'destructive',
              onPress: () => deleteItem(item.id),
            },
          ]),
      });
    }
    options.push({ text: 'Cancel', style: 'cancel' });
    Alert.alert(item.title ?? 'Item', 'Choose an action', options);
  }

  function openEdit(item) {
    setEditId(item.id);
    setEditText(item.title ?? '');
    setEditVisible(true);
  }

  function saveEdit() {
    const title = editText.trim();
    if (title.length === 0 || !editId) {
      setEditVisible(false);
      return;
    }
    const next = allItems.map((i) =>
      i?.id === editId ? { ...i, title } : i
    );
    setEditVisible(false);
    setEditId(null);
    setEditText('');
    persistItems(next);
  }

  function renderHeader() {
    return (
      <View style={styles.headerCard}>
        <View style={styles.headerTop}>
          <View style={[styles.iconWrap, { backgroundColor: `${accent}22` }]}>
            <Text style={styles.icon}>{CATEGORY_ICONS[category] ?? '📦'}</Text>
          </View>
          <View style={styles.headerText}>
            <Text style={styles.headerTitle}>{category}</Text>
            <Text style={styles.headerCount}>
              {packed} of {total} packed
            </Text>
          </View>
          <Text style={[styles.headerPct, { color: accent }]}>{percentage}%</Text>
        </View>
        <View style={styles.headerProgress}>
          <ProgressBar percentage={percentage} color={accent} height={8} />
        </View>
      </View>
    );
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

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={90}
      >
        <FlatList
          data={categoryItems}
          keyExtractor={(item) => item?.id ?? Math.random().toString()}
          renderItem={({ item }) => (
            <ChecklistRow
              item={item}
              onToggle={() => toggleItem(item.id)}
              onMore={() => openItemMenu(item)}
            />
          )}
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={
            loaded ? (
              <EmptyState
                icon={CATEGORY_ICONS[category] ?? '📦'}
                title="No items here yet"
                subtitle="Add a custom item below to get started."
              />
            ) : null
          }
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />

        {/* Add custom item bar */}
        <View style={styles.addBar}>
          <TextInput
            style={styles.addInput}
            value={newItem}
            onChangeText={setNewItem}
            placeholder={`Add an item to ${category}`}
            placeholderTextColor={colors.muted}
            returnKeyType="done"
            onSubmitEditing={addCustomItem}
          />
          <PrimaryButton
            label="Add"
            onPress={addCustomItem}
            style={styles.addBtn}
          />
        </View>
      </KeyboardAvoidingView>

      {/* Edit item modal */}
      <Modal
        visible={editVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setEditVisible(false)}
      >
        <Pressable style={styles.backdrop} onPress={() => setEditVisible(false)}>
          <Pressable style={styles.modalCard} onPress={() => {}}>
            <Text style={styles.modalTitle}>Edit item</Text>
            <TextInput
              style={styles.modalInput}
              value={editText}
              onChangeText={setEditText}
              placeholder="Item name"
              placeholderTextColor={colors.muted}
              autoFocus
              returnKeyType="done"
              onSubmitEditing={saveEdit}
            />
            <View style={styles.modalActions}>
              <Pressable
                onPress={() => setEditVisible(false)}
                style={styles.modalCancel}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </Pressable>
              <PrimaryButton
                label="Save"
                onPress={saveEdit}
                style={styles.modalSave}
              />
            </View>
          </Pressable>
        </Pressable>
      </Modal>
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
  listContent: {
    padding: 18,
    paddingBottom: 20,
  },
  headerCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.divider,
    padding: 16,
    marginBottom: 16,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  icon: {
    fontSize: 24,
  },
  headerText: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: colors.navy,
  },
  headerCount: {
    marginTop: 2,
    fontSize: 14,
    color: colors.navySoft,
  },
  headerPct: {
    fontSize: 22,
    fontWeight: '900',
  },
  headerProgress: {
    marginTop: 14,
  },
  addBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    paddingTop: 10,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
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
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(16,40,58,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 28,
  },
  modalCard: {
    width: '100%',
    backgroundColor: colors.background,
    borderRadius: 18,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: colors.navy,
    marginBottom: 14,
  },
  modalInput: {
    backgroundColor: colors.white,
    borderWidth: 1.5,
    borderColor: colors.divider,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.navy,
  },
  modalActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 18,
  },
  modalCancel: {
    paddingVertical: 12,
    paddingHorizontal: 18,
    marginRight: 8,
  },
  modalCancelText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.navySoft,
  },
  modalSave: {
    minHeight: 48,
    paddingHorizontal: 26,
  },
});
