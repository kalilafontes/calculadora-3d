import type { PrinterCatalogItem } from "../../../infrastructure/printers/printerCatalog";
import styles from "./EnergyEstimateNotice.module.css";

interface PrinterPowerNoticeProps {
  printer: PrinterCatalogItem | null;
  isManual: boolean;
}

export function PrinterPowerNotice({
  printer,
  isManual,
}: PrinterPowerNoticeProps) {
  if (!printer) return null;

  return (
    <p className={styles.notice}>
      {isManual ? (
        "Potência editada por você. "
      ) : (
        <>
          Potência máxima oficial — estimativa conservadora. O consumo médio
          durante a impressão costuma ser menor.{" "}
        </>
      )}
      <a href={printer.source.url} target="_blank" rel="noreferrer">
        Ver fonte do fabricante
      </a>
      .
    </p>
  );
}
