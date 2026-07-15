import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Activity,
  AlertTriangle,
  ArrowUpRight,
  CheckCircle2,
  Code2,
  FolderKanban,
  GitBranch,
  LoaderCircle,
  PackageOpen,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

import StatsCard from "../components/dashboard/StatsCard";
import { getDashboard } from "../services/dashboard.service";

const quickActions = [
  {
    title: "Review File",
    description: "Analyze an individual source file",
    path: "/upload",
    icon: Code2,
  },
  {
    title: "Analyze ZIP",
    description: "Review a complete local project",
    path: "/upload",
    icon: PackageOpen,
  },
  {
    title: "GitHub Review",
    description: "Analyze a public GitHub repository",
    path: "/upload",
    icon: GitBranch,
  },
];

function GlassCard({ children, className = "" }) {
  return (
    <div
      className={`rounded-3xl border border-white/70 bg-white/75 shadow-xl shadow-slate-200/40 backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.045] dark:shadow-black/20 ${className}`}
    >
      {children}
    </div>
  );
}

function getReviewStatus(score) {
  if (score === null || score === undefined) {
    return {
      label: "Pending",
      className:
        "bg-slate-500/10 text-slate-600 dark:text-slate-300",
    };
  }

  if (score >= 90) {
    return {
      label: "Excellent",
      className:
        "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    };
  }

  if (score >= 75) {
    return {
      label: "Good",
      className:
        "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    };
  }

  if (score >= 50) {
    return {
      label: "Needs Improvement",
      className:
        "bg-orange-500/10 text-orange-600 dark:text-orange-400",
    };
  }

  return {
    label: "Critical",
    className:
      "bg-red-500/10 text-red-600 dark:text-red-400",
  };
}

function formatDate(dateValue) {
  if (!dateValue) {
    return "Not available";
  }

  return new Date(dateValue).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function Dashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const data = await getDashboard();
        setDashboard(data);
      } catch (error) {
        console.error("DASHBOARD FETCH ERROR:", error);

        toast.error(
          error.response?.data?.message ||
            "Failed to load dashboard data"
        );
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4">
        <div className="rounded-3xl bg-gradient-to-br from-blue-600 to-violet-600 p-5 text-white shadow-xl shadow-blue-500/25">
          <LoaderCircle size={32} className="animate-spin" />
        </div>

        <div className="text-center">
          <h2 className="font-bold text-slate-950 dark:text-white">
            Loading dashboard
          </h2>

          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Fetching your latest code-review insights...
          </p>
        </div>
      </div>
    );
  }

  const recentReviews = dashboard?.recentReviews || [];

  return (
    <div className="space-y-7">
      <motion.section
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col justify-between gap-5 xl:flex-row xl:items-center"
      >
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm font-medium text-blue-600 dark:text-blue-400">
            <Sparkles size={17} />
            AI-powered developer intelligence
          </div>

          <h1 className="text-3xl font-black tracking-tight text-slate-950 dark:text-white sm:text-4xl">
            Dashboard Overview
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">
            Monitor code quality, project health and AI-powered
            review insights from one place.
          </p>
        </div>

        <Link
          to="/upload"
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-violet-600 px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 transition hover:-translate-y-0.5 hover:shadow-xl"
        >
          <GitBranch size={19} />
          Analyze Repository
          <ArrowUpRight size={17} />
        </Link>
      </motion.section>

      <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <StatsCard
          title="Total Projects"
          value={dashboard?.totalProjects ?? 0}
          change={`${dashboard?.totalProjects ?? 0} active`}
          icon={FolderKanban}
          gradient="from-blue-600 to-cyan-500"
          delay={0}
        />

        <StatsCard
          title="Total Reviews"
          value={dashboard?.totalReviews ?? 0}
          change={`${
            dashboard?.totalProjectScans ?? 0
          } project scans`}
          icon={Activity}
          gradient="from-violet-600 to-fuchsia-600"
          delay={0.1}
        />

        <StatsCard
          title="Average Score"
          value={`${dashboard?.averageScore ?? 0}%`}
          change={`${
            dashboard?.totalSingleFileReviews ?? 0
          } file reviews`}
          icon={ShieldCheck}
          gradient="from-emerald-500 to-teal-500"
          delay={0.2}
        />

        <StatsCard
          title="Total Issues"
          value={
            (dashboard?.totalErrors ?? 0) +
            (dashboard?.totalWarnings ?? 0)
          }
          change={`${dashboard?.totalErrors ?? 0} errors`}
          icon={AlertTriangle}
          gradient="from-orange-500 to-red-500"
          delay={0.3}
        />
      </section>

      <section>
        <div className="mb-4">
          <h3 className="text-xl font-bold text-slate-950 dark:text-white">
            Quick Actions
          </h3>

          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Start a new AI-powered code review
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {quickActions.map((action, index) => {
            const Icon = action.icon;

            return (
              <motion.div
                key={action.title}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.08 }}
              >
                <Link to={action.path}>
                  <GlassCard className="group h-full p-5 transition duration-300 hover:-translate-y-1 hover:border-blue-400/40 hover:shadow-2xl">
                    <div className="mb-4 inline-flex rounded-2xl bg-gradient-to-br from-blue-600 to-violet-600 p-3 text-white shadow-lg shadow-blue-500/20">
                      <Icon size={22} />
                    </div>

                    <h4 className="font-bold text-slate-950 dark:text-white">
                      {action.title}
                    </h4>

                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                      {action.description}
                    </p>

                    <div className="mt-4 flex items-center gap-2 text-sm font-semibold text-blue-600 dark:text-blue-400">
                      Start analysis
                      <ArrowUpRight
                        size={16}
                        className="transition group-hover:translate-x-1 group-hover:-translate-y-1"
                      />
                    </div>
                  </GlassCard>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </section>

      <GlassCard className="overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-200/70 px-5 py-5 dark:border-white/10 sm:px-6">
          <div>
            <h3 className="text-lg font-bold text-slate-950 dark:text-white">
              Recent Reviews
            </h3>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Latest analysis results from your projects
            </p>
          </div>

          <Link
            to="/reviews"
            className="text-sm font-semibold text-blue-600 hover:underline dark:text-blue-400"
          >
            View all
          </Link>
        </div>

        {recentReviews.length === 0 ? (
          <div className="flex min-h-60 flex-col items-center justify-center p-8 text-center">
            <div className="rounded-3xl bg-blue-500/10 p-5 text-blue-600 dark:text-blue-400">
              <Code2 size={30} />
            </div>

            <h3 className="mt-4 font-bold text-slate-950 dark:text-white">
              No reviews found
            </h3>

            <p className="mt-1 max-w-md text-sm text-slate-500 dark:text-slate-400">
              Upload a source file, ZIP project or GitHub
              repository to create your first review.
            </p>

            <Link
              to="/upload"
              className="mt-5 rounded-2xl bg-gradient-to-r from-blue-600 to-violet-600 px-5 py-3 text-sm font-bold text-white"
            >
              Start Code Review
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left">
              <thead className="bg-slate-50/80 text-xs uppercase tracking-wide text-slate-500 dark:bg-white/[0.025] dark:text-slate-400">
                <tr>
                  <th className="px-6 py-4">Project</th>
                  <th className="px-6 py-4">Review Type</th>
                  <th className="px-6 py-4">Language</th>
                  <th className="px-6 py-4">Issues</th>
                  <th className="px-6 py-4">Score</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Date</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-200/70 dark:divide-white/10">
                {recentReviews.map((review) => {
                  const reviewStatus = getReviewStatus(
                    review.overallScore
                  );

                  return (
                    <tr
                      key={`${review.type}-${review.id}`}
                      className="transition hover:bg-slate-50/70 dark:hover:bg-white/[0.025]"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="rounded-xl bg-blue-500/10 p-2 text-blue-600 dark:text-blue-400">
                            <Code2 size={18} />
                          </div>

                          <div>
                            <p className="font-semibold text-slate-900 dark:text-white">
                              {review.projectTitle}
                            </p>

                            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                              Project ID: {review.projectId}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <span className="rounded-full bg-violet-500/10 px-3 py-1 text-xs font-semibold text-violet-600 dark:text-violet-400">
                          {review.type}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">
                        {review.language}
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-xs">
                          <span className="rounded-lg bg-red-500/10 px-2 py-1 font-semibold text-red-500">
                            {review.totalErrors ?? 0} errors
                          </span>

                          <span className="rounded-lg bg-orange-500/10 px-2 py-1 font-semibold text-orange-500">
                            {review.totalWarnings ?? 0} warnings
                          </span>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <span className="font-bold text-slate-950 dark:text-white">
                          {review.overallScore !== null &&
                          review.overallScore !== undefined
                            ? `${review.overallScore}/100`
                            : "Pending"}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${reviewStatus.className}`}
                        >
                          <CheckCircle2 size={14} />
                          {reviewStatus.label}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">
                        {formatDate(review.createdAt)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </GlassCard>
    </div>
  );
}