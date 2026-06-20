import React from 'react';
import { Pressable, StyleSheet, Text, View, type PressableProps } from 'react-native';

import { lightTheme } from '@luxgen/design-tokens';

const theme = lightTheme;

export interface ListRowProps extends Omit<PressableProps, 'style'> {
  title: string;
  subtitle?: string;
  accessory?: React.ReactNode;
  showSeparator?: boolean;
}

export function ListRow({ title, subtitle, accessory, showSeparator = true, ...rest }: ListRowProps) {
  return (
    <Pressable style={({ pressed }) => [styles.row, pressed && styles.rowPressed]} {...rest}>
      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      {accessory}
      {showSeparator ? <View style={styles.separator} /> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.layout.cardRowHorizontal,
    paddingVertical: theme.layout.cardRowVertical,
    minHeight: 44,
    backgroundColor: theme.colors.bgSecondary,
  },
  rowPressed: {
    backgroundColor: theme.colors.fillQuaternary,
  },
  content: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontSize: theme.typography.fontSize.body,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.labelPrimary,
  },
  subtitle: {
    fontSize: theme.typography.fontSize.subheadline,
    color: theme.colors.labelSecondary,
  },
  separator: {
    position: 'absolute',
    left: theme.layout.cardRowHorizontal,
    right: 0,
    bottom: 0,
    height: StyleSheet.hairlineWidth,
    backgroundColor: theme.colors.separator,
  },
});
