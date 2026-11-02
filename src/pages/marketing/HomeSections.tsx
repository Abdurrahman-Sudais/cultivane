import { Link } from 'react-router-dom';
import { ArrowRight, Bot, Check, Clock, Compass, Lock, Mail, Rocket, ShieldCheck, Sparkles, X } from 'lucide-react';
import type { CSSProperties } from 'react';
import { FOUNDERS, site, type Person } from '@/config/site';
import { pricingConfig } from '@/config/pricing';
import { Container, SectionHeading } from '@/components/marketing/primitives';
import { LeadForm } from '@/components/marketing/LeadForm';
import { cx } from '@/components/ui';
import { SAFEGUARDS } from './Security';
import { PIPELINE } from './Technology';

const d = (ms: number) => ({ '--d': `${ms}ms` }) as CSSProperties;

export function AiSection() {
  return (
    <section className="py-20 sm:py-24">
      <Container className="grid gap-12 lg:grid-cols-[1fr_1.1fr] lg:items-start">
        <div>
          <SectionHeading eyebrow="AI, used carefully" title="Answers from your own batch records, not guesses.">
            <p>Cultivane’s assistant explains what the calculations found. The numbers come from deterministic, phase-aligned comparisons; the wording only makes them easier to read.</p>
          </SectionHeading>
          <ul className="mt-8 space-y-3">
            {(
              [
                [true, 'Summarise how a batch differs from its matched runs, with the window, phase and reference set'],
                [true, 'Answer “which investigations need attention?” and “which batches have data problems?”'],
                [true, 'List the records it used, so every answer can be checked'],
                [true, 'Suggest review checks for the engineer — not conclusions'],
                [false, 'Identify a cause such as contamination'],
                [false, 'Recommend dosing or setpoint changes, forecast yield, or approve batch release'],
              ] as const
            ).map(([ok, t], i) => (
              <li key={t} className="card reveal lift flex gap-3 p-4 text-sm text-navy-700" style={d(i * 60)}>
                {ok ? <Check className="mt-0.5 h-4 w-4 shrink-0 text-forest-600" aria-label="Does" /> : <X className="mt-0.5 h-4 w-4 shrink-0 text-brick-500" aria-label="Never does" />}
                {t}
              </li>
            ))}
          </ul>
        </div>
        <div className="reveal relative" style={d(120)}>
          <div className="pointer-events-none absolute -inset-4 rounded-2xl bg-mint-300/30 blur-2xl" aria-hidden />
          <div className="tech-grid-dark relative rounded-2xl bg-forest-950 p-6 text-paper shadow-2xl shadow-forest-950/30">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Bot className="h-4 w-4 text-mint-300" aria-hidden /> Ask about this facility
              <span className="rounded border border-white/15 px-1.5 py-0.5 font-mono text-[10px] tracking-wider text-paper/60 uppercase">Sample data</span>
            </div>
            <p className="mt-5 ml-auto w-fit max-w-[85%] rounded-lg rounded-br-sm bg-mint-300/15 px-3 py-2 text-sm text-mint-100">What happened to AMY-24-118?</p>
            <div className="mt-3 max-w-[92%] rounded-lg rounded-bl-sm border border-white/10 bg-white/5 p-3 text-sm text-paper/85">
              <p>
                <span className="font-mono text-paper">AMY-24-118</span> · AMY-L3 v4.2 on FV-201. Dissolved oxygen sits below the range of 4 matched runs between 31.75 h and 35.75 h in fed-batch.
              </p>
              <p className="mt-2">
                <span className="font-mono text-paper">INV-0007</span> is open and unassigned.
              </p>
              <p className="mt-3 font-mono text-[11px] text-paper/50">From records AMY-24-118, INV-0007</p>
            </div>
            <p className="mt-4 ml-auto w-fit rounded-lg rounded-br-sm bg-mint-300/15 px-3 py-2 text-sm text-mint-100">Is it contaminated?</p>
            <div className="mt-3 max-w-[92%] rounded-lg rounded-bl-sm border border-white/10 bg-white/5 p-3 text-sm text-paper/75">That’s a decision for your engineers and quality team. I can show which measurement differs, over which window, against which reference runs.</div>
            <Link to="/batches" className="btn mt-6 bg-mint-300 text-forest-950 hover:bg-mint-400">
              Try the assistant in the demo <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>
        </div>
      </Container>
    </section>
  );
}

