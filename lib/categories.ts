// Single source of truth for item categories (used by the form + dashboard filter).
export const CATEGORIES = [
  "clothes",
  "electronics",
  "books",
  "kitchen",
  "toiletries",
  "furniture",
  "documents",
  "fitness",
  "sentimental",
  "misc",
] as const;

export const CAT_ICON: Record<string, string> = {
  clothes: "👕", electronics: "🔌", books: "📚", kitchen: "🍳",
  toiletries: "🧴", furniture: "🛋️", documents: "📄", fitness: "🏋️",
  sentimental: "💛", misc: "📦",
};
