import type { SessionSummary } from "./types";

export type Adaptive = {
  level: number;
  label: string;
  targetMultiplier: number;
  bossMultiplier: number;
  note: string;
};

/**
 * Nudges difficulty from the last few sessions: speed, consistency and form.
 * Level runs 1 (gentle) to 5 (brutal).
 */
export function computeAdaptive(history: SessionSummary[], stored: number): Adaptive {
  const recent = history.slice(0, 5);
  let level = stored;

  if (recent.length >= 2) {
    const avgForm = recent.reduce((s, r) => s + r.formAccuracy, 0) / recent.length;
    const avgPace =
      recent.reduce((s, r) => s + r.reps / Math.max(0.2, r.durationMs / 60000), 0) / recent.length;
    const winRate = recent.filter((r) => r.won).length / recent.length;

    let target = 1;
    if (avgForm > 88 && avgPace > 14) target = 4;
    else if (avgForm > 80 && avgPace > 10) target = 3;
    else if (avgForm > 70) target = 2;
    if (winRate > 0.8 && target >= 4) target = 5;

    level = Math.max(1, Math.min(5, Math.round((stored + target) / 2)));
  }

  const labels = ["Warm", "Steady", "Balanced", "Sharp", "Relentless"];
  return {
    level,
    label: labels[level - 1] ?? "Balanced",
    targetMultiplier: 0.8 + level * 0.15,
    bossMultiplier: 0.75 + level * 0.18,
    note:
      level >= 4
        ? "Your recent form and pace were excellent, so targets went up."
        : level <= 2
          ? "Targets are eased off while you build consistency."
          : "Targets match your recent pace and form.",
  };
}
