"use client";

import { TaskFilters as TFilters, Status, Priority, SortField } from "@/types";
import { Search, SlidersHorizontal, ArrowUpDown } from "lucide-react";
import { useState } from "react";

interface TaskFiltersProps {
  filters: TFilters;
  onChange: (filters: TFilters) => void;
}

export default function TaskFilters({ filters, onChange }: TaskFiltersProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const update = (partial: Partial<TFilters>) =>
    onChange({ ...filters, ...partial });

  const statusOptions: { value: Status | "all"; label: string }[] = [
    { value: "all", label: "All" },
    { value: "todo", label: "To Do" },
    { value: "in_progress", label: "In Progress" },
    { value: "done", label: "Done" },
  ];

  const priorityOptions: { value: Priority | "all"; label: string }[] = [
    { value: "all", label: "All" },
    { value: "high", label: "High" },
    { value: "medium", label: "Medium" },
    { value: "low", label: "Low" },
  ];

  const sortOptions: { value: SortField; label: string }[] = [
    { value: "createdAt", label: "Date Created" },
    { value: "dueDate", label: "Due Date" },
    { value: "priority", label: "Priority" },
    { value: "title", label: "Title" },
  ];

  return (
    <div className="space-y-3">
      {/* Search + toggle */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400"
          />
          <input
            type="text"
            placeholder="Search tasks..."
            value={filters.search}
            onChange={(e) => update({ search: e.target.value })}
            className="
              w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm
              bg-white dark:bg-zinc-900
              border-zinc-200 dark:border-zinc-700
              text-zinc-900 dark:text-zinc-100
              placeholder:text-zinc-400 dark:placeholder:text-zinc-500
              focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500
              transition-all duration-200
            "
          />
        </div>
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className={`
            p-2.5 rounded-xl border transition-all duration-200
            ${
              showAdvanced
                ? "border-brand-500 bg-brand-50 text-brand-600 dark:bg-brand-900/20 dark:border-brand-600"
                : "border-zinc-200 dark:border-zinc-700 text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-800"
            }
          `}
          title="Filters"
        >
          <SlidersHorizontal size={18} />
        </button>
      </div>

      {/* Advanced filters */}
      {showAdvanced && (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl p-4 space-y-4 animate-slide-down">
          {/* Status pills */}
          <div>
            <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
              Status
            </span>
            <div className="flex flex-wrap gap-2 mt-2">
              {statusOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => update({ status: opt.value })}
                  className={`
                    px-3 py-1.5 rounded-lg text-xs font-medium transition-all
                    ${
                      filters.status === opt.value
                        ? "bg-brand-600 text-white"
                        : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                    }
                  `}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Priority pills */}
          <div>
            <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
              Priority
            </span>
            <div className="flex flex-wrap gap-2 mt-2">
              {priorityOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => update({ priority: opt.value })}
                  className={`
                    px-3 py-1.5 rounded-lg text-xs font-medium transition-all
                    ${
                      filters.priority === opt.value
                        ? "bg-brand-600 text-white"
                        : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                    }
                  `}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Sort */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
              Sort by
            </span>
            <select
              value={filters.sortField}
              onChange={(e) => update({ sortField: e.target.value as SortField })}
              className="
                text-xs px-3 py-1.5 rounded-lg border
                bg-white dark:bg-zinc-800
                border-zinc-200 dark:border-zinc-700
                text-zinc-700 dark:text-zinc-300
                focus:outline-none focus:ring-2 focus:ring-brand-500/30
              "
            >
              {sortOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <button
              onClick={() =>
                update({
                  sortDirection: filters.sortDirection === "asc" ? "desc" : "asc",
                })
              }
              className="p-1.5 rounded-lg text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              title="Toggle sort direction"
            >
              <ArrowUpDown size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
