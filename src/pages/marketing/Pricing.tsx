import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Check } from 'lucide-react';
import { useDocumentMeta } from '@/hooks/useDocumentMeta';
import { pricingConfig, type PlanLimits, type PricingPlan } from '@/config/pricing';
import { Container, CtaBand } from '@/components/marketing/primitives';
import { SegmentedControl, cx } from '@/components/ui';

function price(plan: PricingPlan, annual: boolean) {
  if (plan.monthlyPrice === null) return null;
  return Math.round(plan.monthlyPrice * (annual ? 1 - pricingConfig.annualDiscount : 1));
}

const limitValue = (v: number | null) => (v === null ? 'Unlimited' : v.toLocaleString());

export default function Pricing() {
  useDocumentMeta({ title: 'Pricing', path: '/pricing', description: 'Illustrative Cultivane pricing: Development $149/month, Production $399/month, and Enterprise custom plans for fermentation teams.' });
  const [billing, setBilling] = useState<'monthly' | 'annual'>('monthly');
  const annual = billing === 'annual';
  const plans = pricingConfig.plans as readonly PricingPlan[];
  const limitKeys = Object.keys(pricingConfig.limitLabels) as (keyof PlanLimits)[];

  return (
    <>
      <section className="tech-grid relative border-b border-line">
        <div className="absolute inset-0 bg-gradient-to-b from-paper/0 to-paper" aria-hidden />
        <Container className="relative py-16 text-center sm:py-20">
          <div className="eyebrow mb-4">Pricing</div>
          <h1 className="mx-auto max-w-2xl text-4xl font-semibold text-navy-900 sm:text-5xl">Plans that scale with your fermentation operation.</h1>
          <p className="mx-auto mt-4 max-w-xl text-navy-600">Illustrative pricing for planning purposes. Final terms depend on deployment and integration scope.</p>
          <div className="mt-8 flex items-center justify-center gap-3">
            <SegmentedControl
              label="Billing period"
              value={billing}
              onChange={setBilling}
              options={[
                { value: 'monthly', label: 'Monthly' },
                { value: 'annual', label: `Annual (−${Math.round(pricingConfig.annualDiscount * 100)}%)` },
              ]}
            />
          </div>
        </Container>
      </section>

      <section className="py-14">
        <Container className="grid gap-6 lg:grid-cols-3">
          {plans.map((plan) => {
            const p = price(plan, annual);
            return (
              <article key={plan.id} className={cx('card relative flex flex-col p-7', plan.highlighted && 'border-forest-700 ring-1 ring-forest-700')} aria-labelledby={`plan-${plan.id}`}>
                {plan.highlighted && <span className="absolute -top-3 left-7 rounded-full bg-forest-900 px-2.5 py-1 text-[11px] font-medium text-mint-300">Most chosen</span>}
                <h2 id={`plan-${plan.id}`} className="text-lg font-semibold text-navy-900">
                  {plan.name}
                </h2>
                <p className="mt-1 text-sm text-navy-500">{plan.audience}</p>
                <div className="mt-6 flex items-baseline gap-1">
                  {p === null ? (
                    <span className="font-display text-4xl font-semibold text-navy-900">Custom</span>
                  ) : (
                    <>
                      <span className="font-display text-4xl font-semibold text-navy-900">${p}</span>
                      <span className="text-sm text-navy-500">/month{annual ? ', billed annually' : ''}</span>
                    </>
                  )}
                </div>
                <Link to={`/contact?plan=${plan.id}`} className={cx('mt-6 w-full', plan.highlighted ? 'btn-primary' : 'btn-secondary')}>
                  {plan.cta}
                </Link>
                <ul className="mt-7 space-y-2.5 text-sm text-navy-700">
                  {plan.features.map((f) => (
                    <li key={f} className="flex gap-2">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-forest-600" aria-hidden />
                      {f}
                    </li>
                  ))}
                </ul>
              </article>
            );
          })}
        </Container>
      </section>

      <section className="pb-6">
        <Container>
          <div className="card overflow-x-auto">
            <table className="w-full min-w-[560px] text-sm">
              <caption className="sr-only">Plan limits</caption>
              <thead>
                <tr className="border-b border-line bg-paper-2/60 text-left">
                  <th scope="col" className="px-5 py-3 font-medium text-navy-500">
                    Limits
                  </th>
                  {plans.map((p) => (
                    <th key={p.id} scope="col" className="px-5 py-3 font-semibold text-navy-900">
                      {p.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {limitKeys.map((k) => (
                  <tr key={k} className="border-b border-line last:border-0">
                    <th scope="row" className="px-5 py-3 text-left font-normal text-navy-600">
                      {pricingConfig.limitLabels[k]}
                    </th>
                    {plans.map((p) => (
                      <td key={p.id} className="data px-5 py-3 text-navy-900">
                        {limitValue(p.limits[k])}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-xs text-navy-500">Prices in {pricingConfig.currency}, excluding taxes. Plans, prices and limits are configured in <code className="data">src/config/pricing.ts</code>.</p>
        </Container>
      </section>
      <CtaBand />
    </>
  );
}
