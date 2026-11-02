import { memberById, team } from '@/data/facility';

/** Demo roles. In production these are identity-provider groups, checked again on the server. */
export type DemoRole = 'manager' | 'engineer' | 'analyst' | 'viewer';

export type Action = 'assign' | 'note' | 'status' | 'references' | 'create' | 'settings' | 'audit';

export const ROLE_LABEL: Record<DemoRole, string> = {
  manager: 'Production manager',
  engineer: 'Process engineer',
  analyst: 'Data analyst',
  viewer: 'Reviewer (read only)',
};

export const ACTION_LABEL: Record<Action, string> = {
  assign: 'Assign investigations',
  note: 'Add engineer notes',
  status: 'Change investigation status',
  references: 'Edit reference runs',
  create: 'Open investigations',
  settings: 'Change analysis thresholds',
  audit: 'Read and export the audit log',
};

export const ACTIONS = Object.keys(ACTION_LABEL) as Action[];

const MATRIX: Record<DemoRole, Action[]> = {
  manager: ACTIONS,
  engineer: ['assign', 'note', 'status', 'references', 'create'],
  analyst: ['note', 'create'],
  viewer: [],
};

/** Which demo role each team member plays. */
export const MEMBER_ROLE: Record<string, DemoRole> = {
  'u-tm': 'manager',
  'u-ak': 'engineer',
  'u-jl': 'engineer',
  'u-pr': 'analyst',
  'u-sh': 'viewer',
};

export const roleOf = (memberId: string): DemoRole => MEMBER_ROLE[memberId] ?? 'viewer';

export function can(role: DemoRole, action: Action): boolean {
  return MATRIX[role].includes(action);
}

export interface AuditEntry {
  id: string;
  at: string;
  actorId: string;
  action: Action | 'reset';
  detail: string;
}

export const actorName = (id: string) => (id === 'system' ? 'System' : (memberById(id)?.name ?? id));

export const DEMO_PEOPLE = team.map((m) => ({ ...m, demoRole: roleOf(m.id) }));
