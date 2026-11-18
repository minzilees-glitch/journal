import { NotoSerifKR_500Medium, useFonts } from '@expo-google-fonts/noto-serif-kr';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';

import { JournalScreen } from './src/JournalScreen';
import { NotesProvider, useNotes } from './src/NotesContext';
import { PaperScreen } from './src/PaperScreen';
import { PhoneShell } from './src/PhoneShell';
import { WriteScreen } from './src/WriteScreen';
import './src/web.css';

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

  return (
    <PhoneShell>
      <StatusBar style="dark" />
      {fontsLoaded ? (
        <NotesProvider>
          <Root />
        </NotesProvider>
      ) : (
        <PaperScreen />
      )}
    </PhoneShell>
  );
}
