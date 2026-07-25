import type { jsPDF as JsPdfDocument } from "jspdf";
import type {
  PaymentMethod,
  QuotationData,
} from "../../domain/quotation/quotation.types";

const COLORS = {
  primary: [190, 24, 93] as const,
  primarySoft: [252, 231, 243] as const,
  text: [43, 23, 34] as const,
  muted: [115, 87, 101] as const,
  border: [234, 213, 223] as const,
  white: [255, 255, 255] as const,
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);

const formatDate = (date: Date) =>
  new Intl.DateTimeFormat("pt-BR").format(date);

const addDays = (date: Date, days: number) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

const createQuotationNumber = (date: Date) => {
  const parts = [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
    String(date.getHours()).padStart(2, "0"),
    String(date.getMinutes()).padStart(2, "0"),
  ];
  return `ORC-${parts.join("")}`;
};

const PAYMENT_LABELS: Record<PaymentMethod, string> = {
  pix: "Pix",
  cash: "dinheiro",
  "credit-card": "cartão de crédito",
  "debit-card": "cartão de débito",
  "bank-transfer": "transferência bancária",
};

const addContainedImage = (
  pdf: JsPdfDocument,
  dataUrl: string,
  x: number,
  y: number,
  maxWidth: number,
  maxHeight: number,
) => {
  const format = dataUrl.startsWith("data:image/png") ? "PNG" : "JPEG";
  const properties = pdf.getImageProperties(dataUrl);
  const scale = Math.min(
    maxWidth / properties.width,
    maxHeight / properties.height,
  );
  const width = properties.width * scale;
  const height = properties.height * scale;
  pdf.addImage(
    dataUrl,
    format,
    x + (maxWidth - width) / 2,
    y + (maxHeight - height) / 2,
    width,
    height,
    undefined,
    "FAST",
  );
};

