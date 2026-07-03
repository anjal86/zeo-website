import React, { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { SpeedInsights } from '@vercel/speed-insights/react';

// Import UI components that are needed immediately
import Navigation from './components/Navigation/Navigation';
import Footer from './components/Footer/Footer';
import FloatingWhatsApp from './components/UI/FloatingWhatsApp';
import MobileStickyBar from './components/UI/MobileStickyBar';
import ExitIntentModal from './components/UI/ExitIntentModal';
import SocialProofToast from './components/UI/SocialProofToast';
import LoadingSpinner from './components/UI/LoadingSpinner';

// Lazy load pages for code-splitting to reduce main bundle size
const Home = lazy(() => import('./pages/Home'));
const DestinationsPage = lazy(() => import('./pages/Destinations'));
const DestinationDetail = lazy(() => import('./pages/DestinationDetail'));
const ToursPage = lazy(() => import('./pages/Tours'));
const TourDetail = lazy(() => import('./pages/TourDetail'));
const ActivitiesPage = lazy(() => import('./pages/Activities'));
const ActivityDetail = lazy(() => import('./pages/ActivityDetail'));
const KailashMansarovarPage = lazy(() => import('./pages/KailashMansarovar'));
const KailashGuide = lazy(() => import('./pages/KailashGuide'));
const KailashCostGuide = lazy(() => import('./pages/KailashCostGuide'));
const KailashDocumentsGuide = lazy(() => import('./pages/KailashDocumentsGuide'));
const NRIGuide = lazy(() => import('./pages/NRIGuide'));
const KailashPackingList = lazy(() => import('./pages/KailashPackingList'));
const KailashMedicalGuide = lazy(() => import('./pages/KailashMedicalGuide'));
const KailashInnerKora = lazy(() => import('./pages/KailashInnerKora'));
const EverestGuide = lazy(() => import('./pages/EverestGuide'));
const NepalVisaGuide = lazy(() => import('./pages/NepalVisaGuide'));
const BestTimeToVisitNepal = lazy(() => import('./pages/BestTimeToVisitNepal'));
const AboutPage = lazy(() => import('./pages/About'));
const ContactPage = lazy(() => import('./pages/Contact'));
const NotFound = lazy(() => import('./pages/NotFound'));
const BlogPage = lazy(() => import('./pages/Blog'));
const BlogPostPage = lazy(() => import('./pages/BlogPost'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));

// Lazy load Admin pages
const AdminLogin = lazy(() => import('./pages/AdminLogin'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const TourEditor = lazy(() => import('./pages/TourEditor'));
const BlogEditor = lazy(() => import('./pages/BlogEditor'));


// Component to handle scroll to top on route change
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // Only scroll to top on route changes, not on initial load/reload
    const isInitialLoad = sessionStorage.getItem('initialLoad') === null;

    if (isInitialLoad) {
      sessionStorage.setItem('initialLoad', 'false');
    } else {
      window.scrollTo(0, 0);
    }
  }, [pathname]);

  return null;
}

// Layout component that conditionally shows navigation and footer
function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <div className="App">
      {/* Navigation - Only show on non-admin routes */}
      {!isAdminRoute && <Navigation />}

      {/* Main Content (offset for fixed header) */}
      <main >
        {children}
      </main>

      {/* Footer - Only show on non-admin routes */}
      {!isAdminRoute && <Footer />}

      {/* Floating WhatsApp - Only show on non-admin routes */}
      {!isAdminRoute && (
        <div className="fixed bottom-20 md:bottom-6 right-4 md:right-6 z-30">
          <FloatingWhatsApp />
        </div>
      )}

      {/* Mobile Sticky Bar - Only show on non-admin routes on mobile */}
      {!isAdminRoute && <MobileStickyBar />}

      {/* Exit Intent Popup - only on non-admin routes */}
      {!isAdminRoute && <ExitIntentModal />}

      {/* Social Proof Toasts - only on non-admin routes, desktop only */}
      {!isAdminRoute && <SocialProofToast />}
    </div>
  );
}

function App() {
  return (
    <Router>
      <SpeedInsights />
      <ScrollToTop />
      <Layout>
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><LoadingSpinner size="lg" /></div>}>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/destinations" element={<DestinationsPage />} />
            <Route path="/destinations/:destinationName" element={<DestinationDetail />} />
            <Route path="/tours" element={<ToursPage />} />
            <Route path="/tours/:tourSlug" element={<TourDetail />} />
            <Route path="/activities" element={<ActivitiesPage />} />
            <Route path="/activities/:activityName" element={<ActivityDetail />} />
            <Route path="/kailash-mansarovar" element={<KailashMansarovarPage />} />
            <Route path="/kailash-mansarovar-yatra-guide" element={<KailashGuide />} />
            <Route path="/kailash-mansarovar-yatra-cost" element={<KailashCostGuide />} />
            <Route path="/kailash-mansarovar-yatra-documents-permits" element={<KailashDocumentsGuide />} />
            <Route path="/kailash-yatra-nri-guide" element={<NRIGuide />} />
            <Route path="/kailash-packing-list" element={<KailashPackingList />} />
            <Route path="/kailash-fitness-medical-guide" element={<KailashMedicalGuide />} />
            <Route path="/kailash-inner-kora-guide" element={<KailashInnerKora />} />
            <Route path="/everest-base-camp-guide" element={<EverestGuide />} />
            <Route path="/nepal-visa-guide" element={<NepalVisaGuide />} />
            <Route path="/best-time-to-visit-nepal" element={<BestTimeToVisitNepal />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/blog" element={<BlogPage />} />
            <Route path="/blog/:slug" element={<BlogPostPage />} />

            {/* Admin Routes */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/tours/new" element={<TourEditor />} />
            <Route path="/admin/tours/:tourSlug" element={<TourEditor />} />
            <Route path="/admin/blog/new" element={<BlogEditor />} />
            <Route path="/admin/blog/edit/:id" element={<BlogEditor />} />

            {/* Catch-all route for 404 pages */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </Layout>
    </Router>
  );
}

export default App;
