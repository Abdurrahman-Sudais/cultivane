import { useDocumentMeta } from '@/hooks/useDocumentMeta';
import { photos, site } from '@/config/site';
import { Container, CtaBand, PageHero, Photo, SectionHeading } from '@/components/marketing/primitives';

export default function About() {
  useDocumentMeta({ title: 'About', path: '/about', description: `About Cultivane, founded by ${site.founder} to give fermentation teams clearer operational history for every batch.` });
  return (
    <>
      <PageHero eyebrow="About" title="Built for the engineers who explain every batch." aside={<Photo src={photos.microscope.src} alt={photos.microscope.alt} className="aspect-[4/3]" />}>
        <p>{site.description}</p>
      </PageHero>
      <section className="py-20">
        <Container className="grid gap-12 lg:grid-cols-[1fr_1.2fr]">
          <SectionHeading eyebrow="Why we started" title="Context gets lost between the historian, the LIMS and the notebook." />
          <div className="space-y-4 text-[15px] leading-relaxed text-navy-600">
            <p>
              Fermentation teams generate rich data, but the context needed to interpret it — which recipe revision, which vessel, which phase, which sensor was being recalibrated — usually lives in separate systems and people’s memories.
            </p>
            <p>
              {site.founder} founded Cultivane to bring that context together, starting with nonclinical industrial enzyme production, where large batches and evolving recipes make fair comparisons both valuable and difficult.
            </p>
            <p>Our approach is deliberately cautious: highlight what differs, show what is missing, and leave interpretation to the engineers responsible for the process.</p>
          </div>
        </Container>
      </section>
      <section className="border-y border-line bg-paper-2/60 py-16">
        <Container className="grid gap-6 md:grid-cols-3">
          {[
            ['Founder', site.founder],
            ['Focus', 'Industrial biotechnology · fermentation operations · bioprocess monitoring'],
            ['Contact', site.email],
          ].map(([k, v]) => (
            <div key={k} className="card p-6">
              <div className="eyebrow mb-2">{k}</div>
              <div className="text-navy-900">{v}</div>
            </div>
          ))}
        </Container>
      </section>
      <CtaBand />
    </>
  );
}
