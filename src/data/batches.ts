/**
 * SIMULATED DATASET — Northfield Enzyme Works (fictional).
 * Measurements are generated deterministically from simple phase-based process profiles.
 * They are illustrative only and do not represent any real organism, facility or product.
 */
import type {
  Batch,
  BatchStatus,
  MeasurementKind,
  MeasurementPoint,
  MissingInterval,
  ProcessEvent,
  ProcessPhase,
  ProcessPhaseId,
  Recipe,
  SamplingRecord,
  SensorSeries,
} from '@/types';
import { FACILITY, fermenterById, makePhases, recipeById, recipes } from './facility';
import { createRng, hashString } from '@/lib/random';

const STEP_H = 0.25; // 15-minute logging interval
const SNAPSHOT_MS = Date.parse(FACILITY.snapshotAt);

type Anomaly = (t: number, kind: MeasurementKind) => number;

interface BatchSpec {
  id: string;
  recipeId: string;
  /** Overrides the recipe reference when the batch record could not be matched to the registry. */
  unmatchedRecipeVersion?: string;
  fermenterId: string;
  status: BatchStatus;
  /** For completed batches: ISO start. For active batches, start is derived from elapsed hours. */
  start?: string;
  elapsedHours?: number;
  /** Shift in hours applied to phase boundaries (batch-to-batch timing variation). */
  phaseShift?: number;
  offsets?: Partial<Record<MeasurementKind, number>>;
  missing?: MissingInterval[];
  /** Readings after this hour for a given kind are absent (stale sensor feed). */
  staleAfter?: Partial<Record<MeasurementKind, number>>;
  anomaly?: Anomaly;
  missingSamples?: number[];
  extraEvents?: Omit<ProcessEvent, 'id'>[];
  notes?: string;
}

/** Smooth raised-cosine bump: 0 outside [a, b], 1 at the peak. */
function bump(t: number, a: number, peak: number, b: number) {
  if (t <= a || t >= b) return 0;
  if (t <= peak) return 0.5 - 0.5 * Math.cos((Math.PI * (t - a)) / (peak - a));
  return 0.5 + 0.5 * Math.cos((Math.PI * (t - peak)) / (b - peak));
}

function phaseAt(phases: ProcessPhase[], t: number): ProcessPhase {
  return phases.find((p) => t >= p.startHour && t < p.endHour) ?? phases[phases.length - 1]!;
}

function frac(p: ProcessPhase, t: number) {
  return Math.min(1, Math.max(0, (t - p.startHour) / (p.endHour - p.startHour)));
}

function baseValue(kind: MeasurementKind, recipe: Recipe, phases: ProcessPhase[], t: number): number {
  const p = phaseAt(phases, t);
  const s = frac(p, t);
  const sp = recipe.setpoints;
  switch (kind) {
    case 'temperature': {
      if (t < 1) return sp.temperatureC - 0.6 * (1 - t);
      if (p.id === 'harvest') return sp.temperatureC - 1.5 * s;
      return sp.temperatureC;
    }
    case 'ph': {
      const o = sp.ph - 7.0;
      const map: Record<ProcessPhaseId, number> = {
        inoculation: 7.0 - 0.01 * s,
        lag: 6.99 - 0.02 * s,
        exponential: s < 0.5 ? 6.97 - 0.1 * s : 6.92 + 0.01 * Math.sin(s * 9),
        'fed-batch': 6.95 + 0.015 * Math.sin(t * 1.3),
        stationary: 6.95 + 0.1 * s,
        harvest: 7.05,
      };
      return map[p.id] + o;
    }
    case 'dissolvedOxygen': {
      const target = sp.dissolvedOxygenMinPct + 5;
      const map: Record<ProcessPhaseId, number> = {
        inoculation: 98 - 4 * s,
        lag: 94 - 9 * s,
        exponential: 85 - (85 - (target + 2)) * Math.pow(s, 1.6),
        'fed-batch': target + 2.6 * Math.sin(t * 4.2) - (s < 0.08 ? 6 * bump(s, 0, 0.03, 0.08) : 0),
        stationary: target + (70 - target) * s,
        harvest: 70 + 14 * s,
      };
      return map[p.id];
    }
  }
}

const NOISE: Record<MeasurementKind, number> = { temperature: 0.04, ph: 0.008, dissolvedOxygen: 0.9 };
const UNITS = { temperature: '°C', ph: 'pH', dissolvedOxygen: '% air sat.' } as const;
const PRECISION: Record<MeasurementKind, number> = { temperature: 2, ph: 3, dissolvedOxygen: 1 };

