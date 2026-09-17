/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AuthProvider } from './lib/auth-context';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { TemplateLibrary } from './components/TemplateLibrary';
import { VerificationProcess } from './components/VerificationProcess';
import { AiAssistantSection } from './components/AiAssistantSection';
import { LegalReferences } from './components/LegalReferences';
import { CallToAction } from './components/CallToAction';
import { Footer } from './components/Footer';
import { ContractCheckerModal } from './components/ContractCheckerModal';
import { TemplateViewerModal } from './components/TemplateViewerModal';
import { LegalDetailsModal } from './components/LegalDetailsModal';
import { NextjsExportModal } from './components/NextjsExportModal';
import { AuthModal } from './components/AuthModal';
import { ContractTemplate, LegalSource } from './types';

function AppInner() {
  const [isCheckerOpen, setIsCheckerOpen] = useState(false);
  const [isNextjsOpen, setIsNextjsOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<ContractTemplate | null>(null);
  const [selectedSource, setSelectedSource] = useState<LegalSource | null>(null);

  const handleScrollTo = (elementId: string) => {
    const el = document.getElementById(elementId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const [initialCheckerTemplate, setInitialCheckerTemplate] = useState<ContractTemplate | null>(null);

  // Mở ContractCheckerModal — nếu chưa login thì mở AuthModal trước
  const handleOpenChecker = () => {
    setInitialCheckerTemplate(null);
    setIsCheckerOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#f7fafc] text-[#10253f] flex flex-col font-sans antialiased selection:bg-[#EAD7B8] selection:text-[#10253f]">
      {/* Top sticky Navbar */}
      <Navbar
        onOpenChecker={handleOpenChecker}
        onOpenTemplates={() => handleScrollTo('templates-section')}
        onOpenNextjsCode={() => setIsNextjsOpen(true)}
        onOpenAuth={() => setIsAuthOpen(true)}
      />

      {/* Main Content Sections matching Framer layout */}
      <main className="flex-1">
        {/* 1. Hero Section & Interactive Preview Document */}
        <Hero
          onOpenChecker={handleOpenChecker}
          onOpenTemplates={() => handleScrollTo('templates-section')}
        />

        {/* 2. Thư viện bắt đầu (4 Student Contract Templates) */}
        <TemplateLibrary
          onSelectTemplate={(tmpl) => setSelectedTemplate(tmpl)}
        />

        {/* 3. Từ bản nháp đến tự tin ký (3-Step Process) */}
        <VerificationProcess
          onStartProcess={handleOpenChecker}
        />

        {/* 4. Trợ lý bên cạnh bạn (Interactive AI Assistant Chat) */}
        <AiAssistantSection />

        {/* 5. Dẫn chứng minh bạch (Legal References & Storage) */}
        <LegalReferences
          onSelectSource={(source) => setSelectedSource(source)}
          onOpenChecker={handleOpenChecker}
        />

        {/* 6. Bản demo cho sinh viên (Bottom CTA) */}
        <CallToAction
          onStart={handleOpenChecker}
        />
      </main>

      {/* Footer */}
      <Footer
        onOpenNextjsCode={() => setIsNextjsOpen(true)}
      />

      {/* ─── Modals ─── */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
      />

      <ContractCheckerModal
        isOpen={isCheckerOpen}
        onClose={() => {
          setIsCheckerOpen(false);
          setInitialCheckerTemplate(null);
        }}
        onNeedAuth={() => {
          setIsCheckerOpen(false);
          setIsAuthOpen(true);
        }}
        initialTemplate={initialCheckerTemplate}
      />

      <TemplateViewerModal
        template={selectedTemplate}
        onClose={() => setSelectedTemplate(null)}
        onUseTemplate={(tmpl) => {
          setSelectedTemplate(null);
          setInitialCheckerTemplate(tmpl);
          setIsCheckerOpen(true);
        }}
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
      <AppInner />
    </AuthProvider>
  );
}
