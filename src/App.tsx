import { useReducer, useEffect, useCallback, useState } from "react";
import { Routes, Route, useNavigate } from "react-router";
import CriteriaForm from "./components/CriteriaForm/CriteriaForm";
import ResultsView from "./components/Results/ResultsView";
import Loader from "./components/Loader/Loader";
import LibraryModal from "./components/Library/LibraryModal";
import SettingsModal from "./components/Settings/SettingsModal";
import RandomPickButton from "./components/RandomPick/RandomPickButton";
import ProfileMenu from "./components/Header/ProfileMenu";
import { discoverMovies, searchPerson } from "./services/movieApi";
import { scoreMovies } from "./services/matchingEngine";
import useUserLibrary from "./hooks/useUserLibrary";
import useMovieSearch from "./hooks/useMovieSearch";
import useUserSettings from "./hooks/useUserSettings";
import useSearchHistory from "./hooks/useSearchHistory";
import OnboardingModal from "./components/Onboarding/OnboardingModal";
import WatchTogetherModal from "./components/WatchTogether/WatchTogetherModal";
import ShareTasteCard from "./components/ShareTaste/ShareTasteCard";
import { useAuth } from "@clerk/react";
import { useTranslation } from "./hooks/useTranslation";
import type { UserCriteria } from "./types/criteria";
import type { Movie } from "./types/movie";
import type { ScoredMovie } from "./services/matchingEngine";
import type { UserSettings } from "./types/userSettings";
import type { SearchHistoryEntry } from "./hooks/useSearchHistory";

type AppState = {
  criteria: UserCriteria | null;
  allMovies: Movie[];
  isRandom: boolean;
  randomLoading: boolean;
  randomResults: ScoredMovie[];
  libraryOpen: boolean;
  libraryTab: "saved" | "watched" | "history";
  settingsOpen: boolean;
  roomOpen: boolean;
  tasteOpen: boolean;
};

type AppAction =
  | { type: "START_SEARCH"; criteria: UserCriteria }
  | { type: "RANDOM_START" }
  | { type: "RANDOM_LOADED"; criteria: UserCriteria; results: ScoredMovie[]; newMovies: Movie[] }
  | { type: "RANDOM_DONE" }
  | { type: "GO_BACK" }
  | { type: "ADD_MOVIES"; movies: Movie[] }
  | { type: "OPEN_LIBRARY"; tab: "saved" | "watched" | "history" }
  | { type: "CLOSE_LIBRARY" }
  | { type: "OPEN_SETTINGS" }
  | { type: "CLOSE_SETTINGS" }
  | { type: "OPEN_ROOM" }
  | { type: "CLOSE_ROOM" }
  | { type: "OPEN_TASTE" }
  | { type: "CLOSE_TASTE" };

const initialState: AppState = {
  criteria: null,
  allMovies: [],
  isRandom: false,
  randomLoading: false,
  randomResults: [],
  libraryOpen: false,
  libraryTab: "saved",
  settingsOpen: false,
  roomOpen: false,
  tasteOpen: false,
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
    case "OPEN_ROOM":
      return { ...state, roomOpen: true };
    case "CLOSE_ROOM":
      return { ...state, roomOpen: false };
    case "OPEN_TASTE":
      return { ...state, tasteOpen: true };
    case "CLOSE_TASTE":
      return { ...state, tasteOpen: false };
  }
}

// TMDB genre ID mapping for personal suggestions
const GENRE_NAME_TO_ID: Record<string, number> = {
  Action: 28, Adventure: 12, Animation: 16, Comedy: 35, Crime: 80,
  Documentary: 99, Drama: 18, Family: 10751, Fantasy: 14, History: 36,
  Horror: 27, Music: 10402, Mystery: 9648, Romance: 10749,
  "Science Fiction": 878, "TV Movie": 10770, Thriller: 53,
  War: 10752, Western: 37,
};

