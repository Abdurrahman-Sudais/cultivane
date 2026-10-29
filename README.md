# Cultivane

**Understand every batch in context.**

Cultivane is an AI-assisted fermentation batch-monitoring platform, initially focused on nonclinical industrial enzyme production. This repository contains the marketing website and a working, interactive batch-monitoring dashboard built on a **simulated** dataset.

- Domain: cultivane.site
- Founder: Mariam Suleiman — mariam@cultivate.site

## Stack

Vite · React 18 · TypeScript (strict) · Tailwind CSS v4 · React Router v6 · Recharts · Lucide React

## Getting started

Requires Node.js 18+ (tested with Node 22) and npm.

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # type-check + production build to dist/
npm run preview    # serve the production build
```

Because this is a single-page app, configure your host to rewrite unknown paths to `index.html` (e.g. Netlify `_redirects`: `/* /index.html 200`; Vercel `rewrites`).

## Routes

| Path | Page |
| --- | --- |
| `/` | Home |
| `/product`, `/batch-monitoring`, `/process-analytics`, `/how-it-works`, `/pricing`, `/about`, `/contact` | Marketing pages |
| `/batches` | Dashboard overview |
| `/batches/list` | Searchable batch inventory |
| `/batches/b/:batchId` | Batch detail (trends, samples, events, investigations) |
| `/batches/runs` | Process runs grouped by recipe + equipment group |
| `/batches/trends` | Interactive single-batch trends |
| `/batches/compare?focus=ID` | Multi-batch comparison with comparability checks |
| `/batches/investigations[/:id]` | Investigation list and workflow |
| `/batches/data-quality` | Missing / outdated / incomplete data |
| `/batches/settings` | Thresholds, current user, reset demo |

## Demonstration walkthrough

1. Open `/batches` → **Open demo deviation**, or go to `/batches/compare?focus=AMY-24-118`.
2. The four matched AMY-L3 v4.2 runs on ST-2000 fermenters are pre-selected; the 50 L pilot run, the v4.1 run and the batch still in exponential growth are flagged as not comparable, with reasons.
3. Dissolved oxygen in AMY-24-118 drops below the matched reference range around 31.75–35.75 h in fed-batch. The window is highlighted, and the pH and temperature charts below use the same time axis.
4. **Open investigation** takes you to INV-0007: evidence window, corresponding measurements, reference runs (editable), events, missing intervals, a simulated AI evidence summary, assignment, status and engineer notes.
5. Check `/batches/data-quality` and `XYN-24-041` / `PRT-24-017` for sensor gaps, a stale DO feed, missing samples and an unmatched recipe version.

## Project structure

```
src/
  types/            Strict domain types (Batch, MeasurementPoint, ProcessPhase, Investigation, …)
  data/             Simulated facility, recipes, fermenters, batches (deterministic generator), seed investigations
  config/           site.ts (company info, photos) · pricing.ts (plans, prices, limits — edit here)
  lib/
    comparison.ts   Comparability assessment, reference suggestion, phase alignment, reference envelope, deviation detection
    chart.ts        Chart transformations (aligned rows, bands, missing intervals, sparklines)
    dataQuality.ts  Completeness, staleness, metadata and reference checks
    evidence.ts     Template-based "simulated AI" evidence summary
  state/store.tsx   Workspace context with localStorage persistence
  components/       UI primitives, charts, marketing and dashboard components
  pages/            Marketing and dashboard routes (lazy-loaded)
```

## Design rules applied

- Every batch is compared against **its own matched reference set** (same process, recipe version, equipment group and phase coverage) — there is no universal golden batch.
- Missing readings are stored as `null` and drawn as line breaks with hatched intervals. They are **never zero-filled or interpolated**. When a comparison can't be computed, the UI says what is missing.
- Deviations are described as *differences from reference runs*. The app never labels a deviation as contamination, prescribes dosing or setpoint changes, or approves batches for release.

## What is simulated vs what needs external systems

| Capability | In this build | Would require |
| --- | --- | --- |
| Batches, measurements, samples, events, people | Deterministic simulated data (`src/data`) | Historian (OPC UA, OSIsoft PI, etc.), MES/batch records, LIMS |
| "AI-generated" evidence summary | Template driven by computed statistics, clearly labelled | An LLM or analytics service, with validation |
| Deviation screening | Rule-based: value outside the widened reference range for ≥ 1 h | Validated statistical models, tuned per process |
| Investigations, notes, assignment, settings | Browser `localStorage` | Backend database, audit trail, user accounts |
| Authentication / roles | "Acting as" selector only | SSO / identity provider |
| Contact form | Validated, saved to `localStorage`, nothing is sent | Email/CRM endpoint |
| Notifications, CSV/historian import | Not implemented | Integration services |

Photography is loaded from Unsplash; if an image fails, an inline fermenter illustration is shown instead.
