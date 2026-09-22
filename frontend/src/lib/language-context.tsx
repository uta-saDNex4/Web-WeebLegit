'use client';
import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'VI' | 'EN';

const translations: Record<Language, Record<string, string>> = {
  VI: {
    // Navbar
    'nav.templates': 'Mẫu hợp đồng',
    'nav.process': 'Quy trình',
    'nav.sources': 'Nguồn luật',
    'nav.login': 'Đăng nhập',
    'nav.register': 'Đăng ký',
    'nav.try_free': 'Dùng thử miễn phí',
    'nav.platform_sub': 'Nền tảng Công nghệ Pháp lý',
    'nav.welcome': 'Xin chào,',
    'nav.verify_contract': 'Kiểm tra hợp đồng',
    'nav.logout': 'Đăng xuất',
    'nav.theme_light': 'Chuyển sang chế độ Sáng',
    'nav.theme_dark': 'Chuyển sang chế độ Tối',

    // Floating Nav
    'dock.home': 'Trang chủ',
    'dock.templates': 'Mẫu hợp đồng',
    'dock.process': 'Quy trình minh bạch',
    'dock.sources': 'Nguồn luật tra cứu',
    'dock.scan': 'Quét hợp đồng',
    'dock.history': 'Lịch sử xác thực',
    'dock.toggle_lang': 'Đổi ngôn ngữ',
    'dock.to_top': 'Lên đầu trang',

    // Hero
    'hero.badge': 'XÁC THỰC HỢP ĐỒNG CHO SINH VIÊN',
    'hero.title_p1': 'Ký đúng điều.',
    'hero.title_p2': 'Tự tin bắt đầu.',
    'hero.subtitle':
      'Đọc hiểu điều khoản, đối chiếu nguồn tin cậy và hỏi AI bằng ngôn ngữ dễ hiểu — trước khi bạn đặt bút ký.',
    'hero.btn_check': 'Kiểm tra hợp đồng',
    'hero.btn_templates': 'Xem mẫu hợp đồng',
    'hero.disclaimer':
      'Không thay thế tư vấn pháp lý — giúp bạn biết điều cần hỏi.',
    'hero.card_file': 'Hợp đồng thực tập.pdf',
    'hero.card_sub': 'Tài liệu mẫu sinh viên • 3 trang',
    'hero.card_verified': 'Đã kiểm tra',
    'hero.card_title': 'THỎA THUẬN THỰC TẬP',
    'hero.card_view': 'Xem chi tiết',
    'hero.warn_badge': 'Điều khoản cần làm rõ',
    'hero.warn_title': 'Điều khoản thử việc không nêu rõ phụ cấp.',
    'hero.warn_ai': 'AI đã tìm thấy 2 điểm bạn nên hỏi lại trước khi ký.',

    // Stats
    'stats.s1_val': '0.02s',
    'stats.s1_lbl': 'Tốc độ băm SHA-256 toàn vẹn',
    'stats.s2_val': '100%',
    'stats.s2_lbl': 'Quy chuẩn pháp luật Việt Nam',
    'stats.s3_val': '50.000+',
    'stats.s3_lbl': 'Điều khoản hợp đồng đã rà soát',
    'stats.s4_val': '256-bit',
    'stats.s4_lbl': 'Bảo mật dữ liệu cấp ngân hàng',

    // Templates
    'tpl.badge': 'THƯ VIỆN CHUẨN PHÁP LÝ',
    'tpl.title': 'Mẫu Hợp Đồng An Toàn & Chuẩn Mực',
    'tpl.subtitle':
      'Bộ mẫu được biên soạn kỹ lưỡng, ghi chú rõ ràng các điều khoản dễ bị chèn ép để bạn nhận diện rủi ro ngay từ đầu.',
    'tpl.tab_all': 'Tất cả mẫu',
    'tpl.tab_labor': 'Lao động & Thực tập',
    'tpl.tab_housing': 'Thuê trọ & Căn hộ',
    'tpl.tab_freelance': 'Freelance & Dịch vụ',
    'tpl.risk_badge': 'điều khoản cần lưu ý',
    'tpl.btn_detail': 'Xem chi tiết điều khoản',

    // Process
    'proc.badge': '3 BƯỚC ĐƠN GIẢN',
    'proc.title': '3 Bước Rất Dễ Để Kiểm Tra Hợp Đồng',
    'proc.subtitle':
      'AI tự động phát hiện bẫy gài và hướng dẫn bạn cách bảo vệ quyền lợi chính đáng của mình.',
    'proc.btn_start': 'Kiểm tra hợp đồng ngay',
    'proc.s1_tag': 'BƯỚC 1',
    'proc.s1_title': '1. Tải Hợp Đồng Lên',
    'proc.s1_desc':
      'Chọn file hợp đồng (PDF, Word, Ảnh). AI sẽ đọc nhanh và tách các điều khoản quan trọng.',
    'proc.s1_phase': 'Bước 1 / 3',
    'proc.s2_tag': 'BƯỚC 2',
    'proc.s2_title': '2. AI Tự Động Bắt Lỗi & Bẫy',
    'proc.s2_desc':
      'Đối chiếu ngay với luật Việt Nam để tìm xem có điều khoản nào vô lý, ép uổng hay làm khó bạn không.',
    'proc.s2_phase': 'Bước 2 / 3',
    'proc.s3_tag': 'BƯỚC 3',
    'proc.s3_title': '3. Xem Lời Khuyên & Mẹo Đàm Phán',
    'proc.s3_desc':
      'Nhận bảng tổng hợp dễ hiểu, kèm sẵn kịch bản đàm phán khéo léo để bạn đề nghị sửa lại hợp đồng.',
    'proc.s3_phase': 'Bước 3 / 3',
    'proc.standardized': 'Chuẩn luật',

    // Legal References
    'legal.badge': 'CĂN CỨ PHÁP LUẬT',
    'legal.title': 'Luật Pháp Bảo Vệ Bạn Như Thế Nào?',
    'legal.subtitle':
      'Mọi lời khuyên đều dựa trên đúng các điều luật đang có hiệu lực tại Việt Nam, nói có sách mách có chứng.',

    // CTA
    'cta.badge': 'CĂN CỨ PHÁP LÝ & BẢO MẬT ĐÃ CHỨNG THỰC',
    'cta.title': 'Xác Thực Tính Pháp Lý & Toàn Vẹn Của Hợp Đồng',
    'cta.subtitle':
      'Hệ thống đối chiếu trực tiếp theo Bộ luật Lao động (Luật số 45/2019/QH14), Bộ luật Dân sự (Luật số 91/2015/QH13) và Luật Nhà ở (Luật số 27/2023/QH15). Xác thực tính toàn vẹn độc lập bằng thuật toán mã băm SHA-256.',
    'cta.c1': 'Căn cứ Bộ luật Lao động 2019, Bộ luật Dân sự 2015 & Luật Nhà ở 2023',
    'cta.c2': 'Mã băm SHA-256 kiểm tra toàn vẹn byte gốc (FIPS 180-4)',
    'cta.c3': 'Tự hủy dữ liệu tạm sau phiên quét, không lưu trữ tệp',
    'cta.btn': 'Tải lên đối chiếu hợp đồng — Miễn phí',

    // Floating AI
    'ai.title': 'Trợ lý AI WeebLegit',
    'ai.subtitle': 'Sẵn sàng giải đáp & đối chiếu luật',
    'ai.initial_msg':
      'Xin chào! Tôi là Trợ lý Pháp lý WeebLegit. Bạn có thắc mắc gì về hợp đồng thực tập, việc làm thêm hay thuê phòng trọ không?',
    'ai.placeholder': 'Hỏi về điều khoản, lương, tiền cọc...',
    'ai.analyzing': 'AI đang phân tích điều khoản...',
    'ai.q1': 'Điều khoản chi phí đào tạo có đúng luật?',
    'ai.q2': 'Chủ nhà giữ cọc nếu dọn sớm thì sao?',
    'ai.q3': 'Lương thử việc tối thiểu là bao nhiêu?',
  },
  EN: {
    // Navbar
    'nav.templates': 'Templates',
    'nav.process': 'Process',
    'nav.sources': 'Legal Sources',
    'nav.login': 'Log In',
    'nav.register': 'Sign Up',
    'nav.try_free': 'Try for Free',
    'nav.platform_sub': 'Legal Tech Platform',
    'nav.welcome': 'Welcome,',
    'nav.verify_contract': 'Verify Contract',
    'nav.logout': 'Log Out',
    'nav.theme_light': 'Switch to Light Mode',
    'nav.theme_dark': 'Switch to Dark Mode',

    // Floating Nav
    'dock.home': 'Home',
    'dock.templates': 'Contract Templates',
    'dock.process': 'Transparent Process',
    'dock.sources': 'Legal References',
    'dock.scan': 'Verify Contract',
    'dock.history': 'Verification Logs',
    'dock.toggle_lang': 'Switch Language',
    'dock.to_top': 'Back to Top',

    // Hero
    'hero.badge': 'CONTRACT VERIFICATION FOR STUDENTS',
    'hero.title_p1': 'Sign with confidence.',
    'hero.title_p2': 'Begin with peace of mind.',
    'hero.subtitle':
      'Understand every clause, cross-check trusted statutes, and ask AI in plain terms — before putting pen to paper.',
    'hero.btn_check': 'Verify Contract',
    'hero.btn_templates': 'Browse Templates',
    'hero.disclaimer':
      'Not a substitute for official legal counsel — helps you ask the right questions.',
    'hero.card_file': 'Internship Agreement.pdf',
    'hero.card_sub': 'Sample Student Document • 3 pages',
    'hero.card_verified': 'Verified',
    'hero.card_title': 'INTERNSHIP AGREEMENT',
    'hero.card_view': 'View Details',
    'hero.warn_badge': 'Clause Needs Clarification',
    'hero.warn_title': 'Probation clause does not specify allowance.',
    'hero.warn_ai': 'AI found 2 critical points you should clarify before signing.',

    // Stats
    'stats.s1_val': '0.02s',
    'stats.s1_lbl': 'SHA-256 Integrity Hashing Speed',
    'stats.s2_val': '100%',
    'stats.s2_lbl': 'Vietnam Legal Compliance',
    'stats.s3_val': '50,000+',
    'stats.s3_lbl': 'Contract Clauses Audited',
    'stats.s4_val': '256-bit',
    'stats.s4_lbl': 'Bank-Grade Data Encryption',

    // Templates
    'tpl.badge': 'STANDARD LEGAL LIBRARY',
    'tpl.title': 'Safe & Standard Contract Templates',
    'tpl.subtitle':
      'Carefully curated templates highlighting common traps and unfair clauses so you identify risks immediately.',
    'tpl.tab_all': 'All Templates',
    'tpl.tab_labor': 'Work & Internship',
    'tpl.tab_housing': 'Housing & Rent',
    'tpl.tab_freelance': 'Freelance & Services',
    'tpl.risk_badge': 'clauses to review',
    'tpl.btn_detail': 'View Clause Details',

    // Process
    'proc.badge': 'TRANSPARENT PROCESS',
    'proc.title': '3 Steps to Transparent Verification',
    'proc.subtitle':
      'Combining immutable cryptography and AI legal analysis to protect your legitimate rights.',
    'proc.btn_start': 'Start Verification Process',
    'proc.s1_tag': 'BYTE STREAM EXTRACTION',
    'proc.s1_title': '1. Upload & Extract Data',
    'proc.s1_desc':
      'Upload your contract (PDF, DOCX). The system safely parses raw byte streams and analyzes clauses in isolation.',
    'proc.s1_phase': 'Phase 1 of 3',
    'proc.s2_tag': 'CRYPTOGRAPHIC CHECKSUM',
    'proc.s2_title': '2. Immutable SHA-256 Hashing',
    'proc.s2_desc':
      'Calculates an exact 64-hex SHA-256 digital fingerprint directly from file bytes, logged for tamper-proof audit trails.',
    'proc.s2_phase': 'Phase 2 of 3',
    'proc.s3_tag': 'STATUTORY ALIGNMENT',
    'proc.s3_title': '3. Legal Alignment & Report',
    'proc.s3_desc':
      'AI cross-checks against the Labor Code, Civil Code, and Housing Law to flag risks and generate polite negotiation scripts.',
    'proc.s3_phase': 'Phase 3 of 3',
    'proc.standardized': 'Standardized',

    // Legal References
    'legal.badge': 'LEGAL DATABASE',
    'legal.title': 'Legal Grounds & Benchmark Reference',
    'legal.subtitle':
      'Every risk assessment is transparently traced back to official Vietnamese statutes and regulations.',

    // CTA
    'cta.badge': 'AUTHENTICATED LEGAL & INTEGRITY STANDARDS',
    'cta.title': 'Verify Contract Legality & Integrity Before Signing',
    'cta.subtitle':
      'Referenced directly against the Labor Code (Law 45/2019/QH14), Civil Code (Law 91/2015/QH13), and Housing Law (Law 27/2023/QH15). File integrity verified via independent SHA-256 byte-stream checksums.',
    'cta.c1': 'Labor Code 2019, Civil Code 2015 & Housing Law 2023 statutory compliance',
    'cta.c2': 'SHA-256 byte-stream cryptographic integrity (FIPS 180-4)',
    'cta.c3': 'Zero file retention policy with automatic temporary buffer wipe',
    'cta.btn': 'Upload & Verify Contract — Free',

    // Floating AI
    'ai.title': 'WeebLegit AI Assistant',
    'ai.subtitle': 'Ready to answer & reference the law',
    'ai.initial_msg':
      'Hello! I am your WeebLegit Legal AI Assistant. Do you have any questions about internship, part-time work, or rental contracts?',
    'ai.placeholder': 'Ask about clauses, salary, deposit...',
    'ai.analyzing': 'AI is analyzing statutory clauses...',
    'ai.q1': 'Is training compensation clause legal?',
    'ai.q2': 'Can landlord withhold deposit on early move-out?',
    'ai.q3': 'What is the statutory probation wage?',
  },
};

interface LanguageContextType {
  lang: Language;
  toggleLang: () => void;
  setLang: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  lang: 'VI',
  toggleLang: () => {},
  setLang: () => {},
  t: (k: string) => k,
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [lang, setLangState] = useState<Language>('VI');

  useEffect(() => {
    try {
      const savedLang = localStorage.getItem('lang') as Language;
      if (savedLang === 'EN' || savedLang === 'VI') {
        setLangState(savedLang);
      }
    } catch {}
  }, []);

  const setLang = (newLang: Language) => {
    setLangState(newLang);
    try {
      localStorage.setItem('lang', newLang);
    } catch {}
  };

  const toggleLang = () => {
    setLang(lang === 'VI' ? 'EN' : 'VI');
  };

  const t = (key: string): string => {
    return translations[lang]?.[key] ?? translations['VI']?.[key] ?? key;
  };

  return (
    <LanguageContext.Provider value={{ lang, toggleLang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
