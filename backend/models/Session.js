import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  habitId: { type: mongoose.Schema.Types.ObjectId, ref: "Habit", required: true, index: true },
  durationMinutes: { type: Number, required: true },
  completed: { type: Boolean, default: false },
  date: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Session", sessionSchema);
