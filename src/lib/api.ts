// Typed client for the backend API. The dashboard consumes DTOs only.

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ?? "http://localhost:8100";

export interface Analysis {
  id: string;
  created_at: string;
  language: string;
  category: string;
  priority: "low" | "medium" | "high";
  summary: string;
  category_confidence: number;
  priority_confidence: number;
  min_confidence: number;
  needs_review: boolean;
  threshold: number;
  routing_reason: string;
  served_model: string;
  prompt_version: string;
  latency_ms: number;
}

export interface Draft {
  id: string;
  created_at: string;
  body: string;
  language: string;
  served_model: string;
  prompt_version: string;
  latency_ms: number;
}

export interface TicketEvent {
  created_at: string;
  type: string;
  payload: Record<string, unknown>;
}

export interface TicketSummary {
  id: string;
  created_at: string;
  subject: string;
  status: string;
  review_state: string;
  analysis: Analysis | null;
}

export interface TicketDetail extends TicketSummary {
  body: string;
  customer_email: string | null;
  drafts: Draft[];
  events: TicketEvent[];
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`${res.status} ${await res.text()}`);
  return (await res.json()) as T;
}

export const api = {
  listTickets: () => request<TicketSummary[]>("/api/tickets?limit=100"),
  getTicket: (id: string) => request<TicketDetail>(`/api/tickets/${id}`),
  createTicket: (body: { subject: string; body: string; customer_email?: string }) =>
    request<{ id: string; status: string }>("/api/tickets", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  review: (
    id: string,
    body: { corrected_category?: string; corrected_priority?: string; note?: string },
  ) => request<TicketDetail>(`/api/tickets/${id}/review`, {
    method: "POST",
    body: JSON.stringify(body),
  }),
  regenerateDraft: (id: string) =>
    request<Draft>(`/api/tickets/${id}/drafts`, { method: "POST" }),
};

export const CATEGORIES = [
  "Billing & Subscription",
  "Account & Login",
  "Technical Issue",
  "Content",
  "Data Privacy & Deletion",
  "Feedback & Feature Request",
  "Sales & Promotions",
  "General Inquiry",
] as const;

export const PRIORITIES = ["low", "medium", "high"] as const;

export interface Stats {
  total_tickets: number;
  processed: number;
  needs_review: number;
  automated: number;
  approved: number;
  by_priority: Record<string, number>;
  by_category: Record<string, number>;
  by_language: Record<string, number>;
  avg_min_confidence: number | null;
  latency_ms_p50: number | null;
  latency_ms_p95: number | null;
  total_llm_cost_usd: number;
  threshold: number;
}

export const getStats = () => request<Stats>("/api/stats");
