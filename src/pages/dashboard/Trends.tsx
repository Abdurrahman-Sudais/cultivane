import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { MeasurementKind } from '@/types';
import { batchById, batches, DEMO_BATCH_ID } from '@/data/batches';
import { MEASUREMENTS, MEASUREMENT_KINDS } from '@/lib/format';
import { PageHeader, Panel, cx } from '@/components/ui';
import { MeasurementPanel } from '@/components/dashboard/MeasurementPanel';

export default function Trends() {
  const [params, setParams] = useSearchParams();
  const batch = batchById(params.get('batch') ?? DEMO_BATCH_ID) ?? batches[0]!;
  const [kinds, setKinds] = useState<MeasurementKind[]>(MEASUREMENT_KINDS);
  const [range, setRange] = useState<[number, number]>([0, batch.elapsedHours]);
  const [showEvents, setShowEvents] = useState(true);

  const selectBatch = (id: string) => {
    setParams({ batch: id });
    const b = batchById(id)!;
    setRange([0, b.elapsedHours]);
  };
  const toggle = (k: MeasurementKind) => setKinds((ks) => (ks.includes(k) ? ks.filter((x) => x !== k) : [...ks, k]));

  return (
    <>
      <PageHeader title="Trends" description="Interactive measurement trends for a single batch. Hover to read values; gaps and hatched areas are missing readings." />
      <div className="card mb-4 grid gap-4 p-4 md:grid-cols-[1fr_auto_1fr]">
        <div>
          <label htmlFor="trend-batch" className="label">Batch</label>
          <select id="trend-batch" className="input" value={batch.id} onChange={(e) => selectBatch(e.target.value)}>
            {batches.map((b) => (
              <option key={b.id} value={b.id}>{b.id} — {b.processCode} {b.recipeVersion} · {b.fermenterId}</option>
            ))}
          </select>
        </div>
        <fieldset>
          <legend className="label">Measurements</legend>
          <div className="flex flex-wrap gap-1.5">
            {MEASUREMENT_KINDS.map((k) => (
              <button key={k} type="button" aria-pressed={kinds.includes(k)} onClick={() => toggle(k)} className={cx('rounded-md border px-2.5 py-1.5 text-xs font-medium', kinds.includes(k) ? 'border-forest-600 bg-forest-50 text-forest-800' : 'border-line text-navy-500')}>
                {MEASUREMENTS[k].label}
              </button>
            ))}
            <button type="button" aria-pressed={showEvents} onClick={() => setShowEvents((s) => !s)} className={cx('rounded-md border px-2.5 py-1.5 text-xs font-medium', showEvents ? 'border-navy-400 bg-navy-50 text-navy-800' : 'border-line text-navy-500')}>
              Events
            </button>
          </div>
        </fieldset>
        <div>
          <span className="label">Time range (h)</span>
          <div className="flex items-center gap-2">
            <label className="sr-only" htmlFor="r-start">Start hour</label>
            <input id="r-start" type="number" className="input data" min={0} max={range[1] - 1} step={1} value={range[0]} onChange={(e) => setRange([Math.max(0, Math.min(Number(e.target.value), range[1] - 1)), range[1]])} />
            <span className="text-navy-400">–</span>
            <label className="sr-only" htmlFor="r-end">End hour</label>
            <input id="r-end" type="number" className="input data" min={range[0] + 1} max={batch.elapsedHours} step={1} value={range[1]} onChange={(e) => setRange([range[0], Math.min(batch.elapsedHours, Math.max(Number(e.target.value), range[0] + 1))])} />
            <button type="button" className="btn-ghost btn-sm" onClick={() => setRange([0, batch.elapsedHours])}>Reset</button>
          </div>
        </div>
      </div>
      <Panel>
        {kinds.length === 0 ? (
          <p className="text-sm text-navy-500">Select at least one measurement.</p>
        ) : (
          <div className="space-y-6">
            {kinds.map((k) => (
              <MeasurementPanel key={k} kind={k} focus={batch} syncId="trends" range={range} showEvents={showEvents} height={230} />
            ))}
          </div>
        )}
      </Panel>
    </>
  );
}
