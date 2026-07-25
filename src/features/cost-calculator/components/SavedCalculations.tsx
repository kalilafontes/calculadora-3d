import type { SavedCalculation } from "../../../infrastructure/storage/SavedCalculationRepository";
import styles from "./SavedCalculations.module.css";

interface SavedCalculationsProps {
  recent: SavedCalculation[];
  onOpen: (calculation: SavedCalculation) => void;
  onDelete: (id: string) => void;
}

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
});

export function SavedCalculations({
  recent,
  onOpen,
  onDelete,
}: SavedCalculationsProps) {
  return (
    <section className={styles.card} aria-labelledby="recent-title">
      <div className={styles.heading}>
        <div>
          <span>Salvos localmente</span>
          <h2 id="recent-title">Recentes</h2>
        </div>
        <small>Somente neste navegador</small>
      </div>

      {recent.length === 0 ? (
        <p className={styles.empty}>
          Seus cálculos salvos aparecerão aqui para você continuar depois.
        </p>
      ) : (
        <ul className={styles.list}>
          {recent.map((calculation) => (
            <li key={calculation.id}>
              <button
                className={styles.open}
                type="button"
                onClick={() => onOpen(calculation)}
              >
                <strong>{calculation.title}</strong>
                <span>
                  {dateFormatter.format(new Date(calculation.updatedAt))}
                </span>
              </button>
              <button
                className={styles.delete}
                type="button"
                aria-label={`Excluir ${calculation.title}`}
                onClick={() => onDelete(calculation.id)}
              >
                Excluir
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
