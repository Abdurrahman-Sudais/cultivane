import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { InvestigationStatus } from '@/types';
import { FACILITY, memberById } from '@/data/facility';
import { MEASUREMENTS, formatDate, relativeTime } from '@/lib/format';
import { useWorkspace } from '@/state/store';
import { EmptyState, InvestigationStatusBadge, PageHeader, SegmentedControl } from '@/components/ui';

export default function Investigations() {
  const { investigations } = useWorkspace();
  const [filter, setFilter] = useState<InvestigationStatus | 'all'>('all');
  const list = investigations.filter((i) => filter === 'all' || i.status === filter);
  const count = (s: InvestigationStatus) => investigations.filter((i) => i.status === s).length;

  return (
    <>
      <PageHeader title="Investigations" description="Process deviations and data issues under review. Investigations record evidence and findings — they do not diagnose causes or make release decisions." />
      <div className="mb-4">
        <SegmentedControl
          label="Filter by status"
          value={filter}
          onChange={setFilter}
          options={[
            { value: 'all', label: `All (${investigations.length})` },
            { value: 'open', label: `Open (${count('open')})` },
            { value: 'under-review', label: `Under review (${count('under-review')})` },
            { value: 'resolved', label: `Resolved (${count('resolved')})` },
          ]}
        />
      </div>
      {list.length === 0 ? (
        <EmptyState title="No investigations with this status" />
      ) : (
        <div className="card divide-y divide-line">
          {list.map((inv) => (
            <Link key={inv.id} to={`/batches/investigations/${inv.id}`} className="grid gap-2 p-4 hover:bg-paper-2/50 md:grid-cols-[1fr_140px_150px_110px] md:items-center">
              <div className="min-w-0">
                <div className="data text-xs text-navy-500">{inv.id} · {inv.batchId} · {MEASUREMENTS[inv.measurement].label} · {inv.window.startHour}–{inv.window.endHour} h</div>
                <div className="truncate text-sm font-medium text-navy-900">{inv.title}</div>
              </div>
              <div className="text-xs text-navy-600">{memberById(inv.assigneeId)?.name ?? <span className="text-ochre-700">Unassigned</span>}</div>
              <div className="text-xs text-navy-500">Opened {formatDate(inv.createdAt)}<br />Updated {relativeTime(inv.updatedAt, FACILITY.snapshotAt)}</div>
              <div><InvestigationStatusBadge status={inv.status} /></div>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