function App() {
  const { t, setLanguage, language } = useTranslation();
  const { isSignedIn } = useAuth();
  const navigate = useNavigate();
  const [state, dispatch] = useReducer(appReducer, initialState);
  const { results, loading, error, isHiddenGem, search } = useMovieSearch();
  const { library, findEntry, toggleSave, toggleWatched, toggleChosen, toggleDisliked } = useUserLibrary();
  const { settings, updateProfile, setTheme, setAppLanguage, clearAllData } =
    useUserSettings();
  const { history, loading: historyLoading, saveSearch } = useSearchHistory();
  const [suggestLoading, setSuggestLoading] = useState(false);

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
    navigate("/results");
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

  const handlePersonalSuggest = useCallback(async () => {
    if (!isSignedIn || library.length === 0) return;
    setSuggestLoading(true);
    dispatch({ type: "RANDOM_START" });

    try {
      const liked = library.filter((e) => e.saved || e.chosen);
      const disliked = library.filter((e) => e.disliked);
      const watchedIds = new Set(library.filter((e) => e.watched).map((e) => e.movieId));
      const dislikedIds = new Set(disliked.map((e) => e.movieId));

      const genreCount: Record<string, number> = {};
      const directorCount: Record<string, number> = {};
      const actorCount: Record<string, number> = {};
      const dislikedGenres = new Set<string>();

      for (const entry of liked) {
        if (entry.movieSnapshot) {
          for (const g of entry.movieSnapshot.genre) {
            genreCount[g] = (genreCount[g] || 0) + 1;
          }
          if (entry.movieSnapshot.director) {
            directorCount[entry.movieSnapshot.director] =
              (directorCount[entry.movieSnapshot.director] || 0) + 1;
          }
          if (entry.movieSnapshot.actors) {
            for (const a of entry.movieSnapshot.actors) {
              actorCount[a] = (actorCount[a] || 0) + 1;
            }
          }
        }
      }
      for (const entry of disliked) {
        if (entry.movieSnapshot) {
          for (const g of entry.movieSnapshot.genre) {
            dislikedGenres.add(g);
          }
        }
      }

      const sortedGenres = Object.entries(genreCount)
        .filter(([g]) => !dislikedGenres.has(g))
        .sort(([, a], [, b]) => b - a)
        .slice(0, 3)
        .map(([g]) => g);

      const genreIds = sortedGenres
        .map((g) => GENRE_NAME_TO_ID[g])
        .filter(Boolean);

      if (genreIds.length === 0) {
        genreIds.push(18, 35);
      }

      // Resolve top actors/directors to TMDB person IDs for better discover
      const topPeople = [
        ...Object.entries(directorCount).sort(([, a], [, b]) => b - a).slice(0, 1),
        ...Object.entries(actorCount).sort(([, a], [, b]) => b - a).slice(0, 2),
      ].map(([name]) => name);

      const personIds = (
        await Promise.all(topPeople.map((p) => searchPerson(p)))
      ).filter((id): id is number => id !== null);

      const randomPage = Math.floor(Math.random() * 3) + 1;

      const [genreMovies, personMovies] = await Promise.all([
        discoverMovies(
          undefined, undefined, undefined, undefined,
          genreIds, randomPage, undefined, false, language,
        ),
        personIds.length > 0
          ? discoverMovies(
              undefined, undefined, undefined, undefined,
              undefined, randomPage, undefined, false, language, personIds,
            )
          : Promise.resolve([]),
      ]);

      const allFound = [...genreMovies, ...personMovies].filter(
        (m, i, self) => self.findIndex((o) => o.id === m.id) === i,
      );

      const filtered = allFound.filter(
        (m) => !watchedIds.has(m.id) && !dislikedIds.has(m.id),
      );

      if (filtered.length > 0) {
        const tempCriteria: UserCriteria = {
          currentMood: null,
          desiredMood: null,
          availableTime: 240,
          concentration: null,
          socialContext: null,
          mediaType: "both",
          yearRange: [1920, new Date().getFullYear()],
          language: "any",
          country: "any",
        };

        const scored = scoreMovies(filtered, tempCriteria, watchedIds);
        const newMovies = filtered.filter(
          (m) => !state.allMovies.some((p) => p.id === m.id),
        );

        dispatch({ type: "RANDOM_LOADED", criteria: tempCriteria, results: scored, newMovies });
        navigate("/results");
      }
    } catch (err) {
      console.error("Personal suggestion failed:", err);
    } finally {
      dispatch({ type: "RANDOM_DONE" });
      setSuggestLoading(false);
    }
  }, [isSignedIn, library, language, state.allMovies, navigate]);

  const handleBack = useCallback(() => {
    dispatch({ type: "GO_BACK" });
    navigate("/");
  }, [navigate]);

  const handleReplaySearch = useCallback(
    (entry: SearchHistoryEntry) => {
      dispatch({ type: "CLOSE_LIBRARY" });
      const criteria: UserCriteria = {
        currentMood: (entry.criteria.currentMood as UserCriteria["currentMood"]) || null,
        desiredMood: (entry.criteria.desiredMood as UserCriteria["desiredMood"]) || null,
        availableTime: 180,
        concentration: (entry.criteria.concentration as UserCriteria["concentration"]) || null,
        socialContext: (entry.criteria.socialContext as UserCriteria["socialContext"]) || null,
        mediaType: (entry.criteria.mediaType as UserCriteria["mediaType"]) || "movie",
        yearRange: [1920, new Date().getFullYear()],
        language: "any",
        country: "any",
      };
      handleSearch(criteria, false);
    },
    [handleSearch],
  );

  const handleRoomResults = useCallback(
    async (room: { participants: { currentMood?: string | null; desiredMood?: string | null; availableTime?: number; mediaType?: string }[] }) => {
      dispatch({ type: "CLOSE_ROOM" });
      dispatch({ type: "RANDOM_START" });
      navigate("/results");

      try {
        const moodVotes: Record<string, number> = {};
        let minTime = 480;

        for (const p of room.participants) {
          if (p.desiredMood) {
            moodVotes[p.desiredMood] = (moodVotes[p.desiredMood] || 0) + 1;
          }
          if (p.availableTime && p.availableTime < minTime) {
            minTime = p.availableTime;
          }
        }

        const topMood = Object.entries(moodVotes)
          .sort(([, a], [, b]) => b - a)[0]?.[0] || "amused";

        const criteria: UserCriteria = {
          currentMood: null,
          desiredMood: topMood as UserCriteria["desiredMood"],
          availableTime: minTime,
          concentration: null,
          socialContext: "friends",
          mediaType: "both",
          yearRange: [1920, new Date().getFullYear()],
          language: "any",
          country: "any",
        };

        const watchedIds = new Set(
          library.filter((e) => e.watched).map((e) => e.movieId),
        );
        const searchResults = await search(criteria, false, watchedIds);
        if (searchResults && searchResults.length > 0) {
          dispatch({ type: "START_SEARCH", criteria });
        }
      } catch (err) {
        console.error("Room search failed:", err);
      } finally {
        dispatch({ type: "RANDOM_DONE" });
      }
    },
    [library, search, navigate],
  );

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
              onSettings={() => dispatch({ type: "OPEN_SETTINGS" })}
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
              <div className={`quick-actions${isSignedIn ? " quick-actions--dual" : ""}`}>
                <RandomPickButton
                  onClick={handleRandomPick}
                  loading={state.randomLoading && !suggestLoading}
                />

                {isSignedIn && (
                  <button
                    className="suggest-pick-button"
                    onClick={handlePersonalSuggest}
                    disabled={suggestLoading || library.length === 0}
                  >
                    {suggestLoading ? t("suggest.loading") : t("suggest.button")}
                    <span
                      className="suggest-info-icon"
                      tabIndex={0}
                      role="note"
                      onClick={(e) => e.stopPropagation()}
                    >
                      i
                      <span className="suggest-tooltip">{t("suggest.tooltip")}</span>
                    </span>
                  </button>
                )}
              </div>

              <div className="secondary-actions">
                <button
                  className="secondary-action-btn"
                  onClick={() => dispatch({ type: "OPEN_ROOM" })}
                >
                  {t("room.button")}
                </button>
                {isSignedIn && library.length > 0 && (
                  <button
                    className="secondary-action-btn"
                    onClick={() => dispatch({ type: "OPEN_TASTE" })}
                  >
                    {t("taste.button")}
                  </button>
                )}
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
                    onToggleChosen={toggleChosen}
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
              onToggleDisliked={toggleDisliked}
              onClose={handleBack}
              initialTab={state.libraryTab}
              history={history}
              historyLoading={historyLoading}
              onReplaySearch={handleReplaySearch}
            />
          }
        />
      </Routes>

      {state.libraryOpen && (
        <LibraryModal
          library={library}
          onToggleSave={toggleSave}
          onToggleWatched={toggleWatched}
          onToggleDisliked={toggleDisliked}
          onClose={() => dispatch({ type: "CLOSE_LIBRARY" })}
          initialTab={state.libraryTab}
          history={history}
          historyLoading={historyLoading}
          onReplaySearch={handleReplaySearch}
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

      {state.roomOpen && (
        <WatchTogetherModal
          onClose={() => dispatch({ type: "CLOSE_ROOM" })}
          onResults={handleRoomResults}
        />
      )}

      {state.tasteOpen && (
        <ShareTasteCard
          library={library}
          onClose={() => dispatch({ type: "CLOSE_TASTE" })}
        />
      )}

      <OnboardingModal />
    </div>
  );
}

export default App;
