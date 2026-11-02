/** Early-access / contact lead: validation and the HubSpot Forms API payload. */

export interface Lead {
  name: string;
  email: string;
  company: string;
  role: string;
  plan: string;
  fermenters: string;
  useCase: string;
  message: string;
  consent: boolean;
  marketing: boolean;
  /** Honeypot: real visitors never see or fill this. */
  website: string;
}

export type LeadErrors = Partial<Record<keyof Lead, string>>;

export const emptyLead = (plan = ''): Lead => ({ name: '', email: '', company: '', role: '', plan, fermenters: '', useCase: '', message: '', consent: false, marketing: false, website: '' });

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function validateLead(f: Lead): LeadErrors {
  const e: LeadErrors = {};
  if (f.name.trim().length < 2) e.name = 'Enter your full name.';
  if (!EMAIL_RE.test(f.email.trim())) e.email = 'Enter a valid work email address.';
  if (f.company.trim().length < 2) e.company = 'Enter your company or organisation.';
  if (!f.fermenters) e.fermenters = 'Select the number of fermenters.';
  if (f.message.trim().length < 20) e.message = 'Tell us a little more (at least 20 characters).';
  if (f.message.length > 2000) e.message = 'Please keep your message under 2,000 characters.';
  if (!f.consent) e.consent = 'Please confirm we may contact you about this enquiry.';
  return e;
}

export interface HubspotConfig {
  portalId: string;
  formGuid: string;
  marketingSubscriptionTypeId?: string | undefined;
}

export function hubspotConfig(env: Record<string, string | undefined> = (import.meta.env ?? {}) as Record<string, string | undefined>): HubspotConfig | null {
  const portalId = env.VITE_HUBSPOT_PORTAL_ID?.trim();
  const formGuid = env.VITE_HUBSPOT_FORM_GUID?.trim();
  if (!portalId || !formGuid) return null;
  return { portalId, formGuid, marketingSubscriptionTypeId: env.VITE_HUBSPOT_MARKETING_SUBSCRIPTION_ID?.trim() || undefined };
}

export function leadPayload(l: Lead, context: { pageUri: string; pageName: string }, config: Partial<HubspotConfig> = {}) {
  const [first, ...rest] = l.name.trim().split(/\s+/);
  const fields = (
    [
      ['firstname', first],
      ['lastname', rest.join(' ')],
      ['email', l.email.trim()],
      ['company', l.company.trim()],
      ['jobtitle', l.role.trim()],
      ['fermenter_count', l.fermenters],
      ['primary_use_case', l.useCase],
      ['plan_of_interest', l.plan],
      ['enquiry_message', l.message.trim()],
    ] as const
  )
    .filter(([, v]) => v)
    .map(([name, value]) => ({ objectTypeId: '0-1', name, value }));
  return {
    fields,
    context,
    legalConsentOptions: {
      consent: {
        consentToProcess: true,
        text: 'I agree that Cultivane may contact me about this enquiry.',
        communications: l.marketing && config.marketingSubscriptionTypeId ? [{ value: true, subscriptionTypeId: Number(config.marketingSubscriptionTypeId), text: 'Send me occasional product updates.' }] : [],
      },
    },
  };
}
