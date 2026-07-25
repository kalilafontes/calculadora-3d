import styles from "./QuotationAction.module.css";

interface QuotationActionProps {
  onClick: () => void;
}

export function QuotationAction({ onClick }: QuotationActionProps) {
  return (
    <section className={styles.card}>
      <span>Pronto para enviar</span>
      <h2>Transforme o cálculo em orçamento</h2>
      <p>
        Gere um PDF profissional com seus dados, cliente, quantidade e validade.
      </p>
      <button type="button" onClick={onClick}>
        Gerar orçamento em PDF
      </button>
    </section>
  );
}
