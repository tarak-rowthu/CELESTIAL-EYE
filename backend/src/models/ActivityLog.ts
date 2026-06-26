// src/models/ActivityLog.ts
export interface ActivityLog {
  id: string;
  user_id: string;
  action: string;
  timestamp: string;
  details?: string;
}
