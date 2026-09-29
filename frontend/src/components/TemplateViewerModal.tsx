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
  ExternalLink,
  Link2,
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

  const buildFullText = () => {
    const sourcesText =
      template.sourceUrls && template.sourceUrls.length > 0
        ? "\nNGUỒN VĂN BẢN MẪU THAM CHIẾU:\n" +
          template.sourceUrls.map((s, i) => `${i + 1}. ${s.title}: ${s.url}`).join("\n") +
          "\n\n"
        : "\n";
    return (
      `${template.title.toUpperCase()}\n${template.subtitle}\n` +
      sourcesText +
      template.clauses
        .map(
          (c) =>
            `${c.title}\n${c.content}\n${
              c.lawReference ? `[Căn cứ pháp lý: ${c.lawReference}]` : ""
            }\n`,
        )
        .join("\n")
    );
  };

  const handleCopyFullText = () => {
    navigator.clipboard.writeText(buildFullText());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadTextFile = () => {
    const blob = new Blob([buildFullText()], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `mau-${template.id}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
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
        <div className="px-6 py-4 border-b border-[#e6edf4] flex items-center justify-between bg-[#f8fafd] gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-[#EAD7B8] flex items-center justify-center text-[#10253f] shrink-0">
              <FileText className="w-4.5 h-4.5" />
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-base text-[#10253f] truncate">
                {template.title}
              </h3>
              <p className="text-xs text-[#8297ac] truncate">{template.subtitle}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleDownloadTextFile}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#10253f] bg-white hover:bg-[#f2f7fc] border border-[#d8e3ef] rounded-lg transition-colors cursor-pointer"
              title="Tải file văn bản mẫu về máy để chỉnh sửa hoặc thử kiểm tra"
            >
              <Download className="w-3.5 h-3.5 text-[#8a6834]" />
              <span className="hidden sm:inline">Tải file mẫu (.txt)</span>
            </button>
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
              className="p-1.5 rounded-lg text-[#8297ac] hover:text-[#10253f] hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Clauses */}
        <div className="flex-1 p-6 overflow-y-auto space-y-6">
          {/* Official External Source Files & Links Section */}
          {template.sourceUrls && template.sourceUrls.length > 0 && (
            <div className="p-4 rounded-xl bg-[#FAF5ED] border border-[#EAD7B8]/80 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-extrabold text-[#7d480e] uppercase tracking-wider flex items-center gap-1.5">
                  <Link2 className="w-4 h-4 text-[#8a6834]" />
                  <span>Văn bản &amp; File mẫu hợp đồng gốc ({template.sourceUrls.length} nguồn)</span>
                </h4>
                <span className="text-[11px] font-semibold text-[#8a6834]">
                  Mở trực tiếp trên cổng pháp luật ↗
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {template.sourceUrls.map((src, sIdx) => (
                  <a
                    key={sIdx}
                    href={src.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group p-3 rounded-xl bg-white border border-[#EAD7B8]/70 hover:border-[#8a6834] hover:shadow-sm transition-all flex flex-col justify-between gap-1.5"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-xs font-bold text-[#10253f] group-hover:text-[#8a6834] transition-colors leading-snug">
                        {src.title}
                      </span>
                      <ExternalLink className="w-3.5 h-3.5 text-[#8a6834] shrink-0 mt-0.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </div>
                    {src.note && (
                      <p className="text-[11px] text-[#8297ac] leading-relaxed">
                        {src.note}
                      </p>
                    )}
                  </a>
                ))}
              </div>
            </div>
          )}

          <div className="p-4 rounded-xl bg-[#f2f7fc] border border-[#d8e3ef] text-xs text-[#49627d]">
            💡 <strong>Hướng dẫn:</strong> Dưới đây là các điều khoản mẫu tiêu
            chuẩn kèm theo điểm rủi ro và liên kết trực tiếp tới điều luật tương
            ứng để bạn tra cứu văn bản pháp luật chính thống.
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
                <div className="flex items-center justify-between gap-2 flex-wrap mb-2">
                  <h4 className="font-bold text-sm text-[#10253f]">
                    {clause.title}
                  </h4>
                  <div className="flex items-center gap-1.5">
                    {clause.clauseRiskScore != null && (
                      <span
                        className={`text-[11px] font-extrabold px-2 py-0.5 rounded border ${
                          clause.clauseRiskScore >= 70
                            ? "bg-[#fff1f0] text-[#e4534b] border-[#ffd1cc]"
                            : clause.clauseRiskScore >= 40
                              ? "bg-[#fff4e6] text-[#d77714] border-[#ffd8a8]"
                              : "bg-[#eafbf7] text-[#159f7b] border-[#b7f6e5]"
                        }`}
                      >
                        Điểm rủi ro: {clause.clauseRiskScore}/100
                      </span>
                    )}
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
                </div>

                <p className="text-xs text-[#26435e] leading-relaxed mb-3">
                  {clause.content}
                </p>

                {(clause.advice || clause.lawReference) && (
                  <div
                    className={`p-3 rounded-lg text-xs leading-relaxed space-y-2 ${
                      clause.isRisky
                        ? "bg-white border border-[#ffd1cc] text-[#7d342f]"
                        : "bg-[#f7fafc] text-[#49627d]"
                    }`}
                  >
                    {clause.advice && (
                      <div>
                        <div className="font-semibold mb-0.5 flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-[#8a6834]" />
                          <span>Lời khuyên của WeebLegit:</span>
                        </div>
                        {clause.advice}
                      </div>
                    )}

                    {clause.lawReference && (
                      <div className="pt-1.5 border-t border-[#e6edf4] flex items-center justify-between flex-wrap gap-2">
                        <span className="font-semibold text-[#8a6834] text-[11px] flex items-center gap-1">
                          <BookOpen className="w-3.5 h-3.5" />
                          <span>⚖️ Căn cứ: {clause.lawReference}</span>
                        </span>
                        {clause.lawReferenceUrl && (
                          <a
                            href={clause.lawReferenceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-[#FAF5ED] hover:bg-[#EAD7B8]/50 text-[#7d480e] border border-[#EAD7B8] text-[11px] font-bold transition-colors"
                          >
                            <span>Tra cứu điều luật gốc</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
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
            Mẫu hợp đồng sinh viên • Có liên kết văn bản gốc &amp; điều luật
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
