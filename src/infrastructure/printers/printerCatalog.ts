export type PrinterVoltage = 127 | 220;

export interface PrinterVoltageProfile {
  voltage: PrinterVoltage;
  maxPowerWatts: number;
  manufacturerVoltageLabel: string;
}

export interface PrinterCatalogItem {
  id: string;
  manufacturer: string;
  model: string;
  voltageProfiles: PrinterVoltageProfile[];
  source: {
    type: "manufacturer";
    label: string;
    url: string;
  };
}

export const printerCatalog: PrinterCatalogItem[] = [
  {
    id: "bambu-lab-a1",
    manufacturer: "Bambu Lab",
    model: "A1",
    voltageProfiles: [
      {
        voltage: 127,
        maxPowerWatts: 350,
        manufacturerVoltageLabel: "110 V (faixa 100–120 V)",
      },
      {
        voltage: 220,
        maxPowerWatts: 1300,
        manufacturerVoltageLabel: "220 V",
      },
    ],
    source: {
      type: "manufacturer",
      label: "Especificações técnicas da Bambu Lab A1",
      url: "https://bambulab.com/en/a1/tech-specs",
    },
  },
  {
    id: "bambu-lab-a1-mini",
    manufacturer: "Bambu Lab",
    model: "A1 mini",
    voltageProfiles: [
      {
        voltage: 127,
        maxPowerWatts: 150,
        manufacturerVoltageLabel: "100–240 V",
      },
      {
        voltage: 220,
        maxPowerWatts: 150,
        manufacturerVoltageLabel: "100–240 V",
      },
    ],
    source: {
      type: "manufacturer",
      label: "Guia oficial da Bambu Lab A1 mini",
      url: "https://cdn1.bambulab.com/documentation/quick-start-f507128172bdf/Quick%20start%20guide%20-%20A1%20mini-EN.pdf",
    },
  },
];

export function findPrinterProfile(
  printerModelId: string,
  voltage: PrinterVoltage,
) {
  const printer = printerCatalog.find((item) => item.id === printerModelId);
  const profile = printer?.voltageProfiles.find(
    (item) => item.voltage === voltage,
  );
  return printer && profile ? { printer, profile } : null;
}
