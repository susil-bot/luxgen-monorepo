import React from 'react';
import { ScrollView, StyleSheet, Text, View, type ScrollViewProps } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { lightTheme } from '@luxgen/design-tokens';

const theme = lightTheme;

export interface ScreenProps extends ScrollViewProps {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  scroll?: boolean;
}

export function Screen({ title, subtitle, children, scroll = true, contentContainerStyle, ...rest }: ScreenProps) {
  const body = (
    <>
      {title ? <Text style={styles.title}>{title}</Text> : null}
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      {children}
    </>
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      {scroll ? (
        <ScrollView
          contentContainerStyle={[styles.content, contentContainerStyle]}
          keyboardShouldPersistTaps="handled"
          {...rest}
        >
          {body}
        </ScrollView>
      ) : (
        <View style={[styles.content, contentContainerStyle]}>{body}</View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: theme.colors.bgPrimary,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: theme.layout.screenHorizontal,
    paddingBottom: theme.spacing[6],
    gap: theme.spacing[4],
  },
  title: {
    fontSize: theme.typography.fontSize.largeTitle,
    fontWeight: theme.typography.fontWeight.bold,
    letterSpacing: theme.typography.letterSpacing.tight,
    color: theme.colors.labelPrimary,
    marginTop: theme.spacing[2],
  },
  subtitle: {
    fontSize: theme.typography.fontSize.subheadline,
    color: theme.colors.labelSecondary,
    marginBottom: theme.spacing[2],
  },
});
