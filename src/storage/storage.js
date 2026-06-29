import AsyncStorage from '@react-native-async-storage/async-storage';

import { makeId, nowIso } from '../utils/helpers';
import {
  CATEGORIES,
  TRIP_TYPES,
  buildItemsForType,
} from '../data/templates';

// Storage keys.
const TRIPS_KEY = '@veyro/trips';
const SETTINGS_KEY = '@veyro/settings';

// Default settings, merged with anything stored.
export const DEFAULT_SETTINGS = {
  onboardingCompleted: false,
  compactMode: false,
};

// ---------- Safe parsing helpers ----------

// Parse JSON safely. Returns fallback on any error or corrupted data.
function safeParse(raw, fallback) {
  if (raw == null) return fallback;
  try {
    const parsed = JSON.parse(raw);
    return parsed ?? fallback;
  } catch (e) {
    // Corrupted JSON in storage -> use safe fallback.
    return fallback;
  }
}

// Normalize a single packing item, filling any missing fields.
function normalizeItem(raw) {
  const item = raw && typeof raw === 'object' ? raw : {};
  const category = CATEGORIES.includes(item.category) ? item.category : 'Clothes';
  return {
    id: typeof item.id === 'string' ? item.id : makeId('item'),
    title: typeof item.title === 'string' ? item.title : 'Item',
    category,
    packed: item.packed === true,
    buyBeforeTrip: item.buyBeforeTrip === true,
    custom: item.custom === true,
    createdAt: typeof item.createdAt === 'string' ? item.createdAt : nowIso(),
  };
}

// Normalize a single buy item, filling any missing fields.
function normalizeBuyItem(raw) {
  const item = raw && typeof raw === 'object' ? raw : {};
  const linked = CATEGORIES.includes(item.linkedCategory)
    ? item.linkedCategory
    : null;
  return {
    id: typeof item.id === 'string' ? item.id : makeId('buy'),
    title: typeof item.title === 'string' ? item.title : 'Item',
    bought: item.bought === true,
    linkedCategory: linked,
    createdAt: typeof item.createdAt === 'string' ? item.createdAt : nowIso(),
  };
}

// Normalize a single trip, guaranteeing all arrays/fields exist.
function normalizeTrip(raw) {
  const trip = raw && typeof raw === 'object' ? raw : {};
  const type = TRIP_TYPES.includes(trip.type) ? trip.type : 'Weekend';
  const items = Array.isArray(trip.items) ? trip.items.map(normalizeItem) : [];
  const buyItems = Array.isArray(trip.buyItems)
    ? trip.buyItems.map(normalizeBuyItem)
    : [];
  return {
    id: typeof trip.id === 'string' ? trip.id : makeId('trip'),
    name: typeof trip.name === 'string' && trip.name.length > 0 ? trip.name : 'Trip',
    type,
    destination: typeof trip.destination === 'string' ? trip.destination : '',
    startDate: typeof trip.startDate === 'string' ? trip.startDate : null,
    endDate: typeof trip.endDate === 'string' ? trip.endDate : null,
    items,
    buyItems,
    createdAt: typeof trip.createdAt === 'string' ? trip.createdAt : nowIso(),
    updatedAt: typeof trip.updatedAt === 'string' ? trip.updatedAt : nowIso(),
  };
}

// ---------- Settings ----------

export async function loadSettings() {
  try {
    const raw = await AsyncStorage.getItem(SETTINGS_KEY);
    const parsed = safeParse(raw, {});
    return { ...DEFAULT_SETTINGS, ...(parsed && typeof parsed === 'object' ? parsed : {}) };
  } catch (e) {
    return { ...DEFAULT_SETTINGS };
  }
}

export async function saveSettings(settings) {
  const merged = { ...DEFAULT_SETTINGS, ...(settings ?? {}) };
  try {
    await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(merged));
  } catch (e) {
    // Ignore write failures; in-memory state still works for the session.
  }
  return merged;
}

export async function updateSettings(patch) {
  const current = await loadSettings();
  return saveSettings({ ...current, ...(patch ?? {}) });
}

// ---------- Trips ----------

export async function loadTrips() {
  try {
    const raw = await AsyncStorage.getItem(TRIPS_KEY);
    const parsed = safeParse(raw, []);
    if (!Array.isArray(parsed)) return [];
    return parsed.map(normalizeTrip);
  } catch (e) {
    return [];
  }
}

