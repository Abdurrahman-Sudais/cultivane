/**
 * Chart transformations: turn batch series into Recharts-ready rows.
 * Missing readings are emitted as `null` so lines break visibly — they are never zero-filled.
 */
import type { AlignmentMode, AppSettings, Batch, MeasurementKind, MissingReason, ProcessPhaseId } from '@/types';
import { alignmentShift, flagBand, gridKey, referenceEnvelope } from './comparison';

export type ChartValue = number | null | [number, number];
export interface ChartRow {
  t: number;
  [series: string]: ChartValue;
}

export const BAND_KEY = '__band';
export const FLAG_KEY = '__flag';
export const MEAN_KEY = '__mean';

export interface BuildRowsOptions {
  focus: Batch;
  batches: Batch[];
  kind: MeasurementKind;
  mode: AlignmentMode;
  phaseId: ProcessPhaseId;
  references?: Batch[];
  settings?: Pick<AppSettings, 'deviationSensitivity'>;
  /** Restrict to a range of focus-axis hours. */
  range?: [number, number];
}

/** Aligned multi-series rows on the focus batch's time axis, with optional reference band. */
export function buildRows(opts: BuildRowsOptions): ChartRow[] {
  const { focus, batches, kind, mode, phaseId, references, settings, range } = opts;
  const rows = new Map<number, ChartRow>();
  const get = (t: number) => {
    let r = rows.get(t);
    if (!r) {
      r = { t };
      rows.set(t, r);
    }
    return r;
  };

  for (const b of batches) {
    const shift = b.id === focus.id ? 0 : alignmentShift(focus, b, mode, phaseId);
    for (const p of b.series[kind].points) {
      const t = gridKey(p.t - shift);
      get(t)[b.id] = p.value;
    }
  }

  if (references && references.length >= 2) {
    const env = referenceEnvelope(focus, references, kind, mode, phaseId);
    for (const e of env.values()) {
      const r = get(e.t);
      r[BAND_KEY] = e.lower !== null && e.upper !== null ? [e.lower, e.upper] : null;
      r[MEAN_KEY] = e.mean;
      if (settings) r[FLAG_KEY] = flagBand(e, kind, settings.deviationSensitivity);
    }
  }

  // Ensure every row declares every batch key, so absent readings render as gaps.
  const all = [...rows.values()].sort((a, b) => a.t - b.t);
  for (const r of all) for (const b of batches) if (!(b.id in r)) r[b.id] = null;
  return range ? all.filter((r) => r.t >= range[0] && r.t <= range[1]) : all;
}

export interface Band {
  x1: number;
  x2: number;
  label: string;
}

export function phaseBands(batch: Batch, upTo?: number): (Band & { id: ProcessPhaseId })[] {
  return batch.phases
    .filter((p) => upTo === undefined || p.startHour < upTo)
    .map((p) => ({ id: p.id, x1: p.startHour, x2: upTo === undefined ? p.endHour : Math.min(p.endHour, upTo), label: p.label }));
}

export function missingBands(batch: Batch, kind: MeasurementKind, shift = 0): (Band & { reason: MissingReason; batchId: string })[] {
  return batch.missingIntervals
    .filter((m) => m.kind === kind)
    .map((m) => ({ x1: m.startHour - shift, x2: m.endHour - shift, label: `${batch.id}: no readings`, reason: m.reason, batchId: batch.id }));
}

/** Compact sparkline series (every Nth point) for overview cards. */
export function sparkline(batch: Batch, kind: MeasurementKind, every = 4): { t: number; v: number | null }[] {
  return batch.series[kind].points.filter((_, i) => i % every === 0).map((p) => ({ t: p.t, v: p.value }));
}

export function valueDomain(rows: ChartRow[], keys: string[], pad = 0.08): [number, number] | ['auto', 'auto'] {
  let min = Infinity;
  let max = -Infinity;
  for (const r of rows) {
    for (const k of keys) {
      const v = r[k];
      if (typeof v === 'number') {
        min = Math.min(min, v);
        max = Math.max(max, v);
      } else if (Array.isArray(v)) {
        min = Math.min(min, v[0]);
        max = Math.max(max, v[1]);
      }
    }
  }
  if (!Number.isFinite(min)) return ['auto', 'auto'];
  const span = max - min || 1;
  return [Number((min - span * pad).toFixed(3)), Number((max + span * pad).toFixed(3))];
}

export const SERIES_COLORS = ['#215a44', '#2c3f60', '#b8782a', '#7a4e8c', '#3e8780', '#8a5a44'];
