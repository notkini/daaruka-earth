import type { ReactNode } from "react";

import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

type AppShellProps = {
  children: ReactNode;
};

function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-[#f5f7f4]">
      <Sidebar />

      <div className="min-h-screen lg:pl-64">
        <Topbar />

        <main className="min-h-[calc(100vh-4rem)]">
          {children}
        </main>
      </div>
    </div>
  );
}

export default AppShell;