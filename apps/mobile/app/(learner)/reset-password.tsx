import { useLocalSearchParams } from 'expo-router';

import { useLearnerNavigation } from '../../lib/learner-navigation';
import ResetPasswordScreen from '../../src/screens/ResetPasswordScreen';

export default function ResetPasswordRoute() {
  const navigation = useLearnerNavigation();
  const { token } = useLocalSearchParams<{ token?: string }>();

  return <ResetPasswordScreen navigation={navigation} resetToken={typeof token === 'string' ? token : ''} />;
}