export async function generateQuotationPdf(
  data: QuotationData,
): Promise<JsPdfDocument> {
  const { jsPDF } = await import("jspdf");
  const pdf = new jsPDF({ unit: "mm", format: "a4" });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 18;
  const contentWidth = pageWidth - margin * 2;
  const totalPrice = data.unitPrice * data.quantity;
  const validUntil = addDays(data.issuedAt, data.validityDays);

  pdf.setFillColor(...COLORS.white);
  pdf.rect(0, 0, pageWidth, pageHeight, "F");
  pdf.setFillColor(...COLORS.primary);
  pdf.rect(0, 0, pageWidth, 42, "F");

  if (data.logoDataUrl) {
    const format = data.logoDataUrl.startsWith("data:image/png")
      ? "PNG"
      : "JPEG";
    try {
      pdf.addImage(
        data.logoDataUrl,
        format,
        margin,
        10,
        24,
        20,
        undefined,
        "FAST",
      );
    } catch {
      // Um logo incompatível não deve impedir a geração do orçamento.
    }
  }

  const sellerStart = data.logoDataUrl ? margin + 30 : margin;
  pdf.setTextColor(...COLORS.white);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(16);
  pdf.text(data.seller.name, sellerStart, 17);
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(8.5);
  const sellerContacts = [
    data.seller.document,
    data.seller.phone,
    data.seller.email,
  ].filter(Boolean);
  pdf.text(sellerContacts.join("  |  "), sellerStart, 23, {
    maxWidth: pageWidth - sellerStart - margin,
  });

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(20);
  pdf.text("ORÇAMENTO", pageWidth - margin, 34, { align: "right" });

  let y = 54;
  pdf.setTextColor(...COLORS.text);
  pdf.setFontSize(8);
  pdf.setFont("helvetica", "bold");
  pdf.text("NÚMERO", margin, y);
  pdf.text("EMISSÃO", margin + 63, y);
  pdf.text("VÁLIDO ATÉ", margin + 111, y);
  pdf.setFont("helvetica", "normal");
  pdf.setTextColor(...COLORS.muted);
  pdf.setFontSize(10);
  pdf.text(createQuotationNumber(data.issuedAt), margin, y + 6);
  pdf.text(formatDate(data.issuedAt), margin + 63, y + 6);
  pdf.text(formatDate(validUntil), margin + 111, y + 6);

  y += 18;
  pdf.setFillColor(...COLORS.primarySoft);
  pdf.roundedRect(margin, y, contentWidth, 28, 3, 3, "F");
  pdf.setTextColor(...COLORS.primary);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(8);
  pdf.text("CLIENTE", margin + 6, y + 8);
  pdf.setTextColor(...COLORS.text);
  pdf.setFontSize(12);
  pdf.text(data.clientName, margin + 6, y + 16);
  if (data.clientContact) {
    pdf.setTextColor(...COLORS.muted);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(9);
    pdf.text(data.clientContact, margin + 6, y + 22);
  }

  y += 39;
  pdf.setTextColor(...COLORS.primary);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(8);
  pdf.text("PROJETO", margin, y);
  pdf.setTextColor(...COLORS.text);
  pdf.setFontSize(13);
  const projectLines = pdf.splitTextToSize(data.projectTitle, contentWidth);
  pdf.text(projectLines, margin, y + 7);
  y += 13 + projectLines.length * 5;

  const tableHeaderHeight = 10;
  const tableRowHeight = data.productImageDataUrl ? 28 : 18;
  pdf.setFillColor(...COLORS.primary);
  pdf.roundedRect(
    margin,
    y,
    contentWidth,
    tableHeaderHeight + tableRowHeight,
    2,
    2,
    "F",
  );
  pdf.setFillColor(...COLORS.white);
  pdf.rect(margin, y + tableHeaderHeight, contentWidth, tableRowHeight, "F");
  pdf.setTextColor(...COLORS.white);
  pdf.setFontSize(8);
  pdf.setFont("helvetica", "bold");
  pdf.text("ITEM", margin + 5, y + 6.5);
  pdf.text("QTD.", margin + 91, y + 6.5, { align: "right" });
  pdf.text("VALOR UNIT.", margin + 125, y + 6.5, { align: "right" });
  pdf.text("TOTAL", pageWidth - margin - 5, y + 6.5, { align: "right" });

  pdf.setTextColor(...COLORS.text);
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(9);
  let itemTextX = margin + 5;
  let itemTextWidth = 72;
  if (data.productImageDataUrl) {
    pdf.setFillColor(...COLORS.primarySoft);
    pdf.roundedRect(margin + 4, y + 12, 25, 22, 1.5, 1.5, "F");
    try {
      addContainedImage(
        pdf,
        data.productImageDataUrl,
        margin + 5,
        y + 13,
        23,
        20,
      );
    } catch {
      // Uma imagem incompatível não deve impedir a geração do orçamento.
    }
    itemTextX = margin + 33;
    itemTextWidth = 44;
  }
  const itemLines = pdf.splitTextToSize(data.projectTitle, itemTextWidth);
  pdf.text(itemLines.slice(0, 3), itemTextX, y + 17);
  pdf.text(String(data.quantity), margin + 91, y + 17, { align: "right" });
  pdf.text(formatCurrency(data.unitPrice), margin + 125, y + 17, {
    align: "right",
  });
  pdf.setFont("helvetica", "bold");
  pdf.text(formatCurrency(totalPrice), pageWidth - margin - 5, y + 17, {
    align: "right",
  });

  y += tableHeaderHeight + tableRowHeight + 10;
  pdf.setDrawColor(...COLORS.border);
  pdf.line(margin, y, pageWidth - margin, y);
  y += 10;
  pdf.setTextColor(...COLORS.muted);
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(9);
  pdf.text("Valor total do orçamento", margin, y);
  pdf.setTextColor(...COLORS.primary);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(19);
  pdf.text(formatCurrency(totalPrice), pageWidth - margin, y + 1, {
    align: "right",
  });

  y += 20;
  pdf.setTextColor(...COLORS.text);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(10);
  pdf.text("Condições", margin, y);
  pdf.setFont("helvetica", "normal");
  pdf.setTextColor(...COLORS.muted);
  pdf.setFontSize(9);
  const leadTimeLabel =
    data.productionLeadTimeUnit === "business-days"
      ? "dias úteis"
      : "dias corridos";
  const conditions = [
    `Validade: ${data.validityDays} ${data.validityDays === 1 ? "dia" : "dias"}, até ${formatDate(validUntil)}.`,
    `Produção: ${data.productionLeadTime} ${leadTimeLabel} após aprovação${data.upfrontPercentage > 0 ? " e confirmação da entrada" : ""}.`,
    `Pagamento: ${data.paymentMethods.map((method) => PAYMENT_LABELS[method]).join(", ")}.`,
  ];
  if (data.paymentMethods.includes("pix")) {
    conditions.push(`Chave Pix: ${data.pixKey}.`);
  }
  const upfrontAmount = totalPrice * (data.upfrontPercentage / 100);
  if (data.upfrontPercentage === 0) {
    conditions.push("Pagamento integral na entrega.");
  } else if (data.upfrontPercentage === 100) {
    conditions.push(
      `Pagamento integral na aprovação: ${formatCurrency(totalPrice)}.`,
    );
  } else {
    conditions.push(
      `Entrada de ${data.upfrontPercentage}% (${formatCurrency(upfrontAmount)}) na aprovação e saldo de ${formatCurrency(totalPrice - upfrontAmount)} na entrega.`,
    );
  }
  const conditionLines = conditions.flatMap((condition) =>
    pdf.splitTextToSize(condition, contentWidth),
  );
  pdf.text(conditionLines, margin, y + 7);
  y += 9 + conditionLines.length * 4.2;

  if (data.includeCareInstructions) {
    pdf.setTextColor(...COLORS.text);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(10);
    pdf.text("Cuidados com a peça", margin, y);
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(...COLORS.muted);
    pdf.setFontSize(8.5);
    const careInstructions = [
      "- Evite exposição prolongada ao sol, calor intenso ou ambientes muito quentes.",
      "- Limpe com pano macio e úmido; não use solventes ou produtos abrasivos.",
      "- Não use em micro-ondas ou lava-louças sem orientação específica do vendedor.",
    ];
    const careLines = careInstructions.flatMap((instruction) =>
      pdf.splitTextToSize(instruction, contentWidth),
    );
    pdf.text(careLines, margin, y + 7);
    y += 9 + careLines.length * 4.1;
  }

  if (data.notes) {
    pdf.setTextColor(...COLORS.text);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(10);
    pdf.text("Observações", margin, y);
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(...COLORS.muted);
    pdf.setFontSize(9);
    const noteLines = pdf.splitTextToSize(data.notes, contentWidth);
    pdf.text(noteLines.slice(0, 8), margin, y + 7);
  }

  pdf.setDrawColor(...COLORS.border);
  pdf.line(margin, pageHeight - 23, pageWidth - margin, pageHeight - 23);
  pdf.setTextColor(...COLORS.muted);
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(8);
  pdf.text(
    "Orçamento gerado com Quanto Cobrar 3D - quantocobrar3d.com",
    pageWidth / 2,
    pageHeight - 15,
    { align: "center" },
  );

  return pdf;
}

export async function downloadQuotationPdf(data: QuotationData): Promise<void> {
  const safeName = data.projectTitle
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase()
    .slice(0, 50);
  const pdf = await generateQuotationPdf(data);
  pdf.save(`orcamento-${safeName || "impressao-3d"}.pdf`);
}
