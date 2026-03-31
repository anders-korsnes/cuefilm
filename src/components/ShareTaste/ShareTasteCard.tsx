import { useMemo, useRef } from "react";
import { useTranslation } from "../../hooks/useTranslation";
import type { UserMovie } from "../../types/userMovie";

type Props = {
  library: UserMovie[];
  onClose: () => void;
};

function ShareTasteCard({ library, onClose }: Props) {
  const { t } = useTranslation();
  const cardRef = useRef<HTMLDivElement>(null);

  const stats = useMemo(() => {
    const saved = library.filter((e) => e.saved);
    const watched = library.filter((e) => e.watched);
    const chosen = library.filter((e) => e.chosen);

    const genreCount: Record<string, number> = {};
    const directorCount: Record<string, number> = {};
    const decadeCount: Record<string, number> = {};

    for (const entry of [...saved, ...watched, ...chosen]) {
      const snap = entry.movieSnapshot;
      if (!snap) continue;
      for (const g of snap.genre) {
        genreCount[g] = (genreCount[g] || 0) + 1;
      }
      if (snap.director) {
        directorCount[snap.director] = (directorCount[snap.director] || 0) + 1;
      }
      const decade = Math.floor((snap.year || 2000) / 10) * 10;
      const key = `${decade}s`;
      decadeCount[key] = (decadeCount[key] || 0) + 1;
    }

    const topGenres = Object.entries(genreCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([g]) => g);

    const topDirector = Object.entries(directorCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 1)
      .map(([d]) => d)[0];

    const topDecade = Object.entries(decadeCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 1)
      .map(([d]) => d)[0];

    const totalMovies = new Set([...saved, ...watched, ...chosen].map((e) => e.movieId)).size;

    return { topGenres, topDirector, topDecade, totalMovies, savedCount: saved.length, watchedCount: watched.length };
  }, [library]);

  const handleShare = async () => {
    const text = [
      `${t("taste.myTaste")} — CueFilm`,
      "",
      `${t("taste.genres")}: ${stats.topGenres.join(", ") || "—"}`,
      stats.topDirector ? `${t("taste.director")}: ${stats.topDirector}` : "",
      stats.topDecade ? `${t("taste.decade")}: ${stats.topDecade}` : "",
      `${t("taste.movies")}: ${stats.totalMovies}`,
      "",
      t("taste.cta"),
    ]
      .filter(Boolean)
      .join("\n");

    if (navigator.share) {
      try {
        await navigator.share({ text });
      } catch {
        // user cancelled
      }
    } else {
      await navigator.clipboard.writeText(text);
    }
  };

  return (
    <dialog
      className="taste-dialog"
      ref={(el) => el?.showModal()}
      onCancel={onClose}
    >
      <div className="taste-content" ref={cardRef}>
        <button className="taste-close" onClick={onClose}>×</button>
        <h2 className="taste-title">{t("taste.myTaste")}</h2>

        <div className="taste-stats">
          <div className="taste-stat">
            <span className="taste-stat-value">{stats.totalMovies}</span>
            <span className="taste-stat-label">{t("taste.movies")}</span>
          </div>
          <div className="taste-stat">
            <span className="taste-stat-value">{stats.savedCount}</span>
            <span className="taste-stat-label">{t("taste.liked")}</span>
          </div>
          <div className="taste-stat">
            <span className="taste-stat-value">{stats.watchedCount}</span>
            <span className="taste-stat-label">{t("taste.watched")}</span>
          </div>
        </div>

        {stats.topGenres.length > 0 && (
          <div className="taste-section">
            <h3 className="taste-section-title">{t("taste.topGenres")}</h3>
            <div className="taste-chips">
              {stats.topGenres.map((g) => (
                <span key={g} className="taste-chip">{g}</span>
              ))}
            </div>
          </div>
        )}

        {stats.topDirector && (
          <div className="taste-section">
            <h3 className="taste-section-title">{t("taste.favDirector")}</h3>
            <span className="taste-highlight">{stats.topDirector}</span>
          </div>
        )}

        {stats.topDecade && (
          <div className="taste-section">
            <h3 className="taste-section-title">{t("taste.favDecade")}</h3>
            <span className="taste-highlight">{stats.topDecade}</span>
          </div>
        )}

        <button className="taste-share-btn" onClick={handleShare}>
          {t("taste.shareBtn")}
        </button>
      </div>
    </dialog>
  );
}

export default ShareTasteCard;
