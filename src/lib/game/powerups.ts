export type PowerUpId = "multiplier" | "calorie" | "shield" | "freeze";

export type PowerUp = {
  id: PowerUpId;
  name: string;
  blurb: string;
  emoji: string;
  cost: number;
  durationMs: number;
  unlockLevel: number;
};

export const POWER_UPS: PowerUp[] = [
  {
    id: "multiplier",
    name: "Score Multiplier",
    blurb: "Double points for 30 seconds.",
    emoji: "✖️",
    cost: 120,
    durationMs: 30000,
    unlockLevel: 1,
  },
  {
    id: "calorie",
    name: "Calorie Boost",
    blurb: "Counts 25% extra burn for 45 seconds.",
    emoji: "🔥",
    cost: 150,
    durationMs: 45000,
    unlockLevel: 3,
  },
  {
    id: "shield",
    name: "Combo Shield",
    blurb: "Protects your combo from one mistake or pause.",
    emoji: "🛡️",
    cost: 180,
    durationMs: 60000,
    unlockLevel: 5,
  },
  {
    id: "freeze",
    name: "Time Freeze",
    blurb: "Pauses the clock and the boss for 15 seconds.",
    emoji: "⏱️",
    cost: 220,
    durationMs: 15000,
    unlockLevel: 8,
  },
];

export const POWER_UP_BY_ID = Object.fromEntries(POWER_UPS.map((p) => [p.id, p])) as Record<
  PowerUpId,
  PowerUp
>;
