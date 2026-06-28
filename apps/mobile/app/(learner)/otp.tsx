import { useLocalSearchParams } from 'expo-router';

import { useLearnerNavigation } from '../../lib/learner-navigation';
import OTPScreen from '../../src/screens/OTPScreen';

export default function OTPScreenRoute() {
  const navigation = useLearnerNavigation();
  const { email } = useLocalSearchParams<{ email?: string }>();

  return <OTPScreen navigation={navigation} email={typeof email === 'string' ? email : ''} />;
}
