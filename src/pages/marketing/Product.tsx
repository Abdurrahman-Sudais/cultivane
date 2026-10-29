import { Link } from 'react-router-dom';
import { ArrowRight, ClipboardList, Database, GitCompare, LineChart, ShieldCheck, Workflow } from 'lucide-react';
import { useDocumentMeta } from '@/hooks/useDocumentMeta';
import { photos } from '@/config/site';
import { Container, CtaBand, FeatureCard, PageHero, Photo, SectionHeading } from '@/components/marketing/primitives';
import { ProductPreview } from '@/components/marketing/previews';

const modules = [
  { icon: Database, title: 'Batch records', body: 'Batch ID, product, recipe version, fermenter, start time, phase and status — searchable across campaigns.', to: '/batches/list' },
  { icon: LineChart, title: 'Trends', body: 'Temperature, pH and dissolved oxygen with explicit units, phase bands, event markers and visible gaps.', to: '/batches/trends' },
  { icon: GitCompare, title: 'Comparisons', body: 'Phase-aligned charts for two or more batches with comparability checks on recipe, equipment and phase.', to: '/batches/compare' },
  { icon: ClipboardList, title: 'Investigations', body: 'Evidence windows, reference runs, notes, assignment and open / under review / resolved status.', to: '/batches/investigations' },
  { icon: ShieldCheck, title: 'Data quality', body: 'Missing sensor intervals, stale feeds, incomplete sampling and unmatched metadata in one place.', to: '/batches/data-quality' },
  { icon: Workflow, title: 'Process runs', body: 'See runs grouped by recipe and equipment group, with phase timing laid out side by side.', to: '/batches/runs' },
];

export default function Product() {
  useDocumentMeta({ title: 'Product', path: '/product', description: 'Cultivane product overview: batch records, trends, phase-aligned comparisons, investigations and data quality for fermentation teams.' });
  return (
    <>
      <PageHero eyebrow="Product" title="One workspace for batch context, comparison and investigation." aside={<ProductPreview />}>
        <p>Cultivane organises the information fermentation engineers already rely on — recipes, phases, sensors, samples and notes — so batches can be compared fairly and deviations reviewed with the full record in view.</p>
      </PageHero>
      <section className="py-20">
        <Container>
          <SectionHeading eyebrow="Modules" title="Everything connected to the batch." />
          <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {modules.map((m) => (
              <FeatureCard key={m.title} icon={<m.icon className="h-4.5 w-4.5" />} title={m.title}>
                <p>{m.body}</p>
                <Link to={m.to} className="mt-3 inline-flex items-center gap-1 text-[13px] font-medium text-forest-700 hover:underline">
                  View in demo <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                </Link>
              </FeatureCard>
            ))}
          </div>
        </Container>
      </section>
      <section className="border-y border-line bg-paper-2/60 py-20">
        <Container className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <Photo src={photos.controlRoom.src} alt={photos.controlRoom.alt} className="aspect-[4/3]" caption="PROCESS OPERATIONS" />
          <SectionHeading eyebrow="Principles" title="Careful by design.">
            <ul className="space-y-4">
              <li><strong className="text-navy-900">Context before comparison.</strong> Batches are matched on recipe, equipment group and phase before any chart is drawn.</li>
              <li><strong className="text-navy-900">No silent gap-filling.</strong> Missing readings are shown as gaps and hatched intervals, never replaced with zero or interpolated.</li>
              <li><strong className="text-navy-900">Patterns, not verdicts.</strong> The system highlights unusual windows; engineers decide what they mean.</li>
              <li><strong className="text-navy-900">Not a control or release system.</strong> Cultivane does not change setpoints, prescribe dosing, or approve batches.</li>
            </ul>
          </SectionHeading>
        </Container>
      </section>
      <CtaBand />
    </>
  );
}
