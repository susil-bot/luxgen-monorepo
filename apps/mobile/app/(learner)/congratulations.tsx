import { useLocalSearchParams } from 'expo-router';

import CongratulationsScreen from '../../src/screens/CongratulationsScreen';

export default function CongratulationsRoute() {
  const { correct, total, percent } = useLocalSearchParams<{
    correct?: string;
    total?: string;
    percent?: string;
  }>();

  return (
    <CongratulationsScreen
      correct={correct ? Number(correct) : undefined}
      total={total ? Number(total) : undefined}
      percent={percent ? Number(percent) : undefined}
    />
  );
}
