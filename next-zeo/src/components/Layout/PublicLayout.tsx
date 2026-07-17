"use client";

import React from "react";
import { usePathname } from "next/navigation";
import Navigation from "../Navigation/Navigation";
import Footer from "../Footer/Footer";
import FloatingWhatsApp from "../UI/FloatingWhatsApp";
import MobileStickyBar from "../UI/MobileStickyBar";
import ExitIntentModal from "../UI/ExitIntentModal";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith("/admin");
  const isHomePage = pathname === "/";
  const shouldShowExitIntent =
    pathname?.startsWith("/tours/") || pathname === "/kailash-mansarovar";

  return (
    <div className="App flex min-h-screen flex-col">
      {!isAdminRoute && (
        <a className="skip-link" href="#main-content">
          Skip to main content
        </a>
      )}

      {!isAdminRoute && <Navigation />}

      <main id="main-content" tabIndex={-1} className="flex-grow">
        {children}
      </main>

      {!isAdminRoute && <Footer />}

      {!isAdminRoute && (
        <div className="fixed bottom-20 right-4 z-30 md:bottom-6 md:right-6">
          <FloatingWhatsApp />
        </div>
      )}

      {!isAdminRoute && !isHomePage && <MobileStickyBar />}
      {!isAdminRoute && shouldShowExitIntent && <ExitIntentModal />}
    </div>
  );
}
