import type {
  Concentration,
  SocialContext,
  MediaType,
  Language,
  Country,
} from "../../types/criteria";
import SearchableSelect from "./SearchableSelect";
import { useTranslation } from "../../hooks/useTranslation";

type PracticalSettingsProps = {
  availableTime: number;
  concentration: Concentration | null;
  socialContext: SocialContext | null;
  mediaType: MediaType;
  yearRange: [number, number];
  language: Language;
  country: Country;
  onTimeChange: (time: number) => void;
  onConcentrationChange: (value: Concentration | null) => void;
  onSocialContextChange: (value: SocialContext | null) => void;
  onMediaTypeChange: (value: MediaType) => void;
  onYearRangeChange: (range: [number, number]) => void;
  onLanguageChange: (value: Language) => void;
  onCountryChange: (value: Country) => void;
};

function PracticalSettings({
  availableTime,
  concentration,
  socialContext,
  mediaType,
  yearRange,
  language,
  country,
  onTimeChange,
  onConcentrationChange,
  onSocialContextChange,
  onMediaTypeChange,
  onYearRangeChange,
  onLanguageChange,
  onCountryChange,
}: PracticalSettingsProps) {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();

  const concentrationOptions: { value: Concentration | null; label: string }[] =
    [
      { value: null, label: t("settings.notRelevant") },
      { value: "low", label: t("settings.low") },
      { value: "medium", label: t("settings.medium") },
      { value: "high", label: t("settings.high") },
    ];

  const socialOptions: { value: SocialContext | null; label: string }[] = [
    { value: null, label: t("settings.notRelevant") },
    { value: "alone", label: t("settings.alone") },
    { value: "partner", label: t("settings.partner") },
    { value: "friends", label: t("settings.friends") },
    { value: "family", label: t("settings.family") },
  ];

  const languageOptions = [
    { value: "any", label: t("settings.allLanguages") },
    { value: "english", label: t("lang.english") },
    { value: "norwegian", label: t("lang.norwegian") },
    { value: "swedish", label: t("lang.swedish") },
    { value: "danish", label: t("lang.danish") },
    { value: "finnish", label: t("lang.finnish") },
    { value: "french", label: t("lang.french") },
    { value: "spanish", label: t("lang.spanish") },
    { value: "portuguese", label: t("lang.portuguese") },
    { value: "german", label: t("lang.german") },
    { value: "dutch", label: t("lang.dutch") },
    { value: "italian", label: t("lang.italian") },
    { value: "russian", label: t("lang.russian") },
    { value: "ukrainian", label: t("lang.ukrainian") },
    { value: "polish", label: t("lang.polish") },
    { value: "czech", label: t("lang.czech") },
    { value: "hungarian", label: t("lang.hungarian") },
    { value: "romanian", label: t("lang.romanian") },
    { value: "greek", label: t("lang.greek") },
    { value: "turkish", label: t("lang.turkish") },
    { value: "arabic", label: t("lang.arabic") },
    { value: "persian", label: t("lang.persian") },
    { value: "hebrew", label: t("lang.hebrew") },
    { value: "hindi", label: t("lang.hindi") },
    { value: "korean", label: t("lang.korean") },
    { value: "japanese", label: t("lang.japanese") },
    { value: "chinese", label: t("lang.chinese") },
    { value: "thai", label: t("lang.thai") },
    { value: "vietnamese", label: t("lang.vietnamese") },
    { value: "indonesian", label: t("lang.indonesian") },
    { value: "malay", label: t("lang.malay") },
  ];

  const countryOptions = [
    { value: "any", label: t("settings.allCountries") },
    { value: "american", label: t("country.usa") },
    { value: "british", label: t("country.uk") },
    { value: "canadian", label: t("country.canada") },
    { value: "australian", label: t("country.australia") },
    { value: "newzealand", label: t("country.newzealand") },
    { value: "irish", label: t("country.ireland") },
    { value: "norwegian", label: t("country.norway") },
    { value: "swedish", label: t("country.sweden") },
    { value: "danish", label: t("country.denmark") },
    { value: "finnish", label: t("country.finland") },
    { value: "french", label: t("country.france") },
    { value: "spanish", label: t("country.spain") },
    { value: "portuguese", label: t("country.portugal") },
    { value: "german", label: t("country.germany") },
    { value: "austrian", label: t("country.austria") },
    { value: "swiss", label: t("country.switzerland") },
    { value: "dutch", label: t("country.netherlands") },
    { value: "belgian", label: t("country.belgium") },
    { value: "italian", label: t("country.italy") },
    { value: "russian", label: t("country.russia") },
    { value: "polish", label: t("country.poland") },
    { value: "czech", label: t("country.czech") },
    { value: "hungarian", label: t("country.hungary") },
    { value: "romanian", label: t("country.romania") },
    { value: "greek", label: t("country.greece") },
    { value: "turkish", label: t("country.turkey") },
    { value: "israeli", label: t("country.israel") },
    { value: "iranian", label: t("country.iran") },
    { value: "egyptian", label: t("country.egypt") },
    { value: "nigerian", label: t("country.nigeria") },
    { value: "southafrican", label: t("country.southafrica") },
    { value: "indian", label: t("country.india") },
    { value: "korean", label: t("country.southkorea") },
    { value: "japanese", label: t("country.japan") },
    { value: "chinese", label: t("country.china") },
    { value: "thai", label: t("country.thailand") },
    { value: "indonesian", label: t("country.indonesia") },
    { value: "brazilian", label: t("country.brazil") },
    { value: "mexican", label: t("country.mexico") },
    { value: "argentinian", label: t("country.argentina") },
    { value: "colombian", label: t("country.colombia") },
  ];

  return (
    <div className="practical-settings">
      <h3>{t("settings.practical")}</h3>

      <div className="setting-group">
        <label>{t("settings.mediaType")}</label>
        <div className="setting-options">
          {(["movie", "series", "both"] as MediaType[]).map((type) => (
            <button
              key={type}
              type="button"
              className={`setting-button ${mediaType === type ? "selected" : ""}`}
              onClick={() => onMediaTypeChange(type)}
            >
              {t(`settings.mediaType.${type}`)}
            </button>
          ))}
        </div>
      </div>

      <div className="setting-group">
        <label>{mediaType === "series" ? t("settings.timeEpisode") : t("settings.time")}</label>
        <div className="time-slider-container">
          <span className="time-display">
            {availableTime <= 30 ? t("settings.notRelevant") : `${availableTime} min`}
          </span>
          <input
            type="range"
            className="time-slider"
            min={30}
            max={240}
            step={10}
            value={availableTime}
            onChange={(e) => onTimeChange(Number(e.target.value))}
          />
        </div>
      </div>

      <div className="setting-group">
        <label>{t("settings.period")}</label>
        <div className="year-range-container">
          <div className="year-range-display">
            {yearRange[0] === yearRange[1] ? (
              <>
                <span className="year-value">{yearRange[0]}</span>
                <span className="year-separator">→</span>
              </>
            ) : (
              <>
                <span className="year-value">{yearRange[0]}</span>
                <span className="year-separator">—</span>
                <span className="year-value">{yearRange[1]}</span>
              </>
            )}
          </div>
          <div className="dual-slider">
            <div
              className="dual-slider-track"
              style={{
                left: `${((yearRange[0] - 1920) / (currentYear - 1920)) * 100}%`,
                right: `${100 - ((yearRange[1] - 1920) / (currentYear - 1920)) * 100}%`,
              }}
            />
            <input
              type="range"
              className={`dual-slider-input dual-slider-lower ${yearRange[0] > currentYear - 5 ? "on-top" : ""}`}
              min={1920}
              max={currentYear}
              step={1}
              value={yearRange[0]}
              onChange={(e) => {
                const from = Number(e.target.value);
                onYearRangeChange([Math.min(from, yearRange[1]), yearRange[1]]);
              }}
            />
            <input
              type="range"
              className="dual-slider-input dual-slider-upper"
              min={1920}
              max={currentYear}
              step={1}
              value={yearRange[1]}
              onChange={(e) => {
                const to = Number(e.target.value);
                onYearRangeChange([yearRange[0], Math.max(to, yearRange[0])]);
              }}
            />
          </div>
        </div>
      </div>

      <div className="select-row">
        <div className="setting-group">
          <label>{t("settings.language")}</label>
          <SearchableSelect
            options={languageOptions}
            selected={language}
            onSelect={(val) => onLanguageChange(val as Language)}
            placeholder={t("settings.searchLanguage")}
          />
        </div>

        <div className="setting-group">
          <label>{t("settings.country")}</label>
          <SearchableSelect
            options={countryOptions}
            selected={country}
            onSelect={(val) => onCountryChange(val as Country)}
            placeholder={t("settings.searchCountry")}
          />
        </div>
      </div>

      <div className="setting-group">
        <label>{t("settings.concentration")}</label>
        <div className="setting-options">
          {concentrationOptions.map((option) => (
            <button
              key={option.value ?? "none"}
              type="button"
              className={`setting-button ${concentration === option.value ? "selected" : ""}`}
              onClick={() => onConcentrationChange(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className="setting-group">
        <label>{t("settings.watchWith")}</label>
        <div className="setting-options">
          {socialOptions.map((option) => (
            <button
              key={option.value ?? "none"}
              type="button"
              className={`setting-button ${socialContext === option.value ? "selected" : ""}`}
              onClick={() => onSocialContextChange(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

    </div>
  );
}

export default PracticalSettings;
