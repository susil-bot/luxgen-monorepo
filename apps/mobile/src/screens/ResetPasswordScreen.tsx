import React, { useState } from 'react';
import {
  View,
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
import { resetPasswordWithToken } from '../../lib/auth-api';
import type { LearnerNavigation } from '../../lib/learner-navigation';

type Props = {
  navigation: LearnerNavigation;
  resetToken?: string;
};

export default function ResetPasswordScreen({ navigation, resetToken = '' }: Props) {
  const theme = useTheme();
  const [token, setToken] = useState(resetToken);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isValid = token.trim().length > 0 && newPassword.length >= 8 && newPassword === confirmPassword;

  const handleSave = async () => {
    setError(null);
    setLoading(true);
    try {
      await resetPasswordWithToken(token, newPassword);
      navigation.navigate('ResetSuccess');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Password reset failed');
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
          <Text style={[styles.backArrow, { color: theme.text }]}>{'<'}</Text>
        </TouchableOpacity>

        <Text style={[styles.heading, { color: theme.text }]}>Reset Your Password</Text>
        <Text style={[styles.description, { color: theme.subtext }]}>
          Enter your reset code and choose a new password (minimum 8 characters).
        </Text>

        <Text style={[styles.label, { color: theme.text }]}>Reset Code</Text>
        <TextInput
          style={[styles.tokenInput, { borderColor: '#d0d0d0', color: theme.text, backgroundColor: theme.background }]}
          placeholder="Paste reset code"
          placeholderTextColor={theme.subtext}
          value={token}
          onChangeText={setToken}
          autoCapitalize="none"
          autoCorrect={false}
        />

        <Text style={[styles.label, { color: theme.text }]}>Enter New Password</Text>
        <View style={[styles.passwordRow, { borderColor: '#d0d0d0', backgroundColor: theme.background }]}>
          <TextInput
            style={[styles.passwordInput, { color: theme.text }]}
            placeholder="New password"
            placeholderTextColor={theme.subtext}
            value={newPassword}
            onChangeText={setNewPassword}
            secureTextEntry={!showNew}
          />
          <TouchableOpacity onPress={() => setShowNew((v) => !v)}>
            <Text style={[styles.toggleTxt, { color: theme.subtext }]}>{showNew ? 'Hide' : 'Show'}</Text>
          </TouchableOpacity>
        </View>

        <Text style={[styles.label, { color: theme.text }]}>Confirm Your Password</Text>
        <View style={[styles.passwordRow, { borderColor: '#d0d0d0', backgroundColor: theme.background }]}>
          <TextInput
            style={[styles.passwordInput, { color: theme.text }]}
            placeholder="Confirm password"
            placeholderTextColor={theme.subtext}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry={!showConfirm}
          />
          <TouchableOpacity onPress={() => setShowConfirm((v) => !v)}>
            <Text style={[styles.toggleTxt, { color: theme.subtext }]}>{showConfirm ? 'Hide' : 'Show'}</Text>
          </TouchableOpacity>
        </View>

        {confirmPassword.length > 0 && newPassword !== confirmPassword ? (
          <Text style={styles.errorTxt}>Passwords do not match</Text>
        ) : null}
        {error ? <Text style={styles.errorTxt}>{error}</Text> : null}

        <TouchableOpacity
          style={[styles.saveBtn, { backgroundColor: isValid ? theme.btnPrimary : '#ccc', opacity: loading ? 0.7 : 1 }]}
          disabled={!isValid || loading}
          onPress={handleSave}
        >
          {loading ? (
            <ActivityIndicator color={theme.btnPrimaryText} />
          ) : (
            <Text style={[styles.saveTxt, { color: theme.btnPrimaryText }]}>Save New Password</Text>
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
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  tokenInput: {
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
    marginBottom: 24,
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
  errorTxt: {
    color: '#e53935',
    fontSize: 12,
    marginBottom: 16,
  },
  saveBtn: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 50,
    alignItems: 'center',
    marginTop: 8,
  },
  saveTxt: {
    fontSize: 15,
    fontWeight: '600',
  },
});
