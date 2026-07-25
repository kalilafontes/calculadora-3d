import type { CalculationResult } from "../../../domain/calculation/calculation.types";
import { formatCurrency } from "../../../shared/formatting/formatters";
import styles from "./CostBreakdown.module.css";

interface CostBreakdownProps {
  result: CalculationResult;
}

const rows: Array<{
  key: keyof Pick<
    CalculationResult,
    | "filamentCost"
    | "energyCost"
    | "lossCost"
    | "packagingCost"
    | "laborCost"
    | "otherCosts"
  >;
  label: string;
}> = [
  { key: "filamentCost", label: "Filamento" },
  { key: "energyCost", label: "Energia" },
  { key: "lossCost", label: "Perdas" },
  { key: "packagingCost", label: "Embalagem" },
  { key: "laborCost", label: "Mão de obra" },
  { key: "otherCosts", label: "Outros custos" },
];

export function CostBreakdown({ result }: CostBreakdownProps) {
  return (
    <section aria-labelledby="cost-breakdown-title" className={styles.card}>
      <div className={styles.heading}>
        <span className={styles.eyebrow}>Composição</span>
        <h2 id="cost-breakdown-title">Custo da peça</h2>
      </div>
      <dl className={styles.list}>
        {rows.map((row) => (
          <div key={row.key} className={styles.row}>
            <dt>{row.label}</dt>
            <dd>{formatCurrency(result[row.key])}</dd>
          </div>
        ))}
        <div className={styles.total}>
          <dt>Custo total</dt>
          <dd>{formatCurrency(result.totalCost)}</dd>
        </div>
      </dl>
    </section>
  );
}
