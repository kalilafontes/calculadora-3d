export interface SellerProfile {
  name: string;
  email: string;
  phone: string;
  document: string;
}

export type PaymentMethod =
  "pix" | "cash" | "credit-card" | "debit-card" | "bank-transfer";

export interface QuotationData {
  seller: SellerProfile;
  clientName: string;
  clientContact: string;
  projectTitle: string;
  quantity: number;
  unitPrice: number;
  validityDays: number;
  productionLeadTime: number;
  productionLeadTimeUnit: "business-days" | "calendar-days";
  paymentMethods: PaymentMethod[];
  pixKey: string;
  upfrontPercentage: number;
  includeCareInstructions: boolean;
  notes: string;
  logoDataUrl?: string;
  productImageDataUrl?: string;
  issuedAt: Date;
}
