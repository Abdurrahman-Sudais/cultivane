import { lazy, Suspense } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { MarketingLayout } from '@/components/marketing/MarketingLayout';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { WorkspaceProvider } from '@/state/store';
import Home from '@/pages/marketing/Home';

const Product = lazy(() => import('@/pages/marketing/Product'));
const BatchMonitoring = lazy(() => import('@/pages/marketing/BatchMonitoring'));
const ProcessAnalytics = lazy(() => import('@/pages/marketing/ProcessAnalytics'));
const HowItWorks = lazy(() => import('@/pages/marketing/HowItWorks'));
const Pricing = lazy(() => import('@/pages/marketing/Pricing'));
const About = lazy(() => import('@/pages/marketing/About'));
const Contact = lazy(() => import('@/pages/marketing/Contact'));
const NotFound = lazy(() => import('@/pages/marketing/NotFound'));
const Technology = lazy(() => import('@/pages/marketing/Technology'));
const Security = lazy(() => import('@/pages/marketing/Security'));
const Legal = lazy(() => import('@/pages/marketing/Legal'));

const Overview = lazy(() => import('@/pages/dashboard/Overview'));
const BatchList = lazy(() => import('@/pages/dashboard/BatchList'));
const BatchDetail = lazy(() => import('@/pages/dashboard/BatchDetail'));
const ProcessRuns = lazy(() => import('@/pages/dashboard/ProcessRuns'));
const Trends = lazy(() => import('@/pages/dashboard/Trends'));
const Comparisons = lazy(() => import('@/pages/dashboard/Comparisons'));
const Investigations = lazy(() => import('@/pages/dashboard/Investigations'));
const InvestigationDetail = lazy(() => import('@/pages/dashboard/InvestigationDetail'));
const DataQuality = lazy(() => import('@/pages/dashboard/DataQuality'));
const SettingsPage = lazy(() => import('@/pages/dashboard/Settings'));
const Audit = lazy(() => import('@/pages/dashboard/Audit'));

function Loading() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center text-sm text-navy-400" role="status">
      Loading…
    </div>
  );
}

export default function App() {
  return (
    <WorkspaceProvider>
      <BrowserRouter>
        <Suspense fallback={<Loading />}>
          <Routes>
            <Route element={<MarketingLayout />}>
              <Route index element={<Home />} />
              <Route path="product" element={<Product />} />
              <Route path="batch-monitoring" element={<BatchMonitoring />} />
              <Route path="process-analytics" element={<ProcessAnalytics />} />
              <Route path="how-it-works" element={<HowItWorks />} />
              <Route path="pricing" element={<Pricing />} />
              <Route path="about" element={<About />} />
              <Route path="contact" element={<Contact />} />
              <Route path="technology" element={<Technology />} />
              <Route path="security" element={<Security />} />
              <Route path="privacy" element={<Legal kind="privacy" />} />
              <Route path="terms" element={<Legal kind="terms" />} />
              <Route path="*" element={<NotFound />} />
            </Route>
            <Route path="batches" element={<DashboardLayout />}>
              <Route index element={<Overview />} />
              <Route path="list" element={<BatchList />} />
              <Route path="b/:batchId" element={<BatchDetail />} />
              <Route path="runs" element={<ProcessRuns />} />
              <Route path="trends" element={<Trends />} />
              <Route path="compare" element={<Comparisons />} />
              <Route path="investigations" element={<Investigations />} />
              <Route path="investigations/:investigationId" element={<InvestigationDetail />} />
              <Route path="data-quality" element={<DataQuality />} />
              <Route path="audit" element={<Audit />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </Suspense>
      </BrowserRouter>
    </WorkspaceProvider>
  );
}
