export interface TemplateSourceLink {
  title: string;
  url: string;
  note?: string;
}

export interface ContractTemplate {
  id: string;
  title: string;
  subtitle: string;
  category: "work" | "internship" | "freelance" | "housing" | "education" | "finance";
  description: string;
  tags: string[];
  riskCount: number;
  featured?: boolean;
  sourceUrls?: TemplateSourceLink[];
  clauses: {
    title: string;
    content: string;
    isRisky?: boolean;
    clauseRiskScore?: number;
    riskReason?: string;
    advice?: string;
    lawReference?: string;
    lawReferenceUrl?: string;
  }[];
}

export interface VerificationStep {
  number: string;
  title: string;
  description: string;
  iconName: string;
}

export interface ChatMessage {
  id: string;
  sender: "user" | "ai";
  text: string;
  timestamp: string;
  tag?: string;
  suggestion?: string;
  lawCitation?: string;
}

export interface LegalSource {
  id: string;
  title: string;
  description: string;
  articles: string[];
  linkText: string;
  url?: string;
  iconType: "labor" | "housing" | "storage" | "civil" | "security";
  codeBadge?: string;
  actionType?: "modal" | "checker";
}
