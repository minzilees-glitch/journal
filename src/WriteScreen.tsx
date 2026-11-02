import { Image } from 'expo-image';
import { useEffect, useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  type NativeSyntheticEvent,
  type TextInputSelectionChangeEventData,
} from 'react-native';

import {
  insertPhotoAtCursor,
  insertTextAtCursor,
  removePhotoBlock,
  updateTextBlock,
} from './content';
import { IconArrow, IconFont, IconPlus, IconVoice } from './icons';
import { MetaLine } from './MetaLine';
import { PaperScreen } from './PaperScreen';
import { useNotes } from './NotesContext';
import { choosePhoto, takePhoto } from './photos';
import { colors, space, type as typeScale } from './theme';
import { useSpeechToText } from './useSpeechToText';

const FONT = 'NotoSerifKR_500Medium';

export function WriteScreen() {
  const { current, saved, openJournal, updateCurrent } = useNotes();
  const [photoMenu, setPhotoMenu] = useState(false);
  const [hasEdited, setHasEdited] = useState(false);
  const focusedBlockId = useRef<string | null>(null);
  const cursor = useRef(0);
  const inputRefs = useRef<Record<string, TextInput | null>>({});

  const { listening, error, toggle } = useSpeechToText({
    onTranscript: (spoken) => {
      if (!current) return;
      updateCurrent({
        blocks: insertTextAtCursor(current.blocks, focusedBlockId.current, cursor.current, spoken),
      });
    },
  });

  useEffect(() => {
    if (!saved) setHasEdited(true);
  }, [saved]);

  if (!current) return <PaperScreen />;

  const status = listening ? '듣는 중' : error ? error : hasEdited && saved ? '저장됨' : '';
  const lastTextId = [...current.blocks].reverse().find((block) => block.type === 'text')?.id;
  const onlyText = current.blocks.length === 1;

  const addPhoto = async (uri: string | null) => {
    if (!uri) return;
    const nextBlocks = insertPhotoAtCursor(
      current.blocks,
      focusedBlockId.current,
      cursor.current,
      uri,
    );
    updateCurrent({ blocks: nextBlocks });

    const insertedAt = nextBlocks.findIndex(
      (block, index) =>
        block.type === 'photo' &&
        block.uri === uri &&
        nextBlocks[index + 1]?.type === 'text',
    );
    const follow = insertedAt >= 0 ? nextBlocks[insertedAt + 1] : null;
    if (follow?.type === 'text') {
      focusedBlockId.current = follow.id;
      cursor.current = 0;
      requestAnimationFrame(() => {
        inputRefs.current[follow.id]?.focus();
      });
    }
  };

  return (
    <PaperScreen>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.top}>
          <Text style={[styles.status, !status ? styles.statusHidden : null]}>{status}</Text>
          <Pressable
            onPress={openJournal}
            style={styles.browse}
            hitSlop={8}
            accessibilityLabel="Browse"
          >
            <IconArrow size={16} />
            <Text style={styles.browseText}>Browse</Text>
          </Pressable>
        </View>

        <MetaLine
          dateKey={current.dateKey}
          timePeriod={current.timePeriod}
          category={current.category}
          onChangeDate={(dateKey) => updateCurrent({ dateKey })}
          onChangePeriod={(timePeriod) => updateCurrent({ timePeriod })}
          onChangeCategory={(category) => updateCurrent({ category })}
        />

        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.bodyContent}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
          showsVerticalScrollIndicator={false}
        >
          {current.blocks.map((block) => {
            if (block.type === 'photo') {
              return (
                <Pressable
                  key={block.id}
                  onLongPress={() => updateCurrent({ blocks: removePhotoBlock(current.blocks, block.id) })}
                >
                  <Image source={{ uri: block.uri }} style={styles.photo} contentFit="cover" />
                </Pressable>
              );
            }

            const isLastText = block.id === lastTextId;
            return (
              <TextInput
                key={block.id}
                ref={(node) => {
                  inputRefs.current[block.id] = node;
                }}
                style={[
                  styles.input,
                  onlyText || isLastText ? styles.inputGrow : styles.inputInline,
                ]}
                value={block.text}
                onChangeText={(text) =>
                  updateCurrent({ blocks: updateTextBlock(current.blocks, block.id, text) })
                }
                onFocus={() => {
                  focusedBlockId.current = block.id;
                }}
                onSelectionChange={(event: NativeSyntheticEvent<TextInputSelectionChangeEventData>) => {
                  focusedBlockId.current = block.id;
                  cursor.current = event.nativeEvent.selection.start;
                }}
                multiline
                scrollEnabled={false}
                textAlignVertical="top"
                underlineColorAndroid="transparent"
                autoCorrect
                autoCapitalize="sentences"
                selectionColor={colors.ink}
              />
            );
          })}
        </ScrollView>

        <View style={styles.bottom}>
          {photoMenu ? (
            <View style={styles.photoMenu}>
              <Pressable
                onPress={async () => {
                  setPhotoMenu(false);
                  await addPhoto(await takePhoto());
                }}
                style={styles.photoOption}
              >
                <Text style={styles.photoOptionText}>사진 촬영</Text>
              </Pressable>
              <Pressable
                onPress={async () => {
                  setPhotoMenu(false);
                  await addPhoto(await choosePhoto());
                }}
                style={styles.photoOption}
              >
                <Text style={styles.photoOptionText}>사진 선택</Text>
              </Pressable>
            </View>
          ) : null}

          <View style={styles.actions}>
            <View style={[styles.iconButton, styles.fontIcon]}>
              <IconFont size={24} />
            </View>
            <Pressable
              onPress={toggle}
              hitSlop={8}
              style={[styles.iconButton, listening ? styles.listening : null]}
              accessibilityLabel="음성으로 쓰기"
            >
              <IconVoice size={24} />
            </Pressable>
            <Pressable
              onPress={() => setPhotoMenu((prev) => !prev)}
              hitSlop={8}
              style={styles.iconButton}
              accessibilityLabel="사진 추가"
            >
              <IconPlus size={24} />
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </PaperScreen>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  top: {
    paddingHorizontal: space.page,
    minHeight: 26,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  status: {
    position: 'absolute',
    left: space.page,
    color: colors.inkSoft,
    fontFamily: FONT,
    fontSize: 11,
  },
  statusHidden: {
    opacity: 0,
  },
  browse: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.iconGap,
  },
  browseText: {
    color: colors.ink,
    fontFamily: FONT,
    fontSize: typeScale.browse.fontSize,
    lineHeight: typeScale.browse.lineHeight,
  },
  bodyContent: {
    paddingHorizontal: space.page,
    paddingTop: 40,
    paddingBottom: 24,
  },
  input: {
    color: colors.ink,
    fontFamily: FONT,
    fontSize: typeScale.body.fontSize,
    lineHeight: typeScale.body.lineHeight,
    padding: 0,
    margin: 0,
    backgroundColor: 'transparent',
  },
  inputGrow: {
    minHeight: 180,
  },
  inputInline: {
    minHeight: typeScale.body.lineHeight,
    marginBottom: 8,
  },
  photo: {
    marginTop: 8,
    marginBottom: 8,
    width: '100%',
    aspectRatio: 338 / 429,
  },
  bottom: {
    paddingHorizontal: space.page,
    paddingTop: 8,
    paddingBottom: 8,
  },
  photoMenu: {
    alignItems: 'flex-end',
    marginBottom: 12,
    gap: 10,
  },
  photoOption: {
    paddingVertical: 2,
  },
  photoOptionText: {
    color: colors.ink,
    fontFamily: FONT,
    fontSize: 14,
    lineHeight: 20,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: space.iconGap,
    height: 24,
  },
  iconButton: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fontIcon: {
    pointerEvents: 'none',
  },
  listening: {
    opacity: 0.4,
  },
});
