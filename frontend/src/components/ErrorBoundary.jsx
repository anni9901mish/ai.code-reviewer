import React from "react";
import { AlertTriangle } from "lucide-react";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      hasError: false,
    };
  }

  static getDerivedStateFromError() {
    return {
      hasError: true,
    };
  }

  componentDidCatch(error, info) {
    console.error(error);
    console.error(info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-slate-100 dark:bg-[#050b16]">
          <div className="rounded-3xl bg-white p-10 text-center shadow-2xl dark:bg-[#07101f]">
            <AlertTriangle
              size={60}
              className="mx-auto text-red-500"
            />

            <h1 className="mt-6 text-3xl font-bold text-slate-900 dark:text-white">
              Something went wrong
            </h1>

            <p className="mt-3 text-slate-500">
              Please refresh the page.
            </p>

            <button
              onClick={() => window.location.reload()}
              className="mt-6 rounded-xl bg-blue-600 px-6 py-3 text-white"
            >
              Reload
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;