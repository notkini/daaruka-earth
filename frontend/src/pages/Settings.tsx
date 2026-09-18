import { useEffect, useState } from "react";
import type { FormEvent } from "react";
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

  async function handleChangePassword(event: FormEvent<HTMLFormElement>) {
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
        setError(detail || "Unable to change your password.");
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
      <div className="min-h-screen bg-[#f4f7f3]">
        <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8 lg:px-10">
          <div className="animate-pulse">
            <div className="h-4 w-20 rounded bg-[#dfe7e0]" />
            <div className="mt-4 h-9 w-44 rounded-lg bg-[#dfe7e0]" />
            <div className="mt-3 h-4 w-72 rounded bg-[#e5ebe6]" />

            <div className="mt-10 grid gap-6 lg:grid-cols-[220px_1fr]">
              <div className="hidden h-48 rounded-2xl bg-white lg:block" />

              <div className="space-y-6">
                <div className="h-32 rounded-3xl bg-white" />
                <div className="h-[500px] rounded-3xl bg-white" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f4f7f3]">
      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-[#dfe7e0] bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 sm:px-8 lg:px-10">
          <div>
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="mb-1 inline-flex items-center gap-2 text-xs font-semibold text-[#39734a] transition hover:text-[#17351f]"
            >
              <span>←</span>
              Back
            </button>

            <h1 className="text-2xl font-semibold tracking-tight text-[#17351f]">
              Settings
            </h1>

            <p className="mt-1 hidden text-sm text-gray-500 sm:block">
              Manage your account and security.
            </p>
          </div>

          <button
            type="button"
            onClick={handleSignOut}
            className="rounded-xl border border-[#d5ded6] bg-white px-4 py-2.5 text-sm font-semibold text-gray-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
          >
            Sign out
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-5 py-8 sm:px-8 lg:px-10">
        <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
          {/* Settings navigation */}
          <aside className="hidden lg:block">
            <div className="sticky top-28 rounded-2xl border border-[#dfe7e0] bg-white p-3 shadow-sm">
              <div className="rounded-xl bg-[#edf5ee] px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#39734a] text-sm font-semibold text-white">
                    A
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-[#285c35]">
                      Account
                    </p>

                    <p className="mt-0.5 text-[11px] text-[#5f8065]">
                      Profile & security
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-3 rounded-xl px-4 py-3">
                <p className="text-xs font-medium text-gray-400">
                  ACCOUNT SETTINGS
                </p>

                <p className="mt-2 text-xs leading-5 text-gray-500">
                  Manage your profile information and password from this page.
                </p>
              </div>
            </div>
          </aside>

          <div className="space-y-6">
            {/* Profile */}
            <section className="overflow-hidden rounded-3xl border border-[#dfe7e0] bg-white shadow-sm">
              <div className="border-b border-[#edf1ed] px-6 py-5 sm:px-7">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#edf5ee] text-sm text-[#39734a]">
                    @
                  </div>

                  <div>
                    <h2 className="text-lg font-semibold text-[#17351f]">
                      Profile
                    </h2>

                    <p className="mt-0.5 text-sm text-gray-500">
                      Your account information.
                    </p>
                  </div>
                </div>
              </div>

              <div className="px-6 py-6 sm:px-7">
                <div className="rounded-2xl border border-[#e5ebe6] bg-[#f8faf8] p-4">
                  <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-gray-400">
                    Email address
                  </p>

                  <div className="mt-2 flex items-center justify-between gap-4">
                    <p className="break-all text-sm font-semibold text-[#17351f]">
                      {user?.email || "Unknown"}
                    </p>

                    <span className="shrink-0 rounded-full bg-[#e7f2e9] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-[#39734a]">
                      Account
                    </span>
                  </div>
                </div>
              </div>
            </section>

            {/* Security */}
            <section className="overflow-hidden rounded-3xl border border-[#dfe7e0] bg-white shadow-sm">
              <div className="border-b border-[#edf1ed] px-6 py-5 sm:px-7">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#edf5ee] text-sm text-[#39734a]">
                    🔒
                  </div>

                  <div>
                    <h2 className="text-lg font-semibold text-[#17351f]">
                      Security
                    </h2>

                    <p className="mt-0.5 text-sm text-gray-500">
                      Update your password to keep your account secure.
                    </p>
                  </div>
                </div>
              </div>

              <form
                onSubmit={handleChangePassword}
                className="space-y-5 px-6 py-6 sm:px-7"
              >
                <div>
                  <PasswordInput
                    label="Current password"
                    value={currentPassword}
                    onChange={setCurrentPassword}
                    placeholder="Enter your current password"
                    autoComplete="current-password"
                  />
                </div>

                <div className="h-px bg-[#edf1ed]" />

                <div>
                  <PasswordInput
                    label="New password"
                    value={newPassword}
                    onChange={setNewPassword}
                    placeholder="Create a new strong password"
                    autoComplete="new-password"
                  />

                  <div className="mt-3 rounded-xl border border-[#e5ebe6] bg-[#f8faf8] p-3">
                    <PasswordRequirements password={newPassword} />
                  </div>
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
                      className={`mt-2 flex items-center gap-2 text-xs font-medium ${
                        passwordsMatch ? "text-[#39734a]" : "text-red-500"
                      }`}
                    >
                      <span
                        className={`flex h-5 w-5 items-center justify-center rounded-full ${
                          passwordsMatch ? "bg-[#eaf2eb]" : "bg-red-50"
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

                {error && (
                  <div
                    role="alert"
                    className="flex items-start gap-3 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm leading-5 text-red-700"
                  >
                    <span className="font-bold">!</span>
                    <span>{error}</span>
                  </div>
                )}

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

                <div className="flex flex-col gap-3 border-t border-[#edf1ed] pt-5 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-xs leading-5 text-gray-400">
                    Choose a password that meets all the requirements above.
                  </p>

                  <button
                    type="submit"
                    disabled={
                      changingPassword ||
                      !passwordStrong ||
                      !passwordsMatch ||
                      currentPassword.length === 0
                    }
                    className="flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[#17351f] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#24512f] hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {changingPassword && (
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    )}

                    {changingPassword
                      ? "Changing password..."
                      : "Change password"}
                  </button>
                </div>
              </form>
            </section>

            {/* Account */}
            <section className="overflow-hidden rounded-3xl border border-red-100 bg-white shadow-sm">
              <div className="px-6 py-6 sm:px-7">
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-50 text-sm text-red-500">
                    ↪
                  </div>

                  <div>
                    <h2 className="text-lg font-semibold text-[#17351f]">
                      Account
                    </h2>

                    <p className="mt-1 text-sm leading-6 text-gray-500">
                      Sign out of your Darukaa.Earth account on this device.
                    </p>

                    <button
                      type="button"
                      onClick={handleSignOut}
                      className="mt-5 rounded-xl border border-red-200 px-5 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                    >
                      Sign out
                    </button>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Settings;