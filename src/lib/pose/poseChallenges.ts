import type { Keypoint } from "./exercises";

export type PoseChallengeId = "hands_up" | "t_pose" | "squat_hold" | "star";

export type PoseChallenge = {
  id: PoseChallengeId;
  label: string;
  emoji: string;
  windowMs: number;
  reward: number;
};

export const POSE_CHALLENGES: PoseChallenge[] = [
  { id: "hands_up", label: "Hands above your head!", emoji: "🙌", windowMs: 4000, reward: 60 },
  { id: "t_pose", label: "Arms wide — T-pose!", emoji: "✝️", windowMs: 4000, reward: 70 },
  { id: "squat_hold", label: "Drop and hold a squat!", emoji: "🪑", windowMs: 5000, reward: 90 },
  { id: "star", label: "Star shape — wide and tall!", emoji: "⭐", windowMs: 4500, reward: 100 },
];

function grab(kps: Keypoint[]) {
  const m = new Map<string, Keypoint>();
  for (const k of kps) if (k.name && (k.score ?? 0) > 0.3) m.set(k.name, k);
  return m;
}

function angle(a?: Keypoint, b?: Keypoint, c?: Keypoint) {
  if (!a || !b || !c) return null;
  const v1x = a.x - b.x;
  const v1y = a.y - b.y;
  const v2x = c.x - b.x;
  const v2y = c.y - b.y;
  const mag = Math.hypot(v1x, v1y) * Math.hypot(v2x, v2y);
  if (!mag) return null;
  return (Math.acos(Math.max(-1, Math.min(1, (v1x * v2x + v1y * v2y) / mag))) * 180) / Math.PI;
}

/** True when the player is currently holding the requested shape. */
export function matchesPose(id: PoseChallengeId, kps: Keypoint[]) {
  const m = grab(kps);
  const lw = m.get("left_wrist");
  const rw = m.get("right_wrist");
  const ls = m.get("left_shoulder");
  const rs = m.get("right_shoulder");
  const la = m.get("left_ankle");
  const ra = m.get("right_ankle");

  switch (id) {
    case "hands_up":
      return !!(lw && rw && ls && rs && lw.y < ls.y - 30 && rw.y < rs.y - 30);
    case "t_pose": {
      if (!lw || !rw || !ls || !rs) return false;
      const width = Math.abs(ls.x - rs.x) || 1;
      const level = Math.abs(lw.y - ls.y) < width * 0.5 && Math.abs(rw.y - rs.y) < width * 0.5;
      const wide = Math.abs(lw.x - rw.x) > width * 2.1;
      return level && wide;
    }
    case "squat_hold": {
      const l = angle(m.get("left_hip"), m.get("left_knee"), m.get("left_ankle"));
      const r = angle(m.get("right_hip"), m.get("right_knee"), m.get("right_ankle"));
      const v = l != null && r != null ? (l + r) / 2 : (l ?? r);
      return v != null && v < 115;
    }
    case "star": {
      if (!lw || !rw || !ls || !rs || !la || !ra) return false;
      const width = Math.abs(ls.x - rs.x) || 1;
      return (
        lw.y < ls.y && rw.y < rs.y && Math.abs(la.x - ra.x) > width * 1.15
      );
    }
    default:
      return false;
  }
}

export function randomPoseChallenge() {
  return POSE_CHALLENGES[Math.floor(Math.random() * POSE_CHALLENGES.length)]!;
}
