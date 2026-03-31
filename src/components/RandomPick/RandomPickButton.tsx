import { useTranslation } from "../../hooks/useTranslation";

type RandomPickButtonProps = {
  onClick: () => void;
  loading: boolean;
};

function RandomPickButton({ onClick, loading }: RandomPickButtonProps) {
  const { t } = useTranslation();
  return (
    <button className="random-pick-button" onClick={onClick} disabled={loading}>
      {loading ? t("random.loading") : t("random.button")}
    </button>
  );
}

export default RandomPickButton;
