import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";

import api from "../services/api";

type Project = {
  id: number;
  name: string;
  description: string | null;
  owner_id: number;
  created_at: string;
};

function Dashboard() {
  const navigate = useNavigate();

  const [projects, setProjects] = useState<Project[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  async function loadProjects() {
    try {
      const response = await api.get<Project[]>("/api/projects");
      setProjects(response.data);
    } catch {
      setError("Unable to load projects.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadProjects();
  }, []);

  async function handleCreateProject(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setCreating(true);
    setError("");

    try {
      const response = await api.post<Project>("/api/projects", {
        name,
        description: description || null,
      });

      setProjects((currentProjects) => [
        response.data,
        ...currentProjects,
      ]);

      setName("");
      setDescription("");
      setShowForm(false);
    } catch {
      setError("Unable to create project.");
    } finally {
      setCreating(false);
    }
  }

  function handleLogout() {
    localStorage.removeItem("access_token");
    navigate("/login");
  }

  return (
    <div className="min-h-screen bg-[#f4f7f3] text-[#17351f]">
      {/* Top navigation */}
      <header className="sticky top-0 z-30 border-b border-[#dfe7e0] bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#17351f] text-lg font-bold text-white shadow-sm">
              D
            </div>

            <div>
              <p className="text-[15px] font-bold tracking-tight text-[#17351f]">
                Darukaa.Earth
              </p>
              <p className="text-xs text-gray-500">
                Environmental intelligence
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="rounded-xl border border-[#d7dfd8] bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:border-[#b8c8ba] hover:bg-[#f7faf7]"
          >
            Sign out
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-5 py-8 sm:px-8 sm:py-10">
        {/* Hero */}
        <section className="relative overflow-hidden rounded-3xl bg-[#17351f] px-6 py-8 text-white shadow-sm sm:px-8 sm:py-10">
          <div className="absolute -right-20 -top-24 h-64 w-64 rounded-full bg-[#39734a]/30 blur-2xl" />
          <div className="absolute -bottom-28 right-32 h-52 w-52 rounded-full bg-[#739b78]/20 blur-3xl" />

          <div className="relative flex flex-col justify-between gap-8 md:flex-row md:items-end">
            <div className="max-w-2xl">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-medium text-[#d9eadc]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#9bc6a2]" />
                Project workspace
              </div>

              <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                Environmental projects
              </h1>

              <p className="mt-3 max-w-xl text-sm leading-6 text-[#c9d9cc] sm:text-base">
                Create, map and analyse carbon and biodiversity projects from
                one workspace.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setShowForm((current) => !current);
                setError("");
              }}
              className="relative inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-[#17351f] shadow-sm transition hover:bg-[#f1f6f2]"
            >
              <span className="text-lg leading-none">
                {showForm ? "×" : "+"}
              </span>
              {showForm ? "Close form" : "New project"}
            </button>
          </div>
        </section>

        {/* Metrics */}
        <section className="mt-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-[#dfe7e0] bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-gray-500">Projects</p>
              <span className="rounded-lg bg-[#eef5ef] px-2.5 py-1 text-xs font-semibold text-[#39734a]">
                Workspace
              </span>
            </div>

            <p className="mt-4 text-3xl font-semibold tracking-tight">
              {projects.length}
            </p>

            <p className="mt-1 text-xs text-gray-400">
              Active environmental projects
            </p>
          </div>

          <div className="rounded-2xl border border-[#dfe7e0] bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-gray-500">Mapped sites</p>
              <span className="rounded-lg bg-[#eef5ef] px-2.5 py-1 text-xs font-semibold text-[#39734a]">
                GIS
              </span>
            </div>

            <p className="mt-4 text-3xl font-semibold tracking-tight">—</p>

            <p className="mt-1 text-xs text-gray-400">
              Sites across your projects
            </p>
          </div>

          <div className="rounded-2xl border border-[#dfe7e0] bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-gray-500">Analytics</p>
              <span className="rounded-lg bg-[#eef5ef] px-2.5 py-1 text-xs font-semibold text-[#39734a]">
                GBIF
              </span>
            </div>

            <p className="mt-4 text-2xl font-semibold tracking-tight">
              Available
            </p>

            <p className="mt-1 text-xs text-gray-400">
              Biodiversity intelligence ready
            </p>
          </div>
        </section>

        {/* Create form */}
        {showForm && (
          <section className="mt-6 overflow-hidden rounded-2xl border border-[#d8e2d9] bg-white shadow-sm">
            <div className="border-b border-[#edf1ed] bg-[#fafcf9] px-6 py-5">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#39734a]">
                New project
              </p>

              <h2 className="mt-1 text-xl font-semibold">
                Create an environmental project
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Add a project before defining its geographic sites.
              </p>
            </div>

            <form onSubmit={handleCreateProject} className="space-y-5 p-6">
              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label
                    htmlFor="project-name"
                    className="mb-2 block text-sm font-semibold text-gray-700"
                  >
                    Project name
                  </label>

                  <input
                    id="project-name"
                    type="text"
                    required
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="Western Ghats Restoration"
                    className="w-full rounded-xl border border-[#d5ded6] bg-white px-4 py-3 text-sm text-[#17351f] outline-none transition placeholder:text-gray-400 focus:border-[#39734a] focus:ring-4 focus:ring-[#39734a]/10"
                  />
                </div>

                <div>
                  <label
                    htmlFor="project-description"
                    className="mb-2 block text-sm font-semibold text-gray-700"
                  >
                    Description
                  </label>

                  <input
                    id="project-description"
                    type="text"
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
                    placeholder="Carbon and biodiversity restoration project"
                    className="w-full rounded-xl border border-[#d5ded6] bg-white px-4 py-3 text-sm text-[#17351f] outline-none transition placeholder:text-gray-400 focus:border-[#39734a] focus:ring-4 focus:ring-[#39734a]/10"
                  />
                </div>
              </div>

              {error && (
                <div className="flex items-start gap-3 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
                  <span className="font-bold">!</span>
                  <span>{error}</span>
                </div>
              )}

              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="rounded-xl border border-[#d5ded6] px-5 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={creating}
                  className="rounded-xl bg-[#39734a] px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#2f603e] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {creating ? "Creating project..." : "Create project"}
                </button>
              </div>
            </form>
          </section>
        )}

        {/* Error */}
        {error && !showForm && (
          <div className="mt-6 flex items-center gap-3 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
            <span className="font-bold">!</span>
            {error}
          </div>
        )}

        {/* Projects */}
        <section className="mt-10">
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#39734a]">
                Workspace
              </p>

              <h2 className="mt-1 text-2xl font-semibold tracking-tight">
                Your projects
              </h2>
            </div>

            {projects.length > 0 && (
              <p className="text-sm text-gray-500">
                {projects.length}{" "}
                {projects.length === 1 ? "project" : "projects"}
              </p>
            )}
          </div>

          {loading ? (
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="h-52 animate-pulse rounded-2xl border border-[#dfe7e0] bg-white"
                />
              ))}
            </div>
          ) : projects.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-[#c9d6cb] bg-white px-6 py-16 text-center shadow-sm">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#eef5ef] text-2xl text-[#39734a]">
                +
              </div>

              <h3 className="mt-5 text-lg font-semibold">
                Start your first project
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
                Create an environmental project and start defining the
                geographic areas you want to analyse.
              </p>

              <button
                type="button"
                onClick={() => setShowForm(true)}
                className="mt-6 rounded-xl bg-[#17351f] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#24512f]"
              >
                Create project
              </button>
            </div>
          ) : (
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {projects.map((project) => (
                <button
                  key={project.id}
                  type="button"
                  onClick={() => navigate(`/projects/${project.id}`)}
                  className="group text-left"
                >
                  <article className="relative h-full overflow-hidden rounded-2xl border border-[#dfe7e0] bg-white p-6 shadow-sm transition duration-200 group-hover:-translate-y-1 group-hover:border-[#c3d3c5] group-hover:shadow-lg">
                    <div className="absolute inset-x-0 top-0 h-1 bg-[#39734a] opacity-0 transition group-hover:opacity-100" />

                    <div className="flex items-start justify-between gap-4">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#eef5ef] text-sm font-bold text-[#39734a]">
                        {project.name.charAt(0).toUpperCase()}
                      </div>

                      <span className="rounded-full border border-[#dce8de] bg-[#f7faf7] px-3 py-1 text-[11px] font-semibold text-[#39734a]">
                        PROJECT
                      </span>
                    </div>

                    <h3 className="mt-5 line-clamp-2 text-lg font-semibold tracking-tight text-[#17351f]">
                      {project.name}
                    </h3>

                    <p className="mt-2 line-clamp-3 text-sm leading-6 text-gray-500">
                      {project.description ||
                        "No project description provided."}
                    </p>

                    <div className="mt-6 flex items-center justify-between border-t border-[#edf1ed] pt-4">
                      <p className="text-xs text-gray-400">
                        Created{" "}
                        {new Date(project.created_at).toLocaleDateString(
                          undefined,
                          {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          },
                        )}
                      </p>

                      <span className="text-sm font-semibold text-[#39734a] transition group-hover:translate-x-1">
                        Open →
                      </span>
                    </div>
                  </article>
                </button>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default Dashboard;