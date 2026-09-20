import type { DailyChallenge } from "./types";

export function todayKey(d = new Date()) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate(),
  ).padStart(2, "0")}`;
}

function seeded(seed: string) {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return () => {
    h = Math.imul(h ^ (h >>> 15), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return ((h ^= h >>> 16) >>> 0) / 4294967296;
  };
}

const POOL = ["squat", "jump", "pushup", "lunge"] as const;
const NAMES: Record<string, string> = {
  squat: "squats",
  jump: "jumps",
  pushup: "push-ups",
  lunge: "lunges",
};

export function rollDailies(day: string): DailyChallenge[] {
  const rnd = seeded(day);
  const pick = () => POOL[Math.floor(rnd() * POOL.length)]!;
  const a = pick();
  const b = pick();

  const repTarget = 20 + Math.floor(rnd() * 5) * 5;
  const minutes = 2 + Math.floor(rnd() * 3);
  const kcal = 30 + Math.floor(rnd() * 5) * 10;

  return [
    {
      id: `${day}-reps`,
      kind: "reps",
      label: `${repTarget} ${NAMES[a]}`,
      detail: "Complete them in any number of sessions today.",
      exerciseId: a,
      target: repTarget,
      progress: 0,
      done: false,
      xp: 220,
      coins: 70,
      badge: "Daily Grinder",
    },
    {
      id: `${day}-timed`,
      kind: "timed",
      label: `Train ${minutes} minutes`,
      detail: `Keep moving with ${NAMES[b]} or anything else.`,
      exerciseId: null,
      target: minutes * 60000,
      progress: 0,
      done: false,
      xp: 260,
      coins: 80,
    },
    {
      id: `${day}-cal`,
      kind: "calories",
      label: `Burn ~${kcal} kcal (est.)`,
      detail: "Estimated from your body weight and effort.",
      exerciseId: null,
      target: kcal,
      progress: 0,
      done: false,
      xp: 300,
      coins: 100,
      badge: "Furnace",
    },
  ];
}
