export interface User {
  id: string;
  name: string;
  email: string;
  role: "org_admin" | "manager" | "supervisor" | "enumerator";
  is_active: boolean;
  last_login_at?: string;
  created_at: string;
}

export interface Org {
  id: string;
  name: string;
  schema_name: string;
  email: string;
  is_active: boolean;
  created_at: string;
}

export type InspectionStatus =
  | "draft" | "in_progress" | "submitted"
  | "under_review" | "pending_actions"
  | "completed" | "finalized";

export interface Inspection {
  id: string;
  project_name: string;
  location_name?: string;
  latitude?: number;
  longitude?: number;
  date: string;
  inspector_name: string;
  inspector_role: string;
  assigned_user_id: string;
  checklist_id?: string;
  status: InspectionStatus;
  notes?: string;
  created_at: string;
  updated_at: string;
  checklist_items?: ChecklistItem[];
  agreed_actions?: Action[];
  comments?: Comment[];
  reviews?: Review[];
  total_items?: number;
  answered_items?: number;
  pending_actions?: number;
}

export interface ChecklistItem {
  id: string;
  description: string;
  response: boolean | null;
  comment: string;
  sort_order: number;
}

export interface Action {
  id: string;
  description: string;
  assignee_id: string;
  due_date: string;
  status: "pending" | "in_progress" | "resolved" | "overdue";
  evidence_url?: string;
  resolved_at?: string;
  created_at?: string;
}

export interface Comment {
  id: string;
  author_id: string;
  body: string;
  created_at: string;
}

export interface Review {
  id: string;
  stage: string;
  reviewer_id: string;
  assigned_to_id: string;
  comment: string;
  due_date: string;
  status: string;
  response_comment?: string;
  resolved_at?: string;
  created_at: string;
}

export interface ChecklistTemplate {
  id: string;
  name: string;
  description?: string;
  is_system: boolean;
  created_by?: string;
  created_at?: string;
  items: TemplateItem[];
}

export interface TemplateItem {
  id: string;
  description: string;
  sort_order: number;
}

export interface Report {
  id: string;
  inspection_id: string;
  generated_by: string;
  status: "generating" | "ready" | "failed";
  file_url?: string;
  share_token?: string;
  share_expiry?: string;
  error_message?: string;
  created_at: string;
}

export interface Media {
  id: string;
  inspection_id: string;
  uploaded_by?: string;
  url: string;
  filename: string;
  mime_type: string;
  size_bytes?: number;
  captured_via: "camera" | "gallery";
  latitude?: number;
  longitude?: number;
  gps_source: "device" | "manual" | "none";
  captured_at: string;
  created_at?: string;
}

export interface DashboardData {
  total: number;
  draft: number;
  in_progress: number;
  submitted: number;
  under_review: number;
  completed: number;
  pending_actions: number;
  finalized: number;
  recent: Inspection[];
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

export interface APIResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

export interface AnalyticsResponse {
  status_counts: Record<string, number>;
  checklist_summary: {
    conformance: number;
    non_conformance: number;
    unanswered: number;
  };
  action_summary: {
    pending: number;
    in_progress: number;
    resolved: number;
    overdue: number;
  };
  inspection_locations: {
    id: string;
    project_name: string;
    location_name: string;
    latitude?: number;
    longitude?: number;
    status: string;
    date: string;
  }[];
  recent_pending_action_ids: string[];
}

export interface AnalyticsCompareResponse {
  current_period: {
    from: string;
    to: string;
    status_counts: Record<string, number>;
    total: number;
  };
  previous_period: {
    from: string;
    to: string;
    status_counts: Record<string, number>;
    total: number;
  };
}

export interface GeoJSONFeature {
  type: string;
  geometry: {
    type: string;
    coordinates: number[];
  };
  properties: Record<string, unknown>;
}

export interface GeoJSONResponse {
  type: string;
  features: GeoJSONFeature[];
}

export interface SyncPullResponse {
  inspections: Inspection[];
  deleted_ids: string[];
  server_time: string;
}

export interface MergeConflictResponse {
  message: string;
  server_inspection: Inspection;
}

export interface CollaborationAccess {
  id: string;
  inspection_id: string;
  user_id: string;
  permission: "viewer" | "editor" | "reviewer";
  status: string;
  invited_by: string;
  created_at: string;
  updated_at: string;
}

export interface ExportJob {
  id: string;
  requested_by: string;
  type: "db_backup" | "report_batch" | "media_export";
  status: "pending" | "processing" | "completed" | "failed";
  file_url?: string;
  error_message?: string;
  created_at: string;
  completed_at?: string;
}

export interface CollaborationEvent {
  type:
    | "checklist_update"
    | "comment_added"
    | "status_changed"
    | "action_created"
    | "user_joined"
    | "user_left"
    | "message";
  payload: Record<string, unknown> | string;
  user_id: string;
  org_id?: string;
  created_at?: string;
}
