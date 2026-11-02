import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import type { CSSProperties } from 'react';
import { useDocumentMeta } from '@/hooks/useDocumentMeta';
import { FOUNDERS, photos, site } from '@/config/site';
import { Container, CtaBand, PageHero, Photo, SectionHeading } from '@/components/marketing/primitives';
import { FoundersGrid, RoadmapSection } from './HomeSections';

const d = (ms: number) => ({ '--d': `${ms}ms` }) as CSSProperties;

export default function About() {
  useDocumentMeta({ title: 'About & team', path: '/about', description: `About Cultivane, founded by ${FOUNDERS.map((f) => f.name).join(' and ')} to give fermentation teams a clearer operational history for every batch.` });
  return (
    <>
      <PageHero eyebrow="About Cultivane" title="Built for the engineers who explain every batch." aside={<Photo src={photos.microscope.src} alt={photos.microscope.alt} className="aspect-[4/3]" />}>
        <p>{site.description}</p>
      </PageHero>
      <section id="team" className="py-20">
        <Container>
          <SectionHeading eyebrow="Founding team" title="The people behind Cultivane" />
          <div className="mt-10">
            <FoundersGrid />
          </div>
        </Container>
      </section>
      <section className="border-y border-line bg-paper-2/60 py-20">
        <Container className="grid gap-12 lg:grid-cols-[1.2fr_1fr]">
          <div>
            <SectionHeading eyebrow="Our story" title="Context gets lost between the historian, the LIMS and the notebook." />
            <div className="reveal mt-6 space-y-4 text-[15px] leading-relaxed text-navy-600">
              <p>Fermentation teams generate rich data, but the context needed to interpret it — which recipe revision, which vessel, which phase, which sensor was being recalibrated — usually lives in separate systems and people’s memories.</p>
              <p>Cultivane brings that context together, starting with nonclinical industrial enzyme production, where large batches and evolving recipes make fair comparisons both valuable and difficult.</p>
              <p>Our approach is deliberately cautious: highlight what differs, show what is missing, and leave interpretation to the engineers responsible for the process.</p>
            </div>
          </div>
          <blockquote className="card reveal self-start p-8" style={d(120)}>
            <p className="eyebrow">Our mission</p>
            <p className="mt-3 text-2xl leading-snug font-semibold text-navy-900">Give every fermentation team a clear, comparable history for every batch.</p>
          </blockquote>
        </Container>
      </section>
      <section className="py-20">
        <Container>
          <SectionHeading eyebrow="Principles" title="What we will and won’t do" />
          <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[
              ['Like for like', 'Every comparison names its matched reference runs and excludes the rest with reasons.'],
              ['Phase-aware', 'Readings are compared at the same point in the process, not the same clock time.'],
              ['Honest about data', 'Gaps stay visible and stale feeds are flagged — never filled in.'],
              ['Engineers decide', 'Cultivane describes differences. Causes, process changes and release stay with people.'],
            ].map(([t, b], i) => (
              <div key={t} className="card reveal lift spot p-6" style={d(i * 90)}>
                <span className="data text-xs text-teal-600">0{i + 1}</span>
                <h3 className="mt-3 text-lg font-semibold text-navy-900">{t}</h3>
                <p className="mt-2 text-sm text-navy-600">{b}</p>
              </div>
            ))}
          </div>
          <Link to="/security" className="mt-8 inline-flex items-center gap-2 text-sm font-medium text-forest-700 hover:underline">
            Our safeguards <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </Container>
      </section>
      <RoadmapSection />
      <CtaBand />
    </>
  );
}
