export interface TransitionScale {
  fast: string;
  base: string;
  slow: string;
  spring: string;
}

export const transitions: TransitionScale = {
  fast: '120ms cubic-bezier(0.25, 0.46, 0.45, 0.94)',
  base: '200ms cubic-bezier(0.25, 0.46, 0.45, 0.94)',
  slow: '350ms cubic-bezier(0.25, 0.46, 0.45, 0.94)',
  spring: '400ms cubic-bezier(0.34, 1.56, 0.64, 1)',
};

/** Duration in ms for React Native Animated */
export const transitionDurationMs = {
  fast: 120,
  base: 200,
  slow: 350,
  spring: 400,
} as const;
