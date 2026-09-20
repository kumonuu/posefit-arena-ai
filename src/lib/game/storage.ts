import { useCallback, useEffect, useState } from "react";
import type { SaveData } from "./types";
import { rollDailies, todayKey } from "./challenges";

const KEY = "posefit-arena-save-v2";
const LEGACY_CUSTOM = "posefit-custom-exercises";

export function emptySave(): SaveData {
  return {
    version: 2,
    profile: { name: "Athlete", weightKg: 72, voice: true },
    xp: 0,
    coins: 120,
    totals: { reps: 0, calories: 0, durationMs: 0, sessions: 0 },
    records: {},
    badges: [],
    inventory: { multiplier: 1, calorie: 1, shield: 1, freeze: 1 },
    equipped: [],
    dailies: { day: todayKey(), items: rollDailies(todayKey()) },
    streak: { day: "", count: 0 },
    history: [],
    ghosts: [],
    routines: [],
    customExercises: [],
    campaign: { cleared: [] },
    adaptive: { level: 1 },
  };
}

export function loadSave(): SaveData {
  const base = emptySave();
  if (typeof window === "undefined") return base;
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<SaveData>;
      const merged: SaveData = { ...base, ...parsed, version: 2 };
      merged.profile = { ...base.profile, ...parsed.profile };
      merged.totals = { ...base.totals, ...parsed.totals };
      merged.inventory = { ...base.inventory, ...parsed.inventory };
      if (!merged.dailies || merged.dailies.day !== todayKey()) {
        merged.dailies = { day: todayKey(), items: rollDailies(todayKey()) };
      }
      return merged;
    }
    const legacy = localStorage.getItem(LEGACY_CUSTOM);
    if (legacy) base.customExercises = JSON.parse(legacy);
  } catch {
    /* unreadable storage — start fresh */
  }
  return base;
}

export function persistSave(data: SaveData) {
  try {
    localStorage.setItem(KEY, JSON.stringify(data));
  } catch {
    /* storage full — progress stays in memory */
  }
}

const listeners = new Set<(d: SaveData) => void>();
let current: SaveData | null = null;

export function getSave(): SaveData {
  if (!current) current = loadSave();
  return current;
}

export function updateSave(fn: (d: SaveData) => SaveData) {
  const next = fn(getSave());
  current = next;
  persistSave(next);
  listeners.forEach((l) => l(next));
}

/** Reactive access to the local save file. Hydration-safe. */
export function useSave() {
  const [data, setData] = useState<SaveData>(emptySave);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setData(getSave());
    setReady(true);
    const l = (d: SaveData) => setData(d);
    listeners.add(l);
    return () => {
      listeners.delete(l);
    };
  }, []);

  const update = useCallback((fn: (d: SaveData) => SaveData) => updateSave(fn), []);
  return { save: data, update, ready };
}
