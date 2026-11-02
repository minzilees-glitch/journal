import type { ContentBlock, Note, PhotoBlock, TextBlock } from './types';

function createId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function createTextBlock(text = ''): TextBlock {
  return { id: createId(), type: 'text', text };
}

export function createPhotoBlock(uri: string): PhotoBlock {
  return { id: createId(), type: 'photo', uri };
}

export function emptyBlocks(): ContentBlock[] {
  return [createTextBlock('')];
}

export function deriveContent(blocks: ContentBlock[]): string {
  return blocks
    .filter((block): block is TextBlock => block.type === 'text')
    .map((block) => block.text)
    .join('\n\n')
    .trim();
}

export function derivePhotos(blocks: ContentBlock[]): string[] {
  return blocks
    .filter((block): block is PhotoBlock => block.type === 'photo')
    .map((block) => block.uri);
}

export function noteHasBody(note: Note): boolean {
  return deriveContent(note.blocks).length > 0 || derivePhotos(note.blocks).length > 0;
}

export function notePreview(note: Note): string {
  return (
    note.blocks
      .filter((block): block is TextBlock => block.type === 'text')
      .map((block) => block.text.trim())
      .find((text) => text.length > 0) ?? ''
  );
}

export function withDerivedFields(note: Note): Note {
  return {
    ...note,
    content: deriveContent(note.blocks),
    photos: derivePhotos(note.blocks),
  };
}

export function normalizeBlocks(raw: Partial<Note> | null | undefined): ContentBlock[] {
  if (Array.isArray(raw?.blocks) && raw.blocks.length > 0) {
    const blocks = raw.blocks.filter(
      (block): block is ContentBlock =>
        !!block &&
        (block.type === 'text' || block.type === 'photo') &&
        typeof block.id === 'string',
    );
    if (blocks.length > 0) return ensureEditableText(blocks);
  }

  const blocks: ContentBlock[] = [createTextBlock(raw?.content ?? '')];
  for (const uri of raw?.photos ?? []) {
    if (!uri) continue;
    blocks.push(createPhotoBlock(uri), createTextBlock(''));
  }
  return ensureEditableText(blocks);
}

export function ensureEditableText(blocks: ContentBlock[]): ContentBlock[] {
  if (blocks.length === 0) return emptyBlocks();
  if (blocks[0].type !== 'text') {
    return [createTextBlock(''), ...blocks];
  }
  if (blocks[blocks.length - 1].type !== 'text') {
    return [...blocks, createTextBlock('')];
  }
  return blocks;
}

export function updateTextBlock(blocks: ContentBlock[], id: string, text: string): ContentBlock[] {
  return blocks.map((block) => (block.type === 'text' && block.id === id ? { ...block, text } : block));
}

export function insertTextAtCursor(
  blocks: ContentBlock[],
  blockId: string | null,
  cursor: number,
  incoming: string,
): ContentBlock[] {
  const index = blocks.findIndex((block) => block.id === blockId && block.type === 'text');
  const target = (index >= 0 ? blocks[index] : blocks.filter((block) => block.type === 'text').at(-1)) as
    | TextBlock
    | undefined;
  if (!target) {
    return ensureEditableText([...blocks, createTextBlock(incoming)]);
  }

  const at = Math.max(0, Math.min(cursor, target.text.length));
  const prefix = target.text.slice(0, at);
  const needsSpace = prefix.length > 0 && !/\s$/.test(prefix);
  const nextText = `${prefix}${needsSpace ? ' ' : ''}${incoming}${target.text.slice(at)}`;
  return updateTextBlock(blocks, target.id, nextText);
}

export function insertPhotoAtCursor(
  blocks: ContentBlock[],
  blockId: string | null,
  cursor: number,
  uri: string,
): ContentBlock[] {
  const photo = createPhotoBlock(uri);
  const after = createTextBlock('');
  const index = blocks.findIndex((block) => block.id === blockId && block.type === 'text');

  if (index < 0) {
    const lastText = [...blocks].reverse().find((block) => block.type === 'text') as TextBlock | undefined;
    if (!lastText) return ensureEditableText([...blocks, photo]);
    return insertPhotoAtCursor(blocks, lastText.id, lastText.text.length, uri);
  }

  const target = blocks[index] as TextBlock;
  const at = Math.max(0, Math.min(cursor, target.text.length));
  const beforeText = target.text.slice(0, at).replace(/\s+$/, '');
  const afterText = target.text.slice(at).replace(/^\s+/, '');

  const next: ContentBlock[] = [
    ...blocks.slice(0, index),
    { ...target, text: beforeText },
    photo,
    { ...after, text: afterText },
    ...blocks.slice(index + 1),
  ];

  return ensureEditableText(next);
}

export function removePhotoBlock(blocks: ContentBlock[], id: string): ContentBlock[] {
  const index = blocks.findIndex((block) => block.id === id && block.type === 'photo');
  if (index < 0) return blocks;

  const prev = blocks[index - 1];
  const next = blocks[index + 1];

  if (prev?.type === 'text' && next?.type === 'text') {
    const joined = [prev.text.replace(/\s+$/, ''), next.text.replace(/^\s+/, '')]
      .filter((part) => part.length > 0)
      .join('\n\n');
    return ensureEditableText([
      ...blocks.slice(0, index - 1),
      { ...prev, text: joined },
      ...blocks.slice(index + 2),
    ]);
  }

  return ensureEditableText([...blocks.slice(0, index), ...blocks.slice(index + 1)]);
}
