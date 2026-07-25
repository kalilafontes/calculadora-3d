import type { CalculationResult } from "../../../domain/calculation/calculation.types";
import { formatCurrency } from "../../../shared/formatting/formatters";
import styles from "./PricingSummary.module.css";

interface PricingSummaryProps {
  result: CalculationResult;
}

export function PricingSummary({ result }: PricingSummaryProps) {
  return (
    <section aria-labelledby="pricing-title" className={styles.card}>
      <p className={styles.label}>Preço sugerido</p>
      <h2 id="pricing-title" className={styles.price}>
        {formatCurrency(result.suggestedPrice)}
      </h2>
      <div className={styles.profit}>
        <span>Lucro por peça</span>
        <strong>{formatCurrency(result.profit)}</strong>
      </div>
      <p className={styles.note}>
        A margem é calculada sobre o preço de venda, não como acréscimo sobre o
        custo.
      </p>
    </section>
  );
}
