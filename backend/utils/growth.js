// Growth stages are driven by total accumulated minutes on the habit.
// Thresholds are intentionally simple for the MVP and easy to tune later.
export const STAGES = ["seed", "sprout", "small", "growing", "mature", "full"];

const THRESHOLDS = [0, 60, 180, 420, 900, 1800]; // minutes required to REACH each stage

export function stageForMinutes(totalMinutes) {
  let stageIndex = 0;
  for (let i = THRESHOLDS.length - 1; i >= 0; i--) {
    if (totalMinutes >= THRESHOLDS[i]) {
      stageIndex = i;
      break;
    }
  }
  return STAGES[stageIndex];
}

export function progressWithinStage(totalMinutes) {
  const stage = stageForMinutes(totalMinutes);
  const idx = STAGES.indexOf(stage);
  const lower = THRESHOLDS[idx];
  const upper = THRESHOLDS[idx + 1] ?? THRESHOLDS[idx];
  if (idx === STAGES.length - 1) return 100;
  const pct = ((totalMinutes - lower) / (upper - lower)) * 100;
  return Math.max(0, Math.min(100, Math.round(pct)));
}
