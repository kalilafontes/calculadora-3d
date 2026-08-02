# GA4 Quotation Events Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Instrument quotation actions and the results shortcut with GA4 events.

**Architecture:** Add a typed, browser-safe analytics helper in `src/infrastructure/analytics/ga4.ts`. It exposes a narrow `trackEvent` function, no-ops when `gtag` is absent, and sends no quotation data. Add the GA4 tag to both HTML entry points and call the helper at the existing UI, results shortcut, and PDF success boundaries.

**Tech Stack:** React 19, TypeScript, Vite, Vitest, Testing Library, Google Analytics 4 `gtag.js`.

## Global Constraints

- Use measurement ID `G-4BH2MQYXY8`.
- Track only `quotation_opened`, `quotation_pdf_generated`, and `view_result_clicked`.
- Never send seller, client, price, filename, image, or PDF data.
- Preserve local-only PDF generation and no-op when analytics is unavailable.

---

### Task 1: Create the GA4 event helper

**Files:**
- Create: `src/infrastructure/analytics/ga4.ts`
- Test: `src/infrastructure/analytics/ga4.test.ts`

**Interfaces:**
- Produces `trackGa4Event(name: "quotation_opened" | "quotation_pdf_generated"): void`.

- [ ] **Step 1: Write the failing tests**

```ts
import { describe, expect, it, vi } from "vitest";
import { trackGa4Event } from "./ga4";

describe("trackGa4Event", () => {
  it("sends the event name through gtag when available", () => {
    const gtag = vi.fn();
    window.gtag = gtag;

    trackGa4Event("quotation_opened");

    expect(gtag).toHaveBeenCalledWith("event", "quotation_opened");
  });

  it("does nothing when gtag is unavailable", () => {
    delete window.gtag;

    expect(() => trackGa4Event("quotation_pdf_generated")).not.toThrow();
  });
});
```

- [ ] **Step 2: Run the focused test and verify it fails**

Run: `npx vitest run src/infrastructure/analytics/ga4.test.ts`

Expected: FAIL because `ga4.ts` and `window.gtag` do not exist yet.

- [ ] **Step 3: Add the minimal typed helper**

Declare the `Window.gtag` type locally and implement `trackGa4Event` as a guard plus `window.gtag("event", name)` call. Do not add parameters or network calls in the helper.

- [ ] **Step 4: Run the focused test and verify it passes**

Run: `npx vitest run src/infrastructure/analytics/ga4.test.ts`

Expected: PASS.

### Task 2: Load GA4 on the public entry points

**Files:**
- Modify: `index.html`
- Modify: `como-calcular-preco-impressao-3d/index.html`

- [ ] **Step 1: Add the async Google tag snippet**

Add the standard `googletagmanager.com/gtag/js?id=G-4BH2MQYXY8` script and initialize `window.dataLayer` plus `gtag("config", "G-4BH2MQYXY8")` in each HTML entry point. Keep the snippet in `<head>` and do not include user data.

- [ ] **Step 2: Confirm both pages build**

Run: `npm run build`

Expected: Vite build succeeds and emits both HTML entry points.

### Task 3: Track quotation intent and conversion

**Files:**
- Modify: `src/features/cost-calculator/CostCalculatorPage.tsx`
- Modify: `src/features/quotation/components/QuotationDialog.tsx`

**Interfaces:**
- Consumes `trackGa4Event` from `src/infrastructure/analytics/ga4.ts`.

- [ ] **Step 1: Add the failing integration assertions**

Extend existing component tests to assert that clicking `Gerar orçamento em PDF` calls `trackGa4Event("quotation_opened")`, and that a successful PDF submission calls `trackGa4Event("quotation_pdf_generated")`. Keep the existing PDF mock and assert the event only after the promise resolves.

- [ ] **Step 2: Run the focused component tests and verify the new assertions fail**

Run: `npx vitest run src/features/cost-calculator/CostCalculatorPage.test.tsx src/features/quotation/components/QuotationDialog.test.tsx`

Expected: the new event assertions fail because no tracking calls exist.

- [ ] **Step 3: Implement the two event calls**

Import the helper. Wrap the existing `setIsQuotationOpen(true)` callback to emit `quotation_opened` before opening the dialog. In the dialog submit success path, emit `quotation_pdf_generated` immediately after `downloadQuotationPdf` resolves and before clearing the error.

- [ ] **Step 4: Run focused tests and verify they pass**

Run: `npx vitest run src/features/cost-calculator/CostCalculatorPage.test.tsx src/features/quotation/components/QuotationDialog.test.tsx`

Expected: PASS.

### Task 4: Full verification

**Files:**
- No additional files.

- [ ] **Step 1: Run lint, typecheck, tests, and build**

Run: `npm run lint && npm run typecheck && npm test -- --run && npm run build`

Expected: all commands exit successfully.

- [ ] **Step 2: Verify the working tree**

Run: `git diff --check`

Expected: no whitespace errors. In GA4, use Realtime/DebugView after deployment to confirm the two event names.
