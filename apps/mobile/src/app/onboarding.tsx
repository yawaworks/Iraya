import { useEffect, useState } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import {
  AESTHETIC_TAGS,
  getCurrentUser,
  getProfile,
  updateAestheticPreferences,
} from '@iraya/supabase-client';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export default function OnboardingScreen() {
  const [userId, setUserId] = useState<string | null>(null);
  const [selected, setSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const router = useRouter();
  const theme = useTheme();

  useEffect(() => {
    let mounted = true;

    async function load() {
      const user = await getCurrentUser();
      if (!user) return; // root layout handles redirecting to /login

      if (mounted) setUserId(user.id);

      const { data } = await getProfile(user.id);
      if (!mounted) return;

      setSelected(data?.aesthetic_preferences ?? []);
      setLoading(false);
    }

    load();
    return () => {
      mounted = false;
    };
  }, []);

  function toggleTag(tagId: string) {
    setSelected((prev) => (prev.includes(tagId) ? prev.filter((t) => t !== tagId) : [...prev, tagId]));
  }

  async function handleContinue() {
    if (!userId) return;
    setSaving(true);
    await updateAestheticPreferences(userId, selected);
    router.replace('/(tabs)');
  }

  if (loading) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText>Loading...</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="subtitle">Pick your vibe</ThemedText>
      <ThemedText themeColor="textSecondary" style={styles.subtitle}>
        Choose the aesthetics you&apos;re drawn to — you can change these anytime.
      </ThemedText>

      <ThemedView style={styles.grid}>
        {AESTHETIC_TAGS.map((tag) => {
          const isSelected = selected.includes(tag.id);
          return (
            <Pressable key={tag.id} onPress={() => toggleTag(tag.id)} style={styles.tagWrapper}>
              <ThemedView
                type={isSelected ? 'backgroundSelected' : 'backgroundElement'}
                style={styles.tag}>
                <ThemedText style={styles.tagText}>{tag.label}</ThemedText>
              </ThemedView>
            </Pressable>
          );
        })}
      </ThemedView>

      <ThemedView style={styles.footer}>
        <Pressable onPress={() => router.replace('/(tabs)')}>
          <ThemedText themeColor="textSecondary">Skip for now</ThemedText>
        </Pressable>

        <Pressable
          onPress={handleContinue}
          disabled={saving}
          style={({ pressed }) => [
            styles.continueButton,
            { backgroundColor: theme.text, opacity: pressed || saving ? 0.7 : 1 },
          ]}>
          <ThemedText style={[styles.continueText, { color: theme.background }]}>
            {saving ? 'Saving...' : `Continue (${selected.length})`}
          </ThemedText>
        </Pressable>
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: Spacing.four, paddingTop: Spacing.six, gap: Spacing.three },
  subtitle: { marginBottom: Spacing.two },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
  tagWrapper: { width: '48%' },
  tag: { borderRadius: Spacing.two, paddingVertical: Spacing.three, alignItems: 'center' },
  tagText: { fontWeight: '600' },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 'auto',
    paddingBottom: Spacing.five,
  },
  continueButton: { borderRadius: Spacing.five, paddingHorizontal: Spacing.four, paddingVertical: Spacing.three },
  continueText: { fontWeight: '600' },
});