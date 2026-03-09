"use client";

import { ClipboardList } from "lucide-react";
import Button from "./Button";

interface EmptyStateProps {
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export default function EmptyState({
  title = "No tasks yet",
  description = "Create your first task to get started with your productivity journey.",
  actionLabel = "Create Task",
  onAction,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center animate-fade-in">
      <div className="w-16 h-16 rounded-2xl bg-brand-50 dark:bg-brand-900/20 flex items-center justify-center mb-5">
        <ClipboardList className="w-8 h-8 text-brand-500" />
      </div>
      <h3 className="text-lg font-semibold text-zinc-800 dark:text-zinc-200 mb-2">
        {title}
      </h3>
      <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-xs mb-6">
        {description}
      </p>
      {onAction && (
        <Button onClick={onAction}>{actionLabel}</Button>
      )}
    </div>
  );
}
