import {
  BarChart3,
  ChevronLeft,
  ChevronRight,
  Code2,
  FileCode2,
  FolderKanban,
  GitBranch,
  History,
  LayoutDashboard,
  LogOut,
  PackageOpen,
  Settings,
} from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";

const menuItems = [
  {
    name: "Dashboard",
    path: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Projects",
    path: "/projects",
    icon: FolderKanban,
  },
  {
    name: "File Review",
    path: "/upload",
    icon: FileCode2,
  },
  {
    name: "ZIP Analysis",
    path: "/zip-analysis",
    icon: PackageOpen,
  },
  {
  name: "GitHub Review",
  path: "/github-analysis",
  icon: GitBranch,
},
  {
    name: "Review History",
    path: "/reviews",
    icon: History,
  },
  {
    name: "Analytics",
    path: "/analytics",
    icon: BarChart3,
  },
];

export default function Sidebar({
  collapsed,
  setCollapsed,
  mobileOpen,
  setMobileOpen,
}) {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <>
      {mobileOpen && (
        <button
          type="button"
          aria-label="Close sidebar overlay"
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <motion.aside
        animate={{
          width: collapsed ? 88 : 270,
        }}
        transition={{
          duration: 0.25,
          ease: "easeInOut",
        }}
        className={`fixed left-0 top-0 z-50 flex h-screen flex-col border-r border-slate-200/70 bg-white/90 shadow-2xl shadow-slate-300/20 backdrop-blur-2xl dark:border-white/10 dark:bg-[#07101f]/90 dark:shadow-black/30
        ${
          mobileOpen
            ? "translate-x-0"
            : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="flex h-20 items-center justify-between border-b border-slate-200/70 px-5 dark:border-white/10">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/30">
              <Code2 size={24} />
            </div>

            {!collapsed && (
              <div className="min-w-0">
                <h1 className="truncate text-lg font-bold text-slate-950 dark:text-white">
                  CodeInsight AI
                </h1>
                <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                  Intelligent Code Review
                </p>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => setCollapsed((value) => !value)}
            className="hidden rounded-xl border border-slate-200 bg-slate-50 p-2 text-slate-600 transition hover:bg-slate-100 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10 lg:block"
          >
            {collapsed ? (
              <ChevronRight size={18} />
            ) : (
              <ChevronLeft size={18} />
            )}
          </button>
        </div>

        <nav className="flex-1 space-y-2 overflow-y-auto p-4">
          {menuItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `group flex items-center gap-3 rounded-2xl px-3 py-3.5 text-sm font-medium transition-all ${
                    isActive
                      ? "bg-gradient-to-r from-blue-600 to-violet-600 text-white shadow-lg shadow-blue-500/25"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-400 dark:hover:bg-white/5 dark:hover:text-white"
                  }`
                }
              >
                <Icon size={20} className="shrink-0" />

                {!collapsed && (
                  <span className="truncate">{item.name}</span>
                )}
              </NavLink>
            );
          })}
        </nav>

        <div className="space-y-2 border-t border-slate-200/70 p-4 dark:border-white/10">
          <NavLink
            to="/settings"
            className="flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-950 dark:text-slate-400 dark:hover:bg-white/5 dark:hover:text-white"
          >
            <Settings size={20} />

            {!collapsed && <span>Settings</span>}
          </NavLink>

          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-sm font-medium text-red-500 transition hover:bg-red-500/10"
          >
            <LogOut size={20} />

            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </motion.aside>
    </>
  );
}