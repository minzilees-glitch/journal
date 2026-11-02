import { NotoSerifKR_500Medium, useFonts } from '@expo-google-fonts/noto-serif-kr';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { JournalScreen } from './src/JournalScreen';
import { NotesProvider, useNotes } from './src/NotesContext';
import { PaperScreen } from './src/PaperScreen';
import { WriteScreen } from './src/WriteScreen';

SplashScreen.preventAutoHideAsync();

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

  if (!fontsLoaded) {
    return <PaperScreen />;
  }

  return (
    <SafeAreaProvider>
      <NotesProvider>
        <StatusBar style="dark" />
        <Root />
      </NotesProvider>
    </SafeAreaProvider>
  );
}
