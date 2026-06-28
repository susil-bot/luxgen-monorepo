import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import ProgressBar from '../components/ProgressBar';
import QuestionCard from '../components/QuestionCard';
import { useTheme } from '../theme/ThemeContext';

type Props = {
  navigation: any;
};

type Question = {
  header: string;
  content: string;
  options: string[];
};

const questions: Question[] = [
  {
    header: 'What is the purpose of HTML?',
    content: 'We start with basic question, take it easy',
    options: [
      'To style web pages',
      'To structure web pages',
      'To add interactivity to web pages',
      'To store data online',
    ],
  },
  {
    header: 'Which of the following is used to create a comment in HTML?',
    content: "Oohh it's get bit harder, but it's okay stay relax",
    options: ['// This is a comment', '/* This is a comment */', '<!-- This is a comment -->', '# This is a comment'],
  },
  {
    header: 'What does CSS stant for?',
    content: "Yeah the question get more easier right, Let's answer and don't forgot to enjoy.",
    options: ['Cascading Style Sheets', 'Computer Style Sheets', 'Creative Style Sheets', 'Colorful Style Sheets'],
  },
  {
    header: 'Which programming language used for web development?',
    content: 'Ouch, maybe english Lol',
    options: ['French', 'Python', 'Latin', 'html'],
  },
  {
    header: 'What symbol is used to denote an ID selector in CSS?',
    content: 'Hmmm kinds curious what it is?',
    options: ['.', '#', '!', '*'],
  },
  {
    header: 'Which of the following is a tool for managing versions of your code?',
    content: 'Yeah another normal question ay!',
    options: ['Photoshop', 'Git', 'Excel', 'PowerPoint'],
  },
  {
    header: "What does 'bug' mean in programming?",
    content: 'Bug? an insect ? hah what is this?',
    options: ['An error in the code', 'A feature request', 'A type of computer virus', 'An e-mail from a client'],
  },
  {
    header: 'What is the purpose of a loop in the programming?',
    content: 'Loop for the infinity?',
    options: ['To repeat a code number of times', 'To decorate the code', 'To make the code longer', 'To loop a video'],
  },
  {
    header: 'Which of these elements can store multiple values in a single variable in JavaScript?',
    content: 'What does this mean?',
    options: ['String', 'Array', 'Comment', 'Function'],
  },
  {
    header: "What does 'UI' stand for in web development?",
    content: 'UI? University of Indonesia?',
    options: ['Ultimate Interface', 'User Interface', 'Unique Identifier', 'User Integrastion'],
  },
];

export default function QuestionProgressScreen({ navigation }: Props) {
  const theme = useTheme();
  const [activeQuestion, setActiveQuestion] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);

  const currentQuestion = questions[activeQuestion];
  const isLastQuestion = activeQuestion === questions.length - 1;

  const handleNext = () => {
    if (selectedOption === null) {
      return;
    }

    if (isLastQuestion) {
      navigation.navigate('Congratulations');
      return;
    }

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
          <ProgressBar currentStep={activeQuestion + 1} totalSteps={10} />
        </View>
      </View>

      <View style={styles.content}>
        <QuestionCard question={currentQuestion} selectedOption={selectedOption} onSelectOption={setSelectedOption} />
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
