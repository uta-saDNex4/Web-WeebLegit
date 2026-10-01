"use client";

import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  Suspense,
} from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import {
  FileText,
  ShieldCheck,
  Sparkles,
  Search,
  Upload,
  RefreshCw,
  Copy,
  Check,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  ChevronDown,
  Columns,
  Send,
  Paperclip,
  X,
  Lock,
  ArrowRight,
  ArrowLeftRight,
  Printer,
  Globe,
  Sun,
  Moon,
  User,
  LogOut,
  Sliders,
  Filter,
  Flame,
  Scale,
  Compass,
  FileCode,
  AlertCircle,
  FolderOpen,
  MessageSquare,
  Bot,
  ExternalLink,
  Calendar,
  Clock,
  Play,
  Layers,
  SplitSquareVertical,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useAuth } from "../../lib/auth-context";
import { useLanguage } from "../../lib/language-context";
import { useTheme } from "../../lib/theme-context";
import * as api from "../../lib/api";
import { AuthModal } from "../../components/AuthModal";
import {
  RiskGaugeAndHeatmap,
  RiskFilterType,
  getClauseBucket,
} from "../../components/RiskGaugeAndHeatmap";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  citations?: string[];
  negotiationScript?: string | null;
  attachedFileInfo?: { name: string; size: number; isImage?: boolean } | null;
  timestamp: string;
}


interface RawClausePreview {
  index: number;
  title: string;
  snippet: string;
}

