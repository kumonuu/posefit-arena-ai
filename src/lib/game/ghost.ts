import type { Ghost } from "./types";

/** How many reps the ghost has completed by a given point in the session. */
export function ghostRepsAt(ghost: Ghost, elapsedMs: number) {
  let n = 0;
  for (const t of ghost.timeline) {
    if (t <= elapsedMs) n++;
    else break;
  }
  return n;
}

export function bestGhostFor(ghosts: Ghost[], exerciseId: string) {
  return (
    ghosts
      .filter((g) => g.exerciseId === exerciseId)
      .sort((a, b) => b.reps - a.reps)[0] ?? null
  );
}
