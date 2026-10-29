import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowDownUp, Search } from 'lucide-react';
import type { BatchStatus } from '@/types';
import { batches } from '@/data/batches';
import { currentPhase } from '@/lib/batch';
import { batchCompleteness } from '@/lib/dataQuality';
import { STATUS_LABEL, formatDateTime } from '@/lib/format';
import { useWorkspace } from '@/state/store';
import { BatchLink, BatchStatusBadge, EmptyState, Meter, PageHeader, cx } from '@/components/ui';

type SortKey = 'id' | 'start' | 'completeness';

export default function BatchList() {
  const { investigations, settings } = useWorkspace();
  const navigate = useNavigate();
  const [q, setQ] = useState('');
  const [status, setStatus] = useState<BatchStatus | 'all'>('all');
  const [process, setProcess] = useState('all');
  const [sort, setSort] = useState<SortKey>('start');
  const processes = [...new Set(batches.map((b) => b.processCode))];

  const rows = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return batches
      .filter((b) => status === 'all' || b.status === status)
      .filter((b) => process === 'all' || b.processCode === process)
      .filter((b) => !needle || [b.id, b.product, b.fermenterId, b.recipeVersion, b.processCode].some((s) => s.toLowerCase().includes(needle)))
      .map((b) => ({ b, c: batchCompleteness(b), inv: investigations.filter((i) => i.batchId === b.id) }))
      .sort((x, y) => (sort === 'id' ? x.b.id.localeCompare(y.b.id) : sort === 'completeness' ? x.c - y.c : Date.parse(y.b.startTime) - Date.parse(x.b.startTime)));
  }, [q, status, process, sort, investigations]);

  return (
    <>
      <PageHeader title="Batches" description="Searchable inventory of active and historical fermentation batches." />
      <div className="card mb-4 flex flex-col gap-3 p-3 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-navy-300" aria-hidden />
          <label htmlFor="batch-search" className="sr-only">Search batches</label>
          <input id="batch-search" className="input pl-9" placeholder="Search by batch ID, product, fermenter or recipe…" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <div className="flex flex-wrap gap-2">
          <label className="sr-only" htmlFor="f-status">Status</label>
          <select id="f-status" className="input w-auto" value={status} onChange={(e) => setStatus(e.target.value as BatchStatus | 'all')}>
            <option value="all">All statuses</option>
            {(Object.keys(STATUS_LABEL) as BatchStatus[]).map((s) => (
              <option key={s} value={s}>{STATUS_LABEL[s]}</option>
            ))}
          </select>
          <label className="sr-only" htmlFor="f-process">Process</label>
          <select id="f-process" className="input w-auto" value={process} onChange={(e) => setProcess(e.target.value)}>
            <option value="all">All processes</option>
            {processes.map((p) => (
              <option key={p}>{p}</option>
            ))}
          </select>
          <label className="sr-only" htmlFor="f-sort">Sort</label>
          <div className="relative">
            <ArrowDownUp className="pointer-events-none absolute top-1/2 left-2.5 h-3.5 w-3.5 -translate-y-1/2 text-navy-400" aria-hidden />
            <select id="f-sort" className="input w-auto pl-8" value={sort} onChange={(e) => setSort(e.target.value as SortKey)}>
              <option value="start">Newest first</option>
              <option value="id">Batch ID</option>
              <option value="completeness">Lowest completeness</option>
            </select>
          </div>
        </div>
      </div>
      <p className="mb-2 text-xs text-navy-500" role="status">{rows.length} of {batches.length} batches</p>

      {rows.length === 0 ? (
        <EmptyState title="No batches match these filters">Try a different search term or clear the filters.</EmptyState>
      ) : (
        <>
          <div className="card hidden overflow-x-auto md:block">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line bg-paper-2/60 text-left text-xs text-navy-500">
                  {['Batch', 'Product / process', 'Recipe', 'Fermenter', 'Start', 'Phase', 'Status', 'Completeness', 'Inv.'].map((h) => (
                    <th key={h} scope="col" className="px-4 py-2.5 font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map(({ b, c, inv }) => (
                  <tr key={b.id} className="cursor-pointer border-b border-line last:border-0 hover:bg-paper-2/50" onClick={() => navigate(`/batches/b/${b.id}`)}>
                    <td className="px-4 py-3"><BatchLink id={b.id} /></td>
                    <td className="px-4 py-3">
                      <div className="text-navy-900">{b.product}</div>
                      <div className="data text-[11px] text-navy-400">{b.processCode}</div>
                    </td>
                    <td className={cx('data px-4 py-3', !b.recipeId ? 'text-brick-700' : 'text-navy-700')}>{b.recipeVersion}{!b.recipeId && ' ⚠'}</td>
                    <td className="data px-4 py-3 text-navy-700">{b.fermenterId}</td>
                    <td className="px-4 py-3 text-xs whitespace-nowrap text-navy-600">{formatDateTime(b.startTime)}</td>
                    <td className="px-4 py-3 text-xs text-navy-700">{currentPhase(b).label}</td>
                    <td className="px-4 py-3"><BatchStatusBadge status={b.status} /></td>
                    <td className="w-36 px-4 py-3"><Meter value={c} threshold={settings.completenessThreshold} label={`Completeness ${b.id}`} /></td>
                    <td className="data px-4 py-3 text-xs text-navy-600">{inv.length || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <ul className="space-y-3 md:hidden">
            {rows.map(({ b, c }) => (
              <li key={b.id} className="card p-4">
                <div className="flex items-center justify-between">
                  <BatchLink id={b.id} />
                  <BatchStatusBadge status={b.status} />
                </div>
                <div className="mt-1 text-xs text-navy-500">{b.product} · {b.recipeVersion} · {b.fermenterId}</div>
                <div className="mt-1 text-xs text-navy-700">{currentPhase(b).label} · {b.elapsedHours.toFixed(1)} h</div>
                <div className="mt-2"><Meter value={c} threshold={settings.completenessThreshold} label={`Completeness ${b.id}`} /></div>
              </li>
            ))}
          </ul>
        </>
      )}
    </>
  );
}
