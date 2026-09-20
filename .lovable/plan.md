# PoseFit Arena — Premium Game Upgrade

Turn the current single-screen rep counter into a full game loop:
Warm-up → Choose Arena → Exercise → Live AI detection → Score/Calories/XP → Combos → Challenge complete → Rewards → Progress.

Everything runs on the device; the camera feed never leaves it. All progress saves locally on the player's browser.

## Screens

1. **Home / Arena Select** — player level (Rookie → Athlete → Champion → Elite), XP bar, coins, daily challenges, campaign map entry.
2. **Warm-up** — 20-second guided mobility check that confirms the camera sees the whole body before play starts.
3. **Session (the arena)** — camera view with skeleton overlay, live score, combo meter, calorie estimate, form accuracy ring, boss health bar or ghost bar depending on mode, power-up slots, coach captions.
4. **Results** — reps, estimated calories, duration, form accuracy, XP earned, coins, records beaten, rewards unlocked.
5. **Dashboard** — history, weekly progress chart, personal records, badges, totals.
6. **Workout Builder** — combine exercises into a named routine with per-exercise targets (reps or time) and save it.

## Game systems

- **Calorie estimate** — MET value per exercise, scaled by body weight (a profile setting), active duration, rep tempo and movement intensity. Always shown as "est." with a short note that it is an approximation.
- **AI Form Coach** — per-exercise rules from joint angles (depth, back angle, knee tracking, elbow flare, hip sag, symmetry). Fires short captions ("Go deeper", "Keep hips level") with cooldowns so it is not noisy.
- **Form Accuracy Score** — each rep scored 0–100 from depth achieved, tempo, and rule violations; session score is the running average, shown next to the rep score.
- **Combos & streaks** — consecutive good-form reps raise a multiplier (x1–x5); a bad-form rep or a pause breaks it unless a Combo Shield is active. Daily streak counter across days.
- **XP & levels** — XP from reps, form quality, challenges and bosses. Four tiers with sub-levels; level-ups unlock power-ups and arenas.
- **Power-ups** — Score Multiplier, Calorie Boost, Combo Shield, Time Freeze. Bought with coins, equipped before a session (limited slots), consumed on use.
- **Boss battles** — boss has health, an attack timer and a weakness exercise; each valid rep deals damage scaled by form and combo. Win/lose screen with rewards.
- **Daily challenges** — three per day (rep target, timed exercise, calorie target), rerolled at local midnight, paying XP, coins and badges.
- **Ghost Mode** — replays a stored rep-timeline from a past session of the same exercise as a racing progress bar.
- **Adaptive difficulty** — tracks recent speed, consistency and form to nudge rep targets, boss health and angle thresholds up or down between sessions.
- **Missions** — multi-part objectives combining exercise and accuracy ("30 squats at 80%+ form").
- **Reaction challenges** — a prompt appears and the player must hit a pose (hands up, T-pose, squat hold) before a timer runs out.
- **Voice trainer** — browser speech synthesis for countdowns, milestones and coach lines, with a mute toggle.
- **Campaign** — themed arenas unlocked in order, each with its own exercise set, challenges, an AI opponent or boss, achievements and visual theme.

## Technical notes

- New modules under `src/lib/game/`: `calories.ts`, `form.ts` (rule engine per exercise), `progression.ts` (XP/levels/coins), `powerups.ts`, `challenges.ts`, `bosses.ts`, `campaign.ts`, `ghost.ts`, `adaptive.ts`, `missions.ts`, `storage.ts` (versioned localStorage schema + migration), `voice.ts` (SpeechSynthesis wrapper).
- `usePoseEngine` extended to emit per-rep detail (depth, duration, form score, violations) instead of a bare `onRep`, plus a pose-hold matcher for reaction challenges. Rep detection and metric math stay as they are.
- A `useGameSession` hook owns the session state machine (warmup → active → paused → results) and feeds the HUD.
- Routes: `/` (home), `/play` (session), `/dashboard`, `/builder`, `/campaign`, each with its own page metadata.
- Reuse existing shadcn components and the current neon-lime/cyan arena theme; add per-arena accent theming via CSS variables.
- No backend: all profile, history, ghost and unlock data in localStorage under one versioned key.

## Build order

1. Storage schema, profile, progression, calories, voice.
2. Engine upgrade: per-rep detail + form rule engine + accuracy score.
3. Session state machine, warm-up, results screen, HUD rework.
4. Combos, power-ups, adaptive difficulty.
5. Bosses, ghost mode, reaction challenges.
6. Daily challenges, missions, campaign map and arenas.
7. Dashboard and workout builder.
