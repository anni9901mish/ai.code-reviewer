import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Code2,
  Download,
  FileArchive,
  FileCode2,
  FolderArchive,
  Languages,
  LoaderCircle,
  PackageOpen,
  ShieldCheck,
  Sparkles,
  UploadCloud,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { getProjects } from "../services/project.service";
import {
  downloadReviewPdf,
  uploadZipProject,
} from "../services/review.service";

function GlassCard({ children, className = "" }) {
  return (
    <div
      className={`rounded-3xl border border-white/70 bg-white/80 shadow-xl shadow-slate-200/40 backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.045] dark:shadow-black/20 ${className}`}
    >
      {children}
    </div>
  );
}

function InfoSection({
  title,
  icon: Icon,
  children,
  iconClass = "bg-blue-500/10 text-blue-600 dark:text-blue-400",
}) {
  return (
    <GlassCard className="p-5">
      <div className="flex items-center gap-3">
        <div className={`rounded-xl p-2.5 ${iconClass}`}>
          <Icon size={19} />
        </div>

        <h3 className="font-black text-slate-950 dark:text-white">
          {title}
        </h3>
      </div>

      <div className="mt-4 text-sm leading-7 text-slate-600 dark:text-slate-300">
        {children}
      </div>
    </GlassCard>
  );
}

function ListSection({
  title,
  icon: Icon,
  items = [],
  type = "success",
}) {
  const styles = {
    success: {
      wrapper: "bg-emerald-500/10 text-emerald-500",
      item: "text-emerald-500",
    },
    warning: {
      wrapper: "bg-orange-500/10 text-orange-500",
      item: "text-orange-500",
    },
    danger: {
      wrapper: "bg-red-500/10 text-red-500",
      item: "text-red-500",
    },
  };

  const currentStyle = styles[type];

  return (
    <GlassCard className="p-5">
      <div className="flex items-center gap-3">
        <div className={`rounded-xl p-2.5 ${currentStyle.wrapper}`}>
          <Icon size={19} />
        </div>

        <h3 className="font-black text-slate-950 dark:text-white">
          {title}
        </h3>
      </div>

      <div className="mt-4 space-y-3">
        {items.length ? (
          items.map((item, index) => (
            <div
              key={`${title}-${index}`}
              className="flex gap-3 text-sm leading-6 text-slate-600 dark:text-slate-300"
            >
              <CheckCircle2
                size={17}
                className={`mt-1 shrink-0 ${currentStyle.item}`}
              />

              <span>{item}</span>
            </div>
          ))
        ) : (
          <p className="text-sm text-slate-500 dark:text-slate-400">
            No information reported.
          </p>
        )}
      </div>
    </GlassCard>
  );
}

