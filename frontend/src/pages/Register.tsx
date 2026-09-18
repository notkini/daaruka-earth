import { useState } from "react";import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";

import PasswordInput from "../components/PasswordInput";
import PasswordRequirements, {
  isPasswordStrong,
} from "../components/PasswordRequirements";
import api from "../services/api";

function Register() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const passwordStrong = isPasswordStrong(password);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError("");
    setLoading(true);

    if (!passwordStrong) {
      setError(
        "Please complete all password requirements.",
      );
      setLoading(false);
      return;
    }

    try {
      const response = await api.post(
        "/api/auth/register",
        {
          email,
          password,
        },
      );

      localStorage.setItem(
        "access_token",
        response.data.access_token,
      );

      navigate("/dashboard");
    } catch (error: any) {
      console.error("Registration error:", error);

      const detail = error.response?.data?.detail;

      if (Array.isArray(detail)) {
        setError(detail.join(" "));
      } else {
        setError(
          detail ||
            "Unable to create your account. Please try again.",
        );
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#f5f7f4]">
      <div className="grid min-h-screen lg:grid-cols-2">
        <div className="hidden bg-[#17351f] p-12 text-white lg:flex lg:flex-col lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-300">
              Darukaa.Earth
            </p>

            <div className="mt-20 max-w-lg">
              <p className="text-sm font-medium uppercase tracking-widest text-emerald-300">
                Environmental intelligence
              </p>

              <h1 className="mt-5 text-5xl font-semibold leading-tight tracking-tight">
                Understand the places worth protecting.
              </h1>

              <p className="mt-6 max-w-md text-base leading-7 text-emerald-50/70">
                Manage conservation projects, map geographic
                sites, and explore biodiversity data in one
                place.
              </p>
            </div>
          </div>

          <div className="text-sm text-emerald-100/50">
            Geospatial data • Biodiversity • Conservation
          </div>
        </div>

        <div className="flex items-center justify-center px-6 py-12 sm:px-10">
          <div className="w-full max-w-md">
            <div className="mb-8 lg:hidden">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#39734a]">
                Darukaa.Earth
              </p>
            </div>

            <div className="mb-8">
              <h2 className="text-3xl font-semibold tracking-tight text-[#17351f]">
                Create your account
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Start managing your environmental projects.
              </p>
            </div>

            <form
              onSubmit={handleSubmit}
              className="space-y-5"
            >
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
                  onChange={(event) =>
                    setEmail(event.target.value)
                  }
                  autoComplete="email"
                  placeholder="you@example.com"
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                />
              </div>

              <div>
                <PasswordInput
                  label="Password"
                  value={password}
                  onChange={setPassword}
                  placeholder="Create a strong password"
                  autoComplete="new-password"
                />

                <PasswordRequirements
                  password={password}
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

              <button
                type="submit"
                disabled={
                  loading || !passwordStrong
                }
                className="w-full rounded-xl bg-[#17351f] px-4 py-3.5 text-sm font-semibold text-white transition hover:bg-[#24512f] disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500"
              >
                {loading
                  ? "Creating account..."
                  : "Create account"}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-slate-500">
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-semibold text-[#39734a] hover:text-[#24512f]"
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

export default Register;

