import { Router } from "express";
import auth from "../middleware/auth.js";
import User from "../models/User.js";
import Habit from "../models/Habit.js";
import Session from "../models/Session.js";

const router = Router();

router.use(auth);

/* =========================================================
   GROWTH CALCULATIONS
========================================================= */

function getTotalTargetMinutes(habit) {
  return (
    Number(habit.dailyGoalMinutes || 0) *
    Number(habit.durationDays || 0)
  );
}

function getGrowthData(habit) {
  const totalMinutes = Number(
    habit.totalTimeMinutes || 0
  );

  const targetMinutes =
    getTotalTargetMinutes(habit);

  const progressPercent =
    targetMinutes > 0
      ? Math.min(
          100,
          Math.round(
            (totalMinutes / targetMinutes) * 100
          )
        )
      : 0;

  let stageIndex = 0;

  /*
    Plant growth is intentionally more responsive.

    0%   → Seed
    5%   → Sprout
    20%  → Small
    40%  → Growing
    65%  → Mature
    85%  → Full
  */

  if (progressPercent >= 85) {
    stageIndex = 5;
  } else if (progressPercent >= 65) {
    stageIndex = 4;
  } else if (progressPercent >= 40) {
    stageIndex = 3;
  } else if (progressPercent >= 20) {
    stageIndex = 2;
  } else if (progressPercent >= 5) {
    stageIndex = 1;
  }

  const stages = [
    "seed",
    "sprout",
    "small",
    "growing",
    "mature",
    "full",
  ];

  const currentStage =
    stages[stageIndex];

  return {
    currentStage,
    progressPercent,
    targetMinutes,
  };
}

/* =========================================================
   SERIALIZE HABIT
========================================================= */

function serializeHabit(
  habit,
  todayMinutes = 0
) {
  const growth =
    getGrowthData(habit);

  return {
    id: habit._id,

    category:
      habit.category || "Other",

    skill: habit.skill,

    dailyGoalMinutes:
      habit.dailyGoalMinutes,

    durationDays:
      habit.durationDays || 30,

    startDate:
      habit.startDate,

    endDate:
      habit.endDate,

    selectedSeed:
      habit.selectedSeed,

    currentPlantStage:
      growth.currentStage,

    totalTimeMinutes:
      habit.totalTimeMinutes,

    targetMinutes:
      growth.targetMinutes,

    progressPercent:
      growth.progressPercent,

    stageProgressPercent:
      growth.progressPercent,

    todayMinutes,

    streak:
      habit.streak,

    longestStreak:
      habit.longestStreak,

    lastSessionDate:
      habit.lastSessionDate,

    isActive:
      habit.isActive,

    createdAt:
      habit.createdAt,
  };
}

/* =========================================================
   TODAY'S MINUTES
========================================================= */

async function getTodayMinutes(
  habitId,
  userId
) {
  const start = new Date();

  start.setHours(
    0,
    0,
    0,
    0
  );

  const result =
    await Session.aggregate([
      {
        $match: {
          habitId: habitId,

          userId,

          completed: true,

          date: {
            $gte: start,
          },
        },
      },

      {
        $group: {
          _id: null,

          minutes: {
            $sum:
              "$durationMinutes",
          },
        },
      },
    ]);

  return (
    result[0]?.minutes || 0
  );
}

/* =========================================================
   CREATE NEW HABIT / PLANT
========================================================= */

router.post(
  "/",
  async (req, res, next) => {
    try {
      const {
        category,
        skill,
        focus,
        dailyGoalMinutes,
        durationDays,
        selectedSeed,
      } = req.body;

      const finalSkill =
        focus?.trim() ||
        skill?.trim();

      const minutes =
        Number(
          dailyGoalMinutes
        );

      const days =
        Number(durationDays);

      /* -----------------------------------------
         VALIDATION
      ----------------------------------------- */

      if (
        !finalSkill ||
        !Number.isFinite(minutes) ||
        minutes < 1 ||
        minutes > 1440 ||
        !Number.isFinite(days) ||
        days < 1 ||
        days > 3650 ||
        !selectedSeed
      ) {
        return res.status(400).json({
          message:
            "Enter a valid skill, daily goal, duration, and seed.",
        });
      }

      /* -----------------------------------------
         CALCULATE DATES
      ----------------------------------------- */

      const startDate =
        new Date();

      const endDate =
        new Date(startDate);

      endDate.setDate(
        endDate.getDate() + days
      );

      /* -----------------------------------------
         CREATE NEW HABIT
      ----------------------------------------- */

      const habit =
        await Habit.create({
          userId:
            req.userId,

          category:
            category?.trim() ||
            "Other",

          skill:
            finalSkill.slice(
              0,
              80
            ),

          dailyGoalMinutes:
            minutes,

          durationDays:
            days,

          startDate,

          endDate,

          selectedSeed,

          currentPlantStage:
            "seed",

          totalTimeMinutes:
            0,

          streak: 0,

          longestStreak: 0,

          lastSessionDate:
            null,

          isActive: true,
        });

      /* -----------------------------------------
         UPDATE USER
      ----------------------------------------- */

      await User.findByIdAndUpdate(
        req.userId,
        {
          hasCompletedOnboarding:
            true,
        }
      );

      /* -----------------------------------------
         RESPONSE
      ----------------------------------------- */

      res.status(201).json({
        habit:
          serializeHabit(
            habit
          ),
      });
    } catch (err) {
      next(err);
    }
  }
);

/* =========================================================
   GET ALL ACTIVE HABITS
========================================================= */

router.get(
  "/active",
  async (req, res, next) => {
    try {
      const habits =
        await Habit.find({
          userId:
            req.userId,

          isActive: true,
        }).sort({
          createdAt: -1,
        });

      const serializedHabits =
        await Promise.all(
          habits.map(
            async (habit) => {
              const todayMinutes =
                await getTodayMinutes(
                  habit._id,
                  req.userId
                );

              return serializeHabit(
                habit,
                todayMinutes
              );
            }
          )
        );

      res.json({
        habits:
          serializedHabits,

        habit:
          serializedHabits.length >
          0
            ? serializedHabits[0]
            : null,
      });
    } catch (err) {
      next(err);
    }
  }
);

/* =========================================================
   GET ONE HABIT
========================================================= */

router.get(
  "/:habitId",
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
            "Habit not found.",
        });
      }

      const todayMinutes =
        await getTodayMinutes(
          habit._id,
          req.userId
        );

      res.json({
        habit:
          serializeHabit(
            habit,
            todayMinutes
          ),
      });
    } catch (err) {
      next(err);
    }
  }
);

/* =========================================================
   DELETE A PLANT / SKILL
========================================================= */

router.delete(
  "/:habitId",
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
            "Plant not found.",
        });
      }

      /* Delete all practice sessions */

      await Session.deleteMany({
        habitId:
          habit._id,

        userId:
          req.userId,
      });

      /* Delete the plant */

      await Habit.deleteOne({
        _id:
          habit._id,

        userId:
          req.userId,
      });

      res.json({
        message:
          "Plant deleted successfully.",

        habitId:
          habit._id,
      });
    } catch (err) {
      next(err);
    }
  }
);

export default router;