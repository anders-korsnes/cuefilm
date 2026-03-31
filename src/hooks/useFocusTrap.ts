import { useEffect, useRef } from "react";

export function useFocusTrap<T extends HTMLElement>() {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const focusable = () =>
      el.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), textarea, input:not([disabled]), select, [tabindex]:not([tabindex="-1"])',
      );

    const previouslyFocused = document.activeElement as HTMLElement | null;

    const first = focusable()[0];
    first?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;

      const items = focusable();
      if (items.length === 0) return;

      const firstItem = items[0];
      const lastItem = items[items.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === firstItem) {
          e.preventDefault();
          lastItem.focus();
        }
      } else {
        if (document.activeElement === lastItem) {
          e.preventDefault();
          firstItem.focus();
        }
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        el.dispatchEvent(new CustomEvent("dialog-close", { bubbles: true }));
      }
    };

    el.addEventListener("keydown", handleKeyDown);
    el.addEventListener("keydown", handleEscape);

    return () => {
      el.removeEventListener("keydown", handleKeyDown);
      el.removeEventListener("keydown", handleEscape);
      previouslyFocused?.focus();
    };
  }, []);

  return ref;
}
