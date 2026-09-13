import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { METRICS, isInverted, type Exercise, type MetricId } from "@/lib/pose/exercises";
import { Plus } from "lucide-react";

type Props = {
  onCreate: (exercise: Exercise) => void;
  liveValue: number | null;
};

export function CustomExerciseDialog({ onCreate, liveValue }: Props) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [tagline, setTagline] = useState("");
  const [metric, setMetric] = useState<MetricId>("kneeAngle");
  const [down, setDown] = useState(100);
  const [up, setUp] = useState(158);

  const def = useMemo(() => METRICS.find((m) => m.id === metric)!, [metric]);

  const pickMetric = (id: MetricId) => {
    const m = METRICS.find((x) => x.id === id)!;
    setMetric(id);
    if (isInverted(id)) {
      setDown(Math.round(m.min + (m.max - m.min) * 0.35));
      setUp(Math.round(m.min + (m.max - m.min) * 0.85));
    } else {
      setDown(Math.round(m.min + (m.max - m.min) * 0.6));
      setUp(Math.round(m.min + (m.max - m.min) * 0.35));
    }
  };

  const submit = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    onCreate({
      id: `custom-${Date.now()}`,
      name: trimmed,
      tagline: tagline.trim() || `Custom move tracked on ${def.label.toLowerCase()}.`,
      emoji: "✨",
      metric,
      down,
      up,
      points: 12,
      custom: true,
    });
    setName("");
    setTagline("");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="secondary" className="w-full justify-start gap-2">
          <Plus className="size-4" />
          Create custom move
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display">Design your own move</DialogTitle>
          <DialogDescription>
            Name it, pick the body signal to watch, then set the two positions that make one rep.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="ex-name">Move name</Label>
            <Input
              id="ex-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Sumo squat"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ex-tag">Coaching cue (optional)</Label>
            <Input
              id="ex-tag"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              placeholder="Wide stance, knees out, chest proud."
            />
          </div>

          <div className="space-y-2">
            <Label>What should the AI watch?</Label>
            <div className="grid grid-cols-2 gap-2">
              {METRICS.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => pickMetric(m.id)}
                  className={`rounded-lg border p-3 text-left text-sm transition-colors ${
                    metric === m.id
                      ? "border-primary bg-primary/10 text-foreground"
                      : "border-border bg-secondary/40 text-muted-foreground hover:bg-secondary"
                  }`}
                >
                  <span className="block font-medium text-foreground">{m.label}</span>
                  <span className="mt-1 block text-xs leading-snug">{m.hint}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-border bg-secondary/30 p-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Live reading</span>
              <span className="stat-value text-lg neon-text">
                {liveValue == null ? "--" : Math.round(liveValue)}
                {def.unit}
              </span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Stand in front of the camera and hold each position to read the right numbers.
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Action position</Label>
              <span className="stat-value text-sm">
                {down}
                {def.unit}
              </span>
            </div>
            <Slider
              value={[down]}
              min={def.min}
              max={def.max}
              step={1}
              onValueChange={(v) => setDown(v[0] ?? down)}
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Reset position</Label>
              <span className="stat-value text-sm">
                {up}
                {def.unit}
              </span>
            </div>
            <Slider
              value={[up]}
              min={def.min}
              max={def.max}
              step={1}
              onValueChange={(v) => setUp(v[0] ?? up)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button onClick={submit} disabled={!name.trim()}>
            Add to arena
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
