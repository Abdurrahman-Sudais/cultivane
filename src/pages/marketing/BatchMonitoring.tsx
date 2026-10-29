import { Link } from 'react-router-dom';
import { ArrowRight, Clock, Gauge, Thermometer, Wind } from 'lucide-react';
import { useDocumentMeta } from '@/hooks/useDocumentMeta';
import { photos } from '@/config/site';
import { Container, CtaBand, FeatureCard, PageHero, Photo, SectionHeading } from '@/components/marketing/primitives';
import { BatchRecordCard, PhaseContextChart } from '@/components/marketing/previews';

export default function BatchMonitoring() {
  useDocumentMeta({ title: 'Batch Monitoring', path: '/batch-monitoring', description: 'Monitor active fermentation batches by process phase with temperature, pH and dissolved-oxygen trends, sampling records and data completeness.' });
  return (
    <>
      <PageHero eyebrow="Batch Monitoring" title="Know where every batch is in its process." aside={<Photo src={photos.processLab.src} alt={photos.processLab.alt} className="aspect-[4/3]" caption="LINE 2 · ACTIVE BATCHES" />}>
        <p>Follow active runs by phase, not just by clock time. See current measurements against recipe setpoints, which samples are outstanding, and where data is missing.</p>
        <Link to="/batches" className="btn-primary mt-7">
          Explore the Batch Dashboard <ArrowRight className="h-4 w-4" aria-hidden />
        </Link>
      </PageHero>
      <section className="py-20">
        <Container className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          <FeatureCard icon={<Thermometer className="h-4.5 w-4.5" />} title="Temperature">Jacket-controlled vessel temperature in °C, with setpoint changes at harvest and transmitter faults shown as gaps.</FeatureCard>
          <FeatureCard icon={<Gauge className="h-4.5 w-4.5" />} title="pH">Culture pH with probe recalibration events recorded on the timeline.</FeatureCard>
          <FeatureCard icon={<Wind className="h-4.5 w-4.5" />} title="Dissolved oxygen">DO in % air saturation alongside agitation and aeration events from the cascade.</FeatureCard>
          <FeatureCard icon={<Clock className="h-4.5 w-4.5" />} title="Phase progress">Inoculation, lag, exponential, fed-batch, stationary and harvest — planned against actual.</FeatureCard>
        </Container>
      </section>
      <section className="border-y border-line bg-paper-2/60 py-20">
        <Container className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <div>
            <SectionHeading eyebrow="Batch detail" title="The full record behind each run.">
              <p>Sampling records, process events, investigations and per-sensor completeness live alongside the trends — so a question about one reading can be answered without leaving the batch.</p>
            </SectionHeading>
            <div className="mt-8">
              <PhaseContextChart />
            </div>
          </div>
          <BatchRecordCard />
        </Container>
      </section>
      <CtaBand />
    </>
  );
}
