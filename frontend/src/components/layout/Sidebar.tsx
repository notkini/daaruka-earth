import { NavLink, useNavigate } from "react-router-dom";

function Sidebar() {
  const navigate = useNavigate();

  function handleSignOut() {
    localStorage.removeItem("access_token");
    navigate("/login");
  }

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    [
      "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition",
      isActive
        ? "bg-emerald-50 text-emerald-800"
        : "text-slate-500 hover:bg-slate-50 hover:text-slate-800",
    ].join(" ");

  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-slate-200 bg-white lg:flex lg:flex-col">
      {/* Logo */}
      <div className="flex h-20 items-center border-b border-slate-100 px-6">
        <button
          type="button"
          onClick={() => navigate("/dashboard")}
          className="text-left"
        >
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-emerald-700">
            Darukaa
          </p>

          <p className="text-xs font-medium tracking-[0.28em] text-slate-400">
            EARTH
          </p>
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-4 py-6">
        <NavLink to="/dashboard" className={linkClass}>
          <span className="flex h-5 w-5 items-center justify-center text-base">
            ⌂
          </span>

          <span>Dashboard</span>
        </NavLink>

        <NavLink to="/dashboard" className={linkClass}>
          <span className="flex h-5 w-5 items-center justify-center text-base">
            ◈
          </span>

          <span>Projects</span>
        </NavLink>

        <div className="my-6 border-t border-slate-100" />

        <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
          Account
        </p>

        <NavLink to="/settings" className={linkClass}>
          <span className="flex h-5 w-5 items-center justify-center text-base">
            ⚙
          </span>

          <span>Settings</span>
        </NavLink>
      </nav>

      {/* Sign out */}
      <div className="border-t border-slate-100 p-4">
        <button
          type="button"
          onClick={handleSignOut}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-500 transition hover:bg-red-50 hover:text-red-600"
        >
          <span className="flex h-5 w-5 items-center justify-center text-base">
            ↪
          </span>

          <span>Sign out</span>
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;