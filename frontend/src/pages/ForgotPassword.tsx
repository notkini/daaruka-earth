import { useState } from "react";import type { FormEvent } from "react";
import { Link } from "react-router-dom";

import api from "../services/api";

type ForgotPasswordResponse = {
  message: string;
  development_reset_url?: string | null;
};

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [resetUrl, setResetUrl] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setMessage("");
    setResetUrl("");
    setLoading(true);

    try {
      const response = await api.post<ForgotPasswordResponse>(
        "/api/auth/forgot-password",
        {
          email,
        },
      );

      setMessage(response.data.message);

      if (response.data.development_reset_url) {
        setResetUrl(response.data.development_reset_url);
      }
    } catch (error: any) {
      console.error("Forgot password error:", error);

      const detail = error.response?.data?.detail;

      if (Array.isArray(detail)) {
        setError(detail.join(" "));
      } else {
        setError(detail || "Unable to process your request.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#f5f7f4]">
      <div className="grid min-h-screen lg:grid-cols-[1.05fr_0.95fr]">
        <div className="hidden bg-[#17351f] p-12 text-white lg:flex lg:flex-col lg:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-emerald-300">
              Darukaa
            </p>

            <p className="text-xs font-medium uppercase tracking-[0.3em] text-emerald-100/50">
              Earth
            </p>

            <div className="mt-24 max-w-xl">
              <p className="text-sm font-medium uppercase tracking-[0.2em] text-emerald-300">
                Account recovery
              </p>

              <h1 className="mt-5 text-5xl font-semibold leading-[1.08] tracking-tight">
                Get back to your environmental workspace.
              </h1>

              <p className="mt-7 max-w-md text-base leading-7 text-emerald-50/65">
                Reset your password and continue managing your projects,
                geographic sites, and biodiversity data.
              </p>
            </div>
          </div>

          <p className="text-sm text-emerald-100/35">
            Geospatial data • Biodiversity • Conservation
          </p>
        </div>

        <div className="flex items-center justify-center px-6 py-12 sm:px-10">
          <div className="w-full max-w-md">
            <div className="mb-8">
              <Link
                to="/login"
                className="text-sm font-medium text-emerald-700 hover:text-emerald-800"
              >
                ← Back to sign in
              </Link>

              <p className="mt-10 text-sm font-semibold uppercase tracking-[0.15em] text-emerald-700">
                Account recovery
              </p>

              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-[#17351f]">
                Forgot your password?
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Enter your email address and we'll help you reset your
                password.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
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

              {error && (
                <div
                  role="alert"
                  className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-5 text-red-700"
                >
                  {error}
                </div>
              )}

              {message && (
                <div
                  role="status"
                  className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm leading-6 text-emerald-800"
                >
                  {message}
                </div>
              )}

              {resetUrl && (
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-amber-800">
                    Development reset link
                  </p>

                  <p className="mt-2 break-all text-xs leading-5 text-amber-900">
                    This link is shown only in local development because no
                    email provider is configured yet.
                  </p>

                  <Link
                    to={resetUrl.replace(window.location.origin, "")}
                    className="mt-3 inline-flex text-sm font-semibold text-amber-900 underline underline-offset-2"
                  >
                    Open password reset
                  </Link>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-[#17351f] px-4 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#24512f] hover:shadow-md disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500"
              >
                {loading ? "Sending request..." : "Send reset link"}
              </button>
            </form>

            <p className="mt-7 text-center text-sm text-slate-500">
              Remember your password?{" "}
              <Link
                to="/login"
                className="font-semibold text-emerald-700 hover:text-emerald-800"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;