export function SafeguardsSection() {
  return (
    <section className="tech-grid-dark bg-forest-950 py-20 text-paper sm:py-24">
      <Container>
        <div className="eyebrow reveal mb-3 flex items-center gap-2 text-mint-300">
          <span className="h-px w-6 bg-mint-300" aria-hidden /> Safeguards
        </div>
        <h2 className="reveal max-w-2xl text-3xl font-semibold sm:text-[2.35rem] sm:leading-[1.12]">Data informs the review. Engineers decide.</h2>
        <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {SAFEGUARDS.map(([t, b], i) => (
            <div key={t} className="reveal lift rounded-xl border border-white/10 bg-white/5 p-6 hover:border-mint-300/40" style={d((i % 3) * 90)}>
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-mint-300/10">
                <ShieldCheck className="h-5 w-5 text-mint-300" aria-hidden />
              </span>
              <h3 className="mt-4 font-semibold text-paper">{t}</h3>
              <p className="mt-2 text-sm text-paper/65">{b}</p>
            </div>
          ))}
        </div>
        <Link to="/security" className="mt-8 inline-flex items-center gap-2 text-sm font-medium text-mint-300 hover:underline">
          Security and safeguards in detail <ArrowRight className="h-4 w-4" aria-hidden />
        </Link>
      </Container>
    </section>
  );
}

export function TechnologySection() {
  return (
    <section id="technology" className="border-y border-line bg-paper-2/60 py-20 sm:py-24">
      <Container>
        <SectionHeading eyebrow="Technology" title="How we use Amazon Web Services">
          <p>A proposed serverless architecture: capture at the historian, keep every number traceable, keep the analysis deterministic, and use Amazon Bedrock only to explain.</p>
        </SectionHeading>
        <ol className="relative mt-12 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {PIPELINE.map((p, i) => (
            <li key={p.step} className="card reveal lift spot p-5" style={d(i * 90)}>
              <span className="data text-xs text-teal-600">{p.step}</span>
              <h3 className="mt-2 font-semibold text-navy-900">{p.title}</h3>
              <p className="data mt-1 text-[11px] text-teal-700">{p.services}</p>
              <p className="mt-3 text-sm leading-relaxed text-navy-600">{p.body}</p>
            </li>
          ))}
        </ol>
        <p className="mt-6 text-sm text-navy-500">These services are proposed, not deployed. The demo runs in your browser on simulated data.</p>
        <Link to="/technology" className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-forest-700 hover:underline">
          The full architecture <ArrowRight className="h-4 w-4" aria-hidden />
        </Link>
      </Container>
    </section>
  );
}

