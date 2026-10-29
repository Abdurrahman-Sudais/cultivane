/**
 * Comparison logic. Every batch is compared against its OWN matched reference set
 * (same process, recipe version, equipment group and phase coverage) — never against
 * a single universal "golden batch".
 */
import type {
  AlignmentMode,
  AppSettings,
  Batch,
  ComparabilityIssue,
  ComparabilityResult,
  DetectedDeviation,
  MeasurementKind,
  ProcessPhaseId,
  TimeWindow,
} from '@/types';
import { fermenterById, phaseLabel, recipeById } from '@/data/facility';
import { getPhase, phaseAtHour } from './batch';
import { seriesCompleteness } from './dataQuality';

export const GRID_STEP = 0.25;
export const gridKey = (t: number) => Math.round(t / GRID_STEP) * GRID_STEP;

export interface ComparisonContext {
  /** Phase of the focus batch being compared. */
  phaseId: ProcessPhaseId;
  measurement?: MeasurementKind;
  /** Window in focus-batch elapsed hours. Defaults to the focus phase span. */
  window?: TimeWindow;
}

/** Minimum spread of the reference band, so near-identical references don't produce a hair-trigger band. */
const MIN_SPREAD: Record<MeasurementKind, number> = { temperature: 0.15, ph: 0.03, dissolvedOxygen: 4 };

export function contextWindow(focus: Batch, ctx: ComparisonContext): TimeWindow {
  if (ctx.window) return ctx.window;
  const p = getPhase(focus, ctx.phaseId);
  const end = Math.min(p?.endHour ?? focus.elapsedHours, focus.elapsedHours);
  return { startHour: p?.startHour ?? 0, endHour: Math.max(end, p?.startHour ?? 0) };
}

/** Hours to subtract from a candidate's timeline so that it lines up with the focus batch. */
export function alignmentShift(focus: Batch, candidate: Batch, mode: AlignmentMode, phaseId: ProcessPhaseId): number {
  if (mode === 'elapsed') return 0;
  const fp = getPhase(focus, phaseId);
  const cp = getPhase(candidate, phaseId);
  if (!fp || !cp) return 0;
  return cp.startHour - fp.startHour;
}

