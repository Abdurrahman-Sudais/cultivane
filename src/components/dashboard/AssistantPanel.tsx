import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Bot, Info, MessageSquare } from 'lucide-react';
import { batches } from '@/data/batches';
import { EXAMPLE_QUESTIONS, answer, type AssistantAnswer } from '@/lib/assistant';
import { useWorkspace } from '@/state/store';
import { cx } from '@/components/ui';

/** “Ask about this facility” — answers from the demo records and lists the records it used. */
export function AssistantPanel() {
  const { investigations, settings } = useWorkspace();
  const [q, setQ] = useState('');
  const [asked, setAsked] = useState<{ q: string; a: AssistantAnswer } | null>(null);

  const ask = (question: string) => {
    if (!question.trim()) return;
    setAsked({ q: question.trim(), a: answer(question, { batches, investigations, settings }) });
    setQ('');
  };
  const submit = (e: FormEvent) => {
    e.preventDefault();
    ask(q);
  };

  return (
    <section className="card overflow-hidden border-teal-200" aria-labelledby="assistant-title">
      <header className="flex items-center gap-2 border-b border-teal-100 bg-teal-50/70 px-4 py-3">
        <Bot className="h-4 w-4 text-teal-700" aria-hidden />
        <h2 id="assistant-title" className="text-sm font-semibold text-teal-900">
          Ask about this facility
        </h2>
        <span className="rounded-full bg-white px-2 py-0.5 font-mono text-[10px] tracking-wide text-teal-700 uppercase ring-1 ring-teal-100">Simulated assistant</span>
      </header>
      <div className="space-y-4 p-4">
        <div className="flex flex-wrap gap-2">
          {EXAMPLE_QUESTIONS.map((e) => (
            <button key={e} type="button" onClick={() => ask(e)} className="rounded-full border border-line bg-white px-3 py-1.5 text-[12px] text-navy-700 hover:border-teal-300 hover:bg-teal-50">
              {e}
            </button>
          ))}
        </div>
        <form onSubmit={submit} className="flex gap-2">
          <label htmlFor="assistant-q" className="sr-only">
            Ask a question about the demo facility
          </label>
          <input id="assistant-q" className="input" value={q} onChange={(e) => setQ(e.target.value)} placeholder="e.g. What happened to XYN-24-041?" maxLength={200} />
          <button type="submit" className="btn-primary btn-sm shrink-0">
            <MessageSquare className="h-3.5 w-3.5" aria-hidden /> Ask
          </button>
        </form>
        {asked && (
          <div className={cx('rounded-lg border p-4', asked.a.kind === 'refusal' ? 'border-ochre-300/60 bg-ochre-50' : 'border-line bg-paper/60')} aria-live="polite">
            <p className="text-[11px] text-navy-500">“{asked.q}”</p>
            <h3 className="mt-1 text-[15px] font-semibold text-navy-900">{asked.a.title}</h3>
            <ul className="mt-2 space-y-1.5 text-[13px] leading-relaxed text-navy-700">
              {asked.a.lines.map((l) => (
                <li key={l}>{l}</li>
              ))}
            </ul>
            {asked.a.sources.length > 0 && (
              <p className="data mt-3 text-[11px] text-navy-500">
                From {asked.a.sources.length} record{asked.a.sources.length > 1 ? 's' : ''}: {asked.a.sources.join(', ')}
              </p>
            )}
            {asked.a.links.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-3">
                {asked.a.links.map((l) => (
                  <Link key={l.to} to={l.to} className="inline-flex items-center gap-1 text-[12px] font-medium text-forest-700 hover:underline">
                    {l.label} <ArrowRight className="h-3 w-3" aria-hidden />
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}
        <p className="flex items-start gap-1.5 text-[11px] text-navy-500">
          <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden /> Answers are computed from this demo’s records and list the records used. No language model is called. It never identifies causes, recommends dosing or setpoint changes, or approves batches for release.
        </p>
      </div>
    </section>
  );
}
