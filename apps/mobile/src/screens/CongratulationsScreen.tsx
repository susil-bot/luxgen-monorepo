import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Image27Svg from '../assets/images/image27.svg';
import { useTheme } from '../theme/ThemeContext';
import { skillLevelFromPercent } from '../data/skill-assessment';
import type { LearnerNavigation } from '../../lib/learner-navigation';

type Props = {
  navigation: LearnerNavigation;
  correct?: number;
  total?: number;
  percent?: number;
};

export default function CongratulationsScreen({ navigation, correct, total, percent }: Props) {
  const theme = useTheme();
  const scored = typeof percent === 'number' && !Number.isNaN(percent);
  const level = skillLevelFromPercent(scored ? percent : 70);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.content}>
        <Text style={[styles.congratulationsText, { color: theme.text }]}>Congratulations</Text>

        <Image27Svg width={200} height={200} style={styles.image} />

        {scored && typeof correct === 'number' && typeof total === 'number' ? (
          <Text style={[styles.scoreText, { color: theme.btnPrimary }]}>
            You scored {correct}/{total} ({percent}%)
          </Text>
        ) : null}

        <Text style={[styles.levelText, { color: theme.text }]}>You are at {level.title}</Text>

        <Text style={[styles.descriptionText, { color: theme.text }]}>{level.description}</Text>
      </View>

      <TouchableOpacity
        style={[styles.button, { backgroundColor: theme.btnPrimary }]}
        onPress={() => navigation.navigate('Home')}
      >
        <Text style={[styles.buttonText, { color: theme.btnPrimaryText }]}>Finish</Text>
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
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  congratulationsText: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 40,
    textAlign: 'center',
  },
  image: {
    width: 200,
    height: 200,
    marginBottom: 30,
  },
  scoreText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'center',
  },
  levelText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  descriptionText: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  button: {
    width: '100%',
    maxWidth: 340,
    alignSelf: 'center',
    paddingVertical: 14,
    borderRadius: 50,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 15,
    fontWeight: '600',
  },
});
