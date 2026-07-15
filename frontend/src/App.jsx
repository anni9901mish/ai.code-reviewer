import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Projects from "./pages/Projects";
import ReviewHistory from "./pages/ReviewHistory";
import Analytics from "./pages/Analytics";
import SingleFileReview from "./pages/SingleFileReview";
import ZipAnalysis from "./pages/ZipAnalysis";
import GithubAnalysis from "./pages/GithubAnalysis";

import DashboardLayout from "./layouts/DashboardLayout";

const Placeholder = ({ title }) => (
  <div className="rounded-3xl border border-slate-200 bg-white p-8 text-2xl font-bold dark:border-white/10 dark:bg-white/5">
    {title}
  </div>
);

function ProtectedRoute({ children }) {
  const token = localStorage.getItem("token");

  return token ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<Dashboard />} />

          <Route path="/projects" element={<Projects />} />

          <Route path="/upload" element={<SingleFileReview />} />

          <Route path="/zip-analysis" element={<ZipAnalysis />} />

          <Route path="/github-analysis" element={<GithubAnalysis />} />

          <Route path="/reviews" element={<ReviewHistory />} />

          <Route path="/analytics" element={<Analytics />} />

          <Route path="/settings" element={<Placeholder title="Settings" />} />
        </Route>

        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        <Route path="*" element={<Navigate to="/dashboard" replace />} />

        <Route path="/github-analysis" element={<GithubAnalysis />} />
      </Routes>
    </BrowserRouter>
  );
}
