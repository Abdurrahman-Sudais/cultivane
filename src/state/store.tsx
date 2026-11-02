import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { AppSettings, Investigation, InvestigationStatus, MeasurementKind, ProcessPhaseId, TimeWindow } from '@/types';
import { seedInvestigations } from '@/data/investigations';
import { FACILITY, memberById } from '@/data/facility';
import { INVESTIGATION_STATUS_LABEL } from '@/lib/format';
import { can as roleCan, roleOf, type Action, type AuditEntry, type DemoRole } from '@/lib/access';

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
  /** Changes made in this browser. Seed history is derived from the investigations. */
  audit: AuditEntry[];
}

function load(): PersistedState {
  const fallback = { investigations: seedInvestigations, settings: DEFAULT_SETTINGS, audit: [] };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as Partial<PersistedState>;
    return {
      investigations: Array.isArray(parsed.investigations) ? parsed.investigations : seedInvestigations,
      settings: { ...DEFAULT_SETTINGS, ...(parsed.settings ?? {}) },
      audit: Array.isArray(parsed.audit) ? parsed.audit : [],
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
  role: DemoRole;
  /** Whether the acting user may perform an action. Every mutation below checks this first. */
  can: (action: Action) => boolean;
  /** Seeded history plus changes made in this browser, oldest first. */
  auditLog: AuditEntry[];
  setStatus: (id: string, status: InvestigationStatus) => boolean;
  assign: (id: string, memberId: string | null) => boolean;
  addNote: (id: string, body: string) => boolean;
  setReferences: (id: string, refs: string[]) => boolean;
  /** Returns the new id, or null when the acting user may not open investigations. */
  createInvestigation: (input: NewInvestigationInput) => string | null;
  /** Switching the acting user is always allowed; threshold changes need the settings permission. */
  updateSettings: (patch: Partial<AppSettings>) => boolean;
  resetDemo: () => void;
}

const SEED_AUDIT: AuditEntry[] = seedInvestigations
  .flatMap((inv) =>
    inv.history
      .filter((h) => h.actorId !== 'system')
      .map((h) => ({ id: `seed-${inv.id}-${h.id}`, at: h.at, actorId: h.actorId, action: (/assign/i.test(h.action) ? 'assign' : /status/i.test(h.action) ? 'status' : /note/i.test(h.action) ? 'note' : 'references') as Action, detail: `${inv.id}: ${h.action}` })),
  )
  .sort((a, b) => a.at.localeCompare(b.at));

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

  const role = roleOf(state.settings.currentUserId);
  const allowed = useCallback((action: Action) => roleCan(role, action), [role]);

  const mutate = useCallback(
    (id: string, action: Action, detail: string, fn: (inv: Investigation, actor: string, now: string) => Investigation): boolean => {
      if (!allowed(action)) return false;
      setState((s) => {
        const now = workspaceNow();
        const actor = s.settings.currentUserId;
        return {
          ...s,
          investigations: s.investigations.map((inv) => (inv.id === id ? { ...fn(inv, actor, now), updatedAt: now } : inv)),
          audit: [...s.audit, { id: uid('a'), at: now, actorId: actor, action, detail: `${id}: ${detail}` }],
        };
      });
      return true;
    },
    [allowed],
  );

  const store = useMemo<Store>(
    () => ({
      ...state,
      role,
      can: allowed,
      auditLog: [...SEED_AUDIT, ...state.audit],
      setStatus: (id, status) =>
        mutate(id, 'status', `Status changed to ${INVESTIGATION_STATUS_LABEL[status].toLowerCase()}.`, (inv, actor, now) =>
          inv.status === status ? inv : { ...inv, status, history: [...inv.history, { id: uid('h'), at: now, actorId: actor, action: `Status changed to ${INVESTIGATION_STATUS_LABEL[status].toLowerCase()}.` }] },
        ),
      assign: (id, memberId) =>
        mutate(id, 'assign', memberId ? `Assigned to ${memberById(memberId)?.name}.` : 'Unassigned.', (inv, actor, now) =>
          inv.assigneeId === memberId
            ? inv
            : { ...inv, assigneeId: memberId, history: [...inv.history, { id: uid('h'), at: now, actorId: actor, action: memberId ? `Assigned to ${memberById(memberId)?.name}.` : 'Unassigned.' }] },
        ),
      addNote: (id, body) =>
        mutate(id, 'note', 'Added an engineer note.', (inv, actor, now) => ({
          ...inv,
          notes: [...inv.notes, { id: uid('n'), authorId: actor, createdAt: now, body }],
          history: [...inv.history, { id: uid('h'), at: now, actorId: actor, action: 'Added an engineer note.' }],
        })),
      setReferences: (id, refs) =>
        mutate(id, 'references', `Reference runs updated (${refs.length}).`, (inv, actor, now) => ({
          ...inv,
          referenceBatchIds: refs,
          history: [...inv.history, { id: uid('h'), at: now, actorId: actor, action: `Reference runs updated (${refs.length}).` }],
        })),
      createInvestigation: (input) => {
        if (!allowed('create')) return null;
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
          return {
            ...s,
            investigations: [inv, ...s.investigations],
            audit: [...s.audit, { id: uid('a'), at: now, actorId: s.settings.currentUserId, action: 'create', detail: `${newId}: Opened for ${input.batchId}.` }],
          };
        });
        return newId;
      },
      updateSettings: (patch) => {
        const thresholdKeys = (Object.keys(patch) as (keyof AppSettings)[]).filter((k) => k !== 'currentUserId' && patch[k] !== state.settings[k]);
        if (thresholdKeys.length && !allowed('settings')) return false;
        setState((s) => {
          const now = workspaceNow();
          const actor = s.settings.currentUserId;
          const detail = `Changed ${thresholdKeys.join(', ')}.`;
          const last = s.audit[s.audit.length - 1];
          // Consecutive slider moves by the same person on the same settings collapse into one entry.
          const audit = !thresholdKeys.length
            ? s.audit
            : last && last.action === 'settings' && last.actorId === actor && last.detail === detail
              ? [...s.audit.slice(0, -1), { ...last, at: now }]
              : [...s.audit, { id: uid('a'), at: now, actorId: actor, action: 'settings' as const, detail }];
          return { ...s, settings: { ...s.settings, ...patch }, audit };
        });
        return true;
      },
      // Reset only clears this browser's demo data, so anyone may do it. The acting user is kept.
      resetDemo: () => setState((s) => ({ investigations: seedInvestigations, settings: { ...DEFAULT_SETTINGS, currentUserId: s.settings.currentUserId }, audit: [] })),
    }),
    [state, mutate, role, allowed],
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
