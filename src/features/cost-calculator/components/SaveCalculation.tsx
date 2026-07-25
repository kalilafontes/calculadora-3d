import { useState } from "react";
import styles from "./SaveCalculation.module.css";

interface SaveCalculationProps {
  disabled: boolean;
  status: string | null;
  onSave: (title: string) => Promise<boolean>;
}

export function SaveCalculation({
  disabled,
  status,
  onSave,
}: SaveCalculationProps) {
  const [title, setTitle] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!title.trim()) return;
    setIsSaving(true);
    const saved = await onSave(title);
    if (saved) setTitle("");
    setIsSaving(false);
  }

  return (
    <section className={styles.card}>
      <h2>Salvar cálculo</h2>
      <p>Dê um nome para encontrar este orçamento nos recentes.</p>
      <form className={styles.form} onSubmit={handleSubmit}>
        <label htmlFor="calculation-title">Título</label>
        <div>
          <input
            id="calculation-title"
            value={title}
            maxLength={80}
            placeholder="Ex.: Suporte para monitor"
            onChange={(event) => setTitle(event.target.value)}
          />
          <button
            type="submit"
            disabled={disabled || isSaving || !title.trim()}
          >
            {isSaving ? "Salvando…" : "Salvar"}
          </button>
        </div>
      </form>
      {status ? (
        <p className={styles.status} role="status">
          {status}
        </p>
      ) : null}
    </section>
  );
}
