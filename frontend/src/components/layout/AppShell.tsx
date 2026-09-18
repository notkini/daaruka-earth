import type { ReactNode } from "react";

import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

type AppShellProps = {
  children: ReactNode;
};

function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-[#f4f7f3] text-[#17351f]">
      <Sidebar />

      <div className="min-h-screen lg:pl-64">
        <Topbar />

        <main className="min-h-[calc(100vh-4rem)] overflow-x-hidden">
          <div className="mx-auto w-full max-w-[1600px]">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

export default AppShell;