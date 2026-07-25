const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const decimalFormatter = new Intl.NumberFormat("pt-BR", {
  minimumFractionDigits: 0,
  maximumFractionDigits: 4,
});

export function formatCurrency(value: number): string {
  return currencyFormatter.format(value);
}

export function formatPercentage(value: number): string {
  return `${decimalFormatter.format(value)}%`;
}

export function formatHours(value: number): string {
  return `${decimalFormatter.format(value)} h`;
}

export function formatEnergyPrice(value: number): string {
  return `${currencyFormatter.format(value)}/kWh`;
}
