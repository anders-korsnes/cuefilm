import { useState, useRef, useEffect } from "react";
import { useUser, useClerk } from "@clerk/react";
import { useTranslation } from "../../hooks/useTranslation";
import { useFocusTrap } from "../../hooks/useFocusTrap";
import usePushNotifications from "../../hooks/usePushNotifications";
import type {
  UserSettings,
  Theme,
  AppLanguage,
  Gender,
} from "../../types/userSettings";

type SettingsModalProps = {
  settings: UserSettings;
  onSave: (settings: UserSettings) => void;
  onDeleteAccount: () => void;
  onClose: () => void;
};

type SettingsTab = "profile" | "appearance" | "konto";

function SettingsModal({
  settings,
  onSave,
  onDeleteAccount,
  onClose,
}: SettingsModalProps) {
  const { t } = useTranslation();
  const { user } = useUser();
  const { signOut } = useClerk();
  const { supported: pushSupported, enabled: pushEnabled, subscribe: pushSubscribe, unsubscribe: pushUnsubscribe } = usePushNotifications();

  const clerkAvatarUrl = user?.imageUrl ?? null;
  const clerkName = user?.fullName ?? "";
  const clerkEmail = user?.primaryEmailAddress?.emailAddress ?? "";

  const settingsRef = useRef(settings);
  const savedRef = useRef(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [draft, setDraft] = useState<UserSettings>(() => ({
    ...structuredClone(settings),
    profile: {
      ...settings.profile,
      name: settings.profile.name || clerkName,
      email: settings.profile.email || clerkEmail,
    },
  }));
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [activeTab, setActiveTab] = useState<SettingsTab>("profile");
  const [deleteInput, setDeleteInput] = useState("");
  const dialogRef = useFocusTrap<HTMLDivElement>();

  const hasChanges = JSON.stringify(draft) !== JSON.stringify(settings);

  useEffect(() => {
    const handler = () => onClose();
    const el = dialogRef.current;
    el?.addEventListener("dialog-close", handler);
    return () => el?.removeEventListener("dialog-close", handler);
  }, [onClose]);

  useEffect(() => {
    settingsRef.current = settings;
  }, [settings]);

  // Live theme preview
  useEffect(() => {
    const root = document.documentElement;
    if (draft.theme === "system") {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      root.setAttribute("data-theme", prefersDark ? "dark" : "light");
    } else {
      root.setAttribute("data-theme", draft.theme);
    }
  }, [draft.theme]);

  // Revert theme on close without saving
  useEffect(() => {
    return () => {
      if (savedRef.current) return;
      const original = settingsRef.current.theme;
      const root = document.documentElement;
      if (original === "system") {
        const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        root.setAttribute("data-theme", prefersDark ? "dark" : "light");
      } else {
        root.setAttribute("data-theme", original);
      }
    };
  }, []);

  const updateProfile = (updates: Partial<UserSettings["profile"]>) => {
    setDraft((prev) => ({ ...prev, profile: { ...prev.profile, ...updates } }));
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => updateProfile({ avatarUrl: reader.result as string });
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    savedRef.current = true;
    onSave(draft);
    onClose();
  };

  const handleDeleteAccount = async () => {
    try {
      await user?.delete();
      await signOut();
    } catch {
      // Clerk deletion failed — still clear local data
    }
    onDeleteAccount();
    onClose();
  };

  const displayAvatar = draft.profile.avatarUrl ?? clerkAvatarUrl;

  const genderOptions: { value: Gender; labelKey: string }[] = [
    { value: "male", labelKey: "settingsModal.genderMale" },
    { value: "female", labelKey: "settingsModal.genderFemale" },
    { value: "other", labelKey: "settingsModal.genderOther" },
    { value: "prefer-not-to-say", labelKey: "settingsModal.genderPreferNot" },
  ];

  const themeOptions: { value: Theme; labelKey: string; icon: string }[] = [
    { value: "dark", labelKey: "settingsModal.themeDark", icon: "🌙" },
    { value: "light", labelKey: "settingsModal.themeLight", icon: "☀️" },
    { value: "system", labelKey: "settingsModal.themeSystem", icon: "💻" },
  ];

  const appLanguageOptions: { value: AppLanguage; label: string }[] = [
    { value: "no", label: "Norsk" },
    { value: "en", label: "English" },
  ];

  return (
    <div className="settings-overlay" onClick={onClose}>
      <div
        ref={dialogRef}
        className="settings-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="settings-header">
          <span id="settings-title" className="settings-title">{t("settingsModal.title")}</span>
          <button className="settings-close" onClick={onClose} aria-label={t("settingsModal.deleteCancel")}>✕</button>
        </div>

        <div className="settings-layout">
          <nav className="settings-nav">
            <button
              className={`settings-nav-item ${activeTab === "profile" ? "active" : ""}`}
              onClick={() => setActiveTab("profile")}
            >
              {t("settingsModal.profile")}
            </button>
            <button
              className={`settings-nav-item ${activeTab === "appearance" ? "active" : ""}`}
              onClick={() => setActiveTab("appearance")}
            >
              {t("settingsModal.appearance")}
            </button>
            <button
              className={`settings-nav-item danger ${activeTab === "konto" ? "active" : ""}`}
              onClick={() => setActiveTab("konto")}
            >
              {t("settingsModal.konto")}
            </button>
          </nav>

          <div className="settings-content">
            {activeTab === "profile" && (
              <div className="settings-section">

                {/* Avatar */}
                <div className="settings-avatar-center">
                  <div
                    className="settings-avatar-large"
                    onClick={() => fileInputRef.current?.click()}
                    title={t("settingsModal.avatarClickTitle")}
                  >
                    {displayAvatar ? (
                      <img src={displayAvatar} alt="Avatar" className="avatar-image" />
                    ) : (
                      <span className="avatar-placeholder-large">👤</span>
                    )}
                    <div className="avatar-overlay">{t("settingsModal.avatarChange")}</div>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    style={{ display: "none" }}
                  />
                  <div className="settings-avatar-links">
                    {clerkAvatarUrl && draft.profile.avatarUrl !== clerkAvatarUrl && (
                      <button
                        className="settings-link"
                        onClick={() => updateProfile({ avatarUrl: clerkAvatarUrl })}
                      >
                        {t("settingsModal.useGoogleAvatar")}
                      </button>
                    )}
                    {draft.profile.avatarUrl && (
                      <button
                        className="settings-link settings-link-danger"
                        onClick={() => updateProfile({ avatarUrl: null })}
                      >
                        {t("settingsModal.removeAvatar")}
                      </button>
                    )}
                  </div>
                </div>

                {/* Identity fields */}
                <div className="settings-field-group">
                  <div className="settings-field">
                    <label className="settings-label">{t("settingsModal.name")}</label>
                    <input
                      className="settings-input"
                      type="text"
                      value={draft.profile.name}
                      onChange={(e) => updateProfile({ name: e.target.value })}
                      placeholder={t("settingsModal.namePlaceholder")}
                    />
                  </div>

                  <div className="settings-field">
                    <label className="settings-label">{t("settingsModal.email")}</label>
                    <div className="settings-input settings-input-readonly">
                      {clerkEmail || "—"}
                    </div>
                  </div>

                  <div className="settings-field">
                    <label className="settings-label">{t("settingsModal.username")}</label>
                    <div className="settings-input-prefix-wrap">
                      <span className="settings-input-prefix">@</span>
                      <input
                        className="settings-input settings-input-with-prefix"
                        type="text"
                        value={draft.profile.username}
                        onChange={(e) =>
                          updateProfile({
                            username: e.target.value.replace(/[^a-zA-Z0-9_]/g, ""),
                          })
                        }
                        placeholder="brukernavn"
                      />
                    </div>
                  </div>
                </div>

                {/* Extra fields */}
                <div className="settings-field-group">
                  <div className="settings-field">
                    <label className="settings-label">{t("settingsModal.age")}</label>
                    <input
                      className="settings-input settings-input-age"
                      type="number"
                      value={draft.profile.age}
                      onChange={(e) => updateProfile({ age: e.target.value })}
                      placeholder="—"
                      min="1"
                      max="120"
                    />
                  </div>

                  <div className="settings-field">
                    <label className="settings-label">{t("settingsModal.gender")}</label>
                    <div className="settings-options">
                      {genderOptions.map((opt) => (
                        <button
                          key={opt.value}
                          className={`setting-button ${draft.profile.gender === opt.value ? "selected" : ""}`}
                          onClick={() => updateProfile({ gender: opt.value })}
                        >
                          {t(opt.labelKey)}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

              </div>
            )}

            {activeTab === "appearance" && (
              <div className="settings-section">
                <div className="settings-field">
                  <label className="settings-label">{t("settingsModal.theme")}</label>
                  <div className="theme-options">
                    {themeOptions.map((opt) => (
                      <button
                        key={opt.value}
                        className={`theme-button ${draft.theme === opt.value ? "selected" : ""}`}
                        onClick={() => setDraft((prev) => ({ ...prev, theme: opt.value }))}
                      >
                        <span className="theme-icon">{opt.icon}</span>
                        <span className="theme-label">{t(opt.labelKey)}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="settings-field">
                  <label className="settings-label">{t("settingsModal.appLanguage")}</label>
                  <div className="settings-options">
                    {appLanguageOptions.map((opt) => (
                      <button
                        key={opt.value}
                        className={`setting-button ${draft.appLanguage === opt.value ? "selected" : ""}`}
                        onClick={() => setDraft((prev) => ({ ...prev, appLanguage: opt.value }))}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {pushSupported && (
                  <div className="settings-field">
                    <label className="settings-label">{t("push.description")}</label>
                    <button
                      className={`setting-button ${pushEnabled ? "selected" : ""}`}
                      onClick={pushEnabled ? pushUnsubscribe : pushSubscribe}
                    >
                      {pushEnabled ? t("push.enabled") : t("push.enable")}
                    </button>
                  </div>
                )}
              </div>
            )}

            {activeTab === "konto" && (
              <div className="settings-section">

                {/* Logg ut */}
                <div className="konto-zone">
                  <div className="konto-zone-header">
                    <span className="konto-zone-title">{t("settingsModal.logoutTitle")}</span>
                    <span className="konto-zone-desc">{t("settingsModal.logoutDesc")}</span>
                  </div>
                  {!showLogoutConfirm ? (
                    <button
                      className="settings-btn"
                      onClick={() => setShowLogoutConfirm(true)}
                    >
                      {t("profile.logout")}
                    </button>
                  ) : (
                    <div className="danger-confirm">
                      <span className="danger-confirm-text">{t("settingsModal.logoutConfirm")}</span>
                      <div className="danger-confirm-actions">
                        <button
                          className="settings-btn"
                          onClick={() => { signOut(); onClose(); }}
                        >
                          {t("settingsModal.logoutYes")}
                        </button>
                        <button
                          className="settings-btn"
                          onClick={() => setShowLogoutConfirm(false)}
                        >
                          {t("settingsModal.deleteCancel")}
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Slett bruker */}
                <div className="danger-zone">
                  <div className="danger-zone-header">
                    <span className="danger-zone-title">{t("settingsModal.deleteTitle")}</span>
                    <span className="danger-zone-desc">{t("settingsModal.deleteDesc")}</span>
                  </div>
                  {!showDeleteConfirm ? (
                    <button
                      className="settings-btn settings-btn-danger"
                      onClick={() => setShowDeleteConfirm(true)}
                    >
                      {t("settingsModal.deleteButton")}
                    </button>
                  ) : (
                    <div className="danger-confirm">
                      <span className="danger-confirm-text">
                        {t("settingsModal.deleteWarning")}
                        <br />{t("settingsModal.deleteTypeConfirm", { word: t("settingsModal.deleteTypeWord") })}
                      </span>
                      <input
                        className="settings-input"
                        type="text"
                        value={deleteInput}
                        onChange={(e) => setDeleteInput(e.target.value)}
                        placeholder={t("settingsModal.deleteTypeWord")}
                        autoFocus
                      />
                      <div className="danger-confirm-actions">
                        <button
                          className="settings-btn settings-btn-danger"
                          onClick={handleDeleteAccount}
                          disabled={deleteInput.toLowerCase() !== t("settingsModal.deleteTypeWord")}
                        >
                          {t("settingsModal.deleteYes")}
                        </button>
                        <button
                          className="settings-btn"
                          onClick={() => { setShowDeleteConfirm(false); setDeleteInput(""); }}
                        >
                          {t("settingsModal.deleteCancel")}
                        </button>
                      </div>
                    </div>
                  )}
                </div>

              </div>
            )}
          </div>
        </div>

        <div className="settings-footer">
          <button className="settings-btn" onClick={onClose}>
            {t("settingsModal.deleteCancel")}
          </button>
          <button
            className={`settings-btn settings-btn-save ${!hasChanges ? "disabled" : ""}`}
            onClick={handleSave}
            disabled={!hasChanges}
          >
            {t("settingsModal.save")}
          </button>
        </div>
      </div>
    </div>
  );
}

export default SettingsModal;
