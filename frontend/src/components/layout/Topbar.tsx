import { useNavigate } from "react-router-dom";

function Topbar() {
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-30 border-b border-[#dfe7e0] bg-white/95 backdrop-blur">
      <div className="flex h-16 items-center justify-between px-5 sm:px-6">
        {/* Page context */}
        <div className="flex items-center gap-3">
          <div className="hidden h-8 w-px bg-[#dfe7e0] lg:block" />

          <div>
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-[#39734a]" />

              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#39734a]">
                Darukaa.Earth
              </p>
            </div>

            <p className="mt-0.5 hidden text-xs text-gray-400 sm:block">
              Environmental intelligence platform
            </p>
          </div>
        </div>

        {/* Account */}
        <button
          type="button"
          onClick={() => navigate("/settings")}
          className="group flex items-center gap-3 rounded-xl border border-transparent px-2 py-1.5 transition hover:border-[#dfe7e0] hover:bg-[#f7faf7]"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#e7f2e9] text-xs font-bold text-[#39734a] transition group-hover:bg-[#dbeadf]">
            U
          </div>

          <div className="hidden text-left sm:block">
            <p className="text-xs font-semibold text-[#17351f]">
              Account
            </p>

            <p className="mt-0.5 text-[10px] text-gray-400">
              Profile & settings
            </p>
          </div>

          <span className="hidden text-xs text-gray-300 transition group-hover:translate-x-0.5 group-hover:text-[#39734a] sm:block">
            →
          </span>
        </button>
      </div>
    </header>
  );
}

export default Topbar;