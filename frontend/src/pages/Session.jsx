import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

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

function formatTime(totalSeconds) {
  const minutes = Math.floor(
    totalSeconds / 60
  )
    .toString()
    .padStart(2, "0");

  const seconds = Math.floor(
    totalSeconds % 60
  )
    .toString()
    .padStart(2, "0");

  return `${minutes}:${seconds}`;
}

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

export default function SessionPage() {
  const { habitId } = useParams();

  const navigate = useNavigate();

  const [habit, setHabit] = useState(null);
  const [secondsElapsed, setSecondsElapsed] =
    useState(0);
  const [running, setRunning] = useState(false);
  const [finished, setFinished] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedSession, setSavedSession] =
    useState(null);
  const [error, setError] = useState("");

  const startedAtRef = useRef(null);
  const accumulatedRef = useRef(0);

  /* =====================================================
     LOAD PLANT
  ===================================================== */

  useEffect(() => {
    async function loadHabit() {
      try {
        const res = await client.get(
          `/habit/${habitId}`
        );

        setHabit(res.data.habit);
      } catch (err) {
        setError(
          err.response?.data?.message ||
            "Could not load this plant."
        );
      }
    }

    loadHabit();
  }, [habitId]);

  /* =====================================================
     TIMER
  ===================================================== */

  useEffect(() => {
    if (!running) {
      return undefined;
    }

    startedAtRef.current = Date.now();

    const interval = window.setInterval(() => {
      const liveSeconds =
        accumulatedRef.current +
        Math.floor(
          (Date.now() -
            startedAtRef.current) /
            1000
        );

      setSecondsElapsed(liveSeconds);
    }, 250);

    return () => {
      window.clearInterval(interval);
    };
  }, [running]);

  /* =====================================================
     PAUSE
  ===================================================== */

  function pause() {
    if (!running) {
      return;
    }

    accumulatedRef.current +=
      Math.floor(
        (Date.now() -
          startedAtRef.current) /
          1000
      );

    setSecondsElapsed(
      accumulatedRef.current
    );

    setRunning(false);
  }

  /* =====================================================
     START / RESUME
  ===================================================== */

  function startOrResume() {
    setError("");
    setRunning(true);
  }

  /* =====================================================
     FINISH
  ===================================================== */

  async function finishSession() {
    pause();

    const seconds =
      accumulatedRef.current;

    if (seconds < 30) {
      setError(
        "Work for at least 30 seconds before finishing your session."
      );
      return;
    }

    const minutes = Math.max(
      1,
      Math.round(seconds / 60)
    );

    setSaving(true);
    setError("");

    try {
      const res =
        await client.post(
          "/session/complete",
          {
            habitId,
            durationMinutes:
              minutes,
          }
        );

      setSavedSession({
        durationMinutes: minutes,
        currentPlantStage:
          res.data.habit
            .currentPlantStage,
        totalTimeMinutes:
          res.data.habit
            .totalTimeMinutes,
        targetMinutes:
          res.data.habit
            .targetMinutes,
        progressPercent:
          res.data.habit
            .progressPercent,
        streak:
          res.data.habit.streak,
      });

      setFinished(true);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Could not save your session."
      );
    } finally {
      setSaving(false);
    }
  }

  /* =====================================================
     LOADING
  ===================================================== */

  if (!habit && !error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#7fa66a] via-[#547f43] to-[#315d2c]">
        <div className="text-center">
          <div className="text-6xl">
            🌱
          </div>

          <p className="mt-4 text-sm text-white/70">
            Preparing your garden session...
          </p>
        </div>
      </div>
    );
  }

  /* =====================================================
     ERROR
  ===================================================== */

  if (!habit) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#7fa66a] via-[#547f43] to-[#315d2c] px-4">
        <div className="rounded-3xl border border-white/20 bg-[#17381e]/80 p-8 text-center shadow-2xl backdrop-blur-md">

          <p className="text-red-200">
            {error}
          </p>

          <button
            type="button"
            onClick={() =>
              navigate("/garden")
            }
            className="mt-5 rounded-full bg-[#e0cc98] px-7 py-3 font-semibold text-[#253a26] hover:bg-[#f0dda9]"
          >
            Back to Garden
          </button>

        </div>
      </div>
    );
  }

  /* =====================================================
     COMPLETE SCREEN
  ===================================================== */

  if (finished) {
    const completedStage =
      savedSession?.currentPlantStage ||
      habit.currentPlantStage;

    const completedGrowth =
      savedSession?.progressPercent ??
      habit.progressPercent ??
      0;

    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#7fa66a] via-[#547f43] to-[#315d2c] px-4 pb-32 pt-28">

        <div className="w-full max-w-md rounded-3xl border border-white/20 bg-[#17381e]/85 p-8 text-center shadow-2xl backdrop-blur-md">

          <div className="text-6xl">
            🌱✨
          </div>

          <h1 className="mt-4 font-display text-3xl text-white">
            Session complete!
          </h1>

          <p className="mt-3 text-sm text-[#d4dfcf]">
            You spent{" "}
            <span className="font-semibold text-white">
              {savedSession?.durationMinutes} minutes
            </span>{" "}
            working on{" "}
            <span className="text-white">
              {habit.skill}
            </span>.
          </p>

          <div className="mt-5 flex justify-center">

            <PlantVisual
              stage={completedStage}
              species={habit.selectedSeed}
              size={180}
            />

          </div>

          <p className="text-xs uppercase tracking-[0.2em] text-[#aebfa8]">
            Plant Stage
          </p>

          <p className="mt-1 text-lg font-semibold text-[#e0cc98]">
            {STAGE_LABELS[completedStage] ||
              "Seed"}
          </p>

          <div className="mt-5 grid grid-cols-2 gap-3">

            <div className="rounded-2xl bg-black/15 p-4">

              <p className="text-xs text-[#aebfa8]">
                Total Time
              </p>

              <p className="mt-1 text-lg font-semibold text-white">
                {savedSession?.totalTimeMinutes} min
              </p>

            </div>

            <div className="rounded-2xl bg-black/15 p-4">

              <p className="text-xs text-[#aebfa8]">
                Growth
              </p>

              <p className="mt-1 text-lg font-semibold text-[#b8e08c]">
                {completedGrowth}%
              </p>

            </div>

          </div>

          <div className="mt-3 rounded-2xl bg-black/15 p-4">

            <div className="flex items-center justify-between">

              <span className="text-xs text-[#aebfa8]">
                Streak
              </span>

              <span className="font-semibold text-white">
                🔥 {savedSession?.streak}
              </span>

            </div>

          </div>

          <button
            type="button"
            onClick={() =>
              navigate("/garden")
            }
            className="mt-6 w-full rounded-full bg-[#e0cc98] px-8 py-3 font-semibold text-[#253a26] hover:bg-[#f0dda9]"
          >
            Return to Garden
          </button>

          <button
            type="button"
            onClick={() =>
              navigate(
                `/progress/${habit.id}`
              )
            }
            className="mt-3 w-full rounded-full border border-white/20 px-8 py-3 text-white/80 hover:bg-white/10"
          >
            View Progress
          </button>

        </div>

      </div>
    );
  }

  /* =====================================================
     SESSION DATA
  ===================================================== */

  const goalSeconds =
    habit.dailyGoalMinutes * 60;

  const progressPercent =
    goalSeconds > 0
      ? Math.min(
          100,
          Math.round(
            (secondsElapsed /
              goalSeconds) *
              100
          )
        )
      : 0;

  const journeyDay =
    getJourneyDay(
      habit.startDate,
      habit.durationDays
    );

  const totalMinutes =
    habit.totalTimeMinutes || 0;

  const targetMinutes =
    Math.max(
      1,
      habit.targetMinutes ||
        habit.dailyGoalMinutes *
          Math.max(
            1,
            habit.durationDays || 1
          )
    );

  const growthPercent = Math.min(
    100,
    Math.round(
      (totalMinutes /
        targetMinutes) *
        100
    )
  );

  const stage =
    habit.currentPlantStage ||
    "seed";

  const stageLabel =
    STAGE_LABELS[stage] ||
    "Seed";

  /* =====================================================
     SESSION
  ===================================================== */

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-[#7fa66a] via-[#547f43] to-[#315d2c] px-4 pb-32 pt-28">

      {/* BACKGROUND GARDEN DETAILS */}

      <div className="pointer-events-none absolute inset-0 overflow-hidden">

        <div className="absolute -left-20 top-1/4 h-64 w-64 rounded-full bg-[#a8c68c]/10 blur-3xl" />

        <div className="absolute -right-20 bottom-1/4 h-72 w-72 rounded-full bg-[#e0cc98]/10 blur-3xl" />

        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#234b27]/40 to-transparent" />

      </div>

      <div className="relative z-10 mx-auto flex min-h-[calc(100vh-9rem)] w-full max-w-xl flex-col items-center justify-center text-center">

        {/* HEADER */}

        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#e2e7bd]">
          Today's Practice
        </p>

        <h1 className="mt-2 font-serif text-4xl font-semibold text-white">
          {habit.skill}
        </h1>

        {/* JOURNEY / STAGE */}

        <div className="mt-5 flex flex-wrap justify-center gap-2">

          <div className="rounded-full border border-white/20 bg-[#17381e]/45 px-4 py-2 backdrop-blur-md">

            <span className="text-xs text-[#c9d7c0]">
              Journey
            </span>

            <span className="ml-2 text-sm font-semibold text-[#e0cc98]">
              Day {journeyDay}/{habit.durationDays}
            </span>

          </div>

          <div className="rounded-full border border-white/20 bg-[#17381e]/45 px-4 py-2 backdrop-blur-md">

            <span className="text-xs text-[#c9d7c0]">
              Stage
            </span>

            <span className="ml-2 text-sm font-semibold text-[#b8e08c]">
              {stageLabel}
            </span>

          </div>

        </div>

        {/* PLANT */}

        <div className="mt-3 flex justify-center">

          <PlantVisual
            stage={stage}
            species={habit.selectedSeed}
            size={190}
          />

        </div>

        {/* TIMER CARD */}

        <div className="rounded-3xl border border-white/20 bg-[#17381e]/45 px-8 py-5 shadow-2xl backdrop-blur-md">

          <div className="font-display text-6xl tabular-nums text-white">
            {formatTime(
              secondsElapsed
            )}
          </div>

          <p className="mt-2 text-sm text-[#c9d7c0]">
            Daily goal:{" "}
            <span className="font-semibold text-white">
              {habit.dailyGoalMinutes}
              {" "}minutes
            </span>
          </p>

        </div>

        {/* TODAY PROGRESS */}

        <div className="mt-5 w-full max-w-sm rounded-2xl border border-white/15 bg-[#17381e]/35 p-4 backdrop-blur-md">

          <div className="flex justify-between text-xs text-[#d0ddca]">

            <span>
              Today's goal
            </span>

            <span>
              {progressPercent}%
            </span>

          </div>

          <div className="mt-2 h-2 overflow-hidden rounded-full bg-black/25">

            <div
              className="h-full rounded-full bg-gradient-to-r from-[#8fbc72] to-[#e0cc98] transition-all"
              style={{
                width: `${progressPercent}%`,
              }}
            />

          </div>

          <p className="mt-2 text-xs text-[#b8c8aa]">
            {Math.floor(
              secondsElapsed / 60
            )} / {habit.dailyGoalMinutes} min
          </p>

        </div>

        {/* OVERALL GROWTH */}

        <div className="mt-3 w-full max-w-sm rounded-2xl border border-white/15 bg-[#17381e]/35 p-4 backdrop-blur-md">

          <div className="flex items-center justify-between">

            <span className="text-xs font-semibold uppercase tracking-wider text-[#c9d7c0]">
              Plant Growth
            </span>

            <span className="text-sm font-semibold text-[#b8e08c]">
              {growthPercent}%
            </span>

          </div>

          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-black/25">

            <div
              className="h-full rounded-full bg-gradient-to-r from-[#8fbc72] to-[#e0cc98]"
              style={{
                width: `${growthPercent}%`,
              }}
            />

          </div>

          <p className="mt-2 text-xs text-[#b8c8aa]">
            {totalMinutes} / {targetMinutes} minutes practiced
          </p>

        </div>

        {/* ERROR */}

        {error && (
          <p className="mt-5 rounded-xl bg-red-950/30 px-4 py-2 text-sm text-red-100">
            {error}
          </p>
        )}

        {/* CONTROLS */}

        <div className="mt-6 flex justify-center gap-3">

          {!running ? (
            <button
              type="button"
              onClick={
                startOrResume
              }
              className="rounded-full bg-[#e0cc98] px-8 py-3 font-semibold text-[#253a26] shadow-lg transition hover:bg-[#f0dda9] hover:scale-[1.02]"
            >
              {secondsElapsed === 0
                ? "Start Session"
                : "Resume"}
            </button>
          ) : (
            <button
              type="button"
              onClick={pause}
              className="rounded-full border border-white/25 bg-[#17381e]/50 px-8 py-3 font-semibold text-white backdrop-blur-md transition hover:bg-white/10"
            >
              Pause
            </button>
          )}

          <button
            type="button"
            onClick={
              finishSession
            }
            disabled={
              secondsElapsed < 30 ||
              saving
            }
            className="rounded-full border border-white/20 bg-[#17381e]/40 px-8 py-3 font-semibold text-white/80 backdrop-blur-md transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {saving
              ? "Saving..."
              : "Finish"}
          </button>

        </div>

      </div>

    </div>
  );
}