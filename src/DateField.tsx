import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useMemo, useState } from 'react';

import { formatKoreanDate, fromDateKey, toDateKey } from './dates';
import { colors, metaText, type as typeScale } from './theme';

const WEEKDAY_LABELS = ['일', '월', '화', '수', '목', '금', '토'];
const FONT = 'NotoSerifKR_500Medium';

type Props = {
  dateKey: string;
  onChange: (dateKey: string) => void;
};

function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function DateField({ dateKey, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const [cursor, setCursor] = useState(() => startOfMonth(fromDateKey(dateKey)));
  const date = fromDateKey(dateKey);

  const cells = useMemo(() => {
    const first = startOfMonth(cursor);
    const startWeekday = first.getDay();
    const daysInMonth = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0).getDate();
    const blanks = Array.from({ length: startWeekday }, () => null);
    const days = Array.from({ length: daysInMonth }, (_, index) => index + 1);
    return [...blanks, ...days];
  }, [cursor]);

  return (
    <>
      <Pressable
        onPress={() => {
          setCursor(startOfMonth(date));
          setOpen(true);
        }}
        hitSlop={8}
        style={styles.hit}
      >
        <Text style={styles.meta} numberOfLines={1} allowFontScaling={false}>
          {formatKoreanDate(date)}
        </Text>
      </Pressable>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
          <Pressable style={styles.sheet} onPress={() => {}}>
            <View style={styles.monthRow}>
              <Pressable
                onPress={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))}
                hitSlop={12}
              >
                <Text style={styles.nav}>‹</Text>
              </Pressable>
              <Text style={styles.month}>
                {cursor.getFullYear()}년 {cursor.getMonth() + 1}월
              </Text>
              <Pressable
                onPress={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))}
                hitSlop={12}
              >
                <Text style={styles.nav}>›</Text>
              </Pressable>
            </View>

            <View style={styles.weekRow}>
              {WEEKDAY_LABELS.map((label) => (
                <Text key={label} style={styles.weekday}>
                  {label}
                </Text>
              ))}
            </View>

            <View style={styles.grid}>
              {cells.map((day, index) => {
                if (!day) {
                  return <View key={`empty-${index}`} style={styles.dayCell} />;
                }
                const cellDate = new Date(cursor.getFullYear(), cursor.getMonth(), day);
                const key = toDateKey(cellDate);
                const selected = key === dateKey;
                return (
                  <Pressable
                    key={key}
                    style={styles.dayCell}
                    onPress={() => {
                      onChange(key);
                      setOpen(false);
                    }}
                  >
                    <Text style={[styles.day, selected ? styles.daySelected : null]}>{day}</Text>
                  </Pressable>
                );
              })}
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  hit: {
    height: typeScale.meta.lineHeight,
    justifyContent: 'center',
  },
  meta: {
    ...metaText,
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(68, 68, 63, 0.12)',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  sheet: {
    backgroundColor: colors.paper,
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  monthRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  month: {
    color: colors.ink,
    fontFamily: FONT,
    fontSize: 16,
  },
  nav: {
    color: colors.ink,
    fontFamily: FONT,
    fontSize: 22,
    paddingHorizontal: 4,
  },
  weekRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  weekday: {
    width: '14.285%',
    textAlign: 'center',
    color: colors.inkSoft,
    fontFamily: FONT,
    fontSize: 12,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: '14.285%',
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  day: {
    color: colors.ink,
    fontFamily: FONT,
    fontSize: 14,
  },
  daySelected: {
    textDecorationLine: 'underline',
  },
});