export function PricingSection() {
  return (
    <section id="pricing" className="py-20 sm:py-24">
      <Container>
        <SectionHeading eyebrow="Pricing" title="Simple plans that grow with your operation" center />
        <div className="mt-12 grid gap-5 lg:grid-cols-3">
          {pricingConfig.plans.map((p, i) => {
            const featured = 'highlighted' in p && p.highlighted;
            return (
              <div key={p.id} className={cx('reveal lift spot relative flex flex-col rounded-2xl border p-6', featured ? 'border-forest-600 bg-forest-950 text-paper ring-1 ring-forest-600/40' : 'card')} style={d(i * 100)}>
                {featured && <span className="absolute -top-3 left-6 rounded-full bg-lime-300 px-2.5 py-0.5 text-xs font-medium text-forest-950">Most popular</span>}
                <h3 className={cx('text-lg font-semibold', featured ? 'text-paper' : 'text-navy-900')}>{p.name}</h3>
                <p className={cx('mt-1 text-sm', featured ? 'text-paper/65' : 'text-navy-500')}>{p.audience}</p>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className={cx('text-4xl font-semibold', featured ? 'text-paper' : 'text-navy-900')}>{p.monthlyPrice === null ? 'Custom' : `$${p.monthlyPrice}`}</span>
                  {p.monthlyPrice !== null && <span className={featured ? 'text-paper/60' : 'text-navy-500'}>/month</span>}
                </div>
                <ul className="mt-5 flex-1 space-y-2.5">
                  {p.features.map((f) => (
                    <li key={f} className={cx('flex gap-2 text-sm', featured ? 'text-paper/85' : 'text-navy-700')}>
                      <Check className={cx('mt-0.5 h-4 w-4 shrink-0', featured ? 'text-mint-300' : 'text-forest-600')} aria-hidden /> {f}
                    </li>
                  ))}
                </ul>
                <Link to={`/contact?plan=${p.id}`} className={cx('mt-6', featured ? 'btn bg-mint-300 text-forest-950 hover:bg-mint-400' : 'btn-secondary')}>
                  {p.cta}
                </Link>
              </div>
            );
          })}
        </div>
        <p className="mt-6 text-center text-sm text-navy-500">
          Prices in USD, excluding taxes. Early-access teams are onboarded directly by the founders.{' '}
          <Link to="/pricing" className="text-forest-700 underline">
            Compare plans
          </Link>
        </p>
      </Container>
    </section>
  );
}

export const ROADMAP = [
  { icon: Sparkles, stage: 'Now', title: 'Live demo & early access', items: ['Interactive workspace on a simulated enzyme facility', 'Phase-aligned comparisons, matched references, data-quality checks', 'Roles, audit log and grounded assistant', 'Early-access requests open'], current: true },
  { icon: Compass, stage: 'Next', title: 'Pilot on one line', items: ['Connect one line’s historian (OPC UA / PI) and LIMS export', 'Matched reference sets on your own recipes', 'Investigation workflow with email notifications'] },
  { icon: Rocket, stage: 'Then', title: 'General availability', items: ['Multiple lines and sites', 'Single sign-on with roles enforced on the server', 'Evidence summaries written with Amazon Bedrock', 'Audit exports for technical review'] },
  { icon: Clock, stage: 'Later', title: 'Exploring with pilot teams', items: ['MES and electronic batch-record integrations', 'Campaign-level reporting across products', 'Multi-site process libraries'] },
];

