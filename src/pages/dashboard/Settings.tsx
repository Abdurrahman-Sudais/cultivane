import { useState } from 'react';
import type { AlignmentMode } from '@/types';
import { team } from '@/data/facility';
import { DEFAULT_SETTINGS, useWorkspace } from '@/state/store';
import { Callout, PageHeader, Panel, SegmentedControl } from '@/components/ui';

export default function SettingsPage() {
  const { settings, updateSettings, resetDemo } = useWorkspace();
  const [confirming, setConfirming] = useState(false);
  const [done, setDone] = useState(false);

  return (
    <>
      <PageHeader title="Settings" description="Workspace preferences and screening thresholds. Saved in this browser (local storage)." />
      <div className="grid max-w-3xl gap-6">
        <Panel title="Current user">
          <label htmlFor="user" className="label">Acting as</label>
          <select id="user" className="input max-w-sm" value={settings.currentUserId} onChange={(e) => updateSettings({ currentUserId: e.target.value })}>
            {team.map((m) => <option key={m.id} value={m.id}>{m.name} — {m.role}</option>)}
          </select>
          <p className="mt-2 text-xs text-navy-500">Demo only: there is no authentication. Notes and status changes are attributed to this user.</p>
        </Panel>
        <Panel title="Comparison & screening">
          <div className="space-y-5">
            <div>
              <label htmlFor="sens" className="label">Pattern screening band width: <span className="data">{settings.deviationSensitivity.toFixed(1)}×</span></label>
              <input id="sens" type="range" min={0.6} max={2} step={0.1} value={settings.deviationSensitivity} onChange={(e) => updateSettings({ deviationSensitivity: Number(e.target.value) })} className="w-full max-w-sm accent-forest-700" />
              <p className="text-xs text-navy-500">Larger values widen the tolerance around the reference range, so fewer windows are flagged.</p>
            </div>
            <div>
              <label htmlFor="comp" className="label">Minimum completeness for reliable comparison: <span className="data">{Math.round(settings.completenessThreshold * 100)}%</span></label>
              <input id="comp" type="range" min={0.5} max={1} step={0.05} value={settings.completenessThreshold} onChange={(e) => updateSettings({ completenessThreshold: Number(e.target.value) })} className="w-full max-w-sm accent-forest-700" />
            </div>
            <div>
              <label htmlFor="stale" className="label">Flag a sensor feed as outdated after (hours)</label>
              <input id="stale" type="number" min={0.25} max={24} step={0.25} className="input data max-w-32" value={settings.stalenessThresholdHours} onChange={(e) => { const v = Number(e.target.value); if (v >= 0.25 && v <= 24) updateSettings({ stalenessThresholdHours: v }); }} />
            </div>
            <div>
              <span className="label">Default alignment</span>
              <SegmentedControl<AlignmentMode> label="Default alignment" value={settings.defaultAlignment} onChange={(v) => updateSettings({ defaultAlignment: v })} options={[{ value: 'phase', label: 'Phase start' }, { value: 'elapsed', label: 'Elapsed time' }]} />
            </div>
            <button type="button" className="btn-ghost btn-sm" onClick={() => updateSettings({ ...DEFAULT_SETTINGS, currentUserId: settings.currentUserId })}>Restore default thresholds</button>
          </div>
        </Panel>
        <Panel title="Demo data">
          <p className="mb-3 text-sm text-navy-600">Reset investigations, notes, assignments and settings to the original simulated dataset.</p>
          {confirming ? (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm text-brick-700">This removes your local changes.</span>
              <button type="button" className="btn btn-sm bg-brick-500 text-white hover:bg-brick-700" onClick={() => { resetDemo(); setConfirming(false); setDone(true); }}>Confirm reset</button>
              <button type="button" className="btn-ghost btn-sm" onClick={() => setConfirming(false)}>Cancel</button>
            </div>
          ) : (
            <button type="button" className="btn-secondary btn-sm" onClick={() => { setConfirming(true); setDone(false); }}>Reset demo workspace</button>
          )}
          {done && <p role="status" className="mt-2 text-xs text-forest-700">Workspace reset to the simulated seed data.</p>}
        </Panel>
        <Callout tone="sim" title="Integrations not connected">Historian (OPC UA / PI), LIMS sample import, SSO and email notifications would require external systems and are not active in this demo.</Callout>
      </div>
    </>
  );
}
