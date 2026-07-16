import {
  Bell,
  CheckCircle2,
  FileSearch,
  FolderKanban,
  GitBranch,
  LoaderCircle,
  Menu,
  Moon,
  Search,
  Sparkles,
  Sun,
  X,
} from "lucide-react";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { useNavigate } from "react-router-dom";

import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";

import { getProjects } from "../services/project.service";
import { getReviews } from "../services/review.service";

const formatDate = (dateValue) => {
  if (!dateValue) {
    return "Recently";
  }

  return new Date(dateValue).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function Navbar({
  collapsed,
  setMobileOpen,
}) {
  const navigate = useNavigate();

  const searchRef = useRef(null);
  const notificationRef = useRef(null);

  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();

  const [searchValue, setSearchValue] = useState("");
  const [projects, setProjects] = useState([]);
  const [reviews, setReviews] = useState([]);

  const [searchLoading, setSearchLoading] =
    useState(false);

  const [searchOpen, setSearchOpen] = useState(false);

  const [notificationsOpen, setNotificationsOpen] =
    useState(false);

  const [notificationsRead, setNotificationsRead] =
    useState(false);

  const firstLetter =
    user?.name?.trim()?.charAt(0)?.toUpperCase() || "U";

  useEffect(() => {
    const loadSearchData = async () => {
      try {
        setSearchLoading(true);

        const [projectData, reviewData] = await Promise.all([
          getProjects(),
          getReviews(),
        ]);

        setProjects(
          Array.isArray(projectData) ? projectData : []
        );

        setReviews(
          Array.isArray(reviewData) ? reviewData : []
        );
      } catch (error) {
        console.error(
          "NAVBAR SEARCH DATA ERROR:",
          error
        );
      } finally {
        setSearchLoading(false);
      }
    };

    loadSearchData();
  }, []);

  useEffect(() => {
    const closeDropdowns = (event) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target)
      ) {
        setSearchOpen(false);
      }

      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setNotificationsOpen(false);
      }
    };

    document.addEventListener(
      "mousedown",
      closeDropdowns
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        closeDropdowns
      );
    };
  }, []);

  const searchResults = useMemo(() => {
    const keyword = searchValue
      .trim()
      .toLowerCase();

    if (!keyword) {
      return {
        projects: [],
        reviews: [],
      };
    }

    const projectMatches = projects
      .filter((project) => {
        return (
          project.title
            ?.toLowerCase()
            .includes(keyword) ||
          project.language
            ?.toLowerCase()
            .includes(keyword) ||
          project.description
            ?.toLowerCase()
            .includes(keyword)
        );
      })
      .slice(0, 5);

    const reviewMatches = reviews
      .filter((review) => {
        const projectTitle =
          review.project?.title || "";

        const folderName =
          review.folderName || "";

        const languages = Object.keys(
          review.languageSummary || {}
        ).join(" ");

        return (
          projectTitle
            .toLowerCase()
            .includes(keyword) ||
          folderName
            .toLowerCase()
            .includes(keyword) ||
          languages
            .toLowerCase()
            .includes(keyword)
        );
      })
      .slice(0, 5);

    return {
      projects: projectMatches,
      reviews: reviewMatches,
    };
  }, [projects, reviews, searchValue]);

  const latestNotifications = useMemo(() => {
    return [...reviews]
      .sort(
        (first, second) =>
          new Date(second.createdAt) -
          new Date(first.createdAt)
      )
      .slice(0, 5);
  }, [reviews]);

  const totalSearchResults =
    searchResults.projects.length +
    searchResults.reviews.length;

  const openProject = (project) => {
    setSearchValue("");
    setSearchOpen(false);

    navigate("/projects", {
      state: {
        projectId: project.id,
      },
    });
  };

  const openReview = (review) => {
    setSearchValue("");
    setSearchOpen(false);

    navigate("/reviews", {
      state: {
        reviewId: review.id,
      },
    });
  };

  const openNotification = (review) => {
    setNotificationsOpen(false);
    setNotificationsRead(true);

    navigate("/reviews", {
      state: {
        reviewId: review.id,
      },
    });
  };

  const handleSearchKeyDown = (event) => {
    if (event.key === "Escape") {
      setSearchOpen(false);
      return;
    }

    if (
      event.key === "Enter" &&
      totalSearchResults > 0
    ) {
      if (searchResults.projects.length > 0) {
        openProject(searchResults.projects[0]);
      } else {
        openReview(searchResults.reviews[0]);
      }
    }
  };

  return (
    <header
      className={`fixed left-0 right-0 top-0 z-30 h-20 border-b border-slate-200/70 bg-white/80 backdrop-blur-2xl transition-all duration-300 dark:border-white/10 dark:bg-[#050b16]/80 ${
        collapsed
          ? "lg:left-[88px]"
          : "lg:left-[270px]"
      }`}
    >
      <div className="flex h-full items-center justify-between gap-4 px-4 sm:px-6">
        {/* LEFT SECTION */}
        <div className="flex min-w-0 items-center gap-4">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="rounded-xl border border-slate-200 bg-white p-2.5 text-slate-700 shadow-sm transition hover:shadow-lg dark:border-white/10 dark:bg-white/5 dark:text-white lg:hidden"
          >
            <Menu size={20} />
          </button>

          {/* GLOBAL SEARCH */}
          <div
            ref={searchRef}
            className="relative hidden xl:block"
          >
            <div className="flex w-[430px] items-center gap-3 rounded-2xl border border-slate-200/70 bg-white/80 px-4 py-3 shadow-md backdrop-blur-xl transition-all focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/10 dark:border-white/10 dark:bg-white/[0.05]">
              {searchLoading ? (
                <LoaderCircle
                  size={18}
                  className="animate-spin text-blue-500"
                />
              ) : (
                <Search
                  size={18}
                  className="text-slate-400"
                />
              )}

              <input
                type="text"
                value={searchValue}
                onFocus={() => setSearchOpen(true)}
                onChange={(event) => {
                  setSearchValue(event.target.value);
                  setSearchOpen(true);
                }}
                onKeyDown={handleSearchKeyDown}
                placeholder="Search projects, reviews, repositories..."
                className="w-full bg-transparent text-sm font-medium text-slate-900 outline-none placeholder:text-slate-400 dark:text-white"
              />

              {searchValue && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchValue("");
                    setSearchOpen(false);
                  }}
                  className="rounded-lg p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-white/10 dark:hover:text-white"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {searchOpen && searchValue.trim() && (
              <div className="absolute left-0 top-[calc(100%+12px)] z-50 max-h-[520px] w-[500px] overflow-y-auto rounded-3xl border border-slate-200 bg-white p-3 shadow-2xl dark:border-white/10 dark:bg-[#09111f]">
                {totalSearchResults === 0 ? (
                  <div className="px-5 py-10 text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                      <Search size={23} />
                    </div>

                    <p className="mt-4 font-bold text-slate-950 dark:text-white">
                      No results found
                    </p>

                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                      Try searching another project,
                      language or repository.
                    </p>
                  </div>
                ) : (
                  <>
                    {searchResults.projects.length >
                      0 && (
                      <div>
                        <p className="px-3 pb-2 pt-1 text-[11px] font-black uppercase tracking-wider text-slate-400">
                          Projects
                        </p>

                        <div className="space-y-1">
                          {searchResults.projects.map(
                            (project) => (
                              <button
                                key={project.id}
                                type="button"
                                onClick={() =>
                                  openProject(project)
                                }
                                className="flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition hover:bg-blue-500/[0.07]"
                              >
                                <div className="rounded-xl bg-blue-500/10 p-2.5 text-blue-600 dark:text-blue-400">
                                  <FolderKanban
                                    size={18}
                                  />
                                </div>

                                <div className="min-w-0 flex-1">
                                  <p className="truncate text-sm font-bold text-slate-950 dark:text-white">
                                    {project.title}
                                  </p>

                                  <p className="mt-0.5 truncate text-xs text-slate-500 dark:text-slate-400">
                                    {project.language}
                                  </p>
                                </div>

                                <span className="rounded-lg bg-slate-100 px-2 py-1 text-[10px] font-bold text-slate-500 dark:bg-white/5 dark:text-slate-400">
                                  PROJECT
                                </span>
                              </button>
                            )
                          )}
                        </div>
                      </div>
                    )}

                    {searchResults.reviews.length >
                      0 && (
                      <div
                        className={
                          searchResults.projects.length >
                          0
                            ? "mt-3 border-t border-slate-200 pt-3 dark:border-white/10"
                            : ""
                        }
                      >
                        <p className="px-3 pb-2 pt-1 text-[11px] font-black uppercase tracking-wider text-slate-400">
                          Reviews
                        </p>

                        <div className="space-y-1">
                          {searchResults.reviews.map(
                            (review) => (
                              <button
                                key={review.id}
                                type="button"
                                onClick={() =>
                                  openReview(review)
                                }
                                className="flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition hover:bg-violet-500/[0.07]"
                              >
                                <div className="rounded-xl bg-violet-500/10 p-2.5 text-violet-600 dark:text-violet-400">
                                  <FileSearch
                                    size={18}
                                  />
                                </div>

                                <div className="min-w-0 flex-1">
                                  <p className="truncate text-sm font-bold text-slate-950 dark:text-white">
                                    {review.project
                                      ?.title ||
                                      review.folderName ||
                                      "Project Scan"}
                                  </p>

                                  <p className="mt-0.5 truncate text-xs text-slate-500 dark:text-slate-400">
                                    Score:{" "}
                                    {review.overallScore ??
                                      "Pending"}
                                    /100
                                    {" • "}
                                    {review.folderName}
                                  </p>
                                </div>

                                <span className="rounded-lg bg-violet-500/10 px-2 py-1 text-[10px] font-bold text-violet-600 dark:text-violet-400">
                                  REVIEW
                                </span>
                              </button>
                            )
                          )}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
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

        {/* RIGHT SECTION */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={toggleTheme}
            title={
              theme === "dark"
                ? "Switch to light mode"
                : "Switch to dark mode"
            }
            className="rounded-2xl border border-slate-200/70 bg-white/80 p-3 text-slate-700 shadow-md backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-white/10 dark:bg-white/[0.05] dark:text-white"
          >
            {theme === "dark" ? (
              <Sun size={20} />
            ) : (
              <Moon size={20} />
            )}
          </button>

          {/* NOTIFICATIONS */}
          <div
            ref={notificationRef}
            className="relative"
          >
            <button
              type="button"
              onClick={() => {
                setNotificationsOpen(
                  (current) => !current
                );

                setSearchOpen(false);

                if (!notificationsOpen) {
                  setNotificationsRead(true);
                }
              }}
              className="relative rounded-2xl border border-slate-200/70 bg-white/80 p-3 text-slate-700 shadow-md backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-white/10 dark:bg-white/[0.05] dark:text-white"
            >
              <Bell size={20} />

              {!notificationsRead &&
                latestNotifications.length > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white shadow-lg">
                    {Math.min(
                      latestNotifications.length,
                      9
                    )}
                  </span>
                )}
            </button>

            {notificationsOpen && (
              <div className="absolute right-0 top-[calc(100%+12px)] z-50 w-[360px] overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl dark:border-white/10 dark:bg-[#09111f]">
                <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-white/10">
                  <div>
                    <h3 className="font-black text-slate-950 dark:text-white">
                      Notifications
                    </h3>

                    <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                      Latest completed project scans
                    </p>
                  </div>

                  <CheckCircle2
                    size={20}
                    className="text-emerald-500"
                  />
                </div>

                {latestNotifications.length === 0 ? (
                  <div className="p-10 text-center">
                    <Bell
                      size={28}
                      className="mx-auto text-slate-300"
                    />

                    <p className="mt-3 text-sm font-bold text-slate-950 dark:text-white">
                      No notifications
                    </p>
                  </div>
                ) : (
                  <div className="max-h-[420px] divide-y divide-slate-200 overflow-y-auto dark:divide-white/10">
                    {latestNotifications.map(
                      (review) => (
                        <button
                          key={review.id}
                          type="button"
                          onClick={() =>
                            openNotification(review)
                          }
                          className="flex w-full items-start gap-3 px-5 py-4 text-left transition hover:bg-slate-50 dark:hover:bg-white/[0.04]"
                        >
                          <div className="rounded-xl bg-emerald-500/10 p-2.5 text-emerald-500">
                            <GitBranch size={17} />
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-bold text-slate-950 dark:text-white">
                              {review.project?.title ||
                                review.folderName ||
                                "Project Scan"}
                            </p>

                            <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
                              Analysis completed with score{" "}
                              <span className="font-bold text-emerald-600 dark:text-emerald-400">
                                {review.overallScore ??
                                  "Pending"}
                                /100
                              </span>
                            </p>

                            <p className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                              {formatDate(
                                review.createdAt
                              )}
                            </p>
                          </div>
                        </button>
                      )
                    )}
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => {
                    setNotificationsOpen(false);
                    navigate("/reviews");
                  }}
                  className="w-full border-t border-slate-200 px-5 py-3.5 text-sm font-bold text-blue-600 transition hover:bg-blue-500/[0.06] dark:border-white/10 dark:text-blue-400"
                >
                  View All Reviews
                </button>
              </div>
            )}
          </div>

          {/* PROFILE */}
          <button
            type="button"
            onClick={() => navigate("/settings")}
            className="ml-1 flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-white/80 px-3 py-2 text-left shadow-md backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-white/10 dark:bg-white/[0.05]"
          >
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
          </button>
        </div>
      </div>
    </header>
  );
}