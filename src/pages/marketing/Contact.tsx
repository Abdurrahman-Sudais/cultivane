import { useState, type FormEvent } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CheckCircle2, Mail } from 'lucide-react';
import { useDocumentMeta } from '@/hooks/useDocumentMeta';
import { site } from '@/config/site';
import { pricingConfig } from '@/config/pricing';
import { Container } from '@/components/marketing/primitives';

interface FormState {
  name: string;
  email: string;
  company: string;
  role: string;
  plan: string;
  fermenters: string;
  message: string;
  consent: boolean;
}

type Errors = Partial<Record<keyof FormState, string>>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function validateContact(f: FormState): Errors {
  const e: Errors = {};
  if (f.name.trim().length < 2) e.name = 'Enter your full name.';
  if (!EMAIL_RE.test(f.email.trim())) e.email = 'Enter a valid work email address.';
  if (f.company.trim().length < 2) e.company = 'Enter your company or organisation.';
  if (!f.fermenters) e.fermenters = 'Select the number of fermenters.';
  if (f.message.trim().length < 20) e.message = 'Tell us a little more (at least 20 characters).';
  if (f.message.length > 2000) e.message = 'Please keep your message under 2,000 characters.';
  if (!f.consent) e.consent = 'Please confirm we may contact you about this enquiry.';
  return e;
}

export default function Contact() {
  useDocumentMeta({ title: 'Contact', path: '/contact', description: `Contact Cultivane about fermentation batch monitoring. Email ${site.email}.` });
  const [params] = useSearchParams();
  const [form, setForm] = useState<FormState>({ name: '', email: '', company: '', role: '', plan: params.get('plan') ?? '', fermenters: '', message: '', consent: false });
  const [errors, setErrors] = useState<Errors>({});
  const [sent, setSent] = useState(false);

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) => {
    setForm((f) => ({ ...f, [k]: v }));
    if (errors[k]) setErrors((e) => ({ ...e, [k]: undefined }));
  };

  const submit = (ev: FormEvent) => {
    ev.preventDefault();
    const e = validateContact(form);
    setErrors(e);
    if (Object.keys(e).length) {
      document.getElementById(`f-${Object.keys(e)[0]}`)?.focus();
      return;
    }
    try {
      const prev = JSON.parse(localStorage.getItem('cultivane:enquiries') ?? '[]') as unknown[];
      localStorage.setItem('cultivane:enquiries', JSON.stringify([...prev, { ...form, at: new Date().toISOString() }]));
    } catch {
      /* ignore storage errors */
    }
    setSent(true);
  };

  const field = (k: keyof FormState) => ({
    id: `f-${k}`,
    'aria-invalid': errors[k] ? true : undefined,
    'aria-describedby': errors[k] ? `e-${k}` : undefined,
  });
  const Err = ({ k }: { k: keyof FormState }) =>
    errors[k] ? (
      <p id={`e-${k}`} className="mt-1 text-xs text-brick-700">
        {errors[k]}
      </p>
    ) : null;

  return (
    <section className="tech-grid relative border-b border-line">
      <div className="absolute inset-0 bg-gradient-to-b from-paper/30 to-paper" aria-hidden />
      <Container className="relative grid gap-12 py-16 sm:py-20 lg:grid-cols-[1fr_1.2fr]">
        <div>
          <div className="eyebrow mb-4">Contact</div>
          <h1 className="text-4xl font-semibold text-navy-900 sm:text-5xl">Talk to us about your fermentation operation.</h1>
          <p className="mt-5 max-w-md text-navy-600">Tell us about your process, vessels and data sources. We’ll follow up to arrange a walkthrough.</p>
          <div className="card mt-8 flex items-center gap-3 p-4">
            <Mail className="h-5 w-5 text-forest-600" aria-hidden />
            <div className="text-sm">
              <div className="text-navy-900">{site.founder}, Founder</div>
              <a href={`mailto:${site.email}`} className="text-forest-700 hover:underline">
                {site.email}
              </a>
            </div>
          </div>
        </div>
        <div className="card p-6 sm:p-8">
          {sent ? (
            <div role="status" className="py-10 text-center">
              <CheckCircle2 className="mx-auto h-10 w-10 text-forest-600" aria-hidden />
              <h2 className="mt-4 text-xl font-semibold text-navy-900">Thank you, {form.name.split(' ')[0]}.</h2>
              <p className="mx-auto mt-2 max-w-sm text-sm text-navy-600">
                Your enquiry was validated and saved locally in this demo — nothing was sent to a server. To reach us directly, email <a className="text-forest-700 underline" href={`mailto:${site.email}`}>{site.email}</a>.
              </p>
            </div>
          ) : (
            <form noValidate onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="label" htmlFor="f-name">Full name *</label>
                <input className="input" autoComplete="name" value={form.name} onChange={(e) => set('name', e.target.value)} {...field('name')} />
                <Err k="name" />
              </div>
              <div>
                <label className="label" htmlFor="f-email">Work email *</label>
                <input className="input" type="email" autoComplete="email" value={form.email} onChange={(e) => set('email', e.target.value)} {...field('email')} />
                <Err k="email" />
              </div>
              <div>
                <label className="label" htmlFor="f-company">Company *</label>
                <input className="input" autoComplete="organization" value={form.company} onChange={(e) => set('company', e.target.value)} {...field('company')} />
                <Err k="company" />
              </div>
              <div>
                <label className="label" htmlFor="f-role">Role</label>
                <input className="input" autoComplete="organization-title" value={form.role} onChange={(e) => set('role', e.target.value)} {...field('role')} />
              </div>
              <div>
                <label className="label" htmlFor="f-fermenters">Fermenters *</label>
                <select className="input" value={form.fermenters} onChange={(e) => set('fermenters', e.target.value)} {...field('fermenters')}>
                  <option value="">Select…</option>
                  <option>1–4</option>
                  <option>5–20</option>
                  <option>21–60</option>
                  <option>More than 60</option>
                </select>
                <Err k="fermenters" />
              </div>
              <div>
                <label className="label" htmlFor="f-plan">Plan of interest</label>
                <select className="input" value={form.plan} onChange={(e) => set('plan', e.target.value)} {...field('plan')}>
                  <option value="">Not sure yet</option>
                  {pricingConfig.plans.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="label" htmlFor="f-message">What would you like to discuss? *</label>
                <textarea className="input min-h-32" value={form.message} onChange={(e) => set('message', e.target.value)} {...field('message')} />
                <div className="flex justify-between">
                  <Err k="message" />
                  <span className="ml-auto mt-1 text-[11px] text-navy-400">{form.message.length}/2000</span>
                </div>
              </div>
              <div className="sm:col-span-2">
                <label className="flex items-start gap-2 text-sm text-navy-700">
                  <input type="checkbox" className="mt-0.5 h-4 w-4 accent-forest-700" checked={form.consent} onChange={(e) => set('consent', e.target.checked)} {...field('consent')} />
                  I agree that Cultivane may contact me about this enquiry.
                </label>
                <Err k="consent" />
              </div>
              <div className="sm:col-span-2">
                <button type="submit" className="btn-primary w-full sm:w-auto">
                  Send enquiry
                </button>
              </div>
            </form>
          )}
        </div>
      </Container>
    </section>
  );
}