function round(v: number, d: number) {
  const m = 10 ** d;
  return Math.round(v * m) / m;
}

function buildSeries(spec: BatchSpec, recipe: Recipe, phases: ProcessPhase[], endHour: number): Record<MeasurementKind, SensorSeries> {
  const rng = createRng(hashString(spec.id));
  const kinds: MeasurementKind[] = ['temperature', 'ph', 'dissolvedOxygen'];
  const fermenter = fermenterById(spec.fermenterId);
  const out = {} as Record<MeasurementKind, SensorSeries>;
  for (const kind of kinds) {
    const points: MeasurementPoint[] = [];
    const offset = spec.offsets?.[kind] ?? 0;
    for (let i = 0; i * STEP_H <= endHour + 1e-9; i++) {
      const t = round(i * STEP_H, 2);
      const missing = spec.missing?.some((m) => m.kind === kind && t >= m.startHour && t < m.endHour);
      const stale = spec.staleAfter?.[kind] !== undefined && t > spec.staleAfter[kind]!;
      if (missing || stale) {
        points.push({ t, value: null });
        continue;
      }
      let v = baseValue(kind, recipe, phases, t) + offset + rng.normal(0, NOISE[kind]);
      if (spec.anomaly) v += spec.anomaly(t, kind);
      if (kind === 'dissolvedOxygen') v = Math.min(100, Math.max(0, v));
      points.push({ t, value: round(v, PRECISION[kind]) });
    }
    out[kind] = {
      kind,
      unit: UNITS[kind],
      sensorId:
        kind === 'dissolvedOxygen'
          ? (fermenter?.doProbe.split('· ')[1] ?? 'DO-1')
          : `${kind === 'ph' ? 'PH' : 'TT'}-${spec.fermenterId.replace(/\D/g, '')}`,
      intervalMinutes: 15,
      points,
      lastCalibrated: new Date(SNAPSHOT_MS - (6 + (hashString(spec.id + kind) % 20)) * 86400000).toISOString(),
    };
  }
  return out;
}

function buildSamples(spec: BatchSpec, phases: ProcessPhase[], endHour: number, active: boolean): SamplingRecord[] {
  const rng = createRng(hashString(spec.id + 'samples'));
  const analysts = ['Sun-hee Park', 'Amara Kalu', 'Jonas Lindqvist'];
  const samples: SamplingRecord[] = [];
  const growthEnd = phases.find((p) => p.id === 'stationary')?.startHour ?? endHour;
  for (let h = 4; h <= endHour; h += 4) {
    const growth = 1 / (1 + Math.exp(-(h - growthEnd * 0.45) / (growthEnd * 0.12)));
    const pending = active && endHour - h < 4;
    const missing = spec.missingSamples?.includes(h) ?? false;
    const status = missing ? 'missing' : pending ? 'pending' : 'complete';
    const analyst = status === 'complete' ? analysts[Math.floor(rng.next() * analysts.length)]! : null;
    const val = (v: number, d: number) => (status === 'complete' ? round(v, d) : null);
    samples.push({ id: `${spec.id}-S${h}-OD`, hour: h, analyte: 'OD600', value: val(1 + 58 * growth + rng.normal(0, 0.8), 1), unit: 'AU', analyst, status });
    samples.push({ id: `${spec.id}-S${h}-GLC`, hour: h, analyte: 'Glucose', value: val(Math.max(0.2, 18 * (1 - growth) + rng.normal(1.2, 0.3)), 2), unit: 'g/L', analyst, status });
    if (h >= 16 && h % 8 === 0) {
      samples.push({ id: `${spec.id}-S${h}-ACT`, hour: h, analyte: 'Enzyme activity', value: val(Math.max(0, 1400 * Math.pow(growth, 1.8) + rng.normal(0, 30)), 0), unit: 'U/mL', analyst, status });
    }
  }
  return samples;
}

