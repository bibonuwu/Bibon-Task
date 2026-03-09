"use client";

import { Task } from "@/types";
import { AlertTriangle, Clock, CalendarClock } from "lucide-react";

interface DeadlineBannerProps {
  tasks: Task[];
}

export default function DeadlineBanner({ tasks }: DeadlineBannerProps) {
  const now = new Date();
  const today = now.toISOString().split("T")[0];

  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split("T")[0];

  // Filter active tasks (not done) with due dates
  const active = tasks.filter((t) => t.status !== "done" && t.dueDate);

  const overdue = active.filter((t) => t.dueDate < today);
  const dueToday = active.filter((t) => t.dueDate === today);
  const dueTomorrow = active.filter((t) => t.dueDate === tomorrowStr);

  if (overdue.length === 0 && dueToday.length === 0 && dueTomorrow.length === 0) {
    return null;
  }

  const items: { icon: React.ReactNode; label: string; tasks: Task[]; color: string }[] = [];

  if (overdue.length > 0) {
    items.push({
      icon: <AlertTriangle size={16} />,
      label: `${overdue.length} overdue`,
      tasks: overdue,
      color: "text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400",
    });
  }

  if (dueToday.length > 0) {
    items.push({
      icon: <Clock size={16} />,
      label: `${dueToday.length} due today`,
      tasks: dueToday,
      color: "text-amber-600 bg-amber-50 dark:bg-amber-900/20 dark:text-amber-400",
    });
  }

  if (dueTomorrow.length > 0) {
    items.push({
      icon: <CalendarClock size={16} />,
      label: `${dueTomorrow.length} due tomorrow`,
      tasks: dueTomorrow,
      color: "text-brand-600 bg-brand-50 dark:bg-brand-900/20 dark:text-brand-400",
    });
  }

  return (
    <div className="flex flex-wrap gap-2 animate-fade-in">
      {items.map((item, i) => (
        <div
          key={i}
          className={`
            inline-flex items-center gap-2 px-3.5 py-2 rounded-xl
            text-sm font-medium ${item.color}
          `}
        >
          {item.icon}
          {item.label}
          <span className="opacity-60 text-xs font-normal hidden sm:inline">
            — {item.tasks.map((t) => t.title).join(", ")}
          </span>
        </div>
      ))}
    </div>
  );
}
