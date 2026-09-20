/** Rough MET values per move — used only for an estimate. */
const MET: Record<string, number> = {
  squat: 5.5,
  jump: 8.5,
  pushup: 7,
  lunge: 5,
  burpee: 9,
  mountain: 8,
  plankup: 6,
  jack: 7.5,
};

export function metFor(exerciseId: string) {
  return MET[exerciseId] ?? 5.5;
}

/**
 * Estimated kcal burned. Intensity comes from rep tempo:
 * faster, fuller reps push the MET value up a little.
 */
export function estimateCalories(opts: {
  exerciseId: string;
  weightKg: number;
  activeMs: number;
  reps: number;
  formAccuracy: number;
}) {
  const minutes = opts.activeMs / 60000;
  if (minutes <= 0) return 0;
  const repsPerMin = opts.reps / Math.max(minutes, 0.05);
  const intensity = Math.max(0.7, Math.min(1.45, 0.75 + repsPerMin / 30));
  const quality = 0.85 + (opts.formAccuracy / 100) * 0.25;
  const met = metFor(opts.exerciseId) * intensity * quality;
  return (met * 3.5 * opts.weightKg) / 200 * minutes;
}
