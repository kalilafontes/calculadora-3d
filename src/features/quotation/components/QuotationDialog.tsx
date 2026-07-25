import { useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import type { CalculationResult } from "../../../domain/calculation/calculation.types";
import {
  quotationFormSchema,
  type ParsedQuotationFormValues,
  type QuotationFormValues,
} from "../../../domain/quotation/quotation.schema";
import { downloadQuotationPdf } from "../../../infrastructure/pdf/generateQuotationPdf";
import { LocalStorageSellerProfileRepository } from "../../../infrastructure/storage/LocalStorageSellerProfileRepository";
import { formatCurrency } from "../../../shared/formatting/formatters";
import styles from "./QuotationDialog.module.css";

interface QuotationDialogProps {
  result: CalculationResult;
  onClose: () => void;
}

const readImage = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () =>
      typeof reader.result === "string"
        ? resolve(reader.result)
        : reject(new Error("Imagem inválida."));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });

export function QuotationDialog({ result, onClose }: QuotationDialogProps) {
  const sellerRepository = useMemo(
    () => new LocalStorageSellerProfileRepository(),
    [],
  );
  const savedSeller = sellerRepository.load();
  const [logoDataUrl, setLogoDataUrl] = useState<string>();
  const [productImageDataUrl, setProductImageDataUrl] = useState<string>();
  const [formError, setFormError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<QuotationFormValues, unknown, ParsedQuotationFormValues>({
    resolver: zodResolver(quotationFormSchema),
    defaultValues: {
      sellerName: savedSeller?.name ?? "",
      sellerEmail: savedSeller?.email ?? "",
      sellerPhone: savedSeller?.phone ?? "",
      sellerDocument: savedSeller?.document ?? "",
      clientName: "",
      clientContact: "",
      projectTitle: "",
      quantity: result.piecesPerPrint,
      validityDays: 7,
      productionLeadTime: 7,
      productionLeadTimeUnit: "business-days",
      paymentMethods: ["pix"],
      pixKey: "",
      upfrontPercentage: 50,
      includeCareInstructions: true,
      notes: "",
    },
  });
  const quantity = Number(useWatch({ control, name: "quantity" })) || 0;
  const paymentMethods = useWatch({ control, name: "paymentMethods" }) ?? [];
  const upfrontPercentage =
    Number(useWatch({ control, name: "upfrontPercentage" })) || 0;
  const total = result.unitSuggestedPrice * quantity;
  const upfrontAmount = total * (upfrontPercentage / 100);

  const submit = handleSubmit(async (values) => {
    const seller = {
      name: values.sellerName,
      email: values.sellerEmail,
      phone: values.sellerPhone,
      document: values.sellerDocument,
    };
    setIsGenerating(true);
    try {
      sellerRepository.save(seller);
      await downloadQuotationPdf({
        seller,
        clientName: values.clientName,
        clientContact: values.clientContact,
        projectTitle: values.projectTitle,
        quantity: values.quantity,
        unitPrice: result.unitSuggestedPrice,
        validityDays: values.validityDays,
        productionLeadTime: values.productionLeadTime,
        productionLeadTimeUnit: values.productionLeadTimeUnit,
        paymentMethods: values.paymentMethods,
        pixKey: values.pixKey,
        upfrontPercentage: values.upfrontPercentage,
        includeCareInstructions: values.includeCareInstructions,
        notes: values.notes,
        logoDataUrl,
        productImageDataUrl,
        issuedAt: new Date(),
      });
      setFormError(null);
    } catch {
      setFormError("Não foi possível gerar o PDF. Tente novamente.");
    } finally {
      setIsGenerating(false);
    }
  });

  return (
    <div className={styles.backdrop} onMouseDown={onClose}>
      <section
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby="quotation-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className={styles.header}>
          <div>
            <span>Documento profissional</span>
            <h2 id="quotation-title">Gerar orçamento em PDF</h2>
            <p>Os dados são processados somente neste navegador.</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Fechar orçamento">
            ×
          </button>
        </header>

        <form className={styles.form} onSubmit={(event) => void submit(event)}>
          <fieldset>
            <legend>Seus dados</legend>
            <div className={styles.grid}>
              <label>
                Nome ou empresa
                <input {...register("sellerName")} autoFocus />
                {errors.sellerName ? (
                  <small>{errors.sellerName.message}</small>
                ) : null}
              </label>
              <label>
                CPF ou CNPJ (opcional)
                <input {...register("sellerDocument")} />
              </label>
              <label>
                Telefone (opcional)
                <input {...register("sellerPhone")} inputMode="tel" />
              </label>
              <label>
                E-mail (opcional)
                <input {...register("sellerEmail")} inputMode="email" />
              </label>
              <label className={styles.full}>
                Logotipo (PNG ou JPG, opcional)
                <input
                  type="file"
                  accept="image/png,image/jpeg"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (!file) {
                      setLogoDataUrl(undefined);
                      return;
                    }
                    if (file.size > 2_000_000) {
                      setFormError("O logotipo deve ter no máximo 2 MB.");
                      event.target.value = "";
                      return;
                    }
                    void readImage(file)
                      .then(setLogoDataUrl)
                      .catch(() =>
                        setFormError("Não foi possível ler o logotipo."),
                      );
                  }}
                />
              </label>
            </div>
          </fieldset>

          <fieldset>
            <legend>Cliente e projeto</legend>
            <div className={styles.grid}>
              <label>
                Nome do cliente
                <input {...register("clientName")} />
                {errors.clientName ? (
                  <small>{errors.clientName.message}</small>
                ) : null}
              </label>
              <label>
                Telefone ou e-mail do cliente (opcional)
                <input
                  {...register("clientContact")}
                  placeholder="Ex.: (71) 99999-9999 ou cliente@email.com"
                />
              </label>
              <label className={styles.full}>
                Descrição da peça ou projeto
                <input
                  {...register("projectTitle")}
                  placeholder="Ex.: 20 suportes personalizados"
                />
                {errors.projectTitle ? (
                  <small>{errors.projectTitle.message}</small>
                ) : null}
              </label>
              <label className={styles.full}>
                Imagem da peça (PNG ou JPG, opcional)
                <input
                  type="file"
                  accept="image/png,image/jpeg"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (!file) {
                      setProductImageDataUrl(undefined);
                      return;
                    }
                    if (file.size > 2_000_000) {
                      setFormError("A imagem da peça deve ter no máximo 2 MB.");
                      event.target.value = "";
                      return;
                    }
                    void readImage(file)
                      .then(setProductImageDataUrl)
                      .catch(() =>
                        setFormError("Não foi possível ler a imagem da peça."),
                      );
                  }}
                />
                <small className={styles.fileHint}>
                  Aparece ao lado do item e não é armazenada.
                </small>
              </label>
              <label>
                Quantidade
                <input
                  type="number"
                  min="1"
                  max="10000"
                  {...register("quantity")}
                />
              </label>
              <label>
                Validade da proposta (dias)
                <input
                  type="number"
                  min="1"
                  max="365"
                  {...register("validityDays")}
                />
              </label>
              <label>
                Prazo de produção
                <input
                  type="number"
                  min="1"
                  max="365"
                  {...register("productionLeadTime")}
                />
                {errors.productionLeadTime ? (
                  <small>{errors.productionLeadTime.message}</small>
                ) : null}
              </label>
              <label>
                Contagem do prazo
                <select {...register("productionLeadTimeUnit")}>
                  <option value="business-days">Dias úteis</option>
                  <option value="calendar-days">Dias corridos</option>
                </select>
              </label>
            </div>
          </fieldset>

          <fieldset>
            <legend>Pagamento</legend>
            <div className={styles.paymentMethods}>
              <label>
                <input
                  type="checkbox"
                  value="pix"
                  {...register("paymentMethods")}
                />
                Pix
              </label>
              <label>
                <input
                  type="checkbox"
                  value="cash"
                  {...register("paymentMethods")}
                />
                Dinheiro
              </label>
              <label>
                <input
                  type="checkbox"
                  value="credit-card"
                  {...register("paymentMethods")}
                />
                Cartão de crédito
              </label>
              <label>
                <input
                  type="checkbox"
                  value="debit-card"
                  {...register("paymentMethods")}
                />
                Cartão de débito
              </label>
              <label>
                <input
                  type="checkbox"
                  value="bank-transfer"
                  {...register("paymentMethods")}
                />
                Transferência
              </label>
            </div>
            {errors.paymentMethods ? (
              <small className={styles.fieldError}>
                {errors.paymentMethods.message}
              </small>
            ) : null}
            <div className={styles.grid}>
              {paymentMethods.includes("pix") ? (
                <label>
                  Chave Pix
                  <input
                    {...register("pixKey")}
                    placeholder="CPF, CNPJ, e-mail, telefone ou chave aleatória"
                  />
                  {errors.pixKey ? (
                    <small>{errors.pixKey.message}</small>
                  ) : null}
                </label>
              ) : null}
              <label>
                Percentual de entrada
                <div className={styles.inputWithUnit}>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="1"
                    {...register("upfrontPercentage")}
                  />
                  <span>%</span>
                </div>
                {errors.upfrontPercentage ? (
                  <small>{errors.upfrontPercentage.message}</small>
                ) : null}
              </label>
            </div>
            <p className={styles.paymentPreview}>
              {upfrontPercentage > 0
                ? `${formatCurrency(upfrontAmount)} na aprovação e ${formatCurrency(total - upfrontAmount)} na entrega.`
                : "Pagamento integral na entrega."}
            </p>
          </fieldset>

          <fieldset>
            <legend>Cuidados com a peça</legend>
            <label className={styles.careOption}>
              <input type="checkbox" {...register("includeCareInstructions")} />
              <span>
                <strong>Incluir orientações padrão no orçamento</strong>
                <small>
                  Evitar calor e sol prolongado, limpar sem solventes e não usar
                  em micro-ondas ou lava-louças sem orientação específica.
                </small>
              </span>
            </label>
            <div className={styles.grid}>
              <label className={styles.full}>
                Observações adicionais (opcional)
                <textarea
                  {...register("notes")}
                  rows={3}
                  placeholder="Ex.: detalhes de acabamento, entrega ou condições específicas."
                />
              </label>
            </div>
          </fieldset>

          <div className={styles.summary}>
            <div>
              <span>Preço por peça</span>
              <strong>{formatCurrency(result.unitSuggestedPrice)}</strong>
            </div>
            <div>
              <span>Total para {quantity || 0} peça(s)</span>
              <strong>{formatCurrency(total)}</strong>
            </div>
          </div>

          {formError ? (
            <p className={styles.error} role="alert">
              {formError}
            </p>
          ) : null}

          <footer className={styles.actions}>
            <button
              type="button"
              className={styles.secondary}
              onClick={onClose}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className={styles.primary}
              disabled={isGenerating}
            >
              {isGenerating ? "Gerando PDF…" : "Baixar orçamento em PDF"}
            </button>
          </footer>
        </form>
      </section>
    </div>
  );
}
