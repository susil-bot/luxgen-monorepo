import type { ComponentType } from 'react';

import { useLearnerNavigation, type LearnerNavigation } from '../lib/learner-navigation';

type ScreenWithNavigation = ComponentType<{ navigation: LearnerNavigation }>;

/** Wraps src/screens for Expo Router — passes navigation adapter */
export function createLearnerRoute(Screen: ScreenWithNavigation) {
  return function LearnerRoute() {
    const navigation = useLearnerNavigation();
    return <Screen navigation={navigation} />;
  };
}
