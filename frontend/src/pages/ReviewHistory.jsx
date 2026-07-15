import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  AlertCircle,
  AlertTriangle,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Code2,
  Download,
  Eye,
  FileSearch,
  Filter,
  GitBranch,
  Languages,
  LoaderCircle,
  RefreshCw,
  Search,
  ShieldCheck,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";

import {
  AnimatePresence,
  motion,
} from "framer-motion";

import { toast } from "sonner";

import {
  deleteReview,
  downloadReviewPdf,
  getReview,
  getReviews,
} from "../services/review.service";

const PAGE_SIZE = 6;

const scoreDetails = (score) => {
  if (score === null || score === undefined) {
    return {
      label: "Pending",
      className:
        "bg-slate-500/10 text-slate-600 dark:text-slate-300",
      ringClass: "text-slate-400",
    };
  }

  if (score >= 90) {
    return {
      label: "Excellent",
      className:
        "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
      ringClass: "text-emerald-500",
    };
  }

  if (score >= 75) {
    return {
      label: "Good",
      className:
        "bg-blue-500/10 text-blue-600 dark:text-blue-400",
      ringClass: "text-blue-500",
    };
  }

  if (score >= 50) {
    return {
      label: "Needs Work",
      className:
        "bg-orange-500/10 text-orange-600 dark:text-orange-400",
      ringClass: "text-orange-500",
    };
  }

  return {
    label: "Critical",
    className:
      "bg-red-500/10 text-red-600 dark:text-red-400",
    ringClass: "text-red-500",
  };
};

