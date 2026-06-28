export type SkillQuestion = {
  header: string;
  content: string;
  options: string[];
  correctIndex: number;
};

export const LEARNER_SKILL_QUESTIONS: SkillQuestion[] = [
  {
    header: 'What is the purpose of HTML?',
    content: 'We start with basic question, take it easy',
    options: [
      'To style web pages',
      'To structure web pages',
      'To add interactivity to web pages',
      'To store data online',
    ],
    correctIndex: 1,
  },
  {
    header: 'Which of the following is used to create a comment in HTML?',
    content: "Oohh it's get bit harder, but it's okay stay relax",
    options: ['// This is a comment', '/* This is a comment */', '<!-- This is a comment -->', '# This is a comment'],
    correctIndex: 2,
  },
  {
    header: 'What does CSS stand for?',
    content: "Yeah the question get more easier right, Let's answer and don't forgot to enjoy.",
    options: ['Cascading Style Sheets', 'Computer Style Sheets', 'Creative Style Sheets', 'Colorful Style Sheets'],
    correctIndex: 0,
  },
  {
    header: 'Which programming language is commonly used for web development?',
    content: 'Ouch, maybe english Lol',
    options: ['French', 'Python', 'Latin', 'HTML markup only'],
    correctIndex: 1,
  },
  {
    header: 'What symbol is used to denote an ID selector in CSS?',
    content: 'Hmmm kinds curious what it is?',
    options: ['.', '#', '!', '*'],
    correctIndex: 1,
  },
  {
    header: 'Which of the following is a tool for managing versions of your code?',
    content: 'Yeah another normal question ay!',
    options: ['Photoshop', 'Git', 'Excel', 'PowerPoint'],
    correctIndex: 1,
  },
  {
    header: "What does 'bug' mean in programming?",
    content: 'Bug? an insect ? hah what is this?',
    options: ['An error in the code', 'A feature request', 'A type of computer virus', 'An e-mail from a client'],
    correctIndex: 0,
  },
  {
    header: 'What is the purpose of a loop in programming?',
    content: 'Loop for the infinity?',
    options: ['To repeat a block of code', 'To decorate the code', 'To make the code longer', 'To loop a video'],
    correctIndex: 0,
  },
  {
    header: 'Which of these can store multiple values in a single variable in JavaScript?',
    content: 'What does this mean?',
    options: ['String', 'Array', 'Comment', 'Function'],
    correctIndex: 1,
  },
  {
    header: "What does 'UI' stand for in web development?",
    content: 'UI? University of Indonesia?',
    options: ['Ultimate Interface', 'User Interface', 'Unique Identifier', 'User Integration'],
    correctIndex: 1,
  },
];

export function scoreSkillAssessment(answers: number[]): { correct: number; total: number; percent: number } {
  const total = LEARNER_SKILL_QUESTIONS.length;
  let correct = 0;
  for (let i = 0; i < total; i += 1) {
    if (answers[i] === LEARNER_SKILL_QUESTIONS[i].correctIndex) {
      correct += 1;
    }
  }
  return { correct, total, percent: total > 0 ? Math.round((correct / total) * 100) : 0 };
}

export function skillLevelFromPercent(percent: number): { title: string; description: string } {
  if (percent >= 80) {
    return {
      title: 'Intermediate level',
      description: 'You have solid fundamentals. Continue with structured courses to move into advanced topics.',
    };
  }
  if (percent >= 50) {
    return {
      title: 'Beginner+ level',
      description: 'You know some basics. Focus on HTML, CSS, and JavaScript fundamentals to level up.',
    };
  }
  return {
    title: 'Beginner level',
    description: 'Great start. Work through introductory lessons — we will tailor your learning path from here.',
  };
}
