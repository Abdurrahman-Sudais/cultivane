import { Link } from 'react-router-dom';
import { batches } from '@/data/batches';
import { allMissingIntervals, batchCompleteness, incompatibleReferences, metadataIssues, sampleCompleteness, seriesCompleteness, staleMeasurements } from '@/lib/dataQuality';
import { MEASUREMENTS, MEASUREMENT_KINDS, MISSING_REASON_LABEL } from '@/lib/format';
import { useWorkspace } from '@/state/store';
import { BatchLink, Callout, Meter, PageHeader, Panel, Stat } from '@/components/ui';

export default function DataQuality() {
  const { settings, investigations } = useWorkspace();
  const missing = allMissingIntervals(batches);
  const stale = batches.flatMap((b) => staleMeasurements(b, settings.stalenessThresholdHours));
  const samples = batches.map((b) => ({ b, s: sampleCompleteness(b) })).filter((x) => x.s.missing > 0 || x.s.pending > 0);
  const meta = batches.flatMap(metadataIssues);
  const incompatible = investigations.flatMap((i) => incompatibleReferences(i, batches, settings));

  return (
    <>
      <PageHeader title="Data quality" description="Missing and outdated readings, incomplete sampling and metadata problems that limit reliable comparison. Missing values are shown as gaps — never filled with zero." />
      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-5">
        <Stat label="Missing sensor intervals" value={missing.length} />
        <Stat label="Outdated measurements" value={stale.length} hint={`> ${settings.stalenessThresholdHours} h since last reading`} />
        <Stat label="Batches with sample gaps" value={samples.filter((x) => x.s.missing > 0).length} />
        <Stat label="Unmatched metadata" value={meta.length} />
        <Stat label="Incompatible references" value={incompatible.length} hint="in investigations" />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Panel title="Missing sensor intervals" bodyClassName="p-0">
          <table className="w-full text-[12.5px]">
            <thead><tr className="border-b border-line bg-paper-2/60 text-left text-xs text-navy-500">{['Batch', 'Measurement', 'Interval', 'Duration', 'Reason'].map((h) => <th key={h} scope="col" className="px-4 py-2 font-medium">{h}</th>)}</tr></thead>
            <tbody>
              {missing.map((m) => (
                <tr key={`${m.batchId}-${m.kind}-${m.startHour}`} className="border-b border-line last:border-0">
                  <td className="px-4 py-2"><BatchLink id={m.batchId} /></td>
                  <td className="px-4 py-2">{MEASUREMENTS[m.kind].label}</td>
                  <td className="data px-4 py-2">{m.startHour}–{m.endHour} h</td>
                  <td className="data px-4 py-2">{(m.endHour - m.startHour).toFixed(2)} h</td>
                  <td className="px-4 py-2 text-ochre-700">{MISSING_REASON_LABEL[m.reason]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>

        <Panel title="Outdated measurements">
          {stale.length ? (
            <ul className="space-y-2 text-sm">
              {stale.map((s) => (
                <li key={`${s.batchId}-${s.kind}`} className="rounded-md border border-ochre-300/50 bg-ochre-50 px-3 py-2 text-ochre-700">
                  <BatchLink id={s.batchId} /> · {MEASUREMENTS[s.kind].label}: last reading at {s.lastHour?.toFixed(2) ?? '—'} h, {s.hoursSince.toFixed(2)} h before the latest batch time. Trend values after this point are unknown.
                </li>
              ))}
            </ul>
          ) : <p className="text-sm text-navy-500">All active sensor feeds are current.</p>}
        </Panel>

        <Panel title="Incomplete sampling records" bodyClassName="p-0">
          <table className="w-full text-[12.5px]">
            <thead><tr className="border-b border-line bg-paper-2/60 text-left text-xs text-navy-500">{['Batch', 'Complete', 'Missing', 'Pending', 'Completeness'].map((h) => <th key={h} scope="col" className="px-4 py-2 font-medium">{h}</th>)}</tr></thead>
            <tbody>
              {samples.map(({ b, s }) => (
                <tr key={b.id} className="border-b border-line last:border-0">
                  <td className="px-4 py-2"><BatchLink id={b.id} /></td>
                  <td className="data px-4 py-2">{s.complete}</td>
                  <td className="data px-4 py-2 text-ochre-700">{s.missing}</td>
                  <td className="data px-4 py-2 text-navy-500">{s.pending}</td>
                  <td className="w-40 px-4 py-2"><Meter value={s.ratio} threshold={settings.completenessThreshold} label={`Sampling completeness ${b.id}`} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>

        <Panel title="Unmatched process metadata">
          {meta.length ? meta.map((m) => (
            <Callout key={m.batchId + m.field} tone="warning" title={`${m.batchId} · ${m.field}`} className="mb-2">
              {m.message} <Link to={`/batches/b/${m.batchId}`} className="underline">Open batch</Link>
            </Callout>
          )) : <p className="text-sm text-navy-500">All batches match the recipe and equipment registries.</p>}
        </Panel>

        <Panel title="Incompatible reference batches in investigations" className="xl:col-span-2" bodyClassName="p-0">
          {incompatible.length ? (
            <ul className="divide-y divide-line">
              {incompatible.map((x) => (
                <li key={x.investigationId + x.batchId} className="px-4 py-3 text-[12.5px]">
                  <Link to={`/batches/investigations/${x.investigationId}`} className="data font-medium text-forest-700 hover:underline">{x.investigationId}</Link> uses <BatchLink id={x.batchId} /> as a reference — <span className={x.result.level === 'incompatible' ? 'text-brick-700' : 'text-ochre-700'}>{x.result.issues.map((i) => i.message).join(' ')}</span>
                </li>
              ))}
            </ul>
          ) : <p className="p-4 text-sm text-navy-500">All investigation references are comparable.</p>}
        </Panel>

        <Panel title="Completeness by batch" className="xl:col-span-2" bodyClassName="p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-[12.5px]">
              <thead><tr className="border-b border-line bg-paper-2/60 text-left text-xs text-navy-500"><th scope="col" className="px-4 py-2 font-medium">Batch</th>{MEASUREMENT_KINDS.map((k) => <th key={k} scope="col" className="px-4 py-2 font-medium">{MEASUREMENTS[k].label}</th>)}<th scope="col" className="px-4 py-2 font-medium">Overall</th></tr></thead>
              <tbody>
                {batches.map((b) => (
                  <tr key={b.id} className="border-b border-line last:border-0">
                    <td className="px-4 py-2"><BatchLink id={b.id} /></td>
                    {MEASUREMENT_KINDS.map((k) => <td key={k} className="w-40 px-4 py-2"><Meter value={seriesCompleteness(b, k)} threshold={settings.completenessThreshold} label={`${MEASUREMENTS[k].label} ${b.id}`} /></td>)}
                    <td className="w-40 px-4 py-2"><Meter value={batchCompleteness(b)} threshold={settings.completenessThreshold} label={`Overall ${b.id}`} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      </div>
    </>
  );
}
