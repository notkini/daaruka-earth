import { NavLink, useNavigate } from "react-router-dom";

function Sidebar() {
  const navigate = useNavigate();

  function handleSignOut() {
    localStorage.removeItem("access_token");
    navigate("/login");
  }

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    [
      "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
      isActive
        ? "bg-[#edf5ee] text-[#285c35]"
        : "text-gray-500 hover:bg-[#f6f8f6] hover:text-[#17351f]",
    ].join(" ");

  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-[#dfe7e0] bg-white lg:flex lg:flex-col">
      {/* Brand */}
      <div className="flex h-20 items-center border-b border-[#edf1ed] px-5">
        <button
          type="button"
          onClick={() => navigate("/dashboard")}
          className="group flex items-center gap-3 text-left"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#17351f] text-sm font-bold text-white shadow-sm transition group-hover:bg-[#24512f]">
            D
          </div>

          <div>
            <p className="text-sm font-bold tracking-tight text-[#17351f]">
              Darukaa.Earth
            </p>

            <p className="mt-0.5 text-[9px] font-semibold uppercase tracking-[0.22em] text-[#739077]">
              Environmental intelligence
            </p>
          </div>
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-6">
        <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-[0.16em] text-gray-400">
          Workspace
        </p>

        <div className="space-y-1">
          <NavLink to="/dashboard" className={linkClass}>
            {({ isActive }) => (
              <>
                {isActive && (
                  <span className="absolute left-0 h-5 w-0.5 rounded-full bg-[#39734a]" />
                )}

                <span
                  className={`flex h-8 w-8 items-center justify-center rounded-lg text-sm transition ${
                    isActive
                      ? "bg-white text-[#39734a] shadow-sm"
                      : "bg-transparent text-gray-400 group-hover:text-[#39734a]"
                  }`}
                >
                  ⌂
                </span>

                <span>Dashboard</span>
              </>
            )}
          </NavLink>

          <NavLink to="/dashboard" className={linkClass}>
            {({ isActive }) => (
              <>
                {isActive && (
                  <span className="absolute left-0 h-5 w-0.5 rounded-full bg-[#39734a]" />
                )}

                <span
                  className={`flex h-8 w-8 items-center justify-center rounded-lg text-sm transition ${
                    isActive
                      ? "bg-white text-[#39734a] shadow-sm"
                      : "bg-transparent text-gray-400 group-hover:text-[#39734a]"
                  }`}
                >
                  ◈
                </span>

                <span>Projects</span>
              </>
            )}
          </NavLink>
        </div>

        <div className="my-7 border-t border-[#edf1ed]" />

        <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-[0.16em] text-gray-400">
          Account
        </p>

        <NavLink to="/settings" className={linkClass}>
          {({ isActive }) => (
            <>
              {isActive && (
                <span className="absolute left-0 h-5 w-0.5 rounded-full bg-[#39734a]" />
              )}

              <span
                className={`flex h-8 w-8 items-center justify-center rounded-lg text-sm transition ${
                  isActive
                    ? "bg-white text-[#39734a] shadow-sm"
                    : "bg-transparent text-gray-400 group-hover:text-[#39734a]"
                }`}
              >
                ⚙
              </span>

              <span>Settings</span>
            </>
          )}
        </NavLink>

        {/* Workspace card */}
        <div className="mt-8 rounded-2xl border border-[#dfe7e0] bg-[#f7faf7] p-4">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#39734a]" />

            <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#39734a]">
              Workspace
            </span>
          </div>

          <p className="mt-2 text-xs font-semibold text-[#17351f]">
            Environmental projects
          </p>

          <p className="mt-1 text-[11px] leading-5 text-gray-500">
            Map sites and explore biodiversity data.
          </p>
        </div>
      </nav>

      {/* User / Sign out */}
      <div className="border-t border-[#edf1ed] p-4">
        <div className="mb-3 flex items-center gap-3 rounded-xl bg-[#f8faf8] px-3 py-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#dfece1] text-xs font-bold text-[#39734a]">
            U
          </div>

          <div className="min-w-0">
            <p className="text-xs font-semibold text-[#17351f]">
              Project admin
            </p>

            <p className="truncate text-[10px] text-gray-400">
              Environmental workspace
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleSignOut}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-500 transition hover:bg-red-50 hover:text-red-600"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-transparent text-sm">
            ↪
          </span>

          <span>Sign out</span>
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;