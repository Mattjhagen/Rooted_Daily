// app/_layout.tsx

import { useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { 
  useFonts, 
  Lora_400Regular, 
  Lora_400Regular_Italic, 
  Lora_600SemiBold 
} from '@expo-google-fonts/lora';
import { 
  DMSans_400Regular, 
  DMSans_500Medium, 
  DMSans_600SemiBold 
} from '@expo-google-fonts/dm-sans';
import { EBGaramond_400Regular, EBGaramond_600SemiBold } from '@expo-google-fonts/eb-garamond';
import { PlayfairDisplay_400Regular, PlayfairDisplay_700Bold } from '@expo-google-fonts/playfair-display';
import { Inter_400Regular, Inter_600SemiBold } from '@expo-google-fonts/inter';
import { Montserrat_400Regular, Montserrat_600SemiBold } from '@expo-google-fonts/montserrat';
import { Caveat_400Regular, Caveat_700Bold } from '@expo-google-fonts/caveat';
import { colors } from '../src/theme/colors';

import { useState } from 'react';
import { initializeBible } from '../src/features/bible/bibleLoader';
import { LoadingScreen } from '../src/components/LoadingScreen';
import { MiniPlayer } from '../src/components/MiniPlayer';
import { FullPlayerModal } from '../src/components/FullPlayerModal';
import { audioService } from '../src/services/audio/AudioService';
import { ToastProvider } from '../src/context/ToastContext';
import { Toast } from '../src/components/Toast';
import { WhatsNewModal } from '../src/components/WhatsNewModal';
import { AuthService } from '../src/services/auth/AuthService';
import { useJournalStore } from '../src/features/journal/journalStore';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const themeColors = isDark ? colors.dark : colors;
  
  const [bibleReady, setBibleReady] = useState(false);
  const [initProgress, setInitProgress] = useState(0);
  const [initMessage, setInitMessage] = useState('Preparing your Bible...');

  const [fontsLoaded, fontError] = useFonts({
    Lora_400Regular,
    Lora_400Regular_Italic,
    Lora_600SemiBold,
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_600SemiBold,
    EBGaramond_400Regular,
    EBGaramond_600SemiBold,
    PlayfairDisplay_400Regular,
    PlayfairDisplay_700Bold,
    Inter_400Regular,
    Inter_600SemiBold,
    Montserrat_400Regular,
    Montserrat_600SemiBold,
    Caveat_400Regular,
    Caveat_700Bold,
  });

  useEffect(() => {
    async function startApp() {
      if (fontsLoaded || fontError) {
        // Only hide splash when we are ready to show something (either loading screen or app)
        // SplashScreen.hideAsync(); // Move this down
      }
    }
    startApp();
  }, [fontsLoaded, fontError]);

  useEffect(() => {
    if (fontsLoaded || fontError) {
      const init = async () => {
        try {
          // await audioService.init(); // Disabled for Android parity
          setInitMessage('Initializing offline Bible...');
          await initializeBible((p) => {
            setInitProgress(p);
          });
          setBibleReady(true);
          await SplashScreen.hideAsync();
        } catch (err) {
          console.error('Bible init failed', err);
          setBibleReady(true); // Fallback to let user in
          await SplashScreen.hideAsync();
        }
      };
      init();
    }
  }, [fontsLoaded, fontError]);

  // Auth & Sync Listener
  useEffect(() => {
    const sync = useJournalStore.getState().syncEntries;
    
    // Initial sync
    sync();

    // Listen for sign-ins
    const { data: { subscription } } = AuthService.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN') {
        sync();
      } else if (event === 'SIGNED_OUT') {
        // Optionally clear entries or keep them (they are local anyway)
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  if (!bibleReady) {
    return (
      <ToastProvider>
        <LoadingScreen progress={initProgress} message={initMessage} />
        <Toast />
      </ToastProvider>
    );
  }

  return (
    <ToastProvider>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: themeColors.background,
          },
          headerTintColor: themeColors.text,
          headerTitleStyle: {
            fontFamily: 'DMSans_600SemiBold',
          },
          headerBackTitle: 'Back',
          contentStyle: {
            backgroundColor: themeColors.background,
          },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="chat/[ref]" options={{ title: 'AI Reflection' }} />
        <Stack.Screen name="chat/inbox" options={{ title: 'Messages' }} />
        <Stack.Screen name="chat/dm/[id]" options={{ title: 'Chat' }} />
        <Stack.Screen name="verse/[ref]" options={{ title: 'Scripture' }} />
        <Stack.Screen name="reader/[ref]" options={{ headerShown: false }} />
      </Stack>
      <Toast />
      <WhatsNewModal />
    </ToastProvider>
  );
}
