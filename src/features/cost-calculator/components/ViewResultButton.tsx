import styles from "./ViewResultButton.module.css";

interface ViewResultButtonProps {
  onClick: () => void;
}

export function ViewResultButton({ onClick }: ViewResultButtonProps) {
  return (
    <button className={styles.button} type="button" onClick={onClick}>
      Ver resultado
    </button>
  );
}
