import React, { useRef, useState } from 'react';
import { View, ScrollView, TouchableOpacity, Text, StyleSheet, Dimensions } from 'react-native';
import Icon1 from '../assets/images/icon1.svg';
import Icon2 from '../assets/images/icon2.svg';
import Icon3 from '../assets/images/icon3.svg';
import { useTheme } from '../theme/ThemeContext';
import { markLearnerOnboardingSeen } from '../../lib/guest-flow';
import type { LearnerNavigation } from '../../lib/learner-navigation';

const { width } = Dimensions.get('window');

const slides = [
  {
    id: 0,
    Image: Icon1,
    header: "Learning Coding Like It's Nothing with Codu.id",
    content:
      "Learning how to code isn't always easy, but with our gamification approach we make it like you're not doing anything.",
  },
  {
    id: 1,
    Image: Icon2,
    header: 'Reviewing your Skills Progress',
    content:
      'Reviewing your skills to track how fast you learn and grow, with this method you can be a master coder within weeks.',
  },
  {
    id: 2,
    Image: Icon3,
    header: 'Achieve a Higher Ranking and Flex It As You Wish',
    content:
      'Be competitive and achieve a higher ranking and flex it on your social media, let the world know how good you are.',
  },
];

type Props = {
  navigation: LearnerNavigation;
};

export default function OnboardingScreen({ navigation }: Props) {
  const theme = useTheme();
  const scrollRef = useRef<ScrollView>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const goToSignUp = async () => {
    await markLearnerOnboardingSeen();
    navigation.replace('SignUp');
  };

  const goToNext = () => {
    const next = currentIndex + 1;
    scrollRef.current?.scrollTo({ x: next * width, animated: true });
    setCurrentIndex(next);
  };

  const onScroll = (e: { nativeEvent: { contentOffset: { x: number } } }) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / width);
    setCurrentIndex(index);
  };

  const isLast = currentIndex === slides.length - 1;

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onScroll}
        scrollEventThrottle={16}
      >
        {slides.map(({ id, Image, header, content }) => (
          <View key={id} style={styles.slide}>
            <Image width={280} height={280} />
            <Text style={[styles.header, { color: theme.text }]}>{header}</Text>
            <Text style={[styles.content, { color: theme.subtext }]}>{content}</Text>
          </View>
        ))}
      </ScrollView>

      <View style={styles.dotsRow}>
        {slides.map((_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              { backgroundColor: theme.dot },
              i === currentIndex && { backgroundColor: theme.dotActive, width: 20 },
            ]}
          />
        ))}
      </View>

      <View style={styles.buttons}>
        {isLast ? (
          <TouchableOpacity
            style={[styles.continueBtn, { backgroundColor: theme.btnPrimary }]}
            onPress={() => void goToSignUp()}
          >
            <Text style={[styles.continueTxt, { color: theme.btnPrimaryText }]}>Continue</Text>
          </TouchableOpacity>
        ) : (
          <>
            <TouchableOpacity
              style={[styles.skipBtn, { borderColor: theme.skipBorder }]}
              onPress={() => void goToSignUp()}
            >
              <Text style={[styles.skipTxt, { color: theme.skipText }]}>Skip</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.nextBtn, { backgroundColor: theme.btnPrimary }]} onPress={goToNext}>
              <Text style={[styles.nextTxt, { color: theme.btnPrimaryText }]}>Next</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  slide: {
    width,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  header: {
    marginTop: 32,
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 30,
  },
  content: {
    marginTop: 12,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 16,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  skipBtn: {
    paddingVertical: 14,
    paddingHorizontal: 42,
    borderRadius: 20,
    borderWidth: 1,
  },
  skipTxt: {
    fontSize: 16,
    fontWeight: '600',
  },
  nextBtn: {
    paddingVertical: 14,
    paddingHorizontal: 42,
    borderRadius: 20,
  },
  nextTxt: {
    fontSize: 16,
    fontWeight: '600',
  },
  continueBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 20,
    alignItems: 'center',
  },
  continueTxt: {
    fontSize: 16,
    fontWeight: '600',
  },
});
