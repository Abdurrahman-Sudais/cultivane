import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, CheckCircle2, CircleDot, FlaskConical, Info, XCircle } from 'lucide-react';
import type { Batch, BatchStatus, ComparabilityLevel, InvestigationStatus, ProcessPhaseId } from '@/types';
import { INVESTIGATION_STATUS_LABEL, STATUS_LABEL, formatPct } from '@/lib/format';

export function cx(...c: (string | false | null | undefined)[]) {
  return c.filter(Boolean).join(' ');
}

export function Logo({ dark = false, className }: { dark?: boolean; className?: string }) {
  return (
    <span className={cx('inline-flex items-center gap-2', className)}>
      <svg viewBox="0 0 32 32" className="h-7 w-7 shrink-0" aria-hidden="true">
        <rect width="32" height="32" rx="7" fill={dark ? '#b9e4c9' : '#0e2a22'} />
        <path d="M11 7h10M12.5 7v5.5a7.5 7.5 0 1 0 7 0V7" fill="none" stroke={dark ? '#0e2a22' : '#b9e4c9'} strokeWidth="2" strokeLinecap="round" />
        <path d="M10.6 19.5c2-1.4 3.6 1.4 5.4 0s3.4-1.4 5.4 0" fill="none" stroke={dark ? '#306d67' : '#6fb3a8'} strokeWidth="1.8" strokeLinecap="round" />
      </svg>
      <span className={cx('font-display text-[17px] font-semibold tracking-tight', dark ? 'text-paper' : 'text-forest-900')}>Cultivane</span>
    </span>
  );
}

type Tone = 'neutral' | 'forest' | 'teal' | 'navy' | 'ochre' | 'brick' | 'mint';
const TONES: Record<Tone, string> = {
  neutral: 'bg-paper-2 text-navy-700 ring-line',
  forest: 'bg-forest-50 text-forest-700 ring-forest-200',
  teal: 'bg-teal-50 text-teal-700 ring-teal-200',
  navy: 'bg-navy-50 text-navy-700 ring-navy-100',
  ochre: 'bg-ochre-50 text-ochre-700 ring-ochre-100',
  brick: 'bg-brick-50 text-brick-700 ring-brick-500/25',
  mint: 'bg-mint-100 text-forest-800 ring-mint-300',
};

export function Badge({ tone = 'neutral', children, className, icon }: { tone?: Tone; children: ReactNode; className?: string; icon?: ReactNode }) {
  return (
    <span className={cx('inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium whitespace-nowrap ring-1 ring-inset', TONES[tone], className)}>
      {icon}
      {children}
    </span>
  );
}

export function SimulatedBadge({ className }: { className?: string }) {
  return (
    <Badge tone="ochre" className={className} icon={<FlaskConical className="h-3 w-3" aria-hidden />}>
      Simulated data
    </Badge>
  );
}

