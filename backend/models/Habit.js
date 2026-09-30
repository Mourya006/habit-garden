import mongoose from "mongoose";

const habitSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true,
  },

  // Broad category
  category: {
    type: String,
    default: "Other",
    trim: true,
  },

  // Specific skill chosen by the user
  skill: {
    type: String,
    required: true,
    trim: true,
    maxlength: 80,
  },

  // Daily practice goal
  dailyGoalMinutes: {
    type: Number,
    required: true,
    min: 1,
    max: 1440,
  },

  // How many days the user wants to work on this skill
  durationDays: {
    type: Number,
    required: true,
    min: 1,
    max: 3650,
    default: 30,
  },

  // When this plant was planted
  startDate: {
    type: Date,
    default: Date.now,
  },

  // Target date calculated from durationDays
  endDate: {
    type: Date,
    default: null,
  },

  // Seed selected by the user
  selectedSeed: {
    type: String,
    required: true,
  },

  // Current visual growth stage
  currentPlantStage: {
    type: String,
    enum: [
      "seed",
      "sprout",
      "small",
      "growing",
      "mature",
      "full",
    ],
    default: "seed",
  },

  // Total practice time
  totalTimeMinutes: {
    type: Number,
    default: 0,
  },

  // Current consecutive-day streak
  streak: {
    type: Number,
    default: 0,
  },

  // Best streak achieved
  longestStreak: {
    type: Number,
    default: 0,
  },

  // Last day a session was completed
  lastSessionDate: {
    type: Date,
    default: null,
  },

  // Allows us to archive a plant later
  isActive: {
    type: Boolean,
    default: true,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("Habit", habitSchema);