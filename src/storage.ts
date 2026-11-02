import AsyncStorage from '@react-native-async-storage/async-storage';

import type { Category, Note } from './types';
import { CATEGORIES } from './types';
import { normalizeBlocks, withDerivedFields } from './content';

const NOTES_KEY = 'journal.notes';
const CURRENT_ID_KEY = 'journal.currentNoteId';
const LAST_CATEGORY_KEY = 'journal.lastCategory';

function createId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function createNote(
  partial: Omit<Note, 'id' | 'createdAt' | 'updatedAt' | 'blocks' | 'content' | 'photos'> &
    Partial<Pick<Note, 'blocks' | 'content' | 'photos'>>,
): Note {
  const now = new Date().toISOString();
  return withDerivedFields({
    id: createId(),
    dateKey: partial.dateKey,
    timePeriod: partial.timePeriod,
    category: partial.category,
    createdAt: now,
    updatedAt: now,
    blocks: normalizeBlocks(partial),
    content: '',
    photos: [],
  });
}

export async function loadNotes(): Promise<Note[]> {
  const raw = await AsyncStorage.getItem(NOTES_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as Note[];
    return Array.isArray(parsed)
      ? parsed.map((note) =>
          withDerivedFields({
            ...note,
            blocks: normalizeBlocks(note),
          }),
        )
      : [];
  } catch {
    return [];
  }
}

export async function saveNotes(notes: Note[]): Promise<void> {
  await AsyncStorage.setItem(NOTES_KEY, JSON.stringify(notes));
}

export async function loadCurrentNoteId(): Promise<string | null> {
  return AsyncStorage.getItem(CURRENT_ID_KEY);
}

export async function saveCurrentNoteId(id: string): Promise<void> {
  await AsyncStorage.setItem(CURRENT_ID_KEY, id);
}

export async function loadLastCategory(): Promise<Category> {
  const value = await AsyncStorage.getItem(LAST_CATEGORY_KEY);
  if (value && (CATEGORIES as readonly string[]).includes(value)) {
    return value as Category;
  }
  return '기도';
}

export async function saveLastCategory(category: Category): Promise<void> {
  await AsyncStorage.setItem(LAST_CATEGORY_KEY, category);
}
