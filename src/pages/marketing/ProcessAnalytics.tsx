import { Link } from 'react-router-dom';
import { AlignHorizontalJustifyStart, ArrowRight, Ban, ScanSearch, Sigma } from 'lucide-react';
import { useDocumentMeta } from '@/hooks/useDocumentMeta';
import { photos } from '@/config/site';
import { Container, CtaBand, FeatureCard, PageHero, Photo, SectionHeading } from '@/components/marketing/primitives';
import { ComparabilityMatrix, DeviationPreview } from '@/components/marketing/previews';

export default function ProcessAnalytics() {
  useDocumentMeta({ title: 'Process Analytics', path: '/process-analytics', description: 'Phase-aligned batch comparison, matched reference runs, comparability warnings and deviation highlighting for fermentation processes.' });
  return (
    <>
      <PageHero eyebrow="Process Analytics" title="Comparisons that respect process context." aside={<DeviationPreview />}>
        <p>Align batches on phase start, compare against runs that share recipe and equipment, and highlight sustained differences for engineering review.</p>
        <Link to="/batches/compare?focus=AMY-24-118" className="btn-primary mt-7">
          Try the comparison demo <ArrowRight className="h-4 w-4" aria-hidden />
        </Link>
      </PageHero>
      <section className="py-20">
        <Container className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          <FeatureCard icon={<AlignHorizontalJustifyStart className="h-4.5 w-4.5" />} title="Phase alignment">Overlay runs by elapsed time or aligned to the start of a chosen phase.</FeatureCard>
          <FeatureCard icon={<Sigma className="h-4.5 w-4.5" />} title="Reference range">A band built from the selected matched runs — at least two readings per time step, gaps excluded.</FeatureCard>
          <FeatureCard icon={<ScanSearch className="h-4.5 w-4.5" />} title="Sustained excursions">Windows flagged only when a measurement stays outside the band for a configurable duration.</FeatureCard>
          <FeatureCard icon={<Ban className="h-4.5 w-4.5" />} title="Comparability warnings">Different recipes, incompatible equipment or unreached phases are called out explicitly.</FeatureCard>
        </Container>
      </section>
      <section className="border-y border-line bg-paper-2/60 py-20">
        <Container className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <div>
            <SectionHeading eyebrow="No universal golden batch" title="References are chosen per batch, per phase.">
              <p>A 50 L pilot run, an older recipe revision, or a batch that hasn’t reached fed-batch yet would all distort a comparison. Cultivane explains each exclusion so the reference set is defensible.</p>
            </SectionHeading>
            <Photo src={photos.lab.src} alt={photos.lab.alt} className="mt-8 aspect-[16/9]" caption="PROCESS DEVELOPMENT LAB" />
          </div>
          <ComparabilityMatrix />
        </Container>
      </section>
      <CtaBand />
    </>
  );
}
