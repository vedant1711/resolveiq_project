import type { User, VPMetrics, DevDashboard, AnalyzeResult, GenerateDraftResult, KnowledgeDraft, SlackChannel } from "@/types";

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

function getHeaders(): HeadersInit {
  let token = "";
  if (typeof window !== "undefined") {
    token = localStorage.getItem("resolve_iq_token") || "";
  }
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export const api = {
  async mockLogin(username: string): Promise<User> {
    const res = await fetch(`${BASE}/api/auth/mock-login/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username }),
    });
    if (!res.ok) throw new Error("Login failed");
    return res.json();
  },

  async getVPDashboard(): Promise<VPMetrics> {
    const res = await fetch(`${BASE}/api/dashboard/vp/`, { headers: getHeaders() });
    return res.json();
  },

  async getDevDashboard(): Promise<DevDashboard> {
    const res = await fetch(`${BASE}/api/dashboard/dev/`, { headers: getHeaders() });
    return res.json();
  },

  async analyzeTicket(ticketId: string, description: string, summary?: string): Promise<AnalyzeResult> {
    const res = await fetch(`${BASE}/api/tickets/${ticketId}/analyze/`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ ticket_description: description, ticket_summary: summary || "" }),
    });
    return res.json();
  },

  async transitionTicket(ticketId: string, status: string): Promise<{ ticket_id: string; status: string }> {
    const res = await fetch(`${BASE}/api/tickets/${ticketId}/transition/`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ status }),
    });
    return res.json();
  },

  async generateDraft(ticketId: string, channelId?: string): Promise<GenerateDraftResult> {
    const res = await fetch(`${BASE}/api/tickets/${ticketId}/generate-draft/`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(channelId ? { channel_id: channelId } : {}),
    });
    return res.json();
  },

  async publishDraft(draftId: number): Promise<KnowledgeDraft> {
    const res = await fetch(`${BASE}/api/drafts/${draftId}/publish/`, {
      method: "PATCH",
      headers: getHeaders(),
    });
    return res.json();
  },

  async listSlackChannels(): Promise<SlackChannel[]> {
    const res = await fetch(`${BASE}/api/slack/channels/`, { headers: getHeaders() });
    if (!res.ok) throw new Error("Failed to load Slack channels");
    const data = await res.json();
    return data.channels || [];
  },
};
