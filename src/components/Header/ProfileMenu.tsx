import { useUser, useAuth, SignInButton } from "@clerk/react";
import { useTranslation } from "../../hooks/useTranslation";

type ProfileMenuProps = {
  onWatchHistory: () => void;
  onSettings: () => void;
  onLogout: () => void;
  avatarUrl?: string | null;
};

function ProfileMenu({ onSettings, avatarUrl }: ProfileMenuProps) {
  const { t } = useTranslation();
  const { user } = useUser();
  const { isSignedIn } = useAuth();
  const displayAvatar = avatarUrl ?? user?.imageUrl ?? null;

  return (
    <div className="profile-menu-container">
      {!isSignedIn && (
        <SignInButton mode="modal">
          <button className="profile-signin-text">
            <span className="profile-signin-line1">Lag bruker</span>
            <span className="profile-signin-line2">/ Logg inn</span>
          </button>
        </SignInButton>
      )}

      {isSignedIn && (
        <button className="profile-button" onClick={onSettings}>
          {displayAvatar ? (
            <img
              src={displayAvatar}
              alt={user?.fullName ?? "profil"}
              style={{ width: 28, height: 28, borderRadius: "50%", objectFit: "cover" }}
            />
          ) : (
            "👤"
          )}
        </button>
      )}
    </div>
  );
}

export default ProfileMenu;
