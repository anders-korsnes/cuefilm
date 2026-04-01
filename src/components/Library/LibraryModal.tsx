import { useState, useEffect } from "react";
import type { Movie } from "../../types/movie";
import type { UserMovie } from "../../types/userMovie";
import type { SearchHistoryEntry } from "../../hooks/useSearchHistory";
import { useTranslation } from "../../hooks/useTranslation";
import { useFocusTrap } from "../../hooks/useFocusTrap";

type LibraryModalProps = {
  library: UserMovie[];
  onToggleSave: (movieId: string, movie: Movie) => void;
  onToggleWatched: (movieId: string, movie: Movie) => void;
  onToggleDisliked: (movieId: string, movie: Movie) => void;
  onClose: () => void;
  initialTab?: "saved" | "watched" | "history";
  history?: SearchHistoryEntry[];
  historyLoading?: boolean;
  onReplaySearch?: (entry: SearchHistoryEntry) => void;
};

type Tab = "saved" | "watched" | "history";

function LibraryModal({
  library,
  onToggleSave,
  onToggleWatched,
  onToggleDisliked,
  onClose,
  initialTab = "saved",
  history = [],
  historyLoading = false,
  onReplaySearch,
}: LibraryModalProps) {
  const { t } = useTranslation();
  const dialogRef = useFocusTrap<HTMLDivElement>();
  const [activeTab, setActiveTab] = useState<Tab>(initialTab);
  const [expandedId, setExpandedId] = useState<string | null>(null);

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
        plot: snap.plot ?? "",
        director: snap.director ?? "",
        actors: snap.actors ?? [],
        mood: { energy: 5, emotional: 5, complexity: 5, feelGoodFactor: 5, tension: 5 },
        streamingProviders: snap.streamingProviders,
      };
      return { movie, entry };
    });

  const handleToggleExpand = (movieId: string) => {
    setExpandedId((prev) => (prev === movieId ? null : movieId));
  };

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
              onClick={() => { setActiveTab("saved"); setExpandedId(null); }}
            >
              {t("library.savedTab")} ({savedEntries.length})
            </button>
            <button
              className={`library-tab ${activeTab === "watched" ? "active" : ""}`}
              onClick={() => { setActiveTab("watched"); setExpandedId(null); }}
            >
              {t("library.watchedTab")} ({watchedEntries.length})
            </button>
            <button
              className={`library-tab ${activeTab === "history" ? "active" : ""}`}
              onClick={() => { setActiveTab("history"); setExpandedId(null); }}
            >
              {t("history.tab")} ({history.length})
            </button>
          </div>
          <button className="library-close" onClick={onClose} aria-label={t("settingsModal.deleteCancel")}>
            ✕
          </button>
        </div>

        <div className="library-modal-body">
          {activeTab === "history" ? (
            <HistoryTabContent
              history={history}
              loading={historyLoading}
              onReplay={onReplaySearch}
            />
          ) : movieItems.length > 0 ? (
            <div className="movie-list">
              {movieItems.map(({ movie, entry }) => (
                <LibraryCard
                  key={movie.id}
                  movie={movie}
                  entry={entry}
                  isExpanded={expandedId === movie.id}
                  onToggleExpand={() => handleToggleExpand(movie.id)}
                  onToggleSave={onToggleSave}
                  onToggleWatched={onToggleWatched}
                  onToggleDisliked={activeTab === "watched" ? onToggleDisliked : undefined}
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

type LibraryCardProps = {
  movie: Movie;
  entry: UserMovie;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onToggleSave: (movieId: string, movie: Movie) => void;
  onToggleWatched: (movieId: string, movie: Movie) => void;
  onToggleDisliked?: (movieId: string, movie: Movie) => void;
};

function LibraryCard({
  movie,
  entry,
  isExpanded,
  onToggleExpand,
  onToggleSave,
  onToggleWatched,
  onToggleDisliked,
}: LibraryCardProps) {
  const { t } = useTranslation();
  const [imgError, setImgError] = useState(false);

  if (isExpanded) {
    return (
      <div className="primary-pick-content expanded-border">
        {movie.poster && !imgError ? (
          <img
            className="primary-poster"
            src={movie.poster}
            alt={movie.title}
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="primary-poster primary-poster-fallback">🎬</div>
        )}

        <div className="primary-info">
          <div className="primary-header">
            <span className="primary-title">{movie.title}</span>
            <span className={`media-type-badge media-type-badge--${movie.mediaType}`}>
              {movie.mediaType === "series" ? t("movie.type.series") : t("movie.type.movie")}
            </span>
          </div>

          <span className="movie-meta">
            {movie.year} · {movie.runtime}{" "}
            {movie.mediaType === "series" ? t("movie.minPerEpisode") : "min"}{" "}
            · ★ {movie.rating}
            {movie.mediaType === "series" && movie.numberOfSeasons != null && (
              <> · {movie.numberOfSeasons === 1 ? t("movie.season") : t("movie.seasons").replace("{count}", String(movie.numberOfSeasons))}</>
            )}
          </span>
          <span className="movie-meta">
            {movie.country}
            {movie.language ? ` · ${movie.language}` : ""}
          </span>

          <div className="movie-genre">
            {movie.genre.map((g) => (
              <span key={g} className="genre-tag">
                {g}
              </span>
            ))}
          </div>

          {movie.streamingProviders && movie.streamingProviders.length > 0 && (
            <div className="streaming-providers">
              <span className="streaming-label">{t("movie.streaming")}</span>
              <div className="streaming-logos">
                {movie.streamingProviders.map((p) => (
                  <img
                    key={p.name}
                    src={p.logoPath}
                    alt={p.name}
                    title={p.name}
                    className="streaming-logo"
                  />
                ))}
              </div>
            </div>
          )}

          {movie.plot && <p className="primary-plot">{movie.plot}</p>}

          {(movie.director || movie.actors.length > 0) && (
            <div className="primary-details">
              {movie.director && (
                <div className="movie-detail-row">
                  <span className="detail-label">{t("movie.director")}</span>
                  <span className="detail-value">{movie.director}</span>
                </div>
              )}
              {movie.actors.length > 0 && (
                <div className="movie-detail-row">
                  <span className="detail-label">{t("movie.actors")}</span>
                  <span className="detail-value">{movie.actors.join(", ")}</span>
                </div>
              )}
            </div>
          )}

          <div className="expanded-card-bottom">
            <div className="movie-actions">
              <button
                className={`action-button ${entry.saved ? "active" : ""}`}
                onClick={() => onToggleSave(movie.id, movie)}
              >
                {entry.saved ? t("movie.saved") : t("movie.save")}
              </button>
              <button
                className={`action-button ${entry.watched ? "active" : ""}`}
                onClick={() => onToggleWatched(movie.id, movie)}
              >
                {entry.watched ? t("movie.watched") : t("movie.notWatched")}
              </button>
              {onToggleDisliked && (
                <button
                  className={`action-button action-button--dislike ${entry.disliked ? "active" : ""}`}
                  onClick={() => onToggleDisliked(movie.id, movie)}
                >
                  {entry.disliked ? t("movie.disliked") : t("movie.dislike")}
                </button>
              )}
            </div>

            <button
              className="expand-card-button"
              onClick={onToggleExpand}
              title={t("movie.readLess")}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path d="M5.5 1v4h-4" />
                <path d="M5.5 5L1 1" />
                <path d="M10.5 1v4h4" />
                <path d="M10.5 5L15 1" />
                <path d="M5.5 15v-4h-4" />
                <path d="M5.5 11L1 15" />
                <path d="M10.5 15v-4h4" />
                <path d="M10.5 11L15 15" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="runner-card runner-card-clickable" onClick={onToggleExpand}>
      <div className="runner-card-top">
        {movie.poster && !imgError ? (
          <img
            className="runner-poster"
            src={movie.poster}
            alt={movie.title}
            loading="lazy"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="runner-poster runner-poster-fallback">🎬</div>
        )}

        <div className="runner-info">
          <div className="runner-header">
            <span className="runner-title">{movie.title}</span>
            <span className={`media-type-badge media-type-badge--${movie.mediaType}`}>
              {movie.mediaType === "series" ? t("movie.type.series") : t("movie.type.movie")}
            </span>
          </div>
          <span className="movie-meta">
            {movie.year} · {movie.runtime}{" "}
            {movie.mediaType === "series" ? t("movie.minPerEpisode") : "min"}{" "}
            · ★ {movie.rating}
          </span>
          <div className="movie-genre">
            {movie.genre.map((g) => (
              <span key={g} className="genre-tag">
                {g}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="runner-card-bottom" onClick={(e) => e.stopPropagation()}>
        <div className="movie-actions">
          <button
            className={`action-button ${entry.saved ? "active" : ""}`}
            onClick={() => onToggleSave(movie.id, movie)}
          >
            {entry.saved ? t("movie.saved") : t("movie.save")}
          </button>
          <button
            className={`action-button ${entry.watched ? "active" : ""}`}
            onClick={() => onToggleWatched(movie.id, movie)}
          >
            {entry.watched ? t("movie.watched") : t("movie.notWatched")}
          </button>
        </div>

        <button
          className="expand-card-button"
          onClick={onToggleExpand}
          title={t("movie.readMore")}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <path d="M9 1h4v4M5 13H1V9" />
            <path d="M13 1L8 6M1 13l5-5" />
          </svg>
        </button>
      </div>
    </div>
  );
}

type HistoryTabProps = {
  history: SearchHistoryEntry[];
  loading: boolean;
  onReplay?: (entry: SearchHistoryEntry) => void;
};

function HistoryTabContent({ history, loading, onReplay }: HistoryTabProps) {
  const { t } = useTranslation();

  if (loading) {
    return (
      <div className="library-empty">
        <span className="library-empty-icon">⏳</span>
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="library-empty">
        <span className="library-empty-icon">🔍</span>
        <span className="library-empty-text">{t("history.empty")}</span>
        <span className="library-empty-hint">{t("history.emptyHint")}</span>
      </div>
    );
  }

  const countryTranslationKey: Record<string, string> = {
    american: "usa", british: "uk", canadian: "canada", australian: "australia",
    newzealand: "newzealand", irish: "ireland", norwegian: "norway", swedish: "sweden",
    danish: "denmark", finnish: "finland", french: "france", spanish: "spain",
    portuguese: "portugal", german: "germany", austrian: "austria", swiss: "switzerland",
    dutch: "netherlands", belgian: "belgium", italian: "italy", russian: "russia",
    polish: "poland", czech: "czech", hungarian: "hungary", romanian: "romania",
    greek: "greece", turkish: "turkey", israeli: "israel", iranian: "iran",
    egyptian: "egypt", nigerian: "nigeria", southafrican: "southafrica",
    indian: "india", korean: "southkorea", japanese: "japan", chinese: "china",
    thai: "thailand", indonesian: "indonesia", brazilian: "brazil", mexican: "mexico",
    argentinian: "argentina", colombian: "colombia",
  };

  const buildFilterChips = (entry: SearchHistoryEntry) => {
    const chips: { label: string; icon: string }[] = [];
    const c = entry.criteria;

    chips.push({ label: t(`settings.mediaType.${c.mediaType}`), icon: c.mediaType === "series" ? "📺" : "🎬" });

    if (c.availableTime && c.availableTime > 30) {
      chips.push({ label: `${c.availableTime} min`, icon: "⏱" });
    }

    if (c.concentration) {
      chips.push({ label: t(`settings.${c.concentration}`), icon: "🧠" });
    }

    if (c.socialContext) {
      chips.push({ label: t(`settings.${c.socialContext}`), icon: "👥" });
    }

    const currentYear = new Date().getFullYear();
    const from = c.yearFrom ?? 1920;
    const to = c.yearTo ?? currentYear;
    if (from !== 1920 || to !== currentYear) {
      chips.push({ label: from === to ? `${from}` : `${from}–${to}`, icon: "📅" });
    }

    if (c.language && c.language !== "any") {
      chips.push({ label: t(`lang.${c.language}`), icon: "🗣" });
    }

    if (c.country && c.country !== "any") {
      const key = countryTranslationKey[c.country] ?? c.country;
      chips.push({ label: t(`country.${key}`), icon: "🌍" });
    }

    return chips;
  };

  return (
    <div className="history-list">
      {history.map((entry) => {
        const moods = [entry.criteria.currentMood, entry.criteria.desiredMood]
          .filter(Boolean)
          .map((m) => t(`mood.${m}`))
          .join(" → ");

        const date = new Date(entry.createdAt);
        const dateStr = date.toLocaleDateString();
        const timeStr = date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
        const chips = buildFilterChips(entry);

        return (
          <button
            key={entry._id}
            className="history-card"
            onClick={() => onReplay?.(entry)}
          >
            <div className="history-card-top">
              <span className="history-moods">
                {moods || t("history.noMood")}
              </span>
              <span className="history-date">{dateStr} {timeStr}</span>
            </div>

            <div className="history-filters">
              {chips.map((chip, i) => (
                <span key={i} className="history-filter-chip">
                  <span className="history-filter-icon">{chip.icon}</span>
                  {chip.label}
                </span>
              ))}
              {entry.isRandom && (
                <span className="history-filter-chip history-filter-chip--random">
                  🎲 {t("history.random")}
                </span>
              )}
              {entry.isHiddenGem && (
                <span className="history-filter-chip history-filter-chip--gem">
                  💎 {t("history.gem")}
                </span>
              )}
            </div>

            {entry.topRecommendations.length > 0 && (
              <div className="history-posters">
                {entry.topRecommendations.slice(0, 5).map((rec) => (
                  <div key={rec.movieId} className="history-poster-item">
                    <img
                      src={rec.poster}
                      alt={rec.title}
                      className="history-poster"
                      loading="lazy"
                    />
                    <span className="history-poster-score">
                      {Math.round(rec.score)}%
                    </span>
                  </div>
                ))}
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}

export default LibraryModal;
