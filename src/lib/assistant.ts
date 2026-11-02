/**
 * Simulated, record-grounded assistant for the demo workspace.
 * Routes a question to a small set of intents and answers only from the current batches, investigations and
 * data-quality checks, listing the records it used. It refuses questions the data cannot support or that belong
 * to engineers and quality (causes, dosing or setpoint changes, release decisions, yield forecasts).
 * No model or external API is called.
 */
import type { AppSettings, Batch, Investigation } from '@/types';
import { currentPhase, isActive } from '@/lib/batch';
import { batchCompleteness, metadataIssues, staleMeasurements } from '@/lib/dataQuality';
import { INVESTIGATION_STATUS_LABEL, MEASUREMENTS, STATUS_LABEL, formatPct } from '@/lib/format';
import { memberById, phaseLabel } from '@/data/facility';

export interface AssistantContext {
  batches: Batch[];
  investigations: Investigation[];
  settings: AppSettings;
}

export interface AssistantAnswer {
  kind: 'answer' | 'refusal' | 'help';
  title: string;
  lines: string[];
  sources: string[];
  links: { label: string; to: string }[];
}

export const EXAMPLE_QUESTIONS = [
  'Which investigations need attention?',
  'Which batches have data problems?',
  'What happened to AMY-24-118?',
  'Which batches are running?',
  'Is AMY-24-118 contaminated?',
] as const;

const REFUSAL_RE = /\b(contaminat\w*|cause[sd]?|why did|diagnos\w*|dos(e|ing)|setpoint|should (we|i) (change|add|increase|decrease)|releas\w*|approv\w*|pass qc|yield forecast|predict\w*|forecast\w*|will it fail|when will)\b/i;

const REFUSAL: AssistantAnswer = {
  kind: 'refusal',
  title: 'That’s a decision for your engineers and quality team',
  lines: [
    'Cultivane describes how a batch differs from its matched reference runs. It does not identify causes such as contamination, recommend dosing or setpoint changes, forecast yield, or approve batches for release.',
    'I can show the evidence: which measurement differs, over which window and phase, against which reference runs, and where data is missing.',
  ],
  sources: [],
  links: [{ label: 'Open the investigations list', to: '/batches/investigations' }],
};

const assignee = (i: Investigation) => memberById(i.assigneeId)?.name ?? 'unassigned';

function batchSummary(b: Batch, c: AssistantContext): AssistantAnswer {
  const invs = c.investigations.filter((i) => i.batchId === b.id);
  const stale = staleMeasurements(b, c.settings.stalenessThresholdHours);
  const meta = metadataIssues(b);
  const lines = [
    `${b.product} · ${b.processCode} ${b.recipeVersion} on ${b.fermenterId}. Status: ${STATUS_LABEL[b.status].toLowerCase()}, ${b.elapsedHours.toFixed(1)} h elapsed${isActive(b) ? `, currently in ${currentPhase(b).label.toLowerCase()}` : ''}.`,
    `Data completeness ${formatPct(batchCompleteness(b))}${b.missingIntervals.length ? ` with ${b.missingIntervals.length} missing interval${b.missingIntervals.length > 1 ? 's' : ''}` : ''}.`,
    ...stale.map((s) => `${MEASUREMENTS[s.kind].label} has not reported for ${s.hoursSince.toFixed(1)} h, so it is not shown as current.`),
    ...meta.map((m) => m.message),
    ...(invs.length
      ? invs.map((i) => `${i.id}: ${i.title} (${phaseLabel(i.phaseId).toLowerCase()}, ${i.window.startHour}–${i.window.endHour} h). ${INVESTIGATION_STATUS_LABEL[i.status]}, ${assignee(i)}.`)
      : ['No investigations are recorded against this batch.']),
  ];
  return {
    kind: 'answer',
    title: `${b.id} at a glance`,
    lines,
    sources: [b.id, ...invs.map((i) => i.id)],
    links: [{ label: `Open ${b.id}`, to: `/batches/b/${b.id}` }, ...invs.slice(0, 2).map((i) => ({ label: `Open ${i.id}`, to: `/batches/investigations/${i.id}` }))],
  };
}

