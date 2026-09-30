import { useState } from "react";
import { Link } from "react-router-dom";

import client from "../api/client.js";
import { AuthShell, Field } from "./Login.jsx";

export default function ForgotPassword() {
  const [email, setEmail] =
    useState("");

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  async function handleSubmit(e) {
    e.preventDefault();

    setMessage("");
    setError("");
    setLoading(true);

    try {
      const res =
        await client.post(
          "/auth/forgot-password",
          {
            email,
          }
        );

      setMessage(
        res.data.message
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
      title="Forgot Password?"
      subtitle="We'll help you grow again."
    >

      <form
        onSubmit={handleSubmit}
        className="space-y-5"
      >

        <Field
          label="Email"
          type="email"
          value={email}
          onChange={setEmail}
          placeholder="you@example.com"
        />

        {message && (
          <p className="rounded-xl border border-green-400/30 bg-green-900/20 px-4 py-3 text-sm text-green-700">
            {message}
          </p>
        )}

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
            ? "Sending..."
            : "Send Reset Link"}
        </button>

      </form>

      <p className="mt-7 text-center text-sm text-[#52604f]">

        Remember your password?{" "}

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