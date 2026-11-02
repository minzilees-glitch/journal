import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { formatKoreanDate, fromDateKey } from './dates';
import { IconArrow } from './icons';
import { noteHasBody, notePreview } from './content';
import { PaperScreen } from './PaperScreen';
import { useNotes } from './NotesContext';
import { colors, space } from './theme';

const FONT = 'NotoSerifKR_500Medium';

export function JournalScreen() {
  const { notes, openWrite, openNote } = useNotes();

  const visible = [...notes]
    .filter(noteHasBody)
    .sort((a, b) => b.dateKey.localeCompare(a.dateKey) || b.updatedAt.localeCompare(a.updatedAt));

  return (
    <PaperScreen>
      <View style={styles.top}>
        <Pressable onPress={openWrite} style={styles.back} hitSlop={8}>
          <View style={styles.backArrow}>
            <IconArrow size={16} />
          </View>
          <Text style={styles.backText}>Write</Text>
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      >
        {visible.length === 0 ? (
          <Text style={styles.empty}>아직 기록이 없습니다.</Text>
        ) : (
          visible.map((note) => {
            const preview = notePreview(note);
            return (
              <Pressable key={note.id} onPress={() => openNote(note.id)} style={styles.row}>
                <Text style={styles.meta}>
                  {formatKoreanDate(fromDateKey(note.dateKey))}  {note.timePeriod}  {note.category}
                </Text>
                {preview ? (
                  <Text style={styles.preview} numberOfLines={2}>
                    {preview}
                  </Text>
                ) : (
                  <Text style={styles.previewMuted}>사진</Text>
                )}
              </Pressable>
            );
          })
        )}
      </ScrollView>
    </PaperScreen>
  );
}

const styles = StyleSheet.create({
  top: {
    paddingHorizontal: space.page,
    minHeight: 26,
    flexDirection: 'row',
    alignItems: 'center',
  },
  back: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backArrow: {
    transform: [{ rotate: '180deg' }],
  },
  backText: {
    color: colors.ink,
    fontFamily: FONT,
    fontSize: 12,
    lineHeight: 17,
  },
  list: {
    paddingHorizontal: space.page,
    paddingTop: 40,
    paddingBottom: 48,
    gap: 28,
  },
  empty: {
    color: colors.inkSoft,
    fontFamily: FONT,
    fontSize: 15,
    lineHeight: 30,
  },
  row: {
    gap: 8,
  },
  meta: {
    color: colors.ink,
    fontFamily: FONT,
    fontSize: 15,
    lineHeight: 22,
  },
  preview: {
    color: colors.ink,
    fontFamily: FONT,
    fontSize: 15,
    lineHeight: 26,
  },
  previewMuted: {
    color: colors.inkSoft,
    fontFamily: FONT,
    fontSize: 15,
    lineHeight: 26,
  },
});
