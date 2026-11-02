import { describe, expect, it } from 'vitest';
import { batches } from '@/data/batches';
import { seedInvestigations } from '@/data/investigations';
import { DEFAULT_SETTINGS } from '@/state/store';
import { EXAMPLE_QUESTIONS, answer } from '../assistant';

const c = { batches, investigations: seedInvestigations, settings: DEFAULT_SETTINGS };

describe('grounded assistant', () => {
  it('answers every example question', () => {
    for (const q of EXAMPLE_QUESTIONS) expect(answer(q, c).lines.length).toBeGreaterThan(0);
  });
  it('refuses causes, dosing, release and forecasts', () => {
    for (const q of ['Is AMY-24-118 contaminated?', 'Should we change the DO setpoint?', 'Can we release XYN-24-041?', 'Forecast the yield of AMY-24-120', 'Why did the DO drop?']) {
      expect(answer(q, c).kind).toBe('refusal');
    }
  });
  it('summarises a batch from its own records and cites them', () => {
    const a = answer('What happened to AMY-24-118?', c);
    expect(a.title).toContain('AMY-24-118');
    expect(a.sources).toContain('AMY-24-118');
    expect(a.sources).toContain('INV-0007');
  });
  it('lists open investigations with sources', () => {
    const a = answer('Which investigations need attention?', c);
    expect(a.sources.length).toBeGreaterThan(0);
    for (const s of a.sources) expect(a.lines.join(' ')).toContain(s);
  });
  it('reports data problems', () => {
    expect(answer('Which batches have data problems?', c).sources.length).toBeGreaterThan(0);
  });
  it('falls back to help', () => {
    expect(answer('What is the weather?', c).kind).toBe('help');
  });
});
