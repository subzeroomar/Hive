// src/pages/AuthPage.jsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function AuthPage({ mode = "login" }) {
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      if (mode === "register") {
        await register({ username, email, password });
      } else {
        await login({ email, password });
      }
      navigate("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-obsidian flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-obsidian-light border border-obsidian-border rounded-2xl p-8 shadow-xl">
        <h1 className="text-2xl font-bold text-almond mb-1">
          {mode === "login" ? "Log in to HIVE" : "Create your HIVE account"}
        </h1>
        <p className="text-sm text-almond-muted mb-6">
          Join communities, vote, and discuss.
        </p>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/40 text-red-400 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "register" && (
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full px-4 py-2.5 rounded-lg bg-obsidian border border-obsidian-border text-sm text-almond placeholder-almond-muted focus:outline-none focus:border-almond"
            />
          )}
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-2.5 rounded-lg bg-obsidian border border-obsidian-border text-sm text-almond placeholder-almond-muted focus:outline-none focus:border-almond"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-4 py-2.5 rounded-lg bg-obsidian border border-obsidian-border text-sm text-almond placeholder-almond-muted focus:outline-none focus:border-almond"
          />
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2.5 rounded-full bg-almond text-obsidian hover:bg-almond-dark font-semibold text-sm transition disabled:opacity-50"
          >
            {submitting
              ? "Please wait..."
              : mode === "login"
              ? "Log In"
              : "Sign Up"}
          </button>
        </form>

        <p className="text-xs text-almond-muted text-center mt-5">
          {mode === "login" ? (
            <>
              Don&apos;t have an account?{" "}
              <Link to="/register" className="text-almond hover:underline">
                Sign Up
              </Link>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <Link to="/login" className="text-almond hover:underline">
                Log In
              </Link>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
