import { Router } from "express";
import auth from "../middleware/auth.js";
import Habit from "../models/Habit.js";
import Session from "../models/Session.js";

const router = Router();

router.use(auth);

/* =========================================================
   DATE HELPERS
========================================================= */

function dayKey(date) {
  return new Intl.DateTimeFormat(
    "en-CA",
    {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }
  ).format(new Date(date));
}

function isYesterday(
  previous,
  current
) {
  const prev =
    new Date(previous);

  const today =
    new Date(current);

  today.setHours(
    0,
    0,
    0,
    0
  );

  prev.setHours(
    0,
    0,
    0,
    0
  );

  today.setDate(
    today.getDate() - 1
  );

  return (
    prev.getTime() ===
    today.getTime()
  );
}

function isToday(
  date,
  today = new Date()
) {
  return (
    dayKey(date) ===
    dayKey(today)
  );
}

/* =========================================================
   CALCULATE PLANT GROWTH
========================================================= */

function calculateGrowth(
  habit
) {
  const totalMinutes =
    Number(
      habit.totalTimeMinutes || 0
    );

  const dailyGoalMinutes =
    Number(
      habit.dailyGoalMinutes || 0
    );

  const durationDays =
    Number(
      habit.durationDays || 0
    );

  /*
    Example:

    5 minutes/day × 30 days
    = 150 total target minutes
  */

  const targetMinutes =
    dailyGoalMinutes *
    durationDays;

  if (targetMinutes <= 0) {
    return {
      currentPlantStage:
        "seed",

      progressPercent: 0,

      targetMinutes: 0,
    };
  }

  const progressPercent =
    Math.min(
      100,
      Math.round(
        (totalMinutes /
          targetMinutes) *
          100
      )
    );

  let currentPlantStage =
    "seed";

  /*
    More responsive plant growth:

    0%   → Seed
    5%   → Sprout
    20%  → Small
    40%  → Growing
    65%  → Mature
    85%  → Full
  */

  if (
    progressPercent >= 85
  ) {
    currentPlantStage =
      "full";
  } else if (
    progressPercent >= 65
  ) {
    currentPlantStage =
      "mature";
  } else if (
    progressPercent >= 40
  ) {
    currentPlantStage =
      "growing";
  } else if (
    progressPercent >= 20
  ) {
    currentPlantStage =
      "small";
  } else if (
    progressPercent >= 5
  ) {
    currentPlantStage =
      "sprout";
  }

  return {
    currentPlantStage,

    progressPercent,

    targetMinutes,
  };
}

/* =========================================================
   COMPLETE PRACTICE SESSION
========================================================= */

router.post(
  "/complete",
  async (req, res, next) => {
    try {
      const {
        habitId,
        durationMinutes,
      } = req.body;

      const minutes =
        Number(durationMinutes);

      /* -----------------------------------------
         VALIDATION
      ----------------------------------------- */

      if (
        !habitId ||
        !Number.isFinite(minutes) ||
        minutes < 1 ||
        minutes > 1440
      ) {
        return res.status(400).json({
          message:
            "Session duration must be between 1 and 1440 minutes.",
        });
      }

      /* -----------------------------------------
         FIND HABIT
      ----------------------------------------- */

      const habit =
        await Habit.findOne({
          _id: habitId,

          userId:
            req.userId,

          isActive: true,
        });

      if (!habit) {
        return res.status(404).json({
          message:
            "Active habit not found",
        });
      }

      const completedMinutes =
        Math.round(minutes);

      const now =
        new Date();

      /* -----------------------------------------
         SAVE SESSION
      ----------------------------------------- */

      await Session.create({
        userId:
          req.userId,

        habitId:
          habit._id,

        durationMinutes:
          completedMinutes,

        completed: true,

        date: now,
      });

      /* -----------------------------------------
         UPDATE STREAK
      ----------------------------------------- */

      if (
        !habit.lastSessionDate ||
        !isToday(
          habit.lastSessionDate,
          now
        )
      ) {
        habit.streak =
          habit.lastSessionDate &&
          isYesterday(
            habit.lastSessionDate,
            now
          )
            ? habit.streak + 1
            : 1;

        habit.longestStreak =
          Math.max(
            habit.longestStreak,
            habit.streak
          );

        habit.lastSessionDate =
          now;
      }

      /* -----------------------------------------
         UPDATE TOTAL PRACTICE TIME
      ----------------------------------------- */

      habit.totalTimeMinutes +=
        completedMinutes;

      /* -----------------------------------------
         CALCULATE GROWTH
      ----------------------------------------- */

      const growth =
        calculateGrowth(
          habit
        );

      habit.currentPlantStage =
        growth.currentPlantStage;

      await habit.save();

      /* -----------------------------------------
         RESPONSE
      ----------------------------------------- */

      res.status(201).json({
        habit: {
          id:
            habit._id,

          currentPlantStage:
            growth.currentPlantStage,

          totalTimeMinutes:
            habit.totalTimeMinutes,

          targetMinutes:
            growth.targetMinutes,

          progressPercent:
            growth.progressPercent,

          streak:
            habit.streak,

          longestStreak:
            habit.longestStreak,
        },
      });
    } catch (err) {
      next(err);
    }
  }
);

