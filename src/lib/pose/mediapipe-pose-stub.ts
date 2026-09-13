// The pose-detection package statically imports the MediaPipe BlazePose runtime,
// which ships a non-ESM bundle. We only use MoveNet, so this stub satisfies the
// import without pulling MediaPipe into the bundle.
export class Pose {
  constructor() {
    throw new Error("MediaPipe BlazePose is not bundled in this app. Use MoveNet.");
  }
}
export const POSE_CONNECTIONS: unknown[] = [];
export default { Pose, POSE_CONNECTIONS };