const formatDate = (dateValue) => {
  if (!dateValue) {
    return "Not available";
  }

  return new Date(dateValue).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

function GlassCard({
  children,
  className = "",
}) {
  return (
    <div
      className={`rounded-3xl border border-white/70 bg-white/80 shadow-xl shadow-slate-200/40 backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.045] dark:shadow-black/20 ${className}`}
    >
      {children}
    </div>
  );
}

function ScoreCircle({ score }) {
  const safeScore = Math.min(
    Math.max(Number(score) || 0, 0),
    100
  );

  const details = scoreDetails(score);

  return (
    <div className="relative flex h-20 w-20 shrink-0 items-center justify-center">
      <svg
        viewBox="0 0 36 36"
        className="-rotate-90"
      >
        <path
          d="M18 2.0845
             a 15.9155 15.9155 0 0 1 0 31.831
             a 15.9155 15.9155 0 0 1 0 -31.831"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          className="text-slate-200 dark:text-white/10"
        />

        <path
          d="M18 2.0845
             a 15.9155 15.9155 0 0 1 0 31.831
             a 15.9155 15.9155 0 0 1 0 -31.831"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeDasharray={`${safeScore}, 100`}
          strokeLinecap="round"
          className={details.ringClass}
        />
      </svg>

      <div className="absolute text-center">
        <p className="text-lg font-black text-slate-950 dark:text-white">
          {score ?? "—"}
        </p>

        <p className="text-[9px] uppercase tracking-wide text-slate-400">
          Score
        </p>
      </div>
    </div>
  );
}

function ReviewDetailsModal({
  review,
  open,
  loading,
  onClose,
  onDownload,
}) {
  const [activeTab, setActiveTab] =
    useState("overview");

  useEffect(() => {
    if (open) {
      setActiveTab("overview");
    }
  }, [open]);

  if (!open) {
    return null;
  }

  const aiReview = review?.aiReview || {};
  const files = review?.files || [];

  const tabs = [
    {
      id: "overview",
      label: "Overview",
    },
    {
      id: "ai",
      label: "AI Review",
    },
    {
      id: "files",
      label: `Files (${files.length})`,
    },
  ];

  return (
    <AnimatePresence>
      <motion.button
        type="button"
        aria-label="Close review details"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-40 bg-black/65 backdrop-blur-sm"
      />

      <motion.div
        initial={{
          opacity: 0,
          scale: 0.96,
          y: 24,
        }}
        animate={{
          opacity: 1,
          scale: 1,
          y: 0,
        }}
        exit={{
          opacity: 0,
          scale: 0.96,
          y: 24,
        }}
        className="fixed left-1/2 top-1/2 z-50 flex max-h-[90vh] w-[calc(100%-2rem)] max-w-5xl -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl dark:border-white/10 dark:bg-[#09111f]"
      >
        <div className="flex items-start justify-between border-b border-slate-200 px-5 py-5 dark:border-white/10 sm:px-7">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
              <Sparkles size={15} />
              AI project review
            </div>

            <h2 className="mt-2 text-2xl font-black text-slate-950 dark:text-white">
              {review?.project?.title ||
                review?.folderName ||
                "Project Scan"}
            </h2>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Scan #{review?.id} •{" "}
              {formatDate(review?.createdAt)}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {review && (
              <button
                type="button"
                onClick={() => onDownload(review)}
                className="hidden items-center gap-2 rounded-xl bg-blue-500/10 px-4 py-2.5 text-sm font-semibold text-blue-600 transition hover:bg-blue-500/20 dark:text-blue-400 sm:inline-flex"
              >
                <Download size={17} />
                Download PDF
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="rounded-xl p-2.5 text-slate-500 transition hover:bg-slate-100 dark:hover:bg-white/10"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="border-b border-slate-200 px-5 dark:border-white/10 sm:px-7">
          <div className="flex gap-2 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`border-b-2 px-4 py-4 text-sm font-semibold transition ${
                  activeTab === tab.id
                    ? "border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400"
                    : "border-transparent text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5 sm:p-7">
          {loading ? (
            <div className="flex min-h-72 items-center justify-center">
              <LoaderCircle
                size={32}
                className="animate-spin text-blue-500"
              />
            </div>
          ) : (
            <>
              {activeTab === "overview" && (
                <div className="space-y-6">
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="rounded-2xl bg-blue-500/[0.07] p-4">
                      <p className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                        Overall Score
                      </p>

                      <p className="mt-2 text-3xl font-black text-slate-950 dark:text-white">
                        {review?.overallScore ?? "—"}
                        <span className="text-sm font-medium text-slate-400">
                          /100
                        </span>
                      </p>
                    </div>

                    <div className="rounded-2xl bg-violet-500/[0.07] p-4">
                      <p className="text-xs font-semibold uppercase tracking-wider text-violet-600 dark:text-violet-400">
                        Files
                      </p>

                      <p className="mt-2 text-3xl font-black text-slate-950 dark:text-white">
                        {review?.totalFiles ?? 0}
                      </p>
                    </div>

                    <div className="rounded-2xl bg-red-500/[0.07] p-4">
                      <p className="text-xs font-semibold uppercase tracking-wider text-red-500">
                        Errors
                      </p>

                      <p className="mt-2 text-3xl font-black text-red-500">
                        {review?.totalErrors ?? 0}
                      </p>
                    </div>

                    <div className="rounded-2xl bg-orange-500/[0.07] p-4">
                      <p className="text-xs font-semibold uppercase tracking-wider text-orange-500">
                        Warnings
                      </p>

                      <p className="mt-2 text-3xl font-black text-orange-500">
                        {review?.totalWarnings ?? 0}
                      </p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-black text-slate-950 dark:text-white">
                      Language Distribution
                    </h3>

                    <div className="mt-4 flex flex-wrap gap-2">
                      {Object.entries(
                        review?.languageSummary || {}
                      ).map(([language, count]) => (
                        <span
                          key={language}
                          className="rounded-xl bg-violet-500/10 px-3 py-2 text-xs font-bold text-violet-600 dark:text-violet-400"
                        >
                          {language}: {count}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-black text-slate-950 dark:text-white">
                      Executive Summary
                    </h3>

                    <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
                      {aiReview.summary ||
                        "No AI summary is available."}
                    </p>
                  </div>
                </div>
              )}

              {activeTab === "ai" && (
                <div className="grid gap-5 lg:grid-cols-2">
                  {[
                    [
                      "Architecture",
                      aiReview.architecture,
                      Code2,
                    ],
                    [
                      "Security",
                      aiReview.security,
                      ShieldCheck,
                    ],
                    [
                      "Performance",
                      aiReview.performance,
                      Sparkles,
                    ],
                    [
                      "Maintainability",
                      aiReview.maintainability,
                      CheckCircle2,
                    ],
                    [
                      "Technical Debt",
                      aiReview.technicalDebt,
                      AlertTriangle,
                    ],
                  ].map(
                    ([title, description, Icon]) => (
                      <div
                        key={title}
                        className="rounded-3xl border border-slate-200 bg-slate-50/70 p-5 dark:border-white/10 dark:bg-white/[0.03]"
                      >
                        <div className="flex items-center gap-3">
                          <div className="rounded-xl bg-blue-500/10 p-2.5 text-blue-600 dark:text-blue-400">
                            <Icon size={19} />
                          </div>

                          <h3 className="font-black text-slate-950 dark:text-white">
                            {title}
                          </h3>
                        </div>

                        <p className="mt-4 text-sm leading-7 text-slate-600 dark:text-slate-300">
                          {description ||
                            "No information available."}
                        </p>
                      </div>
                    )
                  )}

                  <div className="rounded-3xl border border-slate-200 bg-slate-50/70 p-5 dark:border-white/10 dark:bg-white/[0.03]">
                    <h3 className="font-black text-slate-950 dark:text-white">
                      Priority Issues
                    </h3>

                    <div className="mt-4 space-y-3">
                      {aiReview.priorityIssues?.length ? (
                        aiReview.priorityIssues.map(
                          (issue) => (
                            <div
                              key={issue}
                              className="flex gap-3 text-sm leading-6 text-slate-600 dark:text-slate-300"
                            >
                              <AlertCircle
                                size={17}
                                className="mt-1 shrink-0 text-red-500"
                              />
                              {issue}
                            </div>
                          )
                        )
                      ) : (
                        <p className="text-sm text-slate-500">
                          No priority issues reported.
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="rounded-3xl border border-slate-200 bg-slate-50/70 p-5 dark:border-white/10 dark:bg-white/[0.03] lg:col-span-2">
                    <h3 className="font-black text-slate-950 dark:text-white">
                      Recommendations
                    </h3>

                    <div className="mt-4 grid gap-3 md:grid-cols-2">
                      {aiReview.recommendations?.length ? (
                        aiReview.recommendations.map(
                          (recommendation) => (
                            <div
                              key={recommendation}
                              className="flex gap-3 rounded-2xl bg-emerald-500/[0.07] p-4 text-sm leading-6 text-slate-600 dark:text-slate-300"
                            >
                              <CheckCircle2
                                size={17}
                                className="mt-1 shrink-0 text-emerald-500"
                              />
                              {recommendation}
                            </div>
                          )
                        )
                      ) : (
                        <p className="text-sm text-slate-500">
                          No recommendations reported.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "files" && (
                <div className="space-y-4">
                  {files.length === 0 ? (
                    <p className="text-sm text-slate-500">
                      No file analysis records found.
                    </p>
                  ) : (
                    files.map((file) => (
                      <div
                        key={file.id}
                        className="rounded-3xl border border-slate-200 bg-slate-50/70 p-5 dark:border-white/10 dark:bg-white/[0.03]"
                      >
                        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                          <div>
                            <p className="font-black text-slate-950 dark:text-white">
                              {file.fileName}
                            </p>

                            <p className="mt-1 text-xs text-slate-500">
                              {file.language} •{" "}
                              {file.status}
                            </p>
                          </div>

                          <div className="flex gap-2">
                            <span className="rounded-xl bg-red-500/10 px-3 py-2 text-xs font-bold text-red-500">
                              {file.errorCount} errors
                            </span>

                            <span className="rounded-xl bg-orange-500/10 px-3 py-2 text-xs font-bold text-orange-500">
                              {file.warningCount} warnings
                            </span>
                          </div>
                        </div>

                        <div className="mt-4 space-y-3">
                          {file.staticAnalysis?.findings
                            ?.length ? (
                            file.staticAnalysis.findings.map(
                              (finding, index) => (
                                <div
                                  key={`${file.id}-${index}`}
                                  className="rounded-2xl bg-white p-4 dark:bg-white/[0.04]"
                                >
                                  <div className="flex flex-wrap items-center gap-2">
                                    <span
                                      className={`rounded-lg px-2 py-1 text-[10px] font-black uppercase ${
                                        finding.severity ===
                                        "error"
                                          ? "bg-red-500/10 text-red-500"
                                          : "bg-orange-500/10 text-orange-500"
                                      }`}
                                    >
                                      {finding.severity}
                                    </span>

                                    <span className="text-xs font-bold text-slate-500">
                                      {finding.ruleId ||
                                        "unknown-rule"}
                                    </span>

                                    {finding.line && (
                                      <span className="text-xs text-slate-400">
                                        Line {finding.line}
                                      </span>
                                    )}
                                  </div>

                                  <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                                    {finding.message}
                                  </p>
                                </div>
                              )
                            )
                          ) : (
                            <p className="text-sm text-slate-500">
                              No findings for this file.
                            </p>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

export default function ReviewHistory() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [scoreFilter, setScoreFilter] =
    useState("all");

  const [page, setPage] = useState(1);

  const [selectedReview, setSelectedReview] =
    useState(null);

  const [detailsOpen, setDetailsOpen] =
    useState(false);

  const [detailsLoading, setDetailsLoading] =
    useState(false);

  const [deletingId, setDeletingId] =
    useState(null);

  const [downloadingId, setDownloadingId] =
    useState(null);

  const loadReviews = async () => {
    try {
      setLoading(true);

      const data = await getReviews();

      setReviews(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("REVIEWS LOAD ERROR:", error);

      toast.error(
        error.response?.data?.message ||
          "Failed to load review history"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, []);

  const filteredReviews = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return reviews.filter((review) => {
      const matchesSearch =
        !keyword ||
        review.project?.title
          ?.toLowerCase()
          .includes(keyword) ||
        review.folderName
          ?.toLowerCase()
          .includes(keyword) ||
        Object.keys(review.languageSummary || {})
          .join(" ")
          .toLowerCase()
          .includes(keyword);

      const score = review.overallScore ?? 0;

      const matchesScore =
        scoreFilter === "all" ||
        (scoreFilter === "excellent" &&
          score >= 90) ||
        (scoreFilter === "good" &&
          score >= 75 &&
          score < 90) ||
        (scoreFilter === "needs-work" &&
          score >= 50 &&
          score < 75) ||
        (scoreFilter === "critical" &&
          score < 50);

      return matchesSearch && matchesScore;
    });
  }, [reviews, search, scoreFilter]);

  useEffect(() => {
    setPage(1);
  }, [search, scoreFilter]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredReviews.length / PAGE_SIZE)
  );

  const paginatedReviews = filteredReviews.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );

  const openReviewDetails = async (review) => {
    try {
      setDetailsOpen(true);
      setDetailsLoading(true);
      setSelectedReview(review);

      const completeReview = await getReview(review.id);

      setSelectedReview(completeReview);
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Failed to load review details"
      );

      setDetailsOpen(false);
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleDelete = async (review) => {
    const confirmed = window.confirm(
      `Delete scan #${review.id} for "${
        review.project?.title ||
        review.folderName
      }"?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(review.id);

      await deleteReview(review.id);

      setReviews((current) =>
        current.filter(
          (item) => item.id !== review.id
        )
      );

      toast.success(
        "Project scan deleted successfully"
      );
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Failed to delete project scan"
      );
    } finally {
      setDeletingId(null);
    }
  };

  const handleDownload = async (review) => {
    try {
      setDownloadingId(review.id);

      await downloadReviewPdf(review.id);

      toast.success("PDF report downloaded");
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Failed to download PDF report"
      );
    } finally {
      setDownloadingId(null);
    }
  };

  const totalErrors = reviews.reduce(
    (sum, review) =>
      sum + (review.totalErrors || 0),
    0
  );

  const totalWarnings = reviews.reduce(
    (sum, review) =>
      sum + (review.totalWarnings || 0),
    0
  );

  const averageScore = reviews.length
    ? Math.round(
        reviews.reduce(
          (sum, review) =>
            sum + (review.overallScore || 0),
          0
        ) / reviews.length
      )
    : 0;

  return (
    <div className="space-y-7">
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col justify-between gap-5 xl:flex-row xl:items-center"
      >
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-blue-600 dark:text-blue-400">
            <FileSearch size={17} />
            Database-powered history
          </div>

          <h1 className="text-3xl font-black tracking-tight text-slate-950 dark:text-white sm:text-4xl">
            Review History
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">
            View project scans, inspect AI insights,
            download PDF reports and remove old
            analysis records.
          </p>
        </div>

        <button
          type="button"
          onClick={loadReviews}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3.5 text-sm font-bold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-60 dark:border-white/10 dark:bg-white/5 dark:text-white"
        >
          <RefreshCw
            size={18}
            className={loading ? "animate-spin" : ""}
          />
          Refresh History
        </button>
      </motion.section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          {
            label: "Project Scans",
            value: reviews.length,
            icon: FileSearch,
            className:
              "from-blue-600 to-cyan-500",
          },
          {
            label: "Average Score",
            value: `${averageScore}%`,
            icon: ShieldCheck,
            className:
              "from-emerald-500 to-teal-500",
          },
          {
            label: "Total Errors",
            value: totalErrors,
            icon: AlertCircle,
            className:
              "from-red-500 to-rose-600",
          },
          {
            label: "Total Warnings",
            value: totalWarnings,
            icon: AlertTriangle,
            className:
              "from-orange-500 to-amber-500",
          },
        ].map((stat, index) => {
          const Icon = stat.icon;

          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.07 }}
            >
              <GlassCard className="relative overflow-hidden p-5">
                <div
                  className={`absolute -right-12 -top-12 h-32 w-32 rounded-full bg-gradient-to-br ${stat.className} opacity-15 blur-3xl`}
                />

                <div className="relative flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                      {stat.label}
                    </p>

                    <p className="mt-2 text-3xl font-black text-slate-950 dark:text-white">
                      {stat.value}
                    </p>
                  </div>

                  <div
                    className={`rounded-2xl bg-gradient-to-br ${stat.className} p-3 text-white shadow-lg`}
                  >
                    <Icon size={22} />
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          );
        })}
      </section>

      <GlassCard className="p-5 sm:p-6">
        <div className="grid gap-4 lg:grid-cols-[1fr_230px]">
          <div className="relative">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search project, repository or language..."
              className="w-full rounded-2xl border border-slate-200 bg-white py-3.5 pl-12 pr-4 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-white/10 dark:bg-white/5 dark:text-white"
            />
          </div>

          <div className="relative">
            <Filter
              size={17}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <select
              value={scoreFilter}
              onChange={(event) =>
                setScoreFilter(event.target.value)
              }
              className="w-full appearance-none rounded-2xl border border-slate-200 bg-white py-3.5 pl-11 pr-4 text-sm text-slate-900 outline-none dark:border-white/10 dark:bg-white/5 dark:text-white"
            >
              <option
                value="all"
                className="text-slate-900"
              >
                All scores
              </option>

              <option
                value="excellent"
                className="text-slate-900"
              >
                Excellent — 90+
              </option>

              <option
                value="good"
                className="text-slate-900"
              >
                Good — 75 to 89
              </option>

              <option
                value="needs-work"
                className="text-slate-900"
              >
                Needs work — 50 to 74
              </option>

              <option
                value="critical"
                className="text-slate-900"
              >
                Critical — below 50
              </option>
            </select>
          </div>
        </div>
      </GlassCard>

      {loading ? (
        <div className="flex min-h-80 items-center justify-center">
          <LoaderCircle
            size={36}
            className="animate-spin text-blue-500"
          />
        </div>
      ) : paginatedReviews.length === 0 ? (
        <GlassCard className="p-12 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
            <FileSearch size={30} />
          </div>

          <h2 className="mt-5 text-xl font-black text-slate-950 dark:text-white">
            No project scans found
          </h2>

          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Run a ZIP or GitHub repository analysis
            to create project scan history.
          </p>
        </GlassCard>
      ) : (
        <section className="grid gap-5 xl:grid-cols-2">
          {paginatedReviews.map(
            (review, index) => {
              const details = scoreDetails(
                review.overallScore
              );

              const languages = Object.keys(
                review.languageSummary || {}
              );

              return (
                <motion.article
                  key={review.id}
                  initial={{
                    opacity: 0,
                    y: 16,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  transition={{
                    delay: index * 0.05,
                  }}
                >
                  <GlassCard className="group h-full p-5 transition duration-300 hover:-translate-y-1 hover:shadow-2xl sm:p-6">
                    <div className="flex items-start gap-4">
                      <ScoreCircle
                        score={review.overallScore}
                      />

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <h2 className="text-lg font-black text-slate-950 dark:text-white">
                                {review.project?.title ||
                                  review.folderName}
                              </h2>

                              <span
                                className={`rounded-full px-3 py-1 text-[11px] font-bold ${details.className}`}
                              >
                                {details.label}
                              </span>
                            </div>

                            <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                              <span className="inline-flex items-center gap-1">
                                <CalendarDays size={14} />
                                {formatDate(
                                  review.createdAt
                                )}
                              </span>

                              <span className="inline-flex items-center gap-1">
                                <GitBranch size={14} />
                                {review.folderName}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="mt-4 flex flex-wrap gap-2">
                          {languages.length > 0 ? (
                            languages.map((language) => (
                              <span
                                key={language}
                                className="inline-flex items-center gap-1 rounded-xl bg-violet-500/10 px-3 py-1.5 text-xs font-bold text-violet-600 dark:text-violet-400"
                              >
                                <Languages size={13} />
                                {language}
                              </span>
                            ))
                          ) : (
                            <span className="text-xs text-slate-400">
                              No language information
                            </span>
                          )}
                        </div>

                        <div className="mt-5 grid grid-cols-3 gap-3">
                          <div className="rounded-2xl bg-blue-500/[0.06] p-3">
                            <p className="text-[10px] font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                              Files
                            </p>

                            <p className="mt-1 text-lg font-black text-slate-950 dark:text-white">
                              {review.totalFiles}
                            </p>
                          </div>

                          <div className="rounded-2xl bg-red-500/[0.06] p-3">
                            <p className="text-[10px] font-semibold uppercase tracking-wider text-red-500">
                              Errors
                            </p>

                            <p className="mt-1 text-lg font-black text-red-500">
                              {review.totalErrors}
                            </p>
                          </div>

                          <div className="rounded-2xl bg-orange-500/[0.06] p-3">
                            <p className="text-[10px] font-semibold uppercase tracking-wider text-orange-500">
                              Warnings
                            </p>

                            <p className="mt-1 text-lg font-black text-orange-500">
                              {review.totalWarnings}
                            </p>
                          </div>
                        </div>

                        <div className="mt-5 flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              openReviewDetails(review)
                            }
                            className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-blue-500/20"
                          >
                            <Eye size={17} />
                            View Details
                          </button>

                          <button
                            type="button"
                            disabled={
                              downloadingId === review.id
                            }
                            onClick={() =>
                              handleDownload(review)
                            }
                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500/10 px-4 py-3 text-sm font-bold text-emerald-600 transition hover:bg-emerald-500/20 disabled:opacity-50 dark:text-emerald-400"
                          >
                            {downloadingId ===
                            review.id ? (
                              <LoaderCircle
                                size={17}
                                className="animate-spin"
                              />
                            ) : (
                              <Download size={17} />
                            )}
                            PDF
                          </button>

                          <button
                            type="button"
                            disabled={
                              deletingId === review.id
                            }
                            onClick={() =>
                              handleDelete(review)
                            }
                            className="inline-flex items-center justify-center rounded-xl bg-red-500/10 px-4 py-3 text-red-500 transition hover:bg-red-500/20 disabled:opacity-50"
                          >
                            {deletingId === review.id ? (
                              <LoaderCircle
                                size={17}
                                className="animate-spin"
                              />
                            ) : (
                              <Trash2 size={17} />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </GlassCard>
                </motion.article>
              );
            }
          )}
        </section>
      )}

      {!loading && filteredReviews.length > 0 && (
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Showing{" "}
            {(page - 1) * PAGE_SIZE + 1}–
            {Math.min(
              page * PAGE_SIZE,
              filteredReviews.length
            )}{" "}
            of {filteredReviews.length} scans
          </p>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={page === 1}
              onClick={() =>
                setPage((current) => current - 1)
              }
              className="rounded-xl border border-slate-200 bg-white p-2.5 text-slate-700 transition hover:bg-slate-50 disabled:opacity-40 dark:border-white/10 dark:bg-white/5 dark:text-white"
            >
              <ChevronLeft size={18} />
            </button>

            <span className="rounded-xl bg-blue-500/10 px-4 py-2 text-sm font-bold text-blue-600 dark:text-blue-400">
              {page} / {totalPages}
            </span>

            <button
              type="button"
              disabled={page === totalPages}
              onClick={() =>
                setPage((current) => current + 1)
              }
              className="rounded-xl border border-slate-200 bg-white p-2.5 text-slate-700 transition hover:bg-slate-50 disabled:opacity-40 dark:border-white/10 dark:bg-white/5 dark:text-white"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}

      <ReviewDetailsModal
        open={detailsOpen}
        loading={detailsLoading}
        review={selectedReview}
        onClose={() => {
          setDetailsOpen(false);
          setSelectedReview(null);
        }}
        onDownload={handleDownload}
      />
    </div>
  );
}