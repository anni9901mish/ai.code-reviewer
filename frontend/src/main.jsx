import React from "react";
import ReactDOM from "react-dom/client";
import { Toaster } from "sonner";

import App from "./App";
import "./index.css";

import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";

ReactDOM.createRoot(
  document.getElementById("root")
).render(
  <React.StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <Toaster
          richColors
          position="top-right"
          closeButton
        />

        <App />
      </AuthProvider>
    </ThemeProvider>
  </React.StrictMode>
);