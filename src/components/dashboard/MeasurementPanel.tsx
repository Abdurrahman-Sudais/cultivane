import { useMemo } from 'react';
import type { AlignmentMode, Batch, MeasurementKind, ProcessPhaseId } from '@/types';
import { buildRows, missingBands, phaseBands, SERIES_COLORS, type Band } from '@/lib/chart';
import { alignmentShift } from '@/lib/comparison';
import { MEASUREMENTS } from '@/lib/format';
import { ChartLegend, TimeSeriesChart, type SeriesDef } from '@/components/charts/TimeSeriesChart';
import { useWorkspace } from '@/state/store';

interface Props {
  kind: MeasurementKind;
  focus: Batch;
  /** Batches drawn as individual lines (focus is always first). */
  overlay?: Batch[];
  references?: Batch[];
  mode?: AlignmentMode;
  phaseId?: ProcessPhaseId;
  highlight?: Band | null;
  detected?: Band[];
  range?: [number, number];
  syncId?: string;
  height?: number;
  showEvents?: boolean;
  showLegend?: boolean;
}

/** One measurement chart with phase bands, missing intervals, events and an optional reference band. */
export function MeasurementPanel({ kind, focus, overlay = [], references, mode = 'phase', phaseId, highlight, detected, range, syncId, height = 220, showEvents = true, showLegend = true }: Props) {
  const { settings } = useWorkspace();
  const pid = phaseId ?? focus.phases[3]!.id;
  const lines = useMemo(() => [focus, ...overlay.filter((b) => b.id !== focus.id)], [focus, overlay]);
  const rows = useMemo(
    () => buildRows({ focus, batches: lines, kind, mode, phaseId: pid, references, settings, range }),
    [focus, lines, kind, mode, pid, references, settings, range],
  );
  const series: SeriesDef[] = lines.map((b, i) => ({ key: b.id, label: b.id, color: SERIES_COLORS[i % SERIES_COLORS.length]!, width: i === 0 ? 2 : 1.4 }));
  const missing = lines
    .flatMap((b) => missingBands(b, kind, b.id === focus.id ? 0 : alignmentShift(focus, b, mode, pid)))
    .filter((m) => m.x1 < (range?.[1] ?? focus.elapsedHours) && m.x2 > (range?.[0] ?? 0));
  const events = showEvents ? focus.events.filter((e) => !range || (e.hour >= range[0] && e.hour <= range[1])).map((e) => ({ hour: e.hour, label: e.description })) : [];
  const m = MEASUREMENTS[kind];
  const hasBand = !!references && references.length >= 2;

  return (
    <div>
      <div className="mb-1 flex items-baseline justify-between gap-2">
        <h3 className="text-[13px] font-semibold text-navy-900">
          {m.label} <span className="font-normal text-navy-400">({m.unit})</span>
        </h3>
        {missing.length > 0 && <span className="text-[11px] text-ochre-700">{missing.length} missing interval{missing.length > 1 ? 's' : ''}</span>}
      </div>
      <TimeSeriesChart
        rows={rows}
        kind={kind}
        series={series}
        height={height}
        syncId={syncId}
        phases={phaseBands(focus, focus.status === 'completed' ? undefined : focus.elapsedHours)}
        missing={missing}
        highlight={highlight}
        detected={detected}
        events={events}
        showBand={hasBand}
        xDomain={range}
        ariaLabel={`${m.label} for ${lines.map((l) => l.id).join(', ')}${hasBand ? ` with reference range from ${references!.length} runs` : ''}`}
      />
      {showLegend && (
        <div className="mt-2">
          <ChartLegend
            items={[
              ...series.map((s) => ({ label: s.label, color: s.color })),
              ...(hasBand ? [{ label: `Reference range (${references!.length} runs)`, swatch: 'band' as const }, { label: 'Reference mean', color: '#57a097', swatch: 'dashed' as const }] : []),
              ...(missing.length ? [{ label: 'Missing readings (not filled)', swatch: 'hatch' as const }] : []),
              ...(highlight ? [{ label: 'Investigation window', swatch: 'highlight' as const }] : []),
              ...(showEvents && events.length ? [{ label: 'Process event', color: '#7d93b8', swatch: 'dashed' as const }] : []),
            ]}
          />
        </div>
      )}
    </div>
  );
}
