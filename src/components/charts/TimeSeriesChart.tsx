import { useId } from 'react';
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ReferenceArea,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type TooltipProps,
} from 'recharts';
import type { MeasurementKind } from '@/types';
import { BAND_KEY, MEAN_KEY, valueDomain, type Band, type ChartRow } from '@/lib/chart';
import { MEASUREMENTS, formatValue } from '@/lib/format';

export interface SeriesDef {
  key: string;
  label: string;
  color: string;
  width?: number;
  dashed?: boolean;
}

interface Props {
  rows: ChartRow[];
  series: SeriesDef[];
  kind: MeasurementKind;
  height?: number;
  syncId?: string;
  phases?: Band[];
  missing?: (Band & { reason?: string })[];
  highlight?: Band | null;
  detected?: Band[];
  events?: { hour: number; label: string }[];
  showBand?: boolean;
  xDomain?: [number, number];
  /** Accessible description of what the chart shows. */
  ariaLabel: string;
  compact?: boolean;
}

function ChartTooltip({ active, payload, label, kind, series }: TooltipProps<number, string> & { kind: MeasurementKind; series: SeriesDef[] }) {
  if (!active || !payload?.length) return null;
  const row = payload[0]?.payload as ChartRow | undefined;
  if (!row) return null;
  const band = row[BAND_KEY];
  return (
    <div className="rounded-md border border-line bg-white/95 px-3 py-2 text-xs shadow-lg backdrop-blur">
      <div className="data mb-1 text-navy-500">t = {Number(label).toFixed(2)} h</div>
      {series.map((s) => {
        const v = row[s.key];
        return (
          <div key={s.key} className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-1.5 text-navy-700">
              <span className="inline-block h-0.5 w-3" style={{ background: s.color }} />
              {s.label}
            </span>
            <span className={`data ${typeof v === 'number' ? 'text-navy-900' : 'text-ochre-700 italic'}`}>{formatValue(kind, typeof v === 'number' ? v : null)}</span>
          </div>
        );
      })}
      {Array.isArray(band) && (
        <div className="mt-1 border-t border-line pt-1 text-navy-500">
          Reference range <span className="data">{formatValue(kind, band[0], false)} – {formatValue(kind, band[1], false)}</span>
        </div>
      )}
    </div>
  );
}

