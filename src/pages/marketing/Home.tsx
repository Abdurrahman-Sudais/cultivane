import { Link } from 'react-router-dom';
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Bot,
  Building2,
  Check,
  CheckCircle2,
  ClipboardList,
  Cpu,
  ExternalLink,
  Factory,
  FileSearch,
  FlaskConical,
  GitCompare,
  Layers,
  Minus,
  NotebookPen,
  PauseCircle,
  Ruler,
  Upload,
  Users,
  X,
} from 'lucide-react';
import type { CSSProperties, ReactNode } from 'react';
import { useDocumentMeta } from '@/hooks/useDocumentMeta';
import { photos } from '@/config/site';
import { Container, CtaBand, Photo, SectionHeading } from '@/components/marketing/primitives';
import { BatchRecordCard, ComparabilityMatrix, DeviationPreview, PhaseContextChart, ProductPreview } from '@/components/marketing/previews';
import { cx } from '@/components/ui';
import { useCountUp, useCycle } from '@/lib/motion';
import { AiSection, EarlyAccessSection, FaqSection, PricingSection, RoadmapSection, SafeguardsSection, TeamSection, TechnologySection } from './HomeSections';

const d = (ms: number) => ({ '--d': `${ms}ms` }) as CSSProperties;

export const howItWorksSteps = [
  { icon: Layers, title: 'Organise batches and process metadata', body: 'Register recipes, phase plans, fermenters and equipment groups so every batch carries the context needed to interpret it.' },
  { icon: Upload, title: 'Record or import measurements', body: 'Bring in temperature, pH, dissolved oxygen and offline samples from historian exports or manual entry. Gaps stay visible.' },
  { icon: GitCompare, title: 'Compare appropriately matched process runs', body: 'Select reference runs that share recipe, equipment and phase timing. Mismatches are flagged before charts are drawn.' },
  { icon: NotebookPen, title: 'Investigate deviations and record findings', body: 'Open an investigation, review the evidence window, assign an owner and keep notes alongside the batch record.' },
];

/** Published figures used in the problem section. Each one links to its source. */
export const PROBLEM_STATS = [
  {
    value: 7,
    prefix: '~',
    suffix: '%',
    label: 'of bioprocessing batches failed overall, in an industry survey of biomanufacturing facilities.',
    source: 'BioPlan Associates survey, via GEN — Batch failure rates in biomanufacturing',
    url: 'https://www.genengnews.com/insights/batch-failure-rates-in-biomanufacturing',
  },
  {
    value: 3.3,
    decimals: 1,
    prefix: '',
    suffix: '%',
    label: 'of commercial-scale batches were lost to equipment failure — the second most reported cause — in the 2022 survey.',
    source: 'BioProcess Online, 2022 — Bioprocessing sees continued improvements in batch failure reductions',
    url: 'https://www.bioprocessonline.com/doc/bioprocessing-sees-continued-improvements-in-batch-failure-reductions-in-0001',
  },
  {
    value: 5,
    prefix: '<',
    suffix: '%',
    label: 'of the data manufacturing plants generate is used to produce insights and improve operations.',
    source: 'Frost & Sullivan, via RCR Wireless (2019)',
    url: 'https://www.rcrwireless.com/20190531/internet-of-things/manufacturers-use-five-percent-of-data',
  },
];

const OUTCOME_WORDS = ['lost batches', 'repeat deviations', 'unfair comparisons', 'hidden data gaps'] as const;

const BUILT_FOR = ['Industrial enzymes', 'Amylase', 'Protease', 'Xylanase', 'Lipase', 'Cellulase', 'Precision fermentation', 'Bio-based chemicals', 'Contract fermentation', 'Pilot plants', 'Stirred-tank fermenters', 'Fed-batch processes', 'Scale-up campaigns'];

export default function Home() {
  useDocumentMeta({ title: 'Home', path: '/' });
  return (
    <>
      <Hero />
      <BuiltForMarquee />
      <ProblemSection />
      <SolutionSection />
      <PlatformSection />
      <CompareRunsSection />
      <DetectSection />
      <HowItWorksSection />
      <WhoSection />
      <CompareSection />
      <AiSection />
      <SafeguardsSection />
      <TechnologySection />
      <PricingSection />
      <RoadmapSection />
      <TeamSection />
      <FaqSection />
      <EarlyAccessSection />
      <CtaBand />
    </>
  );
}

