let enabled = true;
let lastAt = 0;

export function setVoiceEnabled(on: boolean) {
  enabled = on;
  if (!on && typeof window !== "undefined") window.speechSynthesis?.cancel();
}

/** Speaks a short coaching line. Throttled so the trainer never talks over itself. */
export function say(text: string, opts: { force?: boolean } = {}) {
  if (!enabled || typeof window === "undefined" || !("speechSynthesis" in window)) return;
  const now = Date.now();
  if (!opts.force && now - lastAt < 2600) return;
  lastAt = now;
  try {
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 1.05;
    u.pitch = 1;
    u.volume = 0.9;
    if (opts.force) window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
  } catch {
    /* speech unavailable on this device */
  }
}

export const HYPE = [
  "Nice work, keep that rhythm!",
  "That's it — strong and controlled.",
  "You're flying, hold the pace!",
  "Beautiful reps, stay tall.",
  "Dig in, you've got more in the tank.",
];

export function hype() {
  return HYPE[Math.floor(Math.random() * HYPE.length)]!;
}
