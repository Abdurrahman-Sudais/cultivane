import type { Batch, MeasurementKind, MeasurementPoint, ProcessPhase, ProcessPhaseId, TimeWindow } from '@/types';

export function phaseAtHour(batch: Batch, t: number): ProcessPhase {
  return batch.phases.find((p) => t >= p.startHour && t < p.endHour) ?? batch.phases[batch.phases.length - 1]!;
}

export function currentPhase(batch: Batch): ProcessPhase {
  if (batch.status === 'completed') return batch.phases[batch.phases.length - 1]!;
  return phaseAtHour(batch, batch.elapsedHours);
}

export function getPhase(batch: Batch, id: ProcessPhaseId): ProcessPhase | undefined {
  return batch.phases.find((p) => p.id === id);
}

export function isActive(batch: Batch): boolean {
  return batch.status === 'running' || batch.status === 'on-hold';
}

/** Share of the planned process duration that has elapsed (0–1). */
export function progress(batch: Batch): number {
  return Math.min(1, batch.elapsedHours / batch.plannedDurationHours);
}

export function pointsInWindow(points: MeasurementPoint[], w: TimeWindow): MeasurementPoint[] {
  return points.filter((p) => p.t >= w.startHour && p.t <= w.endHour);
}

export function lastReading(batch: Batch, kind: MeasurementKind): MeasurementPoint | undefined {
  const pts = batch.series[kind].points;
  for (let i = pts.length - 1; i >= 0; i--) {
    if (pts[i]!.value !== null) return pts[i];
  }
  return undefined;
}

export function windowStats(points: MeasurementPoint[]) {
  const vals = points.map((p) => p.value).filter((v): v is number => v !== null);
  if (!vals.length) return null;
  const mean = vals.reduce((a, b) => a + b, 0) / vals.length;
  return { min: Math.min(...vals), max: Math.max(...vals), mean, n: vals.length, expected: points.length };
}
