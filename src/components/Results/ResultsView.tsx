import MovieResults from "../MovieResults/MovieResults";
import type { ScoredMovie } from "../../services/matchingEngine";
import type { UserCriteria } from "../../types/criteria";
import type { UserMovie } from "../../types/userMovie";
import type { Movie } from "../../types/movie";
import { useTranslation } from "../../hooks/useTranslation";

type ResultsViewProps = {
  results: ScoredMovie[];
  criteria: UserCriteria;
  isHiddenGem: boolean;
  isRandom: boolean;
  findEntry: (movieId: string) => UserMovie | undefined;
  onToggleSave: (movieId: string, movie: Movie) => void;
  onToggleWatched: (movieId: string, movie: Movie) => void;
  onToggleChosen: (movieId: string, movie: Movie) => void;
  onBack: () => void;
};

function ResultsView({
  results,
  criteria,
  findEntry,
  onToggleSave,
  onToggleWatched,
  onToggleChosen,
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
        onToggleChosen={onToggleChosen}
      />
    </div>
  );
}

export default ResultsView;
