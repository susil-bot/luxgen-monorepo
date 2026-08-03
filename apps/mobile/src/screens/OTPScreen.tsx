import React, { useState } from 'react';
import {
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { BackButton } from '../components/BackButton';
import { requestPasswordReset } from '../../lib/auth-api';
import type { LearnerNavigation } from '../../lib/learner-navigation';

type Props = {
  navigation: LearnerNavigation;
  email?: string;
  /** Prefill from forgot-password when API returns a local/dev token */
  initialToken?: string;
};

export default function OTPScreen({ navigation, email = '', initialToken = '' }: Props) {
  const theme = useTheme();
  const [token, setToken] = useState(initialToken);
  const [resending, setResending] = useState(false);
  const [message, setMessage] = useState<string | null>(
    initialToken ? 'Local/dev: reset code filled from the API (EMAIL_PROVIDER=log does not send real email).' : null,
  );
  const [error, setError] = useState<string | null>(null);

  const handleResend = async () => {
    if (!email.trim()) {
      setError('Go back and enter your email first.');
      return;
    }
    setResending(true);
    setError(null);
    try {
      const result = await requestPasswordReset(email);
      setMessage(result.message);
      if (result.resetToken) {
        setToken(result.resetToken);
        setMessage('Local/dev: new reset code filled from the API (no real email when EMAIL_PROVIDER=log).');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to resend code');
    } finally {
      setResending(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        contentContainerStyle={[styles.container, { backgroundColor: theme.background }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <BackButton onPress={() => navigation.goBack()} style={styles.backBtn} />

        <Text style={[styles.heading, { color: theme.text }]}>Enter Reset Code</Text>
        <Text style={[styles.description, { color: theme.subtext }]}>
          Paste the reset code from your email{email ? ` (${email})` : ''}. In local development the code is filled
          automatically when the API uses EMAIL_PROVIDER=log.
        </Text>

        <TextInput
          style={[styles.tokenInput, { borderColor: '#d0d0d0', color: theme.text, backgroundColor: theme.background }]}
          placeholder="Paste reset code"
          placeholderTextColor={theme.subtext}
          value={token}
          onChangeText={setToken}
          autoCapitalize="none"
          autoCorrect={false}
        />

        {error ? <Text style={styles.errorTxt}>{error}</Text> : null}
        {message ? <Text style={[styles.messageTxt, { color: theme.btnPrimary }]}>{message}</Text> : null}

        <TouchableOpacity onPress={handleResend} disabled={resending} style={styles.resendBtn}>
          <Text style={[styles.resendTxt, { color: theme.btnPrimary }]}>{resending ? 'Sending…' : 'Resend code'}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.proceedBtn, { backgroundColor: token.trim() ? theme.btnPrimary : '#ccc' }]}
          disabled={!token.trim()}
          onPress={() => navigation.navigate('ResetPassword', { token: token.trim() })}
        >
          <Text style={[styles.proceedTxt, { color: theme.btnPrimaryText }]}>Proceed</Text>
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
  },
  heading: {
    fontSize: 26,
    fontWeight: '700',
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 24,
  },
  tokenInput: {
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
    marginBottom: 8,
  },
  messageTxt: {
    fontSize: 13,
    marginBottom: 8,
  },
  resendBtn: {
    alignSelf: 'center',
    marginBottom: 32,
  },
  resendTxt: {
    fontSize: 14,
    fontWeight: '600',
  },
  proceedBtn: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 50,
    alignItems: 'center',
  },
  proceedTxt: {
    fontSize: 15,
    fontWeight: '600',
  },
});
