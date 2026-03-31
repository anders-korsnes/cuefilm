import { useState, useRef, useEffect } from "react";
import { useUser, useAuth, SignInButton } from "@clerk/react";
import { useTranslation } from "../../hooks/useTranslation";

type ProfileMenuProps = {
  onWatchHistory: () => void;
  onSettings: () => void;
  onLogout: () => void;
  avatarUrl?: string | null;
};

function ProfileMenu({ onWatchHistory, onSettings, avatarUrl }: ProfileMenuProps) {
  const { t } = useTranslation();
  const { user } = useUser();
  const { isSignedIn } = useAuth();
  const displayAvatar = avatarUrl ?? user?.imageUrl ?? null;
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="profile-menu-container" ref={menuRef}>
      {!isSignedIn && (
        <SignInButton mode="modal">
          <button className="profile-signin-text">
            <span className="profile-signin-line1">{t("auth.signUp")}</span>
            <span className="profile-signin-line2">{t("auth.signInSlash")}</span>
          </button>
        </SignInButton>
      )}

      {isSignedIn && (
        <>
          <button
            className="profile-button"
            onClick={() => setMenuOpen((prev) => !prev)}
            aria-label={t("profile.settings")}
            aria-expanded={menuOpen}
            aria-haspopup="menu"
          >
            {displayAvatar ? (
              <img
                src={displayAvatar}
                alt={user?.fullName ?? t("profile.settings")}
                style={{ width: 28, height: 28, borderRadius: "50%", objectFit: "cover" }}
              />
            ) : (
              "👤"
            )}
          </button>

          {menuOpen && (
            <div className="profile-dropdown" role="menu">
              <button
                className="profile-dropdown-item"
                role="menuitem"
                onClick={() => { setMenuOpen(false); onWatchHistory(); }}
              >
                {t("profile.watchHistory")}
              </button>
              <button
                className="profile-dropdown-item"
                role="menuitem"
                onClick={() => { setMenuOpen(false); onSettings(); }}
              >
                {t("profile.settings")}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default ProfileMenu;
