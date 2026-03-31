import { useState } from "react";
import AIExplanationButton from "./AIExplanationButton";
import { useTranslation } from "../../hooks/useTranslation";
import type { ScoredMovie } from "../../services/matchingEngine";
import type { UserMovie } from "../../types/userMovie";
import type { UserCriteria } from "../../types/criteria";
import type { Movie } from "../../types/movie";

type MovieResultsProps = {
  results: ScoredMovie[];
  criteria: UserCriteria;
  findEntry: (movieId: string) => UserMovie | undefined;
  onToggleSave: (movieId: string, movie: Movie) => void;
  onToggleWatched: (movieId: string, movie: Movie) => void;
};

function MovieResults({
  results,
  criteria,
  findEntry,
  onToggleSave,
  onToggleWatched,
}: MovieResultsProps) {
  const { t } = useTranslation();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (results.length === 0) return null;

  const topPick = results[0];
  const runners = results.slice(1, 4);
  const rest = results.slice(4, 14);

  // Hvis ingen er manuelt expanded, vis topPick som expanded
  const activeExpandedId = expandedId ?? topPick.movie.id;

  const handleExpand = (movieId: string) => {
    if (movieId === expandedId) {
      // Kollapser tilbake — topPick tar over
      setExpandedId(null);
    } else {
      setExpandedId(movieId);
    }
  };

  return (
    <div className="movie-results">
      <div className="primary-pick-label">{t("results.recommendation")}</div>

      {/* Top pick */}
      <FilmCard
        movie={topPick.movie}
        score={topPick.score}
        criteria={criteria}
        isExpanded={activeExpandedId === topPick.movie.id}
        onExpand={() => handleExpand(topPick.movie.id)}
        isTopPick
        entry={findEntry(topPick.movie.id)}
        onToggleSave={onToggleSave}
        onToggleWatched={onToggleWatched}
      />

      {/* Runners */}
      {runners.length > 0 && (
        <div className="runner-section">
          <h3 className="runner-heading">{t("results.alternatives")}</h3>
          <div className="runner-list">
            {runners.map((result) => (
              <FilmCard
                key={result.movie.id}
                movie={result.movie}
                score={result.score}
                criteria={criteria}
                isExpanded={activeExpandedId === result.movie.id}
                onExpand={() => handleExpand(result.movie.id)}
                entry={findEntry(result.movie.id)}
                onToggleSave={onToggleSave}
                onToggleWatched={onToggleWatched}
              />
            ))}
          </div>
        </div>
      )}

      {/* Rest */}
      {rest.length > 0 && (
        <RestList
          results={rest}
          criteria={criteria}
          expandedId={activeExpandedId}
          onExpand={handleExpand}
          findEntry={findEntry}
          onToggleSave={onToggleSave}
          onToggleWatched={onToggleWatched}
        />
      )}
    </div>
  );
}

// ===== Film Card (handles both expanded and collapsed) =====

type FilmCardProps = {
  movie: Movie;
  score: number;
  criteria: UserCriteria;
  isExpanded: boolean;
  onExpand: () => void;
  isTopPick?: boolean;
  entry: UserMovie | undefined;
  onToggleSave: (movieId: string, movie: Movie) => void;
  onToggleWatched: (movieId: string, movie: Movie) => void;
};

