// BAK-03 / BAK-05: pure merge logic for backup restore. No React, no DOM.
import { uid } from "./format";

// BAK-03: id-based transaction merge — newer `updatedAt` wins.
export function mergeTransactions(existing, incoming) {
  const byId = new Map(existing.map((t) => [t.id, t]));
  let added = 0, skipped = 0, updated = 0;
  for (const t of incoming) {
    const ex = byId.get(t.id);
    if (!ex) {
      byId.set(t.id, t);
      added++;
    } else if ((t.updatedAt || 0) > (ex.updatedAt || 0)) {
      byId.set(t.id, t);
      updated++;
    } else {
      skipped++;
    }
  }
  return { transactions: [...byId.values()], added, skipped, updated };
}

// BAK-05: category merge by lower-cased `type:name`. Known names keep current
// ids; unknown names are appended as non-predefined categories.
export function mergeCategories(existing, incoming = []) {
  const categories = [...existing];
  const nameIndex = new Map(categories.map((c) => [`${c.type}:${c.name.toLowerCase()}`, c.id]));
  const catIdMap = new Map();
  for (const c of incoming) {
    const key = `${c.type}:${c.name.toLowerCase()}`;
    if (nameIndex.has(key)) {
      catIdMap.set(c.id, nameIndex.get(key));
    } else {
      const newId = uid();
      categories.push({ ...c, id: newId, isPredefined: false });
      nameIndex.set(key, newId);
      catIdMap.set(c.id, newId);
    }
  }
  return { categories, catIdMap };
}

// Point restored transactions at the (possibly remapped) current category ids.
export function remapCategoryIds(transactions, catIdMap) {
  return transactions.map((t) =>
    catIdMap.has(t.categoryId) ? { ...t, categoryId: catIdMap.get(t.categoryId) } : t
  );
}