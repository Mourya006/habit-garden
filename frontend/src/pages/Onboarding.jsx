import { useState } from "react";
import { useNavigate } from "react-router-dom";

import PlantVisual, {
  SEED_OPTIONS,
} from "../components/PlantVisual.jsx";

import client from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";

const CATEGORIES = [
  {
    name: "Programming",
    icon: "💻",
  },
  {
    name: "Studying",
    icon: "📚",
  },
  {
    name: "Fitness",
    icon: "🏋️",
  },
  {
    name: "Other",
    icon: "✏️",
  },
];

export default function Onboarding() {
  const navigate = useNavigate();
  const { updateUser } = useAuth();

  const [category, setCategory] = useState("");
  const [focus, setFocus] = useState("");

  const [dailyGoalMinutes, setDailyGoalMinutes] =
    useState("");

  const [durationDays, setDurationDays] =
    useState("");

  const [seed, setSeed] = useState("");

  const [step, setStep] = useState(1);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  /* =====================================================
     CATEGORY
  ===================================================== */

  function chooseCategory(value) {
    setCategory(value);
    setError("");
  }

  function continueToFocus() {
    if (!category) {
      setError("Choose a category first.");
      return;
    }

    setError("");
    setStep(2);
  }

  /* =====================================================
     SKILL
  ===================================================== */

  function continueToTime() {
    if (!focus.trim()) {
      setError(
        "Please enter the skill you want to work on."
      );
      return;
    }

    setError("");
    setStep(3);
  }

  /* =====================================================
     TIME + DAYS
  ===================================================== */

  function continueToSeed() {
    const minutes = Number(
      dailyGoalMinutes
    );

    const days = Number(
      durationDays
    );

    if (
      !dailyGoalMinutes ||
      !Number.isFinite(minutes) ||
      minutes <= 0
    ) {
      setError(
        "Please enter a valid daily time."
      );
      return;
    }

    if (
      !durationDays ||
      !Number.isFinite(days) ||
      days <= 0
    ) {
      setError(
        "Please enter a valid number of days."
      );
      return;
    }

    setError("");
    setStep(4);
  }

  /* =====================================================
     PLANT
  ===================================================== */

  async function plantSkill() {
    const minutes = Number(
      dailyGoalMinutes
    );

    const days = Number(
      durationDays
    );

    if (!category) {
      setError("Choose a category first.");
      return;
    }

    if (!focus.trim()) {
      setError("Enter your skill.");
      return;
    }

    if (
      !Number.isFinite(minutes) ||
      minutes <= 0
    ) {
      setError("Enter a valid daily time.");
      return;
    }

    if (
      !Number.isFinite(days) ||
      days <= 0
    ) {
      setError("Enter a valid number of days.");
      return;
    }

    if (!seed) {
      setError("Choose a seed.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await client.post("/habit", {
        category,
        skill: focus.trim(),
        focus: focus.trim(),
        dailyGoalMinutes: minutes,
        durationDays: days,
        selectedSeed: seed,
      });

      updateUser({
        hasCompletedOnboarding: true,
      });

      /*
       * Home is the skill-selection page.
       * After planting, take the user to the garden.
       */
      navigate("/garden");

    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Could not plant your skill."
      );
    } finally {
      setLoading(false);
    }
  }

  /* =====================================================
     BACKGROUND
  ===================================================== */

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#315d2c] pb-28 text-[#f7ecd9]">

      {/* =================================================
          BACKGROUND
      ================================================= */}

      <div className="absolute inset-0">

        <div className="absolute inset-0 bg-gradient-to-b from-[#7fa66a] via-[#628d4e] to-[#3f6835]" />

        <div className="absolute -top-32 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-[#f7e8a9]/25 blur-3xl" />

        <div className="absolute bottom-[32%] left-[-10%] h-56 w-[70%] rounded-[50%] bg-[#547f43]/80" />

        <div className="absolute bottom-[30%] right-[-15%] h-64 w-[75%] rounded-[50%] bg-[#4b773d]/80" />

        <div className="absolute inset-x-0 bottom-0 h-[65%] bg-gradient-to-b from-[#548844] to-[#315d2c]" />

        <div className="absolute bottom-[-8%] left-1/2 h-[75%] w-[34%] -translate-x-1/2 rotate-[4deg] rounded-[50%] bg-[#b69b6c]/50" />

        <SoilPatch className="left-[4%] bottom-[15%]" />
        <SoilPatch className="right-[5%] bottom-[18%]" />
        <SoilPatch className="left-[26%] bottom-[8%]" />
        <SoilPatch className="right-[25%] bottom-[10%]" />

        <Rock
          className="left-[8%] bottom-[31%]"
          size="large"
        />

        <Rock
          className="left-[20%] bottom-[23%]"
        />

        <Rock
          className="right-[12%] bottom-[30%]"
          size="large"
        />

        <Rock
          className="right-[22%] bottom-[18%]"
        />

        <Flower className="left-[8%] bottom-[42%]" />
        <Flower className="right-[8%] bottom-[45%]" />
        <Flower className="left-[18%] bottom-[53%]" />
        <Flower className="right-[19%] bottom-[50%]" />

        <Grass x="5%" y="58%" />
        <Grass x="12%" y="72%" />
        <Grass x="22%" y="62%" />
        <Grass x="32%" y="78%" />
        <Grass x="42%" y="65%" />
        <Grass x="53%" y="75%" />
        <Grass x="63%" y="60%" />
        <Grass x="74%" y="73%" />
        <Grass x="84%" y="63%" />
        <Grass x="94%" y="76%" />

      </div>

      {/* =================================================
          CONTENT
      ================================================= */}

      <main className="relative z-20 flex min-h-screen items-center justify-center px-4 pb-10 pt-10">

        <div className="w-full max-w-5xl">

          {/* Heading */}

          <div className="mb-8 text-center">

            <p className="text-xs font-semibold uppercase tracking-[0.4em] text-[#e2e7bd]">
              Habit Garden
            </p>

            <h1 className="mt-3 font-serif text-4xl font-semibold text-white sm:text-6xl">
              {step === 1 && "Start with a seed."}
              {step === 2 && "Choose what to grow."}
              {step === 3 && "Give it your time."}
              {step === 4 && "Choose your seed."}
            </h1>

            <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-[#edf2df]">
              {step === 1 &&
                "Choose a category for the skill you want to grow."}

              {step === 2 &&
                "Tell us exactly what you want to learn or improve."}

              {step === 3 &&
                "Set your daily practice time and your journey length."}

              {step === 4 &&
                "Choose the seed that will begin your garden journey."}
            </p>

          </div>

          {/* =================================================
              STEP 1
          ================================================= */}

          {step === 1 && (
            <section className="mx-auto max-w-4xl">

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">

                {CATEGORIES.map((item) => (
                  <CategoryButton
                    key={item.name}
                    icon={item.icon}
                    name={item.name}
                    selected={
                      category === item.name
                    }
                    onClick={() =>
                      chooseCategory(item.name)
                    }
                  />
                ))}

              </div>

              {error && (
                <p className="mt-4 text-center text-sm text-[#ffd0d0]">
                  {error}
                </p>
              )}

              <div className="mt-7 flex justify-center">

                <button
                  type="button"
                  onClick={continueToFocus}
                  disabled={!category}
                  className="rounded-full bg-[#e0cc98] px-8 py-3 font-semibold text-[#253a26] hover:bg-[#f0dda9] disabled:opacity-40"
                >
                  Continue →
                </button>

              </div>

            </section>
          )}

          {/* =================================================
              STEP 2
          ================================================= */}

          {step === 2 && (
            <section className="mx-auto max-w-2xl">

              <div className="rounded-3xl border border-white/20 bg-[#17381e]/75 p-6 shadow-2xl backdrop-blur-md sm:p-8">

                <div className="mb-6 text-center">

                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#e0ce9d]/15 text-3xl">
                    {
                      CATEGORIES.find(
                        (item) =>
                          item.name === category
                      )?.icon
                    }
                  </div>

                  <p className="mt-4 text-xs uppercase tracking-[0.25em] text-[#b8c8aa]">
                    {category}
                  </p>

                  <h2 className="mt-2 text-2xl font-semibold text-[#fff4e3]">
                    What specifically do you want to work on?
                  </h2>

                </div>

                <input
                  type="text"
                  value={focus}
                  onChange={(e) => {
                    setFocus(e.target.value);
                    setError("");
                  }}
                  placeholder={
                    category === "Programming"
                      ? "Example: C#, Python, SQL..."
                      : category === "Studying"
                      ? "Example: Physics, Mathematics..."
                      : category === "Fitness"
                      ? "Example: Calisthenics, strength..."
                      : "Example: Guitar, drawing, cooking..."
                  }
                  autoFocus
                  className="w-full rounded-2xl border border-[#d9c79c]/30 bg-[#102719]/90 px-5 py-4 text-sm text-white outline-none placeholder:text-[#71846e] focus:border-[#e0cc98]"
                />

                {error && (
                  <p className="mt-3 text-sm text-[#ffd0d0]">
                    {error}
                  </p>
                )}

                <div className="mt-6 flex gap-3">

                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="rounded-full border border-white/15 px-6 py-3 text-sm text-[#dce5d5] hover:bg-white/10"
                  >
                    ← Back
                  </button>

                  <button
                    type="button"
                    onClick={continueToTime}
                    disabled={!focus.trim()}
                    className="flex-1 rounded-full bg-[#e0cc98] px-6 py-3 font-semibold text-[#253a26] hover:bg-[#f0dda9] disabled:opacity-40"
                  >
                    Continue →
                  </button>

                </div>

              </div>

            </section>
          )}

          {/* =================================================
              STEP 3 — TIME + DAYS
          ================================================= */}

          {step === 3 && (
            <section className="mx-auto max-w-2xl">

              <div className="rounded-3xl border border-white/20 bg-[#17381e]/75 p-6 shadow-2xl backdrop-blur-md sm:p-8">

                <div className="text-center">

                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#e0ce9d]/15 text-3xl">
                    ⏱️
                  </div>

                  <p className="mt-4 text-xs uppercase tracking-[0.25em] text-[#b8c8aa]">
                    Your commitment
                  </p>

                  <h2 className="mt-2 text-2xl font-semibold text-[#fff4e3]">
                    How do you want to grow?
                  </h2>

                  <p className="mt-2 text-sm text-[#b9c9b1]">
                    Set your daily time and how many days you want this journey to last.
                  </p>

                </div>

                {/* DAILY TIME */}

                <div className="mt-8">

                  <label className="mb-2 block text-center text-xs uppercase tracking-[0.2em] text-[#b8c8aa]">
                    Daily practice
                  </label>

                  <div className="flex items-center justify-center gap-3">

                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={dailyGoalMinutes}
                      onChange={(e) => {
                        const value =
                          e.target.value.replace(
                            /\D/g,
                            ""
                          );

                        setDailyGoalMinutes(value);
                        setError("");
                      }}
                      placeholder="30"
                      className="w-32 rounded-2xl border border-[#d9c79c]/30 bg-[#102719]/90 px-5 py-4 text-center text-xl font-semibold text-white outline-none focus:border-[#e0cc98]"
                    />

                    <span className="text-lg text-[#dce5d5]">
                      minutes / day
                    </span>

                  </div>

                </div>

                {/* DAYS */}

                <div className="mt-7">

                  <label className="mb-2 block text-center text-xs uppercase tracking-[0.2em] text-[#b8c8aa]">
                    Journey length
                  </label>

                  <div className="flex items-center justify-center gap-3">

                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={durationDays}
                      onChange={(e) => {
                        const value =
                          e.target.value.replace(
                            /\D/g,
                            ""
                          );

                        setDurationDays(value);
                        setError("");
                      }}
                      placeholder="30"
                      className="w-32 rounded-2xl border border-[#d9c79c]/30 bg-[#102719]/90 px-5 py-4 text-center text-xl font-semibold text-white outline-none focus:border-[#e0cc98]"
                    />

                    <span className="text-lg text-[#dce5d5]">
                      days
                    </span>

                  </div>

                </div>

                {error && (
                  <p className="mt-5 text-center text-sm text-[#ffd0d0]">
                    {error}
                  </p>
                )}

                <div className="mt-7 flex gap-3">

                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="rounded-full border border-white/15 px-6 py-3 text-sm text-[#dce5d5] hover:bg-white/10"
                  >
                    ← Back
                  </button>

                  <button
                    type="button"
                    onClick={continueToSeed}
                    className="flex-1 rounded-full bg-[#e0cc98] px-6 py-3 font-semibold text-[#253a26] hover:bg-[#f0dda9]"
                  >
                    Continue →
                  </button>

                </div>

              </div>

            </section>
          )}

          {/* =================================================
              STEP 4 — SEED
          ================================================= */}

          {step === 4 && (
            <section className="mx-auto max-w-3xl">

              <div className="rounded-3xl border border-white/20 bg-[#17381e]/75 p-6 shadow-2xl backdrop-blur-md sm:p-8">

                <div className="text-center">

                  <p className="text-xs uppercase tracking-[0.3em] text-[#b8c8aa]">
                    Choose your beginning
                  </p>

                  <h2 className="mt-2 text-3xl font-semibold text-[#fff4e3]">
                    Pick your seed
                  </h2>

                  <p className="mt-2 text-sm text-[#b9c9b1]">
                    Your seed will grow as you stay consistent with{" "}
                    {focus}.
                  </p>

                </div>

                <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3">

                  {SEED_OPTIONS.map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => {
                        setSeed(option.id);
                        setError("");
                      }}
                      className={`group flex flex-col items-center rounded-2xl border p-4 text-center transition-all ${
                        seed === option.id
                          ? "border-[#e0cc98] bg-[#e0cc98]/15"
                          : "border-white/10 bg-black/10 hover:border-white/30"
                      }`}
                    >

                      <div
                        className={`rounded-2xl p-3 ${
                          seed === option.id
                            ? "bg-[#e0cc98]/15"
                            : "bg-black/10"
                        }`}
                      >

                        <PlantVisual
                          stage="small"
                          species={option.id}
                          size={90}
                        />

                      </div>

                      <h3 className="mt-3 font-semibold text-[#fff4e3]">
                        {option.name}
                      </h3>

                      <p className="mt-1 text-[11px] leading-4 text-[#aebfa8]">
                        {option.blurb}
                      </p>

                      {seed === option.id && (
                        <span className="mt-3 rounded-full bg-[#e0cc98] px-3 py-1 text-[10px] font-semibold uppercase text-[#253a26]">
                          Selected
                        </span>
                      )}

                    </button>
                  ))}

                </div>

                {error && (
                  <p className="mt-4 text-center text-sm text-[#ffd0d0]">
                    {error}
                  </p>
                )}

                {/* SUMMARY */}

                <div className="mt-7 rounded-2xl border border-[#d9c79c]/20 bg-black/10 p-4">

                  <div className="grid grid-cols-1 gap-4 text-center sm:grid-cols-4">

                    <div>
                      <p className="text-[10px] uppercase text-[#82947d]">
                        Skill
                      </p>

                      <p className="mt-1 text-sm font-semibold text-[#e8eadc]">
                        {focus}
                      </p>
                    </div>

                    <div>
                      <p className="text-[10px] uppercase text-[#82947d]">
                        Daily
                      </p>

                      <p className="mt-1 text-sm font-semibold text-[#e8eadc]">
                        {dailyGoalMinutes} min
                      </p>
                    </div>

                    <div>
                      <p className="text-[10px] uppercase text-[#82947d]">
                        Journey
                      </p>

                      <p className="mt-1 text-sm font-semibold text-[#e8eadc]">
                        {durationDays} days
                      </p>
                    </div>

                    <div>
                      <p className="text-[10px] uppercase text-[#82947d]">
                        Seed
                      </p>

                      <p className="mt-1 text-sm font-semibold text-[#e8eadc]">
                        {seed
                          ? SEED_OPTIONS.find(
                              (option) =>
                                option.id === seed
                            )?.name
                          : "Not selected"}
                      </p>
                    </div>

                  </div>

                </div>

                <div className="mt-6 flex gap-3">

                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    className="rounded-full border border-white/15 px-6 py-3 text-sm text-[#dce5d5] hover:bg-white/10"
                  >
                    ← Back
                  </button>

                  <button
                    type="button"
                    onClick={plantSkill}
                    disabled={!seed || loading}
                    className="flex-1 rounded-full bg-[#e0cc98] px-6 py-3 font-semibold text-[#253a26] hover:bg-[#f0dda9] disabled:opacity-40"
                  >
                    {loading
                      ? "Planting..."
                      : "🌱 Plant My Skill"}
                  </button>

                </div>

              </div>

            </section>
          )}

          {/* STEP INDICATOR */}

          <div className="mt-8 flex items-center justify-center gap-2">

            {[1, 2, 3, 4].map((number) => (
              <div
                key={number}
                className={`h-2 rounded-full transition-all ${
                  step === number
                    ? "w-8 bg-[#e0cc98]"
                    : "w-2 bg-white/30"
                }`}
              />
            ))}

          </div>

        </div>

      </main>

    </div>
  );
}

