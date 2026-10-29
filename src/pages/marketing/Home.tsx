import { Link } from 'react-router-dom';
import { ArrowRight, Building2, Cpu, Factory, FileSearch, FlaskConical, GitCompare, Layers, NotebookPen, Upload } from 'lucide-react';
import { useDocumentMeta } from '@/hooks/useDocumentMeta';
import { photos } from '@/config/site';
import { Container, CtaBand, FeatureCard, Photo, SectionHeading } from '@/components/marketing/primitives';
import { BatchRecordCard, ComparabilityMatrix, DeviationPreview, PhaseContextChart, ProductPreview } from '@/components/marketing/previews';

export const howItWorksSteps = [
  { icon: Layers, title: 'Organise batches and process metadata', body: 'Register recipes, phase plans, fermenters and equipment groups so every batch carries the context needed to interpret it.' },
  { icon: Upload, title: 'Record or import measurements', body: 'Bring in temperature, pH, dissolved oxygen and offline samples from historian exports or manual entry. Gaps stay visible.' },
  { icon: GitCompare, title: 'Compare appropriately matched process runs', body: 'Select reference runs that share recipe, equipment and phase timing. Mismatches are flagged before charts are drawn.' },
  { icon: NotebookPen, title: 'Investigate deviations and record findings', body: 'Open an investigation, review the evidence window, assign an owner and keep notes alongside the batch record.' },
];

