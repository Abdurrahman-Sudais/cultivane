import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { AppSettings, Investigation, InvestigationStatus, MeasurementKind, ProcessPhaseId, TimeWindow } from '@/types';
import { seedInvestigations } from '@/data/investigations';
import { FACILITY, memberById } from '@/data/facility';
import { INVESTIGATION_STATUS_LABEL } from '@/lib/format';

const STORAGE_KEY = 'cultivane:workspace:v1';

export const DEFAULT_SETTINGS: AppSettings = {
  currentUserId: 'u-ak',
  stalenessThresholdHours: 1,
  completenessThreshold: 0.85,
  deviationSensitivity: 1,
  defaultAlignment: 'phase',
};

interface PersistedState {
  investigations: Investigation[];
  settings: AppSettings;
}

function load(): PersistedState {
  const fallback = { investigations: seedInvestigations, settings: DEFAULT_SETTINGS };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as Partial<PersistedState>;
    return {
      investigations: Array.isArray(parsed.investigations) ? parsed.investigations : seedInvestigations,
      settings: { ...DEFAULT_SETTINGS, ...(parsed.settings ?? {}) },
    };
  } catch {
    return fallback;
  }
}

/** Simulated "now": the workspace clock advances from the dataset snapshot by real time spent in the app. */
const sessionStart = Date.now();
export function workspaceNow(): string {
  return new Date(Date.parse(FACILITY.snapshotAt) + (Date.now() - sessionStart)).toISOString();
}

const uid = (p: string) => `${p}-${Math.random().toString(36).slice(2, 9)}`;

export interface NewInvestigationInput {
  batchId: string;
  title: string;
  measurement: MeasurementKind;
  window: TimeWindow;
  phaseId: ProcessPhaseId;
  referenceBatchIds: string[];
}

interface Store extends PersistedState {
  setStatus: (id: string, status: InvestigationStatus) => void;
  assign: (id: string, memberId: string | null) => void;
  addNote: (id: string, body: string) => void;
  setReferences: (id: string, refs: string[]) => void;
  createInvestigation: (input: NewInvestigationInput) => string;
  updateSettings: (patch: Partial<AppSettings>) => void;
  resetDemo: () => void;
}

const Ctx = createContext<Store | null>(null);

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<PersistedState>(load);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* storage unavailable (private mode) — the app keeps working in memory */
    }
  }, [state]);

  const mutate = useCallback((id: string, fn: (inv: Investigation, actor: string, now: string) => Investigation) => {
    setState((s) => {
      const now = workspaceNow();
      return {
        ...s,
        investigations: s.investigations.map((inv) => (inv.id === id ? { ...fn(inv, s.settings.currentUserId, now), updatedAt: now } : inv)),
      };
    });
  }, []);

  const store = useMemo<Store>(
    () => ({
      ...state,
      setStatus: (id, status) =>
        mutate(id, (inv, actor, now) =>
          inv.status === status ? inv : { ...inv, status, history: [...inv.history, { id: uid('h'), at: now, actorId: actor, action: `Status changed to ${INVESTIGATION_STATUS_LABEL[status].toLowerCase()}.` }] },
        ),
      assign: (id, memberId) =>
        mutate(id, (inv, actor, now) =>
          inv.assigneeId === memberId
            ? inv
            : { ...inv, assigneeId: memberId, history: [...inv.history, { id: uid('h'), at: now, actorId: actor, action: memberId ? `Assigned to ${memberById(memberId)?.name}.` : 'Unassigned.' }] },
        ),
      addNote: (id, body) =>
        mutate(id, (inv, actor, now) => ({
          ...inv,
          notes: [...inv.notes, { id: uid('n'), authorId: actor, createdAt: now, body }],
          history: [...inv.history, { id: uid('h'), at: now, actorId: actor, action: 'Added an engineer note.' }],
        })),
      setReferences: (id, refs) =>
        mutate(id, (inv, actor, now) => ({
          ...inv,
          referenceBatchIds: refs,
          history: [...inv.history, { id: uid('h'), at: now, actorId: actor, action: `Reference runs updated (${refs.length}).` }],
        })),
      createInvestigation: (input) => {
        const now = workspaceNow();
        const newId = nextInvestigationId(state.investigations);
        setState((s) => {
          const inv: Investigation = {
            ...input,
            id: newId,
            status: 'open',
            assigneeId: null,
            createdAt: now,
            updatedAt: now,
            notes: [],
            history: [{ id: uid('h'), at: now, actorId: s.settings.currentUserId, action: `Opened from batch comparison against ${input.referenceBatchIds.length} reference runs.` }],
          };
          return { ...s, investigations: [inv, ...s.investigations] };
        });
        return newId;
      },
      updateSettings: (patch) => setState((s) => ({ ...s, settings: { ...s.settings, ...patch } })),
      resetDemo: () => setState({ investigations: seedInvestigations, settings: DEFAULT_SETTINGS }),
    }),
    [state, mutate],
  );

  return <Ctx.Provider value={store}>{children}</Ctx.Provider>;
}

export function useWorkspace(): Store {
  const s = useContext(Ctx);
  if (!s) throw new Error('useWorkspace must be used inside <WorkspaceProvider>');
  return s;
}

/** Next investigation id, computed synchronously for navigation after creation. */
export function nextInvestigationId(invs: Investigation[]): string {
  const max = invs.reduce((m, i) => Math.max(m, Number(i.id.replace(/\D/g, '')) || 0), 0);
  return `INV-${String(max + 1).padStart(4, '0')}`;
}
