import { batches } from '@/data/batches';
import { fermenterById } from '@/data/facility';
import { BatchLink, BatchStatusBadge, PageHeader, Panel, cx } from '@/components/ui';
import type { ProcessPhaseId } from '@/types';

const PHASE_BG: Record<ProcessPhaseId, string> = {
  inoculation: 'bg-navy-200',
  lag: 'bg-teal-200',
  exponential: 'bg-teal-400',
  'fed-batch': 'bg-forest-500',
  stationary: 'bg-forest-300',
  harvest: 'bg-navy-300',
};

export default function ProcessRuns() {
  const groups = new Map<string, typeof batches>();
  for (const b of batches) {
    const key = `${b.processCode} ${b.recipeVersion} · ${fermenterById(b.fermenterId)?.compatibilityGroup ?? 'unknown equipment'}`;
    groups.set(key, [...(groups.get(key) ?? []), b]);
  }
  const maxH = Math.max(...batches.map((b) => b.plannedDurationHours));

  return (
    <>
      <PageHeader title="Process runs" description="Runs grouped by recipe version and equipment group — the units within which batches can be compared. Bars show actual phase timing in elapsed hours." />
      <div className="mb-4 flex flex-wrap gap-3 text-[11px] text-navy-600">
        {(Object.keys(PHASE_BG) as ProcessPhaseId[]).map((p) => (
          <span key={p} className="flex items-center gap-1.5">
            <span className={cx('h-2.5 w-4 rounded-sm', PHASE_BG[p])} /> {p.replace('-', ' ')}
          </span>
        ))}
      </div>
      <div className="space-y-5">
        {[...groups.entries()].map(([key, runs]) => (
          <Panel key={key} title={<span className="data">{key}</span>} actions={<span className="text-xs text-navy-500">{runs.length} run{runs.length > 1 ? 's' : ''}</span>}>
            <div className="mb-2 hidden grid-cols-[120px_1fr_90px] text-[10px] text-navy-400 sm:grid">
              <span />
              <div className="relative h-3">
                {Array.from({ length: Math.floor(maxH / 12) + 1 }, (_, i) => (
                  <span key={i} className="data absolute -translate-x-1/2" style={{ left: `${((i * 12) / maxH) * 100}%` }}>{i * 12}h</span>
                ))}
              </div>
            </div>
            <ul className="space-y-2">
              {runs.map((b) => (
                <li key={b.id} className="grid grid-cols-1 items-center gap-2 sm:grid-cols-[120px_1fr_90px]">
                  <BatchLink id={b.id} className="text-xs" />
                  <div className="relative h-5 rounded-sm bg-paper-2">
                    {b.phases.map((p) => {
                      if (p.startHour >= b.elapsedHours) return null;
                      const end = Math.min(p.endHour, b.elapsedHours);
                      return (
                        <div key={p.id} className={cx('absolute top-0 bottom-0 border-r border-white', PHASE_BG[p.id])} style={{ left: `${(p.startHour / maxH) * 100}%`, width: `${((end - p.startHour) / maxH) * 100}%` }} title={`${p.label}: ${p.startHour}–${end} h`} />
                      );
                    })}
                    <div className="absolute top-0 bottom-0 border-r border-dashed border-navy-300" style={{ left: `${(b.plannedDurationHours / maxH) * 100}%` }} aria-hidden />
                  </div>
                  <BatchStatusBadge status={b.status} />
                </li>
              ))}
            </ul>
          </Panel>
        ))}
      </div>
    </>
  );
}
