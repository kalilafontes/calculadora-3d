import { useCallback, useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { calculateCosts } from "../../domain/calculation/calculateCosts";
import { calculationSchema } from "../../domain/calculation/calculation.schema";
import type {
  CalculationInput,
  EnergyPriceOrigin,
  LaborMode,
} from "../../domain/calculation/calculation.types";
import { LocalStorageCalculationDraftRepository } from "../../infrastructure/storage/LocalStorageCalculationDraftRepository";
import { ThemeToggle } from "../../shared/theme/ThemeToggle";
import {
  findPrinterProfile,
  type PrinterVoltage,
} from "../../infrastructure/printers/printerCatalog";
import { ClearCalculationButton } from "./components/ClearCalculationButton";
import { DistributorSelect } from "./components/DistributorSelect";
import { EnergyEstimateNotice } from "./components/EnergyEstimateNotice";
import { CostBreakdown } from "./components/CostBreakdown";
import { NumberField } from "./components/NumberField";
import { PricingSummary } from "./components/PricingSummary";
import { PrinterPowerNotice } from "./components/PrinterPowerNotice";
import { PrinterSelect } from "./components/PrinterSelect";
import { StateSelect } from "./components/StateSelect";
import { useCalculationDraft } from "./hooks/useCalculationDraft";
import { useEnergyEstimate } from "./hooks/useEnergyEstimate";
import styles from "./CostCalculatorPage.module.css";

export interface FormValues {
  weightGrams: string;
  filamentPricePerKg: string;
  printTimeHours: string;
  printerPowerWatts: string;
  printerModelId: string;
  printerVoltage: "127" | "220";
  printerPowerOrigin: "manufacturer-max" | "manual";
  stateCode: string;
  distributorId: string;
  energyPricePerKwh: string;
  energyPriceOrigin: EnergyPriceOrigin;
  packagingCost: string;
  laborMode: LaborMode;
  laborTimeHours: string;
  laborHourlyRate: string;
  directLaborCost: string;
  otherCosts: string;
  lossPercentage: string;
  marginPercentage: string;
}

const defaults: FormValues = {
  weightGrams: "100",
  filamentPricePerKg: "100",
  printTimeHours: "2",
  printerPowerWatts: "200",
  printerModelId: "",
  printerVoltage: "127",
  printerPowerOrigin: "manual",
  stateCode: "BA",
  distributorId: "",
  energyPricePerKwh: "1,00",
  energyPriceOrigin: "state",
  packagingCost: "5",
  laborMode: "calculated",
  laborTimeHours: "0,5",
  laborHourlyRate: "20",
  directLaborCost: "10",
  otherCosts: "0",
  lossPercentage: "10",
  marginPercentage: "20",
};

const toFormValues = (input: CalculationInput): FormValues => ({
  weightGrams: String(input.weightGrams).replace(".", ","),
  filamentPricePerKg: String(input.filamentPricePerKg).replace(".", ","),
  printTimeHours: String(input.printTimeHours).replace(".", ","),
  printerPowerWatts: String(input.printerPowerWatts).replace(".", ","),
  printerModelId: input.printerModelId ?? "",
  printerVoltage: String(input.printerVoltage ?? 127) as "127" | "220",
  printerPowerOrigin: input.printerPowerOrigin ?? "manual",
  stateCode: input.stateCode,
  distributorId: input.distributorId ?? "",
  energyPricePerKwh: String(input.energyPricePerKwh).replace(".", ","),
  energyPriceOrigin: input.energyPriceOrigin,
  packagingCost: String(input.packagingCost).replace(".", ","),
  laborMode: input.laborMode,
  laborTimeHours: String(input.laborTimeHours ?? 0).replace(".", ","),
  laborHourlyRate: String(input.laborHourlyRate ?? 0).replace(".", ","),
  directLaborCost: String(input.directLaborCost ?? 0).replace(".", ","),
  otherCosts: String(input.otherCosts).replace(".", ","),
  lossPercentage: String(input.lossPercentage).replace(".", ","),
  marginPercentage: String(input.marginPercentage).replace(".", ","),
});

export function CostCalculatorPage() {
  const { control, register, reset, setValue } = useForm<FormValues>({
    defaultValues: defaults,
    mode: "onChange",
  });
  const values = useWatch({ control }) as FormValues;
  const laborMode = values.laborMode;
  const [manualEnergyOverride, setManualEnergyOverride] = useState(false);
  const [manualPrinterPower, setManualPrinterPower] = useState(
    values.printerPowerOrigin === "manual",
  );
  const printerVoltage = Number(values.printerVoltage) as PrinterVoltage;
  const selectedPrinterProfile = findPrinterProfile(
    values.printerModelId,
    printerVoltage,
  );

  const parsed = calculationSchema.safeParse({
    ...values,
    printerModelId: values.printerModelId || undefined,
    printerVoltage: values.printerModelId ? printerVoltage : undefined,
    printerPowerOrigin: values.printerModelId
      ? values.printerPowerOrigin
      : "manual",
    energyPriceOrigin: values.energyPriceOrigin,
    distributorId: values.distributorId || undefined,
    laborTimeHours:
      laborMode === "calculated" ? values.laborTimeHours : undefined,
    laborHourlyRate:
      laborMode === "calculated" ? values.laborHourlyRate : undefined,
    directLaborCost:
      laborMode === "direct" ? values.directLaborCost : undefined,
  });

  const result = parsed.success ? calculateCosts(parsed.data) : null;
  const applyEnergyEstimate = useCallback(
    (estimate: { pricePerKwh: number; origin: "state" | "distributor" }) => {
      setValue(
        "energyPricePerKwh",
        estimate.pricePerKwh.toFixed(4).replace(".", ","),
      );
      setValue("energyPriceOrigin", estimate.origin);
    },
    [setValue],
  );
  const clearDistributor = useCallback(
    () => setValue("distributorId", ""),
    [setValue],
  );
  const { distributors, estimate } = useEnergyEstimate({
    stateCode: values.stateCode as CalculationInput["stateCode"],
    distributorId: values.distributorId,
    manualOverride: manualEnergyOverride,
    applyEstimate: applyEnergyEstimate,
    clearDistributor,
  });
  const draftRepository = useMemo(
    () => new LocalStorageCalculationDraftRepository(),
    [],
  );
  const restoreDraft = useCallback(
    (input: CalculationInput) => {
      setManualEnergyOverride(input.energyPriceOrigin === "manual");
      setManualPrinterPower(input.printerPowerOrigin !== "manufacturer-max");
      reset(toFormValues(input));
    },
    [reset],
  );
  const resetForm = useCallback(() => {
    setManualEnergyOverride(false);
    setManualPrinterPower(true);
    reset(defaults);
  }, [reset]);
  const { clear } = useCalculationDraft({
    input: parsed.success ? parsed.data : null,
    repository: draftRepository,
    restore: restoreDraft,
    reset: resetForm,
  });

  return (
    <main className={styles.page}>
      <header className={styles.hero}>
        <div>
          <div className={styles.heroTop}>
            <span className={styles.badge}>Calculadora3D</span>
            <ThemeToggle />
          </div>
          <h1>Preço justo começa pelo custo real.</h1>
          <p>
            Descubra quanto sua impressão realmente custa e chegue a um preço de
            venda sustentável, sem planilhas complicadas.
          </p>
        </div>
        <div className={styles.heroMetric} aria-label="Atualização automática">
          <strong>Tempo real</strong>
          <span>Resultados atualizados enquanto você preenche</span>
        </div>
      </header>

      <div className={styles.layout}>
        <form
          className={styles.form}
          onSubmit={(event) => event.preventDefault()}
        >
          <section className={styles.section}>
            <div className={styles.sectionHeading}>
              <span>01</span>
              <div>
                <h2>Peça e material</h2>
                <p>Informe o peso e o valor do rolo de filamento.</p>
              </div>
            </div>
            <div className={styles.grid}>
              <NumberField
                id="weightGrams"
                label="Peso da peça"
                unit="g"
                registration={register("weightGrams")}
              />
              <NumberField
                id="filamentPricePerKg"
                label="Preço do filamento"
                unit="R$/kg"
                registration={register("filamentPricePerKg")}
              />
            </div>
          </section>

          <section className={styles.section}>
            <div className={styles.sectionHeading}>
              <span>02</span>
              <div>
                <h2>Impressão e energia</h2>
                <p>Use a potência média informada pelo fabricante.</p>
              </div>
            </div>
            <div className={styles.grid}>
              <NumberField
                id="printTimeHours"
                label="Tempo de impressão"
                unit="h"
                registration={register("printTimeHours")}
              />
              <PrinterSelect
                printerModelId={values.printerModelId}
                voltage={printerVoltage}
                onPrinterChange={(printerModelId) => {
                  setValue("printerModelId", printerModelId);
                  if (!printerModelId) {
                    setManualPrinterPower(true);
                    setValue("printerPowerOrigin", "manual");
                    return;
                  }
                  const selection = findPrinterProfile(
                    printerModelId,
                    printerVoltage,
                  );
                  if (selection) {
                    setManualPrinterPower(false);
                    setValue(
                      "printerPowerWatts",
                      String(selection.profile.maxPowerWatts),
                    );
                    setValue("printerPowerOrigin", "manufacturer-max");
                  }
                }}
                onVoltageChange={(voltage) => {
                  setValue("printerVoltage", String(voltage) as "127" | "220");
                  const selection = findPrinterProfile(
                    values.printerModelId,
                    voltage,
                  );
                  if (selection) {
                    setManualPrinterPower(false);
                    setValue(
                      "printerPowerWatts",
                      String(selection.profile.maxPowerWatts),
                    );
                    setValue("printerPowerOrigin", "manufacturer-max");
                  }
                }}
              />
              <NumberField
                id="printerPowerWatts"
                label="Potência da impressora"
                unit="W"
                helpText="Selecione um modelo ou informe a potência que deseja considerar."
                registration={register("printerPowerWatts", {
                  onChange: () => {
                    setManualPrinterPower(true);
                    setValue("printerPowerOrigin", "manual");
                  },
                })}
              />
              <PrinterPowerNotice
                printer={selectedPrinterProfile?.printer ?? null}
                isManual={manualPrinterPower}
              />
              <StateSelect
                registration={register("stateCode", {
                  onChange: () => {
                    setManualEnergyOverride(false);
                    setValue("distributorId", "");
                    setValue("energyPriceOrigin", "state");
                  },
                })}
              />
              <DistributorSelect
                distributors={distributors}
                value={values.distributorId}
                onChange={(distributorId) => {
                  setManualEnergyOverride(false);
                  setValue("distributorId", distributorId);
                  setValue(
                    "energyPriceOrigin",
                    distributorId ? "distributor" : "state",
                  );
                }}
              />
              <NumberField
                id="energyPricePerKwh"
                label="Preço da energia"
                unit="R$/kWh"
                helpText="A estimativa pode ser substituída pelo valor da sua conta."
                registration={register("energyPricePerKwh", {
                  onChange: () => {
                    setManualEnergyOverride(true);
                    setValue("energyPriceOrigin", "manual");
                  },
                })}
              />
              <EnergyEstimateNotice
                estimate={estimate}
                isManual={manualEnergyOverride}
              />
            </div>
          </section>

          <section className={styles.section}>
            <div className={styles.sectionHeading}>
              <span>03</span>
              <div>
                <h2>Trabalho e adicionais</h2>
                <p>Inclua o tempo que você dedica à preparação e acabamento.</p>
              </div>
            </div>

            <fieldset className={styles.mode}>
              <legend>Como calcular a mão de obra?</legend>
              <label>
                <input
                  type="radio"
                  value="calculated"
                  {...register("laborMode")}
                />
                Tempo × valor/hora
              </label>
              <label>
                <input type="radio" value="direct" {...register("laborMode")} />
                Valor direto
              </label>
            </fieldset>

            <div className={styles.grid}>
              {laborMode === "calculated" ? (
                <>
                  <NumberField
                    id="laborTimeHours"
                    label="Tempo de trabalho"
                    unit="h"
                    registration={register("laborTimeHours")}
                  />
                  <NumberField
                    id="laborHourlyRate"
                    label="Valor da sua hora"
                    unit="R$/h"
                    registration={register("laborHourlyRate")}
                  />
                </>
              ) : (
                <NumberField
                  id="directLaborCost"
                  label="Mão de obra por peça"
                  unit="R$"
                  registration={register("directLaborCost")}
                />
              )}
              <NumberField
                id="packagingCost"
                label="Embalagem"
                unit="R$"
                registration={register("packagingCost")}
              />
              <NumberField
                id="otherCosts"
                label="Outros custos"
                unit="R$"
                registration={register("otherCosts")}
              />
              <NumberField
                id="lossPercentage"
                label="Margem para perdas"
                unit="%"
                helpText="Aplicada sobre filamento e energia."
                registration={register("lossPercentage")}
              />
              <NumberField
                id="marginPercentage"
                label="Margem de lucro"
                unit="%"
                helpText="Percentual do preço final que representa lucro."
                registration={register("marginPercentage")}
              />
            </div>
          </section>
          <ClearCalculationButton onClear={clear} />
        </form>

        <aside className={styles.results} aria-live="polite">
          {result ? (
            <>
              <PricingSummary result={result} />
              <CostBreakdown result={result} />
            </>
          ) : (
            <section className={styles.emptyResult}>
              <h2>Revise os valores</h2>
              <p>
                Use apenas números positivos e uma margem de lucro menor que
                100%.
              </p>
            </section>
          )}
        </aside>
      </div>
    </main>
  );
}
