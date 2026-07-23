import { DarkTheme, DefaultTheme, Stack, ThemeProvider, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { getCurrentUser, getProfile, supabase } from '@iraya/supabase-client';

import { AnimatedSplashOverlay } from '@/components/animated-icon';

SplashScreen.preventAutoHideAsync();

function useAuthRouting() {
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    let mounted = true;

    async function route() {
      const user = await getCurrentUser();
      if (!mounted) return;

      const inAuthGroup = segments[0] === 'login' || segments[0] === 'onboarding';

      if (!user) {
        if (!inAuthGroup) router.replace('/login');
        return;
      }

      const { data: profile } = await getProfile(user.id);
      const hasPreferences = (profile?.aesthetic_preferences?.length ?? 0) > 0;

      if (!hasPreferences) {
        if (segments[0] !== 'onboarding') router.replace('/onboarding');
      } else if (inAuthGroup) {
        router.replace('/(tabs)');
      }
    }

    route();

    const { data: authListener } = supabase.auth.onAuthStateChange(() => route());

    return () => {
      mounted = false;
      authListener.subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [segments.join('/')]);
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  useAuthRouting();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AnimatedSplashOverlay />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="login" />
        <Stack.Screen name="onboarding" />
      </Stack>
    </ThemeProvider>
  );
}