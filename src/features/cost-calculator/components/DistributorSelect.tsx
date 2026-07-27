import type { Distributor } from "../../../infrastructure/energy/EnergyTariffRepository";
import { formatDistributorName } from "./formatDistributorName";
import styles from "./StateSelect.module.css";

interface DistributorSelectProps {
  distributors: Distributor[];
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  className?: string;
}

export function DistributorSelect({
  distributors,
  value,
  onChange,
  disabled,
  className,
}: DistributorSelectProps) {
  return (
    <label className={`${styles.field} ${className ?? ""}`}>
      <span className={styles.label}>Distribuidora (opcional)</span>
      <select
        className={styles.select}
        aria-label="Distribuidora (opcional)"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
      >
        <option value="">Não sei — usar média do estado</option>
        {distributors.map((distributor) => (
          <option
            key={distributor.id}
            value={distributor.id}
            title={distributor.name}
          >
            {formatDistributorName(distributor.name)}
          </option>
        ))}
      </select>
    </label>
  );
}
