import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import client from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";
import { AuthShell, Field } from "./Login.jsx";

export default function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await client.post("/auth/signup", { name, email, password });
      login(res.data.token, res.data.user);
      navigate("/onboarding");
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
  title="Plant Your First Seed"
  subtitle="Create an account and begin your journey."
>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Field label="Name" value={name} onChange={setName} placeholder="Alex" />
        <Field label="Email" type="email" value={email} onChange={setEmail} placeholder="you@example.com" />
        <Field label="Password" type="password" value={password} onChange={setPassword} placeholder="At least 6 characters" />
        {error && <p className="text-sm text-rose-300">{error}</p>}
        <button
          disabled={loading}
          className="mt-2 rounded-full bg-garden-leaf text-garden-bg font-semibold py-3 hover:bg-garden-gold transition-colors disabled:opacity-60"
        >
         {loading ? "Planting your seed..." : "Create Garden"}
        </button>
      </form>
      <p className="mt-7 text-center text-sm text-[#52604f]">
  Already have an account?{" "}
  <Link
    to="/login"
    className="
      font-semibold
      text-[#355f35]
      hover:text-[#1f4321]
      hover:underline
      transition-colors
    "
  >
    Log in
  </Link>
</p>
    </AuthShell>
  );
}
