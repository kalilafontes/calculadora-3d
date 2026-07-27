import type { CalculationResult } from "../../../domain/calculation/calculation.types";
import { formatCurrency } from "../../../shared/formatting/formatters";
import { AppIcon } from "../../../shared/ui/AppIcon";
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
  const percentageOfTotal = (value: number) =>
    result.totalCost > 0 ? (value / result.totalCost) * 100 : 0;

  return (
    <section aria-labelledby="cost-breakdown-title" className={styles.card}>
      <div className={styles.heading}>
        <span className={styles.eyebrow}><AppIcon name="chart" size={18} />Composição</span>
        <h2 id="cost-breakdown-title">Custo da impressão</h2>
      </div>
      <dl className={styles.list}>
        {rows.map((row) => (
          <div key={row.key} className={styles.row}>
            <div className={styles.rowLabel}>
              <dt>{row.label}</dt>
              <span>{percentageOfTotal(result[row.key]).toLocaleString("pt-BR", { maximumFractionDigits: 1 })}%</span>
            </div>
            <div className={styles.rowValue}>
              <dd>{formatCurrency(result[row.key])}</dd>
              <div
                className={styles.progressTrack}
                role="progressbar"
                aria-label={`${row.label}: ${percentageOfTotal(result[row.key]).toLocaleString("pt-BR", { maximumFractionDigits: 1 })}% do custo total`}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={percentageOfTotal(result[row.key])}
              >
                <span style={{ width: `${Math.min(100, percentageOfTotal(result[row.key]))}%` }} />
              </div>
            </div>
          </div>
        ))}
        <div className={styles.total}>
          <dt>Custo total da mesa</dt>
          <dd>{formatCurrency(result.totalCost)}</dd>
        </div>
      </dl>
    </section>
  );
}
