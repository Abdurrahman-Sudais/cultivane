import { useDocumentMeta } from '@/hooks/useDocumentMeta';
import { site } from '@/config/site';
import { Container, PageHero } from '@/components/marketing/primitives';

const PRIVACY: [string, string][] = [
  ['What this website is', 'This website describes Cultivane and includes an interactive demo workspace that runs entirely in your browser on simulated data. No historians, sensors or customer systems are connected.'],
  ['Demo data in your browser', 'Investigations, notes, assignments, settings, the chosen demo user and the demo audit log are saved in your browser’s local storage under the key cultivane:workspace:v1. That data never leaves your device. “Reset demo workspace” in Settings, or clearing site data, removes it.'],
  ['Early-access requests', `Until a form service is configured, the early-access form saves your enquiry in your browser (key cultivane:enquiries) and offers a pre-filled email to ${site.email}; nothing is sent until you send that email. If the operator connects the form to a customer-relationship service (proposed: HubSpot), submitting it sends the fields you enter, your consent choices and the page address to that service so Cultivane can reply. Product updates are sent only if you tick the optional box. This notice must be updated with the confirmed service and retention before that is switched on.`],
  ['Analytics, cookies and images', 'This website includes no analytics or advertising trackers and sets no cookies. Photographs are loaded from Unsplash, which receives standard request data (such as IP address) when they load. A hosting provider may process routine request data to serve and protect the site.'],
  ['Your requests', `Contact ${site.email} with questions about information you have sent to Cultivane, or to ask for it to be corrected or deleted.`],
];

const TERMS: [string, string][] = [
  ['Demonstration only', 'The batch dashboard is a demonstration on simulated data. It is not a production monitoring service and must not be used to make decisions about real batches.'],
  ['No diagnosis, dosing or release decisions', 'Cultivane describes how batches differ from matched reference runs. It does not identify causes such as contamination, recommend process changes, or approve batches for release.'],
  ['Pricing and availability', 'Prices shown are illustrative and exclude taxes. Early-access requests do not create a subscription or any commitment.'],
  ['Use of the site', 'Use the site and demo lawfully. Do not enter confidential recipes, client data or personal information into the demo or the enquiry form.'],
  ['Changes', 'These terms are a review draft. Operator details, governing law and production service terms will be set out separately before launch.'],
];

export default function Legal({ kind }: { kind: 'privacy' | 'terms' }) {
  const privacy = kind === 'privacy';
  useDocumentMeta({ title: privacy ? 'Privacy notice' : 'Terms of use', path: privacy ? '/privacy' : '/terms', description: privacy ? 'How the Cultivane website and demo workspace handle information.' : 'Terms for using the Cultivane website and demonstration workspace.' });
  return (
    <>
      <PageHero eyebrow="Review draft · operator details to be confirmed" title={privacy ? 'Privacy notice' : 'Terms of use'}>
        <p>{privacy ? 'How this website and its demo workspace handle information.' : 'Terms for using this website and its demonstration workspace.'}</p>
      </PageHero>
      <section className="py-16">
        <Container className="max-w-3xl space-y-8">
          {(privacy ? PRIVACY : TERMS).map(([t, b]) => (
            <div key={t} className="reveal">
              <h2 className="text-lg font-semibold text-navy-900">{t}</h2>
              <p className="mt-2 leading-relaxed text-navy-600">{b}</p>
            </div>
          ))}
          <p className="text-sm text-navy-500">
            Contact:{' '}
            <a href={`mailto:${site.email}`} className="text-forest-700 underline">
              {site.email}
            </a>
          </p>
        </Container>
      </section>
    </>
  );
}
