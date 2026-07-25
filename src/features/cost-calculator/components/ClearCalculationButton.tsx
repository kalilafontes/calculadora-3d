import styles from "./ClearCalculationButton.module.css";

interface ClearCalculationButtonProps {
  onClear: () => void;
}

export function ClearCalculationButton({
  onClear,
}: ClearCalculationButtonProps) {
  return (
    <button className={styles.button} type="button" onClick={onClear}>
      Limpar cálculo
    </button>
  );
}
