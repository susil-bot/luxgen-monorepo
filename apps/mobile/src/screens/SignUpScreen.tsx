import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import Image5 from '../assets/images/image 5.svg';
import { SocialAuthButton } from '../components/SocialAuthButton';
import { useTheme } from '../theme/ThemeContext';
import type { LearnerNavigation } from '../../lib/learner-navigation';

type Props = {
  navigation: LearnerNavigation;
};

export default function SignUpScreen({ navigation }: Props) {
  const theme = useTheme();

  return (
    <ScrollView
      contentContainerStyle={[styles.container, { backgroundColor: theme.background }]}
      showsVerticalScrollIndicator={false}
    >
      <Image5 width={160} height={160} style={styles.image} />

      <Text style={[styles.header, { color: theme.text }]}>Let's Get Started</Text>
      <Text style={[styles.subHeader, { color: theme.subtext }]}>Log in before you start learning</Text>

      <View style={styles.socialButtons}>
        <SocialAuthButton provider="google" />
        <SocialAuthButton provider="apple" />
        <SocialAuthButton provider="facebook" />
      </View>

      <TouchableOpacity
        style={[styles.signUpBtn, { backgroundColor: theme.btnPrimary }]}
        onPress={() => navigation.navigate('SignUpForm')}
      >
        <Text style={[styles.signUpTxt, { color: theme.btnPrimaryText }]}>Sign up</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.signInBtn, { borderColor: theme.btnPrimary }]}
        onPress={() => navigation.navigate('SignIn')}
      >
        <Text style={[styles.signInTxt, { color: theme.btnPrimary }]}>Sign in</Text>
      </TouchableOpacity>

      <View style={styles.footer}>
        <TouchableOpacity>
          <Text style={[styles.footerLink, { color: theme.subtext }]}>Privacy Policy</Text>
        </TouchableOpacity>
        <Text style={[styles.footerDot, { color: theme.subtext }]}>{'   •   '}</Text>
        <TouchableOpacity>
          <Text style={[styles.footerLink, { color: theme.subtext }]}>Terms of Service</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 32,
  },
  image: {
    marginBottom: 32,
  },
  header: {
    fontSize: 26,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  subHeader: {
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 36,
  },
  socialButtons: {
    width: '100%',
    gap: 14,
    marginBottom: 20,
  },
  signUpBtn: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 50,
    alignItems: 'center',
    marginBottom: 14,
  },
  signUpTxt: {
    fontSize: 15,
    fontWeight: '600',
  },
  signInBtn: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 50,
    borderWidth: 1.5,
    alignItems: 'center',
    marginBottom: 28,
  },
  signInTxt: {
    fontSize: 15,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  footerLink: {
    fontSize: 12,
  },
  footerDot: {
    fontSize: 12,
  },
});