function attention(c: AssistantContext): AssistantAnswer {
  const open = c.investigations.filter((i) => i.status !== 'resolved');
  if (!open.length) return { kind: 'answer', title: 'No open investigations', lines: ['Every investigation in this workspace is resolved.'], sources: [], links: [] };
  const unassigned = open.filter((i) => !i.assigneeId);
  return {
    kind: 'answer',
    title: `${open.length} investigation${open.length > 1 ? 's' : ''} still open`,
    lines: [
      ...open.map((i) => `${i.id} on ${i.batchId}: ${i.title}. ${INVESTIGATION_STATUS_LABEL[i.status]}, ${assignee(i)}.`),
      ...(unassigned.length ? [`${unassigned.map((i) => i.id).join(', ')} ${unassigned.length > 1 ? 'have' : 'has'} no owner yet.`] : []),
    ],
    sources: open.map((i) => i.id),
    links: open.slice(0, 3).map((i) => ({ label: `Open ${i.id}`, to: `/batches/investigations/${i.id}` })),
  };
}

function dataProblems(c: AssistantContext): AssistantAnswer {
  const rows = c.batches
    .map((b) => ({ b, comp: batchCompleteness(b), stale: staleMeasurements(b, c.settings.stalenessThresholdHours), meta: metadataIssues(b) }))
    .filter((r) => r.comp < c.settings.completenessThreshold || r.stale.length || r.meta.length);
  if (!rows.length) return { kind: 'answer', title: 'No data problems found', lines: ['Every batch meets the completeness threshold and all running feeds are current.'], sources: [], links: [] };
  return {
    kind: 'answer',
    title: `${rows.length} batch${rows.length > 1 ? 'es have' : ' has'} data problems`,
    lines: rows.map(
      (r) =>
        `${r.b.id}: ${[
          r.comp < c.settings.completenessThreshold ? `completeness ${formatPct(r.comp)} (threshold ${formatPct(c.settings.completenessThreshold)})` : '',
          ...r.stale.map((s) => `${MEASUREMENTS[s.kind].short} outdated ${s.hoursSince.toFixed(1)} h`),
          ...r.meta.map((m) => `${m.field.toLowerCase()} not matched`),
        ]
          .filter(Boolean)
          .join('; ')}.`,
    ),
    sources: rows.map((r) => r.b.id),
    links: [{ label: 'Open data quality', to: '/batches/data-quality' }],
  };
}

function running(c: AssistantContext): AssistantAnswer {
  const live = c.batches.filter(isActive);
  return {
    kind: 'answer',
    title: `${live.length} batch${live.length === 1 ? ' is' : 'es are'} running`,
    lines: live.map((b) => `${b.id} (${b.processCode} ${b.recipeVersion}, ${b.fermenterId}): ${b.elapsedHours.toFixed(1)} of ${b.plannedDurationHours} h, ${currentPhase(b).label.toLowerCase()}.`),
    sources: live.map((b) => b.id),
    links: live.slice(0, 3).map((b) => ({ label: `Open ${b.id}`, to: `/batches/b/${b.id}` })),
  };
}

const HELP: AssistantAnswer = {
  kind: 'help',
  title: 'What I can answer',
  lines: [
    'Ask about a batch by ID (for example “AMY-24-118”), which investigations need attention, which batches have data problems, or which batches are running.',
    'I answer from the records in this workspace and list the ones I used.',
  ],
  sources: [],
  links: [],
};

export function answer(question: string, c: AssistantContext): AssistantAnswer {
  const q = question.trim();
  if (!q) return HELP;
  if (REFUSAL_RE.test(q)) return REFUSAL;
  const id = q.toUpperCase().match(/\b[A-Z]{3}-\d{2}-[A-Z0-9]{3}\b/)?.[0];
  if (id) {
    const b = c.batches.find((x) => x.id === id);
    return b ? batchSummary(b, c) : { kind: 'answer', title: `No batch called ${id}`, lines: ['That ID is not in this workspace. Try the batch list.'], sources: [], links: [{ label: 'Open the batch list', to: '/batches/list' }] };
  }
  if (/\b(data|missing|gap|stale|outdated|incomplete|quality|sensor)\b/i.test(q)) return dataProblems(c);
  if (/\b(running|active|live|in progress|current batch)/i.test(q)) return running(c);
  if (/\b(attention|investigation|open|review|deviation|flag|unassigned)/i.test(q)) return attention(c);
  return HELP;
}
