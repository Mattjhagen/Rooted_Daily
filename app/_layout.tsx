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
import { colors } from '../src/theme/colors';

import { useState } from 'react';
import { initializeBible } from '../src/features/bible/bibleLoader';
import { LoadingScreen } from '../src/components/LoadingScreen';
import { MiniPlayer } from '../src/components/MiniPlayer';
import { audioService } from '../src/services/audio/AudioService';

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
          await audioService.init(); // Init Audio settings
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

  if (!fontsLoaded && !fontError) {
    return null;
  }

  if (!bibleReady) {
    return <LoadingScreen progress={initProgress} message={initMessage} />;
  }

  return (
    <>
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
          contentStyle: {
            backgroundColor: themeColors.background,
          },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="chat/[ref]" options={{ title: 'Reflection' }} />
        <Stack.Screen name="verse/[ref]" options={{ title: 'Scripture' }} />
        <Stack.Screen name="reader/[ref]" options={{ headerShown: false }} />
      </Stack>
      <MiniPlayer />
    </>
  );
}
