import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { loginUser } from "../services/auth.service";
import { useAuth } from "../context/AuthContext";
import { toast } from "sonner";

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
    <div className="min-h-screen bg-[#050816] flex justify-center items-center p-6">

      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-slate-900 rounded-2xl p-8 border border-slate-700 shadow-xl"
      >
        <h1 className="text-3xl font-bold text-white mb-2">
          Welcome Back 👋
        </h1>

        <p className="text-slate-400 mb-8">
          Login to AI Code Review
        </p>

        <input
          name="email"
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          className="w-full p-3 rounded-lg bg-slate-800 text-white mb-4 outline-none border border-slate-700"
        />

        <input
          name="password"
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          className="w-full p-3 rounded-lg bg-slate-800 text-white mb-6 outline-none border border-slate-700"
        />

        <button
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 transition rounded-lg py-3 text-white font-semibold"
        >
          {loading ? "Signing In..." : "Sign In"}
        </button>

        <p className="text-center text-slate-400 mt-6">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="text-blue-500"
          >
            Register
          </Link>
        </p>
      </form>
    </div>
  );
}