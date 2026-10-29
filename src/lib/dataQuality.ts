import type { AppSettings, Batch, Investigation, MeasurementKind, MissingInterval, TimeWindow } from '@/types';
import { isActive, lastReading, pointsInWindow } from './batch';
import { recipeById, fermenterById } from '@/data/facility';
import { assessComparability } from './comparison';
import type { ComparabilityResult } from '@/types';

const KINDS: MeasurementKind[] = ['temperature', 'ph', 'dissolvedOxygen'];

/** Share of expected readings that are present. Missing readings stay missing — they are never filled with zero. */
export function seriesCompleteness(batch: Batch, kind: MeasurementKind, window?: TimeWindow): number {
  const pts = window ? pointsInWindow(batch.series[kind].points, window) : batch.series[kind].points;
  if (!pts.length) return 0;
  return pts.filter((p) => p.value !== null).length / pts.length;
}

export function sampleCompleteness(batch: Batch) {
  const due = batch.samples.filter((s) => s.status !== 'pending');
  const complete = due.filter((s) => s.status === 'complete').length;
  return {
    ratio: due.length ? complete / due.length : 1,
    complete,
    missing: due.length - complete,
    pending: batch.samples.length - due.length,
  };
}

export function batchCompleteness(batch: Batch): number {
  const parts = KINDS.map((k) => seriesCompleteness(batch, k));
  parts.push(sampleCompleteness(batch).ratio);
  return parts.reduce((a, b) => a + b, 0) / parts.length;
}

export interface StaleMeasurement {
  batchId: string;
  kind: MeasurementKind;
  lastHour: number | null;
  hoursSince: number;
}

export function staleMeasurements(batch: Batch, thresholdHours: number): StaleMeasurement[] {
  if (!isActive(batch)) return [];
  return KINDS.flatMap((kind) => {
    const last = lastReading(batch, kind);
    const since = batch.elapsedHours - (last?.t ?? 0);
    return since > thresholdHours ? [{ batchId: batch.id, kind, lastHour: last?.t ?? null, hoursSince: since }] : [];
  });
}

export interface MetadataIssue {
  batchId: string;
  field: string;
  message: string;
}

export function metadataIssues(batch: Batch): MetadataIssue[] {
  const issues: MetadataIssue[] = [];
  if (!batch.recipeId || !recipeById(batch.recipeId)) {
    issues.push({ batchId: batch.id, field: 'Recipe version', message: `${batch.processCode} ${batch.recipeVersion} is not in the recipe registry, so phase plan and setpoints cannot be matched.` });
  }
  if (!fermenterById(batch.fermenterId)) {
    issues.push({ batchId: batch.id, field: 'Fermenter', message: `Fermenter ${batch.fermenterId} is not in the equipment registry.` });
  }
  return issues;
}

export interface IncompatibleReference {
  investigationId: string;
  batchId: string;
  result: ComparabilityResult;
}

export function incompatibleReferences(inv: Investigation, batches: Batch[], settings: AppSettings): IncompatibleReference[] {
  const focus = batches.find((b) => b.id === inv.batchId);
  if (!focus) return [];
  return inv.referenceBatchIds.flatMap((id) => {
    const ref = batches.find((b) => b.id === id);
    if (!ref) return [];
    const result = assessComparability(focus, ref, { phaseId: inv.phaseId, measurement: inv.measurement, window: inv.window }, settings);
    return result.level === 'compatible' ? [] : [{ investigationId: inv.id, batchId: id, result }];
  });
}

export function allMissingIntervals(batches: Batch[]): (MissingInterval & { batchId: string })[] {
  return batches.flatMap((b) => b.missingIntervals.map((m) => ({ ...m, batchId: b.id })));
}

export function missingInWindow(batch: Batch, w: TimeWindow): MissingInterval[] {
  return batch.missingIntervals.filter((m) => m.startHour < w.endHour && m.endHour > w.startHour);
}
