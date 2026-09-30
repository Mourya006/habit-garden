import PlantVisual from "./PlantVisual.jsx";

const STAGE_LABELS = {
  seed: "Seed",
  sprout: "Sprout",
  small: "Small Plant",
  growing: "Growing Plant",
  mature: "Mature Plant",
  full: "Fully Grown",
};

export default function GardenScene({ habit }) {
  if (!habit) return null;

  return (
    <div className="relative glass-card p-8 flex flex-col items-center overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-garden-leaf/10 via-transparent to-transparent" />
      <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-garden-gold/10 blur-3xl" />
      <div className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full bg-garden-leaf/10 blur-3xl" />

      <p className="text-sm uppercase tracking-[0.2em] text-white/50">{habit.skill}</p>
      <PlantVisual stage={habit.currentPlantStage} species={habit.selectedSeed} size={220} />

      <p className="mt-2 font-display text-2xl">{STAGE_LABELS[habit.currentPlantStage] || "Seed"}</p>

      <div className="w-full max-w-xs mt-4">
        <div className="flex justify-between text-xs text-white/50 mb-1">
          <span>Growth to next stage</span>
          <span>{habit.stageProgressPercent}%</span>
        </div>
        <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-garden-leaf to-garden-gold transition-all duration-700"
            style={{ width: `${habit.stageProgressPercent}%` }}
          />
        </div>
      </div>
    </div>
  );
}
