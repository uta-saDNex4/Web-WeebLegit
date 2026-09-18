import React, { useState } from "react";
import { ContractTemplate } from "../types";
import {
  X,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Copy,
  Check,
  Sparkles,
  BookOpen,
  Download,
} from "lucide-react";
import { motion } from "motion/react";

interface TemplateViewerModalProps {
  template: ContractTemplate | null;
  onClose: () => void;
}

export const TemplateViewerModal: React.FC<TemplateViewerModalProps> = ({
  template,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);

  if (!template) return null;

  const handleCopyFullText = () => {
    const fullText =
      `${template.title}\n${template.subtitle}\n\n` +
      template.clauses.map((c) => `${c.title}\n${c.content}\n`).join("\n");
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className="bg-white rounded-2xl border border-[#d8e3ef] shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden my-6"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#e6edf4] flex items-center justify-between bg-[#f8fafd]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#EAD7B8] flex items-center justify-center text-[#10253f]">
              <FileText className="w-4.5 h-4.5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-[#10253f]">
                {template.title}
              </h3>
              <p className="text-xs text-[#8297ac]">{template.subtitle}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyFullText}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#10253f] bg-[#EAD7B8] hover:bg-[#dfc59f] rounded-lg transition-colors cursor-pointer"
            >
              {copied ? (
                <Check className="w-3.5 h-3.5" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
              <span>{copied ? "Đã sao chép" : "Sao chép toàn bộ"}</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-[#8297ac] hover:text-[#10253f] hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Clauses */}
        <div className="flex-1 p-6 overflow-y-auto space-y-6">
          <div className="p-4 rounded-xl bg-[#f2f7fc] border border-[#d8e3ef] text-xs text-[#49627d]">
            💡 <strong>Hướng dẫn:</strong> Dưới đây là các điều khoản mẫu tiêu
            chuẩn kèm theo các điểm cảnh báo AI đã chú thích để bạn nhận biết
            những câu chữ gài bẫy thường gặp.
          </div>

          <div className="space-y-4">
            {template.clauses.map((clause, idx) => (
              <div
                key={idx}
                className={`p-4 rounded-xl border transition-all ${
                  clause.isRisky
                    ? "bg-[#fff8f8] border-[#ffd1cc]"
                    : "bg-white border-[#e6edf4]"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-bold text-sm text-[#10253f]">
                    {clause.title}
                  </h4>
                  {clause.isRisky ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#e4534b] bg-[#fff1f0] border border-[#ffd1cc] px-2 py-0.5 rounded">
                      <AlertTriangle className="w-3 h-3" />
                      Cần đàm phán lại
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#159f7b] bg-[#eafbf7] border border-[#b7f6e5] px-2 py-0.5 rounded">
                      <CheckCircle2 className="w-3 h-3" />
                      Điều khoản an toàn
                    </span>
                  )}
                </div>

                <p className="text-xs text-[#26435e] leading-relaxed mb-3">
                  {clause.content}
                </p>

                {clause.advice && (
                  <div
                    className={`p-3 rounded-lg text-xs leading-relaxed ${
                      clause.isRisky
                        ? "bg-white border border-[#ffd1cc] text-[#7d342f]"
                        : "bg-[#f7fafc] text-[#49627d]"
                    }`}
                  >
                    <div className="font-semibold mb-0.5 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-[#8a6834]" />
                      <span>Lời khuyên của WeebLegit:</span>
                    </div>
                    {clause.advice}
                    {clause.lawReference && (
                      <div className="mt-1 font-medium text-[#8a6834] text-[11px]">
                        ⚖️ {clause.lawReference}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-[#f8fafd] border-t border-[#e6edf4] flex items-center justify-between">
          <span className="text-xs text-[#8297ac]">
            Mẫu hợp đồng sinh viên • WeebLegit
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#10253f] hover:bg-[#173d5a] text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </motion.div>
    </div>
  );
};
