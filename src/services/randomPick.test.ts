import { describe, it, expect } from "vitest";
import { generateContextExplanation } from "./randomPick";

describe("generateContextExplanation", () => {
  it("returns morning text for morning context", () => {
    const result = generateContextExplanation({
      timeOfDay: "morning",
      dayOfWeek: "weekday",
      season: "spring",
    });
    expect(result).toContain("morgen");
  });

  it("returns evening text for evening context", () => {
    const result = generateContextExplanation({
      timeOfDay: "evening",
      dayOfWeek: "weekend",
      season: "winter",
    });
    expect(result).toContain("kveld");
    expect(result).toContain("Helg");
    expect(result).toContain("Vinteren");
  });

  it("returns night text for night context", () => {
    const result = generateContextExplanation({
      timeOfDay: "night",
      dayOfWeek: "weekday",
      season: "fall",
    });
    expect(result).toContain("Sen kveld");
    expect(result).toContain("Høsten");
  });

  it("returns afternoon text for afternoon context", () => {
    const result = generateContextExplanation({
      timeOfDay: "afternoon",
      dayOfWeek: "weekend",
      season: "summer",
    });
    expect(result).toContain("Midt på dagen");
    expect(result).toContain("Sommer");
  });

  it("combines all context parts into a single string", () => {
    const result = generateContextExplanation({
      timeOfDay: "morning",
      dayOfWeek: "weekday",
      season: "spring",
    });
    const parts = result.split(". ").filter(Boolean);
    expect(parts.length).toBeGreaterThanOrEqual(2);
  });
});
