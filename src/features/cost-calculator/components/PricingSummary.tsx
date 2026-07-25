import type { CalculationResult } from "../../../domain/calculation/calculation.types";
import { formatCurrency } from "../../../shared/formatting/formatters";
import styles from "./PricingSummary.module.css";

interface PricingSummaryProps {
  result: CalculationResult;
}

export function PricingSummary({ result }: PricingSummaryProps) {
  return (
    <section aria-labelledby="pricing-title" className={styles.card}>
      <p className={styles.label}>Preço da impressão completa</p>
      <h2 id="pricing-title" className={styles.price}>
        {formatCurrency(result.suggestedPrice)}
      </h2>
      <div className={styles.profit}>
        <span>Lucro da impressão</span>
        <strong>{formatCurrency(result.profit)}</strong>
      </div>
      <div className={styles.unitValues}>
        <div>
          <span>Preço por peça</span>
          <strong>{formatCurrency(result.unitSuggestedPrice)}</strong>
        </div>
        <div>
          <span>Custo por peça</span>
          <strong>{formatCurrency(result.unitTotalCost)}</strong>
        </div>
        <small>{result.piecesPerPrint} peça(s) por impressão</small>
      </div>
      <p className={styles.note}>
        A margem é calculada sobre o preço de venda, não como acréscimo sobre o
        custo.
      </p>
    </section>
  );
}
