import type { Fermenter, ProcessPhase, ProcessPhaseId, Recipe, TeamMember } from '@/types';

/** Every record in this workspace is simulated for demonstration purposes. */
export const FACILITY = {
  name: 'Northfield Enzyme Works',
  site: 'Line 2 · Building C (fictional)',
  snapshotAt: '2026-10-26T14:00:00Z',
} as const;

export const team: TeamMember[] = [
  { id: 'u-ak', name: 'Amara Kalu', role: 'Process Engineer', initials: 'AK' },
  { id: 'u-jl', name: 'Jonas Lindqvist', role: 'Senior Fermentation Scientist', initials: 'JL' },
  { id: 'u-pr', name: 'Priya Raman', role: 'Data & Automation Engineer', initials: 'PR' },
  { id: 'u-tm', name: 'Tomás Medina', role: 'Production Supervisor', initials: 'TM' },
  { id: 'u-sh', name: 'Sun-hee Park', role: 'QC Analyst', initials: 'SP' },
];

export const fermenters: Fermenter[] = [
  { id: 'FV-201', name: 'Production fermenter 201', workingVolumeL: 2000, vesselType: 'Stirred tank', line: 'Line 2', compatibilityGroup: 'ST-2000', doProbe: 'Optical DO · OD-201A' },
  { id: 'FV-202', name: 'Production fermenter 202', workingVolumeL: 2000, vesselType: 'Stirred tank', line: 'Line 2', compatibilityGroup: 'ST-2000', doProbe: 'Optical DO · OD-202A' },
  { id: 'FV-301', name: 'Production fermenter 301', workingVolumeL: 10000, vesselType: 'Stirred tank', line: 'Line 3', compatibilityGroup: 'ST-10000', doProbe: 'Polarographic DO · PD-301B' },
  { id: 'PD-05', name: 'Pilot fermenter 05', workingVolumeL: 50, vesselType: 'Pilot stirred tank', line: 'Pilot bay', compatibilityGroup: 'PILOT-50', doProbe: 'Optical DO · OD-P05' },
];

const PHASE_LABELS: Record<ProcessPhaseId, string> = {
  inoculation: 'Inoculation',
  lag: 'Lag',
  exponential: 'Exponential growth',
  'fed-batch': 'Fed-batch production',
  stationary: 'Stationary',
  harvest: 'Harvest',
};

export const PHASE_ORDER: ProcessPhaseId[] = ['inoculation', 'lag', 'exponential', 'fed-batch', 'stationary', 'harvest'];

export function phaseLabel(id: ProcessPhaseId): string {
  return PHASE_LABELS[id];
}

export function makePhases(boundaries: [number, number, number, number, number, number, number]): ProcessPhase[] {
  return PHASE_ORDER.map((id, i) => ({
    id,
    label: PHASE_LABELS[id],
    startHour: boundaries[i]!,
    endHour: boundaries[i + 1]!,
  }));
}

export const recipes: Recipe[] = [
  {
    id: 'AMY-L3 v4.2',
    processCode: 'AMY-L3',
    version: 'v4.2',
    product: 'Alpha-amylase AMY-L3',
    organism: 'Bacillus licheniformis production strain (non-clinical)',
    setpoints: { temperatureC: 37.0, ph: 7.0, dissolvedOxygenMinPct: 35 },
    phases: makePhases([0, 2, 8, 24, 60, 68, 72]),
    plannedDurationHours: 72,
  },
  {
    id: 'AMY-L3 v4.1',
    processCode: 'AMY-L3',
    version: 'v4.1',
    product: 'Alpha-amylase AMY-L3',
    organism: 'Bacillus licheniformis production strain (non-clinical)',
    setpoints: { temperatureC: 37.0, ph: 7.0, dissolvedOxygenMinPct: 30 },
    phases: makePhases([0, 2, 8, 22, 58, 66, 70]),
    plannedDurationHours: 70,
  },
  {
    id: 'XYN-2 v1.3',
    processCode: 'XYN-2',
    version: 'v1.3',
    product: 'Endo-xylanase XYN-2',
    organism: 'Trichoderma reesei production strain (non-clinical)',
    setpoints: { temperatureC: 28.0, ph: 4.8, dissolvedOxygenMinPct: 30 },
    phases: makePhases([0, 3, 12, 32, 82, 92, 96]),
    plannedDurationHours: 96,
  },
  {
    id: 'PRT-B v1.4',
    processCode: 'PRT-B',
    version: 'v1.4',
    product: 'Alkaline protease PRT-B',
    organism: 'Bacillus subtilis production strain (non-clinical)',
    setpoints: { temperatureC: 34.0, ph: 7.2, dissolvedOxygenMinPct: 30 },
    phases: makePhases([0, 2, 6, 18, 40, 46, 48]),
    plannedDurationHours: 48,
  },
];

export const recipeById = (id: string | null) => (id ? recipes.find((r) => r.id === id) : undefined);
export const fermenterById = (id: string) => fermenters.find((f) => f.id === id);
export const memberById = (id: string | null) => (id ? team.find((m) => m.id === id) : undefined);
