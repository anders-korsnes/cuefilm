import { useState, useEffect } from "react";
import MovieCard from "../MovieResults/MovieCard";
import type { Movie } from "../../types/movie";
import type { UserMovie } from "../../types/userMovie";
import { useTranslation } from "../../hooks/useTranslation";
import { useFocusTrap } from "../../hooks/useFocusTrap";

type LibraryModalProps = {
  library: UserMovie[];
  onToggleSave: (movieId: string, movie: Movie) => void;
  onToggleWatched: (movieId: string, movie: Movie) => void;
  onClose: () => void;
  initialTab?: "saved" | "watched";
};

type Tab = "saved" | "watched";

function LibraryModal({
  library,
  onToggleSave,
  onToggleWatched,
  onClose,
  initialTab = "saved",
}: LibraryModalProps) {
  const { t } = useTranslation();
  const dialogRef = useFocusTrap<HTMLDivElement>();
  const [activeTab, setActiveTab] = useState<Tab>(initialTab);

  useEffect(() => {
    const handler = () => onClose();
    const el = dialogRef.current;
    el?.addEventListener("dialog-close", handler);
    return () => el?.removeEventListener("dialog-close", handler);
  }, [onClose]);

  const savedEntries = library.filter((entry) => entry.saved);
  const watchedEntries = library.filter((entry) => entry.watched);
  const activeEntries = activeTab === "saved" ? savedEntries : watchedEntries;

  const movieItems = activeEntries
    .filter((entry) => entry.movieSnapshot)
    .map((entry) => {
      const snap = entry.movieSnapshot!;
      const movie: Movie = {
        id: snap.id,
        title: snap.title,
        year: snap.year,
        genre: snap.genre,
        runtime: snap.runtime,
        rating: snap.rating,
        voteCount: snap.voteCount,
        poster: snap.poster,
        language: snap.language,
        country: snap.country,
        mediaType: snap.mediaType,
        numberOfSeasons: snap.numberOfSeasons,
        plot: "",
        director: "",
        actors: [],
        mood: { energy: 5, emotional: 5, complexity: 5, feelGoodFactor: 5, tension: 5 },
      };
      return { movie, entry };
    });

  return (
    <div className="library-overlay" onClick={onClose}>
      <div
        ref={dialogRef}
        className="library-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="library-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="library-modal-header">
          <div className="library-tabs">
            <button
              className={`library-tab ${activeTab === "saved" ? "active" : ""}`}
              onClick={() => setActiveTab("saved")}
            >
              {t("library.savedTab")} ({savedEntries.length})
            </button>
            <button
              className={`library-tab ${activeTab === "watched" ? "active" : ""}`}
              onClick={() => setActiveTab("watched")}
            >
              {t("library.watchedTab")} ({watchedEntries.length})
            </button>
          </div>
          <button className="library-close" onClick={onClose} aria-label={t("settingsModal.deleteCancel")}>
            ✕
          </button>
        </div>

        <div className="library-modal-body">
          {movieItems.length > 0 ? (
            <div className="movie-list">
              {movieItems.map(({ movie, entry }) => (
                <MovieCard
                  key={movie.id}
                  movie={movie}
                  score={-1}
                  isSaved={entry.saved}
                  isWatched={entry.watched}
                  onToggleSave={onToggleSave}
                  onToggleWatched={onToggleWatched}
                />
              ))}
            </div>
          ) : (
            <div className="library-empty">
              <span className="library-empty-icon">
                {activeTab === "saved" ? "★" : "✓"}
              </span>
              <span className="library-empty-text">
                {activeTab === "saved"
                  ? t("library.emptySaved")
                  : t("library.emptyWatched")}
              </span>
              <span className="library-empty-hint">
                {activeTab === "saved"
                  ? t("library.hintSaved")
                  : t("library.hintWatched")}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default LibraryModal;