export async function saveTrips(trips) {
  const list = Array.isArray(trips) ? trips.map(normalizeTrip) : [];
  try {
    await AsyncStorage.setItem(TRIPS_KEY, JSON.stringify(list));
  } catch (e) {
    // Ignore write failures.
  }
  return list;
}

export async function getTrip(tripId) {
  if (!tripId) return null;
  const trips = await loadTrips();
  return trips.find((t) => t?.id === tripId) ?? null;
}

// Create and persist a new trip with a starter checklist.
export async function createTrip({
  name,
  type,
  destination,
  startDate,
  endDate,
}) {
  const safeType = TRIP_TYPES.includes(type) ? type : 'Weekend';
  const trips = await loadTrips();
  const trip = normalizeTrip({
    id: makeId('trip'),
    name: name && name.trim().length > 0 ? name.trim() : `${safeType} Trip`,
    type: safeType,
    destination: destination ?? '',
    startDate: startDate && startDate.trim().length > 0 ? startDate.trim() : null,
    endDate: endDate && endDate.trim().length > 0 ? endDate.trim() : null,
    items: buildItemsForType(safeType),
    buyItems: [],
    createdAt: nowIso(),
    updatedAt: nowIso(),
  });
  const next = [trip, ...trips];
  await saveTrips(next);
  return trip;
}

// Replace a trip by id (also bumps updatedAt) and persist.
export async function updateTrip(updatedTrip) {
  if (!updatedTrip || !updatedTrip.id) return null;
  const trips = await loadTrips();
  const stamped = normalizeTrip({ ...updatedTrip, updatedAt: nowIso() });
  const next = trips.map((t) => (t?.id === stamped.id ? stamped : t));
  // If it was not found (edge case), add it.
  if (!next.some((t) => t?.id === stamped.id)) next.unshift(stamped);
  await saveTrips(next);
  return stamped;
}

export async function deleteTrip(tripId) {
  if (!tripId) return [];
  const trips = await loadTrips();
  const next = trips.filter((t) => t?.id !== tripId);
  await saveTrips(next);
  return next;
}

// Duplicate a trip: copy items/buy items, reset packed/bought states, keep custom.
export async function duplicateTrip(tripId, newName) {
  const trips = await loadTrips();
  const source = trips.find((t) => t?.id === tripId);
  if (!source) return null;

  const copiedItems = (source.items ?? []).map((item) => ({
    ...normalizeItem(item),
    id: makeId('item'),
    packed: false,
    createdAt: nowIso(),
  }));
  const copiedBuyItems = (source.buyItems ?? []).map((b) => ({
    ...normalizeBuyItem(b),
    id: makeId('buy'),
    bought: false,
    createdAt: nowIso(),
  }));

  const defaultName = `Copy of ${source.name ?? 'Trip'}`;
  const finalName =
    newName && newName.trim().length > 0 ? newName.trim() : defaultName;

  const duplicate = normalizeTrip({
    id: makeId('trip'),
    name: finalName,
    type: source.type,
    destination: source.destination ?? '',
    startDate: source.startDate ?? null,
    endDate: source.endDate ?? null,
    items: copiedItems,
    buyItems: copiedBuyItems,
    createdAt: nowIso(),
    updatedAt: nowIso(),
  });

  const next = [duplicate, ...trips];
  await saveTrips(next);
  return duplicate;
}

// ---------- Maintenance ----------

// Clear packed states across every trip (does not delete items).
export async function clearAllPackedStates() {
  const trips = await loadTrips();
  const next = trips.map((trip) => ({
    ...trip,
    items: (trip.items ?? []).map((item) => ({ ...item, packed: false })),
    updatedAt: nowIso(),
  }));
  await saveTrips(next);
  return next;
}

// Remove all stored app data (trips + settings).
export async function resetAllData() {
  try {
    await AsyncStorage.multiRemove([TRIPS_KEY, SETTINGS_KEY]);
  } catch (e) {
    // Fallback: best-effort individual removes.
    try {
      await AsyncStorage.removeItem(TRIPS_KEY);
      await AsyncStorage.removeItem(SETTINGS_KEY);
    } catch (e2) {
      // Ignore.
    }
  }
}

export { normalizeTrip, normalizeItem, normalizeBuyItem };
