type MoodOption<T> = {
  value: T;
  label: string;
  emoji: string;
};

type MoodSelectorProps<T> = {
  title: string;
  options: MoodOption<T>[];
  selected: T | null;
  onSelect: (value: T) => void;
  compact?: boolean;
};

function MoodSelector<T extends string>({
  title,
  options,
  selected,
  onSelect,
  compact = false,
}: MoodSelectorProps<T>) {
  return (
    <div className={`mood-selector ${compact ? "mood-selector-compact" : ""}`}>
      <h3>{title}</h3>
      <div className="mood-options">
        {options.map((option) => (
          <button
            key={option.value}
            className={`mood-button ${compact ? "mood-button-compact" : ""} ${selected === option.value ? "selected" : ""}`}
            onClick={() => onSelect(option.value)}
            title={option.label}
          >
            <span
              className={`mood-emoji ${compact ? "mood-emoji-compact" : ""}`}
            >
              {option.emoji}
            </span>
            <span
              className={`mood-label ${compact ? "mood-label-compact" : ""}`}
            >
              {option.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

export default MoodSelector;
