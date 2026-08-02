# GA4 quotation events

## Goal

Measure interest in and successful completion of PDF quotation generation in
the Quanto Cobrar 3D web app.

## Design

Use the Google Analytics 4 web tag with measurement ID `G-4BH2MQYXY8`.
Analytics calls are isolated behind a small typed helper that safely no-ops
when `window.gtag` is unavailable, so PDF generation remains fully local and
functional when analytics is blocked.

Record two custom events:

- `quotation_opened` when the user opens the quotation dialog.
- `quotation_pdf_generated` after `downloadQuotationPdf` resolves successfully.
- `view_result_clicked` when the user uses the results shortcut. This only
  scrolls to the existing result and does not alter calculation behavior.

No quotation fields, customer data, prices, filenames, or file contents are
sent. The first event represents intent, the second represents a successful
conversion, and the third measures use of the results shortcut. Existing local
calculation and PDF behavior is unchanged.

## Verification

Unit tests cover event dispatch and the two UI integration points. The
production build and full test suite must pass. The events can then be checked
in GA4 under Realtime and Engagement > Events.