/* =========================================================
   CATEGORY BUTTON
========================================================= */

function CategoryButton({
  icon,
  name,
  selected,
  onClick,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-2xl border p-5 text-left shadow-xl backdrop-blur-sm transition-all hover:-translate-y-1 ${
        selected
          ? "border-[#f0d99e] bg-[#735b32]/85"
          : "border-white/20 bg-[#17381e]/75 hover:border-[#d6ca9c]/60 hover:bg-[#1d4525]/85"
      }`}
    >

      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-[#e0ce9d]/15 text-2xl">
        {icon}
      </div>

      <p className="font-semibold text-[#fff4e3]">
        {name}
      </p>

      <p className="mt-1 text-xs text-[#c5d1bd]">
        {selected
          ? "Selected"
          : "Choose this"}
      </p>

    </button>
  );
}

/* =========================================================
   DECORATIONS
========================================================= */

function SoilPatch({ className = "" }) {
  return (
    <div
      className={`absolute h-20 w-40 rounded-[50%] bg-[#3c2e1d]/45 ${className}`}
    />
  );
}

function Rock({
  className = "",
  size = "small",
}) {
  return (
    <div
      className={`absolute rounded-[50%] bg-[#65715c]/60 ${
        size === "large"
          ? "h-5 w-8"
          : "h-3 w-5"
      } ${className}`}
    />
  );
}

function Flower({ className = "" }) {
  return (
    <div className={`absolute ${className}`}>

      <div className="relative h-8 w-8">

        <div className="absolute left-3 top-0 h-3 w-3 rounded-full bg-[#e9b7bd]/70" />

        <div className="absolute left-0 top-2 h-3 w-3 rounded-full bg-[#e9b7bd]/60" />

        <div className="absolute right-0 top-2 h-3 w-3 rounded-full bg-[#e9b7bd]/60" />

        <div className="absolute left-3 top-3 h-2 w-2 rounded-full bg-[#e7d38d]" />

        <div className="absolute left-[15px] top-5 h-8 w-[2px] bg-[#6f8d54]" />

      </div>

    </div>
  );
}

function Grass({ x, y }) {
  return (
    <div
      className="absolute h-7 w-5 opacity-40"
      style={{
        left: x,
        top: y,
      }}
    >

      <div className="absolute bottom-0 left-2 h-6 w-[2px] rotate-[-18deg] bg-[#9bb47a]" />

      <div className="absolute bottom-0 left-2 h-6 w-[2px] rotate-[18deg] bg-[#9bb47a]" />

      <div className="absolute bottom-0 left-2 h-5 w-[2px] bg-[#aac18a]" />

    </div>
  );
}