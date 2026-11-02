import { Link } from 'react-router-dom';
import { ArrowRight, Check } from 'lucide-react';
import type { CSSProperties } from 'react';
import { useDocumentMeta } from '@/hooks/useDocumentMeta';
import { Container, CtaBand, PageHero, SectionHeading } from '@/components/marketing/primitives';

const d = (ms: number) => ({ '--d': `${ms}ms` }) as CSSProperties;

export const SAFEGUARDS: [string, string][] = [
  ['Engineers interpret, the software describes', 'A flagged window is a reason to review, never a verdict. Cultivane never labels a deviation as contamination or names a cause.'],
  ['No dosing, setpoint or release advice', 'Recommendations about the process and batch-release decisions stay with your engineers and quality team.'],
  ['Gaps are never filled in', 'Missing readings stay missing — drawn as breaks, never zero-filled or interpolated — and stale feeds are flagged.'],
  ['Comparisons only like for like', 'Reference runs must match recipe version, equipment group and phase coverage, or they are excluded with the reason shown.'],
  ['Roles, enforced', 'Managers, engineers, analysts and reviewers each get only the actions they need. The demo checks every action; production enforces it on the server.'],
  ['Everything audited', 'Assignments, notes, status changes, reference edits and threshold changes are written to an append-only audit log managers can export.'],
];

const SECURITY: [string, string][] = [
  ['Encryption', 'TLS 1.2+ in transit; AWS KMS encryption at rest for databases, time-series data and archives.'],
  ['Edge identity', 'Each plant connector authenticates with its own certificate; no shared passwords between sites.'],
  ['Customer isolation', 'Every record carries a customer identifier filtered on every query; recipes never cross tenants.'],
  ['Single sign-on', 'Sign in with your identity provider through Amazon Cognito, with multi-factor authentication for managers.'],
  ['Least privilege', 'Each service gets only the permissions it needs; no human uses root credentials.'],
  ['Data minimisation', 'Process data and batch records only. No personal data is sent to AI models; summaries reference batch and record IDs.'],
];

export default function Security() {
  useDocumentMeta({ title: 'Security & safeguards', path: '/security', description: 'How Cultivane keeps engineers in charge: no causes or release advice, gaps never filled in, role-based access, an audit log, and the proposed security design.' });
  return (
    <>
      <PageHero eyebrow="Security & safeguards" title="Data informs the review. Engineers decide.">
        <p>The demo already enforces the review safeguards below. The security controls describe the proposed production design.</p>
      </PageHero>
      <section className="py-20">
        <Container>
          <SectionHeading eyebrow="Review safeguards" title="Built into the demo you can try today" />
          <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {SAFEGUARDS.map(([t, b], i) => (
              <div key={t} className="card reveal lift spot p-6" style={d((i % 3) * 80)}>
                <Check className="h-5 w-5 text-forest-600" aria-hidden />
                <h3 className="mt-3 font-semibold text-navy-900">{t}</h3>
                <p className="mt-2 text-sm text-navy-600">{b}</p>
              </div>
            ))}
          </div>
          <Link to="/batches/audit" className="mt-8 inline-flex items-center gap-2 text-sm font-medium text-forest-700 hover:underline">
            See roles and the audit log in the demo <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </Container>
      </section>
      <section className="tech-grid-dark bg-forest-950 py-20 text-paper">
        <Container>
          <div className="eyebrow reveal mb-3 text-mint-300">Proposed security design</div>
          <h2 className="reveal text-3xl font-semibold">Controls for the production service</h2>
          <dl className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {SECURITY.map(([t, b], i) => (
              <div key={t} className="reveal rounded-xl border border-white/10 bg-white/5 p-5" style={d((i % 3) * 80)}>
                <dt className="font-semibold text-paper">{t}</dt>
                <dd className="mt-2 text-sm text-paper/70">{b}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-6 max-w-3xl text-sm text-paper/60">These controls are part of the proposed architecture and are not yet independently audited or certified. Validation and GMP requirements for your operation should be confirmed during a pilot.</p>
        </Container>
      </section>
      <CtaBand />
    </>
  );
}