export default function Home() {
  useDocumentMeta({ title: 'Home', path: '/' });
  return (
    <>
      {/* Hero */}
      <section className="tech-grid relative overflow-hidden border-b border-line">
        <div className="absolute inset-0 bg-gradient-to-b from-paper/10 via-paper/50 to-paper" aria-hidden />
        <Container className="relative grid gap-12 pt-16 pb-20 sm:pt-20 lg:grid-cols-[1fr_1.15fr] lg:items-center lg:gap-14">
          <div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-forest-200 bg-white/70 px-3 py-1 text-[12px] text-forest-800">
              <span className="h-1.5 w-1.5 rounded-full bg-lime-400" aria-hidden /> Batch monitoring for industrial enzyme production
            </div>
            <h1 className="text-[2.6rem] leading-[1.04] font-semibold text-navy-900 sm:text-[3.4rem]">See every fermentation batch in its process context.</h1>
            <p className="mt-6 max-w-xl text-[17px] leading-relaxed text-navy-600">
              Compare similar runs, investigate process deviations, and bring temperature, pH, dissolved oxygen, and batch history into one workspace.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/batches" className="btn-primary px-5 py-3">
                Explore the Batch Dashboard <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
              <Link to="/how-it-works" className="btn-secondary px-5 py-3">
                See How It Works
              </Link>
            </div>
            <dl className="mt-10 grid max-w-md grid-cols-3 gap-6 border-t border-line pt-6">
              {[
                ['3', 'core process signals'],
                ['6', 'tracked process phases'],
                ['0', 'readings zero-filled'],
              ].map(([v, l]) => (
                <div key={l}>
                  <dt className="sr-only">{l}</dt>
                  <dd className="data text-2xl text-forest-800">{v}</dd>
                  <dd className="mt-1 text-xs text-navy-500">{l}</dd>
                </div>
              ))}
            </dl>
          </div>
          <ProductPreview />
        </Container>
      </section>

      {/* A. Why comparisons are difficult */}
      <section className="py-20 sm:py-24">
        <Container className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <div>
            <SectionHeading eyebrow="Why batch comparisons are difficult" title="A reading only means something at the right point in the process.">
              <p>
                Dissolved oxygen near saturation is normal after inoculation and would be striking in late fed-batch. pH drifts as biomass grows, then is held by base addition. Temperature setpoints change at harvest.
              </p>
              <p className="mt-3">
                Comparing two batches by clock time alone — or against one fixed “golden batch” — mixes phases, recipes and vessels that were never meant to line up. Cultivane anchors every comparison to process phase and recipe context first.
              </p>
            </SectionHeading>
            <ul className="mt-8 grid gap-3 sm:grid-cols-2">
              {['Phases start at different times in each run', 'Recipe revisions change setpoints', 'Vessel scale changes oxygen transfer', 'Sensor gaps distort averages'].map((t) => (
                <li key={t} className="flex items-start gap-2 text-sm text-navy-700">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-teal-500" aria-hidden />
                  {t}
                </li>
              ))}
            </ul>
          </div>
          <PhaseContextChart />
        </Container>
      </section>

      {/* B. Connected history */}
      <section className="border-y border-line bg-paper-2/60 py-20 sm:py-24">
        <Container className="grid gap-12 lg:grid-cols-[1fr_1.1fr] lg:items-center">
          <div className="order-2 lg:order-1">
            <BatchRecordCard />
          </div>
          <div className="order-1 lg:order-2">
            <SectionHeading eyebrow="A connected history for every batch" title="Measurements, phases, equipment and notes — in one record.">
              <p>Each batch links its recipe version, fermenter, process phases, sensor series, offline samples, process events and investigation notes. When something looks unusual, the context is already attached.</p>
            </SectionHeading>
            <div className="mt-8 grid grid-cols-2 gap-4">
              <Photo src={photos.processEquipment.src} alt={photos.processEquipment.alt} className="aspect-[4/3]" caption="EQUIPMENT RECORDS" />
              <Photo src={photos.sampling.src} alt={photos.sampling.alt} className="aspect-[4/3]" caption="OFFLINE SAMPLING" />
            </div>
          </div>
        </Container>
      </section>

      {/* C. Compare similar runs */}
      <section className="py-20 sm:py-24">
        <Container className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <div>
            <SectionHeading eyebrow="Compare similar runs" title="Each batch gets its own matched reference set.">
              <p>
                Engineers choose reference runs with compatible recipes, equipment groups and process conditions. Cultivane checks each candidate and explains why a run is comparable, needs caution, or should be excluded — before any chart is drawn.
              </p>
            </SectionHeading>
            <Link to="/batches/compare?focus=AMY-24-118" className="btn-secondary mt-8">
              Open the comparison workspace <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>
          <ComparabilityMatrix />
        </Container>
      </section>

      {/* D. Detect changes */}
      <section className="tech-grid-dark bg-forest-950 py-20 text-paper sm:py-24">
        <Container className="grid gap-12 lg:grid-cols-[1fr_1.2fr] lg:items-center">
          <div>
            <div className="eyebrow mb-3 text-mint-300">Detect changes worth investigating</div>
            <h2 className="text-3xl font-semibold sm:text-[2.35rem] sm:leading-[1.12]">Highlight unusual patterns. Leave the diagnosis to your engineers.</h2>
            <p className="mt-4 leading-relaxed text-paper/70">
              When a measurement leaves the range of matched runs for a sustained period, Cultivane marks the window and gathers corresponding pH, temperature, events and data gaps. It does not label a deviation as contamination, suggest dosing changes, or make release decisions.
            </p>
            <ul className="mt-8 space-y-3 text-sm text-paper/80">
              {['Sustained excursions only — single noisy points are ignored', 'Corresponding signals shown on synchronised charts', 'Simulated AI summaries are clearly labelled and cautious'].map((t) => (
                <li key={t} className="flex gap-2">
                  <FileSearch className="mt-0.5 h-4 w-4 shrink-0 text-mint-300" aria-hidden />
                  {t}
                </li>
              ))}
            </ul>
          </div>
          <div className="text-navy-900">
            <DeviationPreview />
          </div>
        </Container>
      </section>

      {/* E. How it works */}
      <section className="py-20 sm:py-24">
        <Container>
          <SectionHeading eyebrow="How it works" title="Four steps from raw readings to recorded findings." center />
          <ol className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {howItWorksSteps.map((s, i) => (
              <li key={s.title} className="card relative p-6">
                <div className="data mb-6 flex items-center justify-between text-xs text-navy-400">
                  <span>0{i + 1}</span>
                  <s.icon className="h-5 w-5 text-forest-600" aria-hidden />
                </div>
                <h3 className="text-[15px] font-semibold text-navy-900">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-navy-600">{s.body}</p>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      {/* F. Industrial biotech */}
      <section className="border-t border-line bg-paper-2/60 py-20 sm:py-24">
        <Container>
          <div className="grid gap-12 lg:grid-cols-[1fr_1.3fr] lg:items-end">
            <SectionHeading eyebrow="Designed for industrial biotechnology" title="Built around how fermentation operations actually run.">
              <p>Initially focused on nonclinical industrial enzyme production, where batch volumes are large, recipes evolve, and engineers need defensible comparisons.</p>
            </SectionHeading>
            <Photo src={photos.facility.src} alt={photos.facility.alt} className="aspect-[16/7]" caption="INDUSTRIAL PRODUCTION" />
          </div>
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            <FeatureCard icon={<Factory className="h-4.5 w-4.5" />} title="Industrial enzyme producers">
              Track amylase, protease and xylanase campaigns across production fermenters and keep recipe revisions traceable.
            </FeatureCard>
            <FeatureCard icon={<FlaskConical className="h-4.5 w-4.5" />} title="Fermentation startups">
              Move from pilot to production with comparable records from the first runs, without building a data platform first.
            </FeatureCard>
            <FeatureCard icon={<Building2 className="h-4.5 w-4.5" />} title="Contract fermentation manufacturers">
              Keep each client process, vessel group and investigation history separate and ready for technical review.
            </FeatureCard>
          </div>
          <p className="mt-8 flex items-center gap-2 text-xs text-navy-500">
            <Cpu className="h-3.5 w-3.5" aria-hidden /> Cultivane supports engineering review. It is not a control system and does not replace quality decisions.
          </p>
        </Container>
      </section>

      <CtaBand />
    </>
  );
}
