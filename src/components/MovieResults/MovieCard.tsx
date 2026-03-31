import { useState } from "react";
import { useTranslation } from "../../hooks/useTranslation";
import type { Movie } from "../../types/movie";

type MovieCardProps = {
  movie: Movie;
  score?: number;
  isSaved: boolean;
  isWatched: boolean;
  onToggleSave: (movieId: string, movie: Movie) => void;
  onToggleWatched: (movieId: string, movie: Movie) => void;
};

function MovieCard({
  movie,
  score,
  isSaved,
  isWatched,
  onToggleSave,
  onToggleWatched,
}: MovieCardProps) {
  const { t } = useTranslation();
  const [imgError, setImgError] = useState(false);
  const scoreClass =
    score && score >= 70
      ? "score-high"
      : score && score >= 50
        ? "score-medium"
        : "score-low";

  return (
    <div className="movie-card">
      {movie.poster && !imgError ? (
        <img
          className="movie-poster"
          src={movie.poster}
          alt={movie.title}
          loading="lazy"
          onError={() => setImgError(true)}
        />
      ) : (
        <div className="movie-poster movie-poster-fallback">
          🎬
        </div>
      )}

      <div className="movie-info">
        <div className="movie-title-row">
          <span className="movie-title">{movie.title}</span>
          <span className={`media-type-badge media-type-badge--${movie.mediaType}`}>
            {movie.mediaType === "series" ? t("movie.type.series") : t("movie.type.movie")}
          </span>
        </div>
        <span className="movie-meta">
          {movie.year} · {movie.runtime} {movie.mediaType === "series" ? t("movie.minPerEpisode") : "min"}
          {movie.mediaType === "series" && movie.numberOfSeasons != null && (
            <> · {movie.numberOfSeasons === 1 ? t("movie.season") : t("movie.seasons").replace("{count}", String(movie.numberOfSeasons))}</>
          )}
          {" · "}★ {movie.rating}
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

        <div className="movie-actions">
          <button
            className={`action-button ${isSaved ? "active" : ""}`}
            onClick={() => onToggleSave(movie.id, movie)}
            aria-pressed={isSaved}
          >
            {isSaved ? t("movie.saved") : t("movie.save")}
          </button>
          <button
            className={`action-button ${isWatched ? "active" : ""}`}
            onClick={() => onToggleWatched(movie.id, movie)}
            aria-pressed={isWatched}
          >
            {isWatched ? t("movie.watched") : t("movie.notWatched")}
          </button>
          {"share" in navigator && (
            <button
              className="action-button"
              onClick={() => {
                navigator.share({
                  title: movie.title,
                  text: t("share.text", { title: movie.title, year: movie.year }),
                  url: window.location.href,
                }).catch(() => {});
              }}
            >
              {t("share.button")}
            </button>
          )}
        </div>
      </div>

      {score !== undefined && score >= 0 && (
        <div className="match-score">
          <span className={`score-value ${scoreClass}`}>{score}</span>
        </div>
      )}
    </div>
  );
}

export default MovieCard;
