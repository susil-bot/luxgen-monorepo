/**
 * Legacy React Navigation stack — not mounted in the LuxGen app.
 * Routes live under app/(learner)/ via Expo Router + lib/learner-navigation.ts.
 */
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/HomeScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import SignUpScreen from '../screens/SignUpScreen';
import SignUpFormScreen from '../screens/SignUpFormScreen';
import SignInScreen from '../screens/SignInScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import OTPScreen from '../screens/OTPScreen';
import ResetPasswordScreen from '../screens/ResetPasswordScreen';
import ResetSuccessScreen from '../screens/ResetSuccessScreen';
import QuestionProgressScreen from '../screens/QuestionProgressScreen';
import CongratulationsScreen from '../screens/CongratulationsScreen';

export type RootStackParamList = {
  Home: undefined;
  Onboarding: undefined;
  SignUp: undefined;
  SignUpForm: undefined;
  SignIn: undefined;
  ForgotPassword: undefined;
  OTP: undefined;
  ResetPassword: undefined;
  ResetSuccess: undefined;
  QuestionProgress: undefined;
  Congratulations: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  return (
    <Stack.Navigator initialRouteName="Home" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      <Stack.Screen name="SignUp" component={SignUpScreen} />
      <Stack.Screen name="SignUpForm" component={SignUpFormScreen} />
      <Stack.Screen name="SignIn" component={SignInScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <Stack.Screen name="OTP" component={OTPScreen} />
      <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
      <Stack.Screen name="ResetSuccess" component={ResetSuccessScreen} />
      <Stack.Screen name="QuestionProgress" component={QuestionProgressScreen} />
      <Stack.Screen name="Congratulations" component={CongratulationsScreen} />
    </Stack.Navigator>
  );
}
