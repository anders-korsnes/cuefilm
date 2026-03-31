import { useReducer, useEffect, useCallback } from "react";
import CriteriaForm from "./components/CriteriaForm/CriteriaForm";
import ResultsView from "./components/Results/ResultsView";
import Loader from "./components/Loader/Loader";
import LibraryModal from "./components/Library/LibraryModal";
import SettingsModal from "./components/Settings/SettingsModal";
import RandomPickButton from "./components/RandomPick/RandomPickButton";
import ProfileMenu from "./components/Header/ProfileMenu";
import { discoverMovies } from "./services/movieApi";
import { scoreMovies } from "./services/matchingEngine";
import useUserLibrary from "./hooks/useUserLibrary";
import useMovieSearch from "./hooks/useMovieSearch";
import useUserSettings from "./hooks/useUserSettings";
import { useAuth } from "@clerk/react";
import { useTranslation } from "./hooks/useTranslation";
import type { UserCriteria } from "./types/criteria";
import type { Movie } from "./types/movie";
import type { ScoredMovie } from "./services/matchingEngine";
import type { UserSettings } from "./types/userSettings";

type View = "search" | "results";

type AppState = {
  view: View;
  criteria: UserCriteria | null;
  allMovies: Movie[];
  isRandom: boolean;
  randomLoading: boolean;
  randomResults: ScoredMovie[];
  libraryOpen: boolean;
  libraryTab: "saved" | "watched";
  settingsOpen: boolean;
};

type AppAction =
  | { type: "START_SEARCH"; criteria: UserCriteria }
  | { type: "SHOW_RESULTS" }
  | { type: "RANDOM_START" }
  | { type: "RANDOM_LOADED"; criteria: UserCriteria; results: ScoredMovie[]; newMovies: Movie[] }
  | { type: "RANDOM_DONE" }
  | { type: "GO_BACK" }
  | { type: "ADD_MOVIES"; movies: Movie[] }
  | { type: "OPEN_LIBRARY"; tab: "saved" | "watched" }
  | { type: "CLOSE_LIBRARY" }
  | { type: "OPEN_SETTINGS" }
  | { type: "CLOSE_SETTINGS" };

const initialState: AppState = {
  view: "search",
  criteria: null,
  allMovies: [],
  isRandom: false,
  randomLoading: false,
  randomResults: [],
  libraryOpen: false,
  libraryTab: "saved",
  settingsOpen: false,
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case "START_SEARCH":
      return { ...state, isRandom: false, criteria: action.criteria };
    case "SHOW_RESULTS":
      return { ...state, view: "results" };
    case "RANDOM_START":
      return { ...state, randomLoading: true, isRandom: true, randomResults: [] };
    case "RANDOM_LOADED":
      return {
        ...state,
        criteria: action.criteria,
        randomResults: action.results,
        allMovies: [...state.allMovies, ...action.newMovies],
        view: "results",
      };
    case "RANDOM_DONE":
      return { ...state, randomLoading: false };
    case "GO_BACK":
      return { ...state, view: "search", isRandom: false };
    case "ADD_MOVIES":
      return { ...state, allMovies: [...state.allMovies, ...action.movies] };
    case "OPEN_LIBRARY":
      return { ...state, libraryOpen: true, libraryTab: action.tab };
    case "CLOSE_LIBRARY":
      return { ...state, libraryOpen: false };
    case "OPEN_SETTINGS":
      return { ...state, settingsOpen: true };
    case "CLOSE_SETTINGS":
      return { ...state, settingsOpen: false };
  }
}

