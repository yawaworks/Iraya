import { useCallback, useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
import {
  getCurrentUser,
  getDiscoveryFeed,
  getProfile,
  recordSwipe,
  type Product,
} from '@iraya/supabase-client';

import { SwipeDeck } from '@/components/swipe-deck';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function DiscoverScreen() {
  const [products, setProducts] = useState<Product[] | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function load() {
      const user = await getCurrentUser();
      if (!user) return; // root layout handles redirecting to /login

      if (mounted) setUserId(user.id);

      const { data: profile } = await getProfile(user.id);
      const { data, error: feedError } = await getDiscoveryFeed(
        user.id,
        profile?.aesthetic_preferences ?? []
      );

      if (!mounted) return;
      if (feedError) {
        setError(feedError.message);
      } else {
        setProducts(data ?? []);
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, []);

  const handleSwipe = useCallback(
    (product: Product, action: 'save' | 'skip') => {
      if (!userId) return;
      recordSwipe(userId, product.id, action);
    },
    [userId]
  );

  if (error) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText style={styles.centerText}>{error}</ThemedText>
      </ThemedView>
    );
  }

  if (!products) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText>Loading your feed...</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <SwipeDeck products={products} onSwipe={handleSwipe} />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 60 },
  centerText: { textAlign: 'center', padding: 24 },
});