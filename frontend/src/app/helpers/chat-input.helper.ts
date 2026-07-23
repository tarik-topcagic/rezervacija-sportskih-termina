export interface TextInsertionResult {
  nextValue: string;
  nextCursorStart: number;
  nextCursorEnd: number;
}

export const CHAT_EMOJI_OPTIONS = [
  '😀', '😁', '😂', '🤣', '😊', '😍', '😘', '😎',
  '🤔', '😴', '😢', '😭', '😡', '👍', '👎', '👏',
  '🙌', '💪', '🙏', '🤝', '👀', '🔥', '✨', '🎉',
  '❤️', '💙', '💚', '💛', '💯', '✅', '⚽', '🏀',
  '🏈', '⚾', '🥎', '🎾', '🏐', '🏉', '🥏', '🎱',
  '🏓', '🏸', '🥅', '⛳', '🏒', '🏑', '🥍', '🏏',
  '🥊', '🥋', '🎿', '⛸️', '🛹', '🚴', '🏃', '🏊',
  '🤸', '🤾', '⛹️', '🏋️', '🤼', '🤽', '🤿', '🧗',
  '🏆', '🥇', '🥈', '🥉', '🍀', '☀️', '🌧️', '⭐',
] as const;

export const MESSAGE_QUICK_REACTIONS = ['❤️', '😂', '😮', '😢', '😡', '👍'] as const;

export function insertTextAtSelection(
  currentValue: string,
  insertedText: string,
  selectionStart: number | null | undefined,
  selectionEnd: number | null | undefined,
): TextInsertionResult {
  const safeStart = normalizeSelectionIndex(currentValue, selectionStart);
  const safeEnd = normalizeSelectionIndex(currentValue, selectionEnd);
  const rangeStart = Math.min(safeStart, safeEnd);
  const rangeEnd = Math.max(safeStart, safeEnd);

  const nextValue = `${currentValue.slice(0, rangeStart)}${insertedText}${currentValue.slice(rangeEnd)}`;
  const nextCursorPosition = rangeStart + insertedText.length;

  return {
    nextValue,
    nextCursorStart: nextCursorPosition,
    nextCursorEnd: nextCursorPosition,
  };
}

function normalizeSelectionIndex(value: string, index: number | null | undefined): number {
  if (typeof index !== 'number' || Number.isNaN(index)) {
    return value.length;
  }

  return Math.min(Math.max(index, 0), value.length);
}
