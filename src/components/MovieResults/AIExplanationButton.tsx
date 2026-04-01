import { useState } from "react";
import { generateAIExplanation, sendAIFeedback } from "../../services/aiExplanation";
import { generateExplanation } from "../../services/matchExplanation";
import { useTranslation } from "../../hooks/useTranslation";
import { useAuth } from "@clerk/react";
import type { Movie } from "../../types/movie";
import type { UserCriteria } from "../../types/criteria";
import type { LikedMovie } from "../../services/aiExplanation";

type AIExplanationButtonProps = {
  movie: Movie;
  criteria: UserCriteria;
  likedMovies?: LikedMovie[];
};

function AIExplanationButton({ movie, criteria, likedMovies = [] }: AIExplanationButtonProps) {
  const { t, language } = useTranslation();
  const { getToken } = useAuth();
  const [explanation, setExplanation] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [feedbackSent, setFeedbackSent] = useState<"up" | "down" | null>(null);

  const handleClick = async () => {
    if (expanded && explanation) {
      setExpanded(false);
      return;
    }

    setExpanded(true);

    if (explanation) return;

    const fallback = generateExplanation(movie, criteria, t);
    setExplanation(fallback);
    setLoading(true);

    const result = await generateAIExplanation(movie, criteria, t, language, likedMovies, getToken);
    if (result.explanation) setExplanation(result.explanation);
    setLoading(false);
  };

  const handleFeedback = (type: "up" | "down") => {
    setFeedbackSent(type);
    sendAIFeedback(movie.id, movie.title, type, getToken);
  };

  return (
    <div className="ai-explanation">
      <button className="ai-explanation-button" onClick={handleClick}>
        {loading ? (
          <span className="ai-explanation-loading">
            {t("results.aiAnalyzing")}
          </span>
        ) : (
          <span>
            {expanded ? "−" : "✦"} {t("results.whyRecommended")}
          </span>
        )}
      </button>

      {expanded && !loading && explanation && (
        <>
          <p className="ai-explanation-text">{explanation}</p>
          <div className="ai-feedback">
            <button
              className={`ai-feedback-button ${feedbackSent === "up" ? "active" : ""}`}
              onClick={() => handleFeedback("up")}
              disabled={feedbackSent !== null}
              aria-label={t("ai.helpful")}
            >
              👍
            </button>
            <button
              className={`ai-feedback-button ${feedbackSent === "down" ? "active" : ""}`}
              onClick={() => handleFeedback("down")}
              disabled={feedbackSent !== null}
              aria-label={t("ai.notHelpful")}
            >
              👎
            </button>
            {feedbackSent && (
              <span className="ai-feedback-thanks">{t("ai.thanks")}</span>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default AIExplanationButton;
