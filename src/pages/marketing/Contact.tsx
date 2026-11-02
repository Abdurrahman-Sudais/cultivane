import { useSearchParams } from 'react-router-dom';
import { Mail } from 'lucide-react';
import { useDocumentMeta } from '@/hooks/useDocumentMeta';
import { FOUNDERS, site } from '@/config/site';
import { LeadForm } from '@/components/marketing/LeadForm';
import { Container } from '@/components/marketing/primitives';

export default function Contact() {
  useDocumentMeta({ title: 'Request early access', path: '/contact', description: `Request early access to Cultivane or talk to us about fermentation batch monitoring. Email ${site.email}.` });
  const [params] = useSearchParams();
  return (
    <section className="tech-grid relative border-b border-line">
      <div className="absolute inset-0 bg-gradient-to-b from-paper/30 to-paper" aria-hidden />
      <Container className="relative grid gap-12 py-16 sm:py-20 lg:grid-cols-[1fr_1.2fr]">
        <div>
          <div className="eyebrow reveal mb-4">Early access</div>
          <h1 className="reveal text-4xl font-semibold text-navy-900 sm:text-5xl">Talk to us about your fermentation operation.</h1>
          <p className="reveal mt-5 max-w-md text-navy-600">Tell us about your process, vessels and data sources. A founder will follow up to arrange a walkthrough.</p>
          <div className="reveal card mt-8 space-y-3 p-4">
            {FOUNDERS.map((f) => (
              <div key={f.name} className="flex items-center gap-3 text-sm">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-forest-50 text-xs font-semibold text-forest-800 ring-1 ring-forest-100">{f.initials}</span>
                <div>
                  <div className="text-navy-900">{f.name}</div>
                  <div className="text-[12px] text-navy-500">{f.role}</div>
                </div>
              </div>
            ))}
            <a href={`mailto:${site.email}`} className="flex items-center gap-2 border-t border-line pt-3 text-sm text-forest-700 hover:underline">
              <Mail className="h-4 w-4" aria-hidden /> {site.email}
            </a>
          </div>
        </div>
        <div className="card p-6 sm:p-8">
          <LeadForm initialPlan={params.get('plan') ?? ''} />
        </div>
      </Container>
    </section>
  );
}
