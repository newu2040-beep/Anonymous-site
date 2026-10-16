const ADJECTIVES = [
  'Silent', 'Veiled', 'Velvet', 'Obsidian', 'Celestial', 'Lucid', 'Spectral',
  'Neon', 'Ember', 'Azure', 'Frost', 'Midnight', 'Golden', 'Wandering',
  'Mystic', 'Cosmic', 'Solar', 'Hidden', 'Echoing', 'Shrouded', 'Hollow',
  'Astral', 'Quiet', 'Luminous', 'Shadow', 'Radiant', 'Distant', 'Ancient'
];

const NOUNS = [
  'Nomad', 'Cipher', 'Voyager', 'Echo', 'Wanderer', 'Phantom', 'Scribe',
  'Oracle', 'Poet', 'Phoenix', 'Spirit', 'Drifter', 'Aurora', 'Traveler',
  'Specter', 'Seeker', 'Keeper', 'Shadow', 'Solitude', 'Breeze', 'Horizon',
  'Compass', 'Harbor', 'Mirage', 'Gargoyle', 'Constellation', 'Lantern'
];

const GRADIENTS = [
  'from-violet-600 to-indigo-700',
  'from-cyan-500 to-blue-600',
  'from-fuchsia-500 to-rose-600',
  'from-amber-500 to-orange-600',
  'from-emerald-500 to-teal-700',
  'from-purple-600 to-pink-600',
  'from-sky-500 to-indigo-600',
  'from-rose-500 to-purple-700',
  'from-blue-600 to-emerald-600',
];

const ICONS = ['sparkles', 'moon', 'flame', 'compass', 'eye', 'feather', 'shield', 'heart', 'star', 'key'];

export function generateAnonymousAlias(seed?: string): { alias: string; avatarColor: string; avatarIcon: string } {
  let num = Math.floor(100 + Math.random() * 900);
  let adjIndex = Math.floor(Math.random() * ADJECTIVES.length);
  let nounIndex = Math.floor(Math.random() * NOUNS.length);
  let gradIndex = Math.floor(Math.random() * GRADIENTS.length);
  let iconIndex = Math.floor(Math.random() * ICONS.length);

  if (seed) {
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      hash = (hash << 5) - hash + seed.charCodeAt(i);
      hash |= 0;
    }
    const abs = Math.abs(hash);
    adjIndex = abs % ADJECTIVES.length;
    nounIndex = (abs >> 2) % NOUNS.length;
    gradIndex = (abs >> 4) % GRADIENTS.length;
    iconIndex = (abs >> 6) % ICONS.length;
    num = 100 + (abs % 900);
  }

  return {
    alias: `${ADJECTIVES[adjIndex]} ${NOUNS[nounIndex]} #${num}`,
    avatarColor: GRADIENTS[gradIndex],
    avatarIcon: ICONS[iconIndex],
  };
}
