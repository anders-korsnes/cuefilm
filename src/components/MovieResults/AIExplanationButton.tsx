import { useState } from "react";
import { generateAIExplanation } from "../../services/aiExplanation";
import { generateExplanation } from "../../services/matchExplanation";
import { useTranslation } from "../../hooks/useTranslation";
import type { Movie } from "../../types/movie";
import type { UserCriteria } from "../../types/criteria";

type AIExplanationButtonProps = {
  movie: Movie;
  criteria: UserCriteria;
};

function AIExplanationButton({ movie, criteria }: AIExplanationButtonProps) {
  const { t, language } = useTranslation();
  const [explanation, setExplanation] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);

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

    const result = await generateAIExplanation(movie, criteria, t, language);
    if (result.explanation) setExplanation(result.explanation);
    setLoading(false);
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
        <p className="ai-explanation-text">{explanation}</p>
      )}
    </div>
  );
}

export default AIExplanationButton;
