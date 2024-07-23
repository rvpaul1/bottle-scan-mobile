import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/useColorScheme';
import { ThemedText } from '@/components/ThemedText';

import '../global.css'
import { ThemedView } from '@/components/ThemedView';
import { View, Text } from 'react-native';

// Prevent the splash screen from auto-hiding before asset loading is complete.
// SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <View className="flex-1 justify-center items-center">
      <Text className="text-black text-5xl">Hello, World!</Text>
    </View>
    // <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DarkTheme}>
    //   <ThemedView className="flex-1 justify-center items-center">
    //     <ThemedText className="text-4xl text-black">Hello, World!</ThemedText>
    //   </ThemedView>
    //   <Stack>
    //     <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    //     <Stack.Screen name="+not-found" />
    //   </Stack>
    // </ThemeProvider>
  );
}
