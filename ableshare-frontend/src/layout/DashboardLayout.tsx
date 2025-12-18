import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import type { ReactNode } from "react";

interface DashboardLayoutProps {
  children: ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  return (
    <div className="flex min-h-screen bg-white">
      
      {/* Sidebar */}
      <Sidebar />

      {/* Main content */}
      <div className="flex flex-col flex-1">
        <Topbar />

        <main className="p-6 flex-1 overflow-y-auto bg-white">
          {children}
        </main>
      </div>

    </div>
  );
};

export default DashboardLayout;