/* =========================================================
   GET HABIT PROGRESS
========================================================= */

router.get(
  "/progress/:habitId",
  async (req, res, next) => {
    try {
      const habit =
        await Habit.findOne({
          _id:
            req.params.habitId,

          userId:
            req.userId,
        });

      if (!habit) {
        return res.status(404).json({
          message:
            "Habit not found",
        });
      }

      const now =
        new Date();

      const startOfToday =
        new Date(now);

      startOfToday.setHours(
        0,
        0,
        0,
        0
      );

      const startOfWeek =
        new Date(
          startOfToday
        );

      startOfWeek.setDate(
        startOfWeek.getDate() -
          6
      );

      /* -----------------------------------------
         GET SESSIONS
      ----------------------------------------- */

      const sessions =
        await Session.find({
          habitId:
            habit._id,

          userId:
            req.userId,

          completed: true,
        })
          .sort({
            date: -1,
          })
          .limit(500)
          .lean();

      /* -----------------------------------------
         TODAY
      ----------------------------------------- */

      const todayMinutes =
        sessions
          .filter(
            (s) =>
              new Date(s.date) >=
              startOfToday
          )
          .reduce(
            (sum, s) =>
              sum +
              s.durationMinutes,
            0
          );

      /* -----------------------------------------
         THIS WEEK
      ----------------------------------------- */

      const weekMinutes =
        sessions
          .filter(
            (s) =>
              new Date(s.date) >=
              startOfWeek
          )
          .reduce(
            (sum, s) =>
              sum +
              s.durationMinutes,
            0
          );

      /* -----------------------------------------
         DAILY BUCKETS
      ----------------------------------------- */

      const dailyBuckets =
        [];

      for (
        let i = 6;
        i >= 0;
        i--
      ) {
        const day =
          new Date(
            startOfToday
          );

        day.setDate(
          day.getDate() - i
        );

        const nextDay =
          new Date(day);

        nextDay.setDate(
          nextDay.getDate() + 1
        );

        const minutes =
          sessions
            .filter(
              (s) =>
                new Date(
                  s.date
                ) >= day &&
                new Date(
                  s.date
                ) < nextDay
            )
            .reduce(
              (sum, s) =>
                sum +
                s.durationMinutes,
              0
            );

        dailyBuckets.push({
          date:
            day
              .toISOString()
              .slice(0, 10),

          minutes,
        });
      }

      /* -----------------------------------------
         GROWTH
      ----------------------------------------- */

      const growth =
        calculateGrowth(
          habit
        );

      /* -----------------------------------------
         RESPONSE
      ----------------------------------------- */

      res.json({
        todayMinutes,

        dailyGoalMinutes:
          habit.dailyGoalMinutes,

        durationDays:
          habit.durationDays,

        targetMinutes:
          growth.targetMinutes,

        progressPercent:
          growth.progressPercent,

        weekMinutes,

        totalTimeMinutes:
          habit.totalTimeMinutes,

        streak:
          habit.streak,

        longestStreak:
          habit.longestStreak,

        completedSessions:
          sessions.length,

        currentPlantStage:
          growth.currentPlantStage,

        dailyBuckets,
      });
    } catch (err) {
      next(err);
    }
  }
);

export default router;