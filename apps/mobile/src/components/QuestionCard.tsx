import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeContext';

type Question = {
  header: string;
  content: string;
  options: string[];
};

type Props = {
  question: Question;
  selectedOption: number | null;
  onSelectOption: (index: number) => void;
};

export default function QuestionCard({ question, selectedOption, onSelectOption }: Props) {
  const theme = useTheme();

  return (
    <View style={styles.card}>
      <Text style={[styles.questionHeader, { color: theme.text }]}>{question.header}</Text>
      <Text style={[styles.questionContent, { color: theme.subtext }]}>{question.content}</Text>

      <View style={styles.options}>
        {question.options.map((option, index) => {
          const selected = selectedOption === index;
          return (
            <TouchableOpacity
              key={option}
              style={[
                styles.optionButton,
                { borderColor: selected ? theme.btnPrimary : '#d1d5db' },
                selected && { backgroundColor: theme.btnPrimary + '14' },
              ]}
              onPress={() => onSelectOption(index)}
            >
              <View
                style={[
                  styles.radioCircle,
                  {
                    borderColor: selected ? theme.btnPrimary : '#9ca3af',
                  },
                ]}
              >
                {selected && <View style={[styles.radioFill, { backgroundColor: theme.btnPrimary }]} />}
              </View>
              <Text style={[styles.optionLabel, { color: theme.text }]}>{option}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
  },
  questionHeader: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 12,
    lineHeight: 32,
  },
  questionContent: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 24,
  },
  options: {
    width: '100%',
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  radioFill: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  optionLabel: {
    fontSize: 15,
    lineHeight: 22,
    flexShrink: 1,
  },
});
