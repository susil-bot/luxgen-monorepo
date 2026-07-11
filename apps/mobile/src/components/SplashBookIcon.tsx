import React from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

/** Book mark icon matching the Codu splash (blue circle + open book). */
export function SplashBookIcon({ size = 120 }: { size?: number }) {
  return (
    <View style={[styles.wrap, { width: size * 1.6, height: size * 1.6 }]}>
      {/* Soft glow */}
      <View style={[styles.glow, { width: size * 1.5, height: size * 1.5, borderRadius: size * 0.75 }]} />
      {/* Decorative dots */}
      <View style={[styles.dot, styles.dotTL]} />
      <View style={[styles.dot, styles.dotTR]} />
      <View style={[styles.dot, styles.dotBL]} />
      <View style={[styles.dot, styles.dotBR]} />
      <View style={[styles.dot, styles.dotL]} />
      <View style={[styles.dot, styles.dotR]} />

      <Svg width={size} height={size} viewBox="0 0 120 120">
        <Circle cx="60" cy="60" r="52" fill="#007AFF" />
        {/* Open book */}
        <Path
          d="M60 38c-8-6-22-8-32-6v40c10-2 24 0 32 6 8-6 22-8 32-6V32c-10-2-24 0-32 6z"
          fill="none"
          stroke="#FFFFFF"
          strokeWidth="4"
          strokeLinejoin="round"
        />
        <Path d="M60 38v40" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" />
        <Path d="M42 48h10M42 58h12M42 68h8" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" opacity="0.9" />
        <Path d="M68 48h10M66 58h12M70 68h8" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" opacity="0.9" />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  glow: {
    position: 'absolute',
    backgroundColor: 'rgba(0, 122, 255, 0.18)',
  },
  dot: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#007AFF',
    opacity: 0.55,
  },
  dotTL: { top: '12%', left: '18%' },
  dotTR: { top: '18%', right: '14%' },
  dotBL: { bottom: '16%', left: '22%' },
  dotBR: { bottom: '12%', right: '20%' },
  dotL: { top: '48%', left: '8%' },
  dotR: { top: '42%', right: '10%' },
});
