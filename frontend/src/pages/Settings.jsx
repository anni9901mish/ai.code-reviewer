import { motion } from "framer-motion";
import {
  Bell,
  Check,
  KeyRound,
  LoaderCircle,
  LockKeyhole,
  LogOut,
  Mail,
  Moon,
  Palette,
  Save,
  ShieldCheck,
  Sun,
  Trash2,
  UserRound,
} from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import {
  changePassword as changePasswordRequest,
  deleteAccount,
  getProfile,
  updateProfile,
} from "../services/account.service";
import { useEffect, useMemo, useState } from "react";

function GlassCard({ children, className = "" }) {
  return (
    <div
      className={`rounded-3xl border border-white/70 bg-white/80 shadow-xl shadow-slate-200/40 backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.045] dark:shadow-black/20 ${className}`}
    >
      {children}
    </div>
  );
}

function SectionHeader({
  title,
  description,
  icon: Icon,
  iconClass = "bg-blue-500/10 text-blue-600 dark:text-blue-400",
}) {
  return (
    <div className="flex items-start gap-3">
      <div className={`rounded-2xl p-3 ${iconClass}`}>
        <Icon size={21} />
      </div>

      <div>
        <h2 className="text-lg font-black text-slate-950 dark:text-white">
          {title}
        </h2>

        <p className="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-400">
          {description}
        </p>
      </div>
    </div>
  );
}

export default function Settings() {
  const navigate = useNavigate();

  const { user, setUser, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const storedUser = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user")) || {};
    } catch {
      return {};
    }
  }, []);

  const [profile, setProfile] = useState({
    name: user?.name || storedUser?.name || "",
    email: user?.email || storedUser?.email || "",
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [notifications, setNotifications] = useState({
    reviewCompleted: true,
    securityAlerts: true,
    weeklySummary: false,
    productUpdates: false,
  });

  const [savingProfile, setSavingProfile] = useState(false);
  const [changingPassword, setChangingPassword] =
    useState(false);

  const [deletePassword, setDeletePassword] = useState("");
  const [deletingAccount, setDeletingAccount] =
    useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const profileData = await getProfile();

        setProfile({
          name: profileData.name || "",
          email: profileData.email || "",
        });

        localStorage.setItem(
          "user",
          JSON.stringify(profileData)
        );

        setUser(profileData);
      } catch (error) {
        toast.error(
          error.response?.data?.message ||
            "Failed to load profile"
        );
      }
    };

    loadProfile();
  }, [setUser]);

  const firstLetter =
    profile.name?.trim()?.charAt(0)?.toUpperCase() || "U";

  const handleProfileChange = (event) => {
    const { name, value } = event.target;

    setProfile((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const saveProfile = async () => {
    if (!profile.name.trim()) {
      toast.error("Name is required");
      return;
    }

    if (!profile.email.trim()) {
      toast.error("Email is required");
      return;
    }

    try {
      setSavingProfile(true);

      const response = await updateProfile({
        name: profile.name.trim(),
        email: profile.email.trim(),
      });

      localStorage.setItem(
        "user",
        JSON.stringify(response.user)
      );

      setUser(response.user);

      setProfile({
        name: response.user.name || "",
        email: response.user.email || "",
      });

      toast.success(response.message);
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Failed to update profile"
      );
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordChange = (event) => {
    const { name, value } = event.target;

    setPasswordForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleChangePassword = async () => {
    if (!passwordForm.currentPassword) {
      toast.error("Current password is required");
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      toast.error(
        "New password must be at least 6 characters"
      );
      return;
    }

    if (
      passwordForm.newPassword !==
      passwordForm.confirmPassword
    ) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      setChangingPassword(true);

      const response = await changePasswordRequest({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });

      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      toast.success(response.message);
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Failed to change password"
      );
    } finally {
      setChangingPassword(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleDeleteAccount = async () => {
    if (!deletePassword) {
      toast.error(
        "Enter your password to delete the account"
      );
      return;
    }

    const confirmed = window.confirm(
      "Your account, projects, reviews and scans will be permanently deleted. Continue?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingAccount(true);

      const response = await deleteAccount(deletePassword);

      toast.success(response.message);

      logout();
      navigate("/login");
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Failed to delete account"
      );
    } finally {
      setDeletingAccount(false);
    }
  };

  return (
    <div className="space-y-7">
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-blue-600 dark:text-blue-400">
          <ShieldCheck size={17} />
          Account and application preferences
        </div>

        <h1 className="text-3xl font-black tracking-tight text-slate-950 dark:text-white sm:text-4xl">
          Settings
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">
          Manage your profile, theme, notifications, security
          preferences and account actions.
        </p>
      </motion.section>

      <section className="grid gap-6 xl:grid-cols-[0.8fr_1.4fr]">
        <div className="space-y-6">
          <GlassCard className="p-6">
            <div className="flex flex-col items-center text-center">
              <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-blue-600 via-violet-600 to-purple-600 text-4xl font-black text-white shadow-xl shadow-blue-500/30">
                {firstLetter}
              </div>

              <h2 className="mt-5 text-xl font-black text-slate-950 dark:text-white">
                {profile.name || "User"}
              </h2>

              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                {profile.email || "No email available"}
              </p>

              <span className="mt-4 rounded-full bg-emerald-500/10 px-4 py-2 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                Active Account
              </span>
            </div>
          </GlassCard>

          <GlassCard className="p-6">
            <SectionHeader
              title="Appearance"
              description="Switch between premium light and dark themes."
              icon={Palette}
              iconClass="bg-violet-500/10 text-violet-600 dark:text-violet-400"
            />

            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  if (theme !== "light") {
                    toggleTheme();
                  }
                }}
                className={`rounded-2xl border p-4 text-left transition ${
                  theme === "light"
                    ? "border-blue-500 bg-blue-500/10"
                    : "border-slate-200 bg-slate-50 hover:border-blue-300 dark:border-white/10 dark:bg-white/[0.03]"
                }`}
              >
                <Sun
                  size={22}
                  className={
                    theme === "light"
                      ? "text-blue-600"
                      : "text-slate-500"
                  }
                />

                <p className="mt-3 font-black text-slate-950 dark:text-white">
                  Light
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Bright and clean
                </p>

                {theme === "light" && (
                  <Check
                    size={16}
                    className="mt-3 text-blue-600"
                  />
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  if (theme !== "dark") {
                    toggleTheme();
                  }
                }}
                className={`rounded-2xl border p-4 text-left transition ${
                  theme === "dark"
                    ? "border-violet-500 bg-violet-500/10"
                    : "border-slate-200 bg-slate-50 hover:border-violet-300 dark:border-white/10 dark:bg-white/[0.03]"
                }`}
              >
                <Moon
                  size={22}
                  className={
                    theme === "dark"
                      ? "text-violet-500"
                      : "text-slate-500"
                  }
                />

                <p className="mt-3 font-black text-slate-950 dark:text-white">
                  Dark
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Deep premium theme
                </p>

                {theme === "dark" && (
                  <Check
                    size={16}
                    className="mt-3 text-violet-500"
                  />
                )}
              </button>
            </div>
          </GlassCard>

          <GlassCard className="p-6">
            <SectionHeader
              title="Session"
              description="Sign out securely from this device."
              icon={LogOut}
              iconClass="bg-red-500/10 text-red-500"
            />

            <button
              type="button"
              onClick={handleLogout}
              className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-red-500/10 px-5 py-3.5 font-bold text-red-500 transition hover:bg-red-500/20"
            >
              <LogOut size={18} />
              Logout
            </button>
          </GlassCard>
        </div>

        <div className="space-y-6">
          <GlassCard className="p-6">
            <SectionHeader
              title="Profile Information"
              description="Update your personal account information."
              icon={UserRound}
            />

            <div className="mt-6 grid gap-5 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-bold text-slate-700 dark:text-slate-200">
                  Full Name
                </label>

                <div className="relative">
                  <UserRound
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    name="name"
                    value={profile.name}
                    onChange={handleProfileChange}
                    placeholder="Your full name"
                    className="w-full rounded-2xl border border-slate-200 bg-white py-3.5 pl-12 pr-4 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-white/10 dark:bg-white/5 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-slate-700 dark:text-slate-200">
                  Email Address
                </label>

                <div className="relative">
                  <Mail
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    name="email"
                    type="email"
                    value={profile.email}
                    onChange={handleProfileChange}
                    placeholder="you@example.com"
                    className="w-full rounded-2xl border border-slate-200 bg-white py-3.5 pl-12 pr-4 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-white/10 dark:bg-white/5 dark:text-white"
                  />
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={saveProfile}
              disabled={savingProfile}
              className="mt-6 inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-violet-600 px-5 py-3.5 font-bold text-white shadow-xl shadow-blue-500/25 transition hover:-translate-y-0.5 disabled:opacity-60"
            >
              {savingProfile ? (
                <LoaderCircle
                  size={18}
                  className="animate-spin"
                />
              ) : (
                <Save size={18} />
              )}

              Save Profile
            </button>
          </GlassCard>

          <GlassCard className="p-6">
            <SectionHeader
              title="Change Password"
              description="Use a strong password to protect your account."
              icon={KeyRound}
              iconClass="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
            />

            <div className="mt-6 space-y-5">
              {[
                {
                  name: "currentPassword",
                  label: "Current Password",
                  placeholder: "Enter current password",
                },
                {
                  name: "newPassword",
                  label: "New Password",
                  placeholder: "Minimum 6 characters",
                },
                {
                  name: "confirmPassword",
                  label: "Confirm New Password",
                  placeholder: "Re-enter new password",
                },
              ].map((field) => (
                <div key={field.name}>
                  <label className="mb-2 block text-sm font-bold text-slate-700 dark:text-slate-200">
                    {field.label}
                  </label>

                  <div className="relative">
                    <LockKeyhole
                      size={18}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      name={field.name}
                      type="password"
                      value={passwordForm[field.name]}
                      onChange={handlePasswordChange}
                      placeholder={field.placeholder}
                      className="w-full rounded-2xl border border-slate-200 bg-white py-3.5 pl-12 pr-4 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 dark:border-white/10 dark:bg-white/5 dark:text-white"
                    />
                  </div>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={handleChangePassword}
              disabled={changingPassword}
              className="mt-6 inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-5 py-3.5 font-bold text-white shadow-lg shadow-emerald-500/20 transition hover:-translate-y-0.5 disabled:opacity-60"
            >
              {changingPassword ? (
                <LoaderCircle
                  size={18}
                  className="animate-spin"
                />
              ) : (
                <KeyRound size={18} />
              )}

              Update Password
            </button>
          </GlassCard>

          <GlassCard className="p-6">
            <SectionHeader
              title="Notifications"
              description="Choose which application updates you want to receive."
              icon={Bell}
              iconClass="bg-orange-500/10 text-orange-500"
            />

            <div className="mt-6 space-y-4">
              {[
                {
                  key: "reviewCompleted",
                  title: "Review Completed",
                  description:
                    "Notify me when an analysis finishes.",
                },
                {
                  key: "securityAlerts",
                  title: "Security Alerts",
                  description:
                    "Notify me about critical security issues.",
                },
                {
                  key: "weeklySummary",
                  title: "Weekly Summary",
                  description:
                    "Send a weekly code-quality summary.",
                },
                {
                  key: "productUpdates",
                  title: "Product Updates",
                  description:
                    "Receive feature and platform updates.",
                },
              ].map((item) => {
                const enabled = notifications[item.key];

                return (
                  <div
                    key={item.key}
                    className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-50/70 p-4 dark:border-white/10 dark:bg-white/[0.03]"
                  >
                    <div>
                      <p className="font-bold text-slate-950 dark:text-white">
                        {item.title}
                      </p>

                      <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
                        {item.description}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        setNotifications((current) => ({
                          ...current,
                          [item.key]: !current[item.key],
                        }))
                      }
                      className={`relative h-7 w-12 shrink-0 rounded-full transition ${
                        enabled
                          ? "bg-gradient-to-r from-blue-600 to-violet-600"
                          : "bg-slate-300 dark:bg-white/15"
                      }`}
                    >
                      <span
                        className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition ${
                          enabled ? "left-6" : "left-1"
                        }`}
                      />
                    </button>
                  </div>
                );
              })}
            </div>
          </GlassCard>

          <GlassCard className="border-red-500/20 p-6">
            <SectionHeader
              title="Danger Zone"
              description="Permanent actions that cannot be undone."
              icon={Trash2}
              iconClass="bg-red-500/10 text-red-500"
            />

            <div className="mt-6 rounded-2xl border border-red-500/20 bg-red-500/[0.05] p-5">
              <h3 className="font-black text-red-500">
                Delete Account
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
                Deleting your account will permanently remove
                projects, reviews, scans and saved reports.
              </p>

              <div className="relative mt-5">
                <LockKeyhole
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-red-400"
                />

                <input
                  type="password"
                  value={deletePassword}
                  onChange={(event) =>
                    setDeletePassword(event.target.value)
                  }
                  placeholder="Enter password to confirm deletion"
                  className="w-full rounded-2xl border border-red-500/20 bg-white py-3.5 pl-12 pr-4 text-sm text-slate-900 outline-none focus:border-red-500 focus:ring-4 focus:ring-red-500/10 dark:bg-white/5 dark:text-white"
                />
              </div>

              <button
                type="button"
                onClick={handleDeleteAccount}
                disabled={deletingAccount}
                className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-red-500 px-5 py-3 font-bold text-white shadow-lg shadow-red-500/20 transition hover:bg-red-600 disabled:opacity-60"
              >
                {deletingAccount ? (
                  <LoaderCircle
                    size={18}
                    className="animate-spin"
                  />
                ) : (
                  <Trash2 size={18} />
                )}

                Delete Account
              </button>
            </div>
          </GlassCard>
        </div>
      </section>
    </div>
  );
}