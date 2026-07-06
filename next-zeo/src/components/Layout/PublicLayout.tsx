"use client";

import React from 'react';
import { usePathname } from 'next/navigation';
import Navigation from '../Navigation/Navigation';
import Footer from '../Footer/Footer';
import FloatingWhatsApp from '../UI/FloatingWhatsApp';
import MobileStickyBar from '../UI/MobileStickyBar';
import ExitIntentModal from '../UI/ExitIntentModal';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith('/admin');
  const isHomePage = pathname === '/';

  return (
    <div className="App flex flex-col min-h-screen">
      {!isAdminRoute && <Navigation />}

      <main className="flex-grow">
        {children}
      </main>

      {!isAdminRoute && <Footer />}

      {!isAdminRoute && (
        <div className="fixed bottom-20 md:bottom-6 right-4 md:right-6 z-30">
          <FloatingWhatsApp />
        </div>
      )}

      {!isAdminRoute && !isHomePage && <MobileStickyBar />}
      {!isAdminRoute && <ExitIntentModal />}
    </div>
  );
}
