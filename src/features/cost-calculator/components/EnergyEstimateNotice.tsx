import type { EnergyEstimate } from "../../../infrastructure/energy/EnergyTariffRepository";
import styles from "./EnergyEstimateNotice.module.css";

interface EnergyEstimateNoticeProps {
  estimate: EnergyEstimate | null;
  isManual: boolean;
}

export function EnergyEstimateNotice({
  estimate,
  isManual,
}: EnergyEstimateNoticeProps) {
  if (isManual) {
    return (
      <p className={styles.notice}>
        Valor editado por você. A estimativa automática não substituirá este
        preço.
      </p>
    );
  }

  if (!estimate) {
    return (
      <p className={styles.notice}>
        Estimativa indisponível. Informe o valor da sua conta de energia.
      </p>
    );
  }

  return (
    <p className={styles.notice}>
      Estimativa ANEEL para B1 residencial convencional,{" "}
      {estimate.referencePeriod.start} a {estimate.referencePeriod.end}. É uma
      aproximação; você pode editar o valor para uso comercial ou para refletir
      sua conta.
    </p>
  );
}
