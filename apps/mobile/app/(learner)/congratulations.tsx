import { useLocalSearchParams } from 'expo-router';

import { useLearnerNavigation } from '../../lib/learner-navigation';
import CongratulationsScreen from '../../src/screens/CongratulationsScreen';

export default function CongratulationsRoute() {
  const navigation = useLearnerNavigation();
  const { correct, total, percent } = useLocalSearchParams<{
    correct?: string;
    total?: string;
    percent?: string;
  }>();

  return (
    <CongratulationsScreen
      navigation={navigation}
      correct={correct ? Number(correct) : undefined}
      total={total ? Number(total) : undefined}
      percent={percent ? Number(percent) : undefined}
    />
  );
}
