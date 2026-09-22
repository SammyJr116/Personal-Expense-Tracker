// CAT-06: deleting a custom expense category moves its transactions to "Other".
// Pure function — no React, no DOM.
export function applyCategoryDelete(categories, transactions, id, now = Date.now()) {
  const other = categories.find((c) => c.type === "expense" && c.name === "Other" && c.isPredefined);
  const otherId = other ? other.id : null;
  return {
    transactions: transactions.map((t) =>
      t.categoryId === id ? { ...t, categoryId: otherId, updatedAt: now } : t
    ),
    categories: categories.filter((c) => c.id !== id),
  };
}