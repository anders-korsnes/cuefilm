import { useReducer, useEffect, useCallback } from "react";
import { Routes, Route, useNavigate } from "react-router";
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
import useSearchHistory from "./hooks/useSearchHistory";
import { useAuth } from "@clerk/react";
import { useTranslation } from "./hooks/useTranslation";
import type { UserCriteria } from "./types/criteria";
import type { Movie } from "./types/movie";
import type { ScoredMovie } from "./services/matchingEngine";
import type { UserSettings } from "./types/userSettings";

type AppState = {
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
    case "RANDOM_START":
      return { ...state, randomLoading: true, isRandom: true, randomResults: [] };
    case "RANDOM_LOADED":
      return {
        ...state,
        criteria: action.criteria,
        randomResults: action.results,
        allMovies: [...state.allMovies, ...action.newMovies],
      };
    case "RANDOM_DONE":
      return { ...state, randomLoading: false };
    case "GO_BACK":
      return { ...state, isRandom: false };
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
  const navigate = useNavigate();
  const [state, dispatch] = useReducer(appReducer, initialState);
  const { results, loading, error, isHiddenGem, search } = useMovieSearch();
  const { library, findEntry, toggleSave, toggleWatched } = useUserLibrary();
  const { settings, updateProfile, setTheme, setAppLanguage, clearAllData } =
    useUserSettings();
  const { saveSearch } = useSearchHistory();

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
    const searchResults = await search(newCriteria, hiddenGem, watchedIds);
    if (searchResults && searchResults.length > 0) {
      saveSearch(
        newCriteria,
        searchResults.slice(0, 5).map((r) => ({
          movieId: r.movie.id,
          title: r.movie.title,
          year: r.movie.year,
          poster: r.movie.poster,
          score: r.score,
        })),
        false,
        hiddenGem,
      );
    }
    navigate("/results");
  }, [library, search, navigate, saveSearch]);

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
        navigate("/results");
      }
    } catch (err) {
      console.error("Random pick failed:", err);
    } finally {
      dispatch({ type: "RANDOM_DONE" });
    }
  }, [language, state.allMovies, navigate]);

  const handleBack = useCallback(() => {
    dispatch({ type: "GO_BACK" });
    navigate("/");
  }, [navigate]);

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
          <h1>
            <button
              className="app-title-button"
              onClick={handleBack}
              type="button"
            >
              {t("app.title")}
            </button>
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

      <Routes>
        <Route
          path="/"
          element={
            <>
              <div className="random-pick-row">
                <RandomPickButton
                  onClick={handleRandomPick}
                  loading={state.randomLoading}
                />
                <span className="random-pick-text">{t("random.feelingLucky")}</span>
              </div>

              <CriteriaForm
                onSubmit={handleCriteriaSubmit}
                onHiddenGem={handleHiddenGem}
                initialCriteria={state.criteria}
              />
            </>
          }
        />

        <Route
          path="/results"
          element={
            <>
              {activeLoading && <Loader />}

              {!activeLoading && error && !state.isRandom && (
                <div className="results-error">
                  <span className="results-error-text">{error}</span>
                  <button className="back-button" onClick={handleBack}>
                    {t("results.back")}
                  </button>
                </div>
              )}

              {!activeLoading &&
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

              {!activeLoading && !error && activeResults.length === 0 && !state.criteria && (
                <div className="results-error">
                  <span className="results-error-text">{t("error.noResults")}</span>
                  <button className="back-button" onClick={handleBack}>
                    {t("results.back")}
                  </button>
                </div>
              )}
            </>
          }
        />

        <Route
          path="/library"
          element={
            <LibraryModal
              library={library}
              onToggleSave={toggleSave}
              onToggleWatched={toggleWatched}
              onClose={handleBack}
              initialTab={state.libraryTab}
            />
          }
        />
      </Routes>

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
