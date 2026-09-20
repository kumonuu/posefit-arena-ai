import type { Exercise } from "@/lib/pose/exercises";

export type RepDetail = {
  at: number;
  durationMs: number;
  depth: number;
  formScore: number;
  violations: string[];
};

export type SessionSummary = {
  id: string;
  date: string;
  arenaId: string;
  arenaName: string;
  exerciseIds: string[];
  reps: number;
  score: number;
  calories: number;
  durationMs: number;
  formAccuracy: number;
  xpEarned: number;
  coinsEarned: number;
  bestCombo: number;
  won: boolean;
};

export type Ghost = {
  id: string;
  exerciseId: string;
  exerciseName: string;
  date: string;
  reps: number;
  durationMs: number;
  /** ms offset of every rep from session start */
  timeline: number[];
};

export type RoutineStep = {
  exerciseId: string;
  target: number;
  mode: "reps" | "seconds";
};

export type Routine = {
  id: string;
  name: string;
  steps: RoutineStep[];
};

export type DailyChallenge = {
  id: string;
  kind: "reps" | "timed" | "calories" | "form";
  label: string;
  detail: string;
  exerciseId: string | null;
  target: number;
  progress: number;
  done: boolean;
  xp: number;
  coins: number;
  badge?: string;
};

export type SaveData = {
  version: number;
  profile: { name: string; weightKg: number; voice: boolean };
  xp: number;
  coins: number;
  totals: { reps: number; calories: number; durationMs: number; sessions: number };
  records: Record<string, number>;
  badges: string[];
  inventory: Record<string, number>;
  equipped: string[];
  dailies: { day: string; items: DailyChallenge[] };
  streak: { day: string; count: number };
  history: SessionSummary[];
  ghosts: Ghost[];
  routines: Routine[];
  customExercises: Exercise[];
  campaign: { cleared: string[] };
  adaptive: { level: number };
};
