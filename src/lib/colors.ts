export const CATEGORY_COLORS = [
  "#2645D4", // Cobalt
  "#1C7F52", // Forest
  "#A86200", // Amber
  "#B8375F", // Rose
  "#7C3AED", // Violet
  "#0D9488", // Teal
  "#D97706", // Orange
  "#DB2777", // Pink
  "#4F46E5", // Indigo
  "#059669", // Emerald
];

export function getCategoryColor(categoryName: string, index = 0): string {
  let hash = 0;
  for (let i = 0; i < categoryName.length; i++) {
    hash = categoryName.charCodeAt(i) + ((hash << 5) - hash);
  }
  const idx = Math.abs(hash + index) % CATEGORY_COLORS.length;
  return CATEGORY_COLORS[idx];
}
