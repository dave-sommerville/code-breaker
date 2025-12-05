/**
 * profanityFilter_encoded.js
 *
 * This version uses Base64 encoding/decoding to obfuscate (hide) the profanity
 * words within the source file itself.
 */

// --- 1. Obfuscated Profanity List ---

// The array of words joined by commas, and then Base64 encoded.
// The raw, visible string no longer contains the offensive words.
const ENCODED_PROFANITY_STRING = 'YXJzZSxhc3MsYml0Y2gsY3VudCxkYW1uLGRpY2ssZGlrZSxmYWcsZnVjayxoZWxsLGplcmssbmF6aSxwaXNzLHB1c3N5LHNzaGl0LHNsdXQsdGFyZCx0aXQsd2hvcmUsd2FuayxkeWtlLGNvY2ssZ29vayxraWtl';

// --- 2. Decoding and Regex Construction ---

function decodeBase64(encodedString) {
  // Use the built-in atob (browser) or Buffer.from (Node.js)
  if (typeof window !== 'undefined' && window.atob) {
    // Browser environment
    return window.atob(encodedString);
  } else if (typeof Buffer !== 'undefined') {
    // Node.js environment
    return Buffer.from(encodedString, 'base64').toString('utf8');
  } else {
    // Fallback or error handling for other environments
    console.error('Base64 decoding environment not supported.');
    return '';
  }
}

// Decode the string, then split it back into an array of words
const DECODED_PROFANITY_STRING = decodeBase64(ENCODED_PROFANITY_STRING);
const PROFANITY_WORDS = DECODED_PROFANITY_STRING.split(',');

// The word boundary (\b) ensures that "ass" doesn't match in words like "class" or "pass".
// The 'i' flag makes the matching case-insensitive.
const PROFANITY_REGEX = new RegExp(
  `\\b(${PROFANITY_WORDS.join('|')})\\b`, 'gi'
);

// --- 3. Exported Checker Function (Unchanged) ---

/**
 * Checks if a string input contains any profanity.
 *
 * @param {string} input - The string to check.
 * @returns {boolean} - True if profanity is found, otherwise false.
 */
export function containsProfanity(input) {
  if (typeof input !== 'string') {
    return false;
  }
  return PROFANITY_REGEX.test(input);
}