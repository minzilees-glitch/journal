import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { createContext, useContext } from 'react';

import { fromDateKey, timePeriodFromDate, toDateKey } from './dates';
import {
  createNote,
  loadCurrentNoteId,
  loadLastCategory,
  loadNotes,
  saveCurrentNoteId,
  saveLastCategory,
  saveNotes,
} from './storage';
import type { Note } from './types';
import { withDerivedFields } from './content';

type Screen = 'write' | 'journal';

type NotesContextValue = {
  ready: boolean;
  screen: Screen;
  notes: Note[];
  current: Note | null;
  saved: boolean;
  openJournal: () => void;
  openWrite: () => void;
  openNote: (id: string) => void;
  updateCurrent: (
    patch: Partial<Pick<Note, 'blocks' | 'dateKey' | 'timePeriod' | 'category'>>,
  ) => void;
};

const NotesContext = createContext<NotesContextValue | null>(null);

function upsertNote(notes: Note[], next: Note): Note[] {
  const index = notes.findIndex((note) => note.id === next.id);
  if (index === -1) return [next, ...notes];
  const copy = [...notes];
  copy[index] = next;
  return copy;
}

export function NotesProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [screen, setScreen] = useState<Screen>('write');
  const [notes, setNotes] = useState<Note[]>([]);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [saved, setSaved] = useState(true);
  const persistTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const current = useMemo(
    () => notes.find((note) => note.id === currentId) ?? null,
    [notes, currentId],
  );

  const persist = useCallback((nextNotes: Note[], nextCurrentId: string) => {
    setSaved(false);
    if (persistTimer.current) clearTimeout(persistTimer.current);
    persistTimer.current = setTimeout(() => {
      void (async () => {
        await saveNotes(nextNotes);
        await saveCurrentNoteId(nextCurrentId);
        setSaved(true);
      })();
    }, 350);
  }, []);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      const [loadedNotes, lastCategory, storedId] = await Promise.all([
        loadNotes(),
        loadLastCategory(),
        loadCurrentNoteId(),
      ]);

      if (cancelled) return;

      const existing = storedId ? loadedNotes.find((note) => note.id === storedId) : null;
      if (existing) {
        setNotes(loadedNotes);
        setCurrentId(existing.id);
        setReady(true);
        return;
      }

      const now = new Date();
      const note = createNote({
        dateKey: toDateKey(now),
        timePeriod: timePeriodFromDate(now),
        category: lastCategory,
      });

      const nextNotes = [note, ...loadedNotes];
      setNotes(nextNotes);
      setCurrentId(note.id);
      await saveNotes(nextNotes);
      await saveCurrentNoteId(note.id);
      setReady(true);
    })();

    return () => {
      cancelled = true;
      if (persistTimer.current) clearTimeout(persistTimer.current);
    };
  }, []);

  const updateCurrent: NotesContextValue['updateCurrent'] = useCallback(
    (patch) => {
      setNotes((prev) => {
        const active = prev.find((note) => note.id === currentId);
        if (!active) return prev;

        const next: Note = withDerivedFields({
          ...active,
          ...patch,
          updatedAt: new Date().toISOString(),
        });

        if (patch.category) {
          void saveLastCategory(patch.category);
        }

        const nextNotes = upsertNote(prev, next);
        persist(nextNotes, next.id);
        return nextNotes;
      });
    },
    [currentId, persist],
  );

  const openNote = useCallback((id: string) => {
    setCurrentId(id);
    setScreen('write');
    void saveCurrentNoteId(id);
  }, []);

  const value: NotesContextValue = {
    ready,
    screen,
    notes,
    current,
    saved,
    openJournal: () => setScreen('journal'),
    openWrite: () => setScreen('write'),
    openNote,
    updateCurrent,
  };

  return <NotesContext.Provider value={value}>{children}</NotesContext.Provider>;
}

export function useNotes(): NotesContextValue {
  const value = useContext(NotesContext);
  if (!value) {
    throw new Error('useNotes must be used within NotesProvider');
  }
  return value;
}

export function noteDate(note: Note): Date {
  return fromDateKey(note.dateKey);
}