function App() {
  const { t, setLanguage, language } = useTranslation();
  const { isSignedIn } = useAuth();
  const [state, dispatch] = useReducer(appReducer, initialState);
  const { results, loading, error, isHiddenGem, search } = useMovieSearch();
  const { library, findEntry, toggleSave, toggleWatched } = useUserLibrary();
  const { settings, updateProfile, setTheme, setAppLanguage, clearAllData } =
    useUserSettings();

  const handleSaveSettings = useCallback((newSettings: UserSettings) => {
    updateProfile(newSettings.profile);
    setTheme(newSettings.theme);

    if (newSettings.appLanguage !== settings.appLanguage) {
      setAppLanguage(newSettings.appLanguage);
      setLanguage(newSettings.appLanguage);
    }
  }, [settings.appLanguage, updateProfile, setTheme, setAppLanguage, setLanguage]);

  const handleSearch = useCallback(async (
    newCriteria: UserCriteria,
    hiddenGem: boolean,
  ) => {
    dispatch({ type: "START_SEARCH", criteria: newCriteria });
    const watchedIds = new Set(
      library.filter((e) => e.watched).map((e) => e.movieId),
    );
    await search(newCriteria, hiddenGem, watchedIds);
    dispatch({ type: "SHOW_RESULTS" });
  }, [library, search]);

  const handleCriteriaSubmit = useCallback(
    (newCriteria: UserCriteria) => handleSearch(newCriteria, false),
    [handleSearch],
  );
  const handleHiddenGem = useCallback(
    (newCriteria: UserCriteria) => handleSearch(newCriteria, true),
    [handleSearch],
  );

  const handleRandomPick = useCallback(async () => {
    dispatch({ type: "RANDOM_START" });

    try {
      const now = new Date();
      const hour = now.getHours();
      const randomPage = Math.floor(Math.random() * 5) + 1;

      const timeGenres: Record<string, number[]> = {
        morning: [35, 12, 16],
        afternoon: [28, 12, 878],
        evening: [18, 53, 10749],
        night: [27, 53, 9648],
      };

      const timeOfDay =
        hour >= 6 && hour < 12
          ? "morning"
          : hour >= 12 && hour < 17
            ? "afternoon"
            : hour >= 17 && hour < 22
              ? "evening"
              : "night";

      const genres = timeGenres[timeOfDay];
      const randomGenre = genres[Math.floor(Math.random() * genres.length)];

      const movies = await discoverMovies(
        undefined,
        undefined,
        undefined,
        undefined,
        [randomGenre],
        randomPage,
        undefined,
        false,
        language,
      );

      if (movies.length > 0) {
        const shuffled = [...movies].sort(() => Math.random() - 0.5);

        const tempCriteria: UserCriteria = {
          currentMood: null,
          desiredMood: null,
          availableTime: 240,
          concentration: null,
          socialContext: null,
          mediaType: "movie",
          yearRange: [1920, new Date().getFullYear()],
          language: "any",
          country: "any",
        };

        const scored = scoreMovies(shuffled, tempCriteria);
        const newMovies = movies.filter(
          (m) => !state.allMovies.some((p) => p.id === m.id),
        );

        dispatch({ type: "RANDOM_LOADED", criteria: tempCriteria, results: scored, newMovies });
      } else {
        dispatch({ type: "SHOW_RESULTS" });
      }
    } catch (err) {
      console.error("Random pick failed:", err);
    } finally {
      dispatch({ type: "RANDOM_DONE" });
    }
  }, [language, state.allMovies]);

  const handleBack = useCallback(() => dispatch({ type: "GO_BACK" }), []);

  useEffect(() => {
    if (results.length === 0) return;
    const resultMovies = results.map((r) => r.movie);
    const newMovies = resultMovies.filter(
      (m) => !state.allMovies.some((existing) => existing.id === m.id),
    );
    if (newMovies.length > 0) {
      dispatch({ type: "ADD_MOVIES", movies: newMovies });
    }
  }, [results]); // eslint-disable-line react-hooks/exhaustive-deps

  const activeResults = state.isRandom ? state.randomResults : results;
  const activeLoading = state.isRandom ? state.randomLoading : loading;

  return (
    <div className="app">
      <header className="app-header">
        <div className="app-header-row">
          <h1 onClick={handleBack} style={{ cursor: "pointer" }}>
            {t("app.title")}
          </h1>
          <div className="header-actions">
            <button
              className="header-action-button"
              onClick={() => dispatch({ type: "OPEN_LIBRARY", tab: "saved" })}
              style={{ display: isSignedIn ? undefined : "none" }}
            >
              {t("header.myList")}
            </button>
            <ProfileMenu
              onWatchHistory={() => dispatch({ type: "OPEN_LIBRARY", tab: "watched" })}
              onSettings={() => dispatch({ type: "OPEN_SETTINGS" })}
              onLogout={() => {}}
              avatarUrl={settings.profile.avatarUrl}
            />
          </div>
        </div>
        <p>{t("app.subtitle")}</p>
      </header>

      {state.view === "search" && (
        <>
          <div className="random-pick-row">
            <RandomPickButton
              onClick={handleRandomPick}
              loading={state.randomLoading}
            />
            <span className="random-pick-text">{t("random.feelingLucky")}</span>
          </div>

          <CriteriaForm
            key={state.view}
            onSubmit={handleCriteriaSubmit}
            onHiddenGem={handleHiddenGem}
            initialCriteria={state.criteria}
          />
        </>
      )}

      {activeLoading && <Loader />}

      {!activeLoading && error && state.view === "results" && !state.isRandom && (
        <div className="results-error">
          <span className="results-error-text">{error}</span>
          <button className="back-button" onClick={handleBack}>
            {t("results.back")}
          </button>
        </div>
      )}

      {state.view === "results" &&
        !activeLoading &&
        state.criteria &&
        activeResults.length > 0 && (
          <ResultsView
            results={activeResults}
            criteria={state.criteria}
            isHiddenGem={state.isRandom ? false : isHiddenGem}
            isRandom={state.isRandom}
            findEntry={findEntry}
            onToggleSave={toggleSave}
            onToggleWatched={toggleWatched}
            onBack={handleBack}
          />
        )}

      {state.libraryOpen && (
        <LibraryModal
          library={library}
          onToggleSave={toggleSave}
          onToggleWatched={toggleWatched}
          onClose={() => dispatch({ type: "CLOSE_LIBRARY" })}
          initialTab={state.libraryTab}
        />
      )}

      {state.settingsOpen && (
        <SettingsModal
          settings={settings}
          onSave={handleSaveSettings}
          onDeleteAccount={clearAllData}
          onClose={() => dispatch({ type: "CLOSE_SETTINGS" })}
        />
      )}
    </div>
  );
}

export default App;
