import { useMemo } from 'react';
import { AlertTriangle, BarChart3, ClipboardList, Database, FlaskConical, GitCompare, LayoutGrid, Search } from 'lucide-react';
import { Line, LineChart, ResponsiveContainer } from 'recharts';
import { batches, batchById, DEMO_BATCH_ID } from '@/data/batches';
import { seedInvestigations } from '@/data/investigations';
import { buildRows, missingBands, phaseBands, sparkline, SERIES_COLORS } from '@/lib/chart';
import { assessComparability } from '@/lib/comparison';
import { batchCompleteness } from '@/lib/dataQuality';
import { currentPhase, isActive } from '@/lib/batch';
import { formatPct } from '@/lib/format';
import { DEFAULT_SETTINGS } from '@/state/store';
import { BatchStatusBadge, ComparabilityBadge, InvestigationStatusBadge, PhaseTimeline, cx } from '@/components/ui';
import { ChartLegend, TimeSeriesChart } from '@/components/charts/TimeSeriesChart';

const demo = batchById(DEMO_BATCH_ID)!;
const demoRefs = seedInvestigations[0]!.referenceBatchIds.map((id) => batchById(id)!);

function Spark({ data, color = '#215a44' }: { data: { t: number; v: number | null }[]; color?: string }) {
  return (
    <div className="h-8 w-20">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 2, bottom: 2, left: 0, right: 0 }}>
          <Line dataKey="v" stroke={color} strokeWidth={1.3} dot={false} isAnimationActive={false} connectNulls={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

/** Homepage product preview, rendered from the same simulated dataset as the dashboard. */
export function ProductPreview() {
  const active = batches.filter(isActive);
  const rows = useMemo(
    () => buildRows({ focus: demo, batches: [demo], kind: 'dissolvedOxygen', mode: 'phase', phaseId: 'fed-batch', references: demoRefs, range: [14, 38] }),
    [],
  );
  const nav = [LayoutGrid, FlaskConical, GitCompare, BarChart3, ClipboardList, Database];
  return (
    <div className="relative">
      <div className="absolute -inset-6 -z-10 rounded-[28px] bg-gradient-to-br from-teal-100/60 via-paper to-mint-100/50 blur-2xl" aria-hidden />
      <div className="overflow-hidden rounded-xl border border-line bg-white shadow-[0_30px_80px_-30px_rgba(15,27,45,0.35)]" role="img" aria-label="Preview of the Cultivane batch dashboard showing active batches, a dissolved-oxygen trend with a highlighted deviation window, and investigation status">
        <div className="flex items-center gap-2 border-b border-line bg-paper-2 px-3 py-2">
          <span className="h-2.5 w-2.5 rounded-full bg-line" />
          <span className="h-2.5 w-2.5 rounded-full bg-line" />
          <span className="h-2.5 w-2.5 rounded-full bg-line" />
          <span className="ml-3 hidden rounded bg-white px-2 py-0.5 font-mono text-[10px] text-navy-400 sm:inline">app.cultivane.site/batches</span>
          <span className="ml-auto rounded-full bg-ochre-50 px-2 py-0.5 text-[10px] font-medium text-ochre-700 ring-1 ring-ochre-100">Simulated data</span>
        </div>
        <div className="flex">
          <div className="hidden w-11 shrink-0 flex-col items-center gap-3 border-r border-line bg-forest-950 py-3 sm:flex">
            {nav.map((Icon, i) => (
              <Icon key={i} className={cx('h-4 w-4', i === 2 ? 'text-mint-300' : 'text-paper/40')} aria-hidden />
            ))}
          </div>
          <div className="min-w-0 flex-1 p-3 sm:p-4">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <div className="text-[10px] tracking-wider text-navy-400 uppercase">Active batches · Northfield Enzyme Works</div>
                <div className="font-display text-sm font-semibold text-navy-900">Line 2 overview</div>
              </div>
              <div className="hidden items-center gap-1.5 rounded border border-line px-2 py-1 text-[10px] text-navy-400 sm:flex">
                <Search className="h-3 w-3" aria-hidden /> Search batches
              </div>
            </div>
            <div className="grid gap-1.5">
              {active.slice(0, 4).map((b) => {
                const c = batchCompleteness(b);
                const gaps = b.missingIntervals.length;
                return (
                  <div key={b.id} className="grid grid-cols-[auto_1fr_auto] items-center gap-3 rounded-md border border-line/70 px-2.5 py-1.5 sm:grid-cols-[88px_1fr_80px_auto]">
                    <div>
                      <div className="data text-[11px] font-medium text-navy-900">{b.id}</div>
                      <div className="text-[9.5px] text-navy-400">{b.fermenterId}</div>
                    </div>
                    <div className="min-w-0">
                      <div className="mb-1 flex items-center justify-between text-[9.5px] text-navy-500">
                        <span className="truncate">{currentPhase(b).label}</span>
                        <span className="data">{b.elapsedHours.toFixed(1)} h</span>
                      </div>
                      <PhaseTimeline batch={b} compact />
                    </div>
                    <div className="hidden sm:block">
                      <Spark data={sparkline(b, 'dissolvedOxygen')} color={b.id === DEMO_BATCH_ID ? '#b8782a' : '#215a44'} />
                    </div>
                    <div className="flex items-center gap-1.5">
                      {gaps > 0 && <AlertTriangle className="h-3.5 w-3.5 text-ochre-500" aria-label={`${gaps} missing-data intervals`} />}
                      <span className={cx('data text-[10px]', c < 0.95 ? 'text-ochre-700' : 'text-navy-500')}>{formatPct(c)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-3 grid gap-3 xl:grid-cols-[1.6fr_1fr]">
              <div className="rounded-md border border-line/70 p-2.5">
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-[10.5px] font-medium text-navy-800">
                    <span className="data">{demo.id}</span> · Dissolved oxygen vs 4 matched runs
                  </span>
                </div>
                <TimeSeriesChart
                  compact
                  rows={rows}
                  kind="dissolvedOxygen"
                  height={128}
                  showBand
                  series={[{ key: demo.id, label: demo.id, color: '#b8782a', width: 1.8 }]}
                  phases={phaseBands(demo, 38)}
                  highlight={{ x1: 30.5, x2: 36.5, label: '' }}
                  ariaLabel="Dissolved oxygen for batch AMY-24-118 against the reference range"
                />
              </div>
              <div className="rounded-md border border-line/70 p-2.5">
                <div className="mb-2 text-[10.5px] font-medium text-navy-800">Investigations</div>
                <ul className="space-y-2">
                  {seedInvestigations.slice(0, 3).map((inv) => (
                    <li key={inv.id} className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="data text-[10px] text-navy-400">
                          {inv.id} · {inv.batchId}
                        </div>
                        <div className="truncate text-[10.5px] text-navy-800">{inv.title}</div>
                      </div>
                      <InvestigationStatusBadge status={inv.status} />
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Shows how dissolved oxygen means different things in different phases. */
export function PhaseContextChart() {
  const ref = batchById('AMY-24-109')!;
  const rows = useMemo(() => buildRows({ focus: ref, batches: [ref], kind: 'dissolvedOxygen', mode: 'elapsed', phaseId: 'fed-batch' }), [ref]);
  return (
    <div className="card p-4 sm:p-5">
      <div className="mb-2 flex items-center justify-between">
        <div className="text-xs font-medium text-navy-700">
          Dissolved oxygen across one complete run · <span className="data">{ref.id}</span>
        </div>
        <span className="text-[10px] text-ochre-700">Simulated</span>
      </div>
      <TimeSeriesChart rows={rows} kind="dissolvedOxygen" height={230} phases={phaseBands(ref)} series={[{ key: ref.id, label: ref.id, color: '#215a44' }]} ariaLabel="Dissolved oxygen falling from near saturation during growth, held near 40 percent in fed-batch, and rising in stationary phase" />
      <div className="mt-3 grid grid-cols-3 gap-2 text-center text-[11px]">
        {[
          ['Lag', '≈ 90%', 'Low oxygen demand'],
          ['Fed-batch', '≈ 40%', 'Held by DO cascade'],
          ['Stationary', '60–80%', 'Demand falls'],
        ].map(([p, v, d]) => (
          <div key={p} className="rounded-md bg-paper-2 px-2 py-2">
            <div className="text-navy-500">{p}</div>
            <div className="data text-sm text-navy-900">{v}</div>
            <div className="text-[10px] text-navy-400">{d}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Real comparability assessment of the demo batch against the archive. */
export function ComparabilityMatrix() {
  const results = useMemo(
    () =>
      ['AMY-24-109', 'AMY-24-112', 'AMY-24-115', 'AMY-24-104', 'AMY-24-P07', 'AMY-24-120'].map((id) => ({
        b: batchById(id)!,
        r: assessComparability(demo, batchById(id)!, { phaseId: 'fed-batch', measurement: 'dissolvedOxygen', window: { startHour: 24, endHour: 38 } }, DEFAULT_SETTINGS),
      })),
    [],
  );
  return (
    <div className="card overflow-hidden">
      <div className="flex items-center justify-between border-b border-line px-4 py-3">
        <div className="text-xs font-medium text-navy-700">
          Candidate references for <span className="data text-forest-700">{demo.id}</span> · Fed-batch
        </div>
        <span className="text-[10px] text-ochre-700">Simulated</span>
      </div>
      <ul className="divide-y divide-line">
        {results.map(({ b, r }) => (
          <li key={b.id} className="grid grid-cols-[96px_1fr_auto] items-start gap-3 px-4 py-2.5">
            <div>
              <div className="data text-xs font-medium text-navy-900">{b.id}</div>
              <div className="text-[10.5px] text-navy-400">
                {b.recipeVersion} · {b.fermenterId}
              </div>
            </div>
            <div className="text-[11.5px] leading-snug text-navy-600">{r.issues[0]?.message ?? 'Same recipe, equipment group and phase coverage.'}</div>
            <ComparabilityBadge level={r.level} />
          </li>
        ))}
      </ul>
    </div>
  );
}

/** The demonstration deviation with reference band and highlighted window. */
export function DeviationPreview() {
  const rows = useMemo(() => buildRows({ focus: demo, batches: [demo], kind: 'dissolvedOxygen', mode: 'phase', phaseId: 'fed-batch', references: demoRefs, range: [20, 38] }), []);
  return (
    <div className="card p-4 sm:p-5">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="text-xs font-medium text-navy-700">
          <span className="data">{demo.id}</span> · Dissolved oxygen, fed-batch phase
        </div>
        <span className="rounded-full bg-ochre-50 px-2 py-0.5 text-[10px] font-medium text-ochre-700 ring-1 ring-ochre-100">Pattern flagged for review</span>
      </div>
      <TimeSeriesChart
        rows={rows}
        kind="dissolvedOxygen"
        height={220}
        showBand
        series={[{ key: demo.id, label: demo.id, color: SERIES_COLORS[2]!, width: 2 }]}
        phases={phaseBands(demo, 38)}
        missing={missingBands(demo, 'dissolvedOxygen')}
        highlight={{ x1: 30.5, x2: 36.5, label: 'Review window' }}
        ariaLabel="Dissolved oxygen of AMY-24-118 dipping below the matched reference range between 30.5 and 36.5 hours"
      />
      <div className="mt-3">
        <ChartLegend
          items={[
            { label: 'Focus batch', color: SERIES_COLORS[2] },
            { label: 'Matched reference range (4 runs)', swatch: 'band' },
            { label: 'Reference mean', color: '#57a097', swatch: 'dashed' },
            { label: 'Review window', swatch: 'highlight' },
          ]}
        />
      </div>
    </div>
  );
}

export function BatchRecordCard() {
  const b = demo;
  return (
    <div className="card overflow-hidden">
      <div className="flex items-center justify-between border-b border-line bg-paper-2/60 px-4 py-3">
        <div>
          <div className="data text-sm font-medium text-navy-900">{b.id}</div>
          <div className="text-[11px] text-navy-500">
            {b.product} · Recipe {b.recipeVersion}
          </div>
        </div>
        <BatchStatusBadge status={b.status} />
      </div>
      <div className="px-4 pt-4">
        <PhaseTimeline batch={b} />
      </div>
      <dl className="grid grid-cols-2 gap-x-4 gap-y-3 p-4 text-[12px] sm:grid-cols-3">
        {[
          ['Fermenter', `${b.fermenterId} · 2,000 L`],
          ['Elapsed', `${b.elapsedHours.toFixed(1)} h of ${b.plannedDurationHours} h`],
          ['Phase', currentPhase(b).label],
          ['Sensors', 'TT-202 · PH-202 · OD-202A'],
          ['Samples', `${b.samples.filter((s) => s.status === 'complete').length} complete · ${b.samples.filter((s) => s.status === 'pending').length} pending`],
          ['Events', `${b.events.length} recorded`],
        ].map(([k, v]) => (
          <div key={k}>
            <dt className="text-navy-400">{k}</dt>
            <dd className="data mt-0.5 text-navy-800">{v}</dd>
          </div>
        ))}
      </dl>
      <div className="border-t border-line px-4 py-3">
        <div className="mb-2 text-[11px] font-medium text-navy-500">Recent events</div>
        <ul className="space-y-1.5">
          {b.events.slice(-4).map((e) => (
            <li key={e.id} className="flex gap-3 text-[11.5px]">
              <span className="data w-12 shrink-0 text-navy-400">{e.hour.toFixed(2)} h</span>
              <span className="text-navy-700">{e.description}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
