export interface ContractTemplate {
  id: string;
  title: string;
  subtitle: string;
  category: "work" | "internship" | "freelance" | "housing";
  description: string;
  tags: string[];
  riskCount: number;
  clauses: {
    title: string;
    content: string;
    isRisky?: boolean;
    riskReason?: string;
    advice?: string;
    lawReference?: string;
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
  iconType: "labor" | "housing" | "storage";
}