/* ───────────── Hero ───────────── */

function Hero() {
  const word = useCycle(OUTCOME_WORDS, 2400);
  return (
    <section className="tech-grid relative overflow-hidden border-b border-line">
      <div className="absolute inset-0 bg-gradient-to-b from-paper/10 via-paper/50 to-paper" aria-hidden />
      <div className="hero-glow pointer-events-none absolute -top-40 -left-32 h-[30rem] w-[30rem] rounded-full bg-mint-300/40 blur-3xl" aria-hidden />
      <div className="hero-glow pointer-events-none absolute top-40 -right-40 h-[26rem] w-[26rem] rounded-full bg-teal-200/40 blur-3xl" style={{ animationDelay: '-4s' }} aria-hidden />
      <Bubbles />
      <Container className="relative grid gap-12 pt-16 pb-20 sm:pt-20 lg:grid-cols-[1fr_1.15fr] lg:items-center lg:gap-14">
        <div>
          <Link to="/contact" className="reveal group mb-5 inline-flex items-center gap-2 rounded-full border border-forest-200 bg-white/70 px-3 py-1 text-[12px] text-forest-800 backdrop-blur transition-colors hover:border-forest-400">
            <span className="live-dot" aria-hidden /> Early access open · pilots on one fermentation line
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden />
          </Link>
          <h1 className="reveal text-[2.6rem] leading-[1.04] font-semibold text-navy-900 sm:text-[3.4rem]" style={d(80)}>
            See every fermentation batch in context — before small drifts become <span className="sr-only">lost batches, repeat deviations, unfair comparisons or hidden data gaps.</span>
            <span aria-hidden className="block min-h-[1.1em]">
              <span key={word} className="word-in">
                <span className="text-shimmer">{word}.</span>
              </span>
            </span>
          </h1>
          <p className="reveal mt-6 max-w-xl text-[17px] leading-relaxed text-navy-600" style={d(160)}>
            Cultivane aligns every run by process phase, compares it only with genuinely matched reference runs, and keeps temperature, pH, dissolved oxygen, samples and investigation notes in one record.
          </p>
          <div className="reveal mt-8 flex flex-wrap gap-3" style={d(240)}>
            <Link to="/contact" className="btn-primary px-5 py-3">
              Request early access <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
            <Link to="/batches" className="btn-secondary px-5 py-3">
              Explore the live demo
            </Link>
          </div>
          <ul className="reveal mt-8 grid max-w-lg gap-x-6 gap-y-2 text-sm text-navy-700 sm:grid-cols-2" style={d(320)}>
            {['Phase-aligned, like-for-like comparisons', 'Gaps never zero-filled', 'Every flag explained', 'Engineers make the call'].map((t) => (
              <li key={t} className="flex items-center gap-1.5">
                <Check className="h-4 w-4 text-forest-600" aria-hidden /> {t}
              </li>
            ))}
          </ul>
        </div>
        <div className="reveal relative" style={d(380)}>
          <div className="pointer-events-none absolute -inset-6 rounded-3xl bg-gradient-to-br from-mint-300/30 to-teal-200/20 blur-2xl" aria-hidden />
          <div className="relative">
            <ProductPreview />
          </div>
          <FloatCard className="float -top-8 -left-6 hidden lg:flex" tone="warn" icon={<AlertTriangle className="h-4 w-4" />} title="Pattern for review · AMY-24-118" body="DO below 4 matched runs, 31.75–35.75 h" />
          <FloatCard className="float-slow -right-4 -bottom-10 hidden lg:flex" tone="ok" icon={<CheckCircle2 className="h-4 w-4" />} title="Reference set matched" body="Recipe v4.2 · ST-2000 group · fed-batch" style={{ animationDelay: '-2s' }} />
          <FloatCard className="float -bottom-12 left-6 hidden xl:flex" tone="stale" icon={<PauseCircle className="h-4 w-4" />} title="Excluded · AMY-24-P07" body="50 L pilot vessel — not comparable" style={{ animationDelay: '-4s' }} />
        </div>
      </Container>
    </section>
  );
}

