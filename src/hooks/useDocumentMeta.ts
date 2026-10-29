import { useEffect } from 'react';
import { site } from '@/config/site';

function setMeta(attr: 'name' | 'property', key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.content = content;
}

/** Per-route SEO metadata for the single-page app. */
export function useDocumentMeta({ title, description, path, noindex = false }: { title: string; description?: string; path: string; noindex?: boolean }) {
  useEffect(() => {
    const full = path === '/' ? `${site.name} — ${site.tagline.replace(/\.$/, '')}` : `${title} · ${site.name}`;
    const desc = description ?? site.description;
    document.title = full;
    setMeta('name', 'description', desc);
    setMeta('property', 'og:title', full);
    setMeta('property', 'og:description', desc);
    setMeta('property', 'og:url', `${site.url}${path}`);
    setMeta('name', 'robots', noindex ? 'noindex, nofollow' : 'index, follow');
    let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = `${site.url}${path}`;
  }, [title, description, path, noindex]);
}