function formatBytes(bytes: number | null | undefined): string {
  if (!bytes) return "0 B";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function formatDateTime(iso: string | null | undefined, isEn = false): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString(isEn ? "en-US" : "vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

function extractRawClauses(text: string): RawClausePreview[] {
  if (!text) return [];
  const lines = text.split("\n");
  const list: RawClausePreview[] = [];
  const regex =
    /^(Điều\s+\d+[:.]?|Mục\s+\d+[:.]?|Khoản\s+\d+[:.]?|Chương\s+[IVXLCDM]+[:.]?|[0-9]+\.\s+[A-ZÀ-Ỹ])/i;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (regex.test(line)) {
      list.push({
        index: list.length + 1,
        title: line.slice(0, 80),
        snippet: lines.slice(i + 1, i + 3).join(" ").trim().slice(0, 140),
      });
    }
  }
  return list;
}

function LegalStudioInner() {
  const searchParams = useSearchParams();
  const queryContractId = searchParams.get("contractId");
  const router = useRouter();

  const { user, logout, refreshUser } = useAuth();
  const { lang, toggleLang } = useLanguage();
  const { theme, toggleTheme } = useTheme();

  const isAdmin = user?.role === "admin";
  const planTier = isAdmin ? "pro" : user?.plan_tier || "free";
  const canViewClauses = isAdmin || Boolean(user?.can_view_clauses);
  const canCompareContracts = isAdmin || Boolean(user?.can_compare_contracts);
  const canExportPdf = isAdmin || Boolean(user?.can_export_pdf);
  const canAttachChatFiles = isAdmin || Boolean(user?.can_attach_chat_files);
  const dailyLimit = user?.daily_limit;
  const dailyUsed = user?.daily_used;

  // Dual Pane Resizing (Left / Right)
  const [splitPercent, setSplitPercent] = useState<number>(50);
  const isDraggingSplitter = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Left Pane View Modes: "document" | "ai" | "split"
  const [leftPaneViewMode, setLeftPaneViewMode] = useState<"document" | "ai" | "split">("document");
  const [leftSplitHeight, setLeftSplitHeight] = useState<number>(50); // % height of doc in split mode
  const isDraggingLeftSplit = useRef(false);
  const leftPaneBodyRef = useRef<HTMLDivElement>(null);

  // Mobile layout tab for small screens (< md)
  const [mobileTab, setMobileTab] = useState<"doc_ai" | "risk">("doc_ai");

  // Active Contract State
  const [activeContractId, setActiveContractId] = useState<string>("");
  const [contractDetails, setContractDetails] =
    useState<api.ContractResponse | null>(null);
  const [contractContent, setContractContent] =
    useState<api.ContractContentResponse | null>(null);
  const [contentLoading, setContentLoading] = useState(false);
  const [isScannedPdf, setIsScannedPdf] = useState(false);
  const [docSubMode, setDocSubMode] = useState<"both" | "image" | "text">("both");
  const [imageZoom, setImageZoom] = useState<number>(100);

  // Request counter to avoid async race condition on contract switch (L6)
  const loadReqCounterRef = useRef(0);

  // Contract Selector Modal
  const [isContractSelectorOpen, setIsContractSelectorOpen] = useState(false);
  const [contractSearchQuery, setContractSearchQuery] = useState("");
  const [availableContracts, setAvailableContracts] = useState<
    api.ContractResponse[]
  >([]);

  // Pre-scan Clauses & Evaluation State
  const [rawClauses, setRawClauses] = useState<RawClausePreview[]>([]);
  const [isAwaitingEvaluation, setIsAwaitingEvaluation] = useState(false);
  const [evaluating, setEvaluating] = useState(false);

  // Analysis State
  const [analysisResult, setAnalysisResult] =
    useState<api.AiAnalysisResult | null>(null);
  const [riskFilter, setRiskFilter] = useState<RiskFilterType>("all");
  const [expandedClauseIdx, setExpandedClauseIdx] = useState<number | null>(null);
  const [activeSearchTerm, setActiveSearchTerm] = useState("");
  const [highlightedText, setHighlightedText] = useState<string | null>(null);

  // Right pane mode
  const [rightPaneTab, setRightPaneTab] = useState<"analysis" | "compare">("analysis");

  // Compare mode
  const [compareTargetId, setCompareTargetId] = useState<string>("");
  const [comparisonResult, setComparisonResult] =
    useState<api.ContractComparisonResponse | null>(null);
  const [compareLoading, setCompareLoading] = useState(false);

  // AI Copilot Chat State
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: "initial-1",
      role: "assistant",
      content:
        lang === "EN"
          ? "Welcome to WeebLegit Legal Studio! I am your AI Legal Copilot. Open a contract to inspect clauses, or type any legal question below."
          : "Chào mừng bạn đến với WeebLegit Legal Studio! Tôi là Trợ lý Pháp lý AI. Hãy mở hoặc tải hợp đồng lên để bắt đầu kiểm tra, hoặc gõ câu hỏi pháp lý bên dưới.",
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    },
  ]);
  const [chatInput, setChatInput] = useState("");
  const [isAiTyping, setIsAiTyping] = useState(false);
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);
  const textViewerRef = useRef<HTMLDivElement>(null);

  // Notice Banner (L1, L2)
  const [workspaceNotice, setWorkspaceNotice] = useState<string | null>(null);

  // Pending Actions after Auth (L3)
  const [pendingUploadFile, setPendingUploadFile] = useState<File | null>(null);
  const [pendingPrompt, setPendingPrompt] = useState<string>("");

  // Modals / Dropdowns
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<"login" | "register">("login");
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [copiedHash, setCopiedHash] = useState(false);
  const [isDropActive, setIsDropActive] = useState(false);
  const [isGlobalDragging, setIsGlobalDragging] = useState(false);
  const dragCounterRef = useRef(0);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [isUploadingAttachment, setIsUploadingAttachment] = useState(false);


  const tierBadgeLabel =
    user?.role === "admin"
      ? "-pro/ad-"
      : planTier === "pro"
      ? "-pro-"
      : planTier === "medium"
      ? "-medium-"
      : "-free-";

  const isDailyLimitReached =
    planTier === "free" &&
    dailyLimit !== undefined &&
    dailyLimit !== null &&
    (dailyUsed ?? 0) >= dailyLimit;

  const tokenParam = api.getToken() ? `?token=${encodeURIComponent(api.getToken() || "")}` : "";
  const rawFileUrl = contractContent
    ? `${api.getBaseUrl()}/api/contracts/${contractContent.contract_id}/raw${tokenParam}`
    : "";

  // Auto-clear notice after 6 seconds
  useEffect(() => {
    if (workspaceNotice) {
      const timer = setTimeout(() => setWorkspaceNotice(null), 6000);
      return () => clearTimeout(timer);
    }
  }, [workspaceNotice]);

  // Load contract list for user
  useEffect(() => {
    if (user) {
      api
        .listContracts({ limit: 50 })
        .then((res) => setAvailableContracts(res.items))
        .catch(() => {});
    } else {
      setAvailableContracts([]);
    }
  }, [user]);

  // Resume pending file or prompt after login (L3)
  useEffect(() => {
    if (user && pendingUploadFile) {
      const fileToUpload = pendingUploadFile;
      setPendingUploadFile(null);
      handleDirectUpload([fileToUpload]);
    }
    if (user && pendingPrompt) {
      const promptToSend = pendingPrompt;
      setPendingPrompt("");
      handleSendChatMessage(promptToSend);
    }
  }, [user, pendingUploadFile, pendingPrompt]);

  // Load active contract ONLY if a valid UUID queryContractId is given in URL
  useEffect(() => {
    if (queryContractId) {
      const trimmed = queryContractId.trim();
      const isValidUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(trimmed);
      if (isValidUuid) {
        loadContract(trimmed);
      } else {
        // Clean bogus URL param like "undefined" without throwing error notice
        if (typeof window !== "undefined") {
          window.history.replaceState({}, "", "/workspace");
        }
      }
    }
  }, [queryContractId]);

  // Scroll chat to bottom
  useEffect(() => {
    if (leftPaneViewMode === "ai" || leftPaneViewMode === "split") {
      chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages, isAiTyping, leftPaneViewMode]);

  // Mouse move handler for Horizontal Splitter & Vertical Left Pane Split
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // 1. Horizontal Splitter (Left vs Right Pane)
      if (isDraggingSplitter.current && containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const newPercent = ((e.clientX - rect.left) / rect.width) * 100;
        if (newPercent >= 20 && newPercent <= 80) {
          setSplitPercent(Math.round(newPercent * 10) / 10);
        }
      }
      // 2. Vertical Left Splitter (Document vs AI Chat inside Left Pane)
      if (isDraggingLeftSplit.current && leftPaneBodyRef.current) {
        const rect = leftPaneBodyRef.current.getBoundingClientRect();
        const newHeightPercent = ((e.clientY - rect.top) / rect.height) * 100;
        if (newHeightPercent >= 20 && newHeightPercent <= 80) {
          setLeftSplitHeight(Math.round(newHeightPercent));
        }
      }
    };

    const handleMouseUp = () => {
      isDraggingSplitter.current = false;
      isDraggingLeftSplit.current = false;
      document.body.style.cursor = "default";
      document.body.style.userSelect = "auto";
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  const startDragSplitter = (e: React.MouseEvent) => {
    e.preventDefault();
    isDraggingSplitter.current = true;
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  };

  const startDragLeftSplit = (e: React.MouseEvent) => {
    e.preventDefault();
    isDraggingLeftSplit.current = true;
    document.body.style.cursor = "row-resize";
    document.body.style.userSelect = "none";
  };

  // Load a contract into workspace with race-condition protection (L6) and 404 handling (L5)
  const loadContract = async (id: string) => {
    const currentReqId = ++loadReqCounterRef.current;
    setActiveContractId(id);
    setContentLoading(true);
    setAnalysisResult(null);
    setExpandedClauseIdx(null);
    setHighlightedText(null);
    setIsContractSelectorOpen(false);
    setIsScannedPdf(false);

    try {
      // 1. Get Text & Metadata
      const content = await api.getContractContent(id);
      if (currentReqId !== loadReqCounterRef.current) return;

      setContractContent(content);
      const detail = await api.getContract(id);
      if (currentReqId !== loadReqCounterRef.current) return;

      setContractDetails(detail);

      // Check for scanned / image-only PDF (L4)
      if (!content.text || content.text.trim().length === 0) {
        setIsScannedPdf(true);
      }

      // Pre-scan raw clauses from document text
      const scanned = extractRawClauses(content.text);
      setRawClauses(scanned);

      // 2. Check if already evaluated in history (isolated try/catch so document always loads)
      let historyItems: api.AnalysisHistoryItem[] = [];
      try {
        historyItems = await api.getContractAnalysisHistory(id);
      } catch (histErr) {
        console.warn("Could not retrieve past analysis history:", histErr);
      }
      if (currentReqId !== loadReqCounterRef.current) return;

      if (historyItems && historyItems.length > 0) {
        const latest = historyItems[0];
        setAnalysisResult({
          status: "completed",
          risk_score: latest.risk_score,
          risk_label: latest.risk_label,
          overview: latest.ai_overview || latest.overview,
          findings: latest.findings || latest.ai_findings,
          analysis_source: latest.analysis_source,
          model_version: latest.model_version ?? undefined,
        });
        setIsAwaitingEvaluation(false);
      } else {
        // Not yet evaluated: show pre-scan outline & button
        setIsAwaitingEvaluation(true);
      }
    } catch (err) {
      if (currentReqId !== loadReqCounterRef.current) return;
      console.warn("Error loading contract:", err);
      const isNotFound = err instanceof Error && (err.message.includes("404") || err.message.toLowerCase().includes("not found"));
      setWorkspaceNotice(
        isNotFound
          ? (lang === "EN"
              ? "Contract not found or deleted from storage."
              : "Không tìm thấy hợp đồng hoặc hợp đồng đã bị xóa khỏi hệ thống.")
          : (err instanceof Error
              ? err.message
              : (lang === "EN" ? "Failed to load contract." : "Không thể tải nội dung hợp đồng."))
      );
      // Clean URL param (L5)
      if (typeof window !== "undefined") {
        window.history.replaceState({}, "", "/workspace");
      }
      handleClearActiveContract();
    } finally {
      if (currentReqId === loadReqCounterRef.current) {
        setContentLoading(false);
      }
    }
  };

  // Clear active contract (Reset to clean empty workspace)
  const handleClearActiveContract = () => {
    setActiveContractId("");
    setContractDetails(null);
    setContractContent(null);
    setAnalysisResult(null);
    setRawClauses([]);
    setIsAwaitingEvaluation(false);
    setHighlightedText(null);
    setComparisonResult(null);
    setCompareTargetId("");
    setIsScannedPdf(false);
  };

  // Start Evaluation & Risk Scoring
  const handleStartEvaluation = async () => {
    if (!activeContractId || evaluating) return;
    setEvaluating(true);
    try {
      const qc = await api.quickCheckContract(activeContractId);
      setAnalysisResult({
        status: "completed",
        risk_score: qc.risk_score,
        risk_label: qc.risk_label,
        overview: qc.ai_overview,
        findings: qc.key_risks.map((k, idx) => ({
          risk_level: "high",
          severity: "high",
          target_section: "Điều khoản cảnh báo",
          title: `Cảnh báo rủi ro #${idx + 1}`,
          matched_term: k,
          warning: k,
          clause_text: k,
          reference: "Bộ luật Dân sự 2015 & Luật chuyên ngành",
        })),
        analysis_source: "quick-check",
      });
      setIsAwaitingEvaluation(false);
      await refreshUser();
    } catch (err) {
      setWorkspaceNotice(
        err instanceof Error
          ? err.message
          : lang === "EN"
          ? "Evaluation failed"
          : "Đánh giá thất bại"
      );
    } finally {
      setEvaluating(false);
    }
  };

  // Direct File Upload into Studio with Validation (L1, L2, L3)
  const handleDirectUpload = async (files: FileList | File[]) => {
    if (!files || files.length === 0) return;

    // Check multiple files (L2)
    if (files.length > 1) {
      setWorkspaceNotice(
        lang === "EN"
          ? `Analyzing 1 contract per session. Processing first file: "${files[0].name}"`
          : `Hệ thống thẩm định 1 hợp đồng mỗi lượt. Đang nạp file đầu tiên: "${files[0].name}"`
      );
    }

    const file = files[0];

    // Format validation (L1)
    const allowedExts = [".pdf", ".docx", ".doc", ".txt", ".jpg", ".jpeg", ".png", ".webp"];
    const lastDot = file.name.lastIndexOf(".");
    const ext = lastDot !== -1 ? file.name.slice(lastDot).toLowerCase() : "";
    if (!allowedExts.includes(ext)) {
      setWorkspaceNotice(
        lang === "EN"
          ? "Unsupported format. Please upload a .pdf, .docx, .txt, or image (.jpg, .png, .webp) file."
          : "Định dạng không được hỗ trợ. Vui lòng tải file .pdf, .docx, .txt hoặc ảnh chụp (.jpg, .png, .webp)."
      );
      return;
    }

    // Size validation (L1)
    if (file.size > 20 * 1024 * 1024) {
      setWorkspaceNotice(
        lang === "EN"
          ? "File too large (maximum 20MB allowed)."
          : "Dung lượng file vượt quá giới hạn cho phép (tối đa 20MB)."
      );
      return;
    }

    // Empty file validation (L1)
    if (file.size === 0) {
      setWorkspaceNotice(
        lang === "EN"
          ? "File is empty (0 bytes). Please upload a valid document."
          : "Tệp tin rỗng (0 bytes). Vui lòng chọn tài liệu hợp lệ."
      );
      return;
    }

    // Auth check with pending file resume (L3)
    if (!user) {
      setPendingUploadFile(file);
      setAuthModalTab("login");
      setAuthModalOpen(true);
      return;
    }

    setUploadLoading(true);
    try {
      const res = await api.uploadContract(file);
      await refreshUser();
      const updatedList = await api.listContracts({ limit: 50 });
      setAvailableContracts(updatedList.items);

      // Load contract text & pre-scan outline
      await loadContract(res.id);
    } catch (err) {
      setWorkspaceNotice(
        err instanceof Error
          ? err.message
          : lang === "EN"
          ? "Upload failed"
          : "Tải file lên thất bại"
      );
    } finally {
      setUploadLoading(false);
      setIsDropActive(false);
    }
  };

  // Global Drag & Drop over entire window + Escape key modal closer
  useEffect(() => {
    const handleDragEnter = (e: DragEvent) => {
      e.preventDefault();
      dragCounterRef.current += 1;
      if (e.dataTransfer && e.dataTransfer.types && Array.from(e.dataTransfer.types).includes("Files")) {
        setIsGlobalDragging(true);
      }
    };

    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
      if (e.dataTransfer) {
        e.dataTransfer.dropEffect = "copy";
      }
    };

    const handleDragLeave = (e: DragEvent) => {
      e.preventDefault();
      dragCounterRef.current -= 1;
      if (dragCounterRef.current <= 0) {
        dragCounterRef.current = 0;
        setIsGlobalDragging(false);
      }
    };

    const handleDrop = (e: DragEvent) => {
      e.preventDefault();
      dragCounterRef.current = 0;
      setIsGlobalDragging(false);
      if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        handleDirectUpload(e.dataTransfer.files);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsContractSelectorOpen(false);
        setUserDropdownOpen(false);
      }
    };

    window.addEventListener("dragenter", handleDragEnter);
    window.addEventListener("dragover", handleDragOver);
    window.addEventListener("dragleave", handleDragLeave);
    window.addEventListener("drop", handleDrop);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("dragenter", handleDragEnter);
      window.removeEventListener("dragover", handleDragOver);
      window.removeEventListener("dragleave", handleDragLeave);
      window.removeEventListener("drop", handleDrop);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [user]);


  // Ask AI Copilot about specific clause (Seamlessly switches Left Pane to AI/Split)
  const handleAskAiAboutClause = (clause: api.AiFindingItem) => {
    const prompt =
      lang === "EN"
        ? `Please analyze this clause in depth and provide a safe negotiation script with law citations:\n\n"${
            clause.title || clause.matched_term
          }": ${clause.clause_text || clause.warning || ""}`
        : `Xin chào Copilot, hãy phân tích kỹ điều khoản sau và hướng dẫn tôi cách đàm phán sửa đổi theo Bộ luật Dân sự/Luật chuyên ngành:\n\n"${
            clause.title || clause.matched_term
          }": ${clause.clause_text || clause.warning || ""}`;

    // On mobile, switch to doc/ai tab
    setMobileTab("doc_ai");
    // Switch left pane view to split so user sees document AND AI reply
    setLeftPaneViewMode((prev) => (prev === "document" ? "split" : prev));
    handleSendChatMessage(prompt);
  };

  // Send message in AI Copilot
  const handleSendChatMessage = async (presetText?: string) => {
    const textToSend = (presetText || chatInput).trim();
    if (!textToSend || isAiTyping) return;

    // Check Daily Limit for Free Tier (L9)
    if (isDailyLimitReached) {
      setWorkspaceNotice(
        lang === "EN"
          ? `Daily AI question limit reached (${dailyUsed}/${dailyLimit}). Upgrade to Medium or Pro for unlimited access.`
          : `Bạn đã dùng hết hạn mức ${dailyUsed}/${dailyLimit} câu hỏi AI hôm nay. Nâng cấp lên gói Medium hoặc Pro để sử dụng không giới hạn.`
      );
      return;
    }

    // Auth check with pending prompt resume (L3)
    if (!user) {
      setPendingPrompt(textToSend);
      setAuthModalTab("login");
      setAuthModalOpen(true);
      return;
    }

    // Switch view to split if currently on document only
    if (leftPaneViewMode === "document") {
      setLeftPaneViewMode("split");
    }

    // If contract is waiting evaluation, trigger evaluation automatically
    if (activeContractId && isAwaitingEvaluation) {
      handleStartEvaluation();
    }

    // Upload attachment if any

    let attachmentOptions: {
      attachmentName?: string | null;
      attachmentText?: string | null;
      imageBase64?: string | null;
      imageMimeType?: string | null;
    } | undefined = undefined;

    let attachedFileInfo: { name: string; size: number; isImage?: boolean } | null = null;

    if (attachedFile) {
      setIsUploadingAttachment(true);
      try {
        const attRes = await api.uploadChatAttachment(attachedFile);
        attachmentOptions = {
          attachmentName: attRes.filename,
          attachmentText: attRes.extracted_text,
          imageBase64: attRes.image_base64,
          imageMimeType: attRes.mime_type,
        };
        attachedFileInfo = {
          name: attachedFile.name,
          size: attachedFile.size,
          isImage: attRes.file_type === "image",
        };
      } catch (attErr) {
        console.warn("Failed to upload chat attachment:", attErr);
        setWorkspaceNotice(
          lang === "EN"
            ? "Could not process attached file. Sending question text only."
            : "Không thể xử lý tệp đính kèm. Đang gửi nội dung câu hỏi dạng văn bản."
        );
      } finally {
        setIsUploadingAttachment(false);
        setAttachedFile(null);
      }
    }

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: textToSend,
      attachedFileInfo,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setChatMessages((prev) => [...prev, userMsg]);
    setChatInput("");
    setIsAiTyping(true);

    try {
      const historyPayload: api.AiChatMessage[] = chatMessages
        .slice(-6)
        .map((m) => ({
          role: m.role === "user" ? "user" : "assistant",
          content: m.content,
        }));

      const contextSnippet = contractContent
        ? `Contract: ${contractContent.original_filename}\nType: ${
            contractContent.contract_type || "general"
          }\nText Excerpt:\n${contractContent.text.slice(0, 1500)}`
        : undefined;

      const aiRes = await api.aiChat(
        textToSend,
        contextSnippet,
        historyPayload,
        attachmentOptions
      );


      const assistantMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: "assistant",
        content: aiRes.reply || aiRes.answer || "Không có phản hồi từ AI.",
        citations: aiRes.citations || (aiRes.citation ? [aiRes.citation] : []),
        negotiationScript: aiRes.negotiation_script,
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };

      setChatMessages((prev) => [...prev, assistantMsg]);
      await refreshUser();
    } catch (err) {
      setChatMessages((prev) => [
        ...prev,
        {
          id: `ai-err-${Date.now()}`,
          role: "assistant",
          content:
            err instanceof Error
              ? `Lỗi: ${err.message}`
              : "Có lỗi kết nối với máy chủ AI.",
          timestamp: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        },
      ]);
    } finally {
      setIsAiTyping(false);
    }
  };

  // Compare contracts
  const handleRunComparison = async () => {
    if (!activeContractId || !compareTargetId) return;
    setCompareLoading(true);
    try {
      const res = await api.compareContracts(activeContractId, compareTargetId);
      setComparisonResult(res);
    } catch (err) {
      setWorkspaceNotice(
        err instanceof Error
          ? err.message
          : lang === "EN"
          ? "Comparison failed"
          : "So sánh thất bại"
      );
    } finally {
      setCompareLoading(false);
    }
  };

  // Copy SHA-256
  const handleCopyHash = () => {
    if (!contractDetails?.sha256_hash) return;
    navigator.clipboard.writeText(contractDetails.sha256_hash);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  // Select clause -> highlight text & scroll
  const handleSelectClause = (finding: api.AiFindingItem, idx: number) => {
    setExpandedClauseIdx(idx);
    const term =
      finding.matched_term ||
      finding.clause_text?.slice(0, 50) ||
      finding.title;
    setHighlightedText(term || null);
    // Switch to doc view or split view on mobile
    setMobileTab("doc_ai");
  };

  const findingsList =
    analysisResult?.findings ?? analysisResult?.ai_findings ?? [];
  const filteredFindings = findingsList.filter((item) =>
    riskFilter === "all" ? true : getClauseBucket(item) === riskFilter
  );

  const filteredExplorerContracts = availableContracts.filter((c) => {
    if (!contractSearchQuery) return true;
    const q = contractSearchQuery.toLowerCase();
    return (
      c.original_filename.toLowerCase().includes(q) ||
      (c.contract_type && c.contract_type.toLowerCase().includes(q))
    );
  });

  // Calculate search matches (L11)
  const trimmedSearch = activeSearchTerm.trim().toLowerCase();
  const searchMatchCount =
    trimmedSearch && contractContent?.text
      ? contractContent.text
          .split("\n")
          .filter((line) => line.toLowerCase().includes(trimmedSearch)).length
      : 0;

  // Contracts available for Compare Mode (excluding active contract) (L7, L8)
  const compareTargetCandidates = availableContracts.filter(
    (c) => c.id !== activeContractId
  );

  return (
    <div className="h-screen flex flex-col bg-[#F6F8FA] dark:bg-[#080E1A] text-[#10253f] dark:text-[#E2E8F0] font-sans antialiased overflow-hidden select-none">
      {/* ══════════ TOP BAR: STUDIO HEADER ══════════ */}
      <header className="h-16 px-4 bg-white/95 dark:bg-[#0B1528]/95 backdrop-blur-md border-b border-[#D8E3EF] dark:border-[#1E3354] flex items-center justify-between shrink-0 z-30 shadow-xs no-print">

        {/* Brand & Contract Selector Button */}
        <div className="flex items-center gap-3 min-w-0">
          <Link
            href="/"
            className="flex items-center gap-2 group hover:opacity-90 transition-opacity shrink-0"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#10253f] to-[#1E3A5F] dark:from-[#EAD7B8] dark:to-[#C7B28E] flex items-center justify-center text-white dark:text-[#10253f] shadow-sm">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div className="hidden sm:block">
              <span className="font-extrabold text-sm tracking-tight text-[#10253f] dark:text-white">
                WeebLegit
              </span>
              <span className="ml-1.5 px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-[#FAF5ED] dark:bg-[#162744] text-[#8A6834] dark:text-[#EAD7B8] border border-[#EAD7B8]/60 dark:border-[#2A446E]">
                Legal Studio
              </span>
            </div>
          </Link>

          <div className="h-5 w-px bg-slate-200 dark:bg-slate-800 hidden md:block" />

          {/* 📂 Contract Selector Button */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsContractSelectorOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-[#D8E3EF] dark:border-[#1E3354] bg-white dark:bg-[#0D1829] hover:border-[#8A6834] dark:hover:border-[#EAD7B8] text-xs font-bold text-[#10253f] dark:text-white transition-all shadow-2xs cursor-pointer"
            >
              <FolderOpen className="w-4 h-4 text-[#8A6834] dark:text-[#EAD7B8]" />
              <span>{lang === "EN" ? "Contract Explorer" : "Danh Sách Hợp Đồng"}</span>
              <span className="px-1.5 py-0.5 rounded-full text-[10px] font-black bg-[#FAF5ED] dark:bg-[#162744] text-[#8A6834] dark:text-[#EAD7B8] border border-[#EAD7B8]/40">
                {availableContracts.length}
              </span>
            </button>

            {/* Active Contract Badge with Close button */}
            {contractDetails && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FAF5ED] dark:bg-[#162744] border border-[#EAD7B8] dark:border-[#2C4875] text-xs font-bold text-[#10253f] dark:text-white shadow-2xs">
                <FileText className="w-3.5 h-3.5 text-[#8A6834] dark:text-[#EAD7B8] shrink-0" />
                <span className="max-w-[140px] truncate">
                  {contractDetails.original_filename}
                </span>
                <button
                  onClick={handleClearActiveContract}
                  className="hover:text-red-500 p-0.5 rounded ml-1 transition-colors cursor-pointer"
                  title="Đóng hợp đồng này"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Studio Action Tools */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Compare toggle */}
          {canCompareContracts ? (
            <button
              onClick={() =>
                setRightPaneTab(
                  rightPaneTab === "compare" ? "analysis" : "compare"
                )
              }
              className={`hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                rightPaneTab === "compare"
                  ? "bg-[#10253f] text-white dark:bg-[#EAD7B8] dark:text-[#10253f] border-transparent shadow-xs"
                  : "bg-white dark:bg-[#102038] text-[#10253f] dark:text-[#CAD8ED] border-[#D8E3EF] dark:border-[#1E3354] hover:border-[#8A6834]"
              }`}
            >
              <ArrowLeftRight className="w-3.5 h-3.5" />
              <span>{lang === "EN" ? "Compare Mode" : "Đối chiếu kép"}</span>
            </button>
          ) : (
            <Link
              href="/upgrade"
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 hover:text-slate-700"
              title="Compare feature unlocked in Medium / Pro"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>{lang === "EN" ? "Compare (Pro)" : "Đối chiếu (Pro)"}</span>
            </Link>
          )}

          {/* PDF Export */}
          {canExportPdf ? (
            <button
              onClick={() => window.print()}
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-[#10253f] dark:text-[#EAD7B8] bg-white dark:bg-[#102038] border border-[#D8E3EF] dark:border-[#1E3354] hover:border-[#8A6834] transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>{lang === "EN" ? "Export PDF" : "Xuất PDF"}</span>
            </button>
          ) : (
            <Link
              href="/upgrade"
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 hover:text-slate-700"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>PDF (Pro)</span>
            </Link>
          )}

          <div className="h-5 w-px bg-slate-200 dark:bg-slate-800" />

          {/* Language Switcher */}
          <button
            onClick={toggleLang}
            className="flex items-center gap-1 px-2.5 h-8 rounded-xl border border-[#D8E3EF] dark:border-[#1E3354] text-xs font-bold text-[#10253f] dark:text-[#CAD8ED] hover:bg-[#FAF5ED] dark:hover:bg-[#162744] cursor-pointer"
          >
            <Globe className="w-3.5 h-3.5 text-[#8A6834] dark:text-[#EAD7B8]" />
            <span>{lang}</span>
          </button>

          {/* Theme Switcher */}
          <button
            onClick={toggleTheme}
            className="w-8 h-8 flex items-center justify-center rounded-xl border border-[#D8E3EF] dark:border-[#1E3354] text-[#10253f] dark:text-[#CAD8ED] hover:bg-[#FAF5ED] dark:hover:bg-[#162744] cursor-pointer"
          >
            {theme === "dark" ? (
              <Sun className="w-4 h-4 text-[#E5A93C]" />
            ) : (
              <Moon className="w-4 h-4 text-[#49627D]" />
            )}
          </button>

          {/* User Profile / Tier dropdown */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 pl-2 pr-3 py-1 rounded-xl bg-[#FAF5ED] dark:bg-[#11213A] border border-[#EAD7B8] dark:border-[#22395D] text-xs font-bold text-[#10253f] dark:text-white cursor-pointer shadow-2xs"
              >
                <div className="w-6 h-6 rounded-full bg-[#EAD7B8] text-[#10253f] flex items-center justify-center font-black uppercase text-[11px]">
                  {(user.full_name || user.email).charAt(0)}
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-[11px] font-bold max-w-[90px] truncate leading-tight">
                    {user.full_name || user.email.split("@")[0]}
                  </span>
                  <span className="text-[9px] font-extrabold text-[#8A6834] dark:text-[#EAD7B8] opacity-80 leading-none">
                    {tierBadgeLabel}
                  </span>
                </div>
                <ChevronDown className="w-3 h-3 opacity-60" />
              </button>

              {userDropdownOpen && (
                <div
                  onClick={() => setUserDropdownOpen(false)}
                  className="absolute right-0 mt-2 w-52 bg-white dark:bg-[#0D1829] rounded-2xl border border-[#D8E3EF] dark:border-[#1E3558] shadow-2xl py-2 z-50 text-xs"
                >
                  <div className="px-3 py-1.5 border-b border-slate-100 dark:border-slate-800">
                    <p className="font-bold text-[#10253f] dark:text-white truncate">
                      {user.full_name || "Người dùng"}
                    </p>
                    <p className="text-[11px] text-slate-400 truncate">
                      {user.email}
                    </p>
                  </div>
                  <Link
                    href="/profile"
                    className="flex items-center gap-2 px-3 py-2 text-slate-700 dark:text-slate-300 hover:bg-[#FAF5ED] dark:hover:bg-[#162744] font-medium"
                  >
                    <User className="w-4 h-4 text-[#8A6834]" />
                    <span>Hồ Sơ & Thống Kê</span>
                  </Link>
                  <Link
                    href="/upgrade"
                    className="flex items-center gap-2 px-3 py-2 text-[#8A6834] dark:text-[#EAD7B8] hover:bg-[#FAF5ED] dark:hover:bg-[#162744] font-bold"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Nâng Cấp Gói (/upgrade)</span>
                  </Link>
                  <Link
                    href="/history"
                    className="flex items-center gap-2 px-3 py-2 text-slate-700 dark:text-slate-300 hover:bg-[#FAF5ED] dark:hover:bg-[#162744] font-medium"
                  >
                    <Clock className="w-4 h-4 text-[#8A6834]" />
                    <span>Lịch Sử Hợp Đồng</span>
                  </Link>
                  {isAdmin && (
                    <Link
                      href="/admin"
                      className="flex items-center gap-2 px-3 py-2 text-[#8A6834] dark:text-[#EAD7B8] hover:bg-[#FAF5ED] dark:hover:bg-[#162744] font-bold"
                    >
                      <ShieldCheck className="w-4 h-4" />
                      <span>Trang Quản Trị Admin</span>
                    </Link>
                  )}
                  <button
                    onClick={() => logout()}
                    className="w-full text-left flex items-center gap-2 px-3 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 font-bold border-t border-slate-100 dark:border-slate-800"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Đăng xuất</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => {
                setAuthModalTab("login");
                setAuthModalOpen(true);
              }}
              className="px-3.5 py-1.5 rounded-xl bg-[#10253f] hover:bg-[#1c385c] dark:bg-[#EAD7B8] dark:hover:bg-[#dfc59f] text-white dark:text-[#10253f] text-xs font-bold shadow-xs cursor-pointer"
            >
              {lang === "EN" ? "Sign In" : "Đăng nhập"}
            </button>
          )}
        </div>
      </header>

      {/* Floating Notice / Error Toast (L1, L2, L5, L9) */}
      <AnimatePresence>
        {workspaceNotice && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-50 max-w-lg w-full px-4 no-print"
          >
            <div className="p-3 rounded-2xl bg-[#0F223D] text-[#EAD7B8] border border-[#EAD7B8] shadow-2xl flex items-center justify-between gap-3 text-xs font-bold">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-[#EAD7B8] shrink-0" />
                <span>{workspaceNotice}</span>
              </div>
              <button
                onClick={() => setWorkspaceNotice(null)}
                className="text-white hover:text-red-300 p-1"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Global Window Drag & Drop Overlay */}
      <AnimatePresence>
        {isGlobalDragging && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#0F223D]/80 backdrop-blur-md p-6 pointer-events-none no-print select-none"
          >
            <div className="p-8 rounded-3xl bg-white/10 border-2 border-dashed border-[#EAD7B8] flex flex-col items-center gap-4 text-center max-w-md shadow-2xl">
              <div className="w-16 h-16 rounded-2xl bg-[#EAD7B8] text-[#10253f] flex items-center justify-center animate-bounce shadow-lg">
                <Upload className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-black text-white">
                  {lang === "EN" ? "Drop Contract Here" : "Thả Hợp Đồng Vào Đây"}
                </h3>
                <p className="text-xs text-slate-300">
                  {lang === "EN"
                    ? "Release to upload and inspect with WeebLegit AI"
                    : "Thả tệp để tự động tải lên và thẩm định rủi ro trong Legal Studio"}
                </p>
              </div>
              <div className="flex items-center gap-2 text-[10px] text-[#EAD7B8] font-bold px-3 py-1 rounded-full bg-white/5 border border-[#EAD7B8]/40">
                <span>PDF • DOCX • DOC • TXT • JPG • PNG</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Segmented Tab Bar (Visible on mobile/tablet < md only) (L12) */}
      <div className="md:hidden flex items-center border-b border-[#D8E3EF] dark:border-[#1E3354] bg-white dark:bg-[#09111E] px-3 py-2 gap-2 shrink-0 no-print">

        <button
          onClick={() => setMobileTab("doc_ai")}
          className={`flex-1 py-1.5 text-xs font-bold text-center rounded-xl transition-all ${
            mobileTab === "doc_ai"
              ? "bg-[#FAF5ED] dark:bg-[#162744] text-[#8A6834] dark:text-[#EAD7B8] border border-[#EAD7B8]/60 shadow-2xs"
              : "text-slate-500 hover:text-black dark:hover:text-white"
          }`}
        >
          📄 {lang === "EN" ? "Document & AI Hub" : "Văn Bản & Trợ Lý AI"}
        </button>
        <button
          onClick={() => setMobileTab("risk")}
          className={`flex-1 py-1.5 text-xs font-bold text-center rounded-xl transition-all ${
            mobileTab === "risk"
              ? "bg-[#FAF5ED] dark:bg-[#162744] text-[#8A6834] dark:text-[#EAD7B8] border border-[#EAD7B8]/60 shadow-2xs"
              : "text-slate-500 hover:text-black dark:hover:text-white"
          }`}
        >
          📊 {lang === "EN" ? "Risk Scoring" : "Đánh Giá & Rủi Ro"}
        </button>
      </div>

      {/* ══════════ MAIN WORKSPACE CONTAINER ══════════ */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        <div
          ref={containerRef}
          className="flex-1 flex overflow-hidden relative min-h-0 select-text"
        >
          {/* ════════ LEFT PANE: UNIFIED DOCUMENT & AI COPILOT HUB ════════ */}
          <section
            style={{ width: `${splitPercent}%` }}
            className={`h-full flex flex-col border-r border-[#D8E3EF] dark:border-[#1E3354] bg-white dark:bg-[#0A1220] overflow-hidden relative ${
              mobileTab === "doc_ai" ? "flex w-full" : "hidden md:flex"
            }`}
          >
            {/* Left Hub Header */}
            <div className="p-3 bg-[#FAF5ED]/50 dark:bg-[#0D1829] border-b border-[#EAD7B8]/60 dark:border-[#1B2F4D] flex flex-col gap-2 shrink-0 no-print">

              <div className="flex items-center justify-between gap-2 flex-wrap">
                {/* View Mode Switcher: Document vs AI vs Split */}
                <div className="flex items-center gap-1 p-1 bg-white dark:bg-[#070D18] rounded-xl border border-[#D8E3EF] dark:border-[#1E3558] shadow-2xs">
                  <button
                    onClick={() => setLeftPaneViewMode("document")}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      leftPaneViewMode === "document"
                        ? "bg-[#FAF5ED] dark:bg-[#162744] text-[#8A6834] dark:text-[#EAD7B8] border border-[#EAD7B8]/60 shadow-xs"
                        : "text-slate-500 hover:text-black dark:hover:text-white"
                    }`}
                  >
                    📄 {lang === "EN" ? "Document" : "Văn bản"}
                  </button>
                  <button
                    onClick={() => setLeftPaneViewMode("ai")}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer relative ${
                      leftPaneViewMode === "ai"
                        ? "bg-[#FAF5ED] dark:bg-[#162744] text-[#8A6834] dark:text-[#EAD7B8] border border-[#EAD7B8]/60 shadow-xs"
                        : "text-slate-500 hover:text-black dark:hover:text-white"
                    }`}
                  >
                    🤖 {lang === "EN" ? "AI Copilot" : "Trợ lý AI"}
                    {chatMessages.length > 1 && (
                      <span className="ml-1 px-1.5 py-0.2 rounded-full text-[9px] bg-[#EAD7B8] text-[#10253f] font-black">
                        {chatMessages.length - 1}
                      </span>
                    )}
                  </button>
                  <button
                    onClick={() => setLeftPaneViewMode("split")}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      leftPaneViewMode === "split"
                        ? "bg-[#FAF5ED] dark:bg-[#162744] text-[#8A6834] dark:text-[#EAD7B8] border border-[#EAD7B8]/60 shadow-xs"
                        : "text-slate-500 hover:text-black dark:hover:text-white"
                    }`}
                  >
                    🔀 {lang === "EN" ? "Split View" : "Song song"}
                  </button>
                </div>

                {/* SHA-256 match status badge */}
                {contractDetails && (
                  <div className="flex items-center gap-1.5">
                    <span
                      onClick={handleCopyHash}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-[#eafbf7] dark:bg-emerald-950/40 text-[#159f7b] dark:text-emerald-300 border border-[#b7f6e5] dark:border-emerald-800/60 cursor-pointer hover:opacity-80"
                      title={`Click to copy: ${contractDetails.sha256_hash}`}
                    >
                      <CheckCircle2 className="w-3 h-3" />
                      <span>SHA-256: {contractDetails.sha256_hash.slice(0, 8)}...</span>
                      {copiedHash ? (
                        <Check className="w-2.5 h-2.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-2.5 h-2.5 opacity-60" />
                      )}
                    </span>
                  </div>
                )}
              </div>

              {/* Quick in-document text search with Match Counter (L11) */}
              {(leftPaneViewMode === "document" || leftPaneViewMode === "split") &&
                contractContent?.text && (
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[#8297ac]" />
                    <input
                      type="text"
                      placeholder={
                        lang === "EN"
                          ? "Find keywords (e.g. 'đặt cọc', 'chấm dứt', 'phạt')..."
                          : "Tìm từ khóa trong nội dung (ví dụ: 'đặt cọc', 'chấm dứt', 'phạt')..."
                      }
                      value={activeSearchTerm}
                      onChange={(e) => setActiveSearchTerm(e.target.value)}
                      className="w-full pl-8 pr-20 py-1.5 rounded-lg text-xs bg-white dark:bg-[#070D18] border border-[#D8E3EF] dark:border-[#1E3558] text-[#10253f] dark:text-white focus:outline-none focus:border-[#EAD7B8]"
                    />
                    {activeSearchTerm && (
                      <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
                          {searchMatchCount} {lang === "EN" ? "matches" : "khớp"}
                        </span>
                        <button
                          onClick={() => setActiveSearchTerm("")}
                          className="text-xs text-[#8297ac] hover:text-black dark:hover:text-white"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                )}

              {/* Photo & OCR Sub-mode Switcher for Image Contracts */}
              {contractContent?.is_image && (
                <div className="flex items-center justify-between px-2.5 py-1.5 bg-[#FAF5ED] dark:bg-[#162744] rounded-xl border border-[#EAD7B8]/70 dark:border-[#243d63] text-xs">
                  <div className="flex items-center gap-1.5 font-bold text-[#8A6834] dark:text-[#EAD7B8]">
                    <span className="text-sm">📸</span>
                    <span className="text-[11px]">
                      {lang === "EN" ? "Contract Photo (OCR Digitized)" : "Ảnh chụp hợp đồng (Đã OCR số hóa)"}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 bg-white dark:bg-[#070D18] p-0.5 rounded-lg border border-[#D8E3EF] dark:border-[#1E3558]">
                    <button
                      type="button"
                      onClick={() => setDocSubMode("both")}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all cursor-pointer ${
                        docSubMode === "both"
                          ? "bg-[#EAD7B8] text-[#10253f] shadow-2xs"
                          : "text-slate-500 hover:text-black dark:hover:text-white"
                      }`}
                    >
                      {lang === "EN" ? "Split (Photo+Text)" : "Song song (Ảnh + Chữ)"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setDocSubMode("image")}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all cursor-pointer ${
                        docSubMode === "image"
                          ? "bg-[#EAD7B8] text-[#10253f] shadow-2xs"
                          : "text-slate-500 hover:text-black dark:hover:text-white"
                      }`}
                    >
                      {lang === "EN" ? "Photo Only" : "Chỉ ảnh gốc"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setDocSubMode("text")}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all cursor-pointer ${
                        docSubMode === "text"
                          ? "bg-[#EAD7B8] text-[#10253f] shadow-2xs"
                          : "text-slate-500 hover:text-black dark:hover:text-white"
                      }`}
                    >
                      {lang === "EN" ? "Text Only" : "Chỉ văn bản"}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Left Hub Body: Swappable / Resizable Views */}
            <div
              ref={leftPaneBodyRef}
              className="flex-1 flex flex-col overflow-hidden relative"
            >
              {/* ─── SCENARIO 1: DOCUMENT ONLY MODE ─── */}
              {leftPaneViewMode === "document" && (
                <div className="flex-1 flex flex-col overflow-hidden">
                  <div
                    ref={textViewerRef}
                    className="flex-1 overflow-y-auto p-4 font-mono text-xs leading-relaxed text-[#2C4460] dark:text-[#CBD5E1] bg-white dark:bg-[#09111E]"
                  >
                    {contentLoading ? (
                      <div className="flex flex-col items-center justify-center h-64 gap-3 text-slate-400">
                        <div className="w-8 h-8 rounded-full border-2 border-[#10253f] dark:border-[#EAD7B8] border-t-transparent animate-spin" />
                        <p className="text-xs font-medium">
                          {lang === "EN" ? "Loading contract content..." : "Đang tải nội dung văn bản..."}
                        </p>
                      </div>
                    ) : isScannedPdf ? (
                      /* Scanned PDF Notice (L4) */
                      <div className="p-6 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-amber-900 dark:text-amber-200 space-y-3">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="w-5 h-5 text-amber-600" />
                          <h4 className="font-bold text-sm">
                            {lang === "EN" ? "Scanned Document Detected" : "Phát Hiện Văn Bản Dạng Ảnh Quét (Scanned PDF)"}
                          </h4>
                        </div>
                        <p className="text-xs leading-relaxed">
                          {lang === "EN"
                            ? "This document contains scanned images without a machine-readable text layer. The viewer cannot show line-by-line text, but you can still ask AI Copilot below or upload a digitized PDF/DOCX."
                            : "Tệp PDF này là ảnh scan/chụp tài liệu chưa có lớp chữ số hóa. Trình xem không thể hiển thị từng dòng văn bản, nhưng bạn vẫn có thể sử dụng khung hỏi đáp Trợ lý AI ở chế độ Song song hoặc tải lên bản PDF/DOCX có chữ số."}
                        </p>
                      </div>
                    ) : contractContent?.text || contractContent?.is_image ? (
                      contractContent?.is_image && docSubMode === "image" ? (
                        /* Image Zoom Viewer */
                        <div className="flex flex-col items-center justify-start p-3 space-y-3 min-h-full">
                          <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-xl text-xs sticky top-0 z-10 shadow-xs border border-slate-200 dark:border-slate-700">
                            <span className="text-slate-500 font-bold">{imageZoom}%</span>
                            <button
                              type="button"
                              onClick={() => setImageZoom((z) => Math.max(50, z - 25))}
                              className="px-2 py-0.5 rounded bg-white dark:bg-slate-700 font-bold hover:bg-slate-200 dark:hover:bg-slate-600 cursor-pointer"
                            >
                              -
                            </button>
                            <button
                              type="button"
                              onClick={() => setImageZoom(100)}
                              className="px-2 py-0.5 rounded bg-white dark:bg-slate-700 text-[10px] font-bold hover:bg-slate-200 dark:hover:bg-slate-600 cursor-pointer"
                            >
                              100%
                            </button>
                            <button
                              type="button"
                              onClick={() => setImageZoom((z) => Math.min(300, z + 25))}
                              className="px-2 py-0.5 rounded bg-white dark:bg-slate-700 font-bold hover:bg-slate-200 dark:hover:bg-slate-600 cursor-pointer"
                            >
                              +
                            </button>
                            <a
                              href={rawFileUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="ml-2 text-[#8A6834] dark:text-[#EAD7B8] hover:underline font-bold text-[11px]"
                            >
                              {lang === "EN" ? "Open full ↗" : "Mở file gốc ↗"}
                            </a>
                          </div>
                          <div className="overflow-auto max-w-full flex items-center justify-center p-2">
                            <img
                              src={rawFileUrl}
                              alt={contractContent.original_filename}
                              style={{ width: `${imageZoom}%` }}
                              className="max-w-none rounded-xl border border-slate-200 dark:border-slate-800 shadow-md object-contain"
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {/* Image Contract Banner in 'both' mode */}
                          {contractContent?.is_image && docSubMode === "both" && (
                            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex flex-col items-center gap-2">
                              <div className="flex items-center justify-between w-full text-xs font-bold text-slate-500">
                                <span className="flex items-center gap-1.5 text-[#8A6834] dark:text-[#EAD7B8]">
                                  📸 {lang === "EN" ? "Contract Photo (Original)" : "Ảnh chụp hợp đồng gốc"}
                                </span>
                                <a
                                  href={rawFileUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-[#8A6834] dark:text-[#EAD7B8] hover:underline text-[11px]"
                                >
                                  {lang === "EN" ? "Open full size ↗" : "Mở kích thước gốc ↗"}
                                </a>
                              </div>
                              <img
                                src={rawFileUrl}
                                alt={contractContent.original_filename}
                                className="max-h-64 object-contain rounded-lg border border-slate-200 dark:border-slate-800 shadow-xs"
                              />
                              <div className="w-full pt-1.5 border-t border-dashed border-slate-200 dark:border-slate-800 text-[11px] font-bold text-[#8A6834] dark:text-[#EAD7B8] flex items-center gap-1">
                                <span>📝</span>
                                <span>
                                  {lang === "EN"
                                    ? "OCR Digitized Text & Clauses Below:"
                                    : "Văn bản số hóa & Các điều khoản bóc tách từ ảnh bên dưới:"}
                                </span>
                              </div>
                            </div>
                          )}

                          {/* Text Lines */}
                          <div className="space-y-1">
                            {contractContent.text ? (
                              contractContent.text.split("\n").map((line, idx) => {
                                const lineNum = idx + 1;
                                const isHighlighted =
                                  (highlightedText &&
                                    line.toLowerCase().includes(highlightedText.toLowerCase())) ||
                                  (trimmedSearch &&
                                    line.toLowerCase().includes(trimmedSearch));

                                return (
                                  <div
                                    key={idx}
                                    className={`flex items-start gap-3 py-0.5 px-2 rounded transition-colors ${
                                      isHighlighted
                                        ? "bg-amber-100/80 dark:bg-amber-950/60 text-amber-950 dark:text-amber-200 font-semibold border-l-2 border-amber-500"
                                        : "hover:bg-slate-50 dark:hover:bg-slate-900/40"
                                    }`}
                                  >
                                    <span className="w-8 shrink-0 text-right select-none text-[11px] text-slate-400 dark:text-slate-600">
                                      {lineNum}
                                    </span>
                                    <span className="flex-1 whitespace-pre-wrap break-all">
                                      {line || " "}
                                    </span>
                                  </div>
                                );
                              })
                            ) : (
                              <p className="text-slate-400 text-xs italic py-2 text-center">
                                {lang === "EN"
                                  ? "No text detected in this image. You can switch to Photo Only above."
                                  : "Không phát hiện chữ viết trong ảnh. Bạn có thể chọn chế độ 'Chỉ ảnh gốc' ở trên."}
                              </p>
                            )}
                          </div>
                        </div>
                      )
                    ) : (
                      /* Clean Empty State */
                      <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-center p-8 space-y-4">
                        <div className="w-16 h-16 rounded-3xl bg-[#FAF5ED] dark:bg-[#162744] border-2 border-dashed border-[#EAD7B8] dark:border-[#2C4875] flex items-center justify-center text-[#8A6834] dark:text-[#EAD7B8]">
                          <Upload className="w-8 h-8" />
                        </div>
                        <div className="space-y-1.5 max-w-sm">
                          <h4 className="text-sm font-bold text-[#10253f] dark:text-white">
                            {lang === "EN" ? "No Contract Active in Studio" : "Chưa có hợp đồng nào được chọn"}
                          </h4>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            {lang === "EN"
                              ? "Drag and drop your PDF / DOCX / Image file below, or pick from your saved contracts list."
                              : "Kéo thả file PDF, DOCX, TXT hoặc ảnh chụp vào khung dưới, hoặc bấm nút 'Danh Sách Hợp Đồng' để mở file đã tải."}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 pt-2">
                          <button
                            onClick={() => setIsContractSelectorOpen(true)}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#FAF5ED] dark:bg-[#162744] hover:bg-[#EAD7B8] dark:hover:bg-[#203a63] text-xs font-bold text-[#8A6834] dark:text-[#EAD7B8] border border-[#EAD7B8] dark:border-[#335380] transition-colors cursor-pointer"
                          >
                            <FolderOpen className="w-4 h-4" />
                            <span>{lang === "EN" ? "Open Contract Explorer" : "Mở Danh Sách Hợp Đồng"}</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Dropzone Footer */}
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDropActive(true);
                    }}
                    onDragLeave={() => setIsDropActive(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setIsDropActive(false);
                      if (e.dataTransfer.files) handleDirectUpload(e.dataTransfer.files);
                    }}
                    className={`p-3 border-t border-[#D8E3EF] dark:border-[#1E3354] text-center text-xs transition-colors shrink-0 no-print ${
                      isDropActive
                        ? "bg-[#FAF5ED] dark:bg-[#162744] border-[#EAD7B8] text-[#8A6834]"
                        : "bg-slate-50 dark:bg-[#080E1A] text-slate-500"
                    }`}
                  >
                    {uploadLoading ? (
                      <span className="inline-flex items-center gap-2 font-bold text-[#8A6834] dark:text-[#EAD7B8]">
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        {lang === "EN" ? "Uploading & OCR processing clauses..." : "Đang nạp file & OCR bóc tách điều khoản..."}
                      </span>
                    ) : (
                      <label className="inline-flex items-center justify-center gap-2 cursor-pointer w-full group">
                        <Upload className="w-4 h-4 text-[#8A6834] dark:text-[#EAD7B8] group-hover:scale-110 transition-transform" />
                        <span className="font-semibold text-slate-600 dark:text-slate-300">
                          {lang === "EN"
                            ? "Drop contract or photo here (PDF, DOCX, TXT, Images)"
                            : "Kéo thả hợp đồng hoặc ảnh chụp vào đây (PDF, DOCX, TXT, Ảnh JPG/PNG)"}
                        </span>
                        <input
                          type="file"
                          className="hidden"
                          accept=".pdf,.docx,.doc,.txt,.jpg,.jpeg,.png,.webp"
                          onChange={(e) =>
                            e.target.files && handleDirectUpload(e.target.files)
                          }
                        />
                      </label>
                    )}
                  </div>

                  {/* Sleek Copilot Quick Ask Strip at bottom of Document */}
                  <div className="p-2.5 bg-white dark:bg-[#0B1528] border-t border-[#D8E3EF] dark:border-[#1E3354] flex items-center gap-2 shrink-0 no-print">

                    <Bot className="w-4 h-4 text-[#8A6834] dark:text-[#EAD7B8] shrink-0" />
                    <input
                      type="text"
                      placeholder={
                        lang === "EN"
                          ? "Ask Copilot about this document (switches to conversation)..."
                          : "Hỏi Copilot về văn bản này (tự động mở khung hội thoại)..."
                      }
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleSendChatMessage();
                        }
                      }}
                      className="flex-1 px-3 py-1.5 rounded-xl text-xs bg-slate-50 dark:bg-[#070D18] border border-slate-200 dark:border-[#1E3558] text-[#10253f] dark:text-white focus:outline-none focus:border-[#EAD7B8]"
                    />
                    <button
                      onClick={() => handleSendChatMessage()}
                      disabled={!chatInput.trim() || isAiTyping}
                      className="px-3 py-1.5 bg-[#10253f] hover:bg-[#1E3A5F] dark:bg-[#EAD7B8] dark:hover:bg-[#dfc59f] text-white dark:text-[#10253f] rounded-xl text-xs font-bold disabled:opacity-40 transition-colors cursor-pointer flex items-center gap-1.5 shrink-0"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{lang === "EN" ? "Ask" : "Hỏi"}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* ─── SCENARIO 2: AI COPILOT ONLY MODE ─── */}
              {leftPaneViewMode === "ai" && (
                <div className="flex-1 flex flex-col overflow-hidden bg-slate-50/50 dark:bg-[#070D18]/70">
                  {/* Messages body */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-3 text-xs">
                    {chatMessages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${
                          msg.role === "user" ? "items-end" : "items-start"
                        }`}
                      >
                        <div
                          className={`max-w-[85%] p-3 rounded-2xl ${
                            msg.role === "user"
                              ? "bg-[#10253f] text-white dark:bg-[#EAD7B8] dark:text-[#10253f] rounded-br-xs shadow-xs"
                              : "bg-white dark:bg-[#102038] text-[#10253f] dark:text-slate-200 border border-slate-200 dark:border-[#1E3558] rounded-bl-xs shadow-xs"
                          }`}
                        >
                          <p className="whitespace-pre-wrap leading-relaxed">
                            {msg.content}
                          </p>

                          {msg.attachedFileInfo && (
                            <div className="mt-2 p-2 rounded-xl bg-black/10 dark:bg-white/10 flex items-center gap-2 text-[11px] font-medium border border-white/20">
                              <Paperclip className="w-3.5 h-3.5 shrink-0" />
                              <span className="truncate max-w-[200px] font-bold">{msg.attachedFileInfo.name}</span>
                              <span className="opacity-70 text-[10px]">({formatBytes(msg.attachedFileInfo.size)})</span>
                            </div>
                          )}


                          {msg.citations && msg.citations.length > 0 && (
                            <div className="mt-2 pt-2 border-t border-slate-200/40 dark:border-slate-700/50 flex items-center gap-1.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                              <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                              <span>Căn cứ: {msg.citations.join(", ")}</span>
                            </div>
                          )}

                          {msg.negotiationScript && (
                            <div className="mt-2 p-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-amber-900 dark:text-amber-200">
                              <span className="text-[10px] font-black uppercase tracking-wider block mb-1">
                                💡 Gợi ý kịch bản đàm phán:
                              </span>
                              <p className="italic text-xs font-mono">
                                &ldquo;{msg.negotiationScript}&rdquo;
                              </p>
                            </div>
                          )}
                        </div>
                        <span className="text-[9px] text-slate-400 px-1 mt-1">
                          {msg.timestamp}
                        </span>
                      </div>
                    ))}
                    {isAiTyping && (
                      <div className="flex items-center gap-2 text-slate-400 text-xs italic p-2">
                        <div className="w-4 h-4 rounded-full border border-slate-400 border-t-transparent animate-spin" />
                        <span>AI đang tra cứu luật và soạn thảo phản hồi...</span>
                      </div>
                    )}
                    <div ref={chatBottomRef} />
                  </div>

                  {/* Copilot input bar */}
                  {renderCopilotInputBar()}
                </div>
              )}

              {/* ─── SCENARIO 3: SPLIT VIEW (DOCUMENT TOP + AI BOTTOM) ─── */}
              {leftPaneViewMode === "split" && (
                <div className="flex-1 flex flex-col overflow-hidden">
                  {/* Top Part: Document Viewer */}
                  <div
                    style={{ height: `${leftSplitHeight}%` }}
                    className="overflow-y-auto p-3 font-mono text-xs leading-relaxed text-[#2C4460] dark:text-[#CBD5E1] bg-white dark:bg-[#09111E]"
                  >
                    {contentLoading ? (
                      <div className="flex flex-col items-center justify-center h-full gap-2 text-slate-400">
                        <div className="w-6 h-6 rounded-full border-2 border-[#10253f] dark:border-[#EAD7B8] border-t-transparent animate-spin" />
                        <span className="text-xs">Đang tải nội dung...</span>
                      </div>
                    ) : isScannedPdf ? (
                      <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 text-xs">
                        ⚠️ File PDF ảnh scan chưa có lớp text số hóa.
                      </div>
                    ) : contractContent?.text || contractContent?.is_image ? (
                      contractContent?.is_image && docSubMode === "image" ? (
                        <div className="flex flex-col items-center justify-center p-2 h-full">
                          <img
                            src={rawFileUrl}
                            alt={contractContent.original_filename}
                            className="max-h-full max-w-full object-contain rounded-lg border border-slate-200 dark:border-slate-800 shadow-xs"
                          />
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {contractContent?.is_image && docSubMode === "both" && (
                            <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2">
                              <span className="text-[11px] font-bold text-[#8A6834] dark:text-[#EAD7B8] flex items-center gap-1">
                                📸 {contractContent.original_filename}
                              </span>
                              <a
                                href={rawFileUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="text-[10px] text-[#8A6834] dark:text-[#EAD7B8] hover:underline font-bold"
                              >
                                Xem ảnh gốc ↗
                              </a>
                            </div>
                          )}
                          <div className="space-y-1">
                            {contractContent.text ? (
                              contractContent.text.split("\n").map((line, idx) => {
                                const lineNum = idx + 1;
                                const isHighlighted =
                                  (highlightedText &&
                                    line.toLowerCase().includes(highlightedText.toLowerCase())) ||
                                  (trimmedSearch &&
                                    line.toLowerCase().includes(trimmedSearch));

                                return (
                                  <div
                                    key={idx}
                                    className={`flex items-start gap-2 py-0.5 px-1.5 rounded transition-colors ${
                                      isHighlighted
                                        ? "bg-amber-100/80 dark:bg-amber-950/60 text-amber-950 dark:text-amber-200 font-semibold border-l-2 border-amber-500"
                                        : "hover:bg-slate-50 dark:hover:bg-slate-900/40"
                                    }`}
                                  >
                                    <span className="w-7 shrink-0 text-right select-none text-[10px] text-slate-400">
                                      {lineNum}
                                    </span>
                                    <span className="flex-1 whitespace-pre-wrap break-all">
                                      {line || " "}
                                    </span>
                                  </div>
                                );
                              })
                            ) : (
                              <p className="text-slate-400 text-xs italic py-2 text-center">
                                Chưa phát hiện chữ viết trong ảnh.
                              </p>
                            )}
                          </div>
                        </div>
                      )
                    ) : (
                      <div className="flex items-center justify-center h-full text-slate-400 text-xs">
                        Chưa chọn hợp đồng. Bấm "Danh Sách Hợp Đồng" để mở.
                      </div>
                    )}
                  </div>

                  {/* Resizable Horizontal Divider between Document & AI inside Left Pane */}
                  <div
                    onMouseDown={startDragLeftSplit}
                    onDoubleClick={() => setLeftSplitHeight(50)}
                    title="Kéo lên/xuống để chỉnh tỉ lệ hiển thị giữa Văn bản và AI (Nhấp đúp reset 50/50)"
                    className="h-1.5 hover:h-2 bg-[#D8E3EF] hover:bg-[#8A6834] dark:bg-[#1E3354] dark:hover:bg-[#EAD7B8] transition-all cursor-row-resize flex items-center justify-center z-20 group relative shrink-0 no-print"
                  >
                    <div className="w-8 h-1 rounded-full bg-slate-400 group-hover:bg-white" />
                  </div>

                  {/* Bottom Part: AI Copilot Chat Messages Stream + Input Bar */}
                  <div
                    style={{ height: `${100 - leftSplitHeight}%` }}
                    className="flex flex-col overflow-hidden bg-slate-50/50 dark:bg-[#070D18]/70"
                  >
                    <div className="flex-1 overflow-y-auto p-3 space-y-2.5 text-xs">
                      {chatMessages.map((msg) => (
                        <div
                          key={msg.id}
                          className={`flex flex-col ${
                            msg.role === "user" ? "items-end" : "items-start"
                          }`}
                        >
                          <div
                            className={`max-w-[85%] p-2.5 rounded-xl ${
                              msg.role === "user"
                                ? "bg-[#10253f] text-white dark:bg-[#EAD7B8] dark:text-[#10253f] rounded-br-xs shadow-xs"
                                : "bg-white dark:bg-[#102038] text-[#10253f] dark:text-slate-200 border border-slate-200 dark:border-[#1E3558] rounded-bl-xs shadow-xs"
                            }`}
                          >
                            <p className="whitespace-pre-wrap leading-relaxed">
                              {msg.content}
                            </p>

                            {msg.attachedFileInfo && (
                              <div className="mt-1.5 p-1.5 rounded-lg bg-black/10 dark:bg-white/10 flex items-center gap-1.5 text-[10px] font-medium border border-white/20">
                                <Paperclip className="w-3 h-3 shrink-0" />
                                <span className="truncate max-w-[160px] font-bold">{msg.attachedFileInfo.name}</span>
                                <span className="opacity-70">({formatBytes(msg.attachedFileInfo.size)})</span>
                              </div>
                            )}


                            {msg.citations && msg.citations.length > 0 && (
                              <div className="mt-1.5 pt-1.5 border-t border-slate-200/40 dark:border-slate-700/50 flex items-center gap-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                                <ShieldCheck className="w-3 h-3 shrink-0" />
                                <span>Căn cứ: {msg.citations.join(", ")}</span>
                              </div>
                            )}

                            {msg.negotiationScript && (
                              <div className="mt-1.5 p-2 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 text-amber-900 dark:text-amber-200 text-[11px]">
                                <span className="font-bold block mb-0.5">💡 Kịch bản đàm phán:</span>
                                <i>&ldquo;{msg.negotiationScript}&rdquo;</i>
                              </div>
                            )}
                          </div>
                          <span className="text-[9px] text-slate-400 px-1 mt-0.5">
                            {msg.timestamp}
                          </span>
                        </div>
                      ))}
                      {isAiTyping && (
                        <div className="flex items-center gap-2 text-slate-400 text-xs italic">
                          <div className="w-3.5 h-3.5 rounded-full border border-slate-400 border-t-transparent animate-spin" />
                          <span>AI đang phản hồi...</span>
                        </div>
                      )}
                      <div ref={chatBottomRef} />
                    </div>

                    {/* Copilot input bar */}
                    {renderCopilotInputBar()}
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* ════════ DRAGGABLE HORIZONTAL SPLITTER (Between Left & Right) ════════ */}
          <div
            onMouseDown={startDragSplitter}
            onDoubleClick={() => setSplitPercent(50)}
            title="Kéo sang trái/phải để căn kích thước, nhấp đúp để reset 50/50"
            className="w-1.5 hover:w-2 bg-[#D8E3EF] hover:bg-[#8A6834] dark:bg-[#1E3354] dark:hover:bg-[#EAD7B8] transition-all cursor-col-resize hidden md:flex items-center justify-center z-20 group relative shrink-0 no-print"
          >
            <div className="w-1 h-6 rounded-full bg-slate-400 group-hover:bg-white" />
          </div>

          {/* ════════ RIGHT PANE: RISK ENGINE, HEATMAP & COMPARE (Full Height) ════════ */}
          <section
            style={{ width: `${100 - splitPercent}%` }}
            className={`h-full flex flex-col bg-[#F9FAFC] dark:bg-[#070D18] overflow-hidden relative select-text ${
              mobileTab === "risk" ? "flex w-full" : "hidden md:flex"
            }`}
          >
            {/* Right Pane Tab Bar */}
            <div className="px-4 py-2.5 bg-white dark:bg-[#0B1528] border-b border-[#D8E3EF] dark:border-[#1E3354] flex items-center justify-between shrink-0 no-print">

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setRightPaneTab("analysis")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    rightPaneTab === "analysis"
                      ? "bg-[#FAF5ED] dark:bg-[#162744] text-[#8A6834] dark:text-[#EAD7B8] border border-[#EAD7B8]/70 dark:border-[#274068] shadow-xs"
                      : "text-[#5F758D] dark:text-[#94A3B8] hover:bg-slate-100 dark:hover:bg-slate-800"
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <Flame className="w-3.5 h-3.5" />
                    {lang === "EN" ? "Risk Scoring & Clauses" : "Đánh giá Rủi ro & Điều khoản"}
                  </span>
                </button>

                {canCompareContracts && (
                  <button
                    onClick={() => setRightPaneTab("compare")}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      rightPaneTab === "compare"
                        ? "bg-[#FAF5ED] dark:bg-[#162744] text-[#8A6834] dark:text-[#EAD7B8] border border-[#EAD7B8]/70 dark:border-[#274068] shadow-xs"
                        : "text-[#5F758D] dark:text-[#94A3B8] hover:bg-slate-100 dark:hover:bg-slate-800"
                    }`}
                  >
                    <span className="flex items-center gap-1.5">
                      <Scale className="w-3.5 h-3.5" />
                      {lang === "EN" ? "Side-by-Side Compare" : "Đối chiếu 2 Hợp đồng"}
                    </span>
                  </button>
                )}
              </div>

              {/* Red Flag Quick Pill & Re-evaluate Action */}
              {analysisResult && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleStartEvaluation}
                    disabled={evaluating}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold text-[#8A6834] dark:text-[#EAD7B8] bg-[#FAF5ED] dark:bg-[#162744] border border-[#EAD7B8]/70 hover:bg-[#EAD7B8] hover:text-[#10253f] transition-all cursor-pointer disabled:opacity-50 shadow-2xs"
                    title={lang === "EN" ? "Re-evaluate contract clauses" : "Chấm lại toàn bộ điều khoản"}
                  >
                    <RefreshCw className={`w-3 h-3 ${evaluating ? "animate-spin" : ""}`} />
                    <span>{lang === "EN" ? "Re-check" : "Chấm lại"}</span>
                  </button>

                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-bold text-slate-500">
                      {lang === "EN" ? "Score:" : "Điểm rủi ro:"}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-md text-xs font-black ${
                        (analysisResult.risk_score ?? 0) >= 70
                          ? "bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300"
                          : (analysisResult.risk_score ?? 0) >= 40
                          ? "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300"
                          : "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300"
                      }`}
                    >
                      {Math.round(analysisResult.risk_score ?? 0)}/100
                      {(analysisResult.risk_score ?? 0) === 0 && (lang === "EN" ? " (Safe)" : " (An toàn)")}
                    </span>
                  </div>
                </div>
              )}
            </div>


            {/* Right Pane Body */}
            {rightPaneTab === "analysis" && (
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {!activeContractId ? (
                  /* 1. Empty State when no contract active */
                  <div className="flex flex-col items-center justify-center h-full min-h-[360px] text-center p-8 space-y-4">
                    <div className="w-16 h-16 rounded-3xl bg-white dark:bg-[#0D1829] border-2 border-dashed border-[#D8E3EF] dark:border-[#1E3558] flex items-center justify-center text-slate-400">
                      <Flame className="w-8 h-8 opacity-40" />
                    </div>
                    <div className="space-y-1.5 max-w-sm">
                      <h4 className="text-sm font-bold text-[#10253f] dark:text-white">
                        {lang === "EN" ? "Risk Scoring Awaiting Document" : "Chưa có dữ liệu thẩm định rủi ro"}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                        {lang === "EN"
                          ? "Load a contract on the left pane to extract clauses, view risk heatmaps, and unlock AI negotiation scripts."
                          : "Hãy chọn một hợp đồng bên bảng trái để trích xuất điều khoản, xem ma trận rủi ro và nhận kịch bản đàm phán từ AI."}
                      </p>
                    </div>
                  </div>
                ) : isAwaitingEvaluation ? (
                  /* 2. Pre-scan State: Detected Clauses + Trigger Button */
                  <div className="space-y-4">
                    {/* Prompt banner to start evaluation */}
                    <div className="p-5 rounded-2xl bg-gradient-to-br from-[#FAF5ED] to-white dark:from-[#0D1829] dark:to-[#09111E] border-2 border-[#EAD7B8] dark:border-[#2C4875] shadow-sm space-y-3">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-[#8A6834] dark:text-[#EAD7B8]" />
                        <h4 className="font-black text-sm text-[#10253f] dark:text-white">
                          {lang === "EN" ? "Clauses Pre-scanned Successfully" : "Đã Quét Sơ Bộ Điều Khoản Hợp Đồng"}
                        </h4>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                        {lang === "EN"
                          ? "AI has detected the document structure. Click below to start the statutory evaluation, calculate risk scores, and check legal validity under Vietnamese law."
                          : "Hệ thống đã nhận diện cấu trúc văn bản. Bấm nút dưới đây để AI bắt đầu đối chiếu điều luật, tính toán điểm số và chỉ ra các điểm bất lợi."}
                      </p>

                      <div className="pt-1">
                        <button
                          onClick={handleStartEvaluation}
                          disabled={evaluating}
                          className="w-full py-3 px-4 rounded-xl bg-[#0F223D] hover:bg-[#162E52] active:bg-[#0A182B] text-[#EAD7B8] border-2 border-[#EAD7B8] font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer disabled:opacity-50"
                        >
                          {evaluating ? (
                            <>
                              <RefreshCw className="w-4 h-4 animate-spin text-[#EAD7B8] dark:text-[#10253f]" />
                              <span>{lang === "EN" ? "AI Evaluating..." : "Đang thẩm định & Chấm điểm rủi ro..."}</span>
                            </>
                          ) : (
                            <>
                              <Play className="w-4 h-4 fill-current text-[#EAD7B8] dark:text-[#10253f]" />
                              <span>
                                {lang === "EN"
                                  ? "🚀 Start Legal Risk Evaluation & Scoring"
                                  : "🚀 Bắt Đầu Đánh Giá & Chấm Điểm Rủi Ro"}
                              </span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Clauses outline list with Free-form fallback (L10) */}
                    <div className="space-y-2">
                      <h5 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        {lang === "EN" ? "Detected Clauses in Document:" : "Danh sách các điều khoản phát hiện trong văn bản:"}
                      </h5>
                      {rawClauses.length > 0 ? (
                        <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
                          {rawClauses.map((c) => (
                            <div
                              key={c.index}
                              className="p-3 rounded-xl bg-white dark:bg-[#0B1424] border border-slate-200 dark:border-slate-800 text-xs space-y-1 hover:border-[#EAD7B8] transition-colors"
                            >
                              <div className="flex items-center gap-2">
                                <span className="w-5 h-5 rounded-md bg-[#FAF5ED] dark:bg-[#162744] text-[#8A6834] dark:text-[#EAD7B8] font-bold text-[10px] flex items-center justify-center shrink-0">
                                  {c.index}
                                </span>
                                <h6 className="font-bold text-[#10253f] dark:text-white truncate">
                                  {c.title}
                                </h6>
                              </div>
                              {c.snippet && (
                                <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 pl-7 font-mono">
                                  &ldquo;{c.snippet}...&rdquo;
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="p-4 rounded-xl bg-white dark:bg-[#0B1424] border border-slate-200 dark:border-slate-800 text-xs text-slate-500 space-y-1">
                          <p className="font-bold text-[#10253f] dark:text-white">
                            {lang === "EN" ? "Free-form text format detected" : "Văn bản định dạng đoạn văn tự do"}
                          </p>
                          <p>
                            {lang === "EN"
                              ? "The document does not use standard 'Article' headings, but AI will evaluate the entire text when you start evaluation."
                              : "Văn bản không sử dụng tiêu đề Điều/Mục chuẩn hóa, nhưng AI vẫn sẽ quét và đánh giá toàn bộ nội dung khi bạn bấm nút Bắt Đầu ở trên."}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ) : analysisResult ? (
                  /* 3. Evaluated State: Gauge & Heatmap & Cards */
                  <>
                    <RiskGaugeAndHeatmap
                      score={Math.round(analysisResult.risk_score || 0)}
                      riskLabel={analysisResult.risk_label || "Rà soát sơ bộ"}
                      overview={analysisResult.overview || ""}
                      analysisSource={analysisResult.analysis_source}
                      findings={canViewClauses ? findingsList : []}
                      activeFilter={riskFilter}
                      onFilterChange={(f) => setRiskFilter(f)}
                      onSelectClauseIndex={(idx) => {
                        if (idx >= 0 && idx < findingsList.length) {
                          handleSelectClause(findingsList[idx], idx);
                        }
                      }}
                    />

                    {/* Filter and Clause Cards */}
                    {!canViewClauses ? (
                      /* Free user upgrade card */
                      <div className="p-5 rounded-2xl bg-gradient-to-br from-[#FAF5ED] to-white dark:from-[#0D1829] dark:to-[#09111E] border-2 border-[#EAD7B8] dark:border-[#2C4875] text-center space-y-3">
                        <div className="w-10 h-10 rounded-full bg-[#EAD7B8] text-[#10253f] flex items-center justify-center mx-auto font-black">
                          <Lock className="w-5 h-5" />
                        </div>
                        <h4 className="text-sm font-bold text-[#10253f] dark:text-white">
                          {lang === "EN" ? "Detailed Clause Analysis Locked" : "Khóa Chi Tiết Từng Điều Khoản"}
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
                          {lang === "EN"
                            ? "Upgrade to Medium or Pro to view full risk breakdown, statutory citations, and negotiation scripts."
                            : "Nâng cấp lên gói Medium hoặc Pro để mở toàn bộ phân tích chuyên sâu từng điều khoản, trích dẫn điều luật và kịch bản thương lượng."}
                        </p>
                        <Link
                          href="/upgrade"
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0F223D] text-[#EAD7B8] border border-[#EAD7B8] text-xs font-bold shadow-md hover:scale-102 transition-transform"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>{lang === "EN" ? "Upgrade Now" : "Nâng Cấp Ngay"}</span>
                        </Link>
                      </div>
                    ) : (
                      /* Clause list with filter pills */
                      <div className="space-y-3">
                        <div className="flex items-center justify-between gap-2 flex-wrap pt-2">
                          <h4 className="text-xs font-bold text-[#10253f] dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                            <Layers className="w-4 h-4 text-[#8A6834] dark:text-[#EAD7B8]" />
                            <span>{lang === "EN" ? "Risk Findings Breakdown" : "Chi tiết các điểm rủi ro"}</span>
                            <span className="text-[10px] text-slate-400 font-normal">
                              ({filteredFindings.length}/{findingsList.length})
                            </span>
                          </h4>

                          {/* Filter Pills */}
                          <div className="flex items-center gap-1">
                            {(["all", "high", "medium", "low"] as RiskFilterType[]).map((f) => (
                              <button
                                key={f}
                                onClick={() => setRiskFilter(f)}
                                className={`px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase transition-colors cursor-pointer ${
                                  riskFilter === f
                                    ? "bg-[#10253f] text-white dark:bg-[#EAD7B8] dark:text-[#10253f]"
                                    : "bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-black dark:hover:text-white"
                                }`}
                              >
                                {f}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Finding Cards */}
                        {filteredFindings.length === 0 ? (
                          findingsList.length === 0 ? (
                            <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 flex items-start gap-3">
                              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                              <div className="space-y-1">
                                <h5 className="text-xs font-bold text-emerald-900 dark:text-emerald-200">
                                  {lang === "EN" ? "Safe Document - 0 Detected Risks" : "Hợp Đồng Đạt Chuẩn An Toàn - 0 Điểm Rủi Ro"}
                                </h5>
                                <p className="text-xs text-emerald-800 dark:text-emerald-300 leading-relaxed">
                                  {lang === "EN"
                                    ? "The document has been audited against Vietnamese statutory standards. No penalty traps or unlawful terms were detected."
                                    : "Văn bản đã được đối chiếu quy tắc pháp lý chuẩn mực. Không phát hiện điều khoản phạt cọc phi lý hay nội dung trái luật."}
                                </p>
                              </div>
                            </div>
                          ) : (
                            <div className="p-4 text-center text-xs text-slate-400 rounded-xl bg-white dark:bg-[#0D1829] border border-slate-200 dark:border-slate-800 space-y-2">
                              <p>Không có điều khoản nào trong nhóm rủi ro này.</p>
                              <button
                                type="button"
                                onClick={() => setRiskFilter("all")}
                                className="text-xs text-[#8A6834] dark:text-[#EAD7B8] font-bold hover:underline cursor-pointer"
                              >
                                Xem tất cả các nhóm ({findingsList.length})
                              </button>
                            </div>
                          )
                        ) : (

                          filteredFindings.map((finding, idx) => {
                            const bucket = getClauseBucket(finding);
                            const isExpanded = expandedClauseIdx === idx;

                            return (
                              <div
                                key={idx}
                                className={`rounded-xl border transition-all ${
                                  isExpanded
                                    ? "border-[#8A6834] dark:border-[#EAD7B8] bg-white dark:bg-[#0D1829] shadow-md"
                                    : "border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B1424] hover:border-slate-300"
                                }`}
                              >
                                <div
                                  onClick={() =>
                                    handleSelectClause(finding, isExpanded ? -1 : idx)
                                  }
                                  className="p-3.5 flex items-start justify-between gap-3 cursor-pointer"
                                >
                                  <div className="flex items-start gap-2.5 min-w-0">
                                    <div
                                      className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold ${
                                        bucket === "high"
                                          ? "bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300"
                                          : bucket === "medium"
                                          ? "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300"
                                          : "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300"
                                      }`}
                                    >
                                      {idx + 1}
                                    </div>
                                    <div className="min-w-0">
                                      <div className="flex items-center gap-2 flex-wrap">
                                        <h5 className="text-xs font-bold text-[#10253f] dark:text-white truncate">
                                          {finding.title || `Điều khoản #${idx + 1}`}
                                        </h5>
                                        {finding.matched_term && (
                                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                                            &ldquo;{finding.matched_term}&rdquo;
                                          </span>
                                        )}
                                      </div>
                                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                                        {finding.warning || finding.analysis}
                                      </p>
                                    </div>
                                  </div>
                                  <ChevronRight
                                    className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${
                                      isExpanded ? "rotate-90" : ""
                                    }`}
                                  />
                                </div>

                                {isExpanded && (
                                  <div className="px-4 pb-4 pt-1 border-t border-slate-100 dark:border-[#1A2D47] space-y-3">
                                    {finding.clause_text && (
                                      <div className="p-2.5 rounded-lg bg-[#FAF5ED] dark:bg-[#080E1A] border border-[#EAD7B8]/60 dark:border-[#1E3558]">
                                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                                          {lang === "EN"
                                            ? "Original Excerpt:"
                                            : "Trích đoạn điều khoản gốc:"}
                                        </span>
                                        <p className="text-xs font-mono text-[#10253f] dark:text-slate-200">
                                          {finding.clause_text}
                                        </p>
                                      </div>
                                    )}

                                    {(finding.reference || finding.law_reference) && (
                                      <div className="p-2.5 rounded-lg bg-[#eafbf7] dark:bg-emerald-950/30 border border-[#b7f6e5] dark:border-emerald-800/50">
                                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#159f7b] dark:text-emerald-300 flex items-center gap-1 mb-1">
                                          <ShieldCheck className="w-3.5 h-3.5" />
                                          {lang === "EN"
                                            ? "Vietnam Statutory Ground:"
                                            : "Căn cứ pháp luật Việt Nam:"}
                                        </span>
                                        <p className="text-xs text-slate-700 dark:text-slate-200">
                                          {finding.reference || finding.law_reference}
                                        </p>
                                      </div>
                                    )}

                                    {/* Action button: Ask Copilot about this clause */}
                                    <div className="pt-1 flex items-center justify-end">
                                      <button
                                        onClick={() => handleAskAiAboutClause(finding)}
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FAF5ED] dark:bg-[#162744] hover:bg-[#EAD7B8] dark:hover:bg-[#1E3558] text-[#8A6834] dark:text-[#EAD7B8] hover:text-[#10253f] border border-[#EAD7B8] dark:border-[#2C4875] text-xs font-bold transition-all cursor-pointer shadow-2xs"
                                      >
                                        <Sparkles className="w-3.5 h-3.5" />
                                        <span>
                                          {lang === "EN"
                                            ? "Ask Copilot for Negotiation Script"
                                            : "Hỏi AI Copilot cách đàm phán điều khoản này"}
                                        </span>
                                      </button>
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })
                        )}
                      </div>
                    )}
                  </>
                ) : null}
              </div>
            )}

            {/* Mode 2: Side-by-Side Compare */}
            {rightPaneTab === "compare" && (
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                <div className="p-4 rounded-xl bg-white dark:bg-[#0D1829] border border-slate-200 dark:border-slate-800 space-y-3">
                  <h4 className="text-xs font-bold text-[#10253f] dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                    <Scale className="w-4 h-4 text-[#8A6834] dark:text-[#EAD7B8]" />
                    {lang === "EN" ? "Select Contract to Compare With" : "Chọn hợp đồng để đối chiếu"}
                  </h4>

                  {/* Fallback if user only has 1 contract (L8) */}
                  {compareTargetCandidates.length === 0 ? (
                    <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-xs text-amber-800 dark:text-amber-200 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
                      <span>
                        {lang === "EN"
                          ? "You only have 1 contract in your account. Please upload another contract to compare differences."
                          : "Bạn chỉ có 1 hợp đồng trong tài khoản. Hãy tải thêm 1 hợp đồng khác bằng nút Tải Hợp Đồng Mới để bắt đầu đối chiếu."}
                      </span>
                    </div>
                  ) : (
                    <div className="flex flex-col sm:flex-row gap-2">
                      <select
                        value={compareTargetId}
                        onChange={(e) => setCompareTargetId(e.target.value)}
                        className="flex-1 px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-[#080E1A] border border-slate-200 dark:border-slate-700 text-[#10253f] dark:text-white"
                      >
                        <option value="">
                          {lang === "EN" ? "-- Choose second contract --" : "-- Chọn hợp đồng thứ 2 --"}
                        </option>
                        {compareTargetCandidates.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.original_filename} ({c.contract_type || "Khác"})
                          </option>
                        ))}
                      </select>
                      <button
                        onClick={handleRunComparison}
                        disabled={!compareTargetId || compareLoading}
                        className="px-4 py-2 bg-[#10253f] dark:bg-[#EAD7B8] hover:bg-[#1E3A5F] dark:hover:bg-[#dfc59f] text-white dark:text-[#10253f] text-xs font-bold rounded-xl transition-all disabled:opacity-50 cursor-pointer"
                      >
                        {compareLoading ? (
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        ) : lang === "EN" ? (
                          "Compare Now"
                        ) : (
                          "Bắt đầu đối chiếu"
                        )}
                      </button>
                    </div>
                  )}
                </div>

                {comparisonResult && (
                  <div className="space-y-4">
                    <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/40 border border-emerald-300 dark:border-emerald-800/60">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300 block mb-1">
                        {lang === "EN" ? "Safer Choice Recommendation:" : "Hợp đồng an toàn hơn nên ký:"}
                      </span>
                      <h5 className="text-sm font-bold text-emerald-900 dark:text-emerald-100">
                        {comparisonResult.safer_filename}
                      </h5>
                      <p className="text-xs text-emerald-800 dark:text-emerald-200 mt-1">
                        {lang === "EN"
                          ? comparisonResult.recommendation_en
                          : comparisonResult.recommendation_vi}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3.5 rounded-xl bg-white dark:bg-[#0D1829] border border-slate-200 dark:border-slate-800 space-y-2">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">
                          Hợp đồng hiện tại
                        </span>
                        <h6 className="text-xs font-bold truncate">
                          {comparisonResult.contract_a.original_filename}
                        </h6>
                        <div className="flex items-center gap-2">
                          <span className="text-xl font-black">
                            {Math.round(comparisonResult.contract_a.risk_score)}
                          </span>
                          <span className="text-[10px] text-slate-400">/100 điểm rủi ro</span>
                        </div>
                      </div>

                      <div className="p-3.5 rounded-xl bg-white dark:bg-[#0D1829] border border-slate-200 dark:border-slate-800 space-y-2">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">
                          Hợp đồng đối chiếu
                        </span>
                        <h6 className="text-xs font-bold truncate">
                          {comparisonResult.contract_b.original_filename}
                        </h6>
                        <div className="flex items-center gap-2">
                          <span className="text-xl font-black">
                            {Math.round(comparisonResult.contract_b.risk_score)}
                          </span>
                          <span className="text-[10px] text-slate-400">/100 điểm rủi ro</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </section>
        </div>
      </div>

      {/* ══════════ CONTRACT SELECTOR MODAL ══════════ */}
      {isContractSelectorOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs cursor-pointer"
          onClick={() => setIsContractSelectorOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-[#0B1424] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden cursor-default select-text"
          >
            {/* Modal Header */}
            <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-[#FAF5ED]/50 dark:bg-[#0D1829]">
              <div className="flex items-center gap-2">
                <FolderOpen className="w-5 h-5 text-[#8A6834] dark:text-[#EAD7B8]" />
                <h3 className="text-sm font-bold text-[#10253f] dark:text-white">
                  {lang === "EN" ? "Saved Contracts Explorer" : "Danh Sách Hợp Đồng Của Bạn"}
                </h3>
              </div>
              <button
                onClick={() => setIsContractSelectorOpen(false)}
                className="text-slate-400 hover:text-black dark:hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Search Bar */}
            <div className="p-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-[#080E1A]">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder={
                    lang === "EN"
                      ? "Search contracts by filename or category..."
                      : "Tìm kiếm hợp đồng theo tên file hoặc loại hình..."
                  }
                  value={contractSearchQuery}
                  onChange={(e) => setContractSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-white dark:bg-[#0D1829] border border-slate-200 dark:border-slate-700 text-[#10253f] dark:text-white focus:outline-none focus:border-[#EAD7B8]"
                />
              </div>
            </div>

            {/* Contracts List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
              {filteredExplorerContracts.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-xs">
                  {lang === "EN"
                    ? "No contracts found. Upload one to get started."
                    : "Không tìm thấy hợp đồng nào. Hãy tải lên hợp đồng mới để bắt đầu."}
                </div>
              ) : (
                filteredExplorerContracts.map((c) => {
                  const isCurrent = c.id === activeContractId;
                  return (
                    <div
                      key={c.id}
                      onClick={() => loadContract(c.id)}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                        isCurrent
                          ? "bg-[#FAF5ED] dark:bg-[#162744] border-[#EAD7B8] shadow-xs"
                          : "bg-white dark:bg-[#0D1829] border-slate-200 dark:border-slate-800 hover:border-[#8A6834] dark:hover:border-[#EAD7B8]"
                      }`}
                    >
                      <div className="min-w-0 space-y-1">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-[#8A6834] dark:text-[#EAD7B8] shrink-0" />
                          <h5 className="font-bold text-xs text-[#10253f] dark:text-white truncate">
                            {c.original_filename}
                          </h5>
                          {c.contract_type && (
                            <span className="px-2 py-0.2 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                              {c.contract_type}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-3 text-[11px] text-slate-400">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-[#8A6834]" />
                            {formatDateTime(c.created_at, lang === "EN")}
                          </span>
                          <span>•</span>
                          <span>{formatBytes(c.file_size_bytes)}</span>
                          <span>•</span>
                          <span className="font-mono">
                            SHA-256: {c.sha256_hash.slice(0, 8)}...
                          </span>
                        </div>
                      </div>

                      <div className="shrink-0">
                        {isCurrent ? (
                          <span className="px-2.5 py-1 rounded-lg bg-[#EAD7B8] text-[#10253f] text-[11px] font-black">
                            Đang mở
                          </span>
                        ) : (
                          <button className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-[#10253f] hover:text-white dark:bg-slate-800 dark:hover:bg-[#EAD7B8] dark:hover:text-[#10253f] text-xs font-bold transition-colors">
                            Mở
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        initialTab={authModalTab}
        onClose={() => setAuthModalOpen(false)}
      />
    </div>
  );

  // Helper render Copilot Input Bar
  function renderCopilotInputBar() {
    return (
      <div className="p-2.5 bg-white dark:bg-[#0B1528] border-t border-[#D8E3EF] dark:border-[#1E3354] flex flex-col gap-2 shrink-0">
        {/* Preset chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 no-scrollbar">
          {[
            "Đàm phán tiền cọc",
            "Điều khoản bảo mật",
            "Chấm dứt hợp đồng",
            "Mức phạt vi phạm",
          ].map((pill, i) => (
            <button
              key={i}
              type="button"
              onClick={() => handleSendChatMessage(pill)}
              className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#FAF5ED] dark:bg-[#102038] border border-[#EAD7B8] dark:border-[#1E3558] text-[#8A6834] dark:text-[#CAD8ED] hover:bg-[#EAD7B8] hover:text-[#10253f] shrink-0 cursor-pointer transition-colors whitespace-nowrap"
            >
              {pill}
            </button>
          ))}
        </div>

        {/* Attached file preview chip */}
        {attachedFile && (
          <div className="flex items-center justify-between px-2.5 py-1.5 rounded-xl bg-[#FAF5ED] dark:bg-[#162744] border border-[#EAD7B8] dark:border-[#2C4875] text-xs font-bold text-[#8A6834] dark:text-[#EAD7B8]">
            <div className="flex items-center gap-2 truncate">
              <Paperclip className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate max-w-[220px]">{attachedFile.name}</span>
              <span className="text-[10px] opacity-70">({formatBytes(attachedFile.size)})</span>
              {isUploadingAttachment && (
                <span className="flex items-center gap-1 text-[10px] text-amber-600 dark:text-amber-300">
                  <RefreshCw className="w-2.5 h-2.5 animate-spin" />
                  <span>Đang trích xuất dữ liệu...</span>
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={() => setAttachedFile(null)}
              className="text-slate-400 hover:text-red-500 p-0.5 rounded cursor-pointer"
              title="Gỡ file đính kèm"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Input strip */}
        <div className="flex items-center gap-2">
          {canAttachChatFiles ? (
            <label
              className="p-1.5 rounded-lg border border-slate-200 dark:border-[#1E3558] text-slate-500 hover:text-black dark:hover:text-white cursor-pointer shrink-0"
              title="Đính kèm tài liệu"
            >
              <Paperclip className="w-4 h-4" />
              <input
                type="file"
                className="hidden"
                accept=".pdf,.docx,.doc,.txt,.jpg,.jpeg,.png,.webp"
                onChange={(e) =>
                  e.target.files && setAttachedFile(e.target.files[0])
                }
              />
            </label>
          ) : (
            <Link
              href="/upgrade"
              className="p-1.5 rounded-lg text-slate-300 dark:text-slate-600 shrink-0"
              title="Đính kèm file khả dụng ở gói Medium / Pro"
            >
              <Lock className="w-3.5 h-3.5" />
            </Link>
          )}

          <input
            type="text"
            placeholder={
              isDailyLimitReached
                ? lang === "EN"
                  ? "Daily AI limit reached. Please upgrade to continue."
                  : "Hết hạn mức hỏi AI hôm nay. Vui lòng nâng cấp gói."
                : lang === "EN"
                ? "Ask Copilot: 'Review deposit rules according to Civil Code'..."
                : "Hỏi Copilot: 'Kiểm tra tiền cọc', 'Viết lại điều khoản phạt'..."
            }
            value={chatInput}
            disabled={isDailyLimitReached || isUploadingAttachment}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSendChatMessage();
              }
            }}
            className="flex-1 px-3 py-1.5 rounded-xl text-xs bg-slate-50 dark:bg-[#070D18] border border-slate-200 dark:border-[#1E3558] text-[#10253f] dark:text-white focus:outline-none focus:border-[#EAD7B8] disabled:opacity-50"
          />

          <button
            type="button"
            onClick={() => handleSendChatMessage()}
            disabled={
              (!chatInput.trim() && !attachedFile) ||
              isAiTyping ||
              isUploadingAttachment ||
              isDailyLimitReached
            }
            className="p-2 rounded-xl bg-[#10253f] hover:bg-[#1E3A5F] dark:bg-[#EAD7B8] dark:hover:bg-[#dfc59f] text-white dark:text-[#10253f] disabled:opacity-40 transition-colors cursor-pointer shrink-0"
          >
            {isUploadingAttachment ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Send className="w-3.5 h-3.5" />
            )}
          </button>
        </div>


        {/* Daily limit badge / upgrade link if limit reached (L9) */}
        {isDailyLimitReached && (
          <div className="flex items-center justify-between text-[11px] font-bold text-amber-600 dark:text-amber-400 px-1">
            <span>Đã dùng hết {dailyUsed}/{dailyLimit} lượt hôm nay</span>
            <Link href="/upgrade" className="underline hover:text-amber-800">
              Nâng cấp gói ngay →
            </Link>
          </div>
        )}
      </div>
    );
  }
}

export default function LegalStudioPage() {
  return (
    <Suspense
      fallback={
        <div className="h-screen flex items-center justify-center bg-[#F6F8FA] dark:bg-[#080E1A]">
          <div className="w-8 h-8 rounded-full border-2 border-[#10253f] dark:border-[#EAD7B8] border-t-transparent animate-spin" />
        </div>
      }
    >
      <LegalStudioInner />
    </Suspense>
  );
}