function FloatCard({ className, tone, icon, title, body, style }: { className: string; tone: 'warn' | 'stale' | 'ok'; icon: ReactNode; title: string; body: string; style?: CSSProperties }) {
  const color = { warn: 'text-ochre-500 border-ochre-300/60', stale: 'text-navy-400 border-navy-200', ok: 'text-forest-600 border-forest-200' }[tone];
  return (
    <div className={cx('absolute z-10 max-w-[17rem] items-start gap-3 rounded-lg border bg-white/95 p-3 shadow-[0_20px_40px_-20px_rgba(14,42,34,0.45)] backdrop-blur', color, className)} style={style} aria-hidden>
      <span className="mt-0.5">{icon}</span>
      <span>
        <span className="block text-xs font-semibold text-navy-900">{title}</span>
        <span className="mt-0.5 block text-xs text-navy-600">{body}</span>
      </span>
    </div>
  );
}

/** Rising bubbles in the hero background, like an aerated fermenter. Decorative. */
function Bubbles() {
  const bubbles = [
    [8, 0, 10],
    [18, 1.4, 6],
    [30, 3.1, 8],
    [44, 0.6, 5],
    [58, 2.3, 9],
    [72, 4, 6],
    [86, 1.8, 7],
    [94, 3.4, 5],
  ] as const;
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 h-56 overflow-hidden" aria-hidden>
      {bubbles.map(([left, delay, size], i) => (
        <span key={i} className="bubble absolute bottom-0 rounded-full border border-teal-300/60 bg-mint-200/30" style={{ left: `${left}%`, width: size * 2, height: size * 2, animationDelay: `${delay}s` }} />
      ))}
    </div>
  );
}

