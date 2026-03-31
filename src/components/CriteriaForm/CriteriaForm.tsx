import { useState } from "react";
import SimpleSelect from "./SimpleSelect";
import PracticalSettings from "./PracticalSettings";
import {
  currentMoodOptions,
  desiredMoodOptions,
} from "../../data/moodMappings";
import type {
  UserCriteria,
  CurrentMood,
  DesiredMood,
  Concentration,
  SocialContext,
  MediaType,
  Language,
  Country,
} from "../../types/criteria";
import { useTranslation } from "../../hooks/useTranslation";

type CriteriaFormProps = {
  onSubmit: (criteria: UserCriteria) => void;
  onHiddenGem: (criteria: UserCriteria) => void;
  initialCriteria?: UserCriteria | null;
};

function CriteriaForm({
  onSubmit,
  onHiddenGem,
  initialCriteria,
}: CriteriaFormProps) {
  const currentYear = new Date().getFullYear();
  const { t } = useTranslation();

  const currentMoodSelectOptions = currentMoodOptions.map((o) => ({
    value: o.value,
    label: `${o.emoji}  ${t(o.translationKey)}`,
  }));

  const desiredMoodSelectOptions = desiredMoodOptions.map((o) => ({
    value: o.value,
    label: `${o.emoji}  ${t(o.translationKey)}`,
  }));

  const [currentMood, setCurrentMood] = useState<CurrentMood | null>(
    initialCriteria?.currentMood ?? null,
  );
  const [desiredMood, setDesiredMood] = useState<DesiredMood | null>(
    initialCriteria?.desiredMood ?? null,
  );
  const [availableTime, setAvailableTime] = useState(
    initialCriteria?.availableTime ?? 120,
  );
  const [concentration, setConcentration] = useState<Concentration | null>(
    initialCriteria?.concentration ?? null,
  );
  const [socialContext, setSocialContext] = useState<SocialContext | null>(
    initialCriteria?.socialContext ?? null,
  );
  const [yearRange, setYearRange] = useState<[number, number]>(
    initialCriteria?.yearRange ?? [1970, currentYear],
  );
  const [mediaType, setMediaType] = useState<MediaType>(
    initialCriteria?.mediaType ?? "movie",
  );
  const [language, setLanguage] = useState<Language>(
    initialCriteria?.language ?? "any",
  );
  const [country, setCountry] = useState<Country>(
    initialCriteria?.country ?? "any",
  );

  const isValid = currentMood !== null && desiredMood !== null;

  const hasAnyValue =
    currentMood !== null ||
    desiredMood !== null ||
    availableTime !== 120 ||
    concentration !== null ||
    socialContext !== null ||
    mediaType !== "movie" ||
    yearRange[0] !== 1970 ||
    yearRange[1] !== currentYear ||
    language !== "any" ||
    country !== "any";

  const buildCriteria = (): UserCriteria => ({
    currentMood,
    desiredMood,
    availableTime,
    concentration,
    socialContext,
    mediaType,
    yearRange,
    language,
    country,
  });

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (isValid) onSubmit(buildCriteria());
  };
  const handleHiddenGem = () => {
    if (isValid) onHiddenGem(buildCriteria());
  };

  const handleReset = () => {
    setCurrentMood(null);
    setDesiredMood(null);
    setAvailableTime(120);
    setConcentration(null);
    setSocialContext(null);
    setMediaType("movie");
    setYearRange([1970, currentYear]);
    setLanguage("any");
    setCountry("any");
  };

  return (
    <form className="criteria-form" onSubmit={handleSubmit}>
      <div className="criteria-form-header">
        {hasAnyValue && (
          <button className="reset-button" onClick={handleReset}>
            {t("submit.reset")}
          </button>
        )}
      </div>

      <div className="mood-row">
        <div className="mood-select-group">
          <label className="mood-select-label">{t("mood.currentLabel")}</label>
          <SimpleSelect
            options={currentMoodSelectOptions}
            selected={currentMood || ""}
            onSelect={(val) => setCurrentMood(val as CurrentMood)}
            emptyLabel={t("mood.selectCurrent")}
          />
        </div>

        <div className="mood-arrow">→</div>

        <div className="mood-select-group">
          <label className="mood-select-label">{t("mood.desiredLabel")}</label>
          <SimpleSelect
            options={desiredMoodSelectOptions}
            selected={desiredMood || ""}
            onSelect={(val) => setDesiredMood(val as DesiredMood)}
            emptyLabel={t("mood.selectDesired")}
          />
        </div>
      </div>

      <PracticalSettings
        availableTime={availableTime}
        concentration={concentration}
        socialContext={socialContext}
        yearRange={yearRange}
        language={language}
        country={country}
        onTimeChange={setAvailableTime}
        onConcentrationChange={setConcentration}
        onSocialContextChange={setSocialContext}
        mediaType={mediaType}
        onMediaTypeChange={setMediaType}
        onYearRangeChange={setYearRange}
        onLanguageChange={setLanguage}
        onCountryChange={setCountry}
      />

      <div className="submit-buttons">
        <button
          type="submit"
          className="submit-button"
          disabled={!isValid}
        >
          {mediaType === "series"
            ? t("submit.findSeries")
            : mediaType === "both"
              ? t("submit.findContent")
              : t("submit.findMovies")}
        </button>
        <button
          type="button"
          className="submit-button hidden-gem-button"
          disabled={!isValid}
          onClick={handleHiddenGem}
        >
          {t("submit.hiddenGem")}
        </button>
      </div>
    </form>
  );
}

export default CriteriaForm;
