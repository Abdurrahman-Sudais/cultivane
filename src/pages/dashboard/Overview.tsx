import { Link } from 'react-router-dom';
import { AlertTriangle, ArrowRight, ClipboardList, FlaskConical, ShieldCheck } from 'lucide-react';
import { Line, LineChart, ResponsiveContainer } from 'recharts';
import { batches, DEMO_INVESTIGATION_ID } from '@/data/batches';
import { FACILITY, memberById } from '@/data/facility';
import { currentPhase, isActive, lastReading } from '@/lib/batch';
import { sparkline } from '@/lib/chart';
import { allMissingIntervals, batchCompleteness, staleMeasurements } from '@/lib/dataQuality';
import { MEASUREMENTS, MEASUREMENT_KINDS, formatValue, relativeTime } from '@/lib/format';
import { useWorkspace } from '@/state/store';
import { BatchLink, BatchStatusBadge, Callout, InvestigationStatusBadge, Meter, PageHeader, Panel, PhaseTimeline, Stat } from '@/components/ui';

export default function Overview() {
  const { investigations, settings } = useWorkspace();
  const active = batches.filter(isActive);
  const open = investigations.filter((i) => i.status !== 'resolved');
  const stale = active.flatMap((b) => staleMeasurements(b, settings.stalenessThresholdHours));
  const gaps = allMissingIntervals(batches.filter(isActive));

  return (
    <>
      <PageHeader
        eyebrow={FACILITY.name}
        title="Overview"
        description="Active fermentation batches, open investigations and data-quality alerts across the facility."
        actions={
          <Link to={`/batches/investigations/${DEMO_INVESTIGATION_ID}`} className="btn-primary btn-sm">
            Open demo deviation <ArrowRight className="h-3.5 w-3.5" aria-hidden />
          </Link>
        }
      />
      <Callout tone="sim" className="mb-6" title="Simulated demonstration dataset">
        Northfield Enzyme Works and every batch, measurement, event and team member shown here are fictional. No live bioreactor or historian is connected.
      </Callout>
      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat label="Active batches" value={active.length} hint={`${batches.length} batches in archive`} icon={<FlaskConical className="h-4 w-4 text-forest-500" aria-hidden />} />
        <Stat label="Open investigations" value={open.length} hint={`${open.filter((i) => !i.assigneeId).length} unassigned`} icon={<ClipboardList className="h-4 w-4 text-ochre-500" aria-hidden />} />
        <Stat label="Missing intervals (active)" value={gaps.length} hint="Sensor gaps in running batches" icon={<AlertTriangle className="h-4 w-4 text-ochre-500" aria-hidden />} />
        <Stat label="Outdated feeds" value={stale.length} hint={`No reading for > ${settings.stalenessThresholdHours} h`} icon={<ShieldCheck className="h-4 w-4 text-teal-500" aria-hidden />} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        <Panel title="Active batches" actions={<Link to="/batches/list" className="text-xs font-medium text-forest-700 hover:underline">All batches</Link>} bodyClassName="p-0">
          <ul className="divide-y divide-line">
            {active.map((b) => {
              const c = batchCompleteness(b);
              const staleHere = stale.filter((s) => s.batchId === b.id);
              const gapsHere = b.missingIntervals.length;
              return (
                <li key={b.id} className="p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <BatchLink id={b.id} className="text-sm" />
                        <BatchStatusBadge status={b.status} />
                      </div>
                      <div className="mt-0.5 text-xs text-navy-500">
                        {b.product} · {b.recipeVersion} · {b.fermenterId}
                      </div>
                    </div>
                    <div className="text-right text-xs">
                      <div className="font-medium text-navy-800">{currentPhase(b).label}</div>
                      <div className="data text-navy-500">
                        {b.elapsedHours.toFixed(1)} / {b.plannedDurationHours} h
                      </div>
                    </div>
                  </div>
                  <div className="mt-3">
                    <PhaseTimeline batch={b} />
                  </div>
                  <div className="mt-3 grid grid-cols-3 gap-3">
                    {MEASUREMENT_KINDS.map((k) => {
                      const last = lastReading(b, k);
                      const isStale = staleHere.some((s) => s.kind === k);
                      return (
                        <div key={k} className="rounded-md bg-paper-2/70 px-2.5 py-2">
                          <div className="flex items-center justify-between text-[10.5px] text-navy-500">
                            {MEASUREMENTS[k].short}
                            {isStale && <span className="text-ochre-700">outdated</span>}
                          </div>
                          <div className="data text-sm text-navy-900">{formatValue(k, last?.value ?? null)}</div>
                          <div className="h-7">
                            <ResponsiveContainer width="100%" height="100%">
                              <LineChart data={sparkline(b, k)}>
                                <Line dataKey="v" stroke={isStale ? '#b8782a' : '#215a44'} strokeWidth={1.2} dot={false} isAnimationActive={false} connectNulls={false} />
                              </LineChart>
                            </ResponsiveContainer>
                          </div>
                          {last && <div className="data text-[10px] text-navy-400">at {last.t.toFixed(2)} h</div>}
                        </div>
                      );
                    })}
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-navy-500">
                    <div className="w-48">
                      <Meter value={c} threshold={settings.completenessThreshold} label={`Data completeness for ${b.id}`} />
                    </div>
                    {gapsHere > 0 && (
                      <span className="flex items-center gap-1 text-ochre-700">
                        <AlertTriangle className="h-3.5 w-3.5" aria-hidden /> {gapsHere} missing-data interval{gapsHere > 1 ? 's' : ''}
                      </span>
                    )}
                    <Link to={`/batches/compare?focus=${b.id}`} className="ml-auto font-medium text-forest-700 hover:underline">
                      Compare with matched runs →
                    </Link>
                  </div>
                </li>
              );
            })}
          </ul>
        </Panel>

        <div className="space-y-6">
          <Panel title="Open investigations" actions={<Link to="/batches/investigations" className="text-xs font-medium text-forest-700 hover:underline">View all</Link>} bodyClassName="p-0">
            <ul className="divide-y divide-line">
              {open.map((inv) => (
                <li key={inv.id}>
                  <Link to={`/batches/investigations/${inv.id}`} className="block p-4 hover:bg-paper-2/60">
                    <div className="flex items-center justify-between gap-2">
                      <span className="data text-xs text-navy-500">
                        {inv.id} · {inv.batchId}
                      </span>
                      <InvestigationStatusBadge status={inv.status} />
                    </div>
                    <div className="mt-1 text-sm font-medium text-navy-900">{inv.title}</div>
                    <div className="mt-1 text-xs text-navy-500">
                      {memberById(inv.assigneeId)?.name ?? 'Unassigned'} · updated {relativeTime(inv.updatedAt, FACILITY.snapshotAt)}
                    </div>
                  </Link>
                </li>
              ))}
              {!open.length && <li className="p-4 text-sm text-navy-500">No open investigations.</li>}
            </ul>
          </Panel>
          <Panel title="Data-quality alerts" actions={<Link to="/batches/data-quality" className="text-xs font-medium text-forest-700 hover:underline">Details</Link>}>
            <ul className="space-y-3 text-sm">
              {stale.map((s) => (
                <li key={`${s.batchId}-${s.kind}`} className="flex gap-2">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-ochre-500" aria-hidden />
                  <span>
                    <BatchLink id={s.batchId} /> — {MEASUREMENTS[s.kind].label} last reading {s.hoursSince.toFixed(1)} h ago.
                  </span>
                </li>
              ))}
              {gaps.map((g) => (
                <li key={`${g.batchId}-${g.kind}-${g.startHour}`} className="flex gap-2">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-ochre-500" aria-hidden />
                  <span>
                    <BatchLink id={g.batchId} /> — {MEASUREMENTS[g.kind].label} missing {g.startHour}–{g.endHour} h.
                  </span>
                </li>
              ))}
            </ul>
          </Panel>
        </div>
      </div>
    </>
  );
}
