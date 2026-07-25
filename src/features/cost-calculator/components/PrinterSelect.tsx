import {
  printerCatalog,
  type PrinterVoltage,
} from "../../../infrastructure/printers/printerCatalog";
import styles from "./PrinterSelect.module.css";

interface PrinterSelectProps {
  printerModelId: string;
  voltage: PrinterVoltage;
  onPrinterChange: (printerModelId: string) => void;
  onVoltageChange: (voltage: PrinterVoltage) => void;
}

export function PrinterSelect({
  printerModelId,
  voltage,
  onPrinterChange,
  onVoltageChange,
}: PrinterSelectProps) {
  return (
    <>
      <label className={styles.field}>
        <span>Impressora</span>
        <select
          aria-label="Impressora"
          value={printerModelId}
          onChange={(event) => onPrinterChange(event.target.value)}
        >
          <option value="">Outra — informar potência manualmente</option>
          {printerCatalog.map((printer) => (
            <option key={printer.id} value={printer.id}>
              {printer.manufacturer} {printer.model}
            </option>
          ))}
        </select>
      </label>

      <label className={styles.field}>
        <span>Tensão da impressora</span>
        <select
          aria-label="Tensão da impressora"
          value={voltage}
          disabled={!printerModelId}
          onChange={(event) =>
            onVoltageChange(Number(event.target.value) as PrinterVoltage)
          }
        >
          <option value={127}>127 V</option>
          <option value={220}>220 V</option>
        </select>
      </label>
    </>
  );
}
