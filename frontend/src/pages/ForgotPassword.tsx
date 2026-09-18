import { useState } from "react";
import type { FormEvent } from "react";
import { Link } from "react-router-dom";

import api from "../services/api";

type ForgotPasswordResponse = {
  message: string;
};

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setMessage("");
    setLoading(true);

    try {
      const response = await api.post<ForgotPasswordResponse>(
        "/api/auth/forgot-password",
        {
          email,
        },
      );

      setMessage(response.data.message);
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
    <div className="min-h-screen bg-[#f4f7f3]">
      <div className="grid min-h-screen lg:grid-cols-[1.08fr_0.92fr]">
        {/* Brand panel */}
        <section className="relative hidden overflow-hidden bg-[#17351f] lg:flex lg:flex-col lg:justify-between">
          <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-[#39734a]/30 blur-3xl" />
          <div className="absolute -bottom-40 -left-20 h-96 w-96 rounded-full bg-[#739b78]/15 blur-3xl" />

          <div className="relative p-12 xl:p-16">
            <Link to="/login" className="inline-flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-lg font-bold text-[#17351f]">
                D
              </div>

              <div>
                <p className="text-sm font-bold tracking-tight text-white">
                  Darukaa.Earth
                </p>

                <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-[#9fbea4]">
                  Environmental intelligence
                </p>
              </div>
            </Link>

            <div className="mt-28 max-w-xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-[#b8d1bc]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#9bc6a2]" />
                Secure account recovery
              </div>

              <h1 className="mt-6 text-5xl font-semibold leading-[1.06] tracking-tight text-white xl:text-6xl">
                Get back to your environmental workspace.
              </h1>

              <p className="mt-7 max-w-lg text-base leading-7 text-[#c6d8ca]">
                Recover access and continue managing conservation projects,
                geographic sites, and biodiversity data.
              </p>

              <div className="mt-10 max-w-lg space-y-3">
                <RecoveryStep
                  number="01"
                  title="Enter your account email"
                  description="Use the email address associated with your workspace."
                />

                <RecoveryStep
                  number="02"
                  title="Use your reset token"
                  description="In development, the generated token is shown in the backend terminal."
                />

                <RecoveryStep
                  number="03"
                  title="Choose a new password"
                  description="Set a new password that meets the platform requirements."
                />
              </div>
            </div>
          </div>

          <div className="relative px-12 pb-10 xl:px-16">
            <div className="flex items-center gap-3 text-xs text-[#8fa994]">
              <span className="h-px w-8 bg-[#607d66]" />
              Geospatial data • Biodiversity • Conservation
            </div>
          </div>
        </section>

        {/* Recovery form */}
        <main className="flex items-center justify-center px-5 py-10 sm:px-8 lg:px-12">
          <div className="w-full max-w-md">
            {/* Mobile brand */}
            <div className="mb-10 lg:hidden">
              <Link to="/login" className="inline-flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#17351f] text-sm font-bold text-white">
                  D
                </div>

                <div>
                  <p className="text-sm font-bold text-[#17351f]">
                    Darukaa.Earth
                  </p>

                  <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-gray-400">
                    Environmental intelligence
                  </p>
                </div>
              </Link>
            </div>

            <div className="mb-7">
              <Link
                to="/login"
                className="inline-flex items-center gap-2 text-sm font-semibold text-[#39734a] transition hover:text-[#17351f]"
              >
                <span>←</span>
                Back to sign in
              </Link>

              <div className="mt-8 flex h-10 w-10 items-center justify-center rounded-xl bg-[#eaf2eb] text-sm text-[#39734a]">
                ↗
              </div>

              <p className="mt-4 text-xs font-bold uppercase tracking-[0.18em] text-[#39734a]">
                Account recovery
              </p>

              <h2 className="mt-2 text-3xl font-semibold tracking-tight text-[#17351f]">
                Forgot your password?
              </h2>

              <p className="mt-3 text-sm leading-6 text-gray-500">
                Enter your account email and we'll generate instructions to
                reset your password.
              </p>
            </div>

            <form
              onSubmit={handleSubmit}
              className="rounded-3xl border border-[#dfe7e0] bg-white p-6 shadow-sm sm:p-7"
            >
              <div className="space-y-5">
                <div>
                  <label
                    htmlFor="email"
                    className="mb-2 block text-sm font-semibold text-gray-700"
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
                    className="w-full rounded-xl border border-[#d5ded6] bg-white px-4 py-3.5 text-sm text-[#17351f] outline-none transition placeholder:text-gray-400 hover:border-[#bdcabe] focus:border-[#39734a] focus:ring-4 focus:ring-[#39734a]/10"
                  />
                </div>

                {error && (
                  <div
                    role="alert"
                    className="flex items-start gap-3 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm leading-5 text-red-700"
                  >
                    <span className="font-bold">!</span>
                    <span>{error}</span>
                  </div>
                )}

                {message && (
                  <div
                    role="status"
                    className="flex items-start gap-3 rounded-xl border border-[#cfe2d2] bg-[#f0f7f1] px-4 py-3 text-sm leading-6 text-[#285c35]"
                  >
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#39734a] text-xs text-white">
                      ✓
                    </span>

                    <span>{message}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#17351f] px-4 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#24512f] hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading && (
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  )}

                  {loading ? "Generating reset request..." : "Send reset request"}
                </button>
              </div>
            </form>

            {/* Development note */}
            <div className="mt-5 rounded-2xl border border-[#e1e7e2] bg-[#f8faf8] px-4 py-3">
              <div className="flex items-start gap-3">
                <span className="mt-0.5 text-xs font-bold text-[#39734a]">
                  DEV
                </span>

                <p className="text-[11px] leading-5 text-gray-500">
                  For local development, the generated password reset token is
                  printed in the backend terminal because no email provider is
                  configured.
                </p>
              </div>
            </div>

            <p className="mt-7 text-center text-sm text-gray-500">
              Remember your password?{" "}
              <Link
                to="/login"
                className="font-semibold text-[#39734a] transition hover:text-[#17351f]"
              >
                Sign in
              </Link>
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}

function RecoveryStep({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-4 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
      <span className="pt-0.5 text-[10px] font-bold tracking-[0.15em] text-[#8faf94]">
        {number}
      </span>

      <div>
        <p className="text-sm font-semibold text-white">{title}</p>

        <p className="mt-1 text-xs leading-5 text-[#91aa95]">
          {description}
        </p>
      </div>
    </div>
  );
}

export default ForgotPassword;