import { type ReactNode } from 'react';
import { Platform, StyleSheet, View, useWindowDimensions } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { colors, phone } from './theme';

const zeroMetrics = {
  frame: { x: 0, y: 0, width: 0, height: 0 },
  insets: { top: 0, left: 0, right: 0, bottom: 0 },
};

export function PhoneShell({ children }: { children: ReactNode }) {
  const { width, height } = useWindowDimensions();
  const framed = width > phone.breakpoint;
  const frameHeight = Math.min(height, phone.height);

  return (
    <View style={styles.desk}>
      <View
        style={
          framed
            ? [styles.deviceFramed, { height: frameHeight }]
            : styles.deviceFill
        }
      >
        <SafeAreaProvider
          initialMetrics={
            Platform.OS === 'web' || framed
              ? {
                  ...zeroMetrics,
                  frame: {
                    x: 0,
                    y: 0,
                    width: framed ? phone.width : width,
                    height: framed ? frameHeight : height,
                  },
                }
              : undefined
          }
        >
          {children}
        </SafeAreaProvider>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  desk: {
    flex: 1,
    width: '100%',
    backgroundColor: colors.desk,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deviceFill: {
    flex: 1,
    width: '100%',
    backgroundColor: colors.paper,
    overflow: 'hidden',
  },
  deviceFramed: {
    width: phone.width,
    backgroundColor: colors.paper,
    overflow: 'hidden',
    borderRadius: 24,
    ...Platform.select({
      web: {
        boxShadow: '0 18px 50px rgba(40, 38, 32, 0.28)',
      },
      default: {
        shadowColor: '#282620',
        shadowOpacity: 0.22,
        shadowRadius: 24,
        shadowOffset: { width: 0, height: 12 },
        elevation: 12,
      },
    }),
  },
});
