import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import client from "../api/client.js";
import PlantVisual from "../components/PlantVisual.jsx";

const STAGE_LABELS = {
  seed: "Seed",
  sprout: "Sprout",
  small: "Small Plant",
  growing: "Growing Plant",
  mature: "Mature Plant",
  full: "Fully Grown",
};

export default function Dashboard() {
  const navigate = useNavigate();

  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadGarden() {
    try {
      setLoading(true);
      setError("");

      const res = await client.get("/habit/active");

      setHabits(res.data?.habits || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Could not load your garden."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadGarden();
  }, []);

  /* =====================================================
     DELETE PLANT
  ===================================================== */

  async function deletePlant(habit) {
    const confirmed = window.confirm(
      `Remove ${habit.skill} from your garden?\n\nIts plant and practice history will be permanently deleted.`
    );

    if (!confirmed) {
      return;
    }

    try {
      await client.delete(`/habit/${habit.id}`);

      setHabits((current) =>
        current.filter(
          (item) => item.id !== habit.id
        )
      );
    } catch (err) {
      alert(
        err.response?.data?.message ||
          "Could not delete this plant."
      );
    }
  }

  /* =====================================================
     LOADING
  ===================================================== */

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#7fa66a] via-[#547f43] to-[#315d2c] pt-32">

        <div className="flex items-center justify-center">

          <div className="text-center">

            <div className="text-6xl">
              🌱
            </div>

            <p className="mt-4 text-sm text-white/70">
              Growing your garden...
            </p>

          </div>

        </div>

      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#7fa66a] via-[#547f43] to-[#315d2c] px-4 pb-32 pt-64">

      <div className="mx-auto max-w-6xl">

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="text-center">

          <p className="text-xs font-semibold uppercase tracking-[0.4em] text-[#e2e7bd]">
            Your Garden
          </p>

          <h1 className="mt-3 font-serif text-4xl font-semibold text-white sm:text-6xl">
            Your Growing World
          </h1>

          <p className="mx-auto mt-3 max-w-xl text-sm text-[#edf2df]">
            Every skill you plant gets its own place in your garden.
          </p>

        </div>

        {/* =================================================
            ERROR
        ================================================= */}

        {error && (
          <div className="mx-auto mt-6 max-w-xl rounded-2xl border border-red-300/20 bg-red-900/30 p-4 text-center text-sm text-red-100">
            {error}
          </div>
        )}

        {/* =================================================
            EMPTY GARDEN
        ================================================= */}

        {habits.length === 0 && (
          <div className="mx-auto mt-12 max-w-xl rounded-3xl border border-white/20 bg-[#17381e]/75 p-10 text-center shadow-2xl backdrop-blur-md">

            <div className="text-7xl">
              🌱
            </div>

            <h2 className="mt-5 text-2xl font-semibold text-white">
              Your garden is empty.
            </h2>

            <p className="mt-2 text-sm text-[#c9d7c0]">
              Plant your first skill and start growing.
            </p>

            <button
              type="button"
              onClick={() => navigate("/")}
              className="mt-7 rounded-full bg-[#e0cc98] px-8 py-3 font-semibold text-[#253a26] hover:bg-[#f0dda9]"
            >
              🌱 Plant a Skill
            </button>

          </div>
        )}

        {/* =================================================
            PLANTS
        ================================================= */}

        {habits.length > 0 && (
          <div className="mt-12 grid gap-7 sm:grid-cols-2 lg:grid-cols-3">

            {habits.map((habit) => (
              <PlantCard
                key={habit.id}
                habit={habit}
                onOpen={() =>
                  navigate(
                    `/session/${habit.id}`
                  )
                }
                onProgress={() =>
                  navigate(
                    `/progress/${habit.id}`
                  )
                }
                onDelete={() =>
                  deletePlant(habit)
                }
              />
            ))}

            {/* =================================================
                ADD NEW PLANT
            ================================================= */}

            <button
              type="button"
              onClick={() => navigate("/")}
              className="min-h-[430px] rounded-3xl border-2 border-dashed border-white/25 bg-black/10 p-8 text-center text-white/70 transition hover:border-[#e0cc98]/70 hover:bg-white/5"
            >

              <div className="flex h-full flex-col items-center justify-center">

                <div className="flex h-20 w-20 items-center justify-center rounded-full border border-white/20 bg-white/10 text-4xl">
                  +
                </div>

                <h2 className="mt-5 text-xl font-semibold text-white">
                  Plant a New Skill
                </h2>

                <p className="mt-2 max-w-xs text-sm text-[#c3d0bb]">
                  Start another journey and grow a new plant beside your others.
                </p>

              </div>

            </button>

          </div>
        )}

      </div>

    </div>
  );
}

/* =========================================================
   PLANT CARD
========================================================= */

