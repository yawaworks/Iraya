import { useState } from 'react';
import { Pressable, StyleSheet, TextInput } from 'react-native';
import { signIn, signUp } from '@iraya/supabase-client';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export default function LoginScreen() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const theme = useTheme();

  async function handleSubmit() {
    setError(null);
    setLoading(true);

    try {
      const result = isSignUp
        ? await signUp(email, password, username)
        : await signIn(email, password);

      if (result.error || !result.data?.session?.user) {
        setError(result.error?.message ?? 'Unable to sign in. Please check your credentials.');
        return;
      }

      // Root layout's auth listener picks up the new session and redirects
      // to /onboarding or /(tabs) automatically — nothing to do here.
    } catch (err) {
      setError(
        err instanceof Error
          ? `Request failed: ${err.message}`
          : 'Something went wrong. Check your connection and try again.'
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="subtitle" style={styles.title}>
        {isSignUp ? 'Sign Up' : 'Log In'}
      </ThemedText>

      {isSignUp && (
        <TextInput
          placeholder="Username"
          placeholderTextColor={theme.textSecondary}
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
          style={[styles.input, { color: theme.text, borderColor: theme.backgroundSelected }]}
        />
      )}

      <TextInput
        placeholder="Email"
        placeholderTextColor={theme.textSecondary}
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        style={[styles.input, { color: theme.text, borderColor: theme.backgroundSelected }]}
      />

      <TextInput
        placeholder="Password"
        placeholderTextColor={theme.textSecondary}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={[styles.input, { color: theme.text, borderColor: theme.backgroundSelected }]}
      />

      {error && <ThemedText style={styles.error}>{error}</ThemedText>}

      <Pressable
        onPress={handleSubmit}
        disabled={loading}
        style={({ pressed }) => [
          styles.button,
          { backgroundColor: theme.text, opacity: pressed || loading ? 0.7 : 1 },
        ]}>
        <ThemedText style={[styles.buttonText, { color: theme.background }]}>
          {loading ? 'Loading...' : isSignUp ? 'Sign Up' : 'Log In'}
        </ThemedText>
      </Pressable>

      <Pressable onPress={() => setIsSignUp(!isSignUp)} style={styles.switchLink}>
        <ThemedText type="linkPrimary">
          {isSignUp ? 'Already have an account? Log in' : 'No account? Sign up'}
        </ThemedText>
      </Pressable>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', paddingHorizontal: Spacing.four, gap: Spacing.three },
  title: { marginBottom: Spacing.three },
  input: {
    borderWidth: 1,
    borderRadius: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
    fontSize: 16,
  },
  error: { color: '#ff4d4d' },
  button: { borderRadius: Spacing.five, paddingVertical: Spacing.three, alignItems: 'center' },
  buttonText: { fontWeight: '600' },
  switchLink: { alignItems: 'center', marginTop: Spacing.two },
});