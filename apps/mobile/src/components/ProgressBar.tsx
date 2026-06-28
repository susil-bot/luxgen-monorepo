import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeContext';

type Props = {
  currentStep: number;
  totalSteps?: number;
};

export default function ProgressBar({ currentStep, totalSteps = 10 }: Props) {
  const theme = useTheme();
  const safeStep = Math.max(0, Math.min(currentStep, totalSteps));
  const progressPercent = (safeStep / totalSteps) * 100;

  return (
    <View style={styles.container}>
      <View style={[styles.headerRow, styles.counterOnlyRow]}>
        <Text style={[styles.counter, { color: theme.subtext }]}>
          {safeStep}/{totalSteps}
        </Text>
      </View>

      <View style={[styles.track, { backgroundColor: '#e5e7eb' }]}>
        <View
          style={[
            styles.fill,
            {
              width: `${progressPercent}%`,
              backgroundColor: theme.btnPrimary,
            },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: 24,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 8,
  },
  counterOnlyRow: {
    justifyContent: 'flex-end',
  },
  counter: {
    fontSize: 14,
    fontWeight: '500',
  },
  track: {
    height: 8,
    borderRadius: 999,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 999,
  },
});
