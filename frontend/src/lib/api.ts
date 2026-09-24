/**
 * API client layer — tập trung tất cả lời gọi đến FastAPI backend.
 * Base URL được lấy từ biến môi trường NEXT_PUBLIC_API_URL.
 */

export function getBaseUrl(): string {
  const envUrl = process.env.NEXT_PUBLIC_API_URL?.trim();

  if (typeof window !== 'undefined') {
    // Nếu biến môi trường là URL từ xa (như localtunnel, ngrok, hoặc domain thật), ưu tiên sử dụng
    if (envUrl && !envUrl.includes('localhost') && !envUrl.includes('127.0.0.1')) {
      return envUrl;
    }
    // Nếu truy cập từ máy khác qua IP LAN hoặc hostname khác localhost/127.0.0.1
    if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
      return `${window.location.protocol}//${window.location.hostname}:8000`;
    }
    if (envUrl) return envUrl;
    return `${window.location.protocol}//${window.location.hostname}:8000`;
  }

  return envUrl || 'http://localhost:8000';
}

// ─── Token helpers ────────────────────────────────────────────────────────────

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('access_token');
}

export function setToken(token: string): void {
  localStorage.setItem('access_token', token);
}

export function removeToken(): void {
  localStorage.removeItem('access_token');
}

// ─── Base fetch wrapper ───────────────────────────────────────────────────────

