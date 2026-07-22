import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { AuthLoadingModal } from '../components/AuthLoadingModal';
import { SocialAuthButton } from '../components/SocialAuthButton';
import { useAuth } from '../../hooks/useAuth';
import { useTenant } from '../../hooks/useTenant';
import { showSocialLoginUnavailable } from '../../lib/social-auth';
import type { LearnerNavigation } from '../../lib/learner-navigation';

type Props = {
  navigation: LearnerNavigation;
};

export default function SignInScreen({ navigation }: Props) {
  const theme = useTheme();
  const { login, loading } = useAuth();
  const { subdomain, tenantName } = useTenant();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSignIn = async () => {
    setError(null);
    setSubmitting(true);
    try {
      await login(email.trim(), password, subdomain);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign in failed');
    } finally {
      setSubmitting(false);
    }
  };

  const showLoading = submitting || loading;

  return (
    <>
      <ScrollView
        contentContainerStyle={[styles.container, { backgroundColor: theme.background }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Back Button */}
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={[styles.backArrow, { color: theme.text }]}>{'<'}</Text>
        </TouchableOpacity>

        {/* Heading */}
        <Text style={[styles.heading, { color: theme.text }]}>Welcome back Folks</Text>
        <Text style={[styles.subHeading, { color: theme.subtext }]}>
          Continue your learning journey{tenantName ? ` with ${tenantName}` : ''}!
        </Text>

        <Text style={[styles.tenantHint, { color: theme.subtext }]}>Tenant: {subdomain}</Text>

        {/* Form */}
        <View style={styles.form}>
          <Text style={[styles.label, { color: theme.text }]}>Email</Text>
          <TextInput
            style={[styles.input, { borderColor: '#d0d0d0', color: theme.text, backgroundColor: theme.background }]}
            placeholder="Enter your email"
            placeholderTextColor={theme.subtext}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Text style={[styles.label, { color: theme.text }]}>Password</Text>
          <View style={[styles.passwordRow, { borderColor: '#d0d0d0', backgroundColor: theme.background }]}>
            <TextInput
              style={[styles.passwordInput, { color: theme.text }]}
              placeholder="Password"
              placeholderTextColor={theme.subtext}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword((p) => !p)}>
              <Text style={[styles.toggleTxt, { color: theme.subtext }]}>{showPassword ? 'Hide' : 'Show'}</Text>
            </TouchableOpacity>
          </View>

      {/* Buttons */}
      <View style={styles.buttons}>
        <TouchableOpacity
          style={[styles.socialBtn, { borderColor: '#d0d0d0' }]}
          onPress={() => showSocialLoginUnavailable('google')}
        >
          <Text style={[styles.socialTxt, { color: theme.text }]}>Continue with Google</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.socialBtn, { borderColor: '#d0d0d0' }]}
          onPress={() => showSocialLoginUnavailable('apple')}
        >
          <Text style={[styles.socialTxt, { color: theme.text }]}>Continue with Apple</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.socialBtn, { borderColor: '#d0d0d0' }]}
          onPress={() => showSocialLoginUnavailable('facebook')}
        >
          <Text style={[styles.socialTxt, { color: theme.text }]}>Continue with Facebook</Text>
        </TouchableOpacity>

          {error ? <Text style={[styles.errorTxt, { color: '#c62828' }]}>{error}</Text> : null}

          <TouchableOpacity
            style={[styles.signInBtn, { backgroundColor: theme.btnPrimary, opacity: showLoading ? 0.7 : 1 }]}
            onPress={handleSignIn}
            disabled={showLoading || !email.trim() || !password}
          >
            <Text style={[styles.signInTxt, { color: theme.btnPrimaryText }]}>Sign in</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      <AuthLoadingModal visible={showLoading} variant="sign-in" />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 56,
    paddingBottom: 40,
  },
  backBtn: {
    marginBottom: 24,
    alignSelf: 'flex-start',
  },
  backArrow: {
    fontSize: 24,
  },
  heading: {
    fontSize: 26,
    fontWeight: '700',
    marginBottom: 6,
  },
  subHeading: {
    fontSize: 15,
    marginBottom: 8,
  },
  tenantHint: {
    fontSize: 12,
    marginBottom: 24,
  },
  form: {
    width: '100%',
    marginBottom: 28,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    marginBottom: 20,
  },
  passwordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    marginBottom: 16,
  },
  passwordInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 14,
  },
  toggleTxt: {
    fontSize: 13,
    fontWeight: '500',
  },
  rememberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmark: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  rememberTxt: {
    fontSize: 13,
  },
  forgotTxt: {
    fontSize: 13,
    fontWeight: '600',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    gap: 10,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerTxt: {
    fontSize: 13,
  },
  buttons: {
    width: '100%',
    gap: 14,
  },
  signInBtn: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 50,
    alignItems: 'center',
  },
  signInTxt: {
    fontSize: 15,
    fontWeight: '600',
  },
  errorTxt: {
    fontSize: 13,
    textAlign: 'center',
  },
});
