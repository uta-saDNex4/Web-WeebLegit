import React, { useEffect } from "react";
import { ContractTemplate } from "../types";
import { FileText, AlertTriangle, CheckCircle2, Sparkles, X } from "lucide-react";
import { motion } from "motion/react";

interface TemplateViewerModalProps {
  template: ContractTemplate | null;
  onClose: () => void;
}

export const TemplateViewerModal: React.FC<TemplateViewerModalProps> = ({
  template,
  onClose,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!template) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto cursor-pointer"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        onClick={(e) => e.stopPropagation()}
        className="cursor-default bg-white dark:bg-[#0b1424] rounded-2xl border border-[#d8e3ef] dark:border-[#1a2d4b] shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden my-6"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#e6edf4] dark:border-[#1a2d4b] flex items-center justify-between bg-[#f8fafd] dark:bg-[#0f1b2f]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#EAD7B8] flex items-center justify-center text-[#10253f]">
              <FileText className="w-4.5 h-4.5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-[#10253f] dark:text-white">
                {template.title}
              </h3>
              <p className="text-xs text-[#8297ac] dark:text-[#8fa3bf]">
                {template.subtitle}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#8297ac] hover:text-[#10253f] dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#12223c] transition-colors cursor-pointer"
            title="Đóng"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Clauses */}
        <div className="flex-1 p-6 overflow-y-auto space-y-6">
          <div className="p-4 rounded-xl bg-[#f2f7fc] dark:bg-[#12223c] border border-[#d8e3ef] dark:border-[#1c3050] text-xs text-[#49627d] dark:text-[#94a9c9]">
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
                    ? "bg-[#fff8f8] dark:bg-[#201216] border-[#ffd1cc] dark:border-[#4a1c22]"
                    : "bg-white dark:bg-[#0e192c] border-[#e6edf4] dark:border-[#1a2d4b]"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-bold text-sm text-[#10253f] dark:text-white">
                    {clause.title}
                  </h4>
                  {clause.isRisky ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#e4534b] bg-[#fff1f0] dark:bg-[#351418] border border-[#ffd1cc] dark:border-[#522128] px-2 py-0.5 rounded">
                      <AlertTriangle className="w-3 h-3" />
                      Cần đàm phán lại
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#159f7b] bg-[#eafbf7] dark:bg-[#0c2e26] border border-[#b7f6e5] dark:border-[#155446] px-2 py-0.5 rounded">
                      <CheckCircle2 className="w-3 h-3" />
                      Điều khoản an toàn
                    </span>
                  )}
                </div>

                <p className="text-xs text-[#26435e] dark:text-[#c4d5ea] leading-relaxed mb-3">
                  {clause.content}
                </p>

                {clause.advice && (
                  <div
                    className={`p-3 rounded-lg text-xs leading-relaxed ${
                      clause.isRisky
                        ? "bg-white dark:bg-[#160c10] border border-[#ffd1cc] dark:border-[#4a1c22] text-[#7d342f] dark:text-[#f8a8a2]"
                        : "bg-[#f7fafc] dark:bg-[#0a1220] border border-[#e2e8f0] dark:border-[#1a2d4b] text-[#49627d] dark:text-[#8fa3bf]"
                    }`}
                  >
                    <div className="font-semibold mb-0.5 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-[#8a6834] dark:text-[#EAD7B8]" />
                      <span className="text-[#8a6834] dark:text-[#EAD7B8]">
                        Lời khuyên của WeebLegit:
                      </span>
                    </div>
                    {clause.advice}
                    {clause.lawReference && (
                      <div className="mt-1 font-medium text-[#8a6834] dark:text-[#EAD7B8] text-[11px]">
                        ⚖️ {clause.lawReference}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Footer — Xóa nút Đóng */}
        <div className="px-6 py-3.5 bg-[#f8fafd] dark:bg-[#0f1b2f] border-t border-[#e6edf4] dark:border-[#1a2d4b] flex items-center justify-between">
          <span className="text-xs text-[#8297ac] dark:text-[#8fa3bf]">
            Mẫu hợp đồng sinh viên • WeebLegit (Bấm phím Esc hoặc nhấp ra ngoài để thoát)
          </span>
        </div>
      </motion.div>
    </div>
  );
};
