import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@clerk/react";
import { apiUrl } from "../services/apiConfig";
import type { UserSettings } from "../types/userSettings";
import { defaultSettings } from "../types/userSettings";

function applyTheme(theme: UserSettings["theme"]) {
  const root = document.documentElement;

  if (theme === "system") {
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)",
    ).matches;
    root.setAttribute("data-theme", prefersDark ? "dark" : "light");
  } else {
    root.setAttribute("data-theme", theme);
  }
}

function useUserSettings() {
  const { isSignedIn, getToken } = useAuth();

  // Theme and language are device-level preferences — stay in localStorage
  const [settings, setSettings] = useState<UserSettings>(() => {
    const stored = localStorage.getItem("cuefilm-settings");
    try {
      const parsed = stored
        ? { ...defaultSettings, ...JSON.parse(stored) }
        : defaultSettings;
      applyTheme(parsed.theme);
      return parsed;
    } catch {
      applyTheme(defaultSettings.theme);
      return defaultSettings;
    }
  });

  // Apply theme when it changes
  useEffect(() => {
    applyTheme(settings.theme);
  }, [settings.theme]);

  // Sync theme + language to localStorage (not profile — that goes to API)
  useEffect(() => {
    localStorage.setItem(
      "cuefilm-settings",
      JSON.stringify({ theme: settings.theme, appLanguage: settings.appLanguage }),
    );
  }, [settings.theme, settings.appLanguage]);

  // System theme listener
  useEffect(() => {
    if (settings.theme === "system") {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      const handler = () => applyTheme("system");
      mediaQuery.addEventListener("change", handler);
      return () => mediaQuery.removeEventListener("change", handler);
    }
  }, [settings.theme]);

  const authFetch = useCallback(
    async (path: string, options?: RequestInit) => {
      const token = await getToken();
      return fetch(apiUrl(path), {
        ...options,
        headers: {
          "Content-Type": "application/json",
          ...options?.headers,
          Authorization: `Bearer ${token}`,
        },
      });
    },
    [getToken],
  );

  // Separate profile state — only populated when signed in
  const [profile, setProfile] = useState(defaultSettings.profile);

  useEffect(() => {
    if (!isSignedIn) return;
    authFetch("/api/settings")
      .then((r) => {
        if (!r.ok) throw new Error(`Settings fetch failed: ${r.status}`);
        return r.json();
      })
      .then((data) =>
        setProfile((prev) => ({ ...prev, ...data })),
      )
      .catch((err) => console.error("Failed to load profile:", err));
  }, [isSignedIn, authFetch]);

  // When signed out, mask profile with defaults without touching state in an effect
  const activeProfile = isSignedIn ? profile : defaultSettings.profile;

  const updateProfile = (updates: Partial<UserSettings["profile"]>) => {
    const updated = { ...profile, ...updates };
    setProfile(updated);
    if (isSignedIn) {
      authFetch("/api/settings", {
        method: "PUT",
        body: JSON.stringify(updated),
      })
        .then((r) => {
          if (!r.ok) throw new Error(`Profile sync failed: ${r.status}`);
        })
        .catch((err) => console.error("Failed to sync profile:", err));
    }
  };

  const setTheme = (theme: UserSettings["theme"]) => {
    setSettings((prev) => ({ ...prev, theme }));
  };

  const setAppLanguage = (appLanguage: UserSettings["appLanguage"]) => {
    setSettings((prev) => ({ ...prev, appLanguage }));
  };

  const setAvatarUrl = (avatarUrl: string | null) => {
    updateProfile({ avatarUrl });
  };

  const clearAllData = () => {
    localStorage.removeItem("cuefilm-settings");
    setSettings(defaultSettings);
    applyTheme(defaultSettings.theme);
  };

  return {
    settings: { ...settings, profile: activeProfile },
    updateProfile,
    setTheme,
    setAppLanguage,
    setAvatarUrl,
    clearAllData,
  };
}

export default useUserSettings;
