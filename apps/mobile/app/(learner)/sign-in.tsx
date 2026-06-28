import SignInScreen from '../../src/screens/SignInScreen';
import { useLearnerNavigation } from '../../lib/learner-navigation';

export default function SignInRoute() {
  const navigation = useLearnerNavigation();
  return <SignInScreen navigation={navigation} />;
}
