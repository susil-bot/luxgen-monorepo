/** Spacing scale — aligns with Tailwind defaults used in apps/web */

export interface SpacingScale {
  0: number;
  1: number;
  2: number;
  3: number;
  4: number;
  5: number;
  6: number;
  8: number;
  10: number;
  12: number;
  16: number;
  20: number;
  24: number;
  32: number;
  40: number;
  48: number;
  60: number;
}

/** Values in px */
export const spacing: SpacingScale = {
  0: 0,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
  10: 40,
  12: 48,
  16: 64,
  20: 80,
  24: 96,
  32: 128,
  40: 160,
  48: 192,
  60: 240,
};

/** Common layout insets (iOS grouped list padding) */
export const layout = {
  screenHorizontal: spacing[4],
  cardRowVertical: 12,
  cardRowHorizontal: spacing[4],
  sectionGap: 6,
  groupedSectionGap: spacing[6],
} as const;
