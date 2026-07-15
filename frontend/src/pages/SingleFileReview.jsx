import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Code2,
  FileCode2,
  FileUp,
  LoaderCircle,
  ShieldCheck,
  Sparkles,
  UploadCloud,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { getProjects } from "../services/project.service";
import { uploadSingleFile } from "../services/review.service";

const supportedExtensions = [
  ".js",
  ".jsx",
  ".mjs",
  ".cjs",
  ".ts",
  ".tsx",
  ".py",
  ".java",
  ".c",
  ".h",
  ".cpp",
  ".cc",
  ".cxx",
  ".hpp",
  ".cs",
  ".go",
  ".php",
  ".rb",
  ".rs",
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

function ResultCard({ result }) {
  if (!result) {
    return null;
  }

  const score =
    result.aiAnalysis?.overallScore ??
    result.review?.overallScore ??
    null;

  const staticAnalysis = result.staticAnalysis || {};
  const findings = staticAnalysis.findings || [];

  return (
    <motion.section
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <GlassCard className="overflow-hidden">
        <div className="border-b border-slate-200/70 bg-gradient-to-r from-emerald-500/[0.08] to-blue-500/[0.08] p-6 dark:border-white/10">
          <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
            <div className="flex items-center gap-4">
              <div className="rounded-2xl bg-emerald-500 p-3 text-white shadow-lg shadow-emerald-500/25">
                <CheckCircle2 size={24} />
              </div>

              <div>
                <h2 className="text-xl font-black text-slate-950 dark:text-white">
                  Analysis completed successfully
                </h2>

                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  {result.message}
                </p>
              </div>
            </div>

            <div className="rounded-2xl bg-white/70 px-5 py-3 text-center shadow-sm dark:bg-white/5">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Overall Score
              </p>

              <p className="mt-1 text-3xl font-black text-slate-950 dark:text-white">
                {score !== null ? `${score}/100` : "Pending"}
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-4 p-6 sm:grid-cols-3">
          <div className="rounded-2xl bg-blue-500/[0.07] p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-400">
              Language
            </p>

            <p className="mt-2 font-black text-slate-950 dark:text-white">
              {result.file?.language || "Unknown"}
            </p>
          </div>

          <div className="rounded-2xl bg-red-500/[0.07] p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-red-500">
              Errors
            </p>

            <p className="mt-2 text-2xl font-black text-red-500">
              {staticAnalysis.errorCount || 0}
            </p>
          </div>

          <div className="rounded-2xl bg-orange-500/[0.07] p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-orange-500">
              Warnings
            </p>

            <p className="mt-2 text-2xl font-black text-orange-500">
              {staticAnalysis.warningCount || 0}
            </p>
          </div>
        </div>
      </GlassCard>

      {result.aiAnalysis && (
        <div className="grid gap-5 lg:grid-cols-2">
          <GlassCard className="p-5">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-blue-500/10 p-2.5 text-blue-600 dark:text-blue-400">
                <Sparkles size={19} />
              </div>

              <h3 className="font-black text-slate-950 dark:text-white">
                AI Summary
              </h3>
            </div>

            <p className="mt-4 text-sm leading-7 text-slate-600 dark:text-slate-300">
              {result.aiAnalysis.summary || "No summary available."}
            </p>
          </GlassCard>

          <GlassCard className="p-5">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-emerald-500/10 p-2.5 text-emerald-600 dark:text-emerald-400">
                <ShieldCheck size={19} />
              </div>

              <h3 className="font-black text-slate-950 dark:text-white">
                Strengths
              </h3>
            </div>

            <div className="mt-4 space-y-3">
              {result.aiAnalysis.strengths?.length ? (
                result.aiAnalysis.strengths.map((strength) => (
                  <div
                    key={strength}
                    className="flex gap-3 text-sm leading-6 text-slate-600 dark:text-slate-300"
                  >
                    <CheckCircle2
                      size={17}
                      className="mt-1 shrink-0 text-emerald-500"
                    />
                    {strength}
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-500">
                  No strengths reported.
                </p>
              )}
            </div>
          </GlassCard>

          <GlassCard className="p-5">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-red-500/10 p-2.5 text-red-500">
                <AlertCircle size={19} />
              </div>

              <h3 className="font-black text-slate-950 dark:text-white">
                Bugs and Security
              </h3>
            </div>

            <div className="mt-4 space-y-3">
              {[
                ...(result.aiAnalysis.bugs || []),
                ...(result.aiAnalysis.securityIssues || []),
              ].length ? (
                [
                  ...(result.aiAnalysis.bugs || []),
                  ...(result.aiAnalysis.securityIssues || []),
                ].map((issue) => (
                  <div
                    key={issue}
                    className="flex gap-3 text-sm leading-6 text-slate-600 dark:text-slate-300"
                  >
                    <AlertTriangle
                      size={17}
                      className="mt-1 shrink-0 text-red-500"
                    />
                    {issue}
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-500">
                  No bugs or security issues reported.
                </p>
              )}
            </div>
          </GlassCard>

          <GlassCard className="p-5">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-violet-500/10 p-2.5 text-violet-600 dark:text-violet-400">
                <Code2 size={19} />
              </div>

              <h3 className="font-black text-slate-950 dark:text-white">
                Recommendations
              </h3>
            </div>

            <div className="mt-4 space-y-3">
              {[
                ...(result.aiAnalysis.refactoringSuggestions || []),
                ...(result.aiAnalysis.bestPractices || []),
                ...(result.aiAnalysis.performanceSuggestions || []),
              ].length ? (
                [
                  ...(result.aiAnalysis.refactoringSuggestions || []),
                  ...(result.aiAnalysis.bestPractices || []),
                  ...(result.aiAnalysis.performanceSuggestions || []),
                ].map((recommendation) => (
                  <div
                    key={recommendation}
                    className="flex gap-3 text-sm leading-6 text-slate-600 dark:text-slate-300"
                  >
                    <CheckCircle2
                      size={17}
                      className="mt-1 shrink-0 text-violet-500"
                    />
                    {recommendation}
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-500">
                  No recommendations reported.
                </p>
              )}
            </div>
          </GlassCard>
        </div>
      )}

      <GlassCard className="overflow-hidden">
        <div className="border-b border-slate-200/70 p-5 dark:border-white/10">
          <h3 className="text-lg font-black text-slate-950 dark:text-white">
            Static Analysis Findings
          </h3>

          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Errors and warnings detected by the language analyzer.
          </p>
        </div>

        {findings.length === 0 ? (
          <div className="p-8 text-center">
            <CheckCircle2
              size={34}
              className="mx-auto text-emerald-500"
            />

            <p className="mt-3 font-bold text-slate-950 dark:text-white">
              No static-analysis findings
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-200/70 dark:divide-white/10">
            {findings.map((finding, index) => (
              <div
                key={`${finding.ruleId}-${finding.line}-${index}`}
                className="p-5"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`rounded-lg px-2.5 py-1 text-[10px] font-black uppercase ${
                      finding.severity === "error"
                        ? "bg-red-500/10 text-red-500"
                        : "bg-orange-500/10 text-orange-500"
                    }`}
                  >
                    {finding.severity}
                  </span>

                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                    {finding.ruleId || "unknown-rule"}
                  </span>

                  {finding.line && (
                    <span className="text-xs text-slate-400">
                      Line {finding.line}
                      {finding.column
                        ? `, Column ${finding.column}`
                        : ""}
                    </span>
                  )}
                </div>

                <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
                  {finding.message}
                </p>
              </div>
            ))}
          </div>
        )}
      </GlassCard>
    </motion.section>
  );
}

export default function SingleFileReview() {
  const fileInputRef = useRef(null);

  const [projects, setProjects] = useState([]);
  const [projectId, setProjectId] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);

  const [projectsLoading, setProjectsLoading] =
    useState(true);

  const [dragging, setDragging] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState(null);

  useEffect(() => {
    const loadProjects = async () => {
      try {
        const data = await getProjects();

        setProjects(Array.isArray(data) ? data : []);

        if (data?.length) {
          setProjectId(String(data[0].id));
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

  const validateFile = (file) => {
    if (!file) {
      return false;
    }

    const fileName = file.name.toLowerCase();

    const supported = supportedExtensions.some((extension) =>
      fileName.endsWith(extension)
    );

    if (!supported) {
      toast.error("Unsupported source file type");
      return false;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size must be below 10 MB");
      return false;
    }

    return true;
  };

  const chooseFile = (file) => {
    if (validateFile(file)) {
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

    setProgress(
      Math.round((event.loaded * 100) / event.total)
    );
  };

  const handleSubmit = async () => {
    if (!projectId) {
      toast.error("Please select a project");
      return;
    }

    if (!selectedFile) {
      toast.error("Please select a source file");
      return;
    }

    try {
      setSubmitting(true);
      setProgress(1);
      setResult(null);

      const response = await uploadSingleFile({
        file: selectedFile,
        projectId,
        onUploadProgress: handleUploadProgress,
      });

      setProgress(100);
      setResult(response);

      toast.success("File analysis completed successfully");
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "File analysis failed"
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-7">
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-blue-600 dark:text-blue-400">
          <Sparkles size={17} />
          AI-assisted source-code inspection
        </div>

        <h1 className="text-3xl font-black tracking-tight text-slate-950 dark:text-white sm:text-4xl">
          Single File Review
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">
          Upload an individual source file for static analysis and
          a detailed Gemini AI code review.
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
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-white/10 dark:bg-white/5 dark:text-white"
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
            accept={supportedExtensions.join(",")}
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
                ? "border-blue-500 bg-blue-500/10"
                : "border-slate-300 bg-slate-50/60 hover:border-blue-400 hover:bg-blue-500/[0.04] dark:border-white/15 dark:bg-white/[0.02]"
            }`}
          >
            <div className="rounded-3xl bg-gradient-to-br from-blue-600 to-violet-600 p-5 text-white shadow-xl shadow-blue-500/25">
              {selectedFile ? (
                <FileCode2 size={36} />
              ) : (
                <FileUp size={36} />
              )}
            </div>

            <h2 className="mt-5 text-xl font-black text-slate-950 dark:text-white">
              {selectedFile
                ? selectedFile.name
                : "Drop your source file here"}
            </h2>

            <p className="mt-2 max-w-md text-sm text-slate-500 dark:text-slate-400">
              {selectedFile
                ? `${(selectedFile.size / 1024).toFixed(
                    1
                  )} KB selected`
                : "Drag and drop or click to browse from your computer"}
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
                Remove file
              </span>
            )}
          </button>

          {progress > 0 && (
            <div className="mt-5">
              <div className="mb-2 flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400">
                <span>
                  {progress === 100
                    ? "Upload complete"
                    : "Uploading file"}
                </span>

                <span>{progress}%</span>
              </div>

              <div className="h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  className="h-full rounded-full bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600"
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
            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 px-5 py-4 text-sm font-black text-white shadow-xl shadow-blue-500/25 transition hover:-translate-y-0.5 hover:shadow-2xl disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? (
              <>
                <LoaderCircle
                  size={20}
                  className="animate-spin"
                />
                Analyzing source code...
              </>
            ) : (
              <>
                <UploadCloud size={20} />
                Start File Analysis
              </>
            )}
          </button>
        </GlassCard>

        <div className="space-y-5">
          <div className="rounded-3xl bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-700 p-6 text-white shadow-2xl shadow-blue-500/20">
            <div className="inline-flex rounded-2xl bg-white/15 p-3 backdrop-blur">
              <Code2 size={24} />
            </div>

            <h3 className="mt-5 text-xl font-black">
              Deep file intelligence
            </h3>

            <p className="mt-2 text-sm leading-6 text-white/75">
              Every uploaded file is checked using a language-specific
              static analyzer and reviewed by Gemini AI.
            </p>
          </div>

          <GlassCard className="p-5">
            <h3 className="font-black text-slate-950 dark:text-white">
              Supported file types
            </h3>

            <div className="mt-4 flex flex-wrap gap-2">
              {supportedExtensions.map((extension) => (
                <span
                  key={extension}
                  className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300"
                >
                  {extension}
                </span>
              ))}
            </div>
          </GlassCard>

          <GlassCard className="p-5">
            <h3 className="font-black text-slate-950 dark:text-white">
              Review includes
            </h3>

            <div className="mt-4 space-y-3">
              {[
                "Syntax errors and lint warnings",
                "Bugs and code smells",
                "Security recommendations",
                "Performance suggestions",
                "Refactoring guidance",
                "Improved code example",
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
        </div>
      </div>

      <ResultCard result={result} />
    </div>
  );
}