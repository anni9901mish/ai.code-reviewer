import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { loginUser } from "../services/auth.service";
import { useAuth } from "../context/AuthContext";
import { toast } from "sonner";
import {
  FaCode,
  FaGithub,
  FaRobot,
  FaShieldAlt,
  FaEnvelope,
  FaLock,
} from "react-icons/fa";
import { BsStars } from "react-icons/bs";
import { HiArrowRight } from "react-icons/hi";

export default function Login() {
  const navigate = useNavigate();
  const { setUser } = useAuth();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.email.trim() || !form.password.trim()) {
      toast.error("Please enter email and password");
      return;
    }

    try {
      setLoading(true);

      const data = await loginUser(form);

      setUser(data.user);

      toast.success("Login Successful");

      navigate("/dashboard");
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Login failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#050816] px-5 py-10">
      <div className="absolute left-[-120px] top-[-120px] h-80 w-80 rounded-full bg-blue-600/20 blur-[120px]" />

      <div className="absolute bottom-[-140px] right-[-100px] h-96 w-96 rounded-full bg-purple-600/20 blur-[140px]" />

      <div className="absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-500/5 blur-[120px]" />

      <div className="relative z-10 mx-auto flex min-h-[calc(100vh-80px)] max-w-6xl items-center justify-center">
        <div className="grid w-full overflow-hidden rounded-3xl border border-slate-800 bg-slate-950/70 shadow-2xl shadow-blue-950/40 backdrop-blur-xl lg:grid-cols-2">
          <div className="relative hidden overflow-hidden border-r border-slate-800 bg-gradient-to-br from-blue-600/20 via-slate-950 to-purple-600/20 p-12 lg:flex lg:flex-col lg:justify-between">
            <div>
              <div className="mb-8 flex items-center gap-3">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 via-blue-600 to-purple-600 shadow-lg shadow-blue-500/30">
                  <FaCode className="text-2xl text-white" />
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-3xl font-black text-white">
                      CodeInsight AI
                    </h1>

                    <BsStars className="text-xl text-yellow-400" />
                  </div>

                  <p className="text-sm text-slate-400">
                    AI-Powered Code Review Platform
                  </p>
                </div>
              </div>

              <h2 className="max-w-lg text-4xl font-bold leading-tight text-white">
                Write better code with intelligent analysis.
              </h2>

              <p className="mt-5 max-w-lg leading-7 text-slate-400">
                Review source files, scan GitHub repositories,
                analyze ZIP projects and generate professional
                reports from one powerful dashboard.
              </p>

              <div className="mt-10 grid grid-cols-2 gap-4">
                <div className="rounded-2xl border border-slate-700/70 bg-slate-900/70 p-4">
                  <FaRobot className="mb-3 text-2xl text-cyan-400" />

                  <h3 className="font-semibold text-white">
                    AI Reviews
                  </h3>

                  <p className="mt-1 text-sm text-slate-400">
                    Smart suggestions and code quality feedback.
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-700/70 bg-slate-900/70 p-4">
                  <FaGithub className="mb-3 text-2xl text-white" />

                  <h3 className="font-semibold text-white">
                    GitHub Scan
                  </h3>

                  <p className="mt-1 text-sm text-slate-400">
                    Analyze complete repositories directly.
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-700/70 bg-slate-900/70 p-4">
                  <FaShieldAlt className="mb-3 text-2xl text-emerald-400" />

                  <h3 className="font-semibold text-white">
                    Secure Platform
                  </h3>

                  <p className="mt-1 text-sm text-slate-400">
                    Protected accounts and private reviews.
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-700/70 bg-slate-900/70 p-4">
                  <FaCode className="mb-3 text-2xl text-blue-400" />

                  <h3 className="font-semibold text-white">
                    Static Analysis
                  </h3>

                  <p className="mt-1 text-sm text-slate-400">
                    Detect errors, warnings and bad practices.
                  </p>
                </div>
              </div>
            </div>

            <p className="mt-12 text-sm text-slate-500">
              Built for developers who care about clean,
              secure and maintainable code.
            </p>
          </div>

          <div className="flex items-center justify-center p-6 sm:p-10 lg:p-12">
            <form
              onSubmit={handleSubmit}
              className="w-full max-w-md"
            >
              <div className="mb-8 lg:hidden">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 via-blue-600 to-purple-600 shadow-lg shadow-blue-500/20">
                    <FaCode className="text-xl text-white" />
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h1 className="text-2xl font-black text-white">
                        CodeInsight AI
                      </h1>

                      <BsStars className="text-yellow-400" />
                    </div>

                    <p className="text-xs text-slate-400">
                      Intelligent Code Review Platform
                    </p>
                  </div>
                </div>
              </div>

              <div className="mb-8">
                <p className="mb-2 text-sm font-medium uppercase tracking-[0.2em] text-blue-400">
                  Welcome back
                </p>

                <h2 className="text-3xl font-bold text-white sm:text-4xl">
                  Sign in to continue
                </h2>

                <p className="mt-3 text-slate-400">
                  Access your projects, reviews and analytics.
                </p>
              </div>

              <div className="mb-5">
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-medium text-slate-300"
                >
                  Email address
                </label>

                <div className="relative">
                  <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />

                  <input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={handleChange}
                    autoComplete="email"
                    className="w-full rounded-xl border border-slate-700 bg-slate-900/80 py-3.5 pl-11 pr-4 text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                  />
                </div>
              </div>

              <div className="mb-6">
                <label
                  htmlFor="password"
                  className="mb-2 block text-sm font-medium text-slate-300"
                >
                  Password
                </label>

                <div className="relative">
                  <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />

                  <input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="Enter your password"
                    value={form.password}
                    onChange={handleChange}
                    autoComplete="current-password"
                    className="w-full rounded-xl border border-slate-700 bg-slate-900/80 py-3.5 pl-11 pr-4 text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="group flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 py-3.5 font-semibold text-white shadow-lg shadow-blue-600/20 transition duration-300 hover:scale-[1.01] hover:shadow-blue-600/40 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100"
              >
                {loading ? (
                  <>
                    <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                    Signing In...
                  </>
                ) : (
                  <>
                    Sign In
                    <HiArrowRight className="transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </button>

              <div className="my-7 flex items-center gap-4">
                <div className="h-px flex-1 bg-slate-800" />

                <span className="text-xs uppercase tracking-wider text-slate-600">
                  New here?
                </span>

                <div className="h-px flex-1 bg-slate-800" />
              </div>

              <p className="text-center text-slate-400">
                Don&apos;t have an account?{" "}
                <Link
                  to="/register"
                  className="font-semibold text-blue-400 transition hover:text-blue-300"
                >
                  Create account
                </Link>
              </p>

              <p className="mt-8 text-center text-xs text-slate-600">
                By signing in, you agree to securely access
                CodeInsight AI.
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}