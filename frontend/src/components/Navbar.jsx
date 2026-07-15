import {
  Bell,
  Menu,
  Moon,
  Search,
  Sparkles,
  Sun,
} from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";

export default function Navbar({
  collapsed,
  setMobileOpen,
}) {
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();

  const firstLetter =
    user?.name?.trim()?.charAt(0)?.toUpperCase() || "U";

  return (
    <header
      className={`fixed top-0 right-0 left-0 z-30 h-20 border-b border-slate-200/70 bg-white/80 backdrop-blur-2xl transition-all duration-300 dark:border-white/10 dark:bg-[#050b16]/80 ${
        collapsed ? "lg:left-[88px]" : "lg:left-[270px]"
      }`}
    >
      <div className="flex h-full items-center justify-between gap-4 px-4 sm:px-6">
        {/* Left */}
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="rounded-xl border border-slate-200 bg-white p-2.5 text-slate-700 shadow-sm transition hover:shadow-lg dark:border-white/10 dark:bg-white/5 dark:text-white lg:hidden"
          >
            <Menu size={20} />
          </button>

          <div className="hidden w-[430px] items-center gap-3 rounded-2xl border border-slate-200/70 bg-white/80 px-4 py-3 shadow-md backdrop-blur-xl transition-all focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/10 dark:border-white/10 dark:bg-white/[0.05] xl:flex">
            <Search
              size={18}
              className="text-slate-400"
            />

            <input
              type="text"
              placeholder="Search projects, reviews, repositories..."
              className="w-full bg-transparent text-sm font-medium text-slate-900 outline-none placeholder:text-slate-400 dark:text-white"
            />
          </div>

          <div className="hidden items-center gap-2 xl:flex">
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              <Sparkles size={12} />
              AI Online
            </span>

            <span className="rounded-full bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-600 dark:text-blue-400">
              v1.0.0
            </span>
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={toggleTheme}
            className="rounded-2xl border border-slate-200/70 bg-white/80 p-3 text-slate-700 shadow-md backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-white/10 dark:bg-white/[0.05] dark:text-white"
          >
            {theme === "dark" ? (
              <Sun size={20} />
            ) : (
              <Moon size={20} />
            )}
          </button>

          <button
            type="button"
            className="relative rounded-2xl border border-slate-200/70 bg-white/80 p-3 text-slate-700 shadow-md backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-white/10 dark:bg-white/[0.05] dark:text-white"
          >
            <Bell size={20} />

            <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-lg">
              3
            </span>
          </button>

          <div className="ml-1 flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-white/80 px-3 py-2 shadow-md backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-white/10 dark:bg-white/[0.05]">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 via-violet-600 to-purple-600 text-lg font-bold text-white shadow-lg shadow-blue-500/30">
              {firstLetter}
            </div>

            <div className="hidden md:block">
              <p className="max-w-36 truncate text-sm font-bold text-slate-900 dark:text-white">
                {user?.name || "User"}
              </p>

              <p className="max-w-36 truncate text-xs text-slate-500 dark:text-slate-400">
                {user?.email || "Developer"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}