import { Image } from 'expo-image';
import { type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const paper = require('../assets/bg-paper.jpg');

export function PaperScreen({ children }: { children?: ReactNode }) {
  return (
    <View style={styles.root}>
      <Image source={paper} style={styles.image} contentFit="cover" />
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        {children}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  image: {
    ...StyleSheet.absoluteFill,
  },
  safe: {
    flex: 1,
    backgroundColor: 'transparent',
  },
});