export function assessComparability(
  focus: Batch,
  candidate: Batch,
  ctx: ComparisonContext,
  settings: Pick<AppSettings, 'completenessThreshold'>,
  mode: AlignmentMode = 'phase',
): ComparabilityResult {
  const issues: ComparabilityIssue[] = [];
  const add = (code: ComparabilityIssue['code'], severity: ComparabilityIssue['severity'], message: string) => issues.push({ code, severity, message });

  if (focus.processCode !== candidate.processCode) {
    add('process-mismatch', 'incompatible', `Different process: ${candidate.processCode} vs ${focus.processCode}.`);
  }

  if (!focus.recipeId || !candidate.recipeId) {
    const who = !candidate.recipeId ? candidate : focus;
    add('unmatched-metadata', 'incompatible', `${who.id}: recipe ${who.recipeVersion} is not in the registry, so setpoints and phase plan cannot be matched.`);
  } else if (focus.processCode === candidate.processCode && focus.recipeVersion !== candidate.recipeVersion) {
    const fr = recipeById(focus.recipeId);
    const cr = recipeById(candidate.recipeId);
    const diffs: string[] = [];
    if (fr && cr) {
      if (fr.setpoints.dissolvedOxygenMinPct !== cr.setpoints.dissolvedOxygenMinPct) diffs.push(`DO minimum ${cr.setpoints.dissolvedOxygenMinPct}% vs ${fr.setpoints.dissolvedOxygenMinPct}%`);
      if (fr.setpoints.temperatureC !== cr.setpoints.temperatureC) diffs.push(`temperature ${cr.setpoints.temperatureC} °C vs ${fr.setpoints.temperatureC} °C`);
      if (fr.setpoints.ph !== cr.setpoints.ph) diffs.push(`pH ${cr.setpoints.ph} vs ${fr.setpoints.ph}`);
      if (fr.plannedDurationHours !== cr.plannedDurationHours) diffs.push(`planned duration ${cr.plannedDurationHours} h vs ${fr.plannedDurationHours} h`);
    }
    add('recipe-mismatch', 'incompatible', `Recipe ${candidate.recipeVersion} differs from ${focus.recipeVersion}${diffs.length ? ` (${diffs.join('; ')})` : ''}.`);
  }

  const ff = fermenterById(focus.fermenterId);
  const cf = fermenterById(candidate.fermenterId);
  if (!ff || !cf) {
    add('unmatched-metadata', 'incompatible', `Equipment record missing for ${!cf ? candidate.fermenterId : focus.fermenterId}.`);
  } else if (ff.compatibilityGroup !== cf.compatibilityGroup) {
    add('equipment-mismatch', 'incompatible', `${cf.id} (${cf.workingVolumeL.toLocaleString()} L, ${cf.compatibilityGroup}) is not in the same equipment group as ${ff.id} (${ff.workingVolumeL.toLocaleString()} L, ${ff.compatibilityGroup}).`);
  }

  const window = contextWindow(focus, ctx);
  const shift = alignmentShift(focus, candidate, mode, ctx.phaseId);
  const candWindow = { startHour: window.startHour + shift, endHour: window.endHour + shift };
  const fp = getPhase(focus, ctx.phaseId);
  const cp = getPhase(candidate, ctx.phaseId);

  if (candidate.elapsedHours < candWindow.endHour) {
    const now = phaseAtHour(candidate, candidate.elapsedHours);
    add('phase-not-reached', 'incompatible', `${candidate.id} has only reached ${candidate.elapsedHours.toFixed(1)} h (${now.label}); the comparison window ends at ${candWindow.endHour.toFixed(1)} h in ${phaseLabel(ctx.phaseId)}.`);
  } else if (fp && cp) {
    const fd = fp.endHour - fp.startHour;
    const cd = cp.endHour - cp.startHour;
    if (Math.abs(fd - cd) / fd > 0.15) {
      add('phase-mismatch', 'caution', `${phaseLabel(ctx.phaseId)} lasted ${cd.toFixed(1)} h vs ${fd.toFixed(1)} h planned for the focus batch.`);
    }
    if (mode === 'elapsed' && Math.abs(cp.startHour - fp.startHour) >= 0.5) {
      add('phase-mismatch', 'caution', `${phaseLabel(ctx.phaseId)} started ${Math.abs(cp.startHour - fp.startHour).toFixed(2)} h ${cp.startHour > fp.startHour ? 'later' : 'earlier'} — consider phase alignment.`);
    }
  }

  if (ctx.measurement && candidate.elapsedHours >= candWindow.endHour) {
    const c = seriesCompleteness(candidate, ctx.measurement, candWindow);
    if (c < settings.completenessThreshold) {
      add('insufficient-data', 'caution', `Only ${(c * 100).toFixed(0)}% of expected readings are present in the aligned window (threshold ${(settings.completenessThreshold * 100).toFixed(0)}%).`);
    }
  }

  const level = issues.some((i) => i.severity === 'incompatible') ? 'incompatible' : issues.length ? 'caution' : 'compatible';
  return { batchId: candidate.id, level, issues };
}

/** Matched references for a specific focus batch and phase. Incompatible runs are excluded. */
export function suggestReferences(
  focus: Batch,
  all: Batch[],
  ctx: ComparisonContext,
  settings: Pick<AppSettings, 'completenessThreshold'>,
  mode: AlignmentMode = 'phase',
): ComparabilityResult[] {
  return all
    .filter((b) => b.id !== focus.id)
    .map((b) => assessComparability(focus, b, ctx, settings, mode))
    .filter((r) => r.level !== 'incompatible')
    .sort((a, b) => (a.level === b.level ? a.batchId.localeCompare(b.batchId) : a.level === 'compatible' ? -1 : 1));
}

