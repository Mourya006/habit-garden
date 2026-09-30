import "dotenv/config";

import express from "express";
import cors from "cors";
import mongoose from "mongoose";

import authRoutes from "./routes/auth.js";
import habitRoutes from "./routes/habit.js";
import sessionRoutes from "./routes/session.js";

const app = express();

if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
  console.error(
    "JWT_SECRET must be set in .env and be at least 32 characters long."
  );
  process.exit(1);
}

const allowedOrigins = (
  process.env.CLIENT_ORIGIN || "http://localhost:5173"
)
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: allowedOrigins,
  })
);

app.use(
  express.json({
    limit: "100kb",
  })
);

app.use("/api/auth", authRoutes);
app.use("/api/habit", habitRoutes);
app.use("/api/session", sessionRoutes);

app.get("/api/health", (req, res) => {
  res.json({
    ok: true,
    service: "habit-garden-api",
  });
});

app.use((req, res) => {
  res.status(404).json({
    message: "Route not found",
  });
});

app.use((err, req, res, next) => {
  console.error(err);

  if (err instanceof mongoose.Error.ValidationError) {
    return res.status(400).json({
      message: "Invalid data supplied",
    });
  }

  res.status(err.status || 500).json({
    message: err.message || "Server error",
  });
});

const PORT =
  Number(process.env.PORT) || 5000;

const MONGODB_URI =
  process.env.MONGODB_URI ||
  "mongodb://127.0.0.1:27017/habit-garden";

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log("Connected to MongoDB");

    app.listen(PORT, () => {
      console.log(
        `Habit Garden API running on port ${PORT}`
      );
    });
  })
  .catch((err) => {
    console.error(
      "Failed to connect to MongoDB:",
      err.message
    );

    process.exit(1);
  });