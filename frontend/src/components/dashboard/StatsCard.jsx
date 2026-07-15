import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";

export default function StatsCard({
  title,
  value,
  change,
  icon: Icon,
  gradient = "from-blue-600 to-indigo-600",
  delay = 0,
}) {
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 20,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        duration: 0.4,
        delay,
      }}
      whileHover={{
        y: -6,
        scale: 1.02,
      }}
      className="relative overflow-hidden rounded-3xl
      border border-slate-200/70
      bg-white/80
      backdrop-blur-xl
      shadow-xl shadow-slate-200/40

      dark:border-white/10
      dark:bg-white/[0.05]
      dark:shadow-black/30"
    >
      <div
        className={`absolute -right-14 -top-14 h-36 w-36 rounded-full bg-gradient-to-br ${gradient} opacity-15 blur-3xl`}
      />

      <div className="relative p-6">

        <div className="flex justify-between items-center">

          <div>

            <p className="text-sm text-slate-500 dark:text-slate-400">
              {title}
            </p>

            <h2 className="mt-4 text-4xl font-black text-slate-900 dark:text-white">
              {value}
            </h2>

            <div className="mt-4 flex items-center gap-2">

              <div
                className="
                flex items-center gap-1
                rounded-full
                bg-emerald-500/10
                px-3 py-1
                text-xs
                font-semibold
                text-emerald-500"
              >
                <ArrowUpRight size={14} />
                {change}
              </div>

            </div>

          </div>

          <div
            className={`rounded-2xl bg-gradient-to-br ${gradient} p-4 text-white shadow-xl`}
          >
            <Icon size={28} />
          </div>

        </div>

      </div>
    </motion.div>
  );
}