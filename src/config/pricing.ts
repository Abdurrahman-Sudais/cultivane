/**
 * Illustrative pricing. Edit this file to change plan prices, limits and features —
 * the Pricing page and comparison table are generated entirely from this configuration.
 */

export type PlanId = 'development' | 'production' | 'enterprise';

export interface PlanLimits {
  /** `null` means unlimited / negotiated. */
  activeBatches: number | null;
  fermenters: number | null;
  seats: number | null;
  historyMonths: number | null;
  sites: number | null;
}

export interface PricingPlan {
  id: PlanId;
  name: string;
  /** Monthly price in USD; `null` renders as "Custom". */
  monthlyPrice: number | null;
  audience: string;
  cta: string;
  highlighted?: boolean;
  limits: PlanLimits;
  features: string[];
}

export const pricingConfig = {
  currency: 'USD',
  /** Discount applied when annual billing is selected (0–1). */
  annualDiscount: 0.15,
  plans: [
    {
      id: 'development',
      name: 'Development',
      monthlyPrice: 149,
      audience: 'For small process-development teams.',
      cta: 'Start with Development',
      limits: { activeBatches: 10, fermenters: 4, seats: 5, historyMonths: 12, sites: 1 },
      features: [
        'Batch records and process-phase tracking',
        'Temperature, pH and dissolved-oxygen trends',
        'Manual and CSV measurement import',
        'Missing-data indicators on every chart',
        'Side-by-side batch comparison',
      ],
    },
    {
      id: 'production',
      name: 'Production',
      monthlyPrice: 399,
      audience: 'For industrial fermentation teams managing multiple batches.',
      cta: 'Choose Production',
      highlighted: true,
      limits: { activeBatches: 60, fermenters: 20, seats: 25, historyMonths: 60, sites: 1 },
      features: [
        'Everything in Development',
        'Matched reference-run selection',
        'Comparability warnings for recipe, equipment and phase',
        'Deviation investigations with assignment and status',
        'Data-quality workspace and completeness reporting',
        'Historian connector (OPC UA / CSV drop) — configured at onboarding',
      ],
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      monthlyPrice: null,
      audience: 'For larger facilities and multi-site operations.',
      cta: 'Talk to us',
      limits: { activeBatches: null, fermenters: null, seats: null, historyMonths: null, sites: null },
      features: [
        'Everything in Production',
        'Multi-site process libraries',
        'SSO and role-based access',
        'Validated deployment support and audit exports',
        'Dedicated onboarding engineer',
      ],
    },
  ] satisfies PricingPlan[],
  limitLabels: {
    activeBatches: 'Active batches',
    fermenters: 'Fermenters',
    seats: 'Team seats',
    historyMonths: 'Batch history (months)',
    sites: 'Sites',
  } satisfies Record<keyof PlanLimits, string>,
} as const;
