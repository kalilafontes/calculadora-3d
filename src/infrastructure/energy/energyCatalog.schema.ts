import { z } from "zod";
import { BRAZIL_STATE_CODES } from "../../domain/calculation/calculation.types";

const stateCodeSchema = z.enum(BRAZIL_STATE_CODES);
const positivePrice = z.number().finite().positive();

export const energyCatalogSchema = z
  .object({
    schemaVersion: z.literal(1),
    source: z.object({
      name: z.literal("ANEEL"),
      url: z.url(),
      retrievedAt: z.iso.datetime(),
    }),
    referencePeriod: z.object({
      start: z.string().regex(/^\d{4}-\d{2}$/),
      end: z.string().regex(/^\d{4}-\d{2}$/),
      method: z.literal("rolling-12-month-weighted-average"),
    }),
    tariffProfile: z.object({
      consumerClass: z.literal("B1_RESIDENTIAL"),
      tariffModality: z.literal("CONVENTIONAL"),
    }),
    states: z.array(
      z.object({
        stateCode: stateCodeSchema,
        stateName: z.string().min(1),
        averagePricePerKwh: positivePrice,
        distributorIds: z.array(z.string().min(1)),
      }),
    ),
    distributors: z.array(
      z.object({
        id: z.string().min(1),
        name: z.string().min(1),
        agentCode: z.string().min(1),
        stateCodes: z.array(stateCodeSchema).min(1),
      }),
    ),
    distributorTariffEstimates: z.array(
      z.object({
        stateCode: stateCodeSchema,
        distributorId: z.string().min(1),
        averagePricePerKwh: positivePrice,
        includedComponents: z.array(z.string().min(1)),
      }),
    ),
  })
  .superRefine((catalog, context) => {
    const stateCodes = new Set(catalog.states.map((state) => state.stateCode));
    if (
      stateCodes.size !== BRAZIL_STATE_CODES.length ||
      BRAZIL_STATE_CODES.some((stateCode) => !stateCodes.has(stateCode))
    ) {
      context.addIssue({
        code: "custom",
        path: ["states"],
        message: "O catálogo deve conter exatamente as 27 UFs.",
      });
    }

    const distributors = new Map(
      catalog.distributors.map((distributor) => [distributor.id, distributor]),
    );
    const estimatePairs = new Set<string>();

    for (const state of catalog.states) {
      for (const distributorId of state.distributorIds) {
        const distributor = distributors.get(distributorId);
        if (!distributor?.stateCodes.includes(state.stateCode)) {
          context.addIssue({
            code: "custom",
            path: ["states"],
            message: "Relação UF/distribuidora inválida.",
          });
        }
      }
    }

    for (const estimate of catalog.distributorTariffEstimates) {
      const pair = `${estimate.stateCode}:${estimate.distributorId}`;
      const distributor = distributors.get(estimate.distributorId);
      if (estimatePairs.has(pair)) {
        context.addIssue({
          code: "custom",
          path: ["distributorTariffEstimates"],
          message: "Cada par UF/distribuidora deve ser único.",
        });
      }
      estimatePairs.add(pair);

      if (!distributor?.stateCodes.includes(estimate.stateCode)) {
        context.addIssue({
          code: "custom",
          path: ["distributorTariffEstimates"],
          message: "A estimativa deve referenciar uma relação válida.",
        });
      }
    }
  });
