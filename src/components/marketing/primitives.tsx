import { useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { cx } from '@/components/ui';
import { BioreactorIllustration } from './BioreactorIllustration';

export function Container({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cx('mx-auto max-w-7xl px-4 sm:px-6 lg:px-8', className)}>{children}</div>;
}

export function SectionHeading({ eyebrow, title, children, center = false, className }: { eyebrow?: string; title: ReactNode; children?: ReactNode; center?: boolean; className?: string }) {
  return (
    <div className={cx('max-w-2xl', center && 'mx-auto text-center', className)}>
      {eyebrow && <div className="eyebrow mb-3">{eyebrow}</div>}
      <h2 className="text-3xl font-semibold text-navy-900 sm:text-[2.35rem] sm:leading-[1.12]">{title}</h2>
      {children && <div className="mt-4 text-[15px] leading-relaxed text-navy-600">{children}</div>}
    </div>
  );
}

/** Photo with graceful fallback to an illustration if the image fails to load. */
export function Photo({ src, alt, className, caption }: { src: string; alt: string; className?: string; caption?: string }) {
  const [failed, setFailed] = useState(false);
  return (
    <figure className={cx('relative overflow-hidden rounded-xl bg-forest-900', className)}>
      {failed ? (
        <div className="tech-grid-dark flex h-full w-full items-center justify-center p-8">
          <BioreactorIllustration className="h-full max-h-72 w-auto" dark />
        </div>
      ) : (
        <img src={src} alt={alt} loading="lazy" onError={() => setFailed(true)} className="h-full w-full object-cover" />
      )}
      {caption && (
        <figcaption className="absolute bottom-3 left-3 rounded bg-forest-950/75 px-2 py-1 font-mono text-[10px] tracking-wide text-mint-200 backdrop-blur">{caption}</figcaption>
      )}
    </figure>
  );
}

export function PageHero({ eyebrow, title, children, aside }: { eyebrow: string; title: ReactNode; children?: ReactNode; aside?: ReactNode }) {
  return (
    <section className="tech-grid relative overflow-hidden border-b border-line">
      <div className="absolute inset-0 bg-gradient-to-b from-paper/0 via-paper/40 to-paper" aria-hidden />
      <Container className="relative grid gap-10 py-16 sm:py-20 lg:grid-cols-[1.1fr_1fr] lg:items-center">
        <div>
          <div className="eyebrow mb-4">{eyebrow}</div>
          <h1 className="text-4xl font-semibold text-navy-900 sm:text-5xl sm:leading-[1.05]">{title}</h1>
          {children && <div className="mt-5 max-w-xl text-base leading-relaxed text-navy-600">{children}</div>}
        </div>
        {aside}
      </Container>
    </section>
  );
}

export function CtaBand({ title = 'Give every batch a clearer operational history.', body }: { title?: string; body?: string }) {
  return (
    <section className="py-20">
      <Container>
        <div className="tech-grid-dark relative overflow-hidden rounded-2xl bg-forest-900 px-6 py-14 sm:px-12">
          <div className="absolute -top-20 -right-20 h-72 w-72 rounded-full bg-teal-500/20 blur-3xl" aria-hidden />
          <div className="relative grid gap-8 lg:grid-cols-[1.5fr_1fr] lg:items-center">
            <div>
              <h2 className="text-3xl font-semibold text-paper sm:text-4xl">{title}</h2>
              <p className="mt-3 max-w-xl text-paper/70">{body ?? 'Explore the demonstration workspace with a simulated industrial enzyme facility, or talk to us about your fermentation operation.'}</p>
            </div>
            <div className="flex flex-wrap gap-3 lg:justify-end">
              <Link to="/batches" className="btn bg-mint-300 text-forest-950 hover:bg-mint-400">
                Explore the Batch Dashboard <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
              <Link to="/contact" className="btn border border-white/20 text-paper hover:bg-white/10">
                Contact us
              </Link>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

export function FeatureCard({ icon, title, children }: { icon: ReactNode; title: string; children: ReactNode }) {
  return (
    <div className="card group p-6 transition-shadow hover:shadow-[0_8px_30px_-12px_rgba(14,42,34,0.18)]">
      <div className="mb-4 inline-flex h-9 w-9 items-center justify-center rounded-lg bg-forest-50 text-forest-700 ring-1 ring-forest-100">{icon}</div>
      <h3 className="text-base font-semibold text-navy-900">{title}</h3>
      <div className="mt-2 text-sm leading-relaxed text-navy-600">{children}</div>
    </div>
  );
}
