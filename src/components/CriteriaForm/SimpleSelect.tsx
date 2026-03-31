import { useState, useRef, useEffect } from "react";

type Option = {
  value: string;
  label: string;
};

type SimpleSelectProps = {
  options: Option[];
  selected: string;
  onSelect: (value: string) => void;
  emptyLabel?: string;
};

function SimpleSelect({
  options,
  selected,
  onSelect,
  emptyLabel = "Velg...",
}: SimpleSelectProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === selected);
  const displayLabel = selectedOption?.label || emptyLabel;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (value: string) => {
    onSelect(value);
    setOpen(false);
  };

  return (
    <div className="simple-select" ref={containerRef}>
      <button
        className={`simple-select-trigger ${open ? "open" : ""} ${selected ? "has-value" : ""}`}
        onClick={() => setOpen(!open)}
      >
        <span className="simple-select-value">{displayLabel}</span>
        <span className="simple-select-arrow">{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <div className="simple-select-dropdown">
          {options.map((opt) => (
            <button
              key={opt.value}
              className={`simple-select-option ${selected === opt.value ? "selected" : ""}`}
              onClick={() => handleSelect(opt.value)}
            >
              <span>{opt.label}</span>
              {selected === opt.value && (
                <span className="select-check">✓</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default SimpleSelect;
