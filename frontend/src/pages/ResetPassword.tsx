import { useState } from "react";
import type { FormEvent } from "react";
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
                Create a new password.
              </h1>

              <p className="mt-7 max-w-lg text-base leading-7 text-[#c6d8ca]">
                Choose a strong password and get back to managing your
                environmental workspace.
              </p>

              <div className="mt-10 max-w-lg space-y-3">
                <SecurityItem
                  number="01"
                  title="Strong protection"
                  description="Use a password that meets all security requirements."
                />

                <SecurityItem
                  number="02"
                  title="Confirm your password"
                  description="Make sure your new password is entered correctly."
                />

                <SecurityItem
                  number="03"
                  title="Return to your workspace"
                  description="Sign in again once your password has been updated."
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

        {/* Reset form */}
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
                🔒
              </div>

              <p className="mt-4 text-xs font-bold uppercase tracking-[0.18em] text-[#39734a]">
                Password reset
              </p>

              <h2 className="mt-2 text-3xl font-semibold tracking-tight text-[#17351f]">
                Set a new password
              </h2>

              <p className="mt-3 text-sm leading-6 text-gray-500">
                Create a strong password for your Darukaa.Earth account.
              </p>
            </div>

            <form
              onSubmit={handleSubmit}
              className="rounded-3xl border border-[#dfe7e0] bg-white p-6 shadow-sm sm:p-7"
            >
              <div className="space-y-5">
                {/* New password */}
                <div>
                  <PasswordInput
                    label="New password"
                    value={password}
                    onChange={setPassword}
                    placeholder="Create a strong password"
                    autoComplete="new-password"
                  />

                  <div className="mt-3 rounded-xl border border-[#e5ebe6] bg-[#f8faf8] p-3">
                    <PasswordRequirements password={password} />
                  </div>
                </div>

                {/* Confirm password */}
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
                      className={`mt-2 flex items-center gap-2 text-xs font-medium ${
                        passwordsMatch ? "text-[#39734a]" : "text-red-500"
                      }`}
                    >
                      <span
                        className={`flex h-5 w-5 items-center justify-center rounded-full text-xs ${
                          passwordsMatch
                            ? "bg-[#eaf2eb]"
                            : "bg-red-50"
                        }`}
                      >
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

                {/* Missing token */}
                {!token && (
                  <div
                    role="alert"
                    className="flex items-start gap-3 rounded-xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm leading-5 text-amber-800"
                  >
                    <span className="font-bold">!</span>

                    <span>
                      This page needs a valid password reset token. Start from
                      the password recovery flow.
                    </span>
                  </div>
                )}

                {/* Error */}
                {error && (
                  <div
                    role="alert"
                    className="flex items-start gap-3 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm leading-5 text-red-700"
                  >
                    <span className="font-bold">!</span>

                    <span>{error}</span>
                  </div>
                )}

                {/* Success */}
                {success && (
                  <div
                    role="status"
                    className="flex items-start gap-3 rounded-xl border border-[#cfe2d2] bg-[#f0f7f1] px-4 py-3 text-sm leading-6 text-[#285c35]"
                  >
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#39734a] text-xs text-white">
                      ✓
                    </span>

                    <span>{success}</span>
                  </div>
                )}

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading || !token || !passwordStrong || !passwordsMatch}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#17351f] px-4 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#24512f] hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading && (
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  )}

                  {loading ? "Resetting password..." : "Reset password"}
                </button>
              </div>
            </form>

            <div className="mt-5 rounded-2xl border border-[#e1e7e2] bg-[#f8faf8] px-4 py-3">
              <div className="flex items-start gap-3">
                <span className="mt-0.5 text-xs font-bold text-[#39734a]">
                  TIP
                </span>

                <p className="text-[11px] leading-5 text-gray-500">
                  Your new password must satisfy every requirement shown above
                  before it can be submitted.
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

function SecurityItem({
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

export default ResetPassword;