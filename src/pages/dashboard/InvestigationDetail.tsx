import { useMemo, useState, type FormEvent } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Bot, ShieldAlert } from 'lucide-react';
import type { InvestigationStatus } from '@/types';
import { batchById, batches } from '@/data/batches';
import { FACILITY, fermenterById, memberById, phaseLabel, team } from '@/data/facility';
import { assessComparability } from '@/lib/comparison';
import { buildEvidence } from '@/lib/evidence';
import { missingInWindow, seriesCompleteness } from '@/lib/dataQuality';
import { pointsInWindow } from '@/lib/batch';
import { INVESTIGATION_STATUS_LABEL, MEASUREMENTS, MEASUREMENT_KINDS, MISSING_REASON_LABEL, formatDateTime, formatValue } from '@/lib/format';
import { useWorkspace } from '@/state/store';
import { BatchLink, Callout, ComparabilityBadge, EmptyState, InvestigationStatusBadge, PageHeader, Panel, RoleNote, SegmentedControl, cx } from '@/components/ui';
import { ROLE_LABEL } from '@/lib/access';
import { MeasurementPanel } from '@/components/dashboard/MeasurementPanel';

const NOTE_MAX = 2000;

export default function InvestigationDetail() {
  const { investigationId = '' } = useParams();
  const { investigations, settings, setStatus, assign, addNote, setReferences, can, role } = useWorkspace();
  const inv = investigations.find((i) => i.id === investigationId);
  const [note, setNote] = useState('');
  const [noteError, setNoteError] = useState<string | null>(null);
  const [editRefs, setEditRefs] = useState(false);

  const batch = inv ? batchById(inv.batchId) : undefined;
  const refs = useMemo(() => (inv ? inv.referenceBatchIds.map((id) => batchById(id)).filter((b): b is NonNullable<typeof b> => !!b) : []), [inv]);
  const refAssessments = useMemo(
    () => (inv && batch ? refs.map((r) => ({ r, a: assessComparability(batch, r, { phaseId: inv.phaseId, measurement: inv.measurement, window: inv.window }, settings) })) : []),
    [inv, batch, refs, settings],
  );
  const usableRefs = refAssessments.filter((x) => x.a.level !== 'incompatible').map((x) => x.r);
  const evidence = useMemo(() => (inv && batch ? buildEvidence(inv, batch, usableRefs) : null), [inv, batch, usableRefs]);

  if (!inv || !batch || !evidence) {
    return (
      <EmptyState title={`Investigation ${investigationId} was not found`}>
        <Link to="/batches/investigations" className="text-forest-700 underline">Back to investigations</Link>
      </EmptyState>
    );
  }

  const pad = Math.max(4, (inv.window.endHour - inv.window.startHour) * 1.2);
  const range: [number, number] = [Math.max(0, inv.window.startHour - pad), Math.min(batch.elapsedHours, inv.window.endHour + pad)];
  const highlight = { x1: inv.window.startHour, x2: inv.window.endHour, label: 'Investigation window' };
  const gaps = missingInWindow(batch, { startHour: range[0], endHour: range[1] });
  const events = batch.events.filter((e) => e.hour >= range[0] && e.hour <= range[1]);
  const fermenter = fermenterById(batch.fermenterId);

  const submitNote = (e: FormEvent) => {
    e.preventDefault();
    const body = note.trim();
    if (body.length < 5) return setNoteError('Notes must be at least 5 characters.');
    if (body.length > NOTE_MAX) return setNoteError(`Notes must be under ${NOTE_MAX} characters.`);
    addNote(inv.id, body);
    setNote('');
    setNoteError(null);
  };

  const candidates = batches.filter((b) => b.id !== batch.id && b.processCode === batch.processCode);

  return (
    <>
      <Link to="/batches/investigations" className="mb-3 inline-flex items-center gap-1 text-xs text-navy-500 hover:text-navy-800">
        <ArrowLeft className="h-3.5 w-3.5" aria-hidden /> Investigations
      </Link>
      <PageHeader eyebrow={`${inv.id} · ${MEASUREMENTS[inv.measurement].label}`} title={inv.title} description={<>Batch <BatchLink id={batch.id} /> · {phaseLabel(inv.phaseId)} · window {inv.window.startHour}–{inv.window.endHour} h</>} actions={<InvestigationStatusBadge status={inv.status} />} />

      <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
        <div className="min-w-0 space-y-6">
          <Panel title="Evidence window" actions={<span className="text-[11px] text-navy-500">{usableRefs.length} reference runs · phase-aligned</span>}>
            <div className="space-y-6">
              {[inv.measurement, ...MEASUREMENT_KINDS.filter((k) => k !== inv.measurement)].map((k) => (
                <MeasurementPanel key={k} kind={k} focus={batch} references={usableRefs} phaseId={inv.phaseId} syncId={`inv-${inv.id}`} range={range} highlight={highlight} height={k === inv.measurement ? 230 : 180} />
              ))}
            </div>
          </Panel>

          <Panel title="Corresponding measurements in window" bodyClassName="p-0">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[560px] text-[12.5px]">
                <thead>
                  <tr className="border-b border-line bg-paper-2/60 text-left text-xs text-navy-500">
                    {['Measurement', 'Focus min', 'Focus mean', 'Focus max', 'Reference means', 'Completeness'].map((h) => <th key={h} scope="col" className="px-4 py-2.5 font-medium">{h}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {evidence.items.map((it) => (
                    <tr key={it.kind} className="border-b border-line last:border-0">
                      <th scope="row" className="px-4 py-2 text-left font-medium text-navy-800">{MEASUREMENTS[it.kind].label}</th>
                      <td className="data px-4 py-2">{formatValue(it.kind, it.focus?.min ?? null)}</td>
                      <td className="data px-4 py-2">{formatValue(it.kind, it.focus?.mean ?? null)}</td>
                      <td className="data px-4 py-2">{formatValue(it.kind, it.focus?.max ?? null)}</td>
                      <td className="data px-4 py-2">{it.reference ? `${formatValue(it.kind, it.reference.min, false)} – ${formatValue(it.kind, it.reference.max, false)}` : 'Not computable'}</td>
                      <td className={cx('data px-4 py-2', it.completeness < settings.completenessThreshold && 'text-ochre-700')}>{(it.completeness * 100).toFixed(0)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <details className="border-t border-line px-4 py-3 text-xs">
              <summary className="cursor-pointer font-medium text-navy-700">Raw {MEASUREMENTS[inv.measurement].label.toLowerCase()} readings in window</summary>
              <div className="data mt-2 grid max-h-48 grid-cols-3 gap-x-4 gap-y-0.5 overflow-y-auto sm:grid-cols-6">
                {pointsInWindow(batch.series[inv.measurement].points, inv.window).map((p) => (
                  <span key={p.t} className={p.value === null ? 'text-ochre-700' : 'text-navy-700'}>{p.t.toFixed(2)}h: {p.value ?? '—'}</span>
                ))}
              </div>
            </details>
          </Panel>

          <div className="grid gap-6 lg:grid-cols-2">
            <Panel title="Process events" bodyClassName="p-0">
              {events.length ? (
                <ul className="divide-y divide-line">
                  {events.map((e) => {
                    const inside = e.hour >= inv.window.startHour && e.hour <= inv.window.endHour;
                    return (
                      <li key={e.id} className={cx('px-4 py-2.5 text-[12.5px]', inside && 'bg-ochre-50/60')}>
                        <div className="data text-[11px] text-navy-400">{e.hour.toFixed(2)} h · {e.type.replace('-', ' ')}{inside && ' · in window'}</div>
                        <div className="text-navy-800">{e.description}</div>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p className="p-4 text-sm text-navy-500">No events recorded in this range.</p>
              )}
            </Panel>
            <Panel title="Missing sensor intervals">
              {gaps.length ? (
                <ul className="space-y-2 text-[12.5px]">
                  {gaps.map((g) => (
                    <li key={`${g.kind}-${g.startHour}`} className="rounded-md border border-ochre-300/50 bg-ochre-50 px-3 py-2 text-ochre-700">
                      <strong>{MEASUREMENTS[g.kind].label}</strong>: {g.startHour}–{g.endHour} h · {MISSING_REASON_LABEL[g.reason]}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-navy-600">No missing intervals for the focus batch in this range. Completeness: {MEASUREMENT_KINDS.map((k) => `${MEASUREMENTS[k].short} ${(seriesCompleteness(batch, k, inv.window) * 100).toFixed(0)}%`).join(' · ')}.</p>
              )}
              <div className="mt-3 text-[11.5px] text-navy-500">Equipment: {fermenter ? `${fermenter.id} · ${fermenter.doProbe}` : batch.fermenterId}</div>
            </Panel>
          </div>

          <Panel title="Reference runs used for comparison" actions={<button type="button" className="text-xs font-medium text-forest-700 hover:underline" onClick={() => setEditRefs((v) => !v)} aria-expanded={editRefs} disabled={!can('references')} title={can('references') ? undefined : 'Your role cannot edit reference runs'}>{editRefs ? 'Done' : 'Edit references'}</button>} bodyClassName="p-0">
            <ul className="divide-y divide-line">
              {(editRefs ? candidates : refs).map((r) => {
                const a = assessComparability(batch, r, { phaseId: inv.phaseId, measurement: inv.measurement, window: inv.window }, settings);
                const on = inv.referenceBatchIds.includes(r.id);
                return (
                  <li key={r.id} className="flex items-start gap-3 px-4 py-3">
                    {editRefs && <input type="checkbox" aria-label={`Use ${r.id} as reference`} className="mt-1 h-4 w-4 accent-forest-700" checked={on} onChange={() => setReferences(inv.id, on ? inv.referenceBatchIds.filter((x) => x !== r.id) : [...inv.referenceBatchIds, r.id])} />}
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span><BatchLink id={r.id} /> <span className="text-[11px] text-navy-500">{r.recipeVersion} · {r.fermenterId}</span></span>
                        <ComparabilityBadge level={a.level} />
                      </div>
                      {a.issues.map((i, n) => <div key={n} className={cx('mt-1 text-[11.5px]', i.severity === 'incompatible' ? 'text-brick-700' : 'text-ochre-700')}>{i.message}{i.severity === 'incompatible' && ' Excluded from the reference range.'}</div>)}
                    </div>
                  </li>
                );
              })}
            </ul>
          </Panel>
        </div>

        <aside className="space-y-6">
          <section className="card overflow-hidden border-teal-200" aria-labelledby="evidence-title">
            <header className="flex items-center justify-between gap-2 border-b border-teal-100 bg-teal-50/70 px-4 py-3">
              <h2 id="evidence-title" className="flex items-center gap-2 text-sm font-semibold text-teal-900"><Bot className="h-4 w-4" aria-hidden /> Evidence summary</h2>
              <span className="rounded-full bg-ochre-50 px-2 py-0.5 text-[10px] font-medium text-ochre-700 ring-1 ring-ochre-100">Simulated AI-generated</span>
            </header>
            <div className="space-y-4 p-4 text-[13px] leading-relaxed text-navy-700">
              <p className="font-medium text-navy-900">{evidence.headline}</p>
              {evidence.observations.length > 0 && (
                <div>
                  <h3 className="mb-1 text-[11px] font-semibold tracking-wide text-navy-500 uppercase">Observations</h3>
                  <ul className="list-disc space-y-1 pl-4">{evidence.observations.map((o) => <li key={o}>{o}</li>)}</ul>
                </div>
              )}
              {evidence.limitations.length > 0 && (
                <div>
                  <h3 className="mb-1 text-[11px] font-semibold tracking-wide text-navy-500 uppercase">Limitations</h3>
                  <ul className="list-disc space-y-1 pl-4 text-ochre-700">{evidence.limitations.map((o) => <li key={o}>{o}</li>)}</ul>
                </div>
              )}
              <div>
                <h3 className="mb-1 text-[11px] font-semibold tracking-wide text-navy-500 uppercase">Suggested review checks</h3>
                <ul className="list-disc space-y-1 pl-4">{evidence.checks.map((o) => <li key={o}>{o}</li>)}</ul>
              </div>
              <div className="flex gap-2 rounded-md bg-paper-2 p-3 text-[11.5px] text-navy-600">
                <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-navy-400" aria-hidden />
                <span>Generated from a template in this demo — no AI model was called. It describes differences only: it does not identify a cause (such as contamination), recommend dosing or setpoint changes, or approve the batch for release.</span>
              </div>
            </div>
          </section>

          <Panel title="Workflow">
            <div className="space-y-4">
              {(!can('status') || !can('assign')) && <RoleNote>Acting as {ROLE_LABEL[role].toLowerCase()}: status and assignment are read-only. Switch user in the header to try another role.</RoleNote>}
              <div>
                <span className="label">Status</span>
                <SegmentedControl<InvestigationStatus> label="Investigation status" value={inv.status} disabled={!can('status')} onChange={(s) => setStatus(inv.id, s)} options={(Object.keys(INVESTIGATION_STATUS_LABEL) as InvestigationStatus[]).map((s) => ({ value: s, label: INVESTIGATION_STATUS_LABEL[s] }))} />
              </div>
              <div>
                <label htmlFor="assignee" className="label">Assigned to</label>
                <select id="assignee" className="input disabled:cursor-not-allowed disabled:opacity-60" disabled={!can('assign')} value={inv.assigneeId ?? ''} onChange={(e) => assign(inv.id, e.target.value || null)}>
                  <option value="">Unassigned</option>
                  {team.map((m) => <option key={m.id} value={m.id}>{m.name} — {m.role}</option>)}
                </select>
              </div>
              {inv.status === 'resolved' && <Callout tone="info">Resolving records that the review is complete. It is not a batch release decision.</Callout>}
            </div>
          </Panel>

          <Panel title={`Engineer notes (${inv.notes.length})`}>
            <ul className="mb-4 space-y-3">
              {inv.notes.map((n) => (
                <li key={n.id} className="rounded-md border border-line bg-paper/60 p-3 text-[13px]">
                  <div className="mb-1 text-[11px] text-navy-500">{memberById(n.authorId)?.name ?? 'Unknown'} · {formatDateTime(n.createdAt)}</div>
                  <p className="whitespace-pre-wrap text-navy-800">{n.body}</p>
                </li>
              ))}
              {!inv.notes.length && <li className="text-sm text-navy-500">No notes yet.</li>}
            </ul>
            {!can('note') ? (
              <RoleNote>Acting as {ROLE_LABEL[role].toLowerCase()}: you can read notes but not add them.</RoleNote>
            ) : (
            <form onSubmit={submitNote} noValidate>
              <label htmlFor="note" className="label">Add a note as {memberById(settings.currentUserId)?.name}</label>
              <textarea id="note" className="input min-h-24" value={note} onChange={(e) => { setNote(e.target.value); if (noteError) setNoteError(null); }} aria-invalid={noteError ? true : undefined} aria-describedby={noteError ? 'note-err' : undefined} placeholder="Record observations, checks performed and findings…" />
              <div className="mt-1 flex items-center justify-between">
                {noteError ? <p id="note-err" className="text-xs text-brick-700">{noteError}</p> : <span />}
                <span className={cx('text-[11px]', note.length > NOTE_MAX ? 'text-brick-700' : 'text-navy-400')}>{note.length}/{NOTE_MAX}</span>
              </div>
              <button type="submit" className="btn-primary btn-sm mt-2">Add note</button>
            </form>
            )}
          </Panel>

          <Panel title="History">
            <ol className="space-y-2.5 text-[12px]">
              {[...inv.history].reverse().map((h) => (
                <li key={h.id}>
                  <div className="text-navy-800">{h.action}</div>
                  <div className="text-[11px] text-navy-400">{h.actorId === 'system' ? 'Cultivane' : memberById(h.actorId)?.name} · {formatDateTime(h.at)}</div>
                </li>
              ))}
            </ol>
            <p className="mt-3 text-[11px] text-navy-400">Workspace clock starts at the dataset snapshot ({formatDateTime(FACILITY.snapshotAt)}).</p>
          </Panel>
        </aside>
      </div>
    </>
  );
}
