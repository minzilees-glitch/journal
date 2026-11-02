import { NotoSerifKR_500Medium, useFonts } from '@expo-google-fonts/noto-serif-kr';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { Platform } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { JournalScreen } from './src/JournalScreen';
import { NotesProvider, useNotes } from './src/NotesContext';
import { PaperScreen } from './src/PaperScreen';
import { WriteScreen } from './src/WriteScreen';

SplashScreen.preventAutoHideAsync();

const webMetrics = {
  frame: { x: 0, y: 0, width: 0, height: 0 },
  insets: { top: 0, left: 0, right: 0, bottom: 0 },
};

function Root() {
  const { ready, screen } = useNotes();

  useEffect(() => {
    if (ready) {
      void SplashScreen.hideAsync();
    }
  }, [ready]);

  if (!ready) {
    return <PaperScreen />;
  }

  return screen === 'journal' ? <JournalScreen /> : <WriteScreen />;
}

export default function App() {
  const [fontsLoaded] = useFonts({
    NotoSerifKR_500Medium,
  });

  return (
    <SafeAreaProvider initialMetrics={Platform.OS === 'web' ? webMetrics : undefined}>
      <StatusBar style="dark" />
      {fontsLoaded ? (
        <NotesProvider>
          <Root />
        </NotesProvider>
      ) : (
        <PaperScreen />
      )}
    </SafeAreaProvider>
  );
}
