import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, metaText, type as typeScale } from './theme';

const FONT = 'NotoSerifKR_500Medium';

type Props<T extends string> = {
  value: T;
  options: readonly T[];
  onChange: (value: T) => void;
};

export function QuietSelect<T extends string>({ value, options, onChange }: Props<T>) {
  const [open, setOpen] = useState(false);

  return (
    <View style={styles.wrap}>
      <Pressable onPress={() => setOpen((prev) => !prev)} hitSlop={8} style={styles.hit}>
        <Text style={styles.value} numberOfLines={1} allowFontScaling={false}>
          {value}
        </Text>
      </Pressable>
      {open ? (
        <View style={styles.menu}>
          {options.map((option) => (
            <Pressable
              key={option}
              onPress={() => {
                onChange(option);
                setOpen(false);
              }}
              style={styles.option}
            >
              <Text style={[styles.optionText, option === value ? styles.optionSelected : null]}>
                {option}
              </Text>
            </Pressable>
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'relative',
    zIndex: 2,
    height: typeScale.meta.lineHeight,
    justifyContent: 'center',
  },
  hit: {
    height: typeScale.meta.lineHeight,
    justifyContent: 'center',
  },
  value: {
    ...metaText,
  },
  menu: {
    position: 'absolute',
    top: typeScale.meta.lineHeight,
    left: 0,
    minWidth: 72,
    paddingVertical: 8,
    zIndex: 20,
  },
  option: {
    paddingVertical: 6,
  },
  optionText: {
    color: colors.inkSoft,
    fontFamily: FONT,
    fontSize: 16,
    lineHeight: 22,
  },
  optionSelected: {
    color: colors.ink,
  },
});
