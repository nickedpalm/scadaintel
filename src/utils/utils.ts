import { I18N } from '~/utils/astrowind-config';

export const formatter: Intl.DateTimeFormat = new Intl.DateTimeFormat(I18N?.language, {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
  timeZone: 'UTC',
});

export const getFormattedDate = (date: Date): string => (date ? formatter.format(date) : '');

export const trim = (str = '', ch?: string) => {
  let start = 0,
    end = str.length || 0;
  while (start < end && str[start] === ch) ++start;
  while (end > start && str[end - 1] === ch) --end;
  return start > 0 || end < str.length ? str.substring(start, end) : str;
};

// Function to format a number in thousands (K) or millions (M) format depending on its value
export const toUiAmount = (amount: number) => {
  if (!amount) return 0;

  let value: string;

  if (amount >= 1000000000) {
    const formattedNumber = (amount / 1000000000).toFixed(1);
    if (Number(formattedNumber) === parseInt(formattedNumber)) {
      value = parseInt(formattedNumber) + 'B';
    } else {
      value = formattedNumber + 'B';
    }
  } else if (amount >= 1000000) {
    const formattedNumber = (amount / 1000000).toFixed(1);
    if (Number(formattedNumber) === parseInt(formattedNumber)) {
      value = parseInt(formattedNumber) + 'M';
    } else {
      value = formattedNumber + 'M';
    }
  } else if (amount >= 1000) {
    const formattedNumber = (amount / 1000).toFixed(1);
    if (Number(formattedNumber) === parseInt(formattedNumber)) {
      value = parseInt(formattedNumber) + 'K';
    } else {
      value = formattedNumber + 'K';
    }
  } else {
    value = Number(amount).toFixed(0);
  }

  return value;
};

// Title-case a phrase, preserving existing all-caps acronyms.
//   "expert witness"      → "Expert Witness"
//   "NDT inspection firm" → "NDT Inspection Firm" (not "Ndt Inspection Firm")
export const titleCase = (str = ''): string =>
  str.split(' ').map((w) => {
    if (!w) return '';
    if (w === w.toUpperCase() && w.length > 1) return w; // keep acronym
    return w[0].toUpperCase() + w.slice(1);
  }).join(' ');

// Lowercase a phrase but preserve acronyms (ALL-CAPS words ≥2 chars).
// Used for mid-sentence usage where proper-noun phrases need casing tweaks:
//   "NDT Inspection Firms".smartLower() → "NDT inspection firms"
//   "Expert Witnesses"     .smartLower() → "expert witnesses"
export const smartLower = (str = ''): string =>
  str.split(' ').map((w) => {
    if (!w) return '';
    if (w === w.toUpperCase() && w.length > 1) return w;
    return w.toLowerCase();
  }).join(' ');

// Grammatical article: "a" vs "an" based on the *sound* of the first letter.
// For all-caps first words (acronyms like NDT, MRI, FBI), English uses the
// pronunciation of the letter name — letters that start with vowel sounds
// get "an": A, E, F, H, I, L, M, N, O, R, S, X.
//
//   articleFor("expert witness")      → "an"
//   articleFor("NDT inspection firm") → "an"   (N = "en-")
//   articleFor("court reporter")      → "a"
//   articleFor("SCADA consultant")    → "a"    (S = "ess-", vowel sound)
//                                               ... actually S IS vowel sound → "an SCADA"
const VOWEL_SOUND_LETTERS = new Set(['A', 'E', 'F', 'H', 'I', 'L', 'M', 'N', 'O', 'R', 'S', 'X']);
export const articleFor = (word = '', cap = false): string => {
  const w = word.trim();
  if (!w) return cap ? 'A' : 'a';
  const firstWord = w.split(' ')[0];
  let needsAn: boolean;
  if (firstWord === firstWord.toUpperCase() && firstWord.length > 1) {
    needsAn = VOWEL_SOUND_LETTERS.has(firstWord[0]);
  } else {
    needsAn = 'aeiou'.includes(firstWord[0].toLowerCase());
  }
  return cap ? (needsAn ? 'An' : 'A') : (needsAn ? 'an' : 'a');
};
