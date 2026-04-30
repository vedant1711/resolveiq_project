export interface User {
  token: string;
  username: string;
  display_name: string;
  role: "vp_ops" | "developer";
  redirect_to: string;
}

export interface VPMetrics {
  total_hours_saved: number;
  dollars_saved: number;
  kb_capture_rate: number;
  team_size: number;
  avg_hourly_rate: number;
  mttr_trend: { month: string; mttr_hours: number }[];
  period: string;
  time_spent_searching_hours: number;
  articles_contributed: number;
  drafts_pending_review: KnowledgeDraft[];
}

export interface KnowledgeDraft {
  id: number;
  ticket_id: string;
  generated_title: string;
  generated_content?: string;
  status: "pending_review" | "published" | "discarded";
  confluence_url: string | null;
  confluence_page_id?: string | null;
  confluence_version?: number | null;
  created_at: string;
}

export interface JiraTicket {
  ticket_id: string;
  summary: string;
  status: string;
  priority: string;
  reporter_name: string;
  assignee_name: string;
  created_at: string | null;
  resolution_date: string | null;
  time_to_resolution_hours: number | null;
  description: string;
  allowed_transitions: string[];
  resolve_iq_score: number | null;
  score_label: string;
  jira_url: string;
}

export interface DevDashboard {
  stats: { hours_saved: number; articles_contributed: number };
  pending_drafts: KnowledgeDraft[];
  open_tickets: JiraTicket[];
  ai_coverage: {
    match_rate: number;
    avg_score: number;
    tickets_scored: number;
    no_doc_blockers: number;
  };
  integration_status: {
    jira_webhook: "active" | "inactive" | string;
    confluence_sync: { last_sync_at: string; chunks_indexed: number; status: string };
    pinecone: string;
    openai: string;
  };
  activity_feed: { type: string; message: string; timestamp: string }[];
  knowledge_gaps: { category: string; open_count: number }[];
}

export interface AnalyzeResult {
  ticket_id: string;
  score: number | null;
  status: "sufficient" | "insufficient" | "no_articles" | string;
  label: string;
  matched_articles: { title: string; confluence_url: string; relevance: number }[];
  jira_comment_posted: boolean;
  blocker_label_applied?: boolean;
  message?: string;
  fallback_used?: boolean;
}

export interface GenerateDraftResult extends KnowledgeDraft {
  generated_content: string;
}

export interface SlackChannel {
  id: string;
  name: string;
  is_private: boolean;
}
