// Small, dependency-free helpers used across the app.

// Generate a reasonably unique id without any external library.
export function makeId(prefix = 'id') {
  const time = Date.now().toString(36);
  const rand = Math.random().toString(36).slice(2, 10);
  const rand2 = Math.random().toString(36).slice(2, 6);
  return `${prefix}_${time}${rand}${rand2}`;
}

// Current ISO timestamp string.
export function nowIso() {
  return new Date().toISOString();
}

// Safely format an ISO timestamp as a short readable date.
export function formatDate(iso) {
  if (!iso) return '';
  try {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return '';
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch (e) {
    return '';
  }
}

// Items that are actively part of the packing checklist (not moved to buy list).
export function getPackingItems(items) {
  const list = Array.isArray(items) ? items : [];
  return list.filter((item) => item?.buyBeforeTrip !== true);
}

// Packing items that were moved into the "Buy Before Trip" area.
export function getMovedToBuyItems(items) {
  const list = Array.isArray(items) ? items : [];
  return list.filter((item) => item?.buyBeforeTrip === true);
}

// Compute packing progress from an items array. Never crashes on empty/missing.
export function computeProgress(items) {
  const list = Array.isArray(items) ? items : [];
  const total = list.length;
  const packed = list.filter((item) => item?.packed === true).length;
  const percentage = total > 0 ? Math.round((packed / total) * 100) : 0;
  return { total, packed, percentage };
}

// Human-friendly packing status line for a given percentage / counts.
export function packingStatusLabel(total, packed) {
  const t = total ?? 0;
  const p = packed ?? 0;
  if (t === 0) return 'No items yet';
  if (p === 0) return 'Nothing packed yet';
  if (p >= t) return 'All packed';
  const pct = Math.round((p / t) * 100);
  if (pct >= 80) return 'Almost packed';
  return `Packed ${p} of ${t}`;
}

// Group packing items by category, preserving a stable category order.
export function groupByCategory(items, categoryOrder) {
  const list = Array.isArray(items) ? items : [];
  const order = Array.isArray(categoryOrder) ? categoryOrder : [];
  const map = {};
  list.forEach((item) => {
    const cat = item?.category ?? 'Clothes';
    if (!map[cat]) map[cat] = [];
    map[cat].push(item);
  });
  // Build ordered list of { category, items } only for categories present.
  const seen = {};
  const result = [];
  order.forEach((cat) => {
    if (map[cat]) {
      result.push({ category: cat, items: map[cat] });
      seen[cat] = true;
    }
  });
  // Append any categories not in the known order (defensive).
  Object.keys(map).forEach((cat) => {
    if (!seen[cat]) result.push({ category: cat, items: map[cat] });
  });
  return result;
}
