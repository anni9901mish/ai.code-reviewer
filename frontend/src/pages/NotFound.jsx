import { motion } from "framer-motion";
import { AlertTriangle, ArrowLeft, Home } from "lucide-react";
import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-100 via-white to-blue-100 px-6 dark:from-[#050b16] dark:via-[#07101f] dark:to-[#0b1830]">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-xl rounded-3xl border border-slate-200/70 bg-white/80 p-10 text-center shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.05]"
      >
        <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-red-500/10">
          <AlertTriangle
            size={50}
            className="text-red-500"
          />
        </div>

        <h1 className="mt-6 text-7xl font-black text-slate-900 dark:text-white">
          404
        </h1>

        <h2 className="mt-4 text-2xl font-bold text-slate-800 dark:text-white">
          Page Not Found
        </h2>

        <p className="mt-4 text-slate-500 dark:text-slate-400">
          The page you're looking for doesn't exist or
          has been moved.
        </p>

        <div className="mt-8 flex justify-center gap-4">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-violet-600 px-6 py-3 font-semibold text-white shadow-lg transition hover:-translate-y-1"
          >
            <Home size={18} />
            Dashboard
          </Link>

          <button
            onClick={() => history.back()}
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-300 px-6 py-3 font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-white/10 dark:text-white dark:hover:bg-white/5"
          >
            <ArrowLeft size={18} />
            Go Back
          </button>
        </div>
      </motion.div>
    </div>
  );
}