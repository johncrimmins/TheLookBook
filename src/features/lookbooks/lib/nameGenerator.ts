const adjectives = [
  'Crimson', 'Velvet', 'Azure', 'Golden', 'Mystic', 'Silver', 'Emerald', 'Amber',
  'Sapphire', 'Ruby', 'Copper', 'Bronze', 'Ivory', 'Jade', 'Pearl', 'Onyx',
  'Cobalt', 'Violet', 'Scarlet', 'Indigo', 'Cerulean', 'Magenta', 'Turquoise',
  'Coral', 'Lavender', 'Burgundy', 'Teal', 'Maroon', 'Navy', 'Olive',
  'Plum', 'Sage', 'Slate', 'Steel', 'Stone', 'Crystal', 'Diamond', 'Frost',
  'Shadow', 'Light', 'Dark', 'Bright', 'Pale', 'Deep', 'Soft', 'Bold',
  'Wild', 'Calm', 'Quiet', 'Loud', 'Swift', 'Slow', 'Ancient', 'Modern',
  'Ethereal', 'Cosmic', 'Celestial', 'Lunar', 'Solar', 'Stellar',
];

const nouns = [
  'Horizon', 'Thunder', 'Ocean', 'Phoenix', 'Canvas', 'Storm', 'River', 'Mountain',
  'Valley', 'Forest', 'Desert', 'Meadow', 'Garden', 'Harbor', 'Lighthouse', 'Bridge',
  'Tower', 'Castle', 'Palace', 'Temple', 'Shrine', 'Sanctuary', 'Haven', 'Refuge',
  'Journey', 'Voyage', 'Quest', 'Adventure', 'Dream', 'Vision', 'Echo', 'Memory',
  'Whisper', 'Song', 'Dance', 'Rhythm', 'Melody', 'Symphony', 'Harmony', 'Chorus',
  'Dawn', 'Dusk', 'Twilight', 'Sunset', 'Sunrise', 'Moon', 'Star', 'Comet',
  'Galaxy', 'Nebula', 'Cosmos', 'Universe', 'Constellation', 'Aurora', 'Eclipse',
  'Solstice', 'Equinox', 'Season', 'Tide', 'Wave',
];

/**
 * Generate a random Lookbook name
 */
export function generateRandomName(): string {
  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  return `${adjective} ${noun}`;
}

/**
 * Generate a unique Lookbook name
 * Attempts random generation 3 times, then falls back to timestamp
 */
export async function generateUniqueName(
  checkExists: (name: string) => Promise<boolean>
): Promise<string> {
  // Try 3 times with random names
  for (let i = 0; i < 3; i++) {
    const name = generateRandomName();
    const exists = await checkExists(name);
    if (!exists) {
      return name;
    }
  }

  // Fallback: timestamp-based name
  const timestamp = Date.now();
  return `Lookbook ${timestamp}`;
}

/**
 * Validate Lookbook name
 */
export function validateLookbookName(name: string): {
  valid: boolean;
  error?: string;
} {
  const trimmed = name.trim();

  if (trimmed.length < 2) {
    return { valid: false, error: 'Name must be at least 2 characters' };
  }

  if (trimmed.length > 50) {
    return { valid: false, error: 'Name must be at most 50 characters' };
  }

  if (trimmed.length === 0) {
    return { valid: false, error: 'Name cannot be empty' };
  }

  return { valid: true };
}

