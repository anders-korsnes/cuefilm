import { useState } from "react";
import { useTranslation } from "../../hooks/useTranslation";
import type { SearchHistoryEntry } from "../../hooks/useSearchHistory";

type Props = {
  history: SearchHistoryEntry[];
  loading: boolean;
  onReplay: (entry: SearchHistoryEntry) => void;
};

function SearchHistoryPanel({ history, loading, onReplay }: Props) {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);

  if (loading || history.length === 0) return null;

  const visible = expanded ? history : history.slice(0, 3);

  return (
    <section className="history-panel">
      <h3 className="history-panel-title">{t("history.title")}</h3>

      <div className="history-list">
        {visible.map((entry) => {
          const moods = [entry.criteria.currentMood, entry.criteria.desiredMood]
            .filter(Boolean)
            .map((m) => t(`mood.${m}`))
            .join(" → ");

          const dateStr = new Date(entry.createdAt).toLocaleDateString();

          return (
            <button
              key={entry._id}
              className="history-card"
              onClick={() => onReplay(entry)}
            >
              <div className="history-card-top">
                <span className="history-moods">
                  {moods || t("history.noMood")}
                </span>
                <span className="history-date">{dateStr}</span>
              </div>

              {entry.topRecommendations.length > 0 && (
                <div className="history-posters">
                  {entry.topRecommendations.slice(0, 4).map((rec) => (
                    <img
                      key={rec.movieId}
                      src={rec.poster}
                      alt={rec.title}
                      className="history-poster"
                      loading="lazy"
                    />
                  ))}
                </div>
              )}

              <div className="history-card-meta">
                {entry.isRandom && (
                  <span className="history-badge history-badge--random">
                    {t("history.random")}
                  </span>
                )}
                {entry.isHiddenGem && (
                  <span className="history-badge history-badge--gem">
                    {t("history.gem")}
                  </span>
                )}
                <span className="history-media-type">
                  {t(`settings.mediaType.${entry.criteria.mediaType}`)}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {history.length > 3 && (
        <button
          className="history-toggle"
          onClick={() => setExpanded(!expanded)}
        >
          {expanded
            ? t("history.showLess")
            : t("history.showMore").replace("{count}", String(history.length - 3))}
        </button>
      )}
    </section>
  );
}

export default SearchHistoryPanel;
