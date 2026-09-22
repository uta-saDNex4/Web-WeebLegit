/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { AuthProvider } from "./lib/auth-context";
import { LanguageProvider } from "./lib/language-context";

// New Legal Components
import { NavbarLegal } from "./components/NavbarLegal";
import { HeroLegal } from "./components/HeroLegal";
import { QuickDropzone } from "./components/QuickDropzone";
import { LegalMetricsBar } from "./components/LegalMetricsBar";
import { LegalProcess } from "./components/LegalProcess";
import { ContractPitfallsSection } from "./components/ContractPitfallsSection";
import { StatuteReferenceSection } from "./components/StatuteReferenceSection";
import { CtaLegalBanner } from "./components/CtaLegalBanner";
import { Footer } from "./components/Footer";

// AI Assistant & Modals
import { FloatingAiWidget } from "./components/FloatingAiWidget";
import { ContractCheckerModal } from "./components/ContractCheckerModal";
import { LegalDetailsModal } from "./components/LegalDetailsModal";
import { NextjsExportModal } from "./components/NextjsExportModal";
import { AuthModal } from "./components/AuthModal";
import { LegalSource } from "./types";

function AppInner() {
  const [isCheckerOpen, setIsCheckerOpen] = useState(false);
  const [isNextjsOpen, setIsNextjsOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authInitialTab, setAuthInitialTab] = useState<"login" | "register">("login");
  const [selectedSource, setSelectedSource] = useState<LegalSource | null>(null);

  const handleScrollTo = (elementId: string) => {
    const el = document.getElementById(elementId);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleOpenChecker = () => setIsCheckerOpen(true);
  const handleOpenAuth = (tab: "login" | "register" = "login") => {
    setAuthInitialTab(tab);
    setIsAuthOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#FAF9F5] dark:bg-[#09111E] text-[#0F1E36] dark:text-[#E2E8F0] flex flex-col font-sans antialiased selection:bg-[#EAD7B8] selection:text-[#0F1E36] transition-colors duration-250">
      {/* 1. Header / Navbar with High-Contrast Action Buttons */}
      <NavbarLegal
        onOpenChecker={handleOpenChecker}
        onOpenAuth={handleOpenAuth}
        onScrollToSection={handleScrollTo}
      />

      {/* Main Content Sections */}
      <main className="flex-1">
        {/* 2. Hero Section & Live Interactive Contract Document Scanner Mockup */}
        <HeroLegal
          onOpenChecker={handleOpenChecker}
          onOpenPitfalls={() => handleScrollTo("pitfalls-section")}
        />

        {/* 3. Quick Dropzone — Interactive Upload directly on Homepage */}
        <QuickDropzone
          onOpenChecker={handleOpenChecker}
        />

        {/* 4. 3-Step Verification Pipeline */}
        <LegalProcess
          onStartProcess={handleOpenChecker}
        />

        {/* 5. Legal Pitfall Radar & Quick FAQ Accordion */}
        <ContractPitfallsSection
          onOpenChecker={handleOpenChecker}
        />

        {/* 6. Official Statutory Legal References */}
        <StatuteReferenceSection
          onSelectSource={(source) => setSelectedSource(source)}
          onOpenChecker={handleOpenChecker}
        />

        {/* 7. Bottom Call to Action Banner */}
        <CtaLegalBanner
          onStart={handleOpenChecker}
        />

        {/* 8. Trust & Legal Speed Metrics */}
        <LegalMetricsBar />
      </main>

      {/* Floating Interactive AI Assistant Chat Bubble (bottom-right) */}
      <FloatingAiWidget />

      {/* 9. Footer */}
      <Footer
        onOpenNextjsCode={() => setIsNextjsOpen(true)}
      />

      {/* ─── Modals (Esc & Backdrop Click Dismissable) ─── */}
      <AuthModal
        isOpen={isAuthOpen}
        initialTab={authInitialTab}
        onClose={() => setIsAuthOpen(false)}
      />

      <ContractCheckerModal
        isOpen={isCheckerOpen}
        onClose={() => setIsCheckerOpen(false)}
        onNeedAuth={() => handleOpenAuth("login")}
      />

      <LegalDetailsModal
        source={selectedSource}
        onClose={() => setSelectedSource(null)}
      />

      <NextjsExportModal
        isOpen={isNextjsOpen}
        onClose={() => setIsNextjsOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <AppInner />
      </LanguageProvider>
    </AuthProvider>
  );
}
