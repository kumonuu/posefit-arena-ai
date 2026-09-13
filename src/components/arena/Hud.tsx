import { Progress } from "@/components/ui/progress";
import type { Exercise } from "@/lib/pose/exercises";

export function StatTile({
  label,
  value,
  accent,
}: {
  label: string;
  value: string | number;
  accent?: boolean;
}) {
  return (
    <div className="arena-panel px-4 py-3">
      <p className="text-[0.65rem] uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
      <p className={`stat-value mt-1 text-2xl ${accent ? "neon-text" : "text-foreground"}`}>
        {value}
      </p>
    </div>
  );
}

export function RepMeter({
  exercise,
  progress,
  phase,
  metricValue,
}: {
  exercise: Exercise;
  progress: number;
  phase: "ready" | "loaded";
  metricValue: number | null;
}) {
  return (
    <div className="arena-panel p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[0.65rem] uppercase tracking-[0.18em] text-muted-foreground">
            Rep meter
          </p>
          <p className="font-display text-lg">
            {phase === "loaded" ? "Now drive back up" : "Go into the move"}
          </p>
        </div>
        <span className="stat-value text-xl text-accent">
          {metricValue == null ? "--" : Math.round(metricValue)}
        </span>
      </div>
      <Progress value={progress * 100} className="mt-3 h-2" />
      <p className="mt-2 text-xs text-muted-foreground">{exercise.tagline}</p>
    </div>
  );
}
