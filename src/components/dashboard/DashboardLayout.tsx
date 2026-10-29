import { Suspense, useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { Activity, BarChart3, ClipboardList, Database, FlaskConical, GitCompare, LayoutGrid, Menu, Settings, ShieldCheck, X } from 'lucide-react';
import { Logo, cx } from '@/components/ui';
import { FACILITY, memberById } from '@/data/facility';
import { formatDateTime } from '@/lib/format';
import { useWorkspace } from '@/state/store';
import { useDocumentMeta } from '@/hooks/useDocumentMeta';

const NAV = [
  { to: '/batches', label: 'Overview', icon: LayoutGrid, end: true },
  { to: '/batches/list', label: 'Batches', icon: FlaskConical },
  { to: '/batches/runs', label: 'Process Runs', icon: Activity },
  { to: '/batches/trends', label: 'Trends', icon: BarChart3 },
  { to: '/batches/compare', label: 'Comparisons', icon: GitCompare },
  { to: '/batches/investigations', label: 'Investigations', icon: ClipboardList },
  { to: '/batches/data-quality', label: 'Data Quality', icon: ShieldCheck },
  { to: '/batches/settings', label: 'Settings', icon: Settings },
];

export function DashboardLayout() {
  useDocumentMeta({ title: 'Batch Dashboard (demo)', path: '/batches', noindex: true });
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  const { investigations, settings } = useWorkspace();
  const openCount = investigations.filter((i) => i.status !== 'resolved').length;
  const me = memberById(settings.currentUserId);
  useEffect(() => setOpen(false), [pathname]);

  const nav = (
    <nav aria-label="Dashboard" className="flex flex-col gap-0.5 px-3">
      {NAV.map((n) => (
        <NavLink
          key={n.to}
          to={n.to}
          end={n.end}
          className={({ isActive }) =>
            cx('flex items-center gap-3 rounded-md px-3 py-2 text-[13px] font-medium transition-colors', isActive ? 'bg-white/10 text-paper' : 'text-paper/60 hover:bg-white/5 hover:text-paper')
          }
        >
          <n.icon className="h-4 w-4" aria-hidden />
          {n.label}
          {n.label === 'Investigations' && openCount > 0 && <span className="data ml-auto rounded-full bg-ochre-500/25 px-1.5 text-[10px] text-ochre-100">{openCount}</span>}
        </NavLink>
      ))}
    </nav>
  );

  const sidebarInner = (
    <>
      <div className="flex h-14 items-center justify-between px-5">
        <Link to="/" aria-label="Cultivane website">
          <Logo dark />
        </Link>
      </div>
      <div className="mx-3 mb-4 rounded-md border border-white/10 bg-white/5 px-3 py-2.5">
        <div className="text-[10px] tracking-wider text-paper/45 uppercase">Facility</div>
        <div className="text-[13px] text-paper">{FACILITY.name}</div>
        <div className="text-[11px] text-paper/50">{FACILITY.site}</div>
      </div>
      {nav}
      <div className="mt-auto space-y-3 p-4">
        <div className="rounded-md border border-ochre-300/30 bg-ochre-500/10 px-3 py-2.5 text-[11px] leading-snug text-ochre-100">
          <div className="mb-0.5 flex items-center gap-1.5 font-medium">
            <Database className="h-3 w-3" aria-hidden /> Simulated dataset
          </div>
          All batches, measurements and people are fictional. Snapshot {formatDateTime(FACILITY.snapshotAt)}.
        </div>
        {me && (
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-mint-300 text-xs font-semibold text-forest-950">{me.initials}</span>
            <div className="min-w-0 text-[12px] leading-tight">
              <div className="truncate text-paper">{me.name}</div>
              <div className="truncate text-paper/50">{me.role}</div>
            </div>
          </div>
        )}
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-paper">
      <a href="#dash-main" className="sr-only z-50 rounded bg-forest-900 px-3 py-2 text-paper focus:not-sr-only focus:fixed focus:top-3 focus:left-3">
        Skip to content
      </a>
      <aside className="tech-grid-dark fixed inset-y-0 left-0 z-30 hidden w-60 flex-col bg-forest-950 lg:flex">{sidebarInner}</aside>
      {open && (
        <div className="fixed inset-0 z-40 lg:hidden" role="dialog" aria-modal="true" aria-label="Dashboard navigation">
          <div className="absolute inset-0 bg-navy-950/50" onClick={() => setOpen(false)} />
          <aside className="tech-grid-dark relative flex h-full w-64 flex-col bg-forest-950">
            <button type="button" onClick={() => setOpen(false)} className="absolute top-3 right-3 rounded p-1.5 text-paper/70 hover:bg-white/10" aria-label="Close navigation">
              <X className="h-5 w-5" />
            </button>
            {sidebarInner}
          </aside>
        </div>
      )}
      <div className="lg:pl-60">
        <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-line bg-paper/90 px-4 backdrop-blur sm:px-6">
          <button type="button" className="btn-ghost -ml-2 p-2 lg:hidden" onClick={() => setOpen(true)} aria-label="Open navigation" aria-expanded={open}>
            <Menu className="h-5 w-5" />
          </button>
          <span className="rounded-full bg-ochre-50 px-2.5 py-1 text-[11px] font-medium text-ochre-700 ring-1 ring-ochre-100">Demo workspace · simulated data</span>
          <span className="ml-auto hidden text-xs text-navy-500 sm:inline">
            Data as of <span className="data">{formatDateTime(FACILITY.snapshotAt)}</span>
          </span>
        </header>
        <main id="dash-main" className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6 lg:py-8">
          <Suspense fallback={<div className="flex min-h-[40vh] items-center justify-center text-sm text-navy-400" role="status">Loading…</div>}>
          <Outlet />
        </Suspense>
        </main>
      </div>
    </div>
  );
}
