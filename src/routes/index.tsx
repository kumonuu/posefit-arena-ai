import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatTile, RepMeter } from "@/components/arena/Hud";
import { CustomExerciseDialog } from "@/components/arena/CustomExerciseDialog";
import { usePoseEngine } from "@/lib/pose/usePoseEngine";
import { BUILT_IN_EXERCISES, type Exercise } from "@/lib/pose/exercises";
import { Camera, CameraOff, Flame, RotateCcw, Trophy } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "PoseFit Arena — AI Webcam Fitness Game" },
      {
        name: "description",
        content:
          "Train like a pro athlete: PoseFit Arena uses your webcam and real-time AI pose tracking to count squats, jumps, push-ups, lunges and your own custom moves.",
      },
      { property: "og:title", content: "PoseFit Arena — AI Webcam Fitness Game" },
      {
        property: "og:description",
        content:
          "Real-time AI motion tracking turns your camera into a fitness arena. Score reps for squats, jumps, push-ups, lunges and custom moves.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Arena,
});

const STORAGE_KEY = "posefit-custom-exercises";
const COMBO_WINDOW = 4000;

function Arena() {
  const [customExercises, setCustomExercises] = useState<Exercise[]>([]);
  const [exercise, setExercise] = useState<Exercise>(BUILT_IN_EXERCISES[0]!);
  const [score, setScore] = useState(0);
  const [reps, setReps] = useState(0);
  const [best, setBest] = useState(0);
  const [combo, setCombo] = useState(1);
  const [pop, setPop] = useState<{ id: number; points: number } | null>(null);
  const lastRepAt = useRef(0);
  const comboRef = useRef(1);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setCustomExercises(JSON.parse(raw) as Exercise[]);
    } catch {
      /* ignore unreadable storage */
    }
  }, []);

  const persist = (list: Exercise[]) => {
    setCustomExercises(list);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    } catch {
      /* ignore full storage */
    }
  };

  const handleRep = useCallback(() => {
    const now = performance.now();
    const streaking = now - lastRepAt.current < COMBO_WINDOW;
    lastRepAt.current = now;
    const nextCombo = streaking ? Math.min(5, comboRef.current + 1) : 1;
    comboRef.current = nextCombo;
    setCombo(nextCombo);
    setReps((r) => r + 1);
    const gained = exercise.points * nextCombo;
    setScore((s) => {
      const next = s + gained;
      setBest((b) => Math.max(b, next));
      return next;
    });
    setPop({ id: now, points: gained });
  }, [exercise.points]);

  const engine = usePoseEngine({ exercise, onRep: handleRep });

  useEffect(() => {
    const t = setInterval(() => {
      if (performance.now() - lastRepAt.current > COMBO_WINDOW && comboRef.current !== 1) {
        comboRef.current = 1;
        setCombo(1);
      }
    }, 500);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (!pop) return;
    const t = setTimeout(() => setPop(null), 900);
    return () => clearTimeout(t);
  }, [pop]);

  const resetRound = () => {
    setScore(0);
    setReps(0);
    setCombo(1);
    comboRef.current = 1;
  };

  const allExercises = [...BUILT_IN_EXERCISES, ...customExercises];
  const running = engine.status === "running";

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-[0.65rem] uppercase tracking-[0.3em] text-accent">
            Real-time AI motion tracking
          </p>
          <h1 className="mt-1 text-3xl font-bold sm:text-4xl">
            PoseFit <span className="neon-text">Arena</span>
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="gap-1">
            <Trophy className="size-3.5" /> Best {best}
          </Badge>
          <Badge variant="secondary" className="gap-1">
            {running ? `${engine.fps} FPS` : "Camera off"}
          </Badge>
        </div>
      </header>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <section className="space-y-4">
          <div className="arena-panel relative overflow-hidden">
            <div className="relative aspect-video w-full bg-[oklch(0.12_0.02_250)]">
              <video
                ref={engine.videoRef}
                playsInline
                muted
                className="absolute inset-0 size-full -scale-x-100 object-cover"
              />
              <canvas
                ref={engine.canvasRef}
                className="pointer-events-none absolute inset-0 size-full -scale-x-100 object-cover"
              />

              {pop && (
                <div className="pointer-events-none absolute inset-x-0 top-1/3 flex justify-center">
                  <span key={pop.id} className="rep-pop stat-value text-5xl neon-text">
                    +{pop.points}
                  </span>
                </div>
              )}

              <div className="pointer-events-none absolute left-4 top-4 flex items-center gap-2">
                <span className="rounded-full bg-background/70 px-3 py-1 text-xs backdrop-blur">
                  {exercise.emoji} {exercise.name}
                </span>
                {running && !engine.bodyVisible && (
                  <span className="rounded-full bg-destructive/80 px-3 py-1 text-xs">
                    Step back so your whole body is in frame
                  </span>
                )}
              </div>

              {!running && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-background/75 p-6 text-center backdrop-blur-sm">
                  <p className="max-w-sm text-sm text-muted-foreground">
                    {engine.status === "loading"
                      ? "Warming up the AI coach…"
                      : engine.error
                        ? engine.error
                        : "Turn on your camera, stand about 2 metres back, and let the AI coach count your reps."}
                  </p>
                  <Button
                    size="lg"
                    className="pulse-ring gap-2"
                    onClick={() => void engine.start()}
                    disabled={engine.status === "loading"}
                  >
                    <Camera className="size-4" />
                    {engine.status === "loading" ? "Loading…" : "Start training"}
                  </Button>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatTile label="Score" value={score} accent />
            <StatTile label="Reps" value={reps} />
            <StatTile label="Combo" value={`x${combo}`} />
            <StatTile label="Points / rep" value={exercise.points * combo} />
          </div>

          <RepMeter
            exercise={exercise}
            progress={engine.progress}
            phase={engine.phase}
            metricValue={engine.metricValue}
          />

          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" className="gap-2" onClick={resetRound}>
              <RotateCcw className="size-4" /> Reset round
            </Button>
            {running && (
              <Button variant="secondary" className="gap-2" onClick={engine.stop}>
                <CameraOff className="size-4" /> Stop camera
              </Button>
            )}
          </div>
        </section>

        <aside className="space-y-3">
          <div className="arena-panel p-4">
            <h2 className="flex items-center gap-2 text-base font-semibold">
              <Flame className="size-4 text-primary" /> Choose your move
            </h2>
            <div className="mt-3 space-y-2">
              {allExercises.map((ex) => {
                const active = ex.id === exercise.id;
                return (
                  <button
                    key={ex.id}
                    type="button"
                    onClick={() => setExercise(ex)}
                    className={`w-full rounded-xl border p-3 text-left transition-colors ${
                      active
                        ? "border-primary bg-primary/10"
                        : "border-border bg-secondary/30 hover:bg-secondary"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-display text-sm font-semibold">
                        {ex.emoji} {ex.name}
                      </span>
                      <span className="text-xs text-muted-foreground">{ex.points} pts</span>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">{ex.tagline}</p>
                  </button>
                );
              })}
            </div>
            <div className="mt-3">
              <CustomExerciseDialog
                liveValue={engine.metricValue}
                onCreate={(ex) => {
                  persist([...customExercises, ex]);
                  setExercise(ex);
                }}
              />
            </div>
          </div>

          <div className="arena-panel p-4 text-xs leading-relaxed text-muted-foreground">
            <p className="mb-2 font-display text-sm text-foreground">Arena tips</p>
            <p>Good light in front of you, plain background, full body visible.</p>
            <p className="mt-1">Chain reps within 4 seconds to build a combo up to x5.</p>
            <p className="mt-1">Everything runs on your device — no video ever leaves it.</p>
          </div>
        </aside>
      </div>
    </main>
  );
}
