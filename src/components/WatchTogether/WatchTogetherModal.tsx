import { useState, useRef, useEffect, useCallback } from "react";
import { useTranslation } from "../../hooks/useTranslation";
import { apiUrl } from "../../services/apiConfig";
import { useAuth } from "@clerk/react";

type Participant = {
  name: string;
  currentMood?: string | null;
  desiredMood?: string | null;
  concentration?: string | null;
  availableTime?: number;
  mediaType?: string;
};

type Room = {
  code: string;
  participants: Participant[];
  status: "waiting" | "ready" | "closed";
};

type Props = {
  onClose: () => void;
  onResults: (room: Room) => void;
};

type View = "menu" | "create" | "join" | "lobby";

const MOODS_CURRENT = ["happy", "sad", "stressed", "bored", "tired", "anxious", "energetic", "scared"];
const MOODS_DESIRED = ["uplifted", "relaxed", "thrilled", "thoughtful", "amused", "inspired", "moved", "scared", "tense"];

function WatchTogetherModal({ onClose, onResults }: Props) {
  const { t } = useTranslation();
  const { getToken } = useAuth();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [view, setView] = useState<View>("menu");
  const [name, setName] = useState("");
  const [currentMood, setCurrentMood] = useState<string | null>(null);
  const [desiredMood, setDesiredMood] = useState<string | null>(null);
  const [roomCode, setRoomCode] = useState("");
  const [room, setRoom] = useState<Room | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval>>(undefined);

  useEffect(() => {
    dialogRef.current?.showModal();
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  const authFetch = useCallback(
    async (path: string, options: RequestInit = {}) => {
      const token = await getToken();
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (token) headers.Authorization = `Bearer ${token}`;
      return fetch(apiUrl(path), { ...options, headers });
    },
    [getToken],
  );

  const pollRoom = useCallback(
    async (code: string) => {
      try {
        const res = await authFetch(`/api/rooms/${code}`);
        if (res.ok) {
          const data = await res.json();
          setRoom(data);
        }
      } catch {
        // silently fail
      }
    },
    [authFetch],
  );

  const handleCreate = async () => {
    if (!name.trim()) return;
    setLoading(true);
    setError("");
    try {
      const res = await authFetch("/api/rooms/create", {
        method: "POST",
        body: JSON.stringify({
          name: name.trim(),
          currentMood,
          desiredMood,
        }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setRoom(data.room);
      setRoomCode(data.code);
      setView("lobby");
      pollRef.current = setInterval(() => pollRoom(data.code), 3000);
    } catch {
      setError(t("room.errorCreate"));
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async () => {
    if (!name.trim() || !roomCode.trim()) return;
    setLoading(true);
    setError("");
    try {
      const res = await authFetch(`/api/rooms/${roomCode.trim()}/join`, {
        method: "POST",
        body: JSON.stringify({
          name: name.trim(),
          currentMood,
          desiredMood,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed");
      }
      const data = await res.json();
      setRoom(data);
      setView("lobby");
      pollRef.current = setInterval(() => pollRoom(roomCode.trim()), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("room.errorJoin"));
    } finally {
      setLoading(false);
    }
  };

  const handleReady = async () => {
    if (!room) return;
    setLoading(true);
    try {
      const res = await authFetch(`/api/rooms/${room.code}/ready`, {
        method: "POST",
      });
      if (res.ok) {
        const data = await res.json();
        setRoom(data);
        if (pollRef.current) clearInterval(pollRef.current);
        onResults(data);
      }
    } catch {
      setError(t("room.errorGeneric"));
    } finally {
      setLoading(false);
    }
  };

  const copyCode = () => {
    navigator.clipboard.writeText(roomCode || room?.code || "");
  };

  const moodPicker = (
    label: string,
    moods: string[],
    value: string | null,
    onChange: (v: string | null) => void,
    prefix: string,
  ) => (
    <div className="room-mood-section">
      <label className="room-label">{label}</label>
      <div className="room-mood-grid">
        {moods.map((m) => (
          <button
            key={m}
            className={`room-mood-chip${value === m ? " room-mood-chip--active" : ""}`}
            onClick={() => onChange(value === m ? null : m)}
            type="button"
          >
            {t(`${prefix}.${m}`)}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <dialog ref={dialogRef} className="room-dialog" onCancel={onClose}>
      <div className="room-content">
        <button className="room-close" onClick={onClose}>×</button>

        {view === "menu" && (
          <div className="room-menu">
            <h2 className="room-title">{t("room.title")}</h2>
            <p className="room-subtitle">{t("room.subtitle")}</p>
            <div className="room-menu-buttons">
              <button
                className="room-menu-btn room-menu-btn--create"
                onClick={() => setView("create")}
              >
                {t("room.createBtn")}
              </button>
              <button
                className="room-menu-btn room-menu-btn--join"
                onClick={() => setView("join")}
              >
                {t("room.joinBtn")}
              </button>
            </div>
          </div>
        )}

        {(view === "create" || view === "join") && (
          <div className="room-form">
            <h2 className="room-title">
              {view === "create" ? t("room.createTitle") : t("room.joinTitle")}
            </h2>

            <label className="room-label">{t("room.nameLabel")}</label>
            <input
              className="room-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t("room.namePlaceholder")}
              maxLength={50}
            />

            {view === "join" && (
              <>
                <label className="room-label">{t("room.codeLabel")}</label>
                <input
                  className="room-input room-input--code"
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                  placeholder="ABC123"
                  maxLength={6}
                />
              </>
            )}

            {moodPicker(t("mood.currentLabel"), MOODS_CURRENT, currentMood, setCurrentMood, "mood")}
            {moodPicker(t("mood.desiredLabel"), MOODS_DESIRED, desiredMood, setDesiredMood, "mood")}

            {error && <p className="room-error">{error}</p>}

            <div className="room-form-actions">
              <button
                className="room-btn room-btn--secondary"
                onClick={() => { setView("menu"); setError(""); }}
              >
                {t("onboarding.back")}
              </button>
              <button
                className="room-btn room-btn--primary"
                onClick={view === "create" ? handleCreate : handleJoin}
                disabled={loading || !name.trim() || (view === "join" && !roomCode.trim())}
              >
                {loading ? "..." : view === "create" ? t("room.createBtn") : t("room.joinBtn")}
              </button>
            </div>
          </div>
        )}

        {view === "lobby" && room && (
          <div className="room-lobby">
            <h2 className="room-title">{t("room.lobbyTitle")}</h2>

            <div className="room-code-display">
              <span className="room-code-label">{t("room.codeLabel")}</span>
              <span className="room-code-value">{room.code}</span>
              <button className="room-copy-btn" onClick={copyCode}>
                {t("room.copy")}
              </button>
            </div>

            <p className="room-share-hint">{t("room.shareHint")}</p>

            <div className="room-participants">
              <h3 className="room-participants-title">
                {t("room.participants")} ({room.participants.length})
              </h3>
              {room.participants.map((p, i) => (
                <div key={i} className="room-participant">
                  <span className="room-participant-name">{p.name}</span>
                  <span className="room-participant-mood">
                    {[p.currentMood, p.desiredMood]
                      .filter(Boolean)
                      .map((m) => t(`mood.${m}`))
                      .join(" → ") || "—"}
                  </span>
                </div>
              ))}
            </div>

            {error && <p className="room-error">{error}</p>}

            <button
              className="room-btn room-btn--primary room-btn--ready"
              onClick={handleReady}
              disabled={loading || room.participants.length < 2}
            >
              {loading ? "..." : t("room.findMovies")}
            </button>
          </div>
        )}
      </div>
    </dialog>
  );
}

export default WatchTogetherModal;
