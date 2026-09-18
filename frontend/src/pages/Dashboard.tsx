import { useEffect, useState } from "react";import type { FormEvent } from "react";
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
    loadProjects();
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
    <div className="min-h-screen bg-[#f5f7f4]">
      <header className="border-b border-[#dfe6e0] bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div>
            <h1 className="text-xl font-semibold text-[#17351f]">
              Darukaa.Earth
            </h1>

            <p className="text-sm text-gray-500">
              Environmental intelligence platform
            </p>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
          >
            Sign out
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-10">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-medium uppercase tracking-wider text-[#39734a]">
              Dashboard
            </p>

            <h2 className="mt-2 text-3xl font-semibold tracking-tight text-[#17351f]">
              Your projects
            </h2>

            <p className="mt-2 text-gray-500">
              Manage environmental projects and their geographic sites.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowForm((current) => !current)}
            className="rounded-lg bg-[#17351f] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#24512f]"
          >
            {showForm ? "Cancel" : "Create project"}
          </button>
        </div>

        {showForm && (
          <section className="mt-8 rounded-2xl border border-[#dfe6e0] bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-[#17351f]">
              Create a project
            </h3>

            <form
              onSubmit={handleCreateProject}
              className="mt-5 space-y-5"
            >
              <div>
                <label
                  htmlFor="project-name"
                  className="mb-2 block text-sm font-medium text-gray-700"
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
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-[#39734a] focus:ring-2 focus:ring-[#39734a]/20"
                />
              </div>

              <div>
                <label
                  htmlFor="project-description"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Description
                </label>

                <textarea
                  id="project-description"
                  rows={4}
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder="Describe the project's environmental goals."
                  className="w-full resize-none rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-[#39734a] focus:ring-2 focus:ring-[#39734a]/20"
                />
              </div>

              {error && (
                <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={creating}
                className="rounded-lg bg-[#39734a] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#2f603e] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {creating ? "Creating..." : "Create project"}
              </button>
            </form>
          </section>
        )}

        <section className="mt-8 grid gap-5 sm:grid-cols-3">
          <div className="rounded-2xl border border-[#dfe6e0] bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-500">Projects</p>
            <p className="mt-2 text-3xl font-semibold text-[#17351f]">
              {projects.length}
            </p>
          </div>

          <div className="rounded-2xl border border-[#dfe6e0] bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-500">Mapped sites</p>
            <p className="mt-2 text-3xl font-semibold text-[#17351f]">
              0
            </p>
          </div>

          <div className="rounded-2xl border border-[#dfe6e0] bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-500">Analytics</p>
            <p className="mt-2 text-3xl font-semibold text-[#17351f]">
              Ready
            </p>
          </div>
        </section>

        {error && !showForm && (
          <div className="mt-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <section className="mt-10">
          <div className="mb-5">
            <h3 className="text-xl font-semibold text-[#17351f]">
              Projects
            </h3>
          </div>

          {loading ? (
            <div className="rounded-2xl border border-[#dfe6e0] bg-white p-8 text-center text-gray-500">
              Loading projects...
            </div>
          ) : projects.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[#cbd6cd] bg-white p-12 text-center">
              <h4 className="text-lg font-semibold text-[#17351f]">
                No projects yet
              </h4>

              <p className="mt-2 text-sm text-gray-500">
                Create your first environmental project to get started.
              </p>

              <button
                type="button"
                onClick={() => setShowForm(true)}
                className="mt-5 rounded-lg bg-[#17351f] px-5 py-3 text-sm font-medium text-white"
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
                  className="text-left"
                >
                  <article className="h-full rounded-2xl border border-[#dfe6e0] bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h4 className="text-lg font-semibold text-[#17351f]">
                          {project.name}
                        </h4>

                        <p className="mt-2 line-clamp-3 text-sm leading-6 text-gray-500">
                          {project.description ||
                            "No project description provided."}
                        </p>
                      </div>

                      <span className="rounded-full bg-[#eef4ef] px-3 py-1 text-xs font-medium text-[#39734a]">
                        Project
                      </span>
                    </div>

                    <div className="mt-6 border-t border-gray-100 pt-4">
                      <p className="text-xs text-gray-400">
                        Created{" "}
                        {new Date(project.created_at).toLocaleDateString()}
                      </p>
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