function buildEvents(spec: BatchSpec, phases: ProcessPhase[], endHour: number, completed: boolean): ProcessEvent[] {
  const ph = (id: ProcessPhaseId) => phases.find((p) => p.id === id)!;
  const evts: Omit<ProcessEvent, 'id'>[] = [
    { hour: 0, type: 'inoculation', description: 'Seed culture transferred; agitation 300 rpm, aeration 0.5 vvm.', recordedBy: 'Tomás Medina' },
    { hour: ph('exponential').startHour + 4, type: 'agitation-change', description: 'DO cascade engaged: agitation 300 → 450 rpm.', recordedBy: 'Control system' },
    { hour: ph('fed-batch').startHour, type: 'feed-start', description: 'Carbon feed started at 2.0 g/L/h (step 1).', recordedBy: 'Control system' },
    { hour: ph('fed-batch').startHour + 14, type: 'feed-change', description: 'Feed profile step 3: 3.2 g/L/h.', recordedBy: 'Control system' },
    { hour: ph('stationary').startHour, type: 'feed-change', description: 'Feed stopped per recipe.', recordedBy: 'Control system' },
    ...(spec.extraEvents ?? []),
  ];
  if (completed) {
    evts.push({ hour: ph('harvest').startHour, type: 'harvest', description: 'Cooling initiated; transfer to harvest tank scheduled.', recordedBy: 'Tomás Medina' });
  }
  return evts
    .filter((e) => e.hour <= endHour)
    .sort((a, b) => a.hour - b.hour)
    .map((e, i) => ({ ...e, id: `${spec.id}-E${String(i + 1).padStart(2, '0')}` }));
}

function buildBatch(spec: BatchSpec): Batch {
  const recipe = recipeById(spec.recipeId) ?? recipes[0]!;
  const shift = spec.phaseShift ?? 0;
  const b = recipe.phases.map((p) => p.startHour);
  b.push(recipe.plannedDurationHours);
  const shifted = b.map((h, i) => (i === 0 || i === b.length - 1 ? h : round(h + shift, 2))) as [number, number, number, number, number, number, number];
  const phases = makePhases(shifted);
  const completed = spec.status === 'completed';
  const endHour = completed ? recipe.plannedDurationHours : (spec.elapsedHours ?? 0);
  const startTime = completed ? spec.start! : new Date(SNAPSHOT_MS - endHour * 3600000).toISOString();
  const series = buildSeries(spec, recipe, phases, endHour);

  const missingIntervals: MissingInterval[] = [...(spec.missing ?? [])];
  for (const [kind, after] of Object.entries(spec.staleAfter ?? {}) as [MeasurementKind, number][]) {
    missingIntervals.push({ kind, startHour: after + STEP_H, endHour, reason: 'not-yet-received' });
  }

  return {
    id: spec.id,
    product: recipe.product,
    processCode: recipe.processCode,
    recipeVersion: spec.unmatchedRecipeVersion ?? recipe.version,
    recipeId: spec.unmatchedRecipeVersion ? null : recipe.id,
    fermenterId: spec.fermenterId,
    startTime,
    status: spec.status,
    elapsedHours: endHour,
    plannedDurationHours: recipe.plannedDurationHours,
    phases,
    series,
    missingIntervals,
    samples: buildSamples(spec, phases, endHour, !completed),
    events: buildEvents(spec, phases, endHour, completed),
    notes: spec.notes,
  };
}

/** The demonstration deviation: dissolved oxygen falls below matched reference runs mid fed-batch. */
const amy118Anomaly: Anomaly = (t, kind) => {
  const w = bump(t, 30.5, 33.25, 36.5);
  if (kind === 'dissolvedOxygen') return -21 * w;
  if (kind === 'ph') return -0.045 * w;
  return 0.22 * bump(t, 31, 34, 37);
};

