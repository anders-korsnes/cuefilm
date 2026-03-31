import type { ScoredMovie } from "./matchingEngine";

export function diversifyResults(
  scored: ScoredMovie[],
  topCount: number = 4,
): ScoredMovie[] {
  if (scored.length <= topCount) return scored;

  const selected: ScoredMovie[] = [];
  const remaining = [...scored];

  // Alltid ta den beste
  selected.push(remaining.shift()!);

  // For resten av topp-plassene, velg høyest scorede som er forskjellig nok
  while (selected.length < topCount && remaining.length > 0) {
    const best = findMostDiverse(selected, remaining);
    selected.push(best);
    remaining.splice(remaining.indexOf(best), 1);
  }

  return [...selected, ...remaining];
}

function findMostDiverse(
  selected: ScoredMovie[],
  candidates: ScoredMovie[],
): ScoredMovie {
  let bestCandidate = candidates[0];
  let bestCombinedScore = 0;

  // Sjekk topp 10 kandidater
  for (const candidate of candidates.slice(0, 10)) {
    const diversityScore = calculateDiversity(selected, candidate);
    // Kombiner original score (70%) med diversitet (30%)
    const combinedScore = candidate.score * 0.7 + diversityScore * 30;

    if (combinedScore > bestCombinedScore) {
      bestCombinedScore = combinedScore;
      bestCandidate = candidate;
    }
  }

  return bestCandidate;
}

function calculateDiversity(
  selected: ScoredMovie[],
  candidate: ScoredMovie,
): number {
  let totalDiversity = 0;

  for (const existing of selected) {
    // Sjanger-diversitet (viktigst)
    const sharedGenres = candidate.movie.genre.filter((g) =>
      existing.movie.genre.includes(g),
    ).length;
    const maxGenres = Math.max(
      candidate.movie.genre.length,
      existing.movie.genre.length,
      1,
    );
    const genreDiversity = 1 - sharedGenres / maxGenres;

    // Tiår-diversitet
    const decadeDiff = Math.abs(
      Math.floor(candidate.movie.year / 10) -
        Math.floor(existing.movie.year / 10),
    );
    const decadeDiversity = Math.min(1, decadeDiff / 3);

    // Land-diversitet
    const countryDiversity =
      candidate.movie.country !== existing.movie.country ? 1 : 0;

    // Mood-diversitet (energi og tension mest merkbart for brukeren)
    const energyDiff = Math.abs(
      candidate.movie.mood.energy - existing.movie.mood.energy,
    );
    const tensionDiff = Math.abs(
      candidate.movie.mood.tension - existing.movie.mood.tension,
    );
    const moodDiversity = Math.min(1, (energyDiff + tensionDiff) / 10);

    // Regissør-diversitet (unngå flere filmer av samme regissør)
    const directorDiversity =
      candidate.movie.director !== existing.movie.director ? 1 : 0;

    totalDiversity +=
      genreDiversity * 0.3 +
      decadeDiversity * 0.15 +
      countryDiversity * 0.15 +
      moodDiversity * 0.2 +
      directorDiversity * 0.2;
  }

  return totalDiversity / selected.length;
}
