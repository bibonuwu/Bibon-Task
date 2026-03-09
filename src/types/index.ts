// ── Task Types ──────────────────────────────────────────

export type Priority = "low" | "medium" | "high";
export type Status = "todo" | "in_progress" | "done";

export type ReminderOption = "none" | "at_time" | "10min" | "30min" | "1hour" | "1day";

export interface Task {
  id: string;
  title: string;
  description: string;
  dueDate: string;      // ISO date string (YYYY-MM-DD)
  dueTime: string;       // Time string (HH:MM) or empty
  reminder: ReminderOption;
  priority: Priority;
  status: Status;
  createdAt: string;
  updatedAt: string;
  userId: string;
}

export type TaskFormData = Omit<Task, "id" | "createdAt" | "updatedAt" | "userId">;

// ── Filter & Sort Types ─────────────────────────────────

export type SortField = "createdAt" | "dueDate" | "priority" | "title";
export type SortDirection = "asc" | "desc";

export interface TaskFilters {
  status: Status | "all";
  priority: Priority | "all";
  search: string;
  sortField: SortField;
  sortDirection: SortDirection;
}
