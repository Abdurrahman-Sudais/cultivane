import type { Investigation } from '@/types';
import { FACILITY } from './facility';

const at = (hoursBeforeSnapshot: number) => new Date(Date.parse(FACILITY.snapshotAt) - hoursBeforeSnapshot * 3600000).toISOString();

/** Simulated investigation history. User edits are persisted locally on top of this seed. */
export const seedInvestigations: Investigation[] = [
  {
    id: 'INV-0007',
    batchId: 'AMY-24-118',
    title: 'Dissolved-oxygen pattern differs from matched runs in fed-batch',
    measurement: 'dissolvedOxygen',
    window: { startHour: 30.5, endHour: 36.5 },
    phaseId: 'fed-batch',
    referenceBatchIds: ['AMY-24-109', 'AMY-24-112', 'AMY-24-115', 'AMY-24-106'],
    status: 'open',
    assigneeId: null,
    createdAt: at(1.5),
    updatedAt: at(1.5),
    notes: [],
    history: [{ id: 'h1', at: at(1.5), actorId: 'system', action: 'Flagged from comparison against 4 matched AMY-L3 v4.2 runs (ST-2000 group).' }],
  },
  {
    id: 'INV-0006',
    batchId: 'XYN-24-041',
    title: 'Temperature readings missing during fed-batch',
    measurement: 'temperature',
    window: { startHour: 40, endHour: 43.5 },
    phaseId: 'fed-batch',
    referenceBatchIds: ['XYN-24-038', 'XYN-24-035'],
    status: 'under-review',
    assigneeId: 'u-pr',
    createdAt: at(11),
    updatedAt: at(6),
    notes: [
      { id: 'n1', authorId: 'u-pr', createdAt: at(6), body: 'TT-301 transmitter reported a signal fault at 40.0 h. Backup thermocouple in jacket loop shows no step change — checking whether the jacket loop log can be imported for the gap.' },
    ],
    history: [
      { id: 'h1', at: at(11), actorId: 'system', action: 'Opened from data-quality check: 3.5 h temperature gap.' },
      { id: 'h2', at: at(9), actorId: 'u-tm', action: 'Assigned to Priya Raman.' },
      { id: 'h3', at: at(6), actorId: 'u-pr', action: 'Status changed to under review.' },
    ],
  },
  {
    id: 'INV-0005',
    batchId: 'AMY-24-115',
    title: 'DO sensor dropout late in fed-batch',
    measurement: 'dissolvedOxygen',
    window: { startHour: 44, endHour: 47.5 },
    phaseId: 'fed-batch',
    referenceBatchIds: ['AMY-24-109', 'AMY-24-112', 'AMY-24-106'],
    status: 'resolved',
    assigneeId: 'u-ak',
    createdAt: at(214),
    updatedAt: at(190),
    notes: [
      { id: 'n1', authorId: 'u-ak', createdAt: at(200), body: 'Optical DO cap on OD-201A replaced after the batch. Readings before and after the gap align with reference runs; gap left unfilled in the record.' },
      { id: 'n2', authorId: 'u-jl', createdAt: at(190), body: 'Agree — documenting as a data gap only. No process conclusions drawn for 44–47.5 h.' },
    ],
    history: [
      { id: 'h1', at: at(214), actorId: 'system', action: 'Opened from data-quality check.' },
      { id: 'h2', at: at(190), actorId: 'u-jl', action: 'Status changed to resolved.' },
    ],
  },
  {
    id: 'INV-0004',
    batchId: 'AMY-24-112',
    title: 'Brief pH rise around 51 h',
    measurement: 'ph',
    window: { startHour: 50, endHour: 53 },
    phaseId: 'fed-batch',
    referenceBatchIds: ['AMY-24-109', 'AMY-24-106', 'AMY-24-104'],
    status: 'resolved',
    assigneeId: 'u-jl',
    createdAt: at(380),
    updatedAt: at(350),
    notes: [{ id: 'n1', authorId: 'u-jl', createdAt: at(350), body: 'Coincides with base pump line change during shift handover. Recorded as an operational event.' }],
    history: [
      { id: 'h1', at: at(380), actorId: 'u-jl', action: 'Opened manually from batch detail.' },
      { id: 'h2', at: at(350), actorId: 'u-jl', action: 'Status changed to resolved.' },
    ],
  },
];
