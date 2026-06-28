import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { useAuth } from '../../hooks/useAuth';
import { useTenant } from '../../hooks/useTenant';
import type { LearnerNavigation } from '../../lib/learner-navigation';

type Props = {
  navigation: LearnerNavigation;
};

function nameFromEmail(email: string): { firstName: string; lastName: string } {
  const local = email.split('@')[0] ?? 'learner';
  const parts = local.split(/[._-]/).filter(Boolean);
  if (parts.length >= 2) {
    return {
      firstName: parts[0].charAt(0).toUpperCase() + parts[0].slice(1),
      lastName: parts[1].charAt(0).toUpperCase() + parts[1].slice(1),
    };
  }
  return { firstName: local.charAt(0).toUpperCase() + local.slice(1), lastName: 'Learner' };
}

export default function SignUpFormScreen({ navigation }: Props) {
  const theme = useTheme();
  const { register, loading } = useAuth();
  const { subdomain, tenantId } = useTenant();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignUp = async () => {
    if (!tenantId) {
      setError('Tenant is still loading. Try again in a moment.');
      return;
    }
    setError(null);
    const { firstName, lastName } = nameFromEmail(email.trim());
    try {
      await register({
        email,
        password,
        firstName,
        lastName,
        tenantId,
        tenantSubdomain: subdomain,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign up failed');
    }
  };

  return (
    <ScrollView
      contentContainerStyle={[styles.container, { backgroundColor: theme.background }]}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {/* Back Button */}
      <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
        <Text style={[styles.backArrow, { color: theme.text }]}>{'←'}</Text>
      </TouchableOpacity>

      {/* Heading */}
      <Text style={[styles.heading, { color: theme.text }]}>Join Codu Now!</Text>
      <Text style={[styles.subHeading, { color: theme.subtext }]}>Join now to be a pro at coding</Text>

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

        {/* Checkbox */}
        <TouchableOpacity style={styles.checkboxRow} onPress={() => setAgreed((a) => !a)}>
          <View
            style={[
              styles.checkbox,
              { borderColor: theme.btnPrimary, backgroundColor: agreed ? theme.btnPrimary : 'transparent' },
            ]}
          >
            {agreed && <Text style={styles.checkmark}>✓</Text>}
          </View>
          <Text style={[styles.checkboxTxt, { color: theme.subtext }]}>
            I Agree to Codu.id{' '}
            <Text style={{ color: theme.btnPrimary, textDecorationLine: 'underline' }}>Term and Condition</Text>
          </Text>
        </TouchableOpacity>
      </View>

      {/* Already have account */}
      <View style={styles.signinRow}>
        <Text style={[styles.signinTxt, { color: theme.subtext }]}>Already have an Account? </Text>
        <TouchableOpacity onPress={() => navigation.navigate('SignIn')}>
          <Text style={[styles.signinLink, { color: theme.btnPrimary }]}>Sign in</Text>
        </TouchableOpacity>
      </View>

      {/* Divider */}
      <View style={styles.dividerRow}>
        <View style={[styles.dividerLine, { backgroundColor: '#d0d0d0' }]} />
        <Text style={[styles.dividerTxt, { color: theme.subtext }]}>or</Text>
        <View style={[styles.dividerLine, { backgroundColor: '#d0d0d0' }]} />
      </View>

      {/* Social + Signup Buttons */}
      <View style={styles.buttons}>
        <TouchableOpacity style={[styles.socialBtn, { borderColor: '#d0d0d0' }]}>
          <Text style={[styles.socialTxt, { color: theme.text }]}>Continue with Google</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.socialBtn, { borderColor: '#d0d0d0' }]}>
          <Text style={[styles.socialTxt, { color: theme.text }]}>Continue with Apple</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.signupBtn,
            {
              backgroundColor: theme.btnPrimary,
              opacity: loading || !agreed || !email.trim() || password.length < 8 ? 0.6 : 1,
            },
          ]}
          disabled={loading || !agreed || !email.trim() || password.length < 8}
          onPress={handleSignUp}
        >
          {loading ? (
            <ActivityIndicator color={theme.btnPrimaryText} />
          ) : (
            <Text style={[styles.signupTxt, { color: theme.btnPrimaryText }]}>Sign up</Text>
          )}
        </TouchableOpacity>

        {error ? <Text style={styles.errorTxt}>{error}</Text> : null}
      </View>
    </ScrollView>
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
    marginBottom: 32,
  },
  form: {
    width: '100%',
    marginBottom: 24,
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
    marginBottom: 20,
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
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
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
  checkboxTxt: {
    fontSize: 13,
    flex: 1,
  },
  signinRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 28,
  },
  signinTxt: {
    fontSize: 14,
  },
  signinLink: {
    fontSize: 14,
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
  socialBtn: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 50,
    borderWidth: 1,
    backgroundColor: '#ffffff',
    alignItems: 'center',
  },
  socialTxt: {
    fontSize: 15,
    fontWeight: '500',
  },
  signupBtn: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 50,
    alignItems: 'center',
  },
  signupTxt: {
    fontSize: 15,
    fontWeight: '600',
  },
  errorTxt: {
    color: '#c62828',
    fontSize: 13,
    textAlign: 'center',
    marginTop: 8,
  },
});
