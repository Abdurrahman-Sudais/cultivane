/**
 * Simulated "AI-generated" evidence summary. This is a deterministic template driven by computed
 * evidence — no model is called. It deliberately avoids naming causes (e.g. contamination),
 * prescribing process changes, or making release decisions.
 */
import type { Batch, Investigation, MeasurementKind } from '@/types';
import { MEASUREMENTS, formatValue } from './format';
import { pointsInWindow, windowStats } from './batch';
import { alignmentShift } from './comparison';
import { missingInWindow, seriesCompleteness } from './dataQuality';
import { phaseLabel } from '@/data/facility';

export interface EvidenceItem {
  kind: MeasurementKind;
  focus: ReturnType<typeof windowStats>;
  reference: { min: number; max: number; mean: number } | null;
  completeness: number;
}

export interface EvidenceSummary {
  headline: string;
  observations: string[];
  checks: string[];
  items: EvidenceItem[];
  limitations: string[];
}

export function buildEvidence(inv: Investigation, focus: Batch, refs: Batch[]): EvidenceSummary {
  const kinds: MeasurementKind[] = ['dissolvedOxygen', 'ph', 'temperature'];
  const items: EvidenceItem[] = kinds.map((kind) => {
    const fStats = windowStats(pointsInWindow(focus.series[kind].points, inv.window));
    const refVals: number[] = [];
    for (const r of refs) {
      const s = alignmentShift(focus, r, 'phase', inv.phaseId);
      const st = windowStats(pointsInWindow(r.series[kind].points, { startHour: inv.window.startHour + s, endHour: inv.window.endHour + s }));
      if (st) refVals.push(st.mean);
    }
    const reference = refVals.length ? { min: Math.min(...refVals), max: Math.max(...refVals), mean: refVals.reduce((a, b) => a + b, 0) / refVals.length } : null;
    return { kind, focus: fStats, reference, completeness: seriesCompleteness(focus, kind, inv.window) };
  });

  const main = items.find((i) => i.kind === inv.measurement)!;
  const m = MEASUREMENTS[inv.measurement];
  const phase = phaseLabel(inv.phaseId).toLowerCase();
  const observations: string[] = [];
  const limitations: string[] = [];

  if (main.focus && main.reference) {
    const dir = main.focus.mean < main.reference.min ? 'below' : main.focus.mean > main.reference.max ? 'above' : 'within';
    observations.push(
      dir === 'within'
        ? `Mean ${m.label.toLowerCase()} in the window (${formatValue(inv.measurement, main.focus.mean)}) lies within the range of reference-run means (${formatValue(inv.measurement, main.reference.min)} – ${formatValue(inv.measurement, main.reference.max)}).`
        : `Mean ${m.label.toLowerCase()} in the window (${formatValue(inv.measurement, main.focus.mean)}) is ${dir} every reference-run mean (${formatValue(inv.measurement, main.reference.min)} – ${formatValue(inv.measurement, main.reference.max)}); the lowest reading was ${formatValue(inv.measurement, main.focus.min)}.`,
    );
  } else {
    limitations.push(`A ${m.label.toLowerCase()} comparison could not be computed: ${!main.focus ? 'the focus batch has no readings in this window' : 'no reference run has readings in the aligned window'}.`);
  }

  for (const it of items) {
    if (it.kind === inv.measurement || !it.focus || !it.reference) continue;
    const md = MEASUREMENTS[it.kind];
    const delta = it.focus.mean - it.reference.mean;
    observations.push(`${md.label} over the same interval averaged ${formatValue(it.kind, it.focus.mean)} vs ${formatValue(it.kind, it.reference.mean)} across references (Δ ${delta >= 0 ? '+' : ''}${delta.toFixed(md.precision)} ${it.kind === 'ph' ? '' : md.unit}).`.replace(' )', ')'));
  }

  const events = focus.events.filter((e) => e.hour >= inv.window.startHour - 1 && e.hour <= inv.window.endHour);
  if (events.length) observations.push(`${events.length} process event${events.length > 1 ? 's were' : ' was'} recorded in or just before the window (${events.map((e) => e.type.replace('-', ' ')).join(', ')}).`);

  for (const gap of missingInWindow(focus, inv.window)) {
    limitations.push(`${MEASUREMENTS[gap.kind].label} has no readings from ${gap.startHour} h to ${gap.endHour} h; this interval is excluded rather than estimated.`);
  }
  if (refs.length < 3) limitations.push(`Only ${refs.length} reference run${refs.length === 1 ? '' : 's'} selected — the reference band may not represent typical variation.`);
  for (const it of items) if (it.completeness < 0.9) limitations.push(`${MEASUREMENTS[it.kind].label} completeness in the window is ${(it.completeness * 100).toFixed(0)}%.`);

  return {
    headline: `The ${m.label.toLowerCase()} trend differs from the selected reference runs during the ${phase} phase. Review the associated temperature, pH, equipment records, and data completeness before drawing conclusions.`,
    observations,
    checks: [
      'Confirm sensor calibration and probe maintenance records for the window.',
      'Review operator notes, alarms and manual additions recorded around the interval.',
      'Check that the reference runs share recipe, equipment group and phase timing.',
      'Compare offline sampling results taken nearest to the window.',
    ],
    items,
    limitations,
  };
}
