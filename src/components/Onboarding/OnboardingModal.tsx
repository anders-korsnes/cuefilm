import { useState, useEffect, useRef } from "react";
import { useTranslation } from "../../hooks/useTranslation";

const STORAGE_KEY = "cuefilm-onboarding-done";

function OnboardingModal() {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(
    () => !localStorage.getItem(STORAGE_KEY),
  );
  const [step, setStep] = useState(0);
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (visible) dialogRef.current?.showModal();
  }, [visible]);

  const finish = () => {
    localStorage.setItem(STORAGE_KEY, "1");
    dialogRef.current?.close();
    setVisible(false);
  };

  if (!visible) return null;

  const steps = [
    {
      icon: "🎬",
      title: t("onboarding.step1Title"),
      body: t("onboarding.step1Body"),
    },
    {
      icon: "🎯",
      title: t("onboarding.step2Title"),
      body: t("onboarding.step2Body"),
    },
    {
      icon: "🍿",
      title: t("onboarding.step3Title"),
      body: t("onboarding.step3Body"),
    },
  ];

  const current = steps[step];

  return (
    <dialog ref={dialogRef} className="onboarding-dialog" onCancel={finish}>
      <div className="onboarding-content">
        <div className="onboarding-icon">{current.icon}</div>
        <h2 className="onboarding-title">{current.title}</h2>
        <p className="onboarding-body">{current.body}</p>

        <div className="onboarding-dots">
          {steps.map((_, i) => (
            <span
              key={i}
              className={`onboarding-dot${i === step ? " onboarding-dot--active" : ""}`}
            />
          ))}
        </div>

        <div className="onboarding-actions">
          {step > 0 && (
            <button
              className="onboarding-btn onboarding-btn--secondary"
              onClick={() => setStep(step - 1)}
            >
              {t("onboarding.back")}
            </button>
          )}
          {step < steps.length - 1 ? (
            <button
              className="onboarding-btn onboarding-btn--primary"
              onClick={() => setStep(step + 1)}
            >
              {t("onboarding.next")}
            </button>
          ) : (
            <button
              className="onboarding-btn onboarding-btn--primary"
              onClick={finish}
            >
              {t("onboarding.start")}
            </button>
          )}
        </div>

        <button className="onboarding-skip" onClick={finish}>
          {t("onboarding.skip")}
        </button>
      </div>
    </dialog>
  );
}

export default OnboardingModal;
