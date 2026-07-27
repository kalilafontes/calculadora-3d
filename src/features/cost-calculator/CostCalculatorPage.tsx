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
import { IndexedDbSavedCalculationRepository } from "../../infrastructure/storage/IndexedDbSavedCalculationRepository";
import { AppHeader } from "../../shared/navigation/AppHeader";
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
import { SaveCalculation } from "./components/SaveCalculation";
import { SavedCalculations } from "./components/SavedCalculations";
import { useCalculationDraft } from "./hooks/useCalculationDraft";
import { useEnergyEstimate } from "./hooks/useEnergyEstimate";
import { useSavedCalculations } from "./hooks/useSavedCalculations";
import { QuotationAction } from "../quotation/components/QuotationAction";
import { QuotationDialog } from "../quotation/components/QuotationDialog";
import { AppIcon } from "../../shared/ui/AppIcon";
import styles from "./CostCalculatorPage.module.css";

export interface FormValues {
  weightGrams: string;
  piecesPerPrint: string;
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
  piecesPerPrint: "1",
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
  piecesPerPrint: String(input.piecesPerPrint ?? 1),
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
  const [isQuotationOpen, setIsQuotationOpen] = useState(false);
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

  const fieldError = (field: keyof FormValues) =>
    parsed.success
      ? undefined
      : parsed.error.issues.find((issue) => issue.path[0] === field)?.message;

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
  const savedCalculationRepository = useMemo(
    () => new IndexedDbSavedCalculationRepository(),
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
  const openSavedCalculation = useCallback(
    (input: CalculationInput) => {
      restoreDraft(input);
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    [restoreDraft],
  );
  const { clear } = useCalculationDraft({
    input: parsed.success ? parsed.data : null,
    repository: draftRepository,
    restore: restoreDraft,
    reset: resetForm,
  });
  const { recent, status, save, remove } = useSavedCalculations({
    repository: savedCalculationRepository,
  });

  return (
    <main className={styles.page}>
      <AppHeader />
      <header className={styles.hero}>
        <div className={styles.heroCopy}>
          <div className={styles.heroTop}>
            <span className={styles.badge}>
              <AppIcon name="sparkle" size={15} />
              Calculadora inteligente
            </span>
          </div>
          <h1>Quanto cobrar pela sua impressão 3D?</h1>
          <p>
            Calcule todos os custos com precisão e defina um preço justo para
            sua impressão 3D. Simples, rápido e sem planilhas complicadas.
          </p>
          <div className={styles.heroBenefits} aria-label="Benefícios da calculadora">
            <div>
              <span><AppIcon name="filament" size={20} /></span>
              <strong>Cálculo completo</strong>
              <small>Material, energia e mão de obra</small>
            </div>
            <div>
              <span><AppIcon name="refresh" size={20} /></span>
              <strong>Atualizado</strong>
              <small>Preços e resultados em tempo real</small>
            </div>
            <div>
              <span><AppIcon name="tag" size={20} /></span>
              <strong>Fácil de usar</strong>
              <small>Interface intuitiva e objetiva</small>
            </div>
          </div>
        </div>
        <div className={styles.heroVisual}>
          <div className={styles.heroImageWrap}>
            <img
              src="/images/hero-vase-2-optimized.png"
              alt="Vaso decorativo rosa com textura espiral, impresso em 3D"
            />
          </div>
          <a className={styles.mobileResultLink} href="#pricing-title">
            Ver resultado atual
            <span aria-hidden="true">↓</span>
          </a>
        </div>
      </header>

      <div id="calculadora" className={styles.layout}>
        <form
          className={styles.form}
          onSubmit={(event) => event.preventDefault()}
        >
          <section id="materiais" className={styles.section}>
            <div className={styles.sectionHeading}>
              <span className={styles.sectionIcon}><AppIcon name="filament" size={21} /></span>
              <div>
                <h2><span className={styles.sectionNumber}>01</span> Impressão e material</h2>
                <p>
                  Use o peso total informado pelo fatiador para toda a mesa.
                </p>
              </div>
            </div>
            <div className={styles.grid}>
              <NumberField
                id="weightGrams"
                label="Peso total da impressão"
                unit="g"
                helpText="Considere todas as peças e suportes da mesa."
                error={fieldError("weightGrams")}
                registration={register("weightGrams")}
              />
              <NumberField
                id="piecesPerPrint"
                label="Peças nesta impressão"
                unit="un."
                helpText="Quantidade de peças produzidas juntas na mesa."
                error={fieldError("piecesPerPrint")}
                registration={register("piecesPerPrint")}
              />
              <NumberField
                id="filamentPricePerKg"
                label="Preço do filamento"
                unit="R$/kg"
                error={fieldError("filamentPricePerKg")}
                registration={register("filamentPricePerKg")}
              />
            </div>
          </section>

          <section id="energia" className={styles.section}>
            <div className={styles.sectionHeading}>
              <span className={styles.sectionIcon}><AppIcon name="bolt" size={21} /></span>
              <div>
                <h2><span className={styles.sectionNumber}>02</span> Impressão e energia</h2>
                <p>Use a potência média informada pelo fabricante.</p>
              </div>
            </div>
            <div className={styles.energyGroups}>
              <div className={styles.energyGroup}>
                <div className={styles.energyGroupHeading}>
                  <strong>Máquina e consumo</strong>
                  <span>Dados usados para estimar o gasto da impressora.</span>
                </div>
                <div className={styles.grid}>
                  <NumberField
                    id="printTimeHours"
                    label="Tempo de impressão"
                    unit="h"
                    error={fieldError("printTimeHours")}
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
                    error={fieldError("printerPowerWatts")}
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
                </div>
              </div>

              <div className={styles.energyGroup}>
                <div className={styles.energyGroupHeading}>
                  <strong>Tarifa de energia</strong>
                  <span>Escolha a referência para o preço do kWh.</span>
                </div>
                <div className={styles.grid}>
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
                    className={styles.energyPriceField}
                    helpText="A estimativa pode ser substituída pelo valor da sua conta."
                    error={fieldError("energyPricePerKwh")}
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
              </div>
            </div>
          </section>

          <section className={styles.section}>
            <div className={styles.sectionHeading}>
              <span className={styles.sectionIcon}><AppIcon name="tag" size={21} /></span>
              <div>
                <h2><span className={styles.sectionNumber}>03</span> Mão de obra</h2>
                <p>Valorize o tempo dedicado à preparação e ao acabamento.</p>
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
                    error={fieldError("laborTimeHours")}
                    registration={register("laborTimeHours")}
                  />
                  <NumberField
                    id="laborHourlyRate"
                    label="Valor da sua hora"
                    unit="R$/h"
                    error={fieldError("laborHourlyRate")}
                    registration={register("laborHourlyRate")}
                  />
                </>
              ) : (
                <NumberField
                  id="directLaborCost"
                  label="Mão de obra da impressão"
                  unit="R$"
                  error={fieldError("directLaborCost")}
                  registration={register("directLaborCost")}
                />
              )}
            </div>
          </section>

          <section className={styles.section}>
            <div className={styles.sectionHeading}>
              <span className={styles.sectionIcon}><AppIcon name="box" size={21} /></span>
              <div>
                <h2><span className={styles.sectionNumber}>04</span> Custos adicionais</h2>
                <p>Inclua embalagem e outros custos da impressão completa.</p>
              </div>
            </div>
            <div className={styles.grid}>
              <NumberField
                id="packagingCost"
                label="Embalagem"
                unit="R$"
                error={fieldError("packagingCost")}
                registration={register("packagingCost")}
              />
              <NumberField
                id="otherCosts"
                label="Outros custos"
                unit="R$"
                error={fieldError("otherCosts")}
                registration={register("otherCosts")}
              />
            </div>
          </section>

          <section className={styles.section}>
            <div className={styles.sectionHeading}>
              <span className={styles.sectionIcon}><AppIcon name="chart" size={21} /></span>
              <div>
                <h2><span className={styles.sectionNumber}>05</span> Perdas e margem</h2>
                <p>Reserve perdas e defina o lucro sobre o preço de venda.</p>
              </div>
            </div>
            <div className={styles.grid}>
              <NumberField
                id="lossPercentage"
                label="Margem para perdas"
                unit="%"
                helpText="Aplicada sobre filamento e energia."
                error={fieldError("lossPercentage")}
                registration={register("lossPercentage")}
              />
              <NumberField
                id="marginPercentage"
                label="Margem de lucro"
                unit="%"
                helpText="Percentual do preço final que representa lucro."
                error={fieldError("marginPercentage")}
                registration={register("marginPercentage")}
              />
            </div>
          </section>
          <ClearCalculationButton onClear={clear} />
        </form>

        <aside
          className={styles.results}
          aria-label="Resultados da calculadora"
          aria-live="polite"
        >
          {result ? (
            <>
              <PricingSummary result={result} />
              <CostBreakdown result={result} />
              <QuotationAction onClick={() => setIsQuotationOpen(true)} />
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
          <SaveCalculation
            id="salvar-calculo"
            disabled={!parsed.success || !result}
            status={status}
            onSave={(title) =>
              parsed.success && result
                ? save(title, parsed.data, result)
                : Promise.resolve(false)
            }
          />
          <SavedCalculations
            recent={recent}
            onOpen={(calculation) => openSavedCalculation(calculation.input)}
            onDelete={(id) => void remove(id)}
          />
        </aside>
      </div>

      <section id="dicas" className={styles.guide} aria-labelledby="pricing-guide-title">
        <div className={styles.guideIntro}>
          <span>Guia rápido</span>
          <h2 id="pricing-guide-title">
            Como calcular o preço de uma impressão 3D?
          </h2>
          <p>
            Um preço sustentável precisa considerar mais do que o filamento.
            Tempo de máquina, energia, mão de obra, embalagem, perdas e margem
            fazem parte do custo real de uma impressão 3D.
          </p>
          <a
            className={styles.guideLink}
            href="/como-calcular-preco-impressao-3d/"
          >
            Ler o guia completo de formação de preço
          </a>
        </div>

        <div className={styles.guideCards}>
          <article>
            <strong>1</strong>
            <h3>Use os dados do fatiador</h3>
            <p>
              Informe o peso total, incluindo suportes, o tempo previsto e
              quantas peças serão produzidas juntas na mesa.
            </p>
          </article>
          <article>
            <strong>2</strong>
            <h3>Inclua todos os custos</h3>
            <p>
              Some energia, preparação, acabamento, embalagem e uma reserva para
              falhas ou impressões perdidas.
            </p>
          </article>
          <article>
            <strong>3</strong>
            <h3>Defina uma margem saudável</h3>
            <p>
              A margem representa a parcela do preço final que ficará como lucro
              depois que todos os custos forem pagos.
            </p>
          </article>
        </div>

        <div className={styles.example}>
          <div>
            <span>Exemplo simples</span>
            <h3>Margem não é o mesmo que markup</h3>
          </div>
          <p>
            Se uma impressão custa R$ 80 e você deseja margem de 20%, o preço
            correto é R$ 100. Assim, R$ 20 correspondem a 20% do preço de venda.
          </p>
        </div>

        <div className={styles.faq}>
          <h2>Perguntas frequentes sobre preço de impressão 3D</h2>
          <details>
            <summary>Como calcular o custo do filamento?</summary>
            <p>
              Divida o peso usado em gramas por 1.000 e multiplique pelo preço
              do quilograma. Considere também o material gasto nos suportes.
            </p>
          </details>
          <details>
            <summary>Devo cobrar pelo tempo da impressora?</summary>
            <p>
              Sim. O tempo influencia o consumo de energia, a disponibilidade da
              máquina e sua capacidade de aceitar outros trabalhos.
            </p>
          </details>
          <details>
            <summary>Como considerar falhas de impressão?</summary>
            <p>
              Adicione um percentual de perdas sobre filamento e energia. Essa
              reserva ajuda a absorver reimpressões e descartes sem eliminar sua
              margem.
            </p>
          </details>
          <details>
            <summary>Os dados ficam armazenados em algum servidor?</summary>
            <p>
              Não. O Quanto Cobrar 3D funciona sem conta e mantém rascunhos e
              cálculos salvos somente neste navegador.
            </p>
          </details>
        </div>
      </section>

      <footer className={styles.siteFooter}>
        <strong>Quanto Cobrar 3D</strong>
        <span>Calculadora gratuita para quem produz com impressão 3D.</span>
      </footer>

      {result && isQuotationOpen ? (
        <QuotationDialog
          result={result}
          onClose={() => setIsQuotationOpen(false)}
        />
      ) : null}
    </main>
  );
}
