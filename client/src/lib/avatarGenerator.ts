/**
 * Avatar Generator Library
 * This library generates SVG avatars for clients based on their name and other attributes
 */

// Color palettes based on client tiers
const COLORS = {
  silver: {
    background: ['#E5E7EB', '#D1D5DB', '#9CA3AF', '#6B7280'],
    face: ['#F3F4F6', '#F9FAFB', '#E5E7EB'],
    hair: ['#111827', '#1F2937', '#374151', '#4B5563', '#6B7280'],
    accessories: ['#4B5563', '#6B7280', '#9CA3AF'],
  },
  gold: {
    background: ['#FEF3C7', '#FDE68A', '#FCD34D', '#FBBF24'],
    face: ['#FFFBEB', '#FEF3C7', '#FDE68A'],
    hair: ['#111827', '#1F2937', '#374151', '#4B5563', '#92400E'],
    accessories: ['#B45309', '#D97706', '#F59E0B'],
  },
  platinum: {
    background: ['#E0F2FE', '#BAE6FD', '#7DD3FC', '#38BDF8'],
    face: ['#F0F9FF', '#E0F2FE', '#BAE6FD'],
    hair: ['#111827', '#1F2937', '#374151', '#4B5563', '#0C4A6E'],
    accessories: ['#075985', '#0369A1', '#0EA5E9'],
  }
};

// Hair styles available
const HAIR_STYLES = [
  // Short hair style
  (color: string) => `
    <path d="M20,25 C20,20 25,10 50,10 C75,10 80,20 80,25" fill="${color}" />
  `,
  // Medium hair style
  (color: string) => `
    <path d="M15,60 C15,40 20,10 50,10 C80,10 85,40 85,60" fill="${color}" />
    <rect x="15" y="40" width="70" height="30" fill="${color}" />
  `,
  // Long hair style
  (color: string) => `
    <path d="M10,80 C10,40 20,10 50,10 C80,10 90,40 90,80" fill="${color}" />
    <rect x="10" y="40" width="80" height="60" fill="${color}" />
  `,
  // Curly hair style
  (color: string) => `
    <path d="M15,40 C15,20 25,10 50,10 C75,10 85,20 85,40" fill="${color}" />
    <circle cx="20" cy="30" r="10" fill="${color}" />
    <circle cx="30" cy="20" r="10" fill="${color}" />
    <circle cx="40" cy="15" r="10" fill="${color}" />
    <circle cx="60" cy="15" r="10" fill="${color}" />
    <circle cx="70" cy="20" r="10" fill="${color}" />
    <circle cx="80" cy="30" r="10" fill="${color}" />
  `,
  // Bald style
  (color: string) => `
    <path d="M30,25 C30,15 40,12 50,12 C60,12 70,15 70,25" fill="${color}" />
  `,
  // Side parted hair
  (color: string) => `
    <path d="M20,25 C20,15 30,10 50,10 C70,10 80,15 80,25" fill="${color}" />
    <path d="M35,10 C35,25 35,40 35,60" stroke="${color}" stroke-width="2" />
  `,
];

// Face shapes
const FACE_SHAPES = [
  // Oval face
  (color: string) => `
    <ellipse cx="50" cy="50" rx="30" ry="40" fill="${color}" />
  `,
  // Round face
  (color: string) => `
    <circle cx="50" cy="50" r="35" fill="${color}" />
  `,
  // Square face
  (color: string) => `
    <rect x="20" y="20" width="60" height="60" rx="10" fill="${color}" />
  `,
  // Heart face
  (color: string) => `
    <path d="M50,20 C70,20 85,35 85,50 C85,65 70,80 50,80 C30,80 15,65 15,50 C15,35 30,20 50,20 Z" fill="${color}" />
    <path d="M30,25 L70,25 L50,85 Z" fill="${color}" />
  `,
];

// Accessories
const ACCESSORIES = [
  // Glasses
  (color: string) => `
    <circle cx="35" cy="45" r="10" fill="none" stroke="${color}" stroke-width="2" />
    <circle cx="65" cy="45" r="10" fill="none" stroke="${color}" stroke-width="2" />
    <path d="M45,45 L55,45" stroke="${color}" stroke-width="2" />
  `,
  // Sunglasses
  (color: string) => `
    <rect x="25" y="40" width="20" height="10" rx="3" fill="${color}" />
    <rect x="55" y="40" width="20" height="10" rx="3" fill="${color}" />
    <path d="M45,45 L55,45" stroke="${color}" stroke-width="2" />
  `,
  // Earrings
  (color: string) => `
    <circle cx="20" cy="55" r="3" fill="${color}" />
    <circle cx="80" cy="55" r="3" fill="${color}" />
  `,
  // Necklace
  (color: string) => `
    <path d="M35,85 C45,95 55,95 65,85" stroke="${color}" stroke-width="2" fill="none" />
    <circle cx="50" cy="90" r="3" fill="${color}" />
  `,
  // No accessories
  () => '',
];

