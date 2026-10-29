import { CheckCircle2 } from 'lucide-react';
import { useDocumentMeta } from '@/hooks/useDocumentMeta';
import { photos } from '@/config/site';
import { Container, CtaBand, PageHero, Photo } from '@/components/marketing/primitives';
import { howItWorksSteps } from './Home';

const details = [
  ['Recipe registry with versioned setpoints and phase plans', 'Fermenter registry with equipment compatibility groups', 'Batch metadata validated against both registries'],
  ['CSV or historian export import (15-min or finer)', 'Manual entry for offline samples', 'Missing intervals recorded with a reason, never zero-filled'],
  ['Suggested reference runs per batch and phase', 'Elapsed-time or phase-aligned overlays', 'Comparability warnings with the specific mismatch'],
  ['Evidence window with corresponding signals', 'Assignment, status and engineer notes', 'Full history of changes on each investigation'],
];

export default function HowItWorks() {
  useDocumentMeta({ title: 'How It Works', path: '/how-it-works', description: 'How Cultivane works: organise batch metadata, import measurements, compare matched runs, and investigate deviations.' });
  return (
    <>
      <PageHero eyebrow="How it works" title="From readings to recorded findings in four steps." aside={<Photo src={photos.labBench.src} alt={photos.labBench.alt} className="aspect-[4/3]" />}>
        <p>Cultivane sits beside your historian and LIMS. It doesn’t control equipment; it organises the record so engineers can compare and investigate with confidence.</p>
      </PageHero>
      <section className="py-20">
        <Container>
          <ol className="relative space-y-6 before:absolute before:top-4 before:bottom-4 before:left-[19px] before:w-px before:bg-line">
            {howItWorksSteps.map((s, i) => (
              <li key={s.title} className="relative grid gap-4 pl-14 md:grid-cols-[1fr_1.1fr] md:gap-10">
                <span className="data absolute top-0 left-0 flex h-10 w-10 items-center justify-center rounded-full border border-forest-200 bg-white text-sm text-forest-700">0{i + 1}</span>
                <div>
                  <h2 className="text-xl font-semibold text-navy-900">{s.title}</h2>
                  <p className="mt-2 text-[15px] leading-relaxed text-navy-600">{s.body}</p>
                </div>
                <ul className="card space-y-2.5 p-5">
                  {details[i]!.map((d) => (
                    <li key={d} className="flex gap-2 text-sm text-navy-700">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-teal-500" aria-hidden />
                      {d}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ol>
        </Container>
      </section>
      <section className="border-y border-line bg-paper-2/60 py-16">
        <Container>
          <h2 className="text-xl font-semibold text-navy-900">What Cultivane deliberately does not do</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {['Diagnose the cause of a deviation (e.g. contamination)', 'Recommend feed, base or antifoam dosing changes', 'Approve or reject a batch for release'].map((t) => (
              <div key={t} className="rounded-lg border border-line bg-white px-4 py-3 text-sm text-navy-700">
                {t}
              </div>
            ))}
          </div>
        </Container>
      </section>
      <CtaBand />
    </>
  );
}
