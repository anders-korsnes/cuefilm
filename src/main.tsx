import React from "react";
import ReactDOM from "react-dom/client";
import { ClerkProvider } from "@clerk/react";
import App from "./App";
import ErrorBoundary from "./components/ErrorBoundary";
import { LanguageProvider } from "./context/LanguageContext";
import "./index.css";

const storedSettings = localStorage.getItem("moodflix-settings");
let initialLanguage = "no";
try {
  if (storedSettings) {
    const parsed = JSON.parse(storedSettings);
    if (typeof parsed?.appLanguage === "string") {
      initialLanguage = parsed.appLanguage;
    }
  }
} catch {
  initialLanguage = "no";
}

const root = document.getElementById("root");
if (!root) throw new Error("Root element not found");

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <ErrorBoundary>
      <ClerkProvider publishableKey={import.meta.env.VITE_CLERK_PUBLISHABLE_KEY}>
        <LanguageProvider initialLanguage={initialLanguage}>
          <App />
        </LanguageProvider>
      </ClerkProvider>
    </ErrorBoundary>
  </React.StrictMode>,
);
