import { useState } from "react";import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";

import PasswordInput from "../components/PasswordInput";
import api from "../services/api";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await api.post("/api/auth/login", {
        email,
        password,
      });

      localStorage.setItem("access_token", response.data.access_token);

      navigate("/dashboard");
    } catch (error: any) {
      console.error("Login error:", error);

      const detail = error.response?.data?.detail;

      if (Array.isArray(detail)) {
        setError(detail.join(" "));
      } else {
        setError(detail || "Invalid email or password.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#f5f7f4]">
      <div className="grid min-h-screen lg:grid-cols-[1.05fr_0.95fr]">
        {/* Left brand panel */}
        <div className="hidden bg-[#17351f] p-12 text-white lg:flex lg:flex-col lg:justify-between">
          <div>
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="text-left"
            >
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-emerald-300">
                Darukaa
              </p>

              <p className="text-xs font-medium uppercase tracking-[0.3em] text-emerald-100/50">
                Earth
              </p>
            </button>

            <div className="mt-24 max-w-xl">
              <p className="text-sm font-medium uppercase tracking-[0.2em] text-emerald-300">
                Environmental intelligence
              </p>

              <h1 className="mt-5 text-5xl font-semibold leading-[1.08] tracking-tight">
                Understand the places worth protecting.
              </h1>

              <p className="mt-7 max-w-md text-base leading-7 text-emerald-50/65">
                Manage conservation projects, map geographic sites, and explore
                biodiversity data in one place.
              </p>

              <div className="mt-10 grid max-w-md grid-cols-3 gap-3">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-lg font-semibold">Maps</p>
                  <p className="mt-1 text-xs text-emerald-100/50">
                    Geospatial sites
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-lg font-semibold">Data</p>
                  <p className="mt-1 text-xs text-emerald-100/50">
                    Biodiversity
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-lg font-semibold">Insights</p>
                  <p className="mt-1 text-xs text-emerald-100/50">
                    Analytics
                  </p>
                </div>
              </div>
            </div>
          </div>

          <p className="text-sm text-emerald-100/35">
            Geospatial data • Biodiversity • Conservation
          </p>
        </div>

        {/* Login area */}
        <div className="flex items-center justify-center px-6 py-12 sm:px-10">
          <div className="w-full max-w-md">
            {/* Mobile brand */}
            <div className="mb-10 lg:hidden">
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-emerald-700">
                Darukaa.Earth
              </p>

              <p className="mt-2 text-xs font-medium uppercase tracking-[0.25em] text-slate-400">
                Environmental intelligence
              </p>
            </div>

            <div className="mb-8">
              <p className="mb-3 text-sm font-semibold uppercase tracking-[0.15em] text-emerald-700">
                Welcome back
              </p>

              <h2 className="text-3xl font-semibold tracking-tight text-[#17351f]">
                Sign in to your workspace
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Continue managing your environmental projects and sites.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Email address
                </label>

                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  autoComplete="email"
                  placeholder="you@example.com"
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                />
              </div>

              {/* Password */}
              <div>
                <PasswordInput
                  label="Password"
                  value={password}
                  onChange={setPassword}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                />

                <div className="mt-2 flex justify-end">
                  <Link
                    to="/forgot-password"
                    className="text-xs font-semibold text-emerald-700 transition hover:text-emerald-800"
                  >
                    Forgot password?
                  </Link>
                </div>
              </div>

              {/* Error */}
              {error && (
                <div
                  role="alert"
                  className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-5 text-red-700"
                >
                  {error}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-[#17351f] px-4 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#24512f] hover:shadow-md disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500"
              >
                {loading ? "Signing in..." : "Sign in"}
              </button>
            </form>

            {/* Divider */}
            <div className="my-7 flex items-center gap-4">
              <div className="h-px flex-1 bg-slate-200" />
              <span className="text-xs text-slate-400">New to Darukaa?</span>
              <div className="h-px flex-1 bg-slate-200" />
            </div>

            {/* Register */}
            <Link
              to="/register"
              className="flex w-full items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-sm font-semibold text-slate-700 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-800"
            >
              Create an account
            </Link>

            <p className="mt-7 text-center text-xs leading-5 text-slate-400">
              By continuing, you agree to use Darukaa.Earth responsibly for
              environmental data and project management.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;

