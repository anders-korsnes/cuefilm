import { useTranslation } from "../../hooks/useTranslation";
import { Link } from "react-router";

function PrivacyPolicy() {
  const { t } = useTranslation();

  return (
    <div className="privacy-page">
      <div className="privacy-container">
        <Link to="/" className="privacy-back">{t("privacy.back")}</Link>

        <h1 className="privacy-title">{t("privacy.title")}</h1>
        <p className="privacy-updated">{t("privacy.lastUpdated")}</p>

        <section className="privacy-section">
          <h2>{t("privacy.introTitle")}</h2>
          <p>{t("privacy.introText")}</p>
        </section>

        <section className="privacy-section">
          <h2>{t("privacy.dataTitle")}</h2>
          <p>{t("privacy.dataIntro")}</p>
          <ul className="privacy-list">
            <li>{t("privacy.dataAuth")}</li>
            <li>{t("privacy.dataLibrary")}</li>
            <li>{t("privacy.dataHistory")}</li>
            <li>{t("privacy.dataSettings")}</li>
          </ul>
        </section>

        <section className="privacy-section">
          <h2>{t("privacy.purposeTitle")}</h2>
          <ul className="privacy-list">
            <li>{t("privacy.purposeRecommendations")}</li>
            <li>{t("privacy.purposePersonalization")}</li>
            <li>{t("privacy.purposeSync")}</li>
          </ul>
        </section>

        <section className="privacy-section">
          <h2>{t("privacy.thirdPartyTitle")}</h2>
          <ul className="privacy-list">
            <li><strong>Clerk</strong> — {t("privacy.thirdPartyClerk")}</li>
            <li><strong>TMDB</strong> — {t("privacy.thirdPartyTmdb")}</li>
            <li><strong>OpenRouter</strong> — {t("privacy.thirdPartyOpenRouter")}</li>
            <li><strong>MongoDB Atlas</strong> — {t("privacy.thirdPartyMongo")}</li>
          </ul>
        </section>

        <section className="privacy-section">
          <h2>{t("privacy.cookiesTitle")}</h2>
          <p>{t("privacy.cookiesText")}</p>
        </section>

        <section className="privacy-section">
          <h2>{t("privacy.rightsTitle")}</h2>
          <p>{t("privacy.rightsIntro")}</p>
          <ul className="privacy-list">
            <li>{t("privacy.rightsAccess")}</li>
            <li>{t("privacy.rightsDelete")}</li>
            <li>{t("privacy.rightsExport")}</li>
            <li>{t("privacy.rightsWithdraw")}</li>
          </ul>
          <p>{t("privacy.rightsHow")}</p>
        </section>

        <section className="privacy-section">
          <h2>{t("privacy.contactTitle")}</h2>
          <p>{t("privacy.contactText")}</p>
        </section>
      </div>
    </div>
  );
}

export default PrivacyPolicy;
