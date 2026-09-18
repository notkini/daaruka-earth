import { useNavigate } from "react-router-dom";

function Topbar() {
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="flex h-16 items-center justify-between px-6">
        {/* Page context */}
        <div>
          <p className="text-sm font-medium text-slate-500">
            Environmental intelligence platform
          </p>
        </div>

        {/* Account */}
        <button
          type="button"
          onClick={() => navigate("/settings")}
          className="flex items-center gap-3 rounded-xl px-2 py-1.5 transition hover:bg-slate-50"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100 text-sm font-semibold text-emerald-800">
            U
          </div>

          <div className="hidden text-left sm:block">
            <p className="text-sm font-semibold text-slate-700">Account</p>

            <p className="text-xs text-slate-400">Settings</p>
          </div>
        </button>
      </div>
    </header>
  );
}

export default Topbar;