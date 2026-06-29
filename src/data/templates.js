import { makeId, nowIso } from '../utils/helpers';

// All supported checklist categories, in display order.
export const CATEGORIES = [
  'Clothes',
  'Documents',
  'Hygiene',
  'Electronics',
  'Medicine Kit',
  'Food',
];

// Lightweight text/emoji icon per category (no external icon library).
export const CATEGORY_ICONS = {
  Clothes: '👕',
  Documents: '🛂',
  Hygiene: '🧼',
  Electronics: '🔌',
  'Medicine Kit': '➕',
  Food: '🍎',
};

// Supported trip types.
export const TRIP_TYPES = ['Weekend', 'Beach', 'Business', 'Camping', 'Family'];

// Short description shown when picking a trip type.
export const TRIP_TYPE_INFO = {
  Weekend: 'Short getaway essentials',
  Beach: 'Sun, sand and swimwear',
  Business: 'Work travel and meetings',
  Camping: 'Outdoors and overnight gear',
  Family: 'Travel with kids and extras',
};

// Simple text/emoji symbol per trip type.
export const TRIP_TYPE_ICONS = {
  Weekend: '🧳',
  Beach: '🏖️',
  Business: '💼',
  Camping: '⛺',
  Family: '👨‍👩‍👧',
};

// Starter checklist items per trip type: { title, category }.
const TEMPLATE_ITEMS = {
  Weekend: [
    { title: 'T-shirts', category: 'Clothes' },
    { title: 'Underwear', category: 'Clothes' },
    { title: 'Socks', category: 'Clothes' },
    { title: 'Jacket', category: 'Clothes' },
    { title: 'Passport or ID', category: 'Documents' },
    { title: 'Phone charger', category: 'Electronics' },
    { title: 'Toothbrush', category: 'Hygiene' },
    { title: 'Basic medicine', category: 'Medicine Kit' },
  ],
  Beach: [
    { title: 'Swimwear', category: 'Clothes' },
    { title: 'Sandals', category: 'Clothes' },
    { title: 'Sunglasses', category: 'Clothes' },
    { title: 'Passport or ID', category: 'Documents' },
    { title: 'Towel', category: 'Hygiene' },
    { title: 'Sunscreen', category: 'Hygiene' },
    { title: 'Phone charger', category: 'Electronics' },
    { title: 'Basic medicine', category: 'Medicine Kit' },
    { title: 'Water bottle', category: 'Food' },
    { title: 'Snacks', category: 'Food' },
  ],
  Business: [
    { title: 'Shirt', category: 'Clothes' },
    { title: 'Formal pants', category: 'Clothes' },
    { title: 'Jacket', category: 'Clothes' },
    { title: 'Business documents', category: 'Documents' },
    { title: 'Notebook', category: 'Documents' },
    { title: 'Toothbrush', category: 'Hygiene' },
    { title: 'Laptop', category: 'Electronics' },
    { title: 'Laptop charger', category: 'Electronics' },
    { title: 'Phone charger', category: 'Electronics' },
    { title: 'Basic medicine', category: 'Medicine Kit' },
  ],
  Camping: [
    { title: 'Warm clothes', category: 'Clothes' },
    { title: 'Rain jacket', category: 'Clothes' },
    { title: 'ID document', category: 'Documents' },
    { title: 'Hygiene wipes', category: 'Hygiene' },
    { title: 'Flashlight', category: 'Electronics' },
    { title: 'Power bank', category: 'Electronics' },
    { title: 'First aid items', category: 'Medicine Kit' },
    { title: 'Water bottle', category: 'Food' },
    { title: 'Snacks', category: 'Food' },
    { title: 'Camping food', category: 'Food' },
  ],
  Family: [
    { title: 'Clothes for adults', category: 'Clothes' },
    { title: 'Clothes for children', category: 'Clothes' },
    { title: 'Extra bags', category: 'Clothes' },
    { title: 'Documents', category: 'Documents' },
    { title: 'Hygiene items', category: 'Hygiene' },
    { title: 'Small towel', category: 'Hygiene' },
    { title: 'Chargers', category: 'Electronics' },
    { title: 'Basic medicine', category: 'Medicine Kit' },
    { title: 'Snacks', category: 'Food' },
    { title: 'Water bottle', category: 'Food' },
  ],
};

// Categories that should be shown for each trip type (in display order).
export function categoriesForType(type) {
  const safeType = TRIP_TYPES.includes(type) ? type : 'Weekend';
  const items = TEMPLATE_ITEMS[safeType] ?? [];
  const present = new Set(items.map((i) => i.category));
  return CATEGORIES.filter((c) => present.has(c));
}

// Build a fresh array of PackingItem objects for a given trip type.
export function buildItemsForType(type) {
  const safeType = TRIP_TYPES.includes(type) ? type : 'Weekend';
  const template = TEMPLATE_ITEMS[safeType] ?? TEMPLATE_ITEMS.Weekend;
  return template.map((entry) => ({
    id: makeId('item'),
    title: entry.title,
    category: entry.category,
    packed: false,
    buyBeforeTrip: false,
    custom: false,
    createdAt: nowIso(),
  }));
}
