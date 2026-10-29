import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ClipboardPlus, Info } from 'lucide-react';
import type { AlignmentMode, MeasurementKind, ProcessPhaseId } from '@/types';
import { batchById, batches, DEMO_BATCH_ID } from '@/data/batches';
import { fermenterById, PHASE_ORDER, phaseLabel } from '@/data/facility';
import { currentPhase, lastReading } from '@/lib/batch';
import { assessComparability, detectDeviations, suggestReferences } from '@/lib/comparison';
import { seriesCompleteness } from '@/lib/dataQuality';
import { MEASUREMENTS, MEASUREMENT_KINDS, formatValue } from '@/lib/format';
import { SERIES_COLORS } from '@/lib/chart';
import { useWorkspace } from '@/state/store';
import { BatchLink, Callout, ComparabilityBadge, PageHeader, Panel, SegmentedControl, cx } from '@/components/ui';
import { MeasurementPanel } from '@/components/dashboard/MeasurementPanel';

export default function Comparisons() {
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const { settings, createInvestigation, investigations } = useWorkspace();
  const focus = batchById(params.get('focus') ?? DEMO_BATCH_ID) ?? batchById(DEMO_BATCH_ID)!;
  const defaultPhase: ProcessPhaseId = focus.status === 'completed' ? 'fed-batch' : currentPhase(focus).id;
  const [phaseId, setPhaseId] = useState<ProcessPhaseId>(defaultPhase);
  const [mode, setMode] = useState<AlignmentMode>(settings.defaultAlignment);
  const [primary, setPrimary] = useState<MeasurementKind>('dissolvedOxygen');
  const ctx = useMemo(() => ({ phaseId, measurement: primary }), [phaseId, primary]);

  const assessments = useMemo(
    () => batches.filter((b) => b.id !== focus.id).map((b) => ({ batch: b, result: assessComparability(focus, b, ctx, settings, mode) })),
    [focus, ctx, settings, mode],
  );

  const [selected, setSelected] = useState<string[]>([]);
  // Re-seed the selection with this batch's own matched references whenever the focus or phase changes.
  useEffect(() => {
    setSelected(suggestReferences(focus, batches, { phaseId, measurement: 'dissolvedOxygen' }, settings, mode).filter((r) => r.level === 'compatible').map((r) => r.batchId));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focus.id, phaseId]);

  const selectedBatches = selected.map((id) => batchById(id)!).filter(Boolean);
  const selectedResults = assessments.filter((a) => selected.includes(a.batch.id));
  const usable = selectedResults.filter((a) => a.result.level !== 'incompatible').map((a) => a.batch);
  const problems = selectedResults.filter((a) => a.result.level !== 'compatible');

  const detections = useMemo(() => detectDeviations(focus, usable, primary, settings, mode, phaseId), [focus, usable, primary, settings, mode, phaseId]);
  const first = detections[0];
  const range: [number, number] = [0, focus.elapsedHours];

  const toggle = (id: string) => setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  const openInvestigation = () => {
    if (!first) return;
    const existing = investigations.find((i) => i.batchId === focus.id && i.measurement === primary && i.window.startHour < first.window.endHour && i.window.endHour > first.window.startHour);
    if (existing) return navigate(`/batches/investigations/${existing.id}`);
    const id = createInvestigation({
      batchId: focus.id,
      title: `${MEASUREMENTS[primary].label} pattern differs from matched runs in ${phaseLabel(first.phaseId ?? phaseId).toLowerCase()}`,
      measurement: primary,
      window: { startHour: Math.max(0, first.window.startHour - 0.5), endHour: Math.min(focus.elapsedHours, first.window.endHour + 0.5) },
      phaseId: first.phaseId ?? phaseId,
      referenceBatchIds: usable.map((b) => b.id),
    });
    navigate(`/batches/investigations/${id}`);
  };

  const table = [focus, ...selectedBatches];

  return (
    <>
      <PageHeader title="Comparisons" description="Compare a batch with its own matched reference runs at corresponding process phases. There is no single universal reference batch." />

      <div className="card mb-4 grid gap-4 p-4 md:grid-cols-2 xl:grid-cols-4">
        <div>
          <label htmlFor="cmp-focus" className="label">Focus batch</label>
          <select id="cmp-focus" className="input" value={focus.id} onChange={(e) => setParams({ focus: e.target.value })}>
            {batches.map((b) => (
              <option key={b.id} value={b.id}>{b.id} — {b.processCode} {b.recipeVersion} · {b.fermenterId}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="cmp-phase" className="label">Comparison phase</label>
          <select id="cmp-phase" className="input" value={phaseId} onChange={(e) => setPhaseId(e.target.value as ProcessPhaseId)}>
            {PHASE_ORDER.filter((p) => (focus.phases.find((x) => x.id === p)?.startHour ?? 999) < focus.elapsedHours).map((p) => (
              <option key={p} value={p}>{phaseLabel(p)}</option>
            ))}
          </select>
        </div>
        <div>
          <span className="label">Alignment</span>
          <SegmentedControl<AlignmentMode> label="Time alignment" value={mode} onChange={setMode} options={[{ value: 'phase', label: 'Phase start' }, { value: 'elapsed', label: 'Elapsed time' }]} />
        </div>
        <div>
          <span className="label">Screening measurement</span>
          <SegmentedControl<MeasurementKind> label="Measurement used for screening" value={primary} onChange={setPrimary} size="sm" options={MEASUREMENT_KINDS.map((k) => ({ value: k, label: MEASUREMENTS[k].short }))} />
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[360px_1fr]">
        <Panel title="Candidate runs" actions={<span className="text-[11px] text-navy-500">{selected.length} selected</span>} bodyClassName="p-0">
          <p className="border-b border-line px-4 py-2.5 text-[11.5px] text-navy-500">Checked against <span className="data">{focus.id}</span> for {phaseLabel(phaseId).toLowerCase()}. Comparable runs are pre-selected.</p>
          <ul className="max-h-[640px] divide-y divide-line overflow-y-auto">
            {assessments.map(({ batch: b, result }) => (
              <li key={b.id} className={cx('px-4 py-3', selected.includes(b.id) && 'bg-forest-50/50')}>
                <label className="flex cursor-pointer items-start gap-3">
                  <input type="checkbox" className="mt-1 h-4 w-4 accent-forest-700" checked={selected.includes(b.id)} onChange={() => toggle(b.id)} aria-describedby={`issues-${b.id}`} />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="data text-sm font-medium text-navy-900">{b.id}</span>
                      <ComparabilityBadge level={result.level} />
                    </div>
                    <div className="text-[11px] text-navy-500">{b.processCode} {b.recipeVersion} · {b.fermenterId} · {currentPhase(b).label}</div>
                    {result.issues.length > 0 && (
                      <ul id={`issues-${b.id}`} className="mt-1.5 space-y-1 text-[11.5px] leading-snug text-navy-600">
                        {result.issues.map((i, n) => (
                          <li key={n} className={i.severity === 'incompatible' ? 'text-brick-700' : 'text-ochre-700'}>• {i.message}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                </label>
              </li>
            ))}
          </ul>
        </Panel>

        <div className="min-w-0 space-y-6">
          {problems.length > 0 && (
            <Callout tone="warning" title="Comparability warning">
              {problems.map((p) => (
                <div key={p.batch.id}>
                  <strong className="data">{p.batch.id}</strong>: {p.result.issues.map((i) => i.message).join(' ')}
                </div>
              ))}
              <div className="mt-1">Runs marked “Not comparable” are drawn as lines for context but are excluded from the reference range and from pattern screening.</div>
            </Callout>
          )}
          {usable.length < 2 && (
            <Callout tone="info" title="Reference range unavailable">
              At least two comparable runs with readings in the aligned window are needed to compute a reference range. Currently usable: {usable.length}. Missing: {2 - usable.length} more run{usable.length === 1 ? '' : 's'} with the same recipe version, equipment group and phase coverage.
            </Callout>
          )}
          {first && (
            <div className="flex flex-col gap-3 rounded-lg border border-ochre-300/60 bg-ochre-50 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-sm text-ochre-700">
                <div className="font-medium">{MEASUREMENTS[primary].label} differs from {usable.length} matched runs between {first.window.startHour.toFixed(2)} h and {first.window.endHour.toFixed(2)} h ({phaseLabel(first.phaseId ?? phaseId)}).</div>
                <div className="text-[13px] opacity-90">This is a pattern for review, not a diagnosis. Corresponding pH and temperature are shown below on the same time axis.</div>
              </div>
              <button type="button" className="btn-primary btn-sm shrink-0" onClick={openInvestigation}>
                <ClipboardPlus className="h-3.5 w-3.5" aria-hidden /> Open investigation
              </button>
            </div>
          )}

          <Panel title="Aligned measurements" actions={<span className="text-[11px] text-navy-500">{mode === 'phase' ? `Aligned to ${phaseLabel(phaseId)} start of ${focus.id}` : 'Elapsed hours since inoculation'}</span>}>
            <div className="space-y-6">
              {[primary, ...MEASUREMENT_KINDS.filter((k) => k !== primary)].map((k) => (
                <MeasurementPanel
                  key={k}
                  kind={k}
                  focus={focus}
                  overlay={selectedBatches}
                  references={usable}
                  mode={mode}
                  phaseId={phaseId}
                  syncId="compare"
                  range={range}
                  showEvents={false}
                  highlight={first ? { x1: first.window.startHour, x2: first.window.endHour, label: k === primary ? 'Differs from matched runs' : 'Same window' } : null}
                  height={k === primary ? 240 : 190}
                />
              ))}
            </div>
          </Panel>

          <Panel title="Side-by-side attributes" bodyClassName="p-0">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-[12.5px]">
                <thead>
                  <tr className="border-b border-line bg-paper-2/60 text-left text-xs text-navy-500">
                    <th scope="col" className="px-4 py-2.5 font-medium">Attribute</th>
                    {table.map((b, i) => (
                      <th key={b.id} scope="col" className="px-4 py-2.5 font-medium">
                        <span className="flex items-center gap-1.5">
                          <span className="inline-block h-0.5 w-3" style={{ background: SERIES_COLORS[i % SERIES_COLORS.length] }} />
                          <BatchLink id={b.id} />
                          {i === 0 && <span className="text-[10px] text-navy-400">(focus)</span>}
                        </span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['Recipe version', (b: typeof focus) => `${b.processCode} ${b.recipeVersion}`, (b: typeof focus) => b.recipeVersion !== focus.recipeVersion || b.processCode !== focus.processCode],
                    ['Equipment', (b: typeof focus) => `${b.fermenterId} (${fermenterById(b.fermenterId)?.compatibilityGroup ?? '?'})`, (b: typeof focus) => fermenterById(b.fermenterId)?.compatibilityGroup !== fermenterById(focus.fermenterId)?.compatibilityGroup],
                    ['Current phase', (b: typeof focus) => `${currentPhase(b).label} · ${b.elapsedHours.toFixed(1)} h`, () => false],
                    [`${phaseLabel(phaseId)} span`, (b: typeof focus) => { const p = b.phases.find((x) => x.id === phaseId)!; return `${p.startHour}–${p.endHour} h`; }, () => false],
                    ...MEASUREMENT_KINDS.map((k) => [`Latest ${MEASUREMENTS[k].short}`, (b: typeof focus) => formatValue(k, lastReading(b, k)?.value ?? null), () => false] as const),
                    ...MEASUREMENT_KINDS.map((k) => [`${MEASUREMENTS[k].short} completeness`, (b: typeof focus) => `${(seriesCompleteness(b, k) * 100).toFixed(0)}%`, (b: typeof focus) => seriesCompleteness(b, k) < settings.completenessThreshold] as const),
                    ['Recorded events', (b: typeof focus) => `${b.events.length}`, () => false],
                  ].map(([label, fn, warn]) => (
                    <tr key={label as string} className="border-b border-line last:border-0">
                      <th scope="row" className="px-4 py-2 text-left font-normal text-navy-500">{label as string}</th>
                      {table.map((b) => (
                        <td key={b.id} className={cx('data px-4 py-2', (warn as (x: typeof focus) => boolean)(b) ? 'text-brick-700' : 'text-navy-800')}>
                          {(fn as (x: typeof focus) => string)(b)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Panel>
          <p className="flex items-start gap-2 text-xs text-navy-500">
            <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden /> Screening sensitivity and completeness thresholds can be changed in <Link to="/batches/settings" className="text-forest-700 underline">Settings</Link>. All data is simulated.
          </p>
        </div>
      </div>
    </>
  );
}