// Eyes styles
const EYES = [
  // Normal eyes
  (color: string) => `
    <ellipse cx="35" cy="45" rx="5" ry="3" fill="${color}" />
    <ellipse cx="65" cy="45" rx="5" ry="3" fill="${color}" />
  `,
  // Round eyes
  (color: string) => `
    <circle cx="35" cy="45" r="4" fill="${color}" />
    <circle cx="65" cy="45" r="4" fill="${color}" />
  `,
  // Almond eyes
  (color: string) => `
    <ellipse cx="35" cy="45" rx="6" ry="3" transform="rotate(-10 35 45)" fill="${color}" />
    <ellipse cx="65" cy="45" rx="6" ry="3" transform="rotate(10 65 45)" fill="${color}" />
  `,
  // Sleepy eyes
  (color: string) => `
    <ellipse cx="35" cy="45" rx="5" ry="2" fill="${color}" />
    <ellipse cx="65" cy="45" rx="5" ry="2" fill="${color}" />
  `,
];

// Nose styles
const NOSES = [
  // Simple line nose
  (color: string) => `
    <path d="M50,50 L50,60" stroke="${color}" stroke-width="2" />
  `,
  // Button nose
  (color: string) => `
    <circle cx="50" cy="55" r="3" fill="${color}" />
  `,
  // Bridge nose
  (color: string) => `
    <path d="M45,45 C45,55 50,60 50,60 C50,60 55,55 55,45" stroke="${color}" stroke-width="1.5" fill="none" />
  `,
  // Sharp nose
  (color: string) => `
    <path d="M50,45 L53,60 L50,58 L47,60 Z" fill="${color}" />
  `,
];

// Mouth styles
const MOUTHS = [
  // Smile
  (color: string) => `
    <path d="M40,65 C45,70 55,70 60,65" stroke="${color}" stroke-width="2" fill="none" />
  `,
  // Neutral
  (color: string) => `
    <path d="M40,65 L60,65" stroke="${color}" stroke-width="2" />
  `,
  // Slight smile
  (color: string) => `
    <path d="M40,65 C45,68 55,68 60,65" stroke="${color}" stroke-width="2" fill="none" />
  `,
  // Open smile
  (color: string) => `
    <path d="M40,65 C45,72 55,72 60,65" stroke="${color}" stroke-width="2" fill="none" />
    <path d="M43,65 C48,70 52,70 57,65" fill="${color}" />
  `,
];

// Function to get a random item from an array
function getRandomItem<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

// Function to get a deterministic but seemingly random item based on a seed
function getSeededItem<T>(array: T[], seed: string, index: number = 0): T {
  // Create a simple hash of the seed
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) - hash) + seed.charCodeAt(i) + index;
    hash |= 0; // Convert to 32bit integer
  }
  // Use the hash to get a deterministic but seemingly random index
  const positiveHash = Math.abs(hash);
  return array[positiveHash % array.length];
}

// Generate an SVG avatar based on client information
export function generateAvatar(name: string, tier: string = 'silver', gender: string = 'neutral'): string {
  // Normalize tier
  const normalizedTier = tier.toLowerCase() as keyof typeof COLORS;
  const colorPalette = COLORS[normalizedTier] || COLORS.silver;
  
  // Use client name as a seed for consistent avatar generation
  const seed = name;
  
  // Select colors and styles based on seed
  const backgroundColor = getSeededItem(colorPalette.background, seed, 1);
  const faceColor = getSeededItem(colorPalette.face, seed, 2);
  const hairColor = getSeededItem(colorPalette.hair, seed, 3);
  const accessoryColor = getSeededItem(colorPalette.accessories, seed, 4);
  
  // Select styles based on seed
  const hairStyle = getSeededItem(HAIR_STYLES, seed, 5);
  const faceShape = getSeededItem(FACE_SHAPES, seed, 6);
  const accessory = getSeededItem(ACCESSORIES, seed, 7);
  const eyes = getSeededItem(EYES, seed, 8);
  const nose = getSeededItem(NOSES, seed, 9);
  const mouth = getSeededItem(MOUTHS, seed, 10);
  
  // Build the SVG
  const svg = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
    <!-- Background circle -->
    <circle cx="50" cy="50" r="50" fill="${backgroundColor}" />
    
    <!-- Face -->
    ${faceShape(faceColor)}
    
    <!-- Hair -->
    ${hairStyle(hairColor)}
    
    <!-- Eyes -->
    ${eyes('#111827')}
    
    <!-- Nose -->
    ${nose('#6B7280')}
    
    <!-- Mouth -->
    ${mouth('#4B5563')}
    
    <!-- Accessories (glasses, etc.) -->
    ${accessory(accessoryColor)}
  </svg>
  `;
  
  return svg;
}

// Convert SVG string to data URL for use in img src
export function svgToDataURL(svg: string): string {
  const encodedSVG = encodeURIComponent(svg);
  return `data:image/svg+xml;charset=utf-8,${encodedSVG}`;
}

// Generate an array of avatar data URLs for a list of clients
export function generateClientAvatars(clients: any[]): Record<number, string> {
  const avatarMap: Record<number, string> = {};
  
  clients.forEach(client => {
    const svg = generateAvatar(client.fullName, client.tier);
    avatarMap[client.id] = svgToDataURL(svg);
  });
  
  return avatarMap;
}