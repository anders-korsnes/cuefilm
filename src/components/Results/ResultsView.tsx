import MovieResults from "../MovieResults/MovieResults";
import type { ScoredMovie } from "../../services/matchingEngine";
import type { UserCriteria } from "../../types/criteria";
import type { UserMovie } from "../../types/userMovie";
import { useTranslation } from "../../hooks/useTranslation";

type ResultsViewProps = {
  results: ScoredMovie[];
  criteria: UserCriteria;
  isHiddenGem: boolean;
  isRandom: boolean;
  findEntry: (movieId: string) => UserMovie | undefined;
  onToggleSave: (movieId: string) => void;
  onToggleWatched: (movieId: string) => void;
  onBack: () => void;
};

function ResultsView({
  results,
  criteria,
  findEntry,
  onToggleSave,
  onToggleWatched,
  onBack,
}: ResultsViewProps) {
  const { t } = useTranslation();

  return (
    <div className="results-view">
      <div className="results-view-header">
        <button className="back-button" onClick={onBack}>
          {t("results.back")}
        </button>
      </div>

      <MovieResults
        results={results}
        criteria={criteria}
        findEntry={findEntry}
        onToggleSave={onToggleSave}
        onToggleWatched={onToggleWatched}
      />
    </div>
  );
}

export default ResultsView;