function AnalysisResult({
  result,
  downloading,
  onDownload,
}) {
  if (!result) {
    return null;
  }

  const review = result.projectAiReview || {};
  const scanId = result.scan?.id;

  const languages = Object.entries(
    result.languageSummary || {}
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <GlassCard className="overflow-hidden">
        <div className="border-b border-slate-200/70 bg-gradient-to-r from-emerald-500/[0.08] via-blue-500/[0.06] to-violet-500/[0.08] p-6 dark:border-white/10">
          <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
            <div className="flex items-start gap-4">
              <div className="rounded-2xl bg-emerald-500 p-3 text-white shadow-lg shadow-emerald-500/25">
                <CheckCircle2 size={25} />
              </div>

              <div>
                <h2 className="text-xl font-black text-slate-950 dark:text-white">
                  ZIP project analysis completed
                </h2>

                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  {result.message}
                </p>

                <p className="mt-2 text-xs font-semibold text-slate-400">
                  Folder: {result.folder}
                  {scanId ? ` • Scan ID: ${scanId}` : ""}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-white/75 px-5 py-3 text-center shadow-sm dark:bg-white/5">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Overall Score
                </p>

                <p className="mt-1 text-3xl font-black text-slate-950 dark:text-white">
                  {review.overallScore ?? "—"}
                  <span className="text-sm text-slate-400">
                    /100
                  </span>
                </p>
              </div>

              {scanId && (
                <button
                  type="button"
                  disabled={downloading}
                  onClick={() => onDownload(scanId)}
                  className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-violet-600 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-blue-500/25 disabled:opacity-60"
                >
                  {downloading ? (
                    <LoaderCircle
                      size={18}
                      className="animate-spin"
                    />
                  ) : (
                    <Download size={18} />
                  )}

                  PDF
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="grid gap-4 p-6 sm:grid-cols-2 xl:grid-cols-5">
          <div className="rounded-2xl bg-blue-500/[0.07] p-4">
            <p className="text-xs font-bold uppercase tracking-wide text-blue-600 dark:text-blue-400">
              Total Files
            </p>

            <p className="mt-2 text-3xl font-black text-slate-950 dark:text-white">
              {result.totalFiles ?? 0}
            </p>
          </div>

          <div className="rounded-2xl bg-violet-500/[0.07] p-4">
            <p className="text-xs font-bold uppercase tracking-wide text-violet-600 dark:text-violet-400">
              Analyzed
            </p>

            <p className="mt-2 text-3xl font-black text-slate-950 dark:text-white">
              {result.analyzedFiles ?? 0}
            </p>
          </div>

          <div className="rounded-2xl bg-slate-500/[0.07] p-4">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
              Failed
            </p>

            <p className="mt-2 text-3xl font-black text-slate-950 dark:text-white">
              {result.failedFiles ?? 0}
            </p>
          </div>

          <div className="rounded-2xl bg-red-500/[0.07] p-4">
            <p className="text-xs font-bold uppercase tracking-wide text-red-500">
              Errors
            </p>

            <p className="mt-2 text-3xl font-black text-red-500">
              {result.totalErrors ?? 0}
            </p>
          </div>

          <div className="rounded-2xl bg-orange-500/[0.07] p-4">
            <p className="text-xs font-bold uppercase tracking-wide text-orange-500">
              Warnings
            </p>

            <p className="mt-2 text-3xl font-black text-orange-500">
              {result.totalWarnings ?? 0}
            </p>
          </div>
        </div>
      </GlassCard>

      <GlassCard className="p-5">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-violet-500/10 p-2.5 text-violet-600 dark:text-violet-400">
            <Languages size={19} />
          </div>

          <h3 className="font-black text-slate-950 dark:text-white">
            Language Distribution
          </h3>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {languages.length ? (
            languages.map(([language, count]) => (
              <span
                key={language}
                className="rounded-xl bg-violet-500/10 px-3 py-2 text-xs font-bold text-violet-600 dark:text-violet-400"
              >
                {language}: {count} file(s)
              </span>
            ))
          ) : (
            <p className="text-sm text-slate-500">
              No language information available.
            </p>
          )}
        </div>
      </GlassCard>

      <InfoSection
        title="Executive Summary"
        icon={Sparkles}
      >
        {review.summary || "No AI summary available."}
      </InfoSection>

      <div className="grid gap-5 lg:grid-cols-2">
        <InfoSection
          title="Architecture"
          icon={Code2}
        >
          {review.architecture ||
            "No architecture review available."}
        </InfoSection>

        <InfoSection
          title="Security"
          icon={ShieldCheck}
          iconClass="bg-emerald-500/10 text-emerald-500"
        >
          {review.security ||
            "No security review available."}
        </InfoSection>

        <InfoSection
          title="Performance"
          icon={Sparkles}
          iconClass="bg-violet-500/10 text-violet-500"
        >
          {review.performance ||
            "No performance review available."}
        </InfoSection>

        <InfoSection
          title="Maintainability"
          icon={FileCode2}
          iconClass="bg-cyan-500/10 text-cyan-500"
        >
          {review.maintainability ||
            "No maintainability review available."}
        </InfoSection>

        <InfoSection
          title="Technical Debt"
          icon={AlertTriangle}
          iconClass="bg-orange-500/10 text-orange-500"
        >
          {review.technicalDebt ||
            "No technical debt information available."}
        </InfoSection>

        <ListSection
          title="Strengths"
          icon={CheckCircle2}
          items={review.strengths || []}
          type="success"
        />

        <ListSection
          title="Priority Issues"
          icon={AlertCircle}
          items={review.priorityIssues || []}
          type="danger"
        />

        <ListSection
          title="Recommendations"
          icon={ShieldCheck}
          items={review.recommendations || []}
          type="success"
        />
      </div>

      <GlassCard className="overflow-hidden">
        <div className="border-b border-slate-200/70 p-5 dark:border-white/10">
          <h3 className="text-lg font-black text-slate-950 dark:text-white">
            Per-file Analysis
          </h3>

          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Static-analysis results for every supported source file.
          </p>
        </div>

        <div className="divide-y divide-slate-200/70 dark:divide-white/10">
          {(result.results || []).map((fileResult, index) => (
            <div
              key={`${fileResult.file}-${index}`}
              className="p-5"
            >
              <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                <div>
                  <p className="font-black text-slate-950 dark:text-white">
                    {fileResult.file}
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    {fileResult.language} • {fileResult.status}
                  </p>
                </div>

                <div className="flex gap-2">
                  <span className="rounded-xl bg-red-500/10 px-3 py-2 text-xs font-bold text-red-500">
                    {fileResult.staticAnalysis?.errorCount || 0} errors
                  </span>

                  <span className="rounded-xl bg-orange-500/10 px-3 py-2 text-xs font-bold text-orange-500">
                    {fileResult.staticAnalysis?.warningCount || 0} warnings
                  </span>
                </div>
              </div>

              {fileResult.error && (
                <p className="mt-3 rounded-xl bg-red-500/[0.07] p-3 text-sm text-red-500">
                  {fileResult.error}
                </p>
              )}
            </div>
          ))}
        </div>
      </GlassCard>
    </motion.div>
  );
}

export default function ZipAnalysis() {
  const fileInputRef = useRef(null);

  const [projects, setProjects] = useState([]);
  const [projectId, setProjectId] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);

  const [projectsLoading, setProjectsLoading] =
    useState(true);

  const [dragging, setDragging] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState(null);

  useEffect(() => {
    const loadProjects = async () => {
      try {
        const data = await getProjects();
        const projectList = Array.isArray(data) ? data : [];

        setProjects(projectList);

        if (projectList.length) {
          setProjectId(String(projectList[0].id));
        }
      } catch (error) {
        toast.error(
          error.response?.data?.message ||
            "Failed to load projects"
        );
      } finally {
        setProjectsLoading(false);
      }
    };

    loadProjects();
  }, []);

  const validateZip = (file) => {
    if (!file) {
      return false;
    }

    if (!file.name.toLowerCase().endsWith(".zip")) {
      toast.error("Only ZIP project files are allowed");
      return false;
    }

    if (file.size > 50 * 1024 * 1024) {
      toast.error("ZIP size must be below 50 MB");
      return false;
    }

    return true;
  };

  const chooseFile = (file) => {
    if (validateZip(file)) {
      setSelectedFile(file);
      setResult(null);
      setProgress(0);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    setResult(null);
    setProgress(0);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setDragging(false);

    chooseFile(event.dataTransfer.files?.[0]);
  };

  const handleUploadProgress = (event) => {
    if (!event.total) {
      return;
    }

    const uploadPercentage = Math.round(
      (event.loaded * 100) / event.total
    );

    setProgress(uploadPercentage);
  };

  const handleSubmit = async () => {
    if (!projectId) {
      toast.error("Please select a project");
      return;
    }

    if (!selectedFile) {
      toast.error("Please select a ZIP project");
      return;
    }

    try {
      setSubmitting(true);
      setProgress(1);
      setResult(null);

      const response = await uploadZipProject({
        file: selectedFile,
        projectId,
        onUploadProgress: handleUploadProgress,
      });

      setProgress(100);
      setResult(response);

      toast.success(
        "ZIP project analyzed and saved successfully"
      );
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "ZIP project analysis failed"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDownload = async (scanId) => {
    try {
      setDownloading(true);

      await downloadReviewPdf(scanId);

      toast.success("PDF report downloaded");
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Failed to download PDF report"
      );
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="space-y-7">
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-violet-600 dark:text-violet-400">
          <Sparkles size={17} />
          Complete project intelligence
        </div>

        <h1 className="text-3xl font-black tracking-tight text-slate-950 dark:text-white sm:text-4xl">
          ZIP Project Analysis
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">
          Upload a compressed project to scan every supported
          source file, generate an AI review and save the report.
        </p>
      </motion.section>

      <div className="grid gap-6 xl:grid-cols-[1.45fr_0.75fr]">
        <GlassCard className="p-5 sm:p-7">
          <div>
            <label className="mb-2 block text-sm font-bold text-slate-700 dark:text-slate-200">
              Select Project
            </label>

            <select
              value={projectId}
              onChange={(event) =>
                setProjectId(event.target.value)
              }
              disabled={projectsLoading}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-sm text-slate-900 outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 dark:border-white/10 dark:bg-white/5 dark:text-white"
            >
              <option value="">
                {projectsLoading
                  ? "Loading projects..."
                  : "Choose a project"}
              </option>

              {projects.map((project) => (
                <option
                  key={project.id}
                  value={project.id}
                  className="text-slate-900"
                >
                  {project.title} — {project.language}
                </option>
              ))}
            </select>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            hidden
            accept=".zip,application/zip"
            onChange={(event) =>
              chooseFile(event.target.files?.[0])
            }
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            onDragEnter={(event) => {
              event.preventDefault();
              setDragging(true);
            }}
            onDragOver={(event) => event.preventDefault()}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            className={`mt-6 flex min-h-80 w-full flex-col items-center justify-center rounded-3xl border-2 border-dashed px-6 text-center transition ${
              dragging
                ? "border-violet-500 bg-violet-500/10"
                : "border-slate-300 bg-slate-50/60 hover:border-violet-400 hover:bg-violet-500/[0.04] dark:border-white/15 dark:bg-white/[0.02]"
            }`}
          >
            <div className="rounded-3xl bg-gradient-to-br from-violet-600 via-indigo-600 to-blue-600 p-5 text-white shadow-xl shadow-violet-500/25">
              {selectedFile ? (
                <FileArchive size={38} />
              ) : (
                <FolderArchive size={38} />
              )}
            </div>

            <h2 className="mt-5 text-xl font-black text-slate-950 dark:text-white">
              {selectedFile
                ? selectedFile.name
                : "Drop your ZIP project here"}
            </h2>

            <p className="mt-2 max-w-md text-sm text-slate-500 dark:text-slate-400">
              {selectedFile
                ? `${(
                    selectedFile.size /
                    1024 /
                    1024
                  ).toFixed(2)} MB selected`
                : "Drag and drop a ZIP archive or click to browse"}
            </p>

            {selectedFile && (
              <span
                role="button"
                tabIndex={0}
                onClick={(event) => {
                  event.stopPropagation();
                  removeFile();
                }}
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-red-500/10 px-4 py-2 text-sm font-bold text-red-500"
              >
                <X size={16} />
                Remove ZIP
              </span>
            )}
          </button>

          {progress > 0 && (
            <div className="mt-5">
              <div className="mb-2 flex justify-between text-xs font-semibold text-slate-500 dark:text-slate-400">
                <span>
                  {submitting
                    ? "Uploading and analyzing project..."
                    : "Upload complete"}
                </span>

                <span>{progress}%</span>
              </div>

              <div className="h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  className="h-full rounded-full bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600"
                />
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={handleSubmit}
            disabled={
              submitting ||
              projectsLoading ||
              !selectedFile
            }
            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 px-5 py-4 text-sm font-black text-white shadow-xl shadow-violet-500/25 transition hover:-translate-y-0.5 hover:shadow-2xl disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? (
              <>
                <LoaderCircle
                  size={20}
                  className="animate-spin"
                />
                Scanning complete project...
              </>
            ) : (
              <>
                <UploadCloud size={20} />
                Start ZIP Analysis
              </>
            )}
          </button>
        </GlassCard>

        <div className="space-y-5">
          <div className="rounded-3xl bg-gradient-to-br from-violet-600 via-indigo-600 to-blue-700 p-6 text-white shadow-2xl shadow-violet-500/20">
            <div className="inline-flex rounded-2xl bg-white/15 p-3 backdrop-blur">
              <PackageOpen size={25} />
            </div>

            <h3 className="mt-5 text-xl font-black">
              Full project review
            </h3>

            <p className="mt-2 text-sm leading-6 text-white/75">
              Your ZIP is extracted securely, scanned recursively
              and reviewed with language-specific analyzers and AI.
            </p>
          </div>

          <GlassCard className="p-5">
            <h3 className="font-black text-slate-950 dark:text-white">
              Before uploading
            </h3>

            <div className="mt-4 space-y-3">
              {[
                "ZIP archive only",
                "Maximum size: 50 MB",
                "Do not include node_modules",
                "Do not include build folders",
                "Use the correct project record",
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300"
                >
                  <CheckCircle2
                    size={17}
                    className="shrink-0 text-emerald-500"
                  />
                  {item}
                </div>
              ))}
            </div>
          </GlassCard>

          <GlassCard className="p-5">
            <h3 className="font-black text-slate-950 dark:text-white">
              Analysis includes
            </h3>

            <div className="mt-4 space-y-3">
              {[
                "Recursive project scanning",
                "Multi-language detection",
                "Per-file static analysis",
                "Architecture review",
                "Security and performance insights",
                "Downloadable PDF report",
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300"
                >
                  <ShieldCheck
                    size={17}
                    className="shrink-0 text-violet-500"
                  />
                  {item}
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      </div>

      <AnalysisResult
        result={result}
        downloading={downloading}
        onDownload={handleDownload}
      />
    </div>
  );
}