export type Keypoint = { name?: string; x: number; y: number; score?: number };

export type MetricId =
  | "kneeAngle"
  | "elbowAngle"
  | "hipAngle"
  | "shoulderAngle"
  | "kneeSplit"
  | "hipHeight";

export type MetricDef = {
  id: MetricId;
  label: string;
  unit: string;
  min: number;
  max: number;
  hint: string;
};

export const METRICS: MetricDef[] = [
  {
    id: "kneeAngle",
    label: "Knee bend",
    unit: "°",
    min: 40,
    max: 180,
    hint: "Angle between hip, knee and ankle. Small = deep bend.",
  },
  {
    id: "elbowAngle",
    label: "Elbow bend",
    unit: "°",
    min: 30,
    max: 180,
    hint: "Angle between shoulder, elbow and wrist.",
  },
  {
    id: "hipAngle",
    label: "Hip hinge",
    unit: "°",
    min: 30,
    max: 180,
    hint: "Angle between shoulder, hip and knee.",
  },
  {
    id: "shoulderAngle",
    label: "Arm raise",
    unit: "°",
    min: 0,
    max: 180,
    hint: "Angle between hip, shoulder and elbow.",
  },
  {
    id: "kneeSplit",
    label: "Leg split",
    unit: "°",
    min: 0,
    max: 90,
    hint: "Difference between left and right knee bend. Big = lunge stance.",
  },
  {
    id: "hipHeight",
    label: "Body lift",
    unit: "%",
    min: 0,
    max: 100,
    hint: "How high the hips sit in frame. Spikes when you leave the ground.",
  },
];

export type Exercise = {
  id: string;
  name: string;
  tagline: string;
  emoji: string;
  metric: MetricId;
  /** value that marks the "loaded" phase */
  down: number;
  /** value that marks the "reset" phase */
  up: number;
  points: number;
  custom?: boolean;
};

export const BUILT_IN_EXERCISES: Exercise[] = [
  {
    id: "squat",
    name: "Squat",
    tagline: "Drop your hips below parallel, drive up tall.",
    emoji: "🦵",
    metric: "kneeAngle",
    down: 100,
    up: 158,
    points: 10,
  },
  {
    id: "jump",
    name: "Jump",
    tagline: "Explode off the floor, land soft.",
    emoji: "⚡",
    metric: "hipHeight",
    down: 62,
    up: 54,
    points: 12,
  },
  {
    id: "pushup",
    name: "Push-up",
    tagline: "Chest to the deck, lock the elbows out.",
    emoji: "💪",
    metric: "elbowAngle",
    down: 100,
    up: 155,
    points: 14,
  },
  {
    id: "lunge",
    name: "Lunge",
    tagline: "Split your stance, back knee low.",
    emoji: "🏃",
    metric: "kneeSplit",
    down: 38,
    up: 16,
    points: 12,
  },
];

/** Is the "down" phase reached by going below the threshold? */
export function isInverted(metric: MetricId) {
  return metric !== "hipHeight" && metric !== "shoulderAngle" && metric !== "kneeSplit";
}

function byName(kps: Keypoint[]) {
  const map = new Map<string, Keypoint>();
  for (const k of kps) if (k.name) map.set(k.name, k);
  return map;
}

function angle(a?: Keypoint, b?: Keypoint, c?: Keypoint) {
  if (!a || !b || !c) return null;
  const abx = a.x - b.x;
  const aby = a.y - b.y;
  const cbx = c.x - b.x;
  const cby = c.y - b.y;
  const dot = abx * cbx + aby * cby;
  const mag = Math.hypot(abx, aby) * Math.hypot(cbx, cby);
  if (!mag) return null;
  const deg = (Math.acos(Math.max(-1, Math.min(1, dot / mag))) * 180) / Math.PI;
  return deg;
}

const MIN_SCORE = 0.3;
const ok = (k?: Keypoint) => (k && (k.score ?? 0) > MIN_SCORE ? k : undefined);

export type MetricSample = { value: number | null; visible: boolean };

export function computeMetric(
  metric: MetricId,
  keypoints: Keypoint[],
  frameHeight: number,
): MetricSample {
  const m = byName(keypoints);
  const g = (n: string) => ok(m.get(n));

  const leftKnee = angle(g("left_hip"), g("left_knee"), g("left_ankle"));
  const rightKnee = angle(g("right_hip"), g("right_knee"), g("right_ankle"));
  const leftElbow = angle(g("left_shoulder"), g("left_elbow"), g("left_wrist"));
  const rightElbow = angle(g("right_shoulder"), g("right_elbow"), g("right_wrist"));
  const leftHip = angle(g("left_shoulder"), g("left_hip"), g("left_knee"));
  const rightHip = angle(g("right_shoulder"), g("right_hip"), g("right_knee"));
  const leftSh = angle(g("left_hip"), g("left_shoulder"), g("left_elbow"));
  const rightSh = angle(g("right_hip"), g("right_shoulder"), g("right_elbow"));

  const avg = (a: number | null, b: number | null) =>
    a != null && b != null ? (a + b) / 2 : (a ?? b);

  switch (metric) {
    case "kneeAngle":
      return { value: avg(leftKnee, rightKnee), visible: leftKnee != null || rightKnee != null };
    case "elbowAngle":
      return { value: avg(leftElbow, rightElbow), visible: leftElbow != null || rightElbow != null };
    case "hipAngle":
      return { value: avg(leftHip, rightHip), visible: leftHip != null || rightHip != null };
    case "shoulderAngle":
      return { value: avg(leftSh, rightSh), visible: leftSh != null || rightSh != null };
    case "kneeSplit": {
      if (leftKnee == null || rightKnee == null) return { value: null, visible: false };
      return { value: Math.abs(leftKnee - rightKnee), visible: true };
    }
    case "hipHeight": {
      const lh = g("left_hip");
      const rh = g("right_hip");
      if (!lh && !rh) return { value: null, visible: false };
      const y = lh && rh ? (lh.y + rh.y) / 2 : ((lh ?? rh) as Keypoint).y;
      return { value: (1 - y / Math.max(1, frameHeight)) * 100, visible: true };
    }
    default:
      return { value: null, visible: false };
  }
}

export type RepState = { phase: "ready" | "loaded"; progress: number };

/**
 * Feeds a metric sample through the rep state machine.
 * Returns the new state and whether a rep just completed.
 */
export function stepRep(
  exercise: Exercise,
  sample: number,
  state: RepState,
): { state: RepState; rep: boolean } {
  const inverted = isInverted(exercise.metric);
  const reachedDown = inverted ? sample <= exercise.down : sample >= exercise.down;
  const reachedUp = inverted ? sample >= exercise.up : sample <= exercise.up;

  const span = Math.abs(exercise.up - exercise.down) || 1;
  const raw = inverted ? (exercise.up - sample) / span : (sample - exercise.up) / span;
  const progress = Math.max(0, Math.min(1, raw));

  if (state.phase === "ready" && reachedDown) {
    return { state: { phase: "loaded", progress }, rep: false };
  }
  if (state.phase === "loaded" && reachedUp) {
    return { state: { phase: "ready", progress }, rep: true };
  }
  return { state: { phase: state.phase, progress }, rep: false };
}
