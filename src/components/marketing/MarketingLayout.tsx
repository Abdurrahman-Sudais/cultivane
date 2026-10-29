import { Suspense, useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { ArrowRight, Menu, X } from 'lucide-react';
import { Logo, cx } from '@/components/ui';
import { marketingNav, site } from '@/config/site';

export function MarketingLayout() {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  useEffect(() => {
    setOpen(false);
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div className="flex min-h-screen flex-col">
      <a href="#main" className="sr-only z-50 rounded bg-forest-900 px-3 py-2 text-paper focus:not-sr-only focus:fixed focus:top-3 focus:left-3">
        Skip to content
      </a>
      <header className="sticky top-0 z-40 border-b border-line/80 bg-paper/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link to="/" aria-label="Cultivane home">
            <Logo />
          </Link>
          <nav aria-label="Primary" className="hidden items-center gap-1 lg:flex">
            {marketingNav.map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                className={({ isActive }) => cx('rounded-md px-3 py-2 text-[13px] font-medium transition-colors', isActive ? 'text-forest-800' : 'text-navy-600 hover:text-navy-900')}
              >
                {n.label}
              </NavLink>
            ))}
          </nav>
          <div className="hidden items-center gap-2 lg:flex">
            <Link to="/contact" className="btn-ghost btn-sm">
              Contact
            </Link>
            <Link to="/batches" className="btn-primary btn-sm">
              Open dashboard <ArrowRight className="h-3.5 w-3.5" aria-hidden />
            </Link>
          </div>
          <button type="button" className="btn-ghost -mr-2 p-2 lg:hidden" aria-expanded={open} aria-controls="mobile-nav" aria-label={open ? 'Close menu' : 'Open menu'} onClick={() => setOpen((o) => !o)}>
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
        {open && (
          <nav id="mobile-nav" aria-label="Mobile" className="border-t border-line bg-paper px-4 pt-2 pb-4 lg:hidden">
            {[...marketingNav, { to: '/contact', label: 'Contact' }].map((n) => (
              <NavLink key={n.to} to={n.to} className={({ isActive }) => cx('block rounded-md px-3 py-2.5 text-sm', isActive ? 'bg-forest-50 text-forest-800' : 'text-navy-700')}>
                {n.label}
              </NavLink>
            ))}
            <Link to="/batches" className="btn-primary mt-3 w-full">
              Explore the Batch Dashboard
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
    { title: 'Product', links: [['/product', 'Overview'], ['/batch-monitoring', 'Batch Monitoring'], ['/process-analytics', 'Process Analytics'], ['/batches', 'Live demo dashboard']] },
    { title: 'Company', links: [['/how-it-works', 'How It Works'], ['/pricing', 'Pricing'], ['/about', 'About'], ['/contact', 'Contact']] },
  ] as const;
  return (
    <footer className="tech-grid-dark bg-forest-950 text-paper/80">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr_1.2fr] lg:px-8">
        <div>
          <Logo dark />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-paper/60">{site.tagline} Batch monitoring and process investigation for industrial fermentation teams.</p>
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
        <div>
          <h2 className="eyebrow mb-3 text-mint-300">Contact</h2>
          <p className="text-sm text-paper/70">
            {site.founder}, Founder
            <br />
            <a href={`mailto:${site.email}`} className="text-mint-300 hover:underline">
              {site.email}
            </a>
          </p>
          <p className="mt-4 text-xs leading-relaxed text-paper/45">Cultivane is a decision-support tool. It does not diagnose causes, recommend dosing changes or approve batches for release.</p>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-5 text-xs text-paper/45 sm:flex-row sm:justify-between sm:px-6 lg:px-8">
          <span>© {new Date().getFullYear()} Cultivane · {site.domain}</span>
          <span>All dashboard data shown on this site is simulated.</span>
        </div>
      </div>
    </footer>
  );
}
