import React, { useState } from 'react';
import {
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { requestPasswordReset } from '../../lib/auth-api';
import type { LearnerNavigation } from '../../lib/learner-navigation';

type Props = {
  navigation: LearnerNavigation;
};

export default function ForgotPasswordScreen({ navigation }: Props) {
  const theme = useTheme();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const handleSend = async () => {
    setError(null);
    setLoading(true);
    try {
      await requestPasswordReset(email);
      setSent(true);
      navigation.navigate('OTP', { email: email.trim().toLowerCase() });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send reset code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        contentContainerStyle={[styles.container, { backgroundColor: theme.background }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={[styles.backArrow, { color: theme.text }]}>{'←'}</Text>
        </TouchableOpacity>

        <Text style={[styles.heading, { color: theme.text }]}>Forgot Your Password?</Text>
        <Text style={[styles.description, { color: theme.subtext }]}>
          Enter the email on your account. We will send a reset code you can paste on the next screen.
        </Text>

        <Text style={[styles.label, { color: theme.text }]}>Enter Your Registered Email</Text>
        <TextInput
          style={[styles.input, { borderColor: '#d0d0d0', color: theme.text, backgroundColor: theme.background }]}
          placeholder="email@gmail.com"
          placeholderTextColor={theme.subtext}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        {error ? <Text style={styles.errorTxt}>{error}</Text> : null}
        {sent ? (
          <Text style={[styles.successTxt, { color: theme.btnPrimary }]}>
            If that email exists, a reset code was sent.
          </Text>
        ) : null}

        <TouchableOpacity
          style={[styles.sendBtn, { backgroundColor: theme.btnPrimary, opacity: loading ? 0.7 : 1 }]}
          onPress={handleSend}
          disabled={loading || !email.trim()}
        >
          {loading ? (
            <ActivityIndicator color={theme.btnPrimaryText} />
          ) : (
            <Text style={[styles.sendTxt, { color: theme.btnPrimaryText }]}>Send Code</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
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
    marginBottom: 28,
    alignSelf: 'flex-start',
  },
  backArrow: {
    fontSize: 24,
  },
  heading: {
    fontSize: 26,
    fontWeight: '700',
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 36,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    marginBottom: 16,
  },
  errorTxt: {
    color: '#c62828',
    fontSize: 13,
    marginBottom: 12,
  },
  successTxt: {
    fontSize: 13,
    marginBottom: 12,
  },
  sendBtn: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 50,
    alignItems: 'center',
    marginTop: 8,
  },
  sendTxt: {
    fontSize: 15,
    fontWeight: '600',
  },
});