const specs: BatchSpec[] = [
  {
    id: 'AMY-24-118',
    recipeId: 'AMY-L3 v4.2',
    fermenterId: 'FV-202',
    status: 'running',
    elapsedHours: 38,
    anomaly: amy118Anomaly,
    extraEvents: [
      { hour: 31.5, type: 'antifoam', description: 'Antifoam addition (manual, 150 mL) after foam alarm.', recordedBy: 'Amara Kalu' },
      { hour: 31.25, type: 'alarm', description: 'Foam level probe alarm (high).', recordedBy: 'Control system' },
      { hour: 33.0, type: 'agitation-change', description: 'Agitation raised 520 → 580 rpm by DO cascade (upper limit).', recordedBy: 'Control system' },
      { hour: 35.5, type: 'operator-note', description: 'Exhaust gas analyser reading noted as intermittent; maintenance ticket raised.', recordedBy: 'Tomás Medina' },
    ],
    missingSamples: [],
  },
  { id: 'AMY-24-120', recipeId: 'AMY-L3 v4.2', fermenterId: 'FV-201', status: 'running', elapsedHours: 14.5, phaseShift: 0.25, offsets: { dissolvedOxygen: 1.2 } },
  { id: 'AMY-24-115', recipeId: 'AMY-L3 v4.2', fermenterId: 'FV-201', status: 'completed', start: '2026-10-16T06:00:00Z', phaseShift: -0.5, offsets: { dissolvedOxygen: -1.5, ph: 0.01 }, missing: [{ kind: 'dissolvedOxygen', startHour: 44, endHour: 47.5, reason: 'sensor-dropout' }] },
  { id: 'AMY-24-112', recipeId: 'AMY-L3 v4.2', fermenterId: 'FV-202', status: 'completed', start: '2026-10-09T05:30:00Z', phaseShift: 0.5, offsets: { dissolvedOxygen: 1.8, temperature: 0.05 }, anomaly: (t, k) => (k === 'ph' ? 0.07 * bump(t, 50, 51.5, 53) : 0) },
  { id: 'AMY-24-109', recipeId: 'AMY-L3 v4.2', fermenterId: 'FV-202', status: 'completed', start: '2026-10-02T07:00:00Z', offsets: { dissolvedOxygen: -0.6, ph: -0.008 } },
  { id: 'AMY-24-106', recipeId: 'AMY-L3 v4.2', fermenterId: 'FV-201', status: 'completed', start: '2026-09-25T06:15:00Z', phaseShift: -0.25, offsets: { dissolvedOxygen: 0.7, temperature: -0.04 }, missing: [{ kind: 'ph', startHour: 12, endHour: 13, reason: 'probe-recalibration' }], extraEvents: [{ hour: 12, type: 'probe-recalibration', description: 'pH probe one-point check against offline sample.', recordedBy: 'Sun-hee Park' }] },
  { id: 'AMY-24-104', recipeId: 'AMY-L3 v4.1', fermenterId: 'FV-202', status: 'completed', start: '2026-09-18T08:00:00Z', offsets: { dissolvedOxygen: -0.5 }, notes: 'Last batch on recipe v4.1 before the DO setpoint change.' },
  { id: 'AMY-24-P07', recipeId: 'AMY-L3 v4.2', fermenterId: 'PD-05', status: 'completed', start: '2026-10-12T09:00:00Z', offsets: { dissolvedOxygen: 6, temperature: 0.08 }, notes: 'Pilot-scale confirmation run (50 L).' },
  {
    id: 'XYN-24-041',
    recipeId: 'XYN-2 v1.3',
    fermenterId: 'FV-301',
    status: 'running',
    elapsedHours: 52,
    phaseShift: 0.5,
    missing: [
      { kind: 'temperature', startHour: 40, endHour: 43.5, reason: 'sensor-dropout' },
      { kind: 'ph', startHour: 18, endHour: 19, reason: 'probe-recalibration' },
      { kind: 'dissolvedOxygen', startHour: 46.5, endHour: 47.25, reason: 'historian-gap' },
    ],
    missingSamples: [28, 36, 44],
    extraEvents: [
      { hour: 18, type: 'probe-recalibration', description: 'pH probe recalibrated (two-point).', recordedBy: 'Sun-hee Park' },
      { hour: 40, type: 'alarm', description: 'Temperature transmitter TT-301 signal fault.', recordedBy: 'Control system' },
    ],
  },
  { id: 'XYN-24-038', recipeId: 'XYN-2 v1.3', fermenterId: 'FV-301', status: 'completed', start: '2026-10-14T04:00:00Z', offsets: { dissolvedOxygen: 1.1 } },
  { id: 'XYN-24-035', recipeId: 'XYN-2 v1.3', fermenterId: 'FV-301', status: 'completed', start: '2026-09-30T04:00:00Z', phaseShift: -0.75, offsets: { dissolvedOxygen: -1.4, ph: 0.01 } },
  {
    id: 'PRT-24-017',
    recipeId: 'PRT-B v1.4',
    unmatchedRecipeVersion: 'v2.0-draft',
    fermenterId: 'PD-05',
    status: 'on-hold',
    elapsedHours: 20,
    staleAfter: { dissolvedOxygen: 15 },
    missingSamples: [12],
    notes: 'Batch held pending review of draft recipe parameters. DO feed from pilot historian interrupted.',
  },
];

export const batches: Batch[] = specs.map(buildBatch);

export const batchById = (id: string) => batches.find((b) => b.id === id);

export const DEMO_BATCH_ID = 'AMY-24-118';
export const DEMO_INVESTIGATION_ID = 'INV-0007';
