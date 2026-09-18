import { useEffect, useState } from "react";import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";

import PasswordInput from "../components/PasswordInput";
import PasswordRequirements, {
  isPasswordStrong,
} from "../components/PasswordRequirements";
import api from "../services/api";

type CurrentUser = {
  id: number;
  email: string;
  created_at: string;
};

function Settings() {
  const navigate = useNavigate();

  const [user, setUser] = useState<CurrentUser | null>(null);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loadingUser, setLoadingUser] = useState(true);
  const [changingPassword, setChangingPassword] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const passwordStrong = isPasswordStrong(newPassword);
  const passwordsMatch =
    newPassword.length > 0 &&
    confirmPassword.length > 0 &&
    newPassword === confirmPassword;

  useEffect(() => {
    async function loadUser() {
      try {
        const response = await api.get<CurrentUser>("/api/auth/me");
        setUser(response.data);
      } catch (error) {
        console.error("Failed to load user:", error);
        setError("Unable to load your account information.");
      } finally {
        setLoadingUser(false);
      }
    }

    loadUser();
  }, []);

  async function handleChangePassword(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!passwordStrong) {
      setError("Please complete all password requirements.");
      return;
    }

    if (!passwordsMatch) {
      setError("New passwords do not match.");
      return;
    }

    if (currentPassword.length === 0) {
      setError("Please enter your current password.");
      return;
    }

    setChangingPassword(true);

    try {
      await api.post("/api/auth/change-password", {
        current_password: currentPassword,
        new_password: newPassword,
      });

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      setSuccess("Your password has been changed successfully.");
    } catch (error: any) {
      console.error("Change password error:", error);

      const detail = error.response?.data?.detail;

      if (Array.isArray(detail)) {
        setError(detail.join(" "));
      } else {
        setError(
          detail || "Unable to change your password.",
        );
      }
    } finally {
      setChangingPassword(false);
    }
  }

  function handleSignOut() {
    localStorage.removeItem("access_token");
    navigate("/login");
  }

  if (loadingUser) {
    return (
      <div className="min-h-screen bg-[#f5f7f4]">
        <div className="mx-auto max-w-5xl px-6 py-10">
          <div className="animate-pulse">
            <div className="h-8 w-40 rounded bg-slate-200" />
            <div className="mt-3 h-4 w-72 rounded bg-slate-200" />

            <div className="mt-10 h-64 rounded-2xl bg-white" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f7f4]">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">
          <div>
            <button
              onClick={() => navigate(-1)}
              className="mb-2 text-sm font-medium text-emerald-700 transition hover:text-emerald-800"
            >
              ← Back
            </button>

            <h1 className="text-2xl font-bold tracking-tight text-[#17351f]">
              Settings
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Manage your account and security.
            </p>
          </div>

          <button
            onClick={handleSignOut}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
          >
            Sign out
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-8">
        <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
          {/* Settings navigation */}
          <aside className="hidden lg:block">
            <div className="sticky top-6 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
              <div className="rounded-xl bg-emerald-50 px-4 py-3">
                <p className="text-sm font-semibold text-emerald-800">
                  Account
                </p>

                <p className="mt-1 text-xs text-emerald-700">
                  Profile & security
                </p>
              </div>
            </div>
          </aside>

          <div className="space-y-6">
            {/* Profile */}
            <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-100 px-6 py-5">
                <h2 className="text-lg font-semibold text-[#17351f]">
                  Profile
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Your account information.
                </p>
              </div>

              <div className="px-6 py-6">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Email address
                  </p>

                  <p className="mt-2 text-sm font-medium text-slate-800">
                    {user?.email || "Unknown"}
                  </p>
                </div>
              </div>
            </section>

            {/* Security */}
            <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-100 px-6 py-5">
                <h2 className="text-lg font-semibold text-[#17351f]">
                  Security
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Update your password to keep your account secure.
                </p>
              </div>

              <form
                onSubmit={handleChangePassword}
                className="space-y-5 px-6 py-6"
              >
                <PasswordInput
                  label="Current password"
                  value={currentPassword}
                  onChange={setCurrentPassword}
                  placeholder="Enter your current password"
                  autoComplete="current-password"
                />

                <div>
                  <PasswordInput
                    label="New password"
                    value={newPassword}
                    onChange={setNewPassword}
                    placeholder="Create a new strong password"
                    autoComplete="new-password"
                  />

                  <PasswordRequirements password={newPassword} />
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
                    className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm leading-5 text-emerald-700"
                  >
                    <div className="flex items-center gap-2">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-200 text-xs font-bold text-emerald-800">
                        ✓
                      </span>

                      {success}
                    </div>
                  </div>
                )}

                <div className="flex justify-end border-t border-slate-100 pt-5">
                  <button
                    type="submit"
                    disabled={
                      changingPassword ||
                      !passwordStrong ||
                      !passwordsMatch ||
                      currentPassword.length === 0
                    }
                    className="rounded-xl bg-[#17351f] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#24512f] disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500"
                  >
                    {changingPassword
                      ? "Changing password..."
                      : "Change password"}
                  </button>
                </div>
              </form>
            </section>

            {/* Account */}
            <section className="rounded-2xl border border-red-100 bg-white shadow-sm">
              <div className="px-6 py-5">
                <h2 className="text-lg font-semibold text-[#17351f]">
                  Account
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Sign out of your Darukaa.Earth account.
                </p>

                <button
                  onClick={handleSignOut}
                  className="mt-5 rounded-xl border border-red-200 px-5 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                >
                  Sign out
                </button>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Settings;

