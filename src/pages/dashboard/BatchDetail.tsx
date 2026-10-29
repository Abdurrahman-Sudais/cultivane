import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, GitCompare } from 'lucide-react';
import { batchById } from '@/data/batches';
import { fermenterById, recipeById } from '@/data/facility';
import { currentPhase } from '@/lib/batch';
import { batchCompleteness, metadataIssues, sampleCompleteness, seriesCompleteness } from '@/lib/dataQuality';
import { MEASUREMENTS, MEASUREMENT_KINDS, MISSING_REASON_LABEL, formatDate, formatDateTime } from '@/lib/format';
import { useWorkspace } from '@/state/store';
import { Badge, BatchStatusBadge, Callout, EmptyState, InvestigationStatusBadge, Meter, PageHeader, Panel, PhaseTimeline, SegmentedControl, cx } from '@/components/ui';
import { MeasurementPanel } from '@/components/dashboard/MeasurementPanel';

type Tab = 'trends' | 'samples' | 'events' | 'investigations';

export default function BatchDetail() {
  const { batchId = '' } = useParams();
  const batch = batchById(batchId);
  const { investigations, settings } = useWorkspace();
  const [tab, setTab] = useState<Tab>('trends');

  if (!batch) {
    return (
      <EmptyState title={`Batch ${batchId} was not found`}>
        <Link to="/batches/list" className="text-forest-700 underline">Back to batches</Link>
      </EmptyState>
    );
  }
  const recipe = recipeById(batch.recipeId);
  const fermenter = fermenterById(batch.fermenterId);
  const invs = investigations.filter((i) => i.batchId === batch.id);
  const meta = metadataIssues(batch);
  const samples = sampleCompleteness(batch);

  return (
    <>
      <Link to="/batches/list" className="mb-3 inline-flex items-center gap-1 text-xs text-navy-500 hover:text-navy-800">
        <ArrowLeft className="h-3.5 w-3.5" aria-hidden /> Batches
      </Link>
      <PageHeader
        eyebrow={batch.product}
        title={batch.id}
        description={batch.notes}
        actions={
          <Link to={`/batches/compare?focus=${batch.id}`} className="btn-primary btn-sm">
            <GitCompare className="h-3.5 w-3.5" aria-hidden /> Compare with matched runs
          </Link>
        }
      />
      {meta.map((m) => (
        <Callout key={m.field} tone="warning" title={`Unmatched metadata: ${m.field}`} className="mb-4">
          {m.message} Comparisons for this batch are limited until the record is corrected.
        </Callout>
      ))}

      <div className="mb-6 grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <div className="card p-5">
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <BatchStatusBadge status={batch.status} />
            <Badge tone="teal">{currentPhase(batch).label}</Badge>
            <Badge tone="ochre">Simulated</Badge>
          </div>
          <PhaseTimeline batch={batch} />
          <dl className="mt-5 grid grid-cols-2 gap-x-6 gap-y-3 text-[13px] sm:grid-cols-4">
            {[
              ['Process', batch.processCode],
              ['Recipe version', batch.recipeVersion],
              ['Fermenter', fermenter ? `${fermenter.id} · ${fermenter.workingVolumeL.toLocaleString()} L` : batch.fermenterId],
              ['Equipment group', fermenter?.compatibilityGroup ?? '—'],
              ['Start', formatDateTime(batch.startTime)],
              ['Elapsed', `${batch.elapsedHours.toFixed(2)} h / ${batch.plannedDurationHours} h`],
              ['Organism', recipe?.organism.split(' production')[0] ?? 'Unmatched'],
              ['Setpoints', recipe ? `${recipe.setpoints.temperatureC} °C · pH ${recipe.setpoints.ph} · DO ≥ ${recipe.setpoints.dissolvedOxygenMinPct}%` : 'Unavailable'],
            ].map(([k, v]) => (
              <div key={k}>
                <dt className="text-[11px] text-navy-400">{k}</dt>
                <dd className="data mt-0.5 text-navy-900">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
        <div className="card p-5">
          <h2 className="mb-3 text-sm font-semibold">Data completeness</h2>
          <div className="space-y-2.5 text-xs">
            {MEASUREMENT_KINDS.map((k) => (
              <div key={k} className="grid grid-cols-[110px_1fr] items-center gap-2">
                <span className="text-navy-600">{MEASUREMENTS[k].label}</span>
                <Meter value={seriesCompleteness(batch, k)} threshold={settings.completenessThreshold} label={`${MEASUREMENTS[k].label} completeness`} />
              </div>
            ))}
            <div className="grid grid-cols-[110px_1fr] items-center gap-2">
              <span className="text-navy-600">Samples</span>
              <Meter value={samples.ratio} threshold={settings.completenessThreshold} label="Sampling completeness" />
            </div>
            <div className="grid grid-cols-[110px_1fr] items-center gap-2 border-t border-line pt-2.5 font-medium">
              <span className="text-navy-800">Overall</span>
              <Meter value={batchCompleteness(batch)} threshold={settings.completenessThreshold} label="Overall completeness" />
            </div>
          </div>
          {batch.missingIntervals.length > 0 && (
            <ul className="mt-4 space-y-1 border-t border-line pt-3 text-xs text-ochre-700">
              {batch.missingIntervals.map((m) => (
                <li key={`${m.kind}-${m.startHour}`}>
                  {MEASUREMENTS[m.kind].label}: no readings {m.startHour}–{m.endHour} h ({MISSING_REASON_LABEL[m.reason]})
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="mb-4">
        <SegmentedControl<Tab>
          label="Batch detail sections"
          value={tab}
          onChange={setTab}
          options={[
            { value: 'trends', label: 'Trends' },
            { value: 'samples', label: `Samples (${batch.samples.length})` },
            { value: 'events', label: `Events (${batch.events.length})` },
            { value: 'investigations', label: `Investigations (${invs.length})` },
          ]}
        />
      </div>

      {tab === 'trends' && (
        <Panel>
          <div className="space-y-6">
            {MEASUREMENT_KINDS.map((k) => (
              <MeasurementPanel key={k} kind={k} focus={batch} syncId={`detail-${batch.id}`} height={200} />
            ))}
          </div>
        </Panel>
      )}
      {tab === 'samples' && (
        <Panel bodyClassName="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line bg-paper-2/60 text-left text-xs text-navy-500">
                  {['Hour', 'Analyte', 'Value', 'Unit', 'Analyst', 'Status'].map((h) => <th key={h} scope="col" className="px-4 py-2.5 font-medium">{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {batch.samples.map((s) => (
                  <tr key={s.id} className="border-b border-line last:border-0">
                    <td className="data px-4 py-2">{s.hour} h</td>
                    <td className="px-4 py-2">{s.analyte}</td>
                    <td className={cx('data px-4 py-2', s.value === null && 'text-ochre-700 italic')}>{s.value ?? 'No result'}</td>
                    <td className="px-4 py-2 text-navy-500">{s.unit}</td>
                    <td className="px-4 py-2 text-navy-600">{s.analyst ?? '—'}</td>
                    <td className="px-4 py-2">
                      <Badge tone={s.status === 'complete' ? 'forest' : s.status === 'pending' ? 'navy' : 'ochre'}>{s.status}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      )}
      {tab === 'events' && (
        <Panel>
          <ol className="relative space-y-4 border-l border-line pl-5">
            {batch.events.map((e) => (
              <li key={e.id} className="relative">
                <span className="absolute top-1.5 -left-[25px] h-2 w-2 rounded-full bg-teal-500 ring-4 ring-white" aria-hidden />
                <div className="data text-[11px] text-navy-400">{e.hour.toFixed(2)} h · {e.type.replace('-', ' ')}</div>
                <div className="text-sm text-navy-900">{e.description}</div>
                <div className="text-[11px] text-navy-500">{e.recordedBy}</div>
              </li>
            ))}
          </ol>
        </Panel>
      )}
      {tab === 'investigations' && (
        <Panel bodyClassName="p-0">
          {invs.length ? (
            <ul className="divide-y divide-line">
              {invs.map((i) => (
                <li key={i.id}>
                  <Link to={`/batches/investigations/${i.id}`} className="flex items-center justify-between gap-3 p-4 hover:bg-paper-2/50">
                    <div>
                      <div className="data text-xs text-navy-500">{i.id} · opened {formatDate(i.createdAt)}</div>
                      <div className="text-sm font-medium text-navy-900">{i.title}</div>
                    </div>
                    <InvestigationStatusBadge status={i.status} />
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-4"><EmptyState title="No investigations for this batch" /></div>
          )}
        </Panel>
      )}
    </>
  );
}
