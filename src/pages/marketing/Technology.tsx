import { Link } from 'react-router-dom';
import { ArrowRight, Info } from 'lucide-react';
import type { CSSProperties } from 'react';
import { useDocumentMeta } from '@/hooks/useDocumentMeta';
import { Container, CtaBand, PageHero, SectionHeading } from '@/components/marketing/primitives';

const d = (ms: number) => ({ '--d': `${ms}ms` }) as CSSProperties;

export const PIPELINE = [
  { step: '01', title: 'Capture', services: 'AWS IoT SiteWise · AWS IoT Greengrass', body: 'An edge connector reads the plant historian (OPC UA / PI) and controller tags for temperature, pH and dissolved oxygen, buffering through network drops.' },
  { step: '02', title: 'Ingest & store', services: 'Amazon Kinesis · Amazon Timestream · Amazon S3', body: 'Sensor series stream into a time-series store with batch, recipe, vessel and phase attached. LIMS samples and raw exports are archived to S3.' },
  { step: '03', title: 'Align & compare', services: 'AWS Lambda · AWS Step Functions', body: 'Deterministic jobs align runs by phase, check comparability, build matched reference ranges, flag sustained differences and measure data completeness.' },
  { step: '04', title: 'Explain', services: 'Amazon Bedrock', body: 'Evidence summaries and the assistant are written from the calculated results and the records a user may see. The model never supplies numbers or causes.' },
  { step: '05', title: 'Review & record', services: 'Amazon RDS for PostgreSQL · Amazon Cognito · Amazon SES', body: 'Batches, investigations, notes and the audit log live in PostgreSQL, isolated per customer. Users sign in with roles; assignees get email notifications.' },
];

const SERVICES: [string, string][] = [
  ['AWS IoT SiteWise', 'Models fermenters, lines and tags; collects historian data at the plant edge.'],
  ['AWS IoT Greengrass', 'Runs the OPC UA / PI connector next to the historian with local buffering.'],
  ['Amazon Kinesis Data Streams', 'Decouples ingestion from processing so busy campaigns never drop readings.'],
  ['Amazon Timestream', 'Stores sensor series with batch and phase context for fast time-window queries.'],
  ['Amazon S3', 'Archives raw exports, LIMS files and reports with encryption and lifecycle rules.'],
  ['AWS Lambda & Step Functions', 'Phase alignment, comparability checks, reference ranges, screening and completeness jobs.'],
  ['Amazon RDS for PostgreSQL', 'Batch records, investigations, notes, users and the append-only audit log.'],
  ['Amazon Bedrock', 'Writes evidence summaries and assistant answers grounded in calculated results.'],
  ['Amazon Cognito', 'Sign-in, single sign-on and role groups for managers, engineers, analysts and reviewers.'],
  ['Amazon SES', 'Assignment and review notifications by email.'],
  ['Amazon CloudWatch', 'Monitoring and alarms for ingestion lag, failed jobs and connector health.'],
  ['AWS KMS', 'Customer-specific encryption keys for data at rest.'],
];

export default function Technology() {
  useDocumentMeta({ title: 'Technology', path: '/technology', description: 'How Cultivane proposes to use AWS: historian capture at the edge, time-series storage, deterministic phase-aligned comparisons, and Amazon Bedrock for grounded explanations.' });
  return (
    <>
      <PageHero eyebrow="Technology" title="How we use Amazon Web Services">
        <p>A proposed architecture for moving from this browser demo to a production service: capture data where it is produced, keep every number traceable, keep the analysis deterministic, and use AI only to explain.</p>
      </PageHero>
      <section className="py-20">
        <Container>
          <SectionHeading eyebrow="Pipeline" title="From the historian to a recorded finding">
            <p>Five stages. The first three are rules and storage; AI appears only in the fourth, and people decide in the fifth.</p>
          </SectionHeading>
          <ol className="mt-12 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            {PIPELINE.map((p, i) => (
              <li key={p.step} className="card reveal lift spot flex flex-col p-5" style={d(i * 80)}>
                <span className="data text-xs text-teal-600">{p.step}</span>
                <h3 className="mt-2 font-semibold text-navy-900">{p.title}</h3>
                <p className="data mt-1 text-[11px] text-teal-700">{p.services}</p>
                <p className="mt-3 text-sm leading-relaxed text-navy-600">{p.body}</p>
              </li>
            ))}
          </ol>
          <div className="reveal mt-8 flex gap-3 rounded-lg border border-ochre-100 bg-ochre-50 p-4 text-sm text-ochre-700">
            <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
            <p>
              <strong>Proposed, not deployed.</strong> None of these services are connected to this website or the demo dashboard, which run entirely in your browser on simulated data.
            </p>
          </div>
        </Container>
      </section>
      <section className="border-y border-line bg-paper-2/60 py-20">
        <Container>
          <SectionHeading eyebrow="Services" title="What each service does" />
          <dl className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {SERVICES.map(([n, b], i) => (
              <div key={n} className="card reveal p-5" style={d((i % 3) * 80)}>
                <dt className="font-semibold text-navy-900">{n}</dt>
                <dd className="mt-2 text-sm text-navy-600">{b}</dd>
              </div>
            ))}
          </dl>
        </Container>
      </section>
      <section className="py-20">
        <Container>
          <SectionHeading eyebrow="Design rules" title="Rules we hold ourselves to" />
          <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[
              ['Rules decide status', 'Alignment, comparability and screening are deterministic and configurable. The same input always gives the same result.'],
              ['AI only explains', 'Bedrock turns calculated results into readable summaries. It is given numbers, never asked for them.'],
              ['Every number traceable', 'Derived values link back to the raw series and the rule version that produced them.'],
              ['Isolated by customer', 'Each customer’s recipes and batches sit in their own partition, with role checks on every request.'],
            ].map(([t, b], i) => (
              <div key={t} className="card reveal lift spot p-5" style={d(i * 80)}>
                <h3 className="font-semibold text-navy-900">{t}</h3>
                <p className="mt-2 text-sm text-navy-600">{b}</p>
              </div>
            ))}
          </div>
          <Link to="/security" className="mt-8 inline-flex items-center gap-2 text-sm font-medium text-forest-700 hover:underline">
            Security and safeguards <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </Container>
      </section>
      <CtaBand />
    </>
  );
}
