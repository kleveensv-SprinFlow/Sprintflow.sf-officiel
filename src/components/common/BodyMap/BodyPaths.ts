// Simplified Anatomical Paths for Body Map
// Using a 0-100 coordinate system for easier scaling

export interface BodyPart {
  id: string;
  name: string;
  path: string; // SVG Path data
  cx?: number;  // Center X for label/interaction
  cy?: number;  // Center Y
}

export const BODY_PARTS_MALE_FRONT: BodyPart[] = [
  { id: 'head', name: 'Tête', path: 'M50,5 C40,5 35,15 35,25 C35,35 40,40 50,40 C60,40 65,35 65,25 C65,15 60,5 50,5 Z' },
  { id: 'neck', name: 'Cou', path: 'M42,40 L58,40 L58,45 Q58,50 65,52 L35,52 Q42,50 42,45 Z' },
  { id: 'shoulder_left', name: 'Épaule G', path: 'M65,52 L85,55 L85,65 L65,60 Z' },
  { id: 'shoulder_right', name: 'Épaule D', path: 'M35,52 L15,55 L15,65 L35,60 Z' },
  { id: 'chest', name: 'Poitrine', path: 'M35,52 L65,52 L60,80 L40,80 Z' },
  { id: 'arm_left', name: 'Bras G', path: 'M85,55 L95,58 L90,90 L80,85 Z' },
  { id: 'arm_right', name: 'Bras D', path: 'M15,55 L5,58 L10,90 L20,85 Z' },
  { id: 'forearm_left', name: 'Avant-bras G', path: 'M90,90 L95,120 L85,125 L80,85 Z' },
  { id: 'forearm_right', name: 'Avant-bras D', path: 'M10,90 L5,120 L15,125 L20,85 Z' },
  { id: 'hand_left', name: 'Main G', path: 'M95,120 L100,135 L80,135 L85,125 Z' },
  { id: 'hand_right', name: 'Main D', path: 'M5,120 L0,135 L20,135 L15,125 Z' },
  { id: 'abs', name: 'Abdominaux', path: 'M40,80 L60,80 L58,110 L42,110 Z' },
  { id: 'hips', name: 'Hanches', path: 'M42,110 L58,110 L65,130 L35,130 Z' },
  { id: 'thigh_left', name: 'Cuisse G', path: 'M50,130 L65,130 L70,180 L52,180 Z' },
  { id: 'thigh_right', name: 'Cuisse D', path: 'M50,130 L35,130 L30,180 L48,180 Z' },
  { id: 'knee_left', name: 'Genou G', path: 'M52,180 L70,180 L68,200 L54,200 Z' },
  { id: 'knee_right', name: 'Genou D', path: 'M48,180 L30,180 L32,200 L46,200 Z' },
  { id: 'shin_left', name: 'Tibia G', path: 'M54,200 L68,200 L65,250 L56,250 Z' },
  { id: 'shin_right', name: 'Tibia D', path: 'M46,200 L32,200 L35,250 L44,250 Z' },
  { id: 'foot_left', name: 'Pied G', path: 'M56,250 L65,250 L70,265 L54,265 Z' },
  { id: 'foot_right', name: 'Pied D', path: 'M44,250 L35,250 L30,265 L46,265 Z' },
];

export const BODY_PARTS_MALE_BACK: BodyPart[] = [
  { id: 'head_back', name: 'Tête', path: 'M50,5 C40,5 35,15 35,25 C35,35 40,40 50,40 C60,40 65,35 65,25 C65,15 60,5 50,5 Z' },
  { id: 'neck_back', name: 'Nuque', path: 'M42,40 L58,40 L58,45 Q58,50 65,52 L35,52 Q42,50 42,45 Z' },
  { id: 'traps', name: 'Trapèzes', path: 'M35,52 L65,52 L60,60 L40,60 Z' },
  { id: 'shoulder_blade_left', name: 'Omoplate G', path: 'M50,60 L60,60 L62,80 L50,80 Z' },
  { id: 'shoulder_blade_right', name: 'Omoplate D', path: 'M50,60 L40,60 L38,80 L50,80 Z' },
  { id: 'back_lower', name: 'Lombaires', path: 'M38,80 L62,80 L60,110 L40,110 Z' },
  { id: 'glutes', name: 'Fessiers', path: 'M40,110 L60,110 L65,135 L35,135 Z' },
  { id: 'hamstring_left', name: 'Ischios G', path: 'M50,135 L65,135 L70,180 L52,180 Z' },
  { id: 'hamstring_right', name: 'Ischios D', path: 'M50,135 L35,135 L30,180 L48,180 Z' },
  { id: 'calf_left', name: 'Mollet G', path: 'M52,180 L70,180 L65,230 L55,230 Z' },
  { id: 'calf_right', name: 'Mollet D', path: 'M48,180 L30,180 L35,230 L45,230 Z' },
  { id: 'achilles_left', name: 'Achille G', path: 'M55,230 L65,230 L65,250 L55,250 Z' },
  { id: 'achilles_right', name: 'Achille D', path: 'M45,230 L35,230 L35,250 L45,250 Z' },
  // Arms back
  { id: 'tricep_left', name: 'Triceps G', path: 'M90,55 L85,55 L80,85 L95,90 Z' }, // Adjusted for back view orientation logic if needed, but keeping simple
  { id: 'tricep_right', name: 'Triceps D', path: 'M10,55 L15,55 L20,85 L5,90 Z' },
];

// Reusing similar paths for female but with slightly different proportions if needed
// For "Simplifié", we can reuse most but maybe adjust hips/chest
export const BODY_PARTS_FEMALE_FRONT: BodyPart[] = [
    ...BODY_PARTS_MALE_FRONT.filter(p => !['chest', 'hips', 'thigh_left', 'thigh_right'].includes(p.id)),
    { id: 'chest', name: 'Poitrine', path: 'M35,52 L65,52 L62,80 L38,80 Z' },
    { id: 'hips', name: 'Hanches', path: 'M38,110 L62,110 L70,135 L30,135 Z' },
    { id: 'thigh_left', name: 'Cuisse G', path: 'M50,135 L70,135 L72,180 L52,180 Z' },
    { id: 'thigh_right', name: 'Cuisse D', path: 'M50,135 L30,135 L28,180 L48,180 Z' },
];

export const BODY_PARTS_FEMALE_BACK: BodyPart[] = [
    ...BODY_PARTS_MALE_BACK.filter(p => !['glutes'].includes(p.id)),
    { id: 'glutes', name: 'Fessiers', path: 'M38,110 L62,110 L68,140 L32,140 Z' },
];
