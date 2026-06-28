import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeContext';

type Props = {
  navigation: any;
};

export default function HomeScreen({ navigation }: Props) {
  const theme = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <TouchableOpacity style={styles.backBtn} onPress={() => navigation.navigate('Onboarding')}>
        <Text style={[styles.backText, { color: theme.text }]}>Back</Text>
      </TouchableOpacity>

      <View style={styles.content}>
        <Text style={[styles.heading, { color: theme.text }]}>We wanna know about you</Text>
        <Text style={[styles.description, { color: theme.subtext }]}>
          We would ask a several question for you, just to know about your skills in coding, don't worry this is not
          affect to your learning journey.
        </Text>
      </View>

      <TouchableOpacity
        style={[styles.button, { backgroundColor: theme.btnPrimary }]}
        onPress={() => navigation.navigate('QuestionProgress')}
      >
        <Text style={[styles.buttonText, { color: theme.btnPrimaryText }]}>Let's Go</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 56,
    paddingBottom: 40,
    justifyContent: 'space-between',
  },
  backBtn: {
    alignSelf: 'flex-start',
  },
  backText: {
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  heading: {
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 20,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    maxWidth: 340,
  },
  button: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 50,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 15,
    fontWeight: '600',
  },
});
