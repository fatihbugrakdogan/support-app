# dashboard — Next.js triage UI

The human side of the confidence-routing loop: agents see what the AI decided, *how sure
it was*, and correct it where it wasn't sure enough.

## Pages

- **`/` — ticket list**: category / priority / language / min-confidence per ticket, with
  routing badges (`automated` · `needs review` · `approved` · `extraction failed`).
  Polls every 3 s so freshly POSTed tickets appear as they finish processing. Includes a
  submit form for demoing any language.
- **`/tickets/[id]` — detail**: the AI analysis card (labels **with confidences**, routing
  reason, served model, latency), reply drafts newest-first with **Regenerate draft**
  (old drafts stay — append-only), a **human review panel** (approve as-is or with
  corrected labels), and the full event timeline.

## Design rules

- The UI consumes **API DTOs only** (`lib/api.ts` mirrors the backend response models) —
  it never sees database documents.
- No business logic in components: the client is fetch + render; every decision
  (routing, validation, audit) lives server-side.
- Plain CSS, no UI framework — the point is legibility, not chrome.

## Run

```bash
npm install
npm run dev          # http://localhost:3000
# NEXT_PUBLIC_API_URL — backend base URL (default http://localhost:8100)
```