async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
  auth = true,
): Promise<T> {
  const baseUrl = getBaseUrl();
  const tunnelHeader: Record<string, string> = baseUrl.includes('.loca.lt')
    ? { 'bypass-tunnel-reminder': 'true' }
    : {};

  const headers: Record<string, string> = {
    ...tunnelHeader,
    ...(options.headers as Record<string, string>),
  };

  if (auth) {
    const token = getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${baseUrl}${path}`, { ...options, headers });

  if (!res.ok) {
    let message = `HTTP ${res.status}`;
    try {
      const body = await res.json();
      if (typeof body?.detail === 'string') {
        message = body.detail;
      } else if (Array.isArray(body?.detail)) {
        message = body.detail
          .map((item: any) => item?.msg ?? JSON.stringify(item))
          .join(', ');
      } else if (body?.message) {
        message = typeof body.message === 'string' ? body.message : JSON.stringify(body.message);
      } else if (body?.detail && typeof body.detail === 'object') {
        message = JSON.stringify(body.detail);
      }
    } catch {
      // ignore parse error
    }
    throw new Error(message);
  }

  // 204 No Content
  if (res.status === 204) return undefined as T;

  return res.json() as Promise<T>;
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface UserResponse {
  id: string;
  email: string;
  full_name: string | null;
  role: string;
  is_active: boolean;
  created_at: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
}

export interface ContractResponse {
  id: string;
  original_filename: string;
  mime_type: string;
  file_size_bytes: number;
  sha256_hash: string;
  contract_type: string | null;
  status: string;
  created_at: string;
}

export interface VerificationResponse {
  contract_id: string;
  expected_sha256: string;
  actual_sha256: string;
  result: 'matched' | 'mismatched' | 'failed';
  verification_log_id: string;
  duration_ms: number | null;
  risk_score?: number;
  risk_label?: string;
  ai_overview?: string;
  ai_findings?: AiFindingItem[];
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export async function register(
  email: string,
  password: string,
  full_name?: string,
): Promise<UserResponse> {
  return apiFetch<UserResponse>(
    '/api/auth/register',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, full_name }),
    },
    false,
  );
}

export async function login(
  email: string,
  password: string,
): Promise<TokenResponse> {
  const data = await apiFetch<TokenResponse>(
    '/api/auth/login',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    },
    false,
  );
  setToken(data.access_token);
  return data;
}

export async function getMe(): Promise<UserResponse> {
  return apiFetch<UserResponse>('/api/auth/me');
}

export function logout(): void {
  removeToken();
}

// ─── Contracts ────────────────────────────────────────────────────────────────

export async function uploadContract(
  file: File,
  contractType?: string,
): Promise<ContractResponse> {
  const formData = new FormData();
  formData.append('file', file);

  const headers: Record<string, string> = {};
  if (contractType) headers['contract-type'] = contractType;

  return apiFetch<ContractResponse>('/api/contracts', {
    method: 'POST',
    body: formData,
    headers,
  });
}

export async function verifyContract(
  contractId: string,
  file?: File,
): Promise<VerificationResponse> {
  if (file) {
    const formData = new FormData();
    formData.append('file', file);
    return apiFetch<VerificationResponse>(
      `/api/contracts/${contractId}/verify`,
      { method: 'POST', body: formData },
    );
  }
  return apiFetch<VerificationResponse>(
    `/api/contracts/${contractId}/verify`,
    { method: 'POST' },
  );
}

export async function getContract(contractId: string): Promise<ContractResponse> {
  return apiFetch<ContractResponse>(`/api/contracts/${contractId}`);
}

// ─── Contract List ─────────────────────────────────────────────────────────────

export interface ContractListResponse {
  items: ContractResponse[];
  total: number;
  page: number;
  limit: number;
}

export async function listContracts(params?: {
  status?: string;
  contract_type?: string;
  page?: number;
  limit?: number;
}): Promise<ContractListResponse> {
  const q = new URLSearchParams();
  if (params?.status) q.set('status', params.status);
  if (params?.contract_type) q.set('contract_type', params.contract_type);
  if (params?.page) q.set('page', String(params.page));
  if (params?.limit) q.set('limit', String(params.limit));
  const qs = q.toString() ? `?${q.toString()}` : '';
  return apiFetch<ContractListResponse>(`/api/contracts${qs}`);
}

// ─── AI Analysis Polling ───────────────────────────────────────────────────────

export interface AiFindingItem {
  risk_level: string;
  severity: 'high' | 'medium' | 'low';
  target_section: string;
  title: string;
  matched_term?: string;
  clause_text?: string;
  warning?: string;
  analysis?: string;
  reference?: string;
  law_reference?: string;
  negotiation_script?: string;
}

export interface AiAnalysisResult {
  status: 'processing' | 'completed';
  message?: string;
  risk_score?: number;
  risk_label?: string;
  overview?: string;
  ai_overview?: string;
  findings?: AiFindingItem[];
  ai_findings?: AiFindingItem[];
  summary?: string;
  contract_type?: string | null;
  district?: string | null;
  base_rent?: number | null;
}

export async function getAiAnalysis(
  contractId: string,
  logId: string,
): Promise<AiAnalysisResult> {
  const data = await apiFetch<any>(
    `/api/contracts/${contractId}/analysis?log_id=${logId}`,
  );
  if (!data) return data;

  const rawFindings: any[] = data.ai_findings || data.findings || [];
  const normalizedFindings: AiFindingItem[] = rawFindings.map((f: any) => {
    const rawLevel = String(f.risk_level || f.severity || 'medium').toLowerCase();
    const severity: 'high' | 'medium' | 'low' =
      rawLevel === 'critical' || rawLevel === 'high'
        ? 'high'
        : rawLevel === 'low'
        ? 'low'
        : 'medium';

    const targetSection =
      f.target_section ||
      f.title ||
      (f.matched_term ? `Điều khoản: ${f.matched_term}` : 'Điều khoản rủi ro');
    const warningText =
      f.warning || f.analysis || 'Cần lưu ý rà soát lại điều khoản này.';
    const refLaw =
      f.reference || f.law_reference || 'Bộ luật Dân sự 2015 & Luật Nhà ở 2023';
    const term = f.matched_term || f.clause_text || '';

    return {
      risk_level: rawLevel,
      severity,
      target_section: targetSection,
      title: f.title || targetSection,
      matched_term: term,
      clause_text: f.clause_text || term,
      warning: warningText,
      analysis: f.analysis || warningText,
      reference: refLaw,
      law_reference: f.law_reference || refLaw,
      negotiation_script: f.negotiation_script,
    };
  });

  const overviewText =
    data.ai_overview || data.overview || data.summary || '';

  return {
    ...data,
    overview: overviewText,
    ai_overview: overviewText,
    findings: normalizedFindings,
    ai_findings: normalizedFindings,
  };
}

// ─── Market Compare ────────────────────────────────────────────────────────────

export interface MarketComparisonResponse {
  contract_id: string;
  contract_type: string | null;
  district: string | null;
  price_evaluation: string;
  price_difference_percent: number | null;
  market_average: number | null;
  recommendations: string[];
}

export async function marketCompare(
  contractId: string,
  params?: { district?: string; base_rent?: number },
): Promise<MarketComparisonResponse> {
  const q = new URLSearchParams();
  if (params?.district) q.set('district', params.district);
  if (params?.base_rent != null) q.set('base_rent', String(params.base_rent));
  const qs = q.toString() ? `?${q.toString()}` : '';
  return apiFetch<MarketComparisonResponse>(
    `/api/contracts/${contractId}/market-compare${qs}`,
    { method: 'POST' },
  );
}

// ─── Verification History ──────────────────────────────────────────────────────

export interface VerificationLogResponse {
  id: string;
  contract_id: string;
  requested_by: string;
  expected_sha256: string;
  actual_sha256: string;
  result: string;
  error_code: string | null;
  error_message: string | null;
  duration_ms: number | null;
  created_at: string;
}

export async function getVerificationHistory(
  contractId: string,
): Promise<VerificationLogResponse[]> {
  return apiFetch<VerificationLogResponse[]>(
    `/api/contracts/${contractId}/verifications`,
  );
}

// ─── Clauses ───────────────────────────────────────────────────────────────────

export interface ClauseResponse {
  id: string;
  contract_id: string;
  clause_type: string;
  clause_order: number;
  title: string | null;
  content: string | null;
  dynamic_metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export async function getClauses(contractId: string): Promise<ClauseResponse[]> {
  return apiFetch<ClauseResponse[]>(`/api/contracts/${contractId}/clauses`);
}

// ─── Upload Image ──────────────────────────────────────────────────────────────

export interface ContractImageResponse {
  id: string;
  uploaded_by: string;
  contract_id: string | null;
  original_filename: string;
  mime_type: string;
  file_size_bytes: number;
  sha256_hash: string;
  created_at: string;
  updated_at: string;
}

export async function uploadContractImage(
  file: File,
  contractId?: string,
): Promise<ContractImageResponse> {
  const formData = new FormData();
  formData.append('file', file);
  const qs = contractId ? `?contract_id=${contractId}` : '';
  return apiFetch<ContractImageResponse>(`/api/contracts/upload-image${qs}`, {
    method: 'POST',
    body: formData,
  });
}

// ─── Update User Profile ───────────────────────────────────────────────────────

export async function updateMe(payload: {
  full_name?: string | null;
  password?: string | null;
}): Promise<UserResponse> {
  return apiFetch<UserResponse>('/api/auth/me', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

// ─── AI Chat ───────────────────────────────────────────────────────────────────

export interface AiChatMessage {
  role: 'user' | 'model' | 'assistant';
  content: string;
}

export interface AiChatResponse {
  reply: string;
  answer: string;
  citations: string[];
  citation: string | null;
  negotiation_script?: string | null;
  source?: string;
  model?: string | null;
}

export async function aiChat(
  question: string,
  contractContext?: string,
  history?: AiChatMessage[],
): Promise<AiChatResponse> {
  return apiFetch<AiChatResponse>(
    '/api/ai/chat',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: question,
        question: question,
        contract_context: contractContext,
        history: history?.map((h) => ({
          role: h.role === 'model' || h.role === 'assistant' ? 'model' : 'user',
          content: h.content,
        })),
      }),
    },
    false, // không cần auth — public endpoint
  );
}

// ─── Admin API ─────────────────────────────────────────────────────────────────

export interface AdminStatsResponse {
  total_users: number;
  total_contracts: number;
  verified_contracts: number;
  mismatch_contracts: number;
  total_verifications: number;
  total_risk_rules: number;
  total_legal_references: number;
}

export interface AdminUserResponse {
  id: string;
  email: string;
  full_name: string | null;
  role: string;
  is_active: boolean;
  created_at: string;
}

export interface AdminContractItem {
  id: string;
  uploader_email: string;
  original_filename: string;
  file_size_bytes: number;
  sha256_hash: string;
  contract_type: string | null;
  status: string;
  created_at: string;
}

export interface AdminLogItem {
  id: string;
  contract_id: string;
  contract_filename: string;
  requested_by_email: string;
  expected_sha256: string;
  actual_sha256: string;
  result: string;
  duration_ms: number | null;
  created_at: string;
}

export interface AdminRiskRule {
  id: string;
  keyword_trigger: string;
  risk_level: string;
  default_warning_message: string;
  target_section: string;
  created_at: string;
}

export async function getAdminStats(): Promise<AdminStatsResponse> {
  return apiFetch<AdminStatsResponse>('/api/admin/stats');
}

export async function getAdminUsers(): Promise<AdminUserResponse[]> {
  return apiFetch<AdminUserResponse[]>('/api/admin/users');
}

export async function getAdminContracts(): Promise<AdminContractItem[]> {
  return apiFetch<AdminContractItem[]>('/api/admin/contracts');
}

export async function getAdminLogs(): Promise<AdminLogItem[]> {
  return apiFetch<AdminLogItem[]>('/api/admin/logs');
}

export async function getAdminRiskRules(): Promise<AdminRiskRule[]> {
  return apiFetch<AdminRiskRule[]>('/api/admin/risk-rules');
}

export async function createAdminRiskRule(payload: {
  keyword_trigger: string;
  risk_level: 'critical' | 'high' | 'medium' | 'low';
  default_warning_message: string;
  target_section?: string;
}): Promise<AdminRiskRule> {
  return apiFetch<AdminRiskRule>('/api/admin/risk-rules', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

