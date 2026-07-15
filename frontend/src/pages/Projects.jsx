import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Code2,
  Edit3,
  FolderKanban,
  LoaderCircle,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "sonner";

import {
  createProject,
  deleteProject,
  getProjects,
  updateProject,
} from "../services/project.service";

const emptyForm = {
  title: "",
  description: "",
  language: "JavaScript",
};

const languages = [
  "JavaScript",
  "JavaScript React",
  "TypeScript",
  "TypeScript React",
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

function ProjectModal({
  open,
  onClose,
  editingProject,
  onSaved,
}) {
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (editingProject) {
      setForm({
        title: editingProject.title || "",
        description: editingProject.description || "",
        language: editingProject.language || "JavaScript",
      });
    } else {
      setForm(emptyForm);
    }
  }, [editingProject, open]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.title.trim()) {
      toast.error("Project title is required");
      return;
    }

    try {
      setSaving(true);

      if (editingProject) {
        await updateProject(editingProject.id, {
          title: form.title.trim(),
          description: form.description.trim(),
          language: form.language,
        });

        toast.success("Project updated successfully");
      } else {
        await createProject({
          title: form.title.trim(),
          description: form.description.trim(),
          language: form.language,
        });

        toast.success("Project created successfully");
      }

      await onSaved();
      onClose();
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Failed to save project"
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.button
            type="button"
            aria-label="Close modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-xl -translate-x-1/2 -translate-y-1/2 rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-white/10 dark:bg-[#0b1220]"
          >
            <div className="mb-6 flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-black text-slate-950 dark:text-white">
                  {editingProject
                    ? "Edit Project"
                    : "Create Project"}
                </h2>

                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Save project details before running code reviews.
                </p>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="rounded-xl p-2 text-slate-500 transition hover:bg-slate-100 dark:hover:bg-white/10"
              >
                <X size={20} />
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="space-y-5"
            >
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">
                  Project Title
                </label>

                <input
                  value={form.title}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      title: event.target.value,
                    }))
                  }
                  placeholder="Expense Tracker Pro"
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-white/10 dark:bg-white/5 dark:text-white"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">
                  Description
                </label>

                <textarea
                  rows={4}
                  value={form.description}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      description: event.target.value,
                    }))
                  }
                  placeholder="Describe your project..."
                  className="w-full resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-white/10 dark:bg-white/5 dark:text-white"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">
                  Primary Language
                </label>

                <select
                  value={form.language}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      language: event.target.value,
                    }))
                  }
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-white/10 dark:bg-white/5 dark:text-white"
                >
                  {languages.map((language) => (
                    <option
                      key={language}
                      value={language}
                      className="text-slate-900"
                    >
                      {language}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-violet-600 px-5 py-4 font-bold text-white shadow-xl shadow-blue-500/25 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving && (
                  <LoaderCircle
                    size={19}
                    className="animate-spin"
                  />
                )}

                {editingProject
                  ? "Update Project"
                  : "Create Project"}
              </button>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProject, setEditingProject] =
    useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const loadProjects = async () => {
    try {
      const data = await getProjects();
      setProjects(data);
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Failed to load projects"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const filteredProjects = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) {
      return projects;
    }

    return projects.filter((project) => {
      return (
        project.title.toLowerCase().includes(keyword) ||
        project.language.toLowerCase().includes(keyword) ||
        project.description
          ?.toLowerCase()
          .includes(keyword)
      );
    });
  }, [projects, search]);

  const openCreateModal = () => {
    setEditingProject(null);
    setModalOpen(true);
  };

  const openEditModal = (project) => {
    setEditingProject(project);
    setModalOpen(true);
  };

  const handleDelete = async (project) => {
    const confirmed = window.confirm(
      `Delete "${project.title}"?\n\nIts reviews and scans will also be deleted.`
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(project.id);

      await deleteProject(project.id);

      setProjects((current) =>
        current.filter((item) => item.id !== project.id)
      );

      toast.success("Project deleted successfully");
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Failed to delete project"
      );
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-7">
      <div className="flex flex-col justify-between gap-5 xl:flex-row xl:items-center">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-blue-600 dark:text-blue-400">
            <FolderKanban size={17} />
            Project management
          </div>

          <h1 className="text-3xl font-black text-slate-950 dark:text-white sm:text-4xl">
            Projects
          </h1>

          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Create and manage projects before analyzing files,
            ZIP archives or GitHub repositories.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-violet-600 px-5 py-3.5 text-sm font-bold text-white shadow-xl shadow-blue-500/25 transition hover:-translate-y-0.5"
        >
          <Plus size={19} />
          New Project
        </button>
      </div>

      <div className="relative max-w-xl">
        <Search
          size={19}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
        />

        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search by title, language or description..."
          className="w-full rounded-2xl border border-slate-200 bg-white py-4 pl-12 pr-4 text-sm text-slate-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-white/10 dark:bg-white/5 dark:text-white"
        />
      </div>

      {loading ? (
        <div className="flex min-h-80 items-center justify-center">
          <LoaderCircle
            size={34}
            className="animate-spin text-blue-500"
          />
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white/60 p-12 text-center dark:border-white/15 dark:bg-white/[0.03]">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
            <FolderKanban size={30} />
          </div>

          <h2 className="mt-5 text-xl font-black text-slate-950 dark:text-white">
            No projects found
          </h2>

          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Create a project to start reviewing your code.
          </p>

          <button
            type="button"
            onClick={openCreateModal}
            className="mt-6 rounded-2xl bg-gradient-to-r from-blue-600 to-violet-600 px-5 py-3 text-sm font-bold text-white"
          >
            Create Project
          </button>
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filteredProjects.map((project, index) => (
            <motion.article
              key={project.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="group relative overflow-hidden rounded-3xl border border-white/70 bg-white/80 p-6 shadow-xl shadow-slate-200/40 backdrop-blur-xl transition hover:-translate-y-1 hover:shadow-2xl dark:border-white/10 dark:bg-white/[0.045] dark:shadow-black/20"
            >
              <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-gradient-to-br from-blue-500/20 to-violet-500/20 blur-3xl" />

              <div className="relative">
                <div className="flex items-start justify-between gap-4">
                  <div className="rounded-2xl bg-gradient-to-br from-blue-600 to-violet-600 p-3 text-white shadow-lg shadow-blue-500/20">
                    <Code2 size={23} />
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => openEditModal(project)}
                      className="rounded-xl bg-blue-500/10 p-2.5 text-blue-600 transition hover:bg-blue-500/20 dark:text-blue-400"
                    >
                      <Edit3 size={17} />
                    </button>

                    <button
                      type="button"
                      disabled={deletingId === project.id}
                      onClick={() => handleDelete(project)}
                      className="rounded-xl bg-red-500/10 p-2.5 text-red-500 transition hover:bg-red-500/20 disabled:opacity-50"
                    >
                      {deletingId === project.id ? (
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

                <h2 className="mt-5 text-xl font-black text-slate-950 dark:text-white">
                  {project.title}
                </h2>

                <p className="mt-2 min-h-12 text-sm leading-6 text-slate-500 dark:text-slate-400">
                  {project.description ||
                    "No project description provided."}
                </p>

                <div className="mt-5 flex items-center justify-between">
                  <span className="rounded-xl bg-violet-500/10 px-3 py-2 text-xs font-bold text-violet-600 dark:text-violet-400">
                    {project.language}
                  </span>

                  <span className="text-xs text-slate-400">
                    ID: {project.id}
                  </span>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      )}

      <ProjectModal
        open={modalOpen}
        editingProject={editingProject}
        onClose={() => setModalOpen(false)}
        onSaved={loadProjects}
      />
    </div>
  );
}