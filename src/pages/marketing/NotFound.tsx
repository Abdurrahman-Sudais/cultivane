import { Link } from 'react-router-dom';
import { useDocumentMeta } from '@/hooks/useDocumentMeta';
import { Container } from '@/components/marketing/primitives';

export default function NotFound() {
  useDocumentMeta({ title: 'Page not found', path: '/404', noindex: true });
  return (
    <Container className="py-32 text-center">
      <div className="eyebrow mb-3">404</div>
      <h1 className="text-3xl font-semibold">This page isn’t part of the process.</h1>
      <div className="mt-8 flex justify-center gap-3">
        <Link to="/" className="btn-primary">Go home</Link>
        <Link to="/batches" className="btn-secondary">Open dashboard</Link>
      </div>
    </Container>
  );
}