function FilmCard({
  movie,
  score,
  criteria,
  isExpanded,
  onExpand,
  isTopPick = false,
  entry,
  onToggleSave,
  onToggleWatched,
}: FilmCardProps) {
  const { t } = useTranslation();
  const scoreClass =
    score >= 70 ? "score-high" : score >= 50 ? "score-medium" : "score-low";

  if (isExpanded) {
    return (
      <div
        className={`primary-pick-content ${isTopPick ? "top-pick-border" : "expanded-border"}`}
      >
        {movie.poster ? (
          <img
            className="primary-poster"
            src={movie.poster}
            alt={movie.title}
          />
        ) : (
          <div className="primary-poster primary-poster-fallback">🎬</div>
        )}

        <div className="primary-info">
          <div className="primary-header">
            <span className="primary-title">{movie.title}</span>
            <span className={`score-value ${scoreClass}`}>{score}</span>
          </div>

          <span className="movie-meta">
            {movie.year} · {movie.runtime} min · ★ {movie.rating} ·{" "}
            {movie.voteCount.toLocaleString()} {t("movie.votes")}
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

          <AIExplanationButton movie={movie} criteria={criteria} />

          {movie.streamingProviders && movie.streamingProviders.length > 0 && (
            <div className="streaming-providers">
              <span className="streaming-label">Tilgjengelig på</span>
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

          <p className="primary-plot">{movie.plot}</p>

          <div className="primary-details">
            <div className="movie-detail-row">
              <span className="detail-label">{t("movie.director")}</span>
              <span className="detail-value">{movie.director}</span>
            </div>
            <div className="movie-detail-row">
              <span className="detail-label">{t("movie.actors")}</span>
              <span className="detail-value">{movie.actors.join(", ")}</span>
            </div>
          </div>

          <div className="expanded-card-bottom">
            <div className="movie-actions">
              <button
                className={`action-button ${entry?.saved ? "active" : ""}`}
                onClick={() => onToggleSave(movie.id, movie)}
              >
                {entry?.saved ? t("movie.saved") : t("movie.save")}
              </button>
              <button
                className={`action-button ${entry?.watched ? "active" : ""}`}
                onClick={() => onToggleWatched(movie.id, movie)}
              >
                {entry?.watched ? t("movie.watched") : t("movie.notWatched")}
              </button>
            </div>

            <button
              className="expand-card-button"
              onClick={onExpand}
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

  // Collapsed view
  return (
    <div className="runner-card runner-card-clickable" onClick={onExpand}>
      <div className="runner-card-top">
        {movie.poster ? (
          <img className="runner-poster" src={movie.poster} alt={movie.title} />
        ) : (
          <div className="runner-poster runner-poster-fallback">🎬</div>
        )}

        <div className="runner-info">
          <div className="runner-header">
            <span className="runner-title">{movie.title}</span>
            <span className={`score-value ${scoreClass}`}>{score}</span>
          </div>
          <span className="movie-meta">
            {movie.year} · {movie.runtime} min · ★ {movie.rating} ·{" "}
            {movie.voteCount.toLocaleString()} {t("movie.votes")}
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
            className={`action-button ${entry?.saved ? "active" : ""}`}
            onClick={() => onToggleSave(movie.id, movie)}
          >
            {entry?.saved ? t("movie.saved") : t("movie.save")}
          </button>
          <button
            className={`action-button ${entry?.watched ? "active" : ""}`}
            onClick={() => onToggleWatched(movie.id, movie)}
          >
            {entry?.watched ? t("movie.watched") : t("movie.notWatched")}
          </button>
        </div>

        <button
          className="expand-card-button"
          onClick={onExpand}
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

// ===== Rest List =====

type RestListProps = {
  results: ScoredMovie[];
  criteria: UserCriteria;
  expandedId: string;
  onExpand: (movieId: string) => void;
  findEntry: (movieId: string) => UserMovie | undefined;
  onToggleSave: (movieId: string, movie: Movie) => void;
  onToggleWatched: (movieId: string, movie: Movie) => void;
};

function RestList({
  results,
  criteria,
  expandedId,
  onExpand,
  findEntry,
  onToggleSave,
  onToggleWatched,
}: RestListProps) {
  const { t } = useTranslation();
  const [showMore, setShowMore] = useState(false);

  return (
    <div className="more-results">
      {!showMore ? (
        <button className="show-more-button" onClick={() => setShowMore(true)}>
          {t("results.showMore", { count: results.length })}
        </button>
      ) : (
        <>
          <div className="movie-list">
            {results.map((result) => (
              <FilmCard
                key={result.movie.id}
                movie={result.movie}
                score={result.score}
                criteria={criteria}
                isExpanded={expandedId === result.movie.id}
                onExpand={() => onExpand(result.movie.id)}
                entry={findEntry(result.movie.id)}
                onToggleSave={onToggleSave}
                onToggleWatched={onToggleWatched}
              />
            ))}
          </div>
          <button
            className="show-more-button"
            onClick={() => setShowMore(false)}
          >
            {t("results.hide")}
          </button>
        </>
      )}
    </div>
  );
}

export default MovieResults;