export function TimeSeriesChart({
  rows,
  series,
  kind,
  height = 240,
  syncId,
  phases = [],
  missing = [],
  highlight,
  detected = [],
  events = [],
  showBand = false,
  xDomain,
  ariaLabel,
  compact = false,
}: Props) {
  const hatchId = `hatch-${useId().replace(/:/g, '')}`;
  const m = MEASUREMENTS[kind];
  const domain = valueDomain(rows, [...series.map((s) => s.key), ...(showBand ? [BAND_KEY] : [])]);
  const xd = xDomain ?? ([rows[0]?.t ?? 0, rows[rows.length - 1]?.t ?? 1] as [number, number]);

  return (
    <figure className="w-full" aria-label={ariaLabel} role="figure">
      <div style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={rows} syncId={syncId} margin={{ top: compact ? 4 : 18, right: 12, bottom: 0, left: compact ? -18 : -4 }}>
            <defs>
              <pattern id={hatchId} patternUnits="userSpaceOnUse" width="6" height="6" patternTransform="rotate(45)">
                <rect width="6" height="6" fill="#f5e4c6" fillOpacity="0.35" />
                <line x1="0" y1="0" x2="0" y2="6" stroke="#b8782a" strokeWidth="1.4" strokeOpacity="0.55" />
              </pattern>
            </defs>
            <CartesianGrid stroke="#e9e5d9" strokeDasharray="2 4" vertical={false} />
            {phases.map((p, i) => (
              <ReferenceArea
                key={`ph-${p.label}`}
                x1={p.x1}
                x2={p.x2}
                fill={i % 2 ? '#eef5f1' : '#faf8f3'}
                fillOpacity={0.9}
                ifOverflow="hidden"
                label={compact ? undefined : { value: p.label, position: 'insideTopLeft', fontSize: 9.5, fill: '#536d97', offset: 6 }}
              />
            ))}
            {highlight && (
              <ReferenceArea
                x1={highlight.x1}
                x2={highlight.x2}
                fill="#e2b46b"
                fillOpacity={0.22}
                stroke="#b8782a"
                strokeOpacity={0.6}
                strokeDasharray="3 3"
                ifOverflow="hidden"
                label={{ value: highlight.label, position: 'insideTop', fontSize: 10, fill: '#7f501a', offset: 4 }}
              />
            )}
            {detected.map((d) => (
              <ReferenceArea key={`det-${d.x1}`} x1={d.x1} x2={d.x2} fill="#e2b46b" fillOpacity={0.16} ifOverflow="hidden" />
            ))}
            {missing.map((mb) => (
              <ReferenceArea key={`miss-${mb.label}-${mb.x1}`} x1={mb.x1} x2={mb.x2} fill={`url(#${hatchId})`} stroke="#b8782a" strokeOpacity={0.35} ifOverflow="hidden" />
            ))}
            {events.map((e) => (
              <ReferenceLine key={`ev-${e.hour}-${e.label}`} x={e.hour} stroke="#7d93b8" strokeDasharray="2 3" ifOverflow="hidden" />
            ))}
            <XAxis
              dataKey="t"
              type="number"
              domain={xd}
              allowDataOverflow
              tickLine={false}
              axisLine={{ stroke: '#ddd8ca' }}
              tick={{ fill: '#536d97' }}
              tickFormatter={(v: number) => `${Math.round(v)}h`}
              tickCount={compact ? 4 : 10}
            />
            <YAxis
              domain={domain}
              tickLine={false}
              axisLine={false}
              width={compact ? 44 : 52}
              tick={{ fill: '#536d97' }}
              tickFormatter={(v: number) => v.toFixed(kind === 'dissolvedOxygen' ? 0 : kind === 'ph' ? 2 : 1)}
              label={compact ? undefined : { value: m.unit, angle: -90, position: 'insideLeft', offset: 14, fontSize: 10, fill: '#536d97' }}
            />
            {!compact && <Tooltip content={<ChartTooltip kind={kind} series={series} />} isAnimationActive={false} />}
            {showBand && <Area dataKey={BAND_KEY} stroke="none" fill="#a9d3cd" fillOpacity={0.45} isAnimationActive={false} connectNulls={false} activeDot={false} />}
            {showBand && <Line dataKey={MEAN_KEY} stroke="#57a097" strokeWidth={1} strokeDasharray="4 3" dot={false} isAnimationActive={false} connectNulls={false} activeDot={false} />}
            {series.map((s) => (
              <Line
                key={s.key}
                dataKey={s.key}
                name={s.label}
                stroke={s.color}
                strokeWidth={s.width ?? 1.6}
                strokeDasharray={s.dashed ? '4 3' : undefined}
                dot={false}
                connectNulls={false}
                isAnimationActive={false}
                activeDot={{ r: 3 }}
              />
            ))}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      <figcaption className="sr-only">{ariaLabel}. Gaps in lines and hatched areas mark missing readings; they are not filled with zero.</figcaption>
    </figure>
  );
}

export function ChartLegend({ items }: { items: { label: string; color?: string; swatch?: 'line' | 'band' | 'hatch' | 'highlight' | 'dashed' }[] }) {
  return (
    <ul className="flex flex-wrap gap-x-4 gap-y-1.5 text-[11px] text-navy-600">
      {items.map((it) => (
        <li key={it.label} className="flex items-center gap-1.5">
          {it.swatch === 'band' ? (
            <span className="inline-block h-2.5 w-4 rounded-sm bg-teal-200/70" />
          ) : it.swatch === 'hatch' ? (
            <span className="inline-block h-2.5 w-4 rounded-sm border border-ochre-300 bg-[repeating-linear-gradient(45deg,#f5e4c6_0_2px,#e2b46b_2px_3px)]" />
          ) : it.swatch === 'highlight' ? (
            <span className="inline-block h-2.5 w-4 rounded-sm border border-dashed border-ochre-500 bg-ochre-100" />
          ) : it.swatch === 'dashed' ? (
            <span className="inline-block w-4 border-t border-dashed" style={{ borderColor: it.color }} />
          ) : (
            <span className="inline-block h-0.5 w-4" style={{ background: it.color }} />
          )}
          {it.label}
        </li>
      ))}
    </ul>
  );
}
