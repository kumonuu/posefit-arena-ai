export type Tier = { name: string; from: number; color: string };

export const TIERS: Tier[] = [
  { name: "Rookie", from: 1, color: "oklch(0.82 0.15 205)" },
  { name: "Athlete", from: 5, color: "oklch(0.88 0.22 128)" },
  { name: "Champion", from: 11, color: "oklch(0.74 0.19 45)" },
  { name: "Elite", from: 19, color: "oklch(0.66 0.2 320)" },
];

/** Cumulative XP needed to reach a level. */
export function xpForLevel(level: number) {
  if (level <= 1) return 0;
  let total = 0;
  for (let i = 1; i < level; i++) total += Math.round(140 * Math.pow(i, 1.25));
  return total;
}

export function levelFromXp(xp: number) {
  let level = 1;
  while (xpForLevel(level + 1) <= xp && level < 60) level++;
  const floor = xpForLevel(level);
  const ceil = xpForLevel(level + 1);
  return {
    level,
    tier: tierFor(level),
    into: xp - floor,
    needed: ceil - floor,
    progress: (xp - floor) / Math.max(1, ceil - floor),
  };
}

export function tierFor(level: number): Tier {
  let t = TIERS[0]!;
  for (const tier of TIERS) if (level >= tier.from) t = tier;
  return t;
}

export function xpFromSession(opts: {
  reps: number;
  formAccuracy: number;
  bestCombo: number;
  won: boolean;
}) {
  const base = opts.reps * 8;
  const form = Math.round(base * (opts.formAccuracy / 100) * 0.5);
  const combo = opts.bestCombo * 12;
  const bonus = opts.won ? 150 : 0;
  return base + form + combo + bonus;
}

export function coinsFromSession(reps: number, formAccuracy: number, won: boolean) {
  return Math.round(reps * 1.5 + (formAccuracy / 100) * 20 + (won ? 60 : 0));
}
