import { useState, useEffect } from "react";
import { useTranslation } from "../../hooks/useTranslation";

function Loader() {
  const { t } = useTranslation();
  const [messageIndex, setMessageIndex] = useState(0);
  const [dots, setDots] = useState("");

  const loadingMessages = [
    t("loader.scanning"),
    t("loader.analyzing"),
    t("loader.matching"),
    t("loader.finetuning"),
    t("loader.calculating"),
  ];

  useEffect(() => {
    const dotInterval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? "" : prev + "."));
    }, 400);

    const messageInterval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % loadingMessages.length);
    }, 2500);

    return () => {
      clearInterval(dotInterval);
      clearInterval(messageInterval);
    };
  }, []);

  return (
    <div className="loader-overlay">
      <div className="loader-content">
        <div className="loader-spinner">
          <div className="spinner-ring" />
          <div className="spinner-ring spinner-ring-2" />
          <div className="spinner-ring spinner-ring-3" />
          <span className="spinner-icon">🎬</span>
        </div>
        <div className="loader-text">
          <span className="loader-message">
            {loadingMessages[messageIndex]}
            {dots}
          </span>
        </div>
        <div className="loader-bar">
          <div className="loader-bar-fill" />
        </div>
      </div>
    </div>
  );
}

export default Loader;
