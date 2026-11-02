import { describe, expect, it } from 'vitest';
import { ACTIONS, MEMBER_ROLE, can, roleOf } from '../access';
import { team } from '@/data/facility';

describe('demo roles', () => {
  it('gives the production manager every action and reviewers none', () => {
    for (const a of ACTIONS) {
      expect(can('manager', a)).toBe(true);
      expect(can('viewer', a)).toBe(false);
    }
  });
  it('keeps thresholds and the audit log with managers', () => {
    expect(can('engineer', 'settings')).toBe(false);
    expect(can('engineer', 'audit')).toBe(false);
    expect(can('analyst', 'status')).toBe(false);
    expect(can('analyst', 'note')).toBe(true);
  });
  it('assigns a role to every team member', () => {
    for (const m of team) expect(MEMBER_ROLE[m.id]).toBeDefined();
    expect(roleOf('nobody')).toBe('viewer');
  });
});
