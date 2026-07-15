import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  Code2,
  FileCode2,
  FileUp,
  FolderArchive,
  GitBranch,
  LoaderCircle,
  PackageOpen,
  Sparkles,
  UploadCloud,
  X,
} from "lucide-react";
import { toast } from "sonner";

import {
  reviewGithubRepository,
  uploadSingleFile,
  uploadZipProject,
} from "../services/review.service";

import {
  getProjects,
} from "../services/project.service";

const tabs = [
  {
    id: "file",
    title: "Single File",
    description: "Analyze an individual source file",
    icon: FileCode2,
  },
  {
    id: "zip",
    title: "ZIP Project",
    description: "Review a complete local project",
    icon: PackageOpen,
  },
  {
    id: "github",
    title: "GitHub Repository",
    description: "Analyze a public GitHub repository",
    icon: GitBranch,
  },
];

const supportedLanguages = [
  "JavaScript",
  "TypeScript",
  "Python",
  "Java",
  "C",
  "C++",
  "C#",
  "Go",
  "PHP",
  "Rust",
  "Ruby",
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

function ProjectSelector({
  projects,
  projectId,
  setProjectId,
  loading,
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">
        Select Project
      </label>

      <select
        value={projectId}
        onChange={(event) => setProjectId(event.target.value)}
        disabled={loading}
        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:opacity-60 dark:border-white/10 dark:bg-white/5 dark:text-white"
      >
        <option value="">
          {loading ? "Loading projects..." : "Choose a project"}
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
  );
}

function UploadProgress({ progress }) {
  if (progress <= 0) {
    return null;
  }

  return (
    <div className="mt-5">
      <div className="mb-2 flex justify-between text-xs font-semibold text-slate-500 dark:text-slate-400">
        <span>Uploading and analyzing</span>
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
  );
}

function ResultSummary({ result }) {
  if (!result) {
    return null;
  }

  const score =
    result.projectAiReview?.overallScore ??
    result.review?.overallScore ??
    result.aiAnalysis?.overallScore ??
    null;

  const errors =
    result.totalErrors ??
    result.staticAnalysis?.errorCount ??
    0;

  const warnings =
    result.totalWarnings ??
    result.staticAnalysis?.warningCount ??
    0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-7 rounded-3xl border border-emerald-500/20 bg-emerald-500/[0.07] p-5"
    >
      <div className="flex items-start gap-3">
        <div className="rounded-2xl bg-emerald-500 p-3 text-white shadow-lg shadow-emerald-500/20">
          <CheckCircle2 size={22} />
        </div>

        <div className="min-w-0 flex-1">
          <h3 className="font-bold text-slate-950 dark:text-white">
            Analysis completed
          </h3>

          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
            {result.message}
          </p>

          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl bg-white/70 p-3 dark:bg-white/5">
              <p className="text-xs text-slate-500">
                Overall Score
              </p>
              <p className="mt-1 text-xl font-black text-slate-950 dark:text-white">
                {score !== null ? `${score}/100` : "Pending"}
              </p>
            </div>

            <div className="rounded-2xl bg-white/70 p-3 dark:bg-white/5">
              <p className="text-xs text-slate-500">
                Errors
              </p>
              <p className="mt-1 text-xl font-black text-red-500">
                {errors}
              </p>
            </div>

            <div className="rounded-2xl bg-white/70 p-3 dark:bg-white/5">
              <p className="text-xs text-slate-500">
                Warnings
              </p>
              <p className="mt-1 text-xl font-black text-orange-500">
                {warnings}
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function Upload() {
  const fileInputRef = useRef(null);

  const [activeTab, setActiveTab] = useState("file");
  const [projects, setProjects] = useState([]);
  const [projectsLoading, setProjectsLoading] =
    useState(true);

  const [projectId, setProjectId] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [repositoryUrl, setRepositoryUrl] = useState("");

  const [dragging, setDragging] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState(null);

  useEffect(() => {
    const loadProjects = async () => {
      try {
        const projectList = await getProjects();

        setProjects(projectList);

        if (projectList.length > 0) {
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

  const resetInput = () => {
    setSelectedFile(null);
    setRepositoryUrl("");
    setProgress(0);
    setResult(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const changeTab = (tabId) => {
    setActiveTab(tabId);
    resetInput();
  };

  const validateFile = (file) => {
    if (!file) {
      return false;
    }

    if (activeTab === "zip") {
      const isZip =
        file.name.toLowerCase().endsWith(".zip") ||
        file.type === "application/zip";

      if (!isZip) {
        toast.error("Please select a valid ZIP file");
        return false;
      }
    }

    return true;
  };

  const handleFile = (file) => {
    if (validateFile(file)) {
      setSelectedFile(file);
      setResult(null);
    }
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setDragging(false);

    handleFile(event.dataTransfer.files?.[0]);
  };

  const handleProgress = (event) => {
    if (!event.total) {
      return;
    }

    const percentage = Math.round(
      (event.loaded * 100) / event.total
    );

    setProgress(percentage);
  };

  const handleSubmit = async () => {
    if (!projectId) {
      toast.error("Please select a project");
      return;
    }

    if (
      (activeTab === "file" || activeTab === "zip") &&
      !selectedFile
    ) {
      toast.error(
        activeTab === "zip"
          ? "Please select a ZIP project"
          : "Please select a source file"
      );
      return;
    }

    if (
      activeTab === "github" &&
      !repositoryUrl.trim()
    ) {
      toast.error("Please enter a GitHub repository URL");
      return;
    }

    try {
      setSubmitting(true);
      setProgress(activeTab === "github" ? 20 : 1);
      setResult(null);

      let response;

      if (activeTab === "file") {
        response = await uploadSingleFile({
          file: selectedFile,
          projectId,
          onUploadProgress: handleProgress,
        });
      }

      if (activeTab === "zip") {
        response = await uploadZipProject({
          file: selectedFile,
          projectId,
          onUploadProgress: handleProgress,
        });
      }

      if (activeTab === "github") {
        setProgress(35);

        response = await reviewGithubRepository({
          projectId,
          repositoryUrl: repositoryUrl.trim(),
        });
      }

      setProgress(100);
      setResult(response);

      toast.success("Code analysis completed successfully");
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Analysis failed"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const CurrentTabIcon =
    tabs.find((tab) => tab.id === activeTab)?.icon ||
    UploadCloud;

  return (
    <div className="space-y-7">
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-blue-600 dark:text-blue-400">
          <Sparkles size={17} />
          AI-powered multi-language analysis
        </div>

        <h1 className="text-3xl font-black tracking-tight text-slate-950 dark:text-white sm:text-4xl">
          Upload Center
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">
          Review a source file, upload an entire ZIP project,
          or analyze a public GitHub repository.
        </p>
      </motion.section>

      <GlassCard className="overflow-hidden">
        <div className="grid border-b border-slate-200/70 dark:border-white/10 md:grid-cols-3">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => changeTab(tab.id)}
                className={`relative flex items-center gap-3 px-5 py-5 text-left transition ${
                  isActive
                    ? "bg-blue-500/[0.08]"
                    : "hover:bg-slate-50 dark:hover:bg-white/[0.025]"
                }`}
              >
                <div
                  className={`rounded-2xl p-3 transition ${
                    isActive
                      ? "bg-gradient-to-br from-blue-600 to-violet-600 text-white shadow-lg shadow-blue-500/20"
                      : "bg-slate-100 text-slate-500 dark:bg-white/5 dark:text-slate-400"
                  }`}
                >
                  <Icon size={21} />
                </div>

                <div>
                  <p
                    className={`font-bold ${
                      isActive
                        ? "text-blue-600 dark:text-blue-400"
                        : "text-slate-900 dark:text-white"
                    }`}
                  >
                    {tab.title}
                  </p>

                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    {tab.description}
                  </p>
                </div>

                {isActive && (
                  <motion.div
                    layoutId="upload-active-tab"
                    className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-blue-600 to-violet-600"
                  />
                )}
              </button>
            );
          })}
        </div>

        <div className="p-5 sm:p-7 lg:p-8">
          <div className="grid gap-7 xl:grid-cols-[1.4fr_0.8fr]">
            <div>
              <ProjectSelector
                projects={projects}
                projectId={projectId}
                setProjectId={setProjectId}
                loading={projectsLoading}
              />

              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, x: 14 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -14 }}
                  className="mt-6"
                >
                  {activeTab !== "github" ? (
                    <>
                      <input
                        ref={fileInputRef}
                        type="file"
                        hidden
                        accept={
                          activeTab === "zip"
                            ? ".zip,application/zip"
                            : ".js,.jsx,.mjs,.cjs,.ts,.tsx,.py,.java,.c,.h,.cpp,.cc,.cxx,.hpp,.cs,.go,.php,.rb,.rs"
                        }
                        onChange={(event) =>
                          handleFile(event.target.files?.[0])
                        }
                      />

                      <button
                        type="button"
                        onClick={() =>
                          fileInputRef.current?.click()
                        }
                        onDragEnter={(event) => {
                          event.preventDefault();
                          setDragging(true);
                        }}
                        onDragOver={(event) =>
                          event.preventDefault()
                        }
                        onDragLeave={() => setDragging(false)}
                        onDrop={handleDrop}
                        className={`flex min-h-72 w-full flex-col items-center justify-center rounded-3xl border-2 border-dashed px-6 text-center transition ${
                          dragging
                            ? "border-blue-500 bg-blue-500/10"
                            : "border-slate-300 bg-slate-50/60 hover:border-blue-400 hover:bg-blue-500/[0.04] dark:border-white/15 dark:bg-white/[0.02]"
                        }`}
                      >
                        <div className="rounded-3xl bg-gradient-to-br from-blue-600 to-violet-600 p-5 text-white shadow-xl shadow-blue-500/25">
                          {activeTab === "zip" ? (
                            <FolderArchive size={34} />
                          ) : (
                            <FileUp size={34} />
                          )}
                        </div>

                        <h3 className="mt-5 text-xl font-black text-slate-950 dark:text-white">
                          {selectedFile
                            ? selectedFile.name
                            : activeTab === "zip"
                              ? "Drop your ZIP project here"
                              : "Drop your source file here"}
                        </h3>

                        <p className="mt-2 max-w-md text-sm text-slate-500 dark:text-slate-400">
                          {selectedFile
                            ? `${(
                                selectedFile.size /
                                1024
                              ).toFixed(1)} KB selected`
                            : "Drag and drop or click to browse from your computer"}
                        </p>

                        {selectedFile && (
                          <span
                            role="button"
                            tabIndex={0}
                            onClick={(event) => {
                              event.stopPropagation();
                              resetInput();
                            }}
                            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-red-500/10 px-4 py-2 text-sm font-semibold text-red-500"
                          >
                            <X size={16} />
                            Remove file
                          </span>
                        )}
                      </button>
                    </>
                  ) : (
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">
                        Public GitHub Repository URL
                      </label>

                      <div className="relative">
                        <GitBranch
                          size={19}
                          className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                        />

                        <input
                          type="url"
                          value={repositoryUrl}
                          onChange={(event) => {
                            setRepositoryUrl(event.target.value);
                            setResult(null);
                          }}
                          placeholder="https://github.com/username/repository"
                          className="w-full rounded-2xl border border-slate-200 bg-white py-4 pl-12 pr-4 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-white/10 dark:bg-white/5 dark:text-white"
                        />
                      </div>

                      <div className="mt-5 rounded-3xl border border-blue-500/15 bg-blue-500/[0.06] p-5">
                        <div className="flex gap-3">
                          <GitBranch className="mt-0.5 text-blue-500" />

                          <div>
                            <h3 className="font-bold text-slate-950 dark:text-white">
                              Repository analysis
                            </h3>

                            <p className="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-400">
                              The repository will be cloned temporarily,
                              scanned recursively, analyzed using the
                              correct static analyzer, reviewed by AI,
                              and then deleted automatically.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>

              <UploadProgress progress={progress} />

              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting || projectsLoading}
                className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 px-5 py-4 text-sm font-bold text-white shadow-xl shadow-blue-500/25 transition hover:-translate-y-0.5 hover:shadow-2xl disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? (
                  <>
                    <LoaderCircle
                      size={20}
                      className="animate-spin"
                    />
                    Analyzing code...
                  </>
                ) : (
                  <>
                    <CurrentTabIcon size={20} />
                    Start AI Analysis
                  </>
                )}
              </button>

              <ResultSummary result={result} />
            </div>

            <div className="space-y-5">
              <div className="rounded-3xl bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-700 p-6 text-white shadow-2xl shadow-blue-500/20">
                <div className="inline-flex rounded-2xl bg-white/15 p-3 backdrop-blur">
                  <Code2 size={24} />
                </div>

                <h3 className="mt-5 text-xl font-black">
                  Multi-language intelligence
                </h3>

                <p className="mt-2 text-sm leading-6 text-white/75">
                  Static analysis is combined with Gemini AI to
                  generate security, architecture, performance and
                  maintainability insights.
                </p>
              </div>

              <GlassCard className="p-5">
                <h3 className="font-bold text-slate-950 dark:text-white">
                  Supported languages
                </h3>

                <div className="mt-4 flex flex-wrap gap-2">
                  {supportedLanguages.map((language) => (
                    <span
                      key={language}
                      className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300"
                    >
                      {language}
                    </span>
                  ))}
                </div>
              </GlassCard>

              <GlassCard className="p-5">
                <h3 className="font-bold text-slate-950 dark:text-white">
                  Analysis includes
                </h3>

                <div className="mt-4 space-y-3">
                  {[
                    "Static errors and warnings",
                    "Security and performance review",
                    "Architecture and maintainability",
                    "Technical debt recommendations",
                    "Downloadable PDF reports",
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
        </div>
      </GlassCard>
    </div>
  );
}