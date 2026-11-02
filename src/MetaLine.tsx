import { useMemo, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { formatKoreanDate, fromDateKey, toDateKey } from './dates';
import { colors } from './theme';
import type { Category, TimePeriod } from './types';
import { CATEGORIES, TIME_PERIODS } from './types';

const FONT = 'NotoSerifKR_500Medium';
const WEEKDAY_LABELS = ['일', '월', '화', '수', '목', '금', '토'];

type Props = {
  dateKey: string;
  timePeriod: TimePeriod;
  category: Category;
  onChangeDate: (dateKey: string) => void;
  onChangePeriod: (value: TimePeriod) => void;
  onChangeCategory: (value: Category) => void;
};

function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function MetaLine({
  dateKey,
  timePeriod,
  category,
  onChangeDate,
  onChangePeriod,
  onChangeCategory,
}: Props) {
  const [dateOpen, setDateOpen] = useState(false);
  const [periodOpen, setPeriodOpen] = useState(false);
  const [categoryOpen, setCategoryOpen] = useState(false);
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

  const dateLabel = formatKoreanDate(date);
  const gap = '  ';
  const [hit, setHit] = useState({ date: 0, period: 0, category: 0, gap: 0 });

  return (
    <View style={styles.row}>
      <Text style={styles.line} allowFontScaling={false} pointerEvents="none">
        {`${dateLabel}${gap}${timePeriod}${gap}${category}`}
      </Text>
      <View style={styles.hits} pointerEvents="box-none">
        <Pressable
          style={[styles.hit, { width: hit.date }]}
          onPress={() => {
            setCursor(startOfMonth(date));
            setDateOpen(true);
          }}
        />
        <View style={{ width: hit.gap }} />
        <Pressable style={[styles.hit, { width: hit.period }]} onPress={() => setPeriodOpen(true)} />
        <View style={{ width: hit.gap }} />
        <Pressable style={[styles.hit, { width: hit.category }]} onPress={() => setCategoryOpen(true)} />
      </View>
      <Text
        style={styles.measure}
        allowFontScaling={false}
        onLayout={(event) => {
          const width = event.nativeEvent.layout.width;
          setHit((prev) => ({ ...prev, date: width }));
        }}
      >
        {dateLabel}
      </Text>
      <Text
        style={styles.measure}
        allowFontScaling={false}
        onLayout={(event) => {
          const width = event.nativeEvent.layout.width;
          setHit((prev) => ({ ...prev, period: width }));
        }}
      >
        {timePeriod}
      </Text>
      <Text
        style={styles.measure}
        allowFontScaling={false}
        onLayout={(event) => {
          const width = event.nativeEvent.layout.width;
          setHit((prev) => ({ ...prev, category: width }));
        }}
      >
        {category}
      </Text>
      <Text
        style={styles.measure}
        allowFontScaling={false}
        onLayout={(event) => {
          const width = event.nativeEvent.layout.width;
          setHit((prev) => ({ ...prev, gap: width }));
        }}
      >
        {gap}
      </Text>

      <Modal visible={dateOpen} transparent animationType="fade" onRequestClose={() => setDateOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setDateOpen(false)}>
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
                if (!day) return <View key={`empty-${index}`} style={styles.dayCell} />;
                const cellDate = new Date(cursor.getFullYear(), cursor.getMonth(), day);
                const key = toDateKey(cellDate);
                const selected = key === dateKey;
                return (
                  <Pressable
                    key={key}
                    style={styles.dayCell}
                    onPress={() => {
                      onChangeDate(key);
                      setDateOpen(false);
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

      <OptionModal
        visible={periodOpen}
        options={TIME_PERIODS}
        value={timePeriod}
        onChange={onChangePeriod}
        onClose={() => setPeriodOpen(false)}
      />
      <OptionModal
        visible={categoryOpen}
        options={CATEGORIES}
        value={category}
        onChange={onChangeCategory}
        onClose={() => setCategoryOpen(false)}
      />
    </View>
  );
}

function OptionModal<T extends string>({
  visible,
  options,
  value,
  onChange,
  onClose,
}: {
  visible: boolean;
  options: readonly T[];
  value: T;
  onChange: (value: T) => void;
  onClose: () => void;
}) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.optionSheet} onPress={() => {}}>
          {options.map((option) => (
            <Pressable
              key={option}
              style={styles.option}
              onPress={() => {
                onChange(option);
                onClose();
              }}
            >
              <Text style={[styles.optionText, option === value ? styles.optionSelected : null]}>
                {option}
              </Text>
            </Pressable>
          ))}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  row: {
    paddingHorizontal: 32,
    marginTop: 40,
    height: 26,
    justifyContent: 'center',
  },
  line: {
    color: colors.ink,
    fontFamily: FONT,
    fontSize: 18,
    lineHeight: 26,
    includeFontPadding: false,
  },
  hits: {
    ...StyleSheet.absoluteFill,
    left: 32,
    right: 32,
    flexDirection: 'row',
    alignItems: 'center',
  },
  hit: {
    height: 26,
  },
  measure: {
    position: 'absolute',
    opacity: 0,
    color: colors.ink,
    fontFamily: FONT,
    fontSize: 18,
    lineHeight: 26,
    includeFontPadding: false,
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
  optionSheet: {
    backgroundColor: colors.paper,
    paddingHorizontal: 24,
    paddingVertical: 16,
    alignSelf: 'center',
    minWidth: 120,
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
  option: {
    paddingVertical: 8,
  },
  optionText: {
    color: colors.inkSoft,
    fontFamily: FONT,
    fontSize: 18,
    lineHeight: 26,
  },
  optionSelected: {
    color: colors.ink,
  },
});