export interface EnvelopePoint {
  t: number;
  mean: number | null;
  lower: number | null;
  upper: number | null;
  /** Number of references with a reading at this time. */
  n: number;
}

/** Per-timestep band of reference values, aligned onto the focus batch's time axis. Requires ≥ 2 readings. */
export function referenceEnvelope(focus: Batch, refs: Batch[], kind: MeasurementKind, mode: AlignmentMode, phaseId: ProcessPhaseId): Map<number, EnvelopePoint> {
  const buckets = new Map<number, number[]>();
  for (const ref of refs) {
    const shift = alignmentShift(focus, ref, mode, phaseId);
    for (const p of ref.series[kind].points) {
      if (p.value === null) continue;
      const key = gridKey(p.t - shift);
      const arr = buckets.get(key) ?? [];
      arr.push(p.value);
      buckets.set(key, arr);
    }
  }
  const out = new Map<number, EnvelopePoint>();
  for (const [t, vals] of buckets) {
    if (vals.length < 2) {
      out.set(t, { t, mean: null, lower: null, upper: null, n: vals.length });
      continue;
    }
    const mean = vals.reduce((a, b) => a + b, 0) / vals.length;
    out.set(t, { t, mean, lower: Math.min(...vals), upper: Math.max(...vals), n: vals.length });
  }
  return out;
}

/** Tolerance band used for flagging: reference range widened by sensitivity × spread. */
export function flagBand(env: EnvelopePoint, kind: MeasurementKind, sensitivity: number): [number, number] | null {
  if (env.mean === null || env.lower === null || env.upper === null) return null;
  const spread = Math.max((env.upper - env.lower) / 2, MIN_SPREAD[kind]);
  return [env.mean - sensitivity * spread * 1.5, env.mean + sensitivity * spread * 1.5];
}

/**
 * Finds sustained intervals where the focus batch sits outside the matched reference band.
 * This highlights a pattern for review; it does not infer a cause.
 */
export function detectDeviations(
  focus: Batch,
  refs: Batch[],
  kind: MeasurementKind,
  settings: Pick<AppSettings, 'deviationSensitivity'>,
  mode: AlignmentMode = 'phase',
  phaseId?: ProcessPhaseId,
  minPoints = 4,
): DetectedDeviation[] {
  if (refs.length < 2) return [];
  const pid = phaseId ?? phaseAtHour(focus, focus.elapsedHours).id;
  const env = referenceEnvelope(focus, refs, kind, mode, pid);
  const found: DetectedDeviation[] = [];
  let run: { start: number; end: number; max: number; dir: 'below' | 'above' } | null = null;

  const close = () => {
    if (run && Math.round((run.end - run.start) / GRID_STEP) + 1 >= minPoints) {
      found.push({
        batchId: focus.id,
        measurement: kind,
        window: { startHour: run.start, endHour: run.end + GRID_STEP },
        phaseId: phaseAtHour(focus, run.start).id,
        maxExcursion: run.max,
        direction: run.dir,
        referenceBatchIds: refs.map((r) => r.id),
      });
    }
    run = null;
  };

  for (const p of focus.series[kind].points) {
    const e = env.get(gridKey(p.t));
    const band = e ? flagBand(e, kind, settings.deviationSensitivity) : null;
    if (p.value === null || !band) {
      close();
      continue;
    }
    const dir = p.value < band[0] ? 'below' : p.value > band[1] ? 'above' : null;
    if (!dir) {
      close();
      continue;
    }
    const exc = dir === 'below' ? band[0] - p.value : p.value - band[1];
    if (run && run.dir === dir) {
      run.end = p.t;
      run.max = Math.max(run.max, exc);
    } else {
      close();
      run = { start: p.t, end: p.t, max: exc, dir };
    }
  }
  close();
  return found;
}
