import type { UseFormRegisterReturn } from "react-hook-form";
import styles from "./NumberField.module.css";

interface NumberFieldProps {
  id: string;
  label: string;
  unit?: string;
  helpText?: string;
  error?: string;
  registration: UseFormRegisterReturn;
  className?: string;
}

export function NumberField({
  id,
  label,
  unit,
  helpText,
  error,
  registration,
  className,
}: NumberFieldProps) {
  const helpId = helpText ? `${id}-help` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [helpId, errorId].filter(Boolean).join(" ") || undefined;

  return (
    <div className={`${styles.field} ${className ?? ""}`}>
      <label htmlFor={id} className={styles.label}>
        {label}
      </label>
      <div className={styles.control}>
        <input
          id={id}
          type="text"
          inputMode="decimal"
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy}
          className={styles.input}
          {...registration}
        />
        {unit ? <span className={styles.unit}>{unit}</span> : null}
      </div>
      {helpText ? (
        <span id={helpId} className={styles.help}>
          {helpText}
        </span>
      ) : null}
      {error ? (
        <span id={errorId} className={styles.error} role="alert">
          {error}
        </span>
      ) : null}
    </div>
  );
}
