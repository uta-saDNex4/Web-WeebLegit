import React, { useState } from "react";
import { X, Copy, Check, Code2, FolderTree, Terminal } from "lucide-react";
import { motion } from "motion/react";

interface NextjsExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NextjsExportModal: React.FC<NextjsExportModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<"structure" | "page" | "guide">(
    "structure",
  );
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const nextjsStructure = `// Cấu trúc dự án Next.js 14/15 App Router:
my-contractly-app/
├── app/
│   ├── layout.tsx         # Root layout with Plus Jakarta Sans & Metadata
│   ├── page.tsx           # Main Landing Page (Hero, Templates, Process, AI Chat, Sources, CTA)
│   ├── globals.css        # Tailwind CSS + Font styling
│   └── api/
│       └── analyze/       # Server Action / API Route for contract AI analysis
│           └── route.ts
├── components/
│   ├── Navbar.tsx         # Header navigation
│   ├── Hero.tsx           # Hero section & Preview card
│   ├── TemplateLibrary.tsx# 4 Student contract templates
│   ├── VerificationProcess.tsx # 3-step verification flow
│   ├── AiAssistantSection.tsx  # Interactive AI Chat showcase
│   ├── LegalReferences.tsx# Legal citations & cloud storage
│   ├── CallToAction.tsx   # Final CTA banner
│   ├── Footer.tsx         # Footer & disclaimer
│   └── modals/
│       ├── ContractCheckerModal.tsx
│       └── TemplateViewerModal.tsx
├── data/
│   ├── contractTemplates.ts
│   └── legalReferences.ts
└── tailwind.config.ts`;

  const nextjsPageCode = `'use client';

import React, { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { Hero } from '@/components/Hero';
import { TemplateLibrary } from '@/components/TemplateLibrary';
import { VerificationProcess } from '@/components/VerificationProcess';
import { AiAssistantSection } from '@/components/AiAssistantSection';
import { LegalReferences } from '@/components/LegalReferences';
import { CallToAction } from '@/components/CallToAction';
import { Footer } from '@/components/Footer';
import { ContractCheckerModal } from '@/components/modals/ContractCheckerModal';
import { TemplateViewerModal } from '@/components/modals/TemplateViewerModal';
import { CONTRACT_TEMPLATES } from '@/data/contractTemplates';
import { ContractTemplate } from '@/types';

export default function Home() {
  const [isCheckerOpen, setIsCheckerOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<ContractTemplate | null>(null);

  return (
    <main className="min-h-screen bg-[#f7fafc] text-[#10253f]">
      <Navbar
        onOpenChecker={() => setIsCheckerOpen(true)}
        onOpenTemplates={() => {
          document.getElementById('templates-section')?.scrollIntoView({ behavior: 'smooth' });
        }}
      />
      <Hero
        onOpenChecker={() => setIsCheckerOpen(true)}
        onOpenTemplates={() => {
          document.getElementById('templates-section')?.scrollIntoView({ behavior: 'smooth' });
        }}
      />
      <TemplateLibrary
        onSelectTemplate={(tmpl) => setSelectedTemplate(tmpl)}
      />
      <VerificationProcess
        onStartProcess={() => setIsCheckerOpen(true)}
      />
      <AiAssistantSection />
      <LegalReferences
        onOpenChecker={() => setIsCheckerOpen(true)}
      />
      <CallToAction
        onStart={() => setIsCheckerOpen(true)}
      />
      <Footer />

      {/* Modals */}
      <ContractCheckerModal
        isOpen={isCheckerOpen}
        onClose={() => setIsCheckerOpen(false)}
      />
      <TemplateViewerModal
        template={selectedTemplate}
        onClose={() => setSelectedTemplate(null)}
      />
    </main>
  );
}`;

  const copyText = () => {
    const content =
      activeTab === "structure" ? nextjsStructure : nextjsPageCode;
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className="bg-[#10253f] text-white rounded-2xl border border-[#26435e] shadow-2xl max-w-3xl w-full max-h-[85vh] flex flex-col overflow-hidden my-6"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#26435e] flex items-center justify-between bg-[#0c1c30]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#EAD7B8] flex items-center justify-center text-[#10253f]">
              <Code2 className="w-4.5 h-4.5" />
            </div>
            <div>
              <h3 className="font-bold text-base">
                Next.js App Router Conversion
              </h3>
              <p className="text-xs text-[#8297ac]">
                Codebase sẵn sàng copy & chạy trong Next.js 14 / 15
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={copyText}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#10253f] bg-[#EAD7B8] hover:bg-[#dfc59f] rounded-lg transition-colors cursor-pointer"
            >
              {copied ? (
                <Check className="w-3.5 h-3.5" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
              <span>{copied ? "Đã sao chép" : "Sao chép code"}</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-[#8297ac] hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Buttons */}
        <div className="px-6 py-2.5 bg-[#173d5a]/60 border-b border-[#26435e] flex gap-2 text-xs font-medium">
          <button
            onClick={() => setActiveTab("structure")}
            className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${activeTab === "structure"
              ? "bg-[#EAD7B8] text-[#10253f] font-semibold"
              : "text-[#8297ac] hover:text-white"
              }`}
          >
            <FolderTree className="w-3.5 h-3.5" />
            <span>Cấu trúc thư mục</span>
          </button>
          <button
            onClick={() => setActiveTab("page")}
            className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${activeTab === "page"
              ? "bg-[#EAD7B8] text-[#10253f] font-semibold"
              : "text-[#8297ac] hover:text-white"
              }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>app/page.tsx</span>
          </button>
          <button
            onClick={() => setActiveTab("guide")}
            className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${activeTab === "guide"
              ? "bg-[#EAD7B8] text-[#10253f] font-semibold"
              : "text-[#8297ac] hover:text-white"
              }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Hướng dẫn cài đặt</span>
          </button>
        </div>

        {/* Code View Body */}
        <div className="flex-1 p-6 overflow-y-auto font-mono text-xs text-[#b9cadd] bg-[#0c1c30] leading-relaxed">
          {activeTab === "structure" && (
            <pre className="whitespace-pre">{nextjsStructure}</pre>
          )}
          {activeTab === "page" && (
            <pre className="whitespace-pre">{nextjsPageCode}</pre>
          )}
          {activeTab === "guide" && (
            <div className="space-y-4 font-sans text-xs">
              <div className="p-3 bg-white/5 rounded-xl border border-white/10 space-y-2">
                <h4 className="font-bold text-white text-sm">
                  1. Khởi tạo dự án Next.js (nếu chưa có):
                </h4>
                <code className="block p-2 rounded bg-black/40 text-[#6fe0c0]">
                  npx create-next-app@latest my-contractly --typescript
                  --tailwind --eslint --app
                </code>
              </div>
              <div className="p-3 bg-white/5 rounded-xl border border-white/10 space-y-2">
                <h4 className="font-bold text-white text-sm">
                  2. Cài đặt các thư viện bổ sung:
                </h4>
                <code className="block p-2 rounded bg-black/40 text-[#6fe0c0]">
                  npm install lucide-react motion
                </code>
              </div>
              <div className="p-3 bg-white/5 rounded-xl border border-white/10 space-y-2">
                <h4 className="font-bold text-white text-sm">
                  3. Copy các components & data:
                </h4>
                <p className="text-[#8297ac]">
                  Toàn bộ code trong source hiện tại được thiết kế 100% tương
                  thích cả với Next.js App Router (thêm{" "}
                  <code className="text-white">&#39;use client&#39;</code> ở đầu
                  các file có hook/state).
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-[#0c1c30] border-t border-[#26435e] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#26435e] hover:bg-[#34587a] text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </motion.div>
    </div>
  );
};
