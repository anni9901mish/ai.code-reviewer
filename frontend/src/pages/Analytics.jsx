import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  BarChart3,
  Code2,
  FolderKanban,
  Languages,
  LoaderCircle,
  ShieldCheck,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { toast } from "sonner";

import { getDashboard } from "../services/dashboard.service";
import { getReviews } from "../services/review.service";

const CHART_COLORS = [
  "#2563eb",
  "#7c3aed",
  "#06b6d4",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#ec4899",
  "#6366f1",
];

function GlassCard({ children, className = "" }) {
  return (
    <div
      className={`rounded-3xl border border-white/70 bg-white/80 shadow-xl shadow-slate-200/40 backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.045] dark:shadow-black/20 ${className}`}
    >
      {children}
    </div>
  );
}

function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  gradient,
  delay = 0,
}) {
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 18,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        delay,
      }}
    >
      <GlassCard className="group relative overflow-hidden p-5">
        <div
          className={`absolute -right-12 -top-12 h-36 w-36 rounded-full bg-gradient-to-br ${gradient} opacity-15 blur-3xl transition group-hover:opacity-25`}
        />

        <div className="relative flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
              {title}
            </p>

            <h2 className="mt-3 text-3xl font-black text-slate-950 dark:text-white">
              {value}
            </h2>

            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
              {subtitle}
            </p>
          </div>

          <div
            className={`rounded-2xl bg-gradient-to-br ${gradient} p-3 text-white shadow-lg`}
          >
            <Icon size={22} />
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) {
    return null;
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-xl backdrop-blur-xl dark:border-white/10 dark:bg-[#0b1220]/95">
      {label && (
        <p className="mb-2 text-sm font-bold text-slate-950 dark:text-white">
          {label}
        </p>
      )}

      <div className="space-y-1.5">
        {payload.map((item) => (
          <div
            key={`${item.dataKey}-${item.name}`}
            className="flex items-center justify-between gap-6 text-xs"
          >
            <span className="text-slate-500 dark:text-slate-400">
              {item.name}
            </span>

            <span className="font-bold text-slate-950 dark:text-white">
              {item.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function formatMonth(dateValue) {
  const date = new Date(dateValue);

  return date.toLocaleDateString("en-IN", {
    month: "short",
    year: "2-digit",
  });
}

export default function Analytics() {
  const [dashboard, setDashboard] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        const [dashboardData, reviewData] = await Promise.all([
          getDashboard(),
          getReviews(),
        ]);

        setDashboard(dashboardData);
        setReviews(Array.isArray(reviewData) ? reviewData : []);
      } catch (error) {
        console.error("ANALYTICS LOAD ERROR:", error);

        toast.error(
          error.response?.data?.message ||
            "Failed to load analytics data"
        );
      } finally {
        setLoading(false);
      }
    };

    loadAnalytics();
  }, []);

  const languageData = useMemo(() => {
    const languageMap = new Map();

    reviews.forEach((review) => {
      Object.entries(review.languageSummary || {}).forEach(
        ([language, count]) => {
          languageMap.set(
            language,
            (languageMap.get(language) || 0) + Number(count || 0)
          );
        }
      );
    });

    if (languageMap.size === 0) {
      (dashboard?.languageDistribution || []).forEach((item) => {
        languageMap.set(
          item.language,
          Number(item.count || 0)
        );
      });
    }

    return [...languageMap.entries()]
      .map(([name, value]) => ({
        name,
        value,
      }))
      .sort((first, second) => second.value - first.value);
  }, [reviews, dashboard]);

  const scoreDistribution = useMemo(() => {
    const distribution = {
      Excellent: 0,
      Good: 0,
      "Needs Work": 0,
      Critical: 0,
    };

    reviews.forEach((review) => {
      const score = Number(review.overallScore || 0);

      if (score >= 90) {
        distribution.Excellent += 1;
      } else if (score >= 75) {
        distribution.Good += 1;
      } else if (score >= 50) {
        distribution["Needs Work"] += 1;
      } else {
        distribution.Critical += 1;
      }
    });

    return Object.entries(distribution).map(([name, value]) => ({
      name,
      value,
    }));
  }, [reviews]);

  const scoreTrend = useMemo(() => {
    return [...reviews]
      .sort(
        (first, second) =>
          new Date(first.createdAt) -
          new Date(second.createdAt)
      )
      .map((review, index) => ({
        name: `Scan ${index + 1}`,
        score: Number(review.overallScore || 0),
        errors: Number(review.totalErrors || 0),
        warnings: Number(review.totalWarnings || 0),
        project:
          review.project?.title ||
          review.folderName ||
          "Project",
      }));
  }, [reviews]);

  const monthlyActivity = useMemo(() => {
    const monthMap = new Map();

    reviews.forEach((review) => {
      const month = formatMonth(review.createdAt);

      if (!monthMap.has(month)) {
        monthMap.set(month, {
          month,
          scans: 0,
          files: 0,
          errors: 0,
          warnings: 0,
        });
      }

      const current = monthMap.get(month);

      current.scans += 1;
      current.files += Number(review.totalFiles || 0);
      current.errors += Number(review.totalErrors || 0);
      current.warnings += Number(review.totalWarnings || 0);
    });

    return [...monthMap.values()].slice(-8);
  }, [reviews]);

  const issueData = useMemo(() => {
    return reviews
      .map((review) => ({
        name:
          review.project?.title ||
          review.folderName ||
          `Scan ${review.id}`,
        errors: Number(review.totalErrors || 0),
        warnings: Number(review.totalWarnings || 0),
      }))
      .slice(0, 8);
  }, [reviews]);

  const totalFiles = reviews.reduce(
    (total, review) =>
      total + Number(review.totalFiles || 0),
    0
  );

  const totalErrors = reviews.reduce(
    (total, review) =>
      total + Number(review.totalErrors || 0),
    0
  );

  const totalWarnings = reviews.reduce(
    (total, review) =>
      total + Number(review.totalWarnings || 0),
    0
  );

  const averageScore = reviews.length
    ? Number(
        (
          reviews.reduce(
            (total, review) =>
              total + Number(review.overallScore || 0),
            0
          ) / reviews.length
        ).toFixed(1)
      )
    : 0;

  const bestReview = reviews.reduce((best, review) => {
    if (!best) {
      return review;
    }

    return Number(review.overallScore || 0) >
      Number(best.overallScore || 0)
      ? review
      : best;
  }, null);

  if (loading) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4">
        <div className="rounded-3xl bg-gradient-to-br from-blue-600 to-violet-600 p-5 text-white shadow-xl shadow-blue-500/25">
          <LoaderCircle size={32} className="animate-spin" />
        </div>

        <div className="text-center">
          <h2 className="font-bold text-slate-950 dark:text-white">
            Loading analytics
          </h2>

          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Preparing project quality insights...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-7">
      <motion.section
        initial={{
          opacity: 0,
          y: 18,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
      >
        <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-blue-600 dark:text-blue-400">
          <Sparkles size={17} />
          Live database analytics
        </div>

        <h1 className="text-3xl font-black tracking-tight text-slate-950 dark:text-white sm:text-4xl">
          Code Quality Analytics
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">
          Track project scores, language usage, analysis activity
          and recurring code-quality issues.
        </p>
      </motion.section>

      <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Project Scans"
          value={reviews.length}
          subtitle={`${dashboard?.totalProjects ?? 0} total projects`}
          icon={FolderKanban}
          gradient="from-blue-600 to-cyan-500"
          delay={0}
        />

        <StatCard
          title="Average Score"
          value={`${averageScore}%`}
          subtitle={
            bestReview
              ? `Best score: ${bestReview.overallScore}/100`
              : "No scored reviews"
          }
          icon={ShieldCheck}
          gradient="from-emerald-500 to-teal-500"
          delay={0.08}
        />

        <StatCard
          title="Files Analyzed"
          value={totalFiles}
          subtitle={`${languageData.length} languages detected`}
          icon={Code2}
          gradient="from-violet-600 to-fuchsia-500"
          delay={0.16}
        />

        <StatCard
          title="Total Issues"
          value={totalErrors + totalWarnings}
          subtitle={`${totalErrors} errors, ${totalWarnings} warnings`}
          icon={AlertTriangle}
          gradient="from-orange-500 to-red-500"
          delay={0.24}
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        <GlassCard className="p-5 sm:p-6">
          <div className="mb-6 flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-black text-slate-950 dark:text-white">
                Score Trend
              </h2>

              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                AI review scores across project scans
              </p>
            </div>

            <div className="rounded-2xl bg-blue-500/10 p-3 text-blue-600 dark:text-blue-400">
              <TrendingUp size={21} />
            </div>
          </div>

          <div className="h-80">
            {scoreTrend.length === 0 ? (
              <div className="flex h-full items-center justify-center text-sm text-slate-500">
                No score data available.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={scoreTrend}>
                  <defs>
                    <linearGradient
                      id="scoreGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor="#6366f1"
                        stopOpacity={0.35}
                      />

                      <stop
                        offset="95%"
                        stopColor="#6366f1"
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>

                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    opacity={0.15}
                  />

                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    fontSize={12}
                  />

                  <YAxis
                    domain={[0, 100]}
                    axisLine={false}
                    tickLine={false}
                    fontSize={12}
                  />

                  <Tooltip content={<CustomTooltip />} />

                  <Area
                    type="monotone"
                    dataKey="score"
                    name="Score"
                    stroke="#6366f1"
                    strokeWidth={3}
                    fill="url(#scoreGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </GlassCard>

        <GlassCard className="p-5 sm:p-6">
          <div className="mb-4">
            <h2 className="text-lg font-black text-slate-950 dark:text-white">
              Language Distribution
            </h2>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Languages found across analyzed projects
            </p>
          </div>

          <div className="h-64">
            {languageData.length === 0 ? (
              <div className="flex h-full items-center justify-center text-sm text-slate-500">
                No language data available.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={languageData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={58}
                    outerRadius={90}
                    paddingAngle={4}
                  >
                    {languageData.map((item, index) => (
                      <Cell
                        key={item.name}
                        fill={
                          CHART_COLORS[
                            index % CHART_COLORS.length
                          ]
                        }
                      />
                    ))}
                  </Pie>

                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="space-y-2">
            {languageData.slice(0, 5).map((item, index) => (
              <div
                key={item.name}
                className="flex items-center justify-between rounded-xl bg-slate-100/80 px-3 py-2 text-xs dark:bg-white/5"
              >
                <div className="flex items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{
                      backgroundColor:
                        CHART_COLORS[
                          index % CHART_COLORS.length
                        ],
                    }}
                  />

                  <span className="font-semibold text-slate-600 dark:text-slate-300">
                    {item.name}
                  </span>
                </div>

                <span className="font-black text-slate-950 dark:text-white">
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </GlassCard>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <GlassCard className="p-5 sm:p-6">
          <div className="mb-6 flex items-start justify-between">
            <div>
              <h2 className="text-lg font-black text-slate-950 dark:text-white">
                Errors vs Warnings
              </h2>

              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Issue distribution for recent project scans
              </p>
            </div>

            <AlertCircle className="text-red-500" />
          </div>

          <div className="h-80">
            {issueData.length === 0 ? (
              <div className="flex h-full items-center justify-center text-sm text-slate-500">
                No issue data available.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={issueData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    opacity={0.15}
                  />

                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    fontSize={11}
                  />

                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    fontSize={12}
                  />

                  <Tooltip content={<CustomTooltip />} />
                  <Legend />

                  <Bar
                    dataKey="errors"
                    name="Errors"
                    fill="#ef4444"
                    radius={[8, 8, 0, 0]}
                  />

                  <Bar
                    dataKey="warnings"
                    name="Warnings"
                    fill="#f59e0b"
                    radius={[8, 8, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </GlassCard>

        <GlassCard className="p-5 sm:p-6">
          <div className="mb-6 flex items-start justify-between">
            <div>
              <h2 className="text-lg font-black text-slate-950 dark:text-white">
                Score Distribution
              </h2>

              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Overall project quality categories
              </p>
            </div>

            <ShieldCheck className="text-emerald-500" />
          </div>

          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={scoreDistribution}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  opacity={0.15}
                />

                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  fontSize={11}
                />

                <YAxis
                  allowDecimals={false}
                  axisLine={false}
                  tickLine={false}
                  fontSize={12}
                />

                <Tooltip content={<CustomTooltip />} />

                <Bar
                  dataKey="value"
                  name="Reviews"
                  radius={[10, 10, 0, 0]}
                >
                  {scoreDistribution.map((item, index) => (
                    <Cell
                      key={item.name}
                      fill={[
                        "#10b981",
                        "#2563eb",
                        "#f59e0b",
                        "#ef4444",
                      ][index]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </section>

      <GlassCard className="p-5 sm:p-6">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-black text-slate-950 dark:text-white">
              Monthly Analysis Activity
            </h2>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Scans, analyzed files and detected issues over time
            </p>
          </div>

          <div className="rounded-2xl bg-violet-500/10 p-3 text-violet-600 dark:text-violet-400">
            <Activity size={21} />
          </div>
        </div>

        <div className="h-80">
          {monthlyActivity.length === 0 ? (
            <div className="flex h-full items-center justify-center text-sm text-slate-500">
              No monthly activity available.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyActivity}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  opacity={0.15}
                />

                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  fontSize={12}
                />

                <YAxis
                  axisLine={false}
                  tickLine={false}
                  fontSize={12}
                />

                <Tooltip content={<CustomTooltip />} />
                <Legend />

                <Bar
                  dataKey="scans"
                  name="Scans"
                  fill="#2563eb"
                  radius={[8, 8, 0, 0]}
                />

                <Bar
                  dataKey="files"
                  name="Files"
                  fill="#7c3aed"
                  radius={[8, 8, 0, 0]}
                />

                <Bar
                  dataKey="errors"
                  name="Errors"
                  fill="#ef4444"
                  radius={[8, 8, 0, 0]}
                />

                <Bar
                  dataKey="warnings"
                  name="Warnings"
                  fill="#f59e0b"
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </GlassCard>

      <section className="grid gap-5 md:grid-cols-3">
        <GlassCard className="p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-blue-500/10 p-3 text-blue-600 dark:text-blue-400">
              <Languages size={21} />
            </div>

            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Most Used Language
              </p>

              <p className="mt-1 font-black text-slate-950 dark:text-white">
                {languageData[0]?.name || "Not available"}
              </p>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-emerald-500/10 p-3 text-emerald-600 dark:text-emerald-400">
              <BarChart3 size={21} />
            </div>

            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Best Project Score
              </p>

              <p className="mt-1 font-black text-slate-950 dark:text-white">
                {bestReview
                  ? `${
                      bestReview.project?.title ||
                      bestReview.folderName
                    } — ${bestReview.overallScore}/100`
                  : "Not available"}
              </p>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-orange-500/10 p-3 text-orange-500">
              <AlertTriangle size={21} />
            </div>

            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Average Issues Per Scan
              </p>

              <p className="mt-1 font-black text-slate-950 dark:text-white">
                {reviews.length
                  ? (
                      (totalErrors + totalWarnings) /
                      reviews.length
                    ).toFixed(1)
                  : 0}
              </p>
            </div>
          </div>
        </GlassCard>
      </section>
    </div>
  );
}