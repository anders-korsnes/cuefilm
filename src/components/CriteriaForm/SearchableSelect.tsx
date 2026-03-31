import { useState, useRef, useEffect } from "react";
import { useTranslation } from "../../hooks/useTranslation";

type Option = {
  value: string;
  label: string;
};

type SearchableSelectProps = {
  options: Option[];
  selected: string;
  onSelect: (value: string) => void;
  placeholder?: string;
  emptyLabel?: string;
};

function SearchableSelect({
  options,
  selected,
  onSelect,
  placeholder,
  emptyLabel,
}: SearchableSelectProps) {
  const { t } = useTranslation();

  const resolvedPlaceholder = placeholder ?? t("settings.searchLanguage");
  const resolvedEmptyLabel = emptyLabel ?? t("settings.allLanguages");

  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = options.filter((opt) =>
    opt.label.toLowerCase().includes(search.toLowerCase()),
  );

  const selectedOption = options.find((opt) => opt.value === selected);
  const displayLabel = selectedOption?.label || resolvedEmptyLabel;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
        setSearch("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open]);

  const handleSelect = (value: string) => {
    onSelect(value);
    setOpen(false);
    setSearch("");
  };

  return (
    <div className="searchable-select" ref={containerRef}>
      <button
        className={`searchable-select-trigger ${open ? "open" : ""} ${selected ? "has-value" : ""}`}
        onClick={() => setOpen(!open)}
      >
        <span className="searchable-select-value">{displayLabel}</span>
        <span className="searchable-select-arrow">{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <div className="searchable-select-dropdown">
          <input
            ref={inputRef}
            className="searchable-select-input"
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={resolvedPlaceholder}
          />
          <div className="searchable-select-options">
            {filtered.length > 0 ? (
              filtered.map((opt) => (
                <button
                  key={opt.value}
                  className={`searchable-select-option ${selected === opt.value ? "selected" : ""}`}
                  onClick={() => handleSelect(opt.value)}
                >
                  <span>{opt.label}</span>
                  {selected === opt.value && (
                    <span className="select-check">✓</span>
                  )}
                </button>
              ))
            ) : (
              <div className="searchable-select-empty">
                {t("results.noMatch")}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default SearchableSelect;
