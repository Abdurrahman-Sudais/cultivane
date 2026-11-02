import { useMemo, useState } from 'react';
import { Check, Download, Minus } from 'lucide-react';
import { ACTIONS, ACTION_LABEL, DEMO_PEOPLE, ROLE_LABEL, actorName, can, type DemoRole } from '@/lib/access';
import { formatDateTime } from '@/lib/format';
import { useWorkspace } from '@/state/store';
import { PageHeader, Panel, RoleNote } from '@/components/ui';

const ROLES: DemoRole[] = ['manager', 'engineer', 'analyst', 'viewer'];

const csvCell = (v: string) => (/[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v);

export default function Audit() {
  const { auditLog, can: allowed, role } = useWorkspace();
  const [q, setQ] = useState('');
  const rows = useMemo(() => {
    const term = q.trim().toLowerCase();
    return [...auditLog].reverse().filter((e) => !term || `${actorName(e.actorId)} ${e.action} ${e.detail}`.toLowerCase().includes(term));
  }, [auditLog, q]);

  const exportCsv = () => {
    const text = [['Time (UTC)', 'Person', 'Action', 'Detail'], ...rows.map((e) => [e.at, actorName(e.actorId), e.action, e.detail])].map((r) => r.map(csvCell).join(',')).join('\n');
    const url = URL.createObjectURL(new Blob([text], { type: 'text/csv;charset=utf-8' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = 'cultivane-audit-log.csv';
    a.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  return (
    <>
      <PageHeader title="Audit & roles" description="Who can do what in this demo workspace, and an append-only record of every change. Switch user under “Demo as” to try each role." />
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
        <div className="min-w-0 space-y-6">
          <Panel title="Roles and permissions">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-[11px] text-navy-500">
                    <th className="py-2 pr-3 font-medium">Action</th>
                    {ROLES.map((r) => (
                      <th key={r} className="px-2 py-2 text-center font-medium">
                        {ROLE_LABEL[r]}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {ACTIONS.map((a) => (
                    <tr key={a} className="border-t border-line">
                      <td className="py-2 pr-3 text-navy-800">{ACTION_LABEL[a]}</td>
                      {ROLES.map((r) => (
                        <td key={r} className="px-2 py-2 text-center">
                          {can(r, a) ? <Check className="mx-auto h-4 w-4 text-forest-600" aria-label="Allowed" /> : <Minus className="mx-auto h-4 w-4 text-navy-300" aria-label="Not allowed" />}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-xs text-navy-500">Resetting the demo is open to everyone because it only clears this browser. In production, roles come from your identity provider and are enforced on the server.</p>
          </Panel>
          <Panel title="People in this demo">
            <ul className="divide-y divide-line">
              {DEMO_PEOPLE.map((p) => (
                <li key={p.id} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                  <span className="flex items-center gap-2.5">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-forest-50 text-[11px] font-semibold text-forest-800 ring-1 ring-forest-100">{p.initials}</span>
                    <span>
                      <span className="block text-navy-900">{p.name}</span>
                      <span className="block text-[11px] text-navy-500">{p.role}</span>
                    </span>
                  </span>
                  <span className="rounded-full bg-paper-2 px-2 py-0.5 text-[11px] text-navy-700">{ROLE_LABEL[p.demoRole]}</span>
                </li>
              ))}
            </ul>
          </Panel>
        </div>
        <Panel
          title={`Audit log (${auditLog.length})`}
          actions={
            allowed('audit') ? (
              <button type="button" className="btn-secondary btn-sm" onClick={exportCsv}>
                <Download className="h-3.5 w-3.5" aria-hidden /> Export CSV
              </button>
            ) : undefined
          }
        >
          {!allowed('audit') ? (
            <RoleNote>Acting as {ROLE_LABEL[role].toLowerCase()}: only a production manager can read the audit log. Switch to Tomás Medina under “Demo as”.</RoleNote>
          ) : (
            <>
              <label htmlFor="audit-q" className="sr-only">
                Filter the audit log
              </label>
              <input id="audit-q" className="input mb-3" placeholder="Filter by person, action or investigation…" value={q} onChange={(e) => setQ(e.target.value)} />
              <ol className="divide-y divide-line">
                {rows.map((e) => (
                  <li key={e.id} className="py-2.5 text-[13px]">
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <span className="font-medium text-navy-900">{actorName(e.actorId)}</span>
                      <span className="data text-[11px] text-navy-500">{formatDateTime(e.at)}</span>
                    </div>
                    <div className="text-navy-700">
                      <span className="mr-1.5 rounded bg-paper-2 px-1.5 py-0.5 font-mono text-[10px] text-navy-600 uppercase">{e.action}</span>
                      {e.detail}
                    </div>
                  </li>
                ))}
                {!rows.length && <li className="py-3 text-sm text-navy-500">No matching entries.</li>}
              </ol>
            </>
          )}
        </Panel>
      </div>
    </>
  );
}
