import { useLocalSearchParams } from 'expo-router';

import { useLearnerNavigation } from '../../lib/learner-navigation';
import OTPScreen from '../../src/screens/OTPScreen';

export default function OTPScreenRoute() {
  const navigation = useLearnerNavigation();
  const { email, token } = useLocalSearchParams<{ email?: string; token?: string }>();

  return (
    <OTPScreen
      navigation={navigation}
      email={typeof email === 'string' ? email : ''}
      initialToken={typeof token === 'string' ? token : ''}
    />
  );
}
