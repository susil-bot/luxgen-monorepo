import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMutation } from '@apollo/client';

import { lightTheme } from '@luxgen/design-tokens';

import { LEARNER_CHAT_MUTATION } from '../../graphql/queries';

const theme = lightTheme;

interface ChatMessage {
  id: string;
  content: string;
  sender: 'assistant' | 'user';
}

const suggestions = [
  { title: 'Plan my learning', subtitle: 'build a study schedule around my goals' },
  { title: 'Explain a concept', subtitle: 'in a simple and practical way' },
  { title: 'Create a quiz', subtitle: 'to check what I learned today' },
  { title: 'Help me stay focused', subtitle: 'with a short, achievable next step' },
];

export default function ChatScreen() {
  const [draft, setDraft] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [sendChat, { loading }] = useMutation<{ learnerChat: { content: string } }>(LEARNER_CHAT_MUTATION);

  const sendMessage = async (content = draft) => {
    const trimmed = content.trim();
    if (!trimmed || loading) return;

    const userMessage: ChatMessage = { id: `user-${Date.now()}`, content: trimmed, sender: 'user' };
    const history = [...messages, userMessage];
    setMessages(history);
    setDraft('');
    setError(null);

    try {
      const { data } = await sendChat({
        variables: {
          messages: history.map(({ sender, content: messageContent }) => ({ role: sender, content: messageContent })),
        },
      });
      const assistantContent = data?.learnerChat.content;
      if (!assistantContent) throw new Error('The assistant returned no response');
      setMessages((current) => [
        ...current,
        { id: `assistant-${Date.now()}`, content: assistantContent, sender: 'assistant' },
      ]);
    } catch {
      setError('The learning assistant is unavailable. Please try again.');
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <KeyboardAvoidingView style={styles.safe} behavior={Platform.select({ ios: 'padding', android: undefined })}>
        <View style={styles.header}>
          <Pressable
            accessibilityLabel="Open chat menu"
            accessibilityRole="button"
            hitSlop={10}
            style={styles.menuButton}
          >
            <Text style={styles.menuIcon}>☰</Text>
          </Pressable>
          <View style={styles.avatar}>
            <Text style={styles.avatarLabel}>AI</Text>
          </View>
          <View style={styles.headerTitle}>
            <Text style={styles.title}>LuxGen AI</Text>
            <Text style={styles.premium}>Learning assistant</Text>
          </View>
          <Pressable
            accessibilityLabel="Share this chat"
            accessibilityRole="button"
            hitSlop={10}
            style={styles.shareButton}
          >
            <Text style={styles.shareIcon}>↑</Text>
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          {messages.length === 0 ? (
            <>
              <Text style={styles.welcome}>How can I help you today? ✨</Text>
              <View style={styles.suggestions}>
                {suggestions.map((suggestion) => (
                  <Pressable
                    key={suggestion.title}
                    accessibilityRole="button"
                    onPress={() => void sendMessage(`${suggestion.title}: ${suggestion.subtitle}`)}
                    style={({ pressed }) => [styles.suggestion, pressed && styles.pressed]}
                  >
                    <View>
                      <Text style={styles.suggestionTitle}>{suggestion.title}</Text>
                      <Text style={styles.suggestionSubtitle}>{suggestion.subtitle}</Text>
                    </View>
                    <Text style={styles.arrow}>↗</Text>
                  </Pressable>
                ))}
              </View>
            </>
          ) : (
            <View style={styles.messages}>
              {messages.map((message) => (
                <View
                  key={message.id}
                  style={[styles.message, message.sender === 'user' ? styles.userMessage : styles.assistantMessage]}
                >
                  <Text style={styles.messageText}>{message.content}</Text>
                </View>
              ))}
            </View>
          )}
          {error ? <Text style={styles.error}>{error}</Text> : null}
        </ScrollView>

        <View style={styles.composer}>
          <TextInput
            accessibilityLabel="Message LuxGen AI"
            value={draft}
            onChangeText={setDraft}
            onSubmitEditing={() => void sendMessage()}
            placeholder="Ask me anything..."
            placeholderTextColor={theme.colors.labelTertiary}
            returnKeyType="send"
            style={styles.input}
          />
          <Pressable
            accessibilityLabel="Attach an image"
            accessibilityRole="button"
            hitSlop={8}
            style={styles.attachButton}
          >
            <Text style={styles.attachIcon}>▧</Text>
          </Pressable>
          <Pressable
            accessibilityLabel="Send message"
            accessibilityRole="button"
            disabled={!draft.trim() || loading}
            onPress={() => void sendMessage()}
            style={({ pressed }) => [
              styles.sendButton,
              (!draft.trim() || loading) && styles.sendDisabled,
              pressed && styles.pressed,
            ]}
          >
            <Text style={styles.sendIcon}>{loading ? '…' : '➤'}</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.colors.bgSecondary },
  header: {
    alignItems: 'center',
    borderBottomColor: theme.colors.separator,
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    minHeight: 70,
    paddingHorizontal: 20,
  },
  menuButton: { marginRight: 16 },
  menuIcon: { color: theme.colors.labelPrimary, fontSize: 24 },
  avatar: {
    alignItems: 'center',
    backgroundColor: theme.colors.labelPrimary,
    borderRadius: theme.radius.full,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  avatarLabel: { color: theme.colors.bgSecondary, fontSize: 13, fontWeight: '800' },
  headerTitle: { flex: 1, marginLeft: 12 },
  title: { color: theme.colors.labelPrimary, fontSize: 18, fontWeight: '700' },
  premium: { color: theme.colors.pink, fontSize: 12, marginTop: 1 },
  shareButton: { paddingHorizontal: 4 },
  shareIcon: { color: theme.colors.labelSecondary, fontSize: 25, fontWeight: '300' },
  content: { flexGrow: 1, paddingHorizontal: 24, paddingTop: 50 },
  welcome: { color: theme.colors.labelPrimary, fontSize: 16, fontWeight: '700', textAlign: 'center' },
  suggestions: { gap: 16, marginTop: 30 },
  suggestion: {
    alignItems: 'center',
    borderColor: theme.colors.separator,
    borderRadius: theme.radius.xl,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 98,
    paddingHorizontal: 22,
    paddingVertical: 16,
  },
  suggestionTitle: { color: theme.colors.labelPrimary, fontSize: 16, fontWeight: '700' },
  suggestionSubtitle: { color: theme.colors.labelSecondary, fontSize: 13, lineHeight: 19, marginTop: 7, maxWidth: 230 },
  arrow: { color: theme.colors.labelSecondary, fontSize: 22 },
  messages: { gap: 12, paddingBottom: 16 },
  error: { color: theme.colors.red, fontSize: 14, textAlign: 'center' },
  message: { borderRadius: theme.radius.lg, maxWidth: '84%', paddingHorizontal: 15, paddingVertical: 12 },
  assistantMessage: { alignSelf: 'flex-start', backgroundColor: theme.colors.bgTertiary },
  userMessage: { alignSelf: 'flex-end', backgroundColor: theme.colors.purple },
  messageText: { color: theme.colors.labelPrimary, fontSize: 15, lineHeight: 21 },
  composer: {
    alignItems: 'center',
    borderColor: theme.colors.separator,
    borderRadius: theme.radius.full,
    borderWidth: 1,
    flexDirection: 'row',
    marginBottom: 14,
    marginHorizontal: 20,
    minHeight: 54,
    paddingLeft: 18,
    paddingRight: 5,
  },
  input: { color: theme.colors.labelPrimary, flex: 1, fontSize: 15, minHeight: 48 },
  attachButton: { marginHorizontal: 10 },
  attachIcon: { color: theme.colors.labelSecondary, fontSize: 22 },
  sendButton: {
    alignItems: 'center',
    backgroundColor: theme.colors.pink,
    borderRadius: theme.radius.full,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  sendDisabled: { opacity: 0.4 },
  sendIcon: { color: theme.colors.bgSecondary, fontSize: 20, marginLeft: -2 },
  pressed: { opacity: 0.78 },
});
