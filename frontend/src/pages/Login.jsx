import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import client from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Show / Hide password
  const [showPassword, setShowPassword] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await client.post("/auth/login", {
        email,
        password,
      });

      login(res.data.token, res.data.user);

      navigate(
        res.data.user.hasCompletedOnboarding
          ? "/"
          : "/onboarding"
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      title="Welcome Back"
      subtitle="Continue growing your garden."
    >
      <form
        onSubmit={handleSubmit}
        className="space-y-5"
      >
        {/* EMAIL */}

        <Field
          label="Email"
          type="email"
          value={email}
          onChange={setEmail}
          placeholder="you@example.com"
        />

        {/* PASSWORD */}

        <div className="relative">
          <Field
            label="Password"
            type={
              showPassword
                ? "text"
                : "password"
            }
            value={password}
            onChange={setPassword}
            placeholder="••••••••"
          />

          <button
            type="button"
            onClick={() =>
              setShowPassword(
                !showPassword
              )
            }
            className="absolute right-3 top-9 text-sm text-[#52604f] hover:text-[#355f35]"
          >
            {showPassword
              ? "Hide"
              : "Show"}
          </button>
        </div>

        {/* FORGOT PASSWORD */}

        <div className="text-right">
          <Link
            to="/forgot-password"
            className="text-sm font-semibold text-[#355f35] hover:text-[#1f4321] hover:underline"
          >
            Forgot password?
          </Link>
        </div>

        {/* ERROR */}

        {error && (
          <p
            className="
              rounded-xl
              border
              border-red-400/30
              bg-red-900/40
              px-4
              py-3
              text-sm
              text-red-200
            "
          >
            {error}
          </p>
        )}

        {/* LOGIN BUTTON */}

        <button
          type="submit"
          disabled={loading}
          className="
            w-full
            rounded-2xl
            border-2
            border-[#31552e]
            bg-[#477a3f]
            px-5
            py-3.5
            font-semibold
            text-white
            shadow-[0_5px_12px_rgba(30,55,25,0.35)]
            transition-all
            duration-300
            hover:bg-[#598e4f]
            hover:-translate-y-0.5
            disabled:opacity-60
            disabled:hover:translate-y-0
          "
        >
          {loading
            ? "Entering the garden..."
            : "Enter Garden"}
        </button>
      </form>

      {/* SIGNUP */}

      <p className="mt-7 text-center text-sm text-[#52604f]">
        New to Habit Garden?{" "}

        <Link
          to="/signup"
          className="
            font-semibold
            text-[#355f35]
            transition-colors
            hover:text-[#1f4321]
            hover:underline
          "
        >
          Plant your first seed
        </Link>
      </p>
    </AuthShell>
  );
}


/* =========================================================
   AUTH SHELL
========================================================= */

export function AuthShell({
  title,
  subtitle,
  children,
}) {
  return (
    <div
      className="
        relative
        flex
        min-h-screen
        items-center
        justify-center
        overflow-hidden
        px-4
        py-10
      "
    >
      {/* =====================================================
          FOREST BACKGROUND
      ===================================================== */}

      <img
        src="/habit-garden-bg.png"
        alt=""
        className="
          absolute
          inset-0
          h-full
          w-full
          object-cover
          object-center
        "
      />

      {/* BACKGROUND OVERLAY */}

      <div className="absolute inset-0 bg-black/10" />

      {/* =====================================================
          MAIN CARD
      ===================================================== */}

      <div
        className="
          relative
          z-30
          w-full
          max-w-lg
        "
      >
        {/* CARD */}

        <div
          className="
            rounded-[2rem]
            border
            border-[#fff8e8]/80
            bg-[#f7ecd9]/95
            p-8
            shadow-[0_25px_60px_rgba(20,40,20,0.45)]
            backdrop-blur-md
            sm:p-10
          "
        >
          {/* =================================================
              LOGO + HEADER
          ================================================= */}

          <div className="mb-9 text-center">
            {/* LOGO */}

            <div
              className="
                mx-auto
                mb-4
                flex
                h-16
                w-16
                items-center
                justify-center
                rounded-full
                bg-[#dce8c5]
                shadow-inner
              "
            >
              <span className="text-4xl">
                🌱
              </span>
            </div>

            {/* APP NAME */}

            <p
              className="
                text-xs
                font-semibold
                uppercase
                tracking-[0.35em]
                text-[#557044]
              "
            >
              Habit Garden
            </p>

            {/* TITLE */}

            <h1
              className="
                mt-3
                text-3xl
                font-bold
                text-[#263c27]
                sm:text-4xl
              "
            >
              {title}
            </h1>

            {/* SUBTITLE */}

            <p
              className="
                mt-2
                text-sm
                text-[#65715f]
              "
            >
              {subtitle}
            </p>
          </div>

          {/* FORM */}

          {children}
        </div>
      </div>
    </div>
  );
}


/* =========================================================
   LEAF
========================================================= */

function Leaf({ className = "" }) {
  return (
    <div
      className={`
        absolute
        h-8
        w-4
        rounded-[100%_0_100%_0]
        bg-gradient-to-br
        from-[#8cad62]
        via-[#668c4b]
        to-[#3d6735]
        shadow-[1px_2px_3px_rgba(20,50,15,0.3)]
        ${className}
      `}
    />
  );
}


/* =========================================================
   FLOWER
========================================================= */

function Flower({ className = "" }) {
  return (
    <div
      className={`
        absolute
        h-8
        w-8
        ${className}
      `}
    >
      {/* Petal 1 */}

      <span
        className="
          absolute
          left-[10px]
          top-0
          h-3.5
          w-3.5
          rounded-full
          bg-[#f4b7b7]
        "
      />

      {/* Petal 2 */}

      <span
        className="
          absolute
          left-0
          top-[9px]
          h-3.5
          w-3.5
          rounded-full
          bg-[#f7c5c5]
        "
      />

      {/* Petal 3 */}

      <span
        className="
          absolute
          right-0
          top-[9px]
          h-3.5
          w-3.5
          rounded-full
          bg-[#eea7a7]
        "
      />

      {/* Petal 4 */}

      <span
        className="
          absolute
          left-[10px]
          bottom-0
          h-3.5
          w-3.5
          rounded-full
          bg-[#f6caca]
        "
      />

      {/* Flower center */}

      <span
        className="
          absolute
          left-[11px]
          top-[11px]
          h-2.5
          w-2.5
          rounded-full
          bg-[#e4a72e]
        "
      />
    </div>
  );
}


/* =========================================================
   INPUT FIELD
========================================================= */

export function Field({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
}) {
  return (
    <label className="flex flex-col gap-2">
      {/* LABEL */}

      <span
        className="
          text-sm
          font-semibold
          text-[#42533f]
        "
      >
        {label}
      </span>

      {/* WOODEN INPUT OUTER */}

      <div
        className="
          rounded-2xl
          border-2
          border-[#704025]
          p-1
          shadow-[inset_0_2px_5px_rgba(45,20,8,0.35),0_3px_6px_rgba(60,40,20,0.15)]
        "
        style={{
          backgroundImage: `
            repeating-linear-gradient(
              3deg,
              #704025 0px,
              #9b6039 5px,
              #63351f 11px,
              #87502f 17px,
              #6e3c23 24px
            )
          `,
        }}
      >
        <input
          type={type}
          required
          value={value}
          placeholder={placeholder}
          onChange={(e) =>
            onChange(e.target.value)
          }
          className="
            w-full
            rounded-xl
            border
            border-[#d8ad82]
            bg-[#b97a4e]/95
            px-4
            py-3
            font-medium
            text-[#fff9ed]
            outline-none
            transition-all
            duration-200
            placeholder:text-[#f1d7b6]
            focus:border-[#fff0d3]
            focus:bg-[#c78b5b]
            focus:ring-4
            focus:ring-[#557044]/20
          "
        />
      </div>
    </label>
  );
}