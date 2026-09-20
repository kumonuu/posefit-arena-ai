import { isInverted, type Exercise, type Keypoint } from "@/lib/pose/exercises";

export type FormResult = { score: number; violations: string[]; cue: string | null };

function map(kps: Keypoint[]) {
  const m = new Map<string, Keypoint>();
  for (const k of kps) if (k.name && (k.score ?? 0) > 0.3) m.set(k.name, k);
  return m;
}

function mid(a?: Keypoint, b?: Keypoint) {
  if (a && b) return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
  return a ?? b ?? null;
}

function lineAngle(a: { x: number; y: number }, b: { x: number; y: number }) {
  return (Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI;
}

/** How far past the action threshold the rep actually went, 0..1. */
export function depthRatio(exercise: Exercise, peak: number) {
  const span = Math.abs(exercise.up - exercise.down) || 1;
  const over = isInverted(exercise.metric) ? exercise.down - peak : peak - exercise.down;
  return Math.max(0, Math.min(1, 0.6 + over / span));
}

/**
 * Scores one completed rep from its depth, tempo and body alignment at the
 * deepest point, and returns a short coaching cue for the worst problem.
 */
export function scoreRep(opts: {
  exercise: Exercise;
  peak: number;
  durationMs: number;
  peakKeypoints: Keypoint[];
}): FormResult {
  const violations: string[] = [];
  let score = 100;

  const depth = depthRatio(opts.exercise, opts.peak);
  if (depth < 0.72) {
    score -= 22;
    violations.push("Go deeper into the move");
  }

  if (opts.durationMs < 550) {
    score -= 16;
    violations.push("Slow down — control the movement");
  } else if (opts.durationMs > 4200) {
    score -= 8;
    violations.push("Keep a steady rhythm");
  }

  const m = map(opts.peakKeypoints);
  const shoulders = mid(m.get("left_shoulder"), m.get("right_shoulder"));
  const hips = mid(m.get("left_hip"), m.get("right_hip"));
  const knees = mid(m.get("left_knee"), m.get("right_knee"));
  const ls = m.get("left_shoulder");
  const rs = m.get("right_shoulder");
  const lh = m.get("left_hip");
  const rh = m.get("right_hip");

  const id = opts.exercise.id;

  if ((id === "squat" || id === "lunge") && shoulders && hips) {
    const lean = Math.abs(90 - Math.abs(lineAngle(hips, shoulders)));
    if (lean > 38) {
      score -= 18;
      violations.push("Chest up — you're leaning forward");
    }
  }

  if (id === "pushup" && shoulders && hips && knees) {
    const torso = lineAngle(shoulders, hips);
    const legs = lineAngle(hips, knees);
    const bend = Math.abs(torso - legs);
    if (bend > 26) {
      score -= 20;
      violations.push("Keep hips in line with your back");
    }
  }

  if (ls && rs) {
    const tilt = Math.abs(ls.y - rs.y);
    const width = Math.max(1, Math.abs(ls.x - rs.x));
    if (tilt / width > 0.28) {
      score -= 12;
      violations.push("Level your shoulders");
    }
  }

  if (lh && rh && (id === "squat" || id === "jump")) {
    const tilt = Math.abs(lh.y - rh.y);
    const width = Math.max(1, Math.abs(lh.x - rh.x));
    if (tilt / width > 0.3) {
      score -= 10;
      violations.push("Keep your hips even");
    }
  }

  score = Math.max(20, Math.min(100, Math.round(score)));
  return { score, violations, cue: violations[0] ?? null };
}
