"use client";

import { useState } from "react";
import { Task, TaskFormData, Priority, Status, ReminderOption } from "@/types";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { Bell } from "lucide-react";

interface TaskFormProps {
  initialData?: Task;
  onSubmit: (data: TaskFormData) => Promise<void>;
  onCancel: () => void;
}

const reminderOptions: { value: ReminderOption; label: string }[] = [
  { value: "none", label: "None" },
  { value: "at_time", label: "At time" },
  { value: "10min", label: "10 min" },
  { value: "30min", label: "30 min" },
  { value: "1hour", label: "1 hour" },
  { value: "1day", label: "1 day" },
];

export default function TaskForm({ initialData, onSubmit, onCancel }: TaskFormProps) {
  const [title, setTitle] = useState(initialData?.title || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [dueDate, setDueDate] = useState(initialData?.dueDate || "");
  const [dueTime, setDueTime] = useState(initialData?.dueTime || "");
  const [reminder, setReminder] = useState<ReminderOption>(initialData?.reminder || "none");
  const [priority, setPriority] = useState<Priority>(initialData?.priority || "medium");
  const [status, setStatus] = useState<Status>(initialData?.status || "todo");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit({ title, description, dueDate, dueTime, reminder, priority, status });
    } finally {
      setLoading(false);
    }
  };

  const priorityOptions: { value: Priority; label: string; color: string }[] = [
    { value: "low", label: "Low", color: "bg-emerald-500" },
    { value: "medium", label: "Medium", color: "bg-amber-500" },
    { value: "high", label: "High", color: "bg-red-500" },
  ];

  const statusOptions: { value: Status; label: string }[] = [
    { value: "todo", label: "To Do" },
    { value: "in_progress", label: "In Progress" },
    { value: "done", label: "Done" },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <Input
        label="Title"
        placeholder="What needs to be done?"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
        autoFocus
      />

      {/* Description */}
      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Description
        </label>
        <textarea
          placeholder="Add some details..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="
            w-full px-4 py-2.5 rounded-xl border text-sm resize-none
            bg-white dark:bg-zinc-900
            border-zinc-200 dark:border-zinc-700
            text-zinc-900 dark:text-zinc-100
            placeholder:text-zinc-400 dark:placeholder:text-zinc-500
            focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500
            transition-all duration-200
          "
        />
      </div>

      {/* Due Date + Time */}
      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Due Date"
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
        />
        <Input
          label="Time"
          type="time"
          value={dueTime}
          onChange={(e) => setDueTime(e.target.value)}
        />
      </div>

      {/* Reminder — shows only when due date is set */}
      {dueDate && (
        <div className="space-y-1.5 animate-fade-in">
          <label className="flex items-center gap-1.5 text-sm font-medium text-zinc-700 dark:text-zinc-300">
            <Bell size={14} /> Reminder
          </label>
          <div className="flex flex-wrap gap-2">
            {reminderOptions.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setReminder(opt.value)}
                className={`
                  px-3 py-2 rounded-xl text-xs font-medium
                  border transition-all duration-200
                  ${
                    reminder === opt.value
                      ? "border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-900/20 dark:text-brand-400 dark:border-brand-600"
                      : "border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-600"
                  }
                `}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Priority */}
      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Priority
        </label>
        <div className="flex gap-2">
          {priorityOptions.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setPriority(opt.value)}
              className={`
                flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium
                border transition-all duration-200
                ${
                  priority === opt.value
                    ? "border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-900/20 dark:text-brand-400 dark:border-brand-600"
                    : "border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-600"
                }
              `}
            >
              <span className={`w-2 h-2 rounded-full ${opt.color}`} />
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Status (only for editing) */}
      {initialData && (
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Status
          </label>
          <div className="flex gap-2">
            {statusOptions.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setStatus(opt.value)}
                className={`
                  flex-1 px-3 py-2.5 rounded-xl text-sm font-medium
                  border transition-all duration-200
                  ${
                    status === opt.value
                      ? "border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-900/20 dark:text-brand-400 dark:border-brand-600"
                      : "border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-600"
                  }
                `}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <Button variant="secondary" type="button" onClick={onCancel} className="flex-1">
          Cancel
        </Button>
        <Button type="submit" loading={loading} className="flex-1">
          {initialData ? "Update" : "Create"}
        </Button>
      </div>
    </form>
  );
}
