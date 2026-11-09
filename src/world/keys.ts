/**
 * The scroll story, as data. Each home section names a key in `data-world`;
 * the world interpolates between these as that section reaches the viewport.
 *
 * mood runs 0 dawn, 1 day, 2 dusk, 3 night. Rain is a separate overlay on top.
 * front is the z position the green has reached (the camera travels toward -z).
 * first is the growth of the single tree that stands alone in the desert.
 */
export interface WorldState {
  camZ: number; eye: number; look: number; front: number;
  rain: number; mood: number; petals: number; side: number; first: number;
}

export const WORLD_KEYS: Record<string, WorldState> = {
  hero:      { camZ: 34,   eye: 2.7,  look: 6.3, front: 95,   rain: 0, mood: 0,   petals: 0,   side: 0, first: 0 },
  land:      { camZ: 31,   eye: 3,    look: 8,   front: 92,   rain: 0, mood: 0.05, petals: 0,  side: 0, first: 0 },
  steps:     { camZ: 26,   eye: 3.4,  look: 9.5, front: 60,   rain: 0, mood: 0.2, petals: 0,   side: 0, first: 1 },
  stepsMid:  { camZ: 16,   eye: 6,    look: 7,   front: -46,  rain: 0, mood: 0.6, petals: 0.1, side: 0, first: 1 },
  stepsEnd:  { camZ: -40,  eye: 9,    look: 6,   front: -150, rain: 0, mood: 1,   petals: 0.4, side: 0, first: 1 },
  identify:  { camZ: -62,  eye: 3.8,  look: 7,   front: -170, rain: 0, mood: 1,   petals: 0.7, side: 2, first: 1 },
  irrigate:  { camZ: -102, eye: 11,   look: 3,   front: -210, rain: 1, mood: 1,   petals: 0,   side: -2, first: 1 },
  irrigateEnd: { camZ: -128, eye: 15, look: 2,   front: -240, rain: 1, mood: 1,   petals: 0,   side: 2, first: 1 },
  measure:   { camZ: -148, eye: 30,   look: -7,  front: -280, rain: 0, mood: 1,   petals: 0.2, side: 0, first: 1 },
  rings:     { camZ: -168, eye: 12,   look: 2,   front: -300, rain: 0, mood: 1.3, petals: 0.2, side: 0, first: 1 },
  campaigns: { camZ: -190, eye: 4.5,  look: 8,   front: -340, rain: 0, mood: 1.45, petals: 0.8, side: 0, first: 1 },
  stories:   { camZ: -250, eye: 15,   look: 3,   front: -390, rain: 0, mood: 2,   petals: 0.5, side: 0, first: 1 },
  almanac:   { camZ: -268, eye: 8,    look: 5,   front: -390, rain: 0, mood: 2.4, petals: 0.2, side: 0, first: 1 },
  plant:     { camZ: -296, eye: 6,    look: 8,   front: -390, rain: 0, mood: 3,   petals: 0,   side: 0, first: 1 },
};

export const FIELDS = Object.keys(WORLD_KEYS.hero) as (keyof WorldState)[];

/** Blended by the float `mood`. Sky colors live in CSS so the canvas can be transparent. */
export const MOODS = [
  { sun: 0xfff0d6, sunI: 1.02, amb: 0x8d6f58, fog: 0xb4dcf2, sunDir: [0.55, 0.3, 0.45], wind: 0.7 },
  { sun: 0xfff6dc, sunI: 1.02, amb: 0x6f8476, fog: 0xc6e6ee, sunDir: [0.4, 0.8, 0.2],  wind: 1 },
  { sun: 0xffb56b, sunI: 1.08, amb: 0x5e5552, fog: 0xe0a06a, sunDir: [-0.7, 0.26, 0.2], wind: 0.8 },
  { sun: 0x7ea3c6, sunI: 0.36, amb: 0x1f3a38, fog: 0x0a1f1d, sunDir: [-0.3, 0.6, -0.4], wind: 0.5 },
];
export const STORM = { sun: 0xb9cdd0, sunI: 0.56, amb: 0x65767a, fog: 0x8fa4a6, wind: 2.2 };

export const SKY_LAYERS = 4;
