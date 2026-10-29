import type { BatchStatus, InvestigationStatus, MeasurementKind, MissingReason } from '@/types';

export const MEASUREMENTS: Record<MeasurementKind, { label: string; short: string; unit: string; precision: number }> = {
  temperature: { label: 'Temperature', short: 'Temp', unit: '°C', precision: 2 },
  ph: { label: 'pH', short: 'pH', unit: 'pH', precision: 2 },
  dissolvedOxygen: { label: 'Dissolved oxygen', short: 'DO', unit: '% air sat.', precision: 1 },
};

export const MEASUREMENT_KINDS: MeasurementKind[] = ['dissolvedOxygen', 'ph', 'temperature'];

export function formatValue(kind: MeasurementKind, v: number | null | undefined, withUnit = true): string {
  if (v === null || v === undefined || Number.isNaN(v)) return 'No reading';
  const m = MEASUREMENTS[kind];
  const n = v.toFixed(m.precision);
  if (!withUnit) return n;
  return kind === 'ph' ? `pH ${n}` : `${n} ${m.unit}`;
}

export function formatHour(h: number): string {
  return `${h.toFixed(h % 1 === 0 ? 0 : 2).replace(/0$/, '')} h`;
}

export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', timeZone: 'UTC' }) + ' UTC';
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC' });
}

export function formatPct(v: number, digits = 0): string {
  return `${(v * 100).toFixed(digits)}%`;
}

export const STATUS_LABEL: Record<BatchStatus, string> = {
  running: 'Running',
  completed: 'Completed',
  'on-hold': 'On hold',
  aborted: 'Aborted',
};

export const INVESTIGATION_STATUS_LABEL: Record<InvestigationStatus, string> = {
  open: 'Open',
  'under-review': 'Under review',
  resolved: 'Resolved',
};

export const MISSING_REASON_LABEL: Record<MissingReason, string> = {
  'sensor-dropout': 'Sensor dropout',
  'historian-gap': 'Historian gap',
  'probe-recalibration': 'Probe recalibration',
  'not-yet-received': 'Not received (stale feed)',
};

export function relativeTime(iso: string, nowIso: string): string {
  const diffH = (Date.parse(nowIso) - Date.parse(iso)) / 3600000;
  if (diffH < 1) return `${Math.max(1, Math.round(diffH * 60))} min ago`;
  if (diffH < 48) return `${Math.round(diffH)} h ago`;
  return `${Math.round(diffH / 24)} days ago`;
}
