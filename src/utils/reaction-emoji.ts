const REACTION_BY_TYPE: Record<number, string> = {
  1: '👏',
  2: '👍',
  3: '❤️',
  4: '😂',
  5: '😮',
  6: '🎉'
};

const REACTION_BY_CODE: Record<string, string> = {
  '1f44f': '👏',
  '1f44d': '👍',
  '1f602': '😂',
  '1f62e': '😮',
  '2764': '❤️',
  '2764-fe0f': '❤️',
  '1f389': '🎉'
};

export function toReactionEmoji(value: string | number): string {
  if (typeof value === 'number') {
    return REACTION_BY_TYPE[value] ?? '';
  }
  const raw = value.trim();
  if (!raw || raw.length > 32) {
    return '';
  }
  const normalized = raw.toLowerCase().replace(/^u\+/, '').replace(/\s+/g, '-');
  if (REACTION_BY_CODE[normalized]) {
    return REACTION_BY_CODE[normalized];
  }
  if (/^[1-6]$/.test(raw)) {
    return REACTION_BY_TYPE[Number(raw)] ?? '';
  }
  if (/^\p{Extended_Pictographic}/u.test(raw)) {
    return raw;
  }
  if (!/^[0-9a-f]{2,6}(-[0-9a-f]{2,6}){0,7}$/i.test(raw)) {
    return '';
  }
  try {
    return raw
      .split('-')
      .map((part) => String.fromCodePoint(Number.parseInt(part, 16)))
      .join('');
  } catch {
    return '';
  }
}