function PlantCard({
  habit,
  onOpen,
  onProgress,
  onDelete,
}) {
  const todayMinutes =
    habit.todayMinutes || 0;

  const dailyGoal =
    Math.max(
      1,
      habit.dailyGoalMinutes || 1
    );

  const todayProgress = Math.min(
    100,
    Math.round(
      (todayMinutes / dailyGoal) * 100
    )
  );

  const totalMinutes =
    habit.totalTimeMinutes || 0;

  const targetMinutes =
    Math.max(
      1,
      habit.targetMinutes ||
        dailyGoal *
          Math.max(
            1,
            habit.durationDays || 1
          )
    );

  const growthPercent = Math.min(
    100,
    Math.round(
      (totalMinutes / targetMinutes) * 100
    )
  );

  const journeyDay = getJourneyDay(
    habit.startDate,
    habit.durationDays
  );

  const stage =
    habit.currentPlantStage || "seed";

  const stageLabel =
    STAGE_LABELS[stage] || "Seed";

  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/20 bg-[#17381e]/80 shadow-2xl backdrop-blur-md">

      {/* DELETE */}

      <button
        type="button"
        onClick={onDelete}
        title="Delete plant"
        className="absolute right-4 top-4 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-black/20 text-sm text-white/60 transition hover:bg-red-500/20 hover:text-red-200"
      >
        🗑️
      </button>

      {/* PLANT */}

      <button
        type="button"
        onClick={onOpen}
        className="w-full text-center"
      >

        <div className="bg-gradient-to-b from-[#7fa66a]/30 to-transparent px-6 pt-8">

          <p className="text-xs uppercase tracking-[0.25em] text-[#b8c8aa]">
            {habit.category}
          </p>

          <h2 className="mt-2 text-2xl font-semibold text-white">
            {habit.skill}
          </h2>

          <PlantVisual
            stage={stage}
            species={habit.selectedSeed}
            size={190}
          />

        </div>

      </button>

      {/* INFORMATION */}

      <div className="border-t border-white/10 p-5">

        {/* JOURNEY + STAGE */}

        <div className="grid grid-cols-2 gap-3">

          <Info
            label="Journey"
            value={`${journeyDay}/${habit.durationDays}`}
          />

          <Info
            label="Growth Stage"
            value={stageLabel}
          />

          <Info
            label="Daily Goal"
            value={`${dailyGoal} min`}
          />

          <Info
            label="Streak"
            value={`🔥 ${habit.streak || 0}`}
          />

        </div>

        {/* TOTAL GROWTH */}

        <div className="mt-5 rounded-2xl bg-black/10 p-4">

          <div className="flex items-center justify-between">

            <div>

              <p className="text-xs uppercase tracking-wider text-[#82947d]">
                Plant Growth
              </p>

              <p className="mt-1 text-lg font-semibold text-[#e8eadc]">
                {growthPercent}% grown
              </p>

            </div>

            <div className="text-right">

              <p className="text-xs text-[#82947d]">
                Practice
              </p>

              <p className="mt-1 text-sm font-semibold text-[#e8eadc]">
                {totalMinutes} / {targetMinutes} min
              </p>

            </div>

          </div>

          <div className="mt-3 h-2 overflow-hidden rounded-full bg-black/30">

            <div
              className="h-full rounded-full bg-gradient-to-r from-[#8fbc72] to-[#e0cc98] transition-all duration-700"
              style={{
                width: `${growthPercent}%`,
              }}
            />

          </div>

        </div>

        {/* TODAY'S PROGRESS */}

        <div className="mt-5">

          <div className="flex justify-between text-xs text-[#aebfa8]">

            <span>
              Today
            </span>

            <span>
              {todayMinutes} /{" "}
              {dailyGoal} min
            </span>

          </div>

          <div className="mt-2 h-2 overflow-hidden rounded-full bg-black/30">

            <div
              className="h-full rounded-full bg-[#e0cc98] transition-all duration-500"
              style={{
                width: `${todayProgress}%`,
              }}
            />

          </div>

        </div>

        {/* BUTTONS */}

        <div className="mt-5 grid grid-cols-2 gap-2">

          <button
            type="button"
            onClick={onOpen}
            className="rounded-xl bg-[#e0cc98] px-3 py-3 text-sm font-semibold text-[#253a26] transition hover:bg-[#f0dda9]"
          >
            Practice
          </button>

          <button
            type="button"
            onClick={onProgress}
            className="rounded-xl border border-white/15 px-3 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            Progress
          </button>

        </div>

      </div>

    </div>
  );
}

/* =========================================================
   INFO
========================================================= */

function Info({ label, value }) {
  return (
    <div className="rounded-xl bg-black/10 p-3">

      <p className="text-[10px] uppercase tracking-wider text-[#82947d]">
        {label}
      </p>

      <p className="mt-1 text-sm font-semibold text-[#e8eadc]">
        {value}
      </p>

    </div>
  );
}

/* =========================================================
   JOURNEY DAY
========================================================= */

function getJourneyDay(
  startDate,
  durationDays
) {
  if (!startDate) {
    return 1;
  }

  const start = new Date(startDate);
  const today = new Date();

  start.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);

  const difference =
    Math.floor(
      (today.getTime() -
        start.getTime()) /
        (1000 * 60 * 60 * 24)
    ) + 1;

  return Math.min(
    Math.max(1, difference),
    durationDays || difference
  );
}