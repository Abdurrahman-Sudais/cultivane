import { Suspense, useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { ArrowRight, Menu, X } from 'lucide-react';
import { Logo, cx } from '@/components/ui';
import { FOUNDERS, marketingNav, site } from '@/config/site';
import { useRevealOnScroll } from '@/lib/motion';

export function MarketingLayout() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { pathname, hash } = useLocation();
  useRevealOnScroll(pathname);
  useEffect(() => {
    setOpen(false);
    if (!hash) {
      window.scrollTo(0, 0);
      return;
    }
    // Pages load on demand, so keep looking for the anchor briefly, then align again once charts settle.
    let tries = 0;
    let t = 0;
    const find = () => {
      const el = document.getElementById(decodeURIComponent(hash.slice(1)));
      if (el) {
        el.scrollIntoView();
        t = window.setTimeout(() => el.scrollIntoView(), 450);
      } else if (tries++ < 40) t = window.setTimeout(find, 50);
    };
    find();
    return () => window.clearTimeout(t);
  }, [pathname, hash]);
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 8);
    on();
    window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, []);

  return (
    <div className="flex min-h-screen flex-col">
      <a href="#main" className="sr-only z-50 rounded bg-forest-900 px-3 py-2 text-paper focus:not-sr-only focus:fixed focus:top-3 focus:left-3">
        Skip to content
      </a>
      <header className={cx('sticky top-0 z-40 border-b backdrop-blur-md transition-all duration-300', scrolled ? 'border-line/80 bg-paper/90 shadow-[0_8px_30px_-18px_rgba(14,42,34,0.35)]' : 'border-transparent bg-paper/50')}>
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link to="/" aria-label="Cultivane home">
            <Logo />
          </Link>
          <nav aria-label="Primary" className="hidden items-center gap-1 lg:flex">
            {marketingNav.map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                className={({ isActive }) =>
                  cx(
                    'relative rounded-md px-3 py-2 text-[13px] font-medium transition-colors after:absolute after:inset-x-3 after:-bottom-px after:h-px after:origin-left after:bg-forest-600 after:transition-transform',
                    isActive && !n.to.includes('#') ? 'text-forest-800 after:scale-x-100' : 'text-navy-600 after:scale-x-0 hover:text-navy-900 hover:after:scale-x-100',
                  )
                }
              >
                {n.label}
              </NavLink>
            ))}
          </nav>
          <div className="hidden items-center gap-2 lg:flex">
            <Link to="/batches" className="btn-ghost btn-sm">
              Live demo
            </Link>
            <Link to="/contact" className="btn-primary btn-sm">
              Request early access <ArrowRight className="h-3.5 w-3.5" aria-hidden />
            </Link>
          </div>
          <button type="button" className="btn-ghost -mr-2 p-2 lg:hidden" aria-expanded={open} aria-controls="mobile-nav" aria-label={open ? 'Close menu' : 'Open menu'} onClick={() => setOpen((o) => !o)}>
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
        {open && (
          <nav id="mobile-nav" aria-label="Mobile" className="border-t border-line bg-paper px-4 pt-2 pb-4 lg:hidden">
            {marketingNav.map((n) => (
              <NavLink key={n.to} to={n.to} className={({ isActive }) => cx('block rounded-md px-3 py-2.5 text-sm', isActive ? 'bg-forest-50 text-forest-800' : 'text-navy-700')}>
                {n.label}
              </NavLink>
            ))}
            <Link to="/contact" className="btn-primary mt-3 w-full">
              Request early access
            </Link>
            <Link to="/batches" className="btn-secondary mt-2 w-full">
              Explore the live demo
            </Link>
          </nav>
        )}
      </header>
      <main id="main" className="flex-1">
        <Suspense fallback={<div className="flex min-h-[40vh] items-center justify-center text-sm text-navy-400" role="status">Loading…</div>}>
          <Outlet />
        </Suspense>
      </main>
      <SiteFooter />
    </div>
  );
}

function SiteFooter() {
  const cols = [
    { title: 'Platform', links: [['/product', 'Platform overview'], ['/batch-monitoring', 'Batch monitoring'], ['/process-analytics', 'Process analytics'], ['/batches', 'Live demo'], ['/pricing', 'Pricing']] },
    { title: 'Solutions', links: [['/#problem', 'Problems we solve'], ['/#who', 'Who it’s for'], ['/#compare', 'Why Cultivane'], ['/how-it-works', 'How it works'], ['/#roadmap', 'Roadmap']] },
    { title: 'Company', links: [['/about', 'About & team'], ['/technology', 'Technology (AWS)'], ['/security', 'Security & safeguards'], ['/contact', 'Request early access'], ['/#faq', 'FAQ']] },
    { title: 'Legal', links: [['/privacy', 'Privacy notice'], ['/terms', 'Terms of use']] },
  ] as const;
  return (
    <footer className="tech-grid-dark relative overflow-hidden bg-forest-950 text-paper/80">
      <div className="pointer-events-none absolute -top-40 left-1/2 h-80 w-[48rem] -translate-x-1/2 rounded-full bg-teal-500/10 blur-3xl" aria-hidden />
      <div className="relative mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 md:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr_0.8fr] lg:px-8">
        <div>
          <Logo dark />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-paper/60">{site.tagline} Batch monitoring and process investigation for industrial fermentation teams.</p>
          <a href={`mailto:${site.email}`} className="mt-4 inline-block font-mono text-sm text-mint-300 hover:underline">
            {site.email}
          </a>
          <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-paper/70">
            <span className="live-dot" aria-hidden /> Early access open · pilots on one fermentation line
          </div>
        </div>
        {cols.map((c) => (
          <div key={c.title}>
            <h2 className="eyebrow mb-3 text-mint-300">{c.title}</h2>
            <ul className="space-y-2 text-sm">
              {c.links.map(([to, label]) => (
                <li key={to}>
                  <Link to={to} className="text-paper/70 hover:text-paper">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="relative border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-5 text-xs text-paper/45 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
          <span>
            © {new Date().getFullYear()} Cultivane · Founded by{' '}
            {FOUNDERS.map((f, i) => (
              <span key={f.name}>
                {i > 0 && ' & '}
                <Link to="/about#team" className="text-paper/75 hover:text-paper">
                  {f.name}
                </Link>
              </span>
            ))}
          </span>
          <span>All dashboard data shown on this site is simulated. Cultivane does not diagnose causes or approve batches for release.</span>
        </div>
      </div>
    </footer>
  );
}