function BuiltForMarquee() {
  const row = [...BUILT_FOR, ...BUILT_FOR];
  return (
    <section aria-label="Built for" className="marquee overflow-hidden border-b border-line bg-white py-6">
      <p className="mb-4 text-center font-mono text-[11px] tracking-[0.18em] text-navy-400 uppercase">Built for fermentation teams working with</p>
      <div className="[mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
        <ul className="marquee-track flex w-max gap-10">
          {row.map((t, i) => (
            <li key={i} aria-hidden={i >= BUILT_FOR.length} className="flex items-center gap-10 text-lg font-medium whitespace-nowrap text-navy-400">
              {t}
              <span className="h-1 w-1 rounded-full bg-teal-300" />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ───────────── Problem & solution ───────────── */

function ProblemSection() {
  return (
    <section id="problem" className="py-20 sm:py-24">
      <Container>
        <SectionHeading eyebrow="The problem" title="Batches are still compared by clock time, against one golden batch, across three disconnected systems.">
          <p>Fermentation data lives in the historian, the LIMS and engineers’ notebooks. When a run looks different, the context needed to judge it — recipe revision, vessel, phase, sensor maintenance — has to be pieced together by hand, and the cost of a lost batch is high.</p>
        </SectionHeading>
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {PROBLEM_STATS.map((s, i) => (
            <Stat key={s.source} {...s} delay={i * 120} />
          ))}
        </div>
        <p className="mt-4 text-xs text-navy-400">Published figures from third-party surveys, linked above. They describe the wider bioprocessing and manufacturing industry, not Cultivane results.</p>

        <div className="mt-16 grid gap-12 lg:grid-cols-2 lg:items-center">
          <div>
            <h3 className="reveal text-2xl font-semibold text-navy-900">A reading only means something at the right point in the process.</h3>
            <p className="reveal mt-4 text-[15px] leading-relaxed text-navy-600">
              Dissolved oxygen near saturation is normal after inoculation and striking in late fed-batch. pH drifts as biomass grows, then is held by base addition. Comparing two batches by clock time — or against one fixed “golden batch” — mixes phases, recipes and vessels that were never meant to line up.
            </p>
            <ul className="mt-6 grid gap-3 sm:grid-cols-2">
              {['Phases start at different times in each run', 'Recipe revisions change setpoints', 'Vessel scale changes oxygen transfer', 'Sensor gaps distort averages'].map((t, i) => (
                <li key={t} className="card reveal lift flex items-start gap-2 p-4 text-sm text-navy-700" style={d(i * 70)}>
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-teal-500" aria-hidden />
                  {t}
                </li>
              ))}
            </ul>
          </div>
          <div className="reveal">
            <PhaseContextChart />
          </div>
        </div>
      </Container>
    </section>
  );
}

function Stat({ value, prefix, suffix, label, source, url, delay, decimals = 0 }: (typeof PROBLEM_STATS)[number] & { delay: number; decimals?: number }) {
  const [ref, n] = useCountUp<HTMLDivElement>(value);
  return (
    <figure className="card reveal lift spot p-6" style={d(delay)}>
      <div ref={ref} className="data text-5xl font-medium tracking-tight text-forest-900">
        {prefix}
        {n.toFixed(decimals)}
        <span className="text-teal-500">{suffix}</span>
      </div>
      <figcaption>
        <p className="mt-3 text-navy-700">{label}</p>
        <a href={url} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex items-start gap-1 text-xs text-navy-400 hover:text-forest-700">
          Source: {source} <ExternalLink className="mt-0.5 h-3 w-3 shrink-0" aria-hidden />
        </a>
      </figcaption>
    </figure>
  );
}

function SolutionSection() {
  const today = [
    'Runs are overlaid by clock time or against one golden batch, whatever the recipe or vessel.',
    'A drift is noticed late — when an offline sample or the final titre comes back.',
    'Sensor gaps are averaged over or zero-filled in spreadsheets, quietly skewing comparisons.',
    'The context lives in three systems: the historian, the LIMS and a notebook.',
    'Investigation findings sit in emails and slide decks, detached from the batch.',
  ];
  const withCv = [
    'Each batch is aligned by process phase and compared with its own matched reference runs.',
    'Sustained differences are flagged with the window, phase, reference set and corresponding signals.',
    'Missing readings stay missing and stale feeds are flagged — never filled in.',
    'Recipe, vessel, phases, samples, events and notes live in one batch record.',
    'Investigations are assigned, noted and resolved on the record, with a full audit trail.',
  ];
  return (
    <section id="solution" className="tech-grid-dark bg-forest-950 py-20 text-paper sm:py-24">
      <Container>
        <div className="eyebrow reveal mb-3 flex items-center gap-2 text-mint-300">
          <span className="h-px w-6 bg-mint-300" aria-hidden /> What we solve
        </div>
        <h2 className="reveal max-w-3xl text-3xl font-semibold sm:text-[2.35rem] sm:leading-[1.12]">From piecing it together by hand to evidence on one record — without guessing at causes.</h2>
        <div className="mt-12 grid gap-5 lg:grid-cols-2">
          <div className="reveal rounded-2xl border border-white/10 bg-white/5 p-6 sm:p-8">
            <p className="eyebrow flex items-center gap-2 text-paper/60">
              <X className="h-3.5 w-3.5 text-brick-500" aria-hidden /> Today
            </p>
            <ul className="mt-5 space-y-4">
              {today.map((t) => (
                <li key={t} className="flex gap-3 text-paper/70">
                  <Minus className="mt-1 h-4 w-4 shrink-0 text-paper/40" aria-hidden /> {t}
                </li>
              ))}
            </ul>
          </div>
          <div className="reveal spot relative overflow-hidden rounded-2xl border border-mint-300/30 bg-gradient-to-br from-forest-800 to-teal-900 p-6 sm:p-8" style={d(120)}>
            <p className="eyebrow flex items-center gap-2 text-mint-300">
              <Check className="h-3.5 w-3.5" aria-hidden /> With Cultivane
            </p>
            <ul className="mt-5 space-y-4">
              {withCv.map((t) => (
                <li key={t} className="flex gap-3 text-paper">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-mint-300" aria-hidden /> {t}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Container>
    </section>
  );
}

/* ───────────── Platform ───────────── */

function PlatformSection() {
  return (
    <section id="platform" className="border-y border-line bg-paper-2/60 py-20 sm:py-24">
      <Container>
        <SectionHeading eyebrow="Platform" title="Six modules that follow a batch from inoculation to a recorded finding.">
          <p>Each module writes to the same batch record, so a reading, a comparison and an investigation note show up everywhere they matter.</p>
        </SectionHeading>
        <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          <Module icon={FlaskConical} title="Batch records" body="Recipe version, fermenter, phases, sensor series, offline samples, events and notes in one record." why="The context is attached before anything looks unusual." delay={0}>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <Photo src={photos.processEquipment.src} alt={photos.processEquipment.alt} className="aspect-[4/3]" />
              <Photo src={photos.sampling.src} alt={photos.sampling.alt} className="aspect-[4/3]" />
            </div>
          </Module>
          <Module icon={Ruler} title="Phase alignment" body="Runs are aligned to the start of the phase being compared, so fed-batch lines up with fed-batch." why="Like-for-like by process stage, not by clock." delay={80}>
            <PhaseBars />
          </Module>
          <Module icon={GitCompare} title="Matched reference sets" body="Each batch gets its own references: same recipe version, equipment group and phase coverage. Mismatches are excluded with reasons." why="No universal golden batch." delay={160}>
            <div className="mt-5 flex flex-wrap gap-2 text-xs">
              {['Recipe v4.2 ✓', 'ST-2000 group ✓', 'Fed-batch covered ✓'].map((c) => (
                <span key={c} className="rounded-full border border-forest-200 bg-forest-50 px-2.5 py-1 text-forest-700">
                  {c}
                </span>
              ))}
              <span className="rounded-full border border-navy-200 bg-navy-50 px-2.5 py-1 text-navy-500">50 L pilot → excluded</span>
            </div>
          </Module>
          <Module icon={Activity} title="Deviation screening" body="Flags sustained windows outside the matched range — single noisy points are ignored — and shows pH and temperature on the same axis." why="Earlier sight of differences worth reviewing." delay={0}>
            <MiniTrend />
          </Module>
          <Module icon={AlertTriangle} title="Data-quality watch" body="Completeness, stale feeds, missing samples and unmatched recipes for every batch, with each gap shown." why="Never compare against numbers that aren’t there." delay={80}>
            <ul className="data mt-5 space-y-2 text-xs">
              {(
                [
                  ['AMY-24-120', 'Current', 'bg-forest-500'],
                  ['XYN-24-041', 'Temp gap · 3.5 h', 'bg-ochre-500'],
                  ['PRT-24-017', 'Recipe unmatched', 'bg-brick-500'],
                ] as const
              ).map(([b, s, c]) => (
                <li key={b} className="flex items-center justify-between rounded border border-line bg-white px-3 py-2 text-navy-700">
                  {b}
                  <span className="flex items-center gap-2">
                    <span className={cx('h-2 w-2 rounded-full', c)} /> {s}
                  </span>
                </li>
              ))}
            </ul>
          </Module>
          <Module icon={ClipboardList} title="Investigations, assistant & audit" body="Assign, note and resolve on the batch record; ask questions in plain English; see who changed what." why="A traceable record for every review." delay={160}>
            <div className="mt-5 rounded-lg border border-line bg-white p-3 text-xs text-navy-700">
              <p className="text-navy-400">“Which investigations need attention?”</p>
              <p className="mt-1">
                <span className="data text-navy-900">INV-0007</span> on AMY-24-118 — open, unassigned.
              </p>
              <p className="data mt-1 text-[10px] text-navy-400">From records INV-0007</p>
            </div>
          </Module>
        </div>
        <Link to="/product" className="mt-8 inline-flex items-center gap-2 text-sm font-medium text-forest-700 hover:underline">
          Explore the platform <ArrowRight className="h-4 w-4" aria-hidden />
        </Link>
      </Container>
    </section>
  );
}

function Module({ icon: Icon, title, body, why, delay, children }: { icon: typeof FlaskConical; title: string; body: string; why: string; delay: number; children?: ReactNode }) {
  return (
    <article className="card reveal lift spot flex flex-col p-6" style={d(delay)}>
      <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-forest-50 text-forest-700 ring-1 ring-forest-100">
        <Icon className="h-5 w-5" aria-hidden />
      </span>
      <h3 className="mt-4 text-lg font-semibold text-navy-900">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-navy-600">{body}</p>
      <div className="flex-1">{children}</div>
      <p className="mt-5 border-t border-line pt-4 text-sm font-medium text-forest-700">{why}</p>
    </article>
  );
}

function PhaseBars() {
  const runs = [
    ['118', 0, [6, 10, 18, 26, 14]],
    ['115', 3, [5, 11, 17, 27, 13]],
    ['112', -2, [7, 9, 19, 25, 15]],
  ] as const;
  const colors = ['bg-navy-200', 'bg-teal-200', 'bg-teal-400', 'bg-forest-500', 'bg-forest-300'];
  return (
    <div className="mt-5 space-y-2" aria-hidden>
      {runs.map(([id, shift, widths]) => (
        <div key={id} className="flex items-center gap-2">
          <span className="data w-8 text-[10px] text-navy-400">{id}</span>
          <div className="flex h-3 flex-1 overflow-hidden rounded-sm" style={{ marginLeft: `${shift + 3}%` }}>
            {widths.map((w, i) => (
              <span key={i} className={colors[i]} style={{ width: `${w}%` }} />
            ))}
          </div>
        </div>
      ))}
      <p className="data pt-1 text-[10px] text-navy-400">aligned at fed-batch start</p>
    </div>
  );
}

function MiniTrend() {
  const pts: string[] = [];
  for (let i = 0; i <= 40; i++) {
    const dip = i > 24 && i < 34 ? Math.sin(((i - 24) / 10) * Math.PI) * 16 : 0;
    pts.push(`${i * 7},${(34 + Math.sin(i * 1.3) * 3 + dip).toFixed(1)}`);
  }
  return (
    <svg viewBox="0 0 280 80" className="draw mt-5 w-full" aria-hidden>
      <rect x="0" y="24" width="280" height="20" className="fill-forest-100" />
      <rect x="168" y="0" width="70" height="80" className="fill-ochre-100/70" />
      <path className="trace stroke-forest-700" d={`M${pts.join(' L')}`} fill="none" strokeWidth="2" style={{ '--len': 600 } as CSSProperties} />
      <text x="4" y="76" className="fill-navy-400 font-mono" fontSize="8">
        matched range
      </text>
      <text x="172" y="10" className="fill-ochre-700 font-mono" fontSize="8">
        DO below range
      </text>
    </svg>
  );
}

/* ───────────── Compare runs & detection (existing visuals) ───────────── */

function CompareRunsSection() {
  return (
    <section className="py-20 sm:py-24">
      <Container className="grid gap-12 lg:grid-cols-2 lg:items-center">
        <div>
          <SectionHeading eyebrow="Compare similar runs" title="Each batch gets its own matched reference set.">
            <p>Engineers choose reference runs with compatible recipes, equipment groups and process conditions. Cultivane checks each candidate and explains why a run is comparable, needs caution, or should be excluded — before any chart is drawn.</p>
          </SectionHeading>
          <Link to="/batches/compare?focus=AMY-24-118" className="btn-secondary reveal mt-8">
            Open the comparison workspace <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>
        <div className="reveal">
          <ComparabilityMatrix />
        </div>
      </Container>
    </section>
  );
}

function DetectSection() {
  return (
    <section className="tech-grid-dark bg-forest-950 py-20 text-paper sm:py-24">
      <Container className="grid gap-12 lg:grid-cols-[1fr_1.2fr] lg:items-center">
        <div>
          <div className="eyebrow reveal mb-3 flex items-center gap-2 text-mint-300">
            <span className="h-px w-6 bg-mint-300" aria-hidden /> Detect changes worth investigating
          </div>
          <h2 className="reveal text-3xl font-semibold sm:text-[2.35rem] sm:leading-[1.12]">Highlight unusual patterns. Leave the diagnosis to your engineers.</h2>
          <p className="reveal mt-4 leading-relaxed text-paper/70">
            When a measurement leaves the range of matched runs for a sustained period, Cultivane marks the window and gathers corresponding pH, temperature, events and data gaps. It does not label a deviation as contamination, suggest dosing changes, or make release decisions.
          </p>
          <ul className="mt-8 space-y-3 text-sm text-paper/80">
            {['Sustained excursions only — single noisy points are ignored', 'Corresponding signals shown on synchronised charts', 'Simulated AI summaries are clearly labelled and cautious'].map((t, i) => (
              <li key={t} className="reveal flex gap-2" style={d(i * 80)}>
                <FileSearch className="mt-0.5 h-4 w-4 shrink-0 text-mint-300" aria-hidden />
                {t}
              </li>
            ))}
          </ul>
        </div>
        <div className="reveal text-navy-900">
          <DeviationPreview />
        </div>
      </Container>
    </section>
  );
}

function HowItWorksSection() {
  return (
    <section id="how" className="py-20 sm:py-24">
      <Container>
        <SectionHeading eyebrow="How it works" title="Four steps from raw readings to recorded findings." center />
        <ol className="relative mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          <div className="absolute top-12 right-0 left-0 hidden h-px bg-gradient-to-r from-transparent via-teal-300 to-transparent lg:block" aria-hidden />
          {howItWorksSteps.map((s, i) => (
            <li key={s.title} className="card reveal lift spot relative p-6" style={d(i * 100)}>
              <div className="data mb-6 flex items-center justify-between text-xs text-navy-400">
                <span className="flex h-8 w-8 items-center justify-center rounded-full border border-teal-300 bg-white text-teal-700">0{i + 1}</span>
                <s.icon className="h-5 w-5 text-forest-600" aria-hidden />
              </div>
              <h3 className="text-[15px] font-semibold text-navy-900">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-navy-600">{s.body}</p>
            </li>
          ))}
        </ol>
        <div className="mt-10 text-center">
          <Link to="/how-it-works" className="inline-flex items-center gap-2 text-sm font-medium text-forest-700 hover:underline">
            Read the full walkthrough <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>
      </Container>
    </section>
  );
}

/* ───────────── Who it's for & comparison ───────────── */

const AUDIENCES = [
  { icon: Factory, who: 'Industrial enzyme producers', profile: 'Amylase, protease and xylanase campaigns across production fermenters.', how: 'Compare every batch with matched runs on the same recipe and vessel group.', benefit: 'Earlier sight of drifts, with recipe revisions kept traceable.' },
  { icon: FlaskConical, who: 'Fermentation startups', profile: 'Teams moving from pilot to production without a data platform.', how: 'Build comparable batch records from the first runs onward.', benefit: 'Scale-up decisions backed by like-for-like history.' },
  { icon: Building2, who: 'Contract fermentation manufacturers', profile: 'Multiple client processes sharing vessels and staff.', how: 'Keep each client’s process, vessel group and investigations separate.', benefit: 'Records ready for client technical reviews.' },
  { icon: Users, who: 'Process & QC teams', profile: 'Engineers, scientists and analysts who explain every batch.', how: 'Review evidence, watch data quality and record findings by role.', benefit: 'Time goes to the batches that need it.' },
];

function WhoSection() {
  return (
    <section id="who" className="border-y border-line bg-paper-2/60 py-20 sm:py-24">
      <Container>
        <div className="grid gap-12 lg:grid-cols-[1fr_1.3fr] lg:items-end">
          <SectionHeading eyebrow="Who it’s for" title="Built around how fermentation operations actually run.">
            <p>Initially focused on nonclinical industrial enzyme production, where batch volumes are large, recipes evolve, and engineers need defensible comparisons.</p>
          </SectionHeading>
          <div className="reveal">
            <Photo src={photos.facility.src} alt={photos.facility.alt} className="aspect-[16/7]" caption="INDUSTRIAL PRODUCTION" />
          </div>
        </div>
        <div className="mt-12 grid gap-5 md:grid-cols-2">
          {AUDIENCES.map((a, i) => (
            <article key={a.who} className="card reveal lift spot p-6" style={d((i % 2) * 100)}>
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-forest-50 text-forest-700 ring-1 ring-forest-100">
                  <a.icon className="h-5 w-5" aria-hidden />
                </span>
                <h3 className="text-lg font-semibold text-navy-900">{a.who}</h3>
              </div>
              <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-3">
                {(
                  [
                    ['Who', a.profile],
                    ['How they use it', a.how],
                    ['Benefit', a.benefit],
                  ] as const
                ).map(([k, v]) => (
                  <div key={k}>
                    <dt className="eyebrow text-navy-400">{k}</dt>
                    <dd className={cx('mt-1', k === 'Benefit' ? 'font-medium text-forest-700' : 'text-navy-600')}>{v}</dd>
                  </div>
                ))}
              </dl>
            </article>
          ))}
        </div>
        <p className="mt-8 flex items-center gap-2 text-xs text-navy-500">
          <Cpu className="h-3.5 w-3.5" aria-hidden /> Cultivane supports engineering review. It is not a control system and does not replace quality decisions.
        </p>
      </Container>
    </section>
  );
}

type Cell = { v: 'yes' | 'no' | 'part'; t: string };
const COMPARE: { row: string; cols: [Cell, Cell, Cell, Cell] }[] = [
  { row: 'Aligns runs by process phase', cols: [{ v: 'part', t: 'Manual, per analysis' }, { v: 'no', t: 'Clock time' }, { v: 'no', t: 'One fixed profile' }, { v: 'yes', t: 'Automatic, per phase' }] },
  { row: 'Compares only genuinely matched runs', cols: [{ v: 'part', t: 'Depends who builds it' }, { v: 'no', t: 'Whatever is overlaid' }, { v: 'no', t: 'Same golden batch for all' }, { v: 'yes', t: 'Recipe, vessel group, phase checked' }] },
  { row: 'Shows missing data honestly', cols: [{ v: 'no', t: 'Often zero-filled' }, { v: 'part', t: 'Interpolated lines' }, { v: 'no', t: 'Not applicable' }, { v: 'yes', t: 'Gaps drawn as breaks' }] },
  { row: 'Explains why a window was flagged', cols: [{ v: 'part', t: 'In the analyst’s head' }, { v: 'part', t: 'Alarm limits only' }, { v: 'part', t: '“Outside the profile”' }, { v: 'yes', t: 'Window, phase, references, signals' }] },
  { row: 'Keeps findings with the batch', cols: [{ v: 'no', t: 'Separate files' }, { v: 'no', t: 'Not designed for it' }, { v: 'no', t: 'Not designed for it' }, { v: 'yes', t: 'Investigations + audit trail' }] },
  { row: 'Works with the data you already have', cols: [{ v: 'yes', t: 'Exports' }, { v: 'yes', t: 'Built in' }, { v: 'yes', t: 'Exports' }, { v: 'yes', t: 'Historian, LIMS, CSV' }] },
];

function CompareSection() {
  const heads = ['Spreadsheets & notebooks', 'Historian trend screens', 'Golden-batch overlays', 'Cultivane'];
  const Icon = ({ v }: { v: Cell['v'] }) =>
    v === 'yes' ? <Check className="h-4 w-4 shrink-0 text-forest-600" aria-label="Yes" /> : v === 'no' ? <X className="h-4 w-4 shrink-0 text-brick-500" aria-label="No" /> : <Minus className="h-4 w-4 shrink-0 text-ochre-500" aria-label="Partly" />;
  return (
    <section id="compare" className="py-20 sm:py-24">
      <Container>
        <SectionHeading eyebrow="Why Cultivane" title="How it compares with the ways teams review batches today">
          <p>Cultivane works alongside your historian and LIMS — it gives the people reviewing batches better evidence.</p>
        </SectionHeading>
        <div className="card reveal mt-12 overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead>
              <tr className="border-b border-line bg-paper-2/60">
                <th className="p-4 font-normal">
                  <span className="sr-only">Capability</span>
                </th>
                {heads.map((h, i) => (
                  <th key={h} className={cx('p-4 font-semibold', i === 3 ? 'bg-forest-950 text-mint-200' : 'text-navy-700')}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {COMPARE.map((r) => (
                <tr key={r.row} className="border-b border-line last:border-0">
                  <th scope="row" className="p-4 font-medium text-navy-900">
                    {r.row}
                  </th>
                  {r.cols.map((c, i) => (
                    <td key={i} className={cx('p-4 align-top', i === 3 && 'bg-forest-50/70')}>
                      <span className={cx('flex gap-2', i === 3 ? 'font-medium text-navy-900' : 'text-navy-500')}>
                        <Icon v={c.v} /> {c.t}
                      </span>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="reveal mt-10 grid gap-6 lg:grid-cols-2">
          <BatchRecordCard />
          <div className="flex flex-col justify-center">
            <h3 className="text-2xl font-semibold text-navy-900">One record per batch, with the context already attached.</h3>
            <p className="mt-3 text-[15px] leading-relaxed text-navy-600">Recipe version, fermenter, phases, sensor series, offline samples, events and investigation notes — so when something looks unusual, nobody has to go hunting.</p>
            <Link to="/batches/list" className="btn-secondary mt-6 w-fit">
              <Bot className="h-4 w-4" aria-hidden /> Browse demo batches
            </Link>
          </div>
        </div>
      </Container>
    </section>
  );
}
