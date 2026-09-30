import { useState } from "react";
import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";

import client from "../api/client.js";
import { AuthShell, Field } from "./Login.jsx";

export default function ResetPassword() {
  const { token } =
    useParams();

  const navigate =
    useNavigate();

  const [password, setPassword] =
    useState("");

  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [error, setError] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  async function handleSubmit(e) {
    e.preventDefault();

    setError("");

    if (password.length < 6) {
      setError(
        "Password must be at least 6 characters."
      );
      return;
    }

    if (
      password !==
      confirmPassword
    ) {
      setError(
        "Passwords do not match."
      );
      return;
    }

    setLoading(true);

    try {
      await client.post(
        "/auth/reset-password",
        {
          token,
          password,
        }
      );

      navigate("/login", {
        replace: true,
        state: {
          message:
            "Password reset successfully. You can now log in.",
        },
      });

    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Could not reset your password."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      title="Create New Password"
      subtitle="Choose a new password for your garden."
    >

      <form
        onSubmit={handleSubmit}
        className="space-y-5"
      >

        <Field
          label="New Password"
          type="password"
          value={password}
          onChange={setPassword}
          placeholder="••••••••"
        />

        <Field
          label="Confirm Password"
          type="password"
          value={confirmPassword}
          onChange={setConfirmPassword}
          placeholder="••••••••"
        />

        {error && (
          <p className="rounded-xl border border-red-400/30 bg-red-900/20 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        )}

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
          "
        >
          {loading
            ? "Resetting..."
            : "Reset Password"}
        </button>

      </form>

      <p className="mt-7 text-center text-sm text-[#52604f]">

        <Link
          to="/login"
          className="font-semibold text-[#355f35] hover:text-[#1f4321] hover:underline"
        >
          Back to Login
        </Link>

      </p>

    </AuthShell>
  );
}