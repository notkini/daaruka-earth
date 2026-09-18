import { useState } from "react";import type { FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

import PasswordInput from "../components/PasswordInput";
import PasswordRequirements, {
  isPasswordStrong,
} from "../components/PasswordRequirements";
import api from "../services/api";

function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const passwordStrong = isPasswordStrong(password);
  const passwordsMatch =
    password.length > 0 &&
    confirmPassword.length > 0 &&
    password === confirmPassword;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!token) {
      setError("This password reset link is missing its reset token.");
      return;
    }

    if (!passwordStrong) {
      setError("Please complete all password requirements.");
      return;
    }

    if (!passwordsMatch) {
      setError("Your passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      await api.post("/api/auth/reset-password", {
        token,
        new_password: password,
      });

      setPassword("");
      setConfirmPassword("");

      setSuccess(
        "Your password has been reset successfully. Redirecting to sign in...",
      );

      setTimeout(() => {
        navigate("/login");
      }, 1800);
    } catch (error: any) {
      console.error("Reset password error:", error);

      const detail = error.response?.data?.detail;

      if (Array.isArray(detail)) {
        setError(detail.join(" "));
      } else {
        setError(detail || "Unable to reset your password.");
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
                Secure account recovery
              </p>

              <h1 className="mt-5 text-5xl font-semibold leading-[1.08] tracking-tight">
                Create a new password.
              </h1>

              <p className="mt-7 max-w-md text-base leading-7 text-emerald-50/65">
                Choose a strong password to secure your Darukaa.Earth account.
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
                Password reset
              </p>

              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-[#17351f]">
                Set a new password
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Create a strong password for your account.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <PasswordInput
                  label="New password"
                  value={password}
                  onChange={setPassword}
                  placeholder="Create a strong password"
                  autoComplete="new-password"
                />

                <PasswordRequirements password={password} />
              </div>

              <div>
                <PasswordInput
                  label="Confirm new password"
                  value={confirmPassword}
                  onChange={setConfirmPassword}
                  placeholder="Repeat your new password"
                  autoComplete="new-password"
                />

                {confirmPassword.length > 0 && (
                  <div
                    className={`mt-2 flex items-center gap-2 text-sm ${
                      passwordsMatch
                        ? "text-emerald-600"
                        : "text-red-500"
                    }`}
                  >
                    <span className="font-bold">
                      {passwordsMatch ? "✓" : "×"}
                    </span>

                    <span>
                      {passwordsMatch
                        ? "Passwords match"
                        : "Passwords do not match"}
                    </span>
                  </div>
                )}
              </div>

              {error && (
                <div
                  role="alert"
                  className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-5 text-red-700"
                >
                  {error}
                </div>
              )}

              {success && (
                <div
                  role="status"
                  className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm leading-6 text-emerald-800"
                >
                  {success}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !passwordStrong || !passwordsMatch}
                className="w-full rounded-xl bg-[#17351f] px-4 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#24512f] hover:shadow-md disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500"
              >
                {loading ? "Resetting password..." : "Reset password"}
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

export default ResetPassword;