export function RoadmapSection() {
  return (
    <section id="roadmap" className="border-y border-line bg-paper-2/60 py-20 sm:py-24">
      <Container>
        <SectionHeading eyebrow="Roadmap" title="Where Cultivane is going">
          <p>Built with early-access teams. The order below is our plan and may change based on what pilots teach us.</p>
        </SectionHeading>
        <ol className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {ROADMAP.map((r, i) => (
            <li key={r.stage} className={cx('reveal lift rounded-2xl border bg-white p-6', r.current ? 'border-forest-500 shadow-[0_18px_40px_-24px_rgba(33,90,68,0.5)]' : 'border-line')} style={d(i * 100)}>
              <div className="flex items-center justify-between">
                <span className={cx('flex h-10 w-10 items-center justify-center rounded-lg', r.current ? 'bg-forest-800 text-mint-200' : 'bg-paper-2 text-navy-500')}>
                  <r.icon className="h-5 w-5" aria-hidden />
                </span>
                <span className={cx('flex items-center gap-2 font-mono text-xs tracking-wider uppercase', r.current ? 'text-forest-700' : 'text-navy-400')}>
                  {r.current && <span className="live-dot" aria-hidden />}
                  {r.stage}
                </span>
              </div>
              <h3 className="mt-4 font-semibold text-navy-900">{r.title}</h3>
              <ul className="mt-3 space-y-2">
                {r.items.map((t) => (
                  <li key={t} className="flex gap-2 text-sm text-navy-600">
                    <Check className={cx('mt-0.5 h-4 w-4 shrink-0', r.current ? 'text-forest-600' : 'text-navy-300')} aria-hidden /> {t}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  );
}

export function PersonCard({ person, delay = 0 }: { person: Person; delay?: number }) {
  return (
    <article className="reveal lift spot relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-forest-900 to-navy-900 p-6 text-paper sm:p-8" style={d(delay)}>
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
        <div className="relative grid h-24 w-24 shrink-0 place-items-center" aria-hidden>
          <div className="spin-slow absolute inset-0 rounded-full bg-[conic-gradient(from_0deg,#95d4ac,#3e8780,#d4e88f,#95d4ac)]" style={{ animationDelay: `-${delay / 10}s` }} />
          <div className="absolute inset-[3px] grid place-items-center rounded-full bg-forest-950 font-mono text-2xl text-mint-200">{person.initials}</div>
        </div>
        <div>
          <p className="eyebrow text-mint-300">{person.role}</p>
          <h3 className="mt-1 text-2xl font-semibold">{person.name}</h3>
          <p className="mt-3 max-w-xl text-paper/75">{person.bio}</p>
          <ul className="mt-4 flex flex-wrap gap-2" aria-label="Focus areas">
            {person.focus.map((f) => (
              <li key={f} className="rounded-full border border-white/15 bg-white/5 px-2.5 py-1 text-xs text-paper/80">
                {f}
              </li>
            ))}
          </ul>
          {person.email && (
            <a href={`mailto:${person.email}`} className="mt-4 inline-flex items-center gap-1.5 text-sm text-mint-300 hover:underline">
              <Mail className="h-4 w-4" aria-hidden /> {person.email}
            </a>
          )}
        </div>
      </div>
    </article>
  );
}

export function FoundersGrid() {
  return (
    <div className="grid gap-5 lg:grid-cols-2">
      {FOUNDERS.map((p, i) => (
        <PersonCard key={p.name} person={p} delay={i * 120} />
      ))}
    </div>
  );
}

export function TeamSection() {
  return (
    <section id="team" className="py-20 sm:py-24">
      <Container>
        <SectionHeading eyebrow="Team" title="The people building Cultivane">
          <p>Founded by {FOUNDERS.map((f) => f.name).join(' and ')}, and built together with the process engineers and scientists who will use it.</p>
        </SectionHeading>
        <div className="mt-12">
          <FoundersGrid />
        </div>
        <div className="card reveal mt-5 grid gap-6 p-6 sm:p-8 lg:grid-cols-[1.2fr_1fr] lg:items-center">
          <div>
            <h3 className="text-lg font-semibold text-navy-900">Building with fermentation teams</h3>
            <p className="mt-2 text-sm text-navy-600">Cultivane is shaped by conversations with process engineers, fermentation scientists and QC teams. Early-access teams get a direct line to the founders and a say in what we build next.</p>
            <Link to="/about" className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-forest-700 hover:underline">
              Our story <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>
          <div>
            <p className="eyebrow">We’d like to hear from</p>
            <ul className="mt-3 space-y-2 text-sm text-navy-700">
              {['Facilities willing to pilot on one line', 'Process engineers and fermentation scientists', 'Advisors who know industrial biotech'].map((t) => (
                <li key={t} className="flex gap-2">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-forest-600" aria-hidden /> {t}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Container>
    </section>
  );
}

export const FAQS: [string, string][] = [
  ['Does Cultivane tell us what went wrong with a batch?', 'No. It shows how a batch differs from its own matched reference runs — which measurement, over which window and phase — and gathers the related signals, events and data gaps. Your engineers interpret the evidence and decide on the cause.'],
  ['What problem does it actually solve?', 'Fermentation data lives in the historian, the LIMS and engineers’ notebooks, and batches are often compared by clock time or against one “golden batch”. Cultivane aligns runs by process phase, compares each batch only with genuinely comparable runs, and keeps investigations attached to the batch record.'],
  ['Why not compare against a golden batch?', 'Recipes evolve, vessels differ and phases start at different times. A single golden batch mixes conditions that were never meant to line up. Cultivane builds a matched reference set for each batch and explains any run it excludes.'],
  ['What data do we need?', 'Temperature, pH and dissolved oxygen from your historian (OPC UA or PI, or CSV exports), plus batch, recipe and vessel metadata. Offline samples from the LIMS are optional but useful.'],
  ['What happens to missing readings?', 'They stay missing. Gaps are drawn as breaks with hatched intervals, never zero-filled or interpolated, and stale feeds are flagged rather than shown as current.'],
  ['Who can change what?', 'Production managers, process engineers, data analysts and reviewers each get only the actions they need, and every change is written to an audit log. Try “Demo as” in the dashboard.'],
  ['What does the AI do?', 'It explains calculated results in plain language and answers questions from your own records, listing the records it used. It never names causes, recommends dosing or setpoint changes, or approves release.'],
  ['Is it validated for GMP use?', 'Not yet. Cultivane starts with nonclinical industrial enzyme production. Validation requirements for regulated processes are discussed case by case.'],
  ['How much does it cost?', `Development is $${pricingConfig.plans[0]?.monthlyPrice}/month and Production is $${pricingConfig.plans[1]?.monthlyPrice}/month; Enterprise is priced per deployment. Prices exclude taxes.`],
  ['Is it available today?', 'Cultivane is in early access. The demo workspace runs in your browser on simulated data; a pilot connects one line’s real data. Request early access and one of the founders will reply personally.'],
];

export function FaqSection() {
  return (
    <section id="faq" className="border-y border-line bg-paper-2/60 py-20 sm:py-24">
      <Container className="grid gap-10 lg:grid-cols-[1fr_2fr]">
        <div>
          <SectionHeading eyebrow="FAQ" title="Questions fermentation teams ask" />
          <a href={`mailto:${site.email}`} className="reveal mt-6 inline-flex items-center gap-2 text-sm font-medium text-forest-700 hover:underline">
            <Mail className="h-4 w-4" aria-hidden /> Email the founders
          </a>
        </div>
        <div className="card reveal divide-y divide-line">
          {FAQS.map(([q, a]) => (
            <details key={q} className="group px-5 py-4 [&_summary::-webkit-details-marker]:hidden">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium text-navy-900">
                {q}
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full border border-line text-forest-700 transition-transform duration-300 group-open:rotate-45" aria-hidden>
                  +
                </span>
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-navy-600">{a}</p>
            </details>
          ))}
        </div>
      </Container>
    </section>
  );
}

export function EarlyAccessSection() {
  return (
    <section id="early-access" className="py-20 sm:py-24">
      <Container>
        <SectionHeading eyebrow="Early access" title="Request early access">
          <p>Early-access teams get guided setup on one fermentation line and a direct say in what we build next.</p>
        </SectionHeading>
        <div className="mt-12 grid gap-8 lg:grid-cols-[1.4fr_1fr]">
          <div className="card reveal p-6 sm:p-8">
            <LeadForm compact />
          </div>
          <div className="space-y-5">
            <ul className="space-y-3 text-sm text-navy-700">
              {['Guided setup on one line with the data you already have', 'Direct line to the founders', 'Launch pricing on Development, Production or Enterprise', 'No commitment — a request is not a subscription'].map((t) => (
                <li key={t} className="reveal flex gap-2">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-forest-600" aria-hidden /> {t}
                </li>
              ))}
              <li className="reveal flex gap-2 text-navy-500">
                <Lock className="mt-0.5 h-4 w-4 shrink-0" aria-hidden /> Please don’t include confidential recipes or client data.
              </li>
            </ul>
            <div className="tech-grid-dark reveal rounded-2xl bg-forest-950 p-5 text-paper">
              <p className="eyebrow text-mint-300">What happens next</p>
              <ol className="mt-3 space-y-2 text-sm text-paper/80">
                <li>1. A founder replies to arrange a short call.</li>
                <li>2. We look at your process, vessels and data sources.</li>
                <li>3. If it’s a fit, we scope a pilot on one line.</li>
              </ol>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
