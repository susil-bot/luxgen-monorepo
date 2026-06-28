import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Image15 from '../assets/images/image 15.svg';
import { useTheme } from '../theme/ThemeContext';
import type { LearnerNavigation } from '../../lib/learner-navigation';

type Props = {
  navigation: LearnerNavigation;
};

export default function ResetSuccessScreen({ navigation }: Props) {
  const theme = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Image15 width={220} height={220} />
      <Text style={[styles.title, { color: theme.text }]}>It's All Set</Text>
      <Text style={[styles.subtitle, { color: theme.subtext }]}>Your password has been updated.</Text>
      <TouchableOpacity
        style={[styles.button, { backgroundColor: theme.btnPrimary }]}
        onPress={() => navigation.navigate('SignIn')}
      >
        <Text style={[styles.buttonText, { color: theme.btnPrimaryText }]}>Back to Sign in</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginTop: 20,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 12,
    lineHeight: 22,
    maxWidth: 320,
  },
  button: {
    width: '100%',
    maxWidth: 340,
    paddingVertical: 14,
    borderRadius: 50,
    alignItems: 'center',
    marginTop: 30,
  },
  buttonText: {
    fontSize: 15,
    fontWeight: '600',
  },
});
