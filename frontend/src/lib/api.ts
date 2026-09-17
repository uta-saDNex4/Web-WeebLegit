/**
 * API client layer — tập trung tất cả lời gọi đến FastAPI backend.
 * Base URL được lấy từ biến môi trường NEXT_PUBLIC_API_URL.
 */

export function getBaseUrl(): string {
  const envUrl = (process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_BASE_URL)?.trim();

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
      message = body?.detail ?? body?.message ?? message;
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

// ─── AI Chat ──────────────────────────────────────────────────────────────────

export interface AiChatResponse {
  reply: string;
  citations: string[];
  negotiation_script: string | null;
  source: string;
  model?: string | null;
}

export async function chatWithAi(
  message: string,
  contractContext?: string,
  stage?: string,
  history?: { role: string; content: string }[],
): Promise<AiChatResponse> {
  return apiFetch<AiChatResponse>(
    '/api/ai/chat',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message,
        contract_context: contractContext,
        stage,
        history,
      }),
    },
    false,
  );
}

// ─── Admin Dashboard ──────────────────────────────────────────────────────────

export interface AdminStats {
  total_users: number;
  total_contracts: number;
  verified_contracts: number;
  mismatch_contracts: number;
  total_verifications: number;
  total_risk_rules: number;
  total_legal_references: number;
}

export interface AdminUser {
  id: string;
  email: string;
  full_name: string | null;
  role: string;
  is_active: boolean;
  created_at: string;
}

export interface AdminContract {
  id: string;
  uploader_email: string;
  original_filename: string;
  file_size_bytes: number;
  sha256_hash: string;
  contract_type: string | null;
  status: string;
  created_at: string;
}

export interface AdminLog {
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

export interface RiskRuleItem {
  id: string;
  keyword_trigger: string;
  risk_level: string;
  default_warning_message: string;
  target_section: string;
}

export async function getAdminStats(): Promise<AdminStats> {
  return apiFetch<AdminStats>('/api/admin/stats');
}

export async function getAdminUsers(): Promise<AdminUser[]> {
  return apiFetch<AdminUser[]>('/api/admin/users');
}

export async function toggleUserStatus(userId: string, isActive: boolean): Promise<{ message: string }> {
  return apiFetch<{ message: string }>(`/api/admin/users/${userId}/status?is_active=${isActive}`, {
    method: 'PUT',
  });
}

export async function getAdminContracts(): Promise<AdminContract[]> {
  return apiFetch<AdminContract[]>('/api/admin/contracts');
}

export async function getAdminLogs(): Promise<AdminLog[]> {
  return apiFetch<AdminLog[]>('/api/admin/logs');
}

export async function getAdminRiskRules(): Promise<RiskRuleItem[]> {
  return apiFetch<RiskRuleItem[]>('/api/admin/risk-rules');
}

export async function createRiskRule(data: {
  keyword_trigger: string;
  risk_level: string;
  default_warning_message: string;
  target_section?: string;
}): Promise<RiskRuleItem> {
  return apiFetch<RiskRuleItem>('/api/admin/risk-rules', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}

export async function deleteRiskRule(ruleId: string): Promise<void> {
  return apiFetch<void>(`/api/admin/risk-rules/${ruleId}`, {
    method: 'DELETE',
  });
}

