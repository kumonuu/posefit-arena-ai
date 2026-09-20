export type Boss = {
  name: string;
  emoji: string;
  health: number;
  attackEveryMs: number;
  taunt: string;
};

export type Arena = {
  id: string;
  name: string;
  theme: string;
  blurb: string;
  emoji: string;
  accent: string;
  unlockLevel: number;
  exerciseIds: string[];
  mission: { label: string; reps: number; minForm: number };
  boss?: Boss;
  reward: { xp: number; coins: number; badge: string };
};

export const ARENAS: Arena[] = [
  {
    id: "training-yard",
    name: "Training Yard",
    theme: "Dawn concrete",
    blurb: "Learn the ropes with clean, honest squats.",
    emoji: "🏟️",
    accent: "oklch(0.88 0.22 128)",
    unlockLevel: 1,
    exerciseIds: ["squat"],
    mission: { label: "20 squats at 70%+ form", reps: 20, minForm: 70 },
    reward: { xp: 250, coins: 90, badge: "First Steps" },
  },
  {
    id: "neon-dojo",
    name: "Neon Dojo",
    theme: "Midnight neon",
    blurb: "Sharpen your upper body under the lights.",
    emoji: "🏮",
    accent: "oklch(0.82 0.15 205)",
    unlockLevel: 2,
    exerciseIds: ["pushup", "squat"],
    mission: { label: "18 push-ups at 72%+ form", reps: 18, minForm: 72 },
    boss: {
      name: "Sensei Circuit",
      emoji: "🤖",
      health: 900,
      attackEveryMs: 9000,
      taunt: "Your elbows betray you.",
    },
    reward: { xp: 420, coins: 140, badge: "Dojo Cleared" },
  },
  {
    id: "storm-deck",
    name: "Storm Deck",
    theme: "Rain-soaked rooftop",
    blurb: "Explosive jumps above the skyline.",
    emoji: "🌩️",
    accent: "oklch(0.7 0.18 260)",
    unlockLevel: 4,
    exerciseIds: ["jump", "squat"],
    mission: { label: "25 jumps at 70%+ form", reps: 25, minForm: 70 },
    boss: {
      name: "Voltara",
      emoji: "⚡",
      health: 1300,
      attackEveryMs: 8000,
      taunt: "Lightning never lands twice.",
    },
    reward: { xp: 560, coins: 190, badge: "Sky Runner" },
  },
  {
    id: "magma-pit",
    name: "Magma Pit",
    theme: "Volcanic arena",
    blurb: "Lunges over the heat. Legs of iron required.",
    emoji: "🌋",
    accent: "oklch(0.74 0.19 45)",
    unlockLevel: 7,
    exerciseIds: ["lunge", "jump"],
    mission: { label: "24 lunges at 75%+ form", reps: 24, minForm: 75 },
    boss: {
      name: "Cinder Colossus",
      emoji: "🔥",
      health: 1800,
      attackEveryMs: 7000,
      taunt: "You will melt before I do.",
    },
    reward: { xp: 720, coins: 240, badge: "Pit Champion" },
  },
  {
    id: "orbit-ring",
    name: "Orbit Ring",
    theme: "Zero-gravity station",
    blurb: "The final arena. Everything you have learned.",
    emoji: "🛰️",
    accent: "oklch(0.66 0.2 320)",
    unlockLevel: 11,
    exerciseIds: ["squat", "pushup", "jump", "lunge"],
    mission: { label: "40 reps at 80%+ form", reps: 40, minForm: 80 },
    boss: {
      name: "Nova Prime",
      emoji: "👑",
      health: 2600,
      attackEveryMs: 6500,
      taunt: "Champions break here.",
    },
    reward: { xp: 1100, coins: 400, badge: "Elite Ascendant" },
  },
];

export function arenaById(id: string) {
  return ARENAS.find((a) => a.id === id) ?? ARENAS[0]!;
}

/** Damage one rep deals to a boss. */
export function repDamage(formScore: number, combo: number) {
  return Math.round((14 + formScore * 0.45) * combo);
}