const STATUS_TONE: Record<BatchStatus, Tone> = { running: 'forest', completed: 'navy', 'on-hold': 'ochre', aborted: 'brick' };
export function BatchStatusBadge({ status }: { status: BatchStatus }) {
  return (
    <Badge tone={STATUS_TONE[status]} icon={status === 'running' ? <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-forest-500" aria-hidden /> : undefined}>
      {STATUS_LABEL[status]}
    </Badge>
  );
}

const INV_TONE: Record<InvestigationStatus, Tone> = { open: 'ochre', 'under-review': 'teal', resolved: 'neutral' };
export function InvestigationStatusBadge({ status }: { status: InvestigationStatus }) {
  return <Badge tone={INV_TONE[status]}>{INVESTIGATION_STATUS_LABEL[status]}</Badge>;
}

export function ComparabilityBadge({ level }: { level: ComparabilityLevel }) {
  if (level === 'compatible') return <Badge tone="forest" icon={<CheckCircle2 className="h-3 w-3" aria-hidden />}>Comparable</Badge>;
  if (level === 'caution') return <Badge tone="ochre" icon={<AlertTriangle className="h-3 w-3" aria-hidden />}>Use with caution</Badge>;
  return <Badge tone="brick" icon={<XCircle className="h-3 w-3" aria-hidden />}>Not comparable</Badge>;
}

const PHASE_COLOR: Record<ProcessPhaseId, string> = {
  inoculation: 'bg-navy-200',
  lag: 'bg-teal-200',
  exponential: 'bg-teal-400',
  'fed-batch': 'bg-forest-500',
  stationary: 'bg-forest-300',
  harvest: 'bg-navy-300',
};

/** Horizontal phase timeline with a progress marker. */
export function PhaseTimeline({ batch, compact = false }: { batch: Batch; compact?: boolean }) {
  const total = batch.plannedDurationHours;
  const pos = Math.min(100, (batch.elapsedHours / total) * 100);
  return (
    <div className="w-full">
      <div className={cx('relative flex w-full overflow-hidden rounded-sm', compact ? 'h-1.5' : 'h-2.5')} role="img" aria-label={`Process phases; ${batch.elapsedHours.toFixed(1)} of ${total} planned hours elapsed`}>
        {batch.phases.map((p) => {
          const w = ((p.endHour - p.startHour) / total) * 100;
          const done = batch.elapsedHours >= p.endHour;
          const cur = batch.elapsedHours >= p.startHour && batch.elapsedHours < p.endHour;
          return <div key={p.id} className={cx(PHASE_COLOR[p.id], !done && !cur && 'opacity-25', 'border-r border-white last:border-r-0')} style={{ width: `${w}%` }} title={`${p.label}: ${p.startHour}–${p.endHour} h`} />;
        })}
        {batch.status !== 'completed' && <div className="absolute top-0 bottom-0 w-0.5 bg-navy-900" style={{ left: `calc(${pos}% - 1px)` }} />}
      </div>
      {!compact && (
        <div className="mt-1.5 flex w-full text-[10px] text-navy-500">
          {batch.phases.map((p) => (
            <div key={p.id} className="truncate pr-1" style={{ width: `${((p.endHour - p.startHour) / total) * 100}%` }}>
              {p.label.split(' ')[0]}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function Meter({ value, threshold, label }: { value: number; threshold?: number; label: string }) {
  const tone = threshold !== undefined && value < threshold ? 'bg-ochre-500' : value < 0.97 ? 'bg-teal-500' : 'bg-forest-500';
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-full min-w-12 overflow-hidden rounded-full bg-paper-3" role="meter" aria-valuenow={Math.round(value * 100)} aria-valuemin={0} aria-valuemax={100} aria-label={label}>
        <div className={cx('h-full rounded-full', tone)} style={{ width: `${value * 100}%` }} />
      </div>
      <span className="data w-10 shrink-0 text-right text-[11px] text-navy-700">{formatPct(value)}</span>
    </div>
  );
}

export function Callout({ tone = 'info', title, children, className }: { tone?: 'info' | 'warning' | 'danger' | 'sim'; title?: string; children: ReactNode; className?: string }) {
  const styles = {
    info: 'border-teal-200 bg-teal-50/60 text-teal-900',
    warning: 'border-ochre-300/60 bg-ochre-50 text-ochre-700',
    danger: 'border-brick-500/30 bg-brick-50 text-brick-700',
    sim: 'border-ochre-300/60 bg-ochre-50/70 text-ochre-700',
  }[tone];
  const Icon = tone === 'info' ? Info : tone === 'sim' ? FlaskConical : AlertTriangle;
  return (
    <div className={cx('flex gap-2.5 rounded-lg border px-3.5 py-3 text-sm', styles, className)} role={tone === 'danger' || tone === 'warning' ? 'alert' : 'note'}>
      <Icon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
      <div className="min-w-0">
        {title && <div className="mb-0.5 font-medium">{title}</div>}
        <div className="text-[13px] leading-relaxed opacity-90">{children}</div>
      </div>
    </div>
  );
}

export function PageHeader({ title, description, actions, eyebrow }: { title: string; description?: ReactNode; actions?: ReactNode; eyebrow?: string }) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        {eyebrow && <div className="eyebrow mb-1.5">{eyebrow}</div>}
        <h1 className="text-2xl font-semibold text-navy-900">{title}</h1>
        {description && <p className="mt-1 max-w-2xl text-sm text-navy-500">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function Panel({ title, actions, children, className, bodyClassName }: { title?: ReactNode; actions?: ReactNode; children: ReactNode; className?: string; bodyClassName?: string }) {
  return (
    <section className={cx('card overflow-hidden', className)}>
      {(title || actions) && (
        <header className="flex items-center justify-between gap-3 border-b border-line px-4 py-3">
          <h2 className="text-sm font-semibold text-navy-900">{title}</h2>
          {actions}
        </header>
      )}
      <div className={cx('p-4', bodyClassName)}>{children}</div>
    </section>
  );
}

export function Stat({ label, value, hint, icon }: { label: string; value: ReactNode; hint?: ReactNode; icon?: ReactNode }) {
  return (
    <div className="card p-4">
      <div className="flex items-center justify-between text-xs text-navy-500">
        {label}
        {icon}
      </div>
      <div className="data mt-2 text-2xl font-medium text-navy-900">{value}</div>
      {hint && <div className="mt-1 text-xs text-navy-500">{hint}</div>}
    </div>
  );
}

export function EmptyState({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-line px-6 py-10 text-center">
      <CircleDot className="mb-2 h-5 w-5 text-navy-300" aria-hidden />
      <div className="text-sm font-medium text-navy-700">{title}</div>
      {children && <div className="mt-1 max-w-sm text-xs text-navy-500">{children}</div>}
    </div>
  );
}

export function BatchLink({ id, className }: { id: string; className?: string }) {
  return (
    <Link to={`/batches/b/${id}`} className={cx('data font-medium text-forest-700 underline-offset-2 hover:underline', className)}>
      {id}
    </Link>
  );
}

export function SegmentedControl<T extends string>({ value, onChange, options, label, size = 'md', disabled = false }: { value: T; onChange: (v: T) => void; options: { value: T; label: string }[]; label: string; size?: 'sm' | 'md'; disabled?: boolean }) {
  return (
    <div role="radiogroup" aria-label={label} className="inline-flex rounded-md border border-line bg-paper-2 p-0.5">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          role="radio"
          aria-checked={value === o.value}
          disabled={disabled}
          onClick={() => onChange(o.value)}
          className={cx(
            'rounded-[5px] font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60',
            size === 'sm' ? 'px-2.5 py-1 text-[11px]' : 'px-3 py-1.5 text-xs',
            value === o.value ? 'bg-white text-forest-800 shadow-sm ring-1 ring-line' : 'text-navy-500 hover:text-navy-800',
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

/** Explains why controls are read-only for the acting demo user. */
export function RoleNote({ children }: { children: ReactNode }) {
  return (
    <p className="flex items-start gap-1.5 rounded-md bg-paper-2 px-3 py-2 text-[11.5px] text-navy-600" role="note">
      <span aria-hidden>🔒</span>
      <span>{children}</span>
    </p>
  );
}
