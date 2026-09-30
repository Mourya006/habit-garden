import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import client from "../api/client.js";

import {
  StatCard,
  WeekBars,
} from "../components/ProgressStats.jsx";

export default function Progress() {
  const { habitId } = useParams();

  const navigate = useNavigate();

  const [habit, setHabit] =
    useState(null);

  const [data, setData] =
    useState(null);

  const [error, setError] =
    useState("");

  useEffect(() => {
    async function load() {
      try {
        let selectedHabitId =
          habitId;

        /*
         * If Progress was opened from the
         * floating dashboard, use the first plant.
         */

        if (!selectedHabitId) {
          const habitsRes =
            await client.get(
              "/habit/active"
            );

          const habits =
            habitsRes.data?.habits ||
            [];

          if (!habits.length) {
            setError(
              "Your garden is empty."
            );
            return;
          }

          selectedHabitId =
            habits[0].id;
        }

        const habitRes =
          await client.get(
            `/habit/${selectedHabitId}`
          );

        const selectedHabit =
          habitRes.data.habit;

        setHabit(
          selectedHabit
        );

        const progressRes =
          await client.get(
            `/session/progress/${selectedHabitId}`
          );

        setData(
          progressRes.data
        );

      } catch (err) {
        setError(
          err.response?.data?.message ||
            "Could not load your progress."
        );
      }
    }

    load();
  }, [habitId]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#102719] px-4 pb-32">

        <div className="glass-card max-w-md p-8 text-center">

          <p className="text-rose-300">
            {error}
          </p>

          <button
            type="button"
            onClick={() =>
              navigate("/garden")
            }
            className="mt-5 rounded-full bg-garden-leaf px-7 py-3 font-semibold text-garden-bg"
          >
            Back to Garden
          </button>

        </div>

      </div>
    );
  }

  if (!habit || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#102719]">

        <div className="w-10 h-10 rounded-full border-2 border-garden-leaf border-t-transparent animate-spin" />

      </div>
    );
  }

  /*
   * Calculate the current journey day.
   *
   * Example:
   * 5 days elapsed in a 30 day journey
   * → Day 6 / 30
   *
   * The starting day is Day 1.
   */

  const getJourneyDay = () => {
    if (!habit.startDate) {
      return 1;
    }

    const start = new Date(habit.startDate);
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
      habit.durationDays || difference
    );
  };

  const journeyDay =
    getJourneyDay();

  return (
    <div className="min-h-screen bg-[#102719] px-4 pt-32 pb-32">

      <div className="mx-auto max-w-4xl">

        {/* HEADER */}

        <div className="text-center">

          <p className="text-xs uppercase tracking-[0.3em] text-white/40">
            Plant Progress
          </p>

          <h1 className="mt-2 font-display text-4xl">
            {habit.skill}
          </h1>

          <p className="mt-2 text-sm text-white/40">
            {habit.dailyGoalMinutes} minutes/day
            {" • "}
            {habit.durationDays} days
          </p>

        </div>

        {/* JOURNEY */}

        <div className="glass-card mt-6 p-6">

          <div className="flex items-center justify-between">

            <div>

              <p className="text-xs uppercase tracking-[0.2em] text-white/40">
                Your Journey
              </p>

              <p className="mt-1 font-display text-3xl text-garden-gold">
                Day {journeyDay} / {habit.durationDays}
              </p>

            </div>

            <div className="text-right">

              <p className="text-xs text-white/40">
                Growth
              </p>

              <p className="mt-1 text-2xl font-semibold text-garden-leaf">
                {habit.progressPercent}%
              </p>

            </div>

          </div>

          <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/10">

            <div
              className="h-full rounded-full bg-gradient-to-r from-garden-leaf to-garden-gold transition-all duration-500"
              style={{
                width: `${Math.min(
                  100,
                  ((journeyDay /
                    habit.durationDays) *
                    100)
                )}%`,
              }}
            />

          </div>

        </div>

        {/* STATS */}

        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">

          <StatCard
            label="Today"
            value={`${data.todayMinutes}m`}
            sublabel={`Goal ${data.dailyGoalMinutes}m`}
          />

          <StatCard
            label="This week"
            value={`${data.weekMinutes}m`}
          />

          <StatCard
            label="Total time"
            value={`${data.totalTimeMinutes}m`}
          />

          <StatCard
            label="Streak"
            value={`${data.streak} 🔥`}
            sublabel={`Best ${data.longestStreak}`}
          />

        </div>

        {/* WEEKLY ACTIVITY */}

        <div className="mt-6">

          <WeekBars
            dailyBuckets={
              data.dailyBuckets
            }
            goalMinutes={
              data.dailyGoalMinutes
            }
          />

        </div>

        {/* PLANT GROWTH */}

        <div className="glass-card mt-6 p-6">

          <div className="flex items-center justify-between">

            <span className="text-sm text-white/60">
              Plant Growth
            </span>

            <span className="text-sm text-garden-leaf">
              {habit.stageProgressPercent}%
            </span>

          </div>

          <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">

            <div
              className="h-full rounded-full bg-gradient-to-r from-garden-leaf to-garden-gold"
              style={{
                width: `${habit.stageProgressPercent}%`,
              }}
            />

          </div>

          <div className="mt-3 flex items-center justify-between text-xs text-white/40">

            <span>
              Stage: {habit.currentPlantStage}
            </span>

            <span>
              {data.totalTimeMinutes} /{" "}
              {data.targetMinutes} minutes
            </span>

          </div>

        </div>

        {/* ACTIONS */}

        <div className="mt-6 flex gap-3">

          <button
            type="button"
            onClick={() =>
              navigate(
                `/session/${habit.id}`
              )
            }
            className="rounded-full bg-garden-leaf px-8 py-3 font-semibold text-garden-bg hover:bg-garden-gold"
          >
            Start Today's Session
          </button>

          <button
            type="button"
            onClick={() =>
              navigate("/garden")
            }
            className="rounded-full border border-white/15 px-8 py-3 text-white/70 hover:bg-white/10"
          >
            Garden
          </button>

        </div>

      </div>

    </div>
  );
}