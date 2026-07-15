import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

export default function DashboardLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#f4f7fb] text-slate-950 transition-colors dark:bg-[#030712] dark:text-white">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-28 -top-28 h-96 w-96 rounded-full bg-blue-500/10 blur-3xl dark:bg-blue-600/10" />

        <div className="absolute -right-32 top-32 h-96 w-96 rounded-full bg-violet-500/10 blur-3xl dark:bg-violet-600/10" />
      </div>

      <Sidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      <Navbar
        collapsed={collapsed}
        setMobileOpen={setMobileOpen}
      />

      <main
        className={`relative min-h-screen pt-20 transition-all ${
          collapsed ? "lg:pl-[88px]" : "lg:pl-[270px]"
        }`}
      >
        <div className="p-4 sm:p-6 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}