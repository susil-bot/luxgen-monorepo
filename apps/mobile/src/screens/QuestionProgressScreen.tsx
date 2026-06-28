import React, { useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import ProgressBar from '../components/ProgressBar';
import QuestionCard from '../components/QuestionCard';
import { useTheme } from '../theme/ThemeContext';
import { LEARNER_SKILL_QUESTIONS, scoreSkillAssessment } from '../data/skill-assessment';
import type { LearnerNavigation } from '../../lib/learner-navigation';

type Props = {
  navigation: LearnerNavigation;
};

export default function QuestionProgressScreen({ navigation }: Props) {
  const theme = useTheme();
  const [activeQuestion, setActiveQuestion] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [answers, setAnswers] = useState<number[]>([]);

  const questions = LEARNER_SKILL_QUESTIONS;
  const currentQuestion = questions[activeQuestion];
  const isLastQuestion = activeQuestion === questions.length - 1;

  const cardQuestion = useMemo(
    () => ({
      header: currentQuestion.header,
      content: currentQuestion.content,
      options: currentQuestion.options,
    }),
    [currentQuestion],
  );

  const handleNext = () => {
    if (selectedOption === null) return;

    const nextAnswers = [...answers, selectedOption];

    if (isLastQuestion) {
      const result = scoreSkillAssessment(nextAnswers);
      navigation.navigate('Congratulations', {
        correct: String(result.correct),
        total: String(result.total),
        percent: String(result.percent),
      });
      return;
    }

    setAnswers(nextAnswers);
    setSelectedOption(null);
    setActiveQuestion((prev) => prev + 1);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.topRow}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={[styles.backText, { color: theme.text }]}>Back</Text>
        </TouchableOpacity>

        <View style={styles.progressWrapper}>
          <ProgressBar currentStep={activeQuestion + 1} totalSteps={questions.length} />
        </View>
      </View>

      <View style={styles.content}>
        <QuestionCard question={cardQuestion} selectedOption={selectedOption} onSelectOption={setSelectedOption} />
      </View>

      <TouchableOpacity
        style={[
          styles.button,
          {
            backgroundColor: selectedOption !== null ? theme.btnPrimary : '#ccc',
          },
        ]}
        disabled={selectedOption === null}
        onPress={handleNext}
      >
        <Text style={[styles.buttonText, { color: theme.btnPrimaryText }]}>{isLastQuestion ? 'Finish' : 'Next'}</Text>
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
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 24,
  },
  progressWrapper: {
    flex: 1,
    marginLeft: 16,
  },
  content: {
    flex: 1,
    justifyContent: 'flex-start',
    paddingVertical: 14,
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
