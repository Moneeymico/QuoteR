# QuoteR

Drag in a project specification and drawings (PDF or image) and QuoteR reads them and produces:

- **A trade-by-trade scope breakdown** — scope items, quantities, materials, and spec/sheet references, grouped by trade (CSI MasterFormat divisions).
- **A subcontractor coordination plan** — which trades are needed and how they depend on each other (e.g. electrical/plumbing/mechanical rough-in must finish and be inspected before drywall closes the walls).
- **Flags** — ambiguities, conflicts between documents, and missing information a subcontractor would need before bidding accurately.

Documents are sent directly to Claude (native PDF + image understanding), so there's no separate OCR or parsing pipeline to maintain — the whole spec, drawing sheets, and schedules are read as-is.

## Getting started

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy `.env.example` to `.env.local` and add an Anthropic API key from <https://console.anthropic.com/>:

   ```bash
   cp .env.example .env.local
   ```

3. Run the dev server:

   ```bash
   npm run dev
   ```

4. Open <http://localhost:3000>, drag in a spec PDF and/or drawing sheets, and click **Analyze**.

## How it works

- `src/components/Dropzone.tsx` + `src/app/page.tsx` — drag-and-drop upload UI.
- `src/app/api/analyze/route.ts` — receives the uploaded files, validates them, and hands them to the extraction pipeline.
- `src/lib/extraction.ts` — sends the documents to Claude as native `document`/`image` content blocks along with a forced tool call (`submit_takeoff`) whose JSON schema defines the structured output: project summary, per-trade scope items, cross-trade coordination, and flags.
- `src/lib/trades.ts` — the CSI-division-based trade taxonomy used to guide classification and to order results in the UI in typical construction sequence.
- `src/components/TradeResults.tsx`, `SubcontractorMap.tsx`, `FlagsList.tsx` — render the three result views.

## Notes & limits

- Supported file types: PDF, PNG, JPEG, WEBP, GIF. Up to 15 files, 30MB each, per analysis.
- Larger or more complex projects may need to be split into multiple analysis passes (e.g. by building or phase) if they exceed the model's context.
- This produces an AI-assisted first-pass takeoff, not a certified estimate — always verify extracted quantities and scope against the source documents before using them to bid.

## Learn more about Next.js

This project uses the [Next.js App Router](https://nextjs.org/docs/app). See the [Next.js documentation](https://nextjs.org/docs) for framework-level questions.
