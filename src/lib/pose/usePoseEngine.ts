import { useCallback, useEffect, useRef, useState } from "react";
import {
  computeMetric,
  isInverted,
  stepRep,
  type Exercise,
  type Keypoint,
  type RepState,
} from "./exercises";
import { scoreRep } from "@/lib/game/form";
import type { RepDetail } from "@/lib/game/types";

export type EngineStatus = "idle" | "loading" | "running" | "error";

const SKELETON: [string, string][] = [
  ["left_shoulder", "right_shoulder"],
  ["left_shoulder", "left_elbow"],
  ["left_elbow", "left_wrist"],
  ["right_shoulder", "right_elbow"],
  ["right_elbow", "right_wrist"],
  ["left_shoulder", "left_hip"],
  ["right_shoulder", "right_hip"],
  ["left_hip", "right_hip"],
  ["left_hip", "left_knee"],
  ["left_knee", "left_ankle"],
  ["right_hip", "right_knee"],
  ["right_knee", "right_ankle"],
];

type Options = {
  exercise: Exercise;
  onRep: (detail: RepDetail) => void;
  accent?: string;
};

export function usePoseEngine({ exercise, onRep, accent }: Options) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const detectorRef = useRef<{ estimatePoses: (v: HTMLVideoElement) => Promise<unknown> } | null>(
    null,
  );
  const rafRef = useRef<number | null>(null);
  const repStateRef = useRef<RepState>({ phase: "ready", progress: 0 });
  const exerciseRef = useRef(exercise);
  const onRepRef = useRef(onRep);
  const smoothRef = useRef<number | null>(null);
  const fpsRef = useRef({ last: 0, frames: 0 });
  const keypointsRef = useRef<Keypoint[]>([]);
  const repRef = useRef<{ startedAt: number; peak: number | null; peakKps: Keypoint[] }>({
    startedAt: 0,
    peak: null,
    peakKps: [],
  });
  const accentRef = useRef(accent);

  const [status, setStatus] = useState<EngineStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState<RepState["phase"]>("ready");
  const [metricValue, setMetricValue] = useState<number | null>(null);
  const [bodyVisible, setBodyVisible] = useState(false);
  const [fps, setFps] = useState(0);

  useEffect(() => {
    exerciseRef.current = exercise;
    repStateRef.current = { phase: "ready", progress: 0 };
    smoothRef.current = null;
  }, [exercise]);

  useEffect(() => {
    onRepRef.current = onRep;
  }, [onRep]);

  useEffect(() => {
    accentRef.current = accent;
  }, [accent]);

  const getKeypoints = useCallback(() => keypointsRef.current, []);

  const draw = useCallback((keypoints: Keypoint[]) => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video) return;
    const w = video.videoWidth || 640;
    const h = video.videoHeight || 480;
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, w, h);

    const visible = new Map<string, Keypoint>();
    for (const k of keypoints) if (k.name && (k.score ?? 0) > 0.3) visible.set(k.name, k);

    const bone = accentRef.current ?? "rgba(190, 255, 60, 0.9)";
    ctx.lineWidth = Math.max(3, w / 180);
    ctx.lineCap = "round";
    ctx.strokeStyle = bone;
    ctx.shadowColor = bone;
    ctx.shadowBlur = 14;
    for (const [a, b] of SKELETON) {
      const ka = visible.get(a);
      const kb = visible.get(b);
      if (!ka || !kb) continue;
      ctx.beginPath();
      ctx.moveTo(ka.x, ka.y);
      ctx.lineTo(kb.x, kb.y);
      ctx.stroke();
    }
    ctx.fillStyle = "rgba(80, 240, 255, 0.95)";
    ctx.shadowColor = "rgba(80, 240, 255, 0.9)";
    for (const k of visible.values()) {
      ctx.beginPath();
      ctx.arc(k.x, k.y, Math.max(3, w / 160), 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.shadowBlur = 0;
  }, []);

  const loop = useCallback(async () => {
    const detector = detectorRef.current;
    const video = videoRef.current;
    if (!detector || !video || video.readyState < 2) {
      rafRef.current = requestAnimationFrame(() => void loop());
      return;
    }
    try {
      const poses = (await detector.estimatePoses(video)) as { keypoints: Keypoint[] }[];
      const kps = poses?.[0]?.keypoints ?? [];
      keypointsRef.current = kps;
      draw(kps);

      const ex = exerciseRef.current;
      const sample = computeMetric(ex.metric, kps, video.videoHeight || 480);
      setBodyVisible(sample.visible);
      if (sample.value != null) {
        const smoothed =
          smoothRef.current == null ? sample.value : smoothRef.current * 0.6 + sample.value * 0.4;
        smoothRef.current = smoothed;
        setMetricValue(smoothed);

        const wasReady = repStateRef.current.phase === "ready";
        const next = stepRep(ex, smoothed, repStateRef.current);
        repStateRef.current = next.state;
        setPhase(next.state.phase);
        setProgress(next.state.progress);

        if (wasReady && next.state.phase === "loaded") {
          repRef.current = { startedAt: performance.now(), peak: smoothed, peakKps: kps };
        } else if (next.state.phase === "loaded") {
          const deeper = isInverted(ex.metric)
            ? smoothed < (repRef.current.peak ?? Infinity)
            : smoothed > (repRef.current.peak ?? -Infinity);
          if (deeper) {
            repRef.current.peak = smoothed;
            repRef.current.peakKps = kps;
          }
        }

        if (next.rep) {
          const info = repRef.current;
          const durationMs = info.startedAt ? performance.now() - info.startedAt : 1200;
          const form = scoreRep({
            exercise: ex,
            peak: info.peak ?? ex.down,
            durationMs,
            peakKeypoints: info.peakKps.length ? info.peakKps : kps,
          });
          onRepRef.current({
            at: Date.now(),
            durationMs,
            depth: info.peak ?? ex.down,
            formScore: form.score,
            violations: form.violations,
          });
          repRef.current = { startedAt: 0, peak: null, peakKps: [] };
        }
      }

      const now = performance.now();
      const f = fpsRef.current;
      f.frames += 1;
      if (now - f.last > 1000) {
        setFps(Math.round((f.frames * 1000) / (now - f.last)));
        f.last = now;
        f.frames = 0;
      }
    } catch {
      /* keep the loop alive on a transient inference hiccup */
    }
    rafRef.current = requestAnimationFrame(() => void loop());
  }, [draw]);

  const start = useCallback(async () => {
    if (status === "loading" || status === "running") return;
    setStatus("loading");
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 960 }, height: { ideal: 720 }, facingMode: "user" },
        audio: false,
      });
      const video = videoRef.current;
      if (!video) throw new Error("Camera view not ready");
      video.srcObject = stream;
      await video.play();

      const tf = await import("@tensorflow/tfjs-core");
      await import("@tensorflow/tfjs-backend-webgl");
      const poseDetection = await import("@tensorflow-models/pose-detection");
      await tf.setBackend("webgl");
      await tf.ready();

      detectorRef.current = (await poseDetection.createDetector(
        poseDetection.SupportedModels.MoveNet,
        { modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING },
      )) as unknown as { estimatePoses: (v: HTMLVideoElement) => Promise<unknown> };

      setStatus("running");
      fpsRef.current = { last: performance.now(), frames: 0 };
      rafRef.current = requestAnimationFrame(() => void loop());
    } catch (e) {
      const msg =
        e instanceof Error
          ? e.name === "NotAllowedError"
            ? "Camera access was blocked. Allow the camera and try again."
            : e.message
          : "Could not start the camera.";
      setError(msg);
      setStatus("error");
    }
  }, [loop, status]);

  const stop = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    const video = videoRef.current;
    const stream = video?.srcObject as MediaStream | null;
    stream?.getTracks().forEach((t) => t.stop());
    if (video) video.srcObject = null;
    setStatus("idle");
    setFps(0);
  }, []);

  useEffect(() => () => stop(), [stop]);

  return {
    videoRef,
    canvasRef,
    start,
    stop,
    getKeypoints,
    status,
    error,
    progress,
    phase,
    metricValue,
    bodyVisible,
    fps,
  };
}
