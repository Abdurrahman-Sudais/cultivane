/**
 * Core domain types for Cultivane.
 * Time inside a batch is expressed as elapsed process hours since inoculation (t = 0).
 */

export type ProcessPhaseId = 'inoculation' | 'lag' | 'exponential' | 'fed-batch' | 'stationary' | 'harvest';

export interface ProcessPhase {
  id: ProcessPhaseId;
  label: string;
  /** Elapsed hours since inoculation. */
  startHour: number;
  endHour: number;
}

export type MeasurementKind = 'temperature' | 'ph' | 'dissolvedOxygen';

export type MeasurementUnit = '°C' | 'pH' | '% air sat.';

export interface MeasurementPoint {
  /** Elapsed hours since inoculation. */
  t: number;
  /** `null` marks a missing reading. Missing values are never replaced with zero. */
  value: number | null;
}

export type MissingReason = 'sensor-dropout' | 'historian-gap' | 'probe-recalibration' | 'not-yet-received';

export interface MissingInterval {
  kind: MeasurementKind;
  startHour: number;
  endHour: number;
  reason: MissingReason;
}

export interface SensorSeries {
  kind: MeasurementKind;
  unit: MeasurementUnit;
  sensorId: string;
  /** Nominal logging interval in minutes. */
  intervalMinutes: number;
  points: MeasurementPoint[];
  lastCalibrated: string;
}

export type SampleStatus = 'complete' | 'pending' | 'missing';

export interface SamplingRecord {
  id: string;
  hour: number;
  analyte: 'OD600' | 'Glucose' | 'Enzyme activity' | 'Dry cell weight';
  value: number | null;
  unit: string;
  analyst: string | null;
  status: SampleStatus;
}

export type ProcessEventType =
  | 'inoculation'
  | 'feed-start'
  | 'feed-change'
  | 'agitation-change'
  | 'aeration-change'
  | 'antifoam'
  | 'probe-recalibration'
  | 'alarm'
  | 'operator-note'
  | 'harvest';

export interface ProcessEvent {
  id: string;
  hour: number;
  type: ProcessEventType;
  description: string;
  recordedBy: string;
}

export type BatchStatus = 'running' | 'completed' | 'on-hold' | 'aborted';

export interface Fermenter {
  id: string;
  name: string;
  workingVolumeL: number;
  vesselType: 'Stirred tank' | 'Pilot stirred tank';
  line: string;
  /** Equipment considered interchangeable for batch comparison. */
  compatibilityGroup: string;
  doProbe: string;
}

export interface RecipeSetpoints {
  temperatureC: number;
  ph: number;
  dissolvedOxygenMinPct: number;
}

export interface Recipe {
  /** e.g. "AMY-L3 v4.2" */
  id: string;
  processCode: string;
  version: string;
  product: string;
  organism: string;
  setpoints: RecipeSetpoints;
  phases: ProcessPhase[];
  plannedDurationHours: number;
}

export interface Batch {
  id: string;
  product: string;
  processCode: string;
  recipeVersion: string;
  /** Recipe registry key. `null` when the recipe could not be matched in the registry. */
  recipeId: string | null;
  fermenterId: string;
  startTime: string;
  status: BatchStatus;
  elapsedHours: number;
  plannedDurationHours: number;
  phases: ProcessPhase[];
  series: Record<MeasurementKind, SensorSeries>;
  missingIntervals: MissingInterval[];
  samples: SamplingRecord[];
  events: ProcessEvent[];
  notes?: string;
}

export type InvestigationStatus = 'open' | 'under-review' | 'resolved';

export interface TimeWindow {
  startHour: number;
  endHour: number;
}

export interface InvestigationNote {
  id: string;
  authorId: string;
  createdAt: string;
  body: string;
}

export interface InvestigationHistoryEntry {
  id: string;
  at: string;
  actorId: string;
  action: string;
}

export interface Investigation {
  id: string;
  batchId: string;
  title: string;
  measurement: MeasurementKind;
  window: TimeWindow;
  phaseId: ProcessPhaseId;
  referenceBatchIds: string[];
  status: InvestigationStatus;
  assigneeId: string | null;
  createdAt: string;
  updatedAt: string;
  notes: InvestigationNote[];
  history: InvestigationHistoryEntry[];
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  initials: string;
}

export type AlignmentMode = 'elapsed' | 'phase';

export interface AppSettings {
  currentUserId: string;
  /** Hours since last reading before a running sensor is flagged as outdated. */
  stalenessThresholdHours: number;
  /** Minimum share (0–1) of expected readings required in a window for reliable comparison. */
  completenessThreshold: number;
  /** Multiplier on the reference band width used to flag unusual patterns. */
  deviationSensitivity: number;
  defaultAlignment: AlignmentMode;
}

export type ComparabilityLevel = 'compatible' | 'caution' | 'incompatible';

export type ComparabilityIssueCode =
  | 'recipe-mismatch'
  | 'process-mismatch'
  | 'equipment-mismatch'
  | 'phase-not-reached'
  | 'phase-mismatch'
  | 'insufficient-data'
  | 'unmatched-metadata';

export interface ComparabilityIssue {
  code: ComparabilityIssueCode;
  severity: 'caution' | 'incompatible';
  message: string;
}

export interface ComparabilityResult {
  batchId: string;
  level: ComparabilityLevel;
  issues: ComparabilityIssue[];
}

export interface DetectedDeviation {
  batchId: string;
  measurement: MeasurementKind;
  window: TimeWindow;
  phaseId: ProcessPhaseId | null;
  /** Largest distance outside the reference band, in measurement units. */
  maxExcursion: number;
  direction: 'below' | 'above';
  referenceBatchIds: string[];
}
