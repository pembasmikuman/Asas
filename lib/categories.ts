// Single source of truth for item categories (used by the form + dashboard filter).
export const CATEGORIES = [
  "clothes",
  "electronics",
  "books",
  "kitchen",
  "toiletries",
  "furniture",
  "documents",
  "sports",
  "wellness",
  "sentimental",
  "misc",
] as const;

export const CAT_ICON: Record<string, string> = {
  clothes: "👕", electronics: "🔌", books: "📚", kitchen: "🍳",
  toiletries: "🧴", furniture: "🛋️", documents: "📄", sports: "🏋️",
  wellness: "🧘", sentimental: "💛", misc: "📦",
};

/**
 * The categories to offer: the built-ins, plus any others the items already use.
 * A made-up category lives in the items themselves, so it sticks around as long as
 * something is filed under it and disappears on its own when nothing is.
 */
export function catalog(items: { category: string; category_icon?: string | null }[]): [string, string][] {
  const out = new Map<string, string>(CATEGORIES.map((c) => [c, CAT_ICON[c]]));
  for (const i of items) if (i.category && !out.has(i.category)) out.set(i.category, i.category_icon || "📦");
  return [...out];
}
