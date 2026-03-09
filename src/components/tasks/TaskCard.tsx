"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Task, Status } from "@/types";
import { PriorityBadge, StatusBadge } from "@/components/ui/Badge";
import { Calendar, Edit3, Trash2, ArrowRight, Check, RotateCcw, Bell, Clock } from "lucide-react";
import { updateTask } from "@/lib/tasks";
import toast from "react-hot-toast";

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
}

const SWIPE_THRESHOLD = 70;
const MAX_SWIPE = 160;

export default function TaskCard({ task, onEdit, onDelete }: TaskCardProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [offsetX, setOffsetX] = useState(0);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const startY = useRef(0);
  const locked = useRef<"h" | "v" | null>(null);
  const currentOffset = useRef(0);
  const cardRef = useRef<HTMLDivElement>(null);
  const didDrag = useRef(false); // track if a real drag happened

  // Keep ref in sync
  useEffect(() => { currentOffset.current = offsetX; }, [offsetX]);

  // ── Status change ─────────────────────────────────────

  const changeStatus = async (newStatus: Status) => {
    if (newStatus === task.status) return;
    setIsUpdating(true);
    setOffsetX(0);
    try {
      await updateTask(task.id, { status: newStatus });
      toast.success(
        newStatus === "done"
          ? "Task completed!"
          : newStatus === "in_progress"
          ? "In progress"
          : "Moved to To Do"
      );
    } catch {
      toast.error("Failed to update status");
    } finally {
      setIsUpdating(false);
    }
  };

  // ── Resolve on release ────────────────────────────────

  const resolve = useCallback(() => {
    const ox = currentOffset.current;
    if (Math.abs(ox) >= SWIPE_THRESHOLD) {
      if (ox < 0) {
        if (task.status === "todo") changeStatus("in_progress");
        else if (task.status === "in_progress") changeStatus("done");
        else setOffsetX(0);
      } else {
        if (task.status === "done") changeStatus("in_progress");
        else if (task.status === "in_progress") changeStatus("todo");
        else setOffsetX(0);
      }
    } else {
      setOffsetX(0);
    }
    isDragging.current = false;
    locked.current = null;
  }, [task.status]);

  // ── Shared move ───────────────────────────────────────

  const move = useCallback((clientX: number, clientY: number) => {
    const dx = clientX - startX.current;
    const dy = clientY - startY.current;

    if (!locked.current && (Math.abs(dx) > 5 || Math.abs(dy) > 5)) {
      locked.current = Math.abs(dy) > Math.abs(dx) ? "v" : "h";
      if (locked.current === "h") {
        isDragging.current = true;
        didDrag.current = true;
      }
    }

    if (locked.current !== "h") return;

    const clamped = Math.max(-MAX_SWIPE, Math.min(MAX_SWIPE, dx));
    setOffsetX(clamped);
  }, []);

  // ── Touch (mobile) ────────────────────────────────────

  const onTouchStart = (e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX;
    startY.current = e.touches[0].clientY;
    locked.current = null;
    isDragging.current = false;
    didDrag.current = false;
  };

  const onTouchMove = (e: React.TouchEvent) => {
    move(e.touches[0].clientX, e.touches[0].clientY);
  };

  const onTouchEnd = () => resolve();

  // ── Mouse (desktop) ───────────────────────────────────

  const onMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest("button")) return;

    e.preventDefault(); // prevent text selection
    startX.current = e.clientX;
    startY.current = e.clientY;
    locked.current = null;
    isDragging.current = false;
    didDrag.current = false;

    const onMouseMove = (ev: MouseEvent) => {
      ev.preventDefault();
      move(ev.clientX, ev.clientY);
    };

    const onMouseUp = () => {
      resolve();
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
      document.body.style.userSelect = "";
    };

    document.body.style.userSelect = "none";
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  };

  // ── Helpers ───────────────────────────────────────────

  const isOverdue =
    task.dueDate && task.status !== "done" && new Date(task.dueDate) < new Date();

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const swipeLeftLabel =
    task.status === "todo" ? "In Progress"
    : task.status === "in_progress" ? "Done"
    : null;

  const swipeRightLabel =
    task.status === "done" ? "In Progress"
    : task.status === "in_progress" ? "To Do"
    : null;

  const isTriggered = Math.abs(offsetX) >= SWIPE_THRESHOLD;

  return (
    <div className="relative overflow-hidden rounded-2xl animate-fade-in">
      {/* ── Left reveal (drag right → go back) ───────────── */}
      <div
        className={`
          absolute inset-y-0 left-0 w-1/2
          flex items-center pl-5 gap-2 text-sm font-medium
          transition-colors duration-150
          ${isTriggered && offsetX > 0
            ? "bg-amber-500 text-white"
            : "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400"}
        `}
      >
        <RotateCcw size={18} />
        {swipeRightLabel || ""}
      </div>

      {/* ── Right reveal (drag left → advance) ───────────── */}
      <div
        className={`
          absolute inset-y-0 right-0 w-1/2
          flex items-center justify-end pr-5 gap-2 text-sm font-medium
          transition-colors duration-150
          ${isTriggered && offsetX < 0
            ? task.status === "in_progress"
              ? "bg-emerald-500 text-white"
              : "bg-brand-500 text-white"
            : task.status === "in_progress"
              ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400"
              : "bg-brand-100 text-brand-600 dark:bg-brand-900/30 dark:text-brand-400"}
        `}
      >
        {swipeLeftLabel || ""}
        {task.status === "in_progress" ? <Check size={18} /> : <ArrowRight size={18} />}
      </div>

      {/* ── Card ─────────────────────────────────────────── */}
      <div
        ref={cardRef}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onMouseDown={onMouseDown}
        style={{
          transform: `translateX(${offsetX}px)`,
          transition: isDragging.current ? "none" : "transform 0.3s ease-out",
        }}
        className={`
          relative bg-white dark:bg-zinc-900
          border border-zinc-100 dark:border-zinc-800
          rounded-2xl p-4 sm:p-5
          hover:shadow-md hover:border-zinc-200 dark:hover:border-zinc-700
          transition-shadow duration-200 ease-out
          select-none cursor-grab active:cursor-grabbing
          ${task.status === "done" ? "opacity-60" : ""}
          ${isUpdating ? "pointer-events-none" : ""}
        `}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3
              className={`
                text-sm sm:text-base font-medium text-zinc-900 dark:text-zinc-100 leading-snug
                ${task.status === "done" ? "line-through text-zinc-400 dark:text-zinc-500" : ""}
              `}
            >
              {task.title}
            </h3>

            <div className="flex gap-1 shrink-0">
              <button
                onClick={() => onEdit(task)}
                className="p-2 rounded-xl text-zinc-400 hover:text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-900/20 transition-colors"
                title="Edit"
              >
                <Edit3 size={16} />
              </button>
              <button
                onClick={() => onDelete(task)}
                className="p-2 rounded-xl text-zinc-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                title="Delete"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>

          {task.description && (
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1 line-clamp-2">
              {task.description}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-2 mt-3">
            <PriorityBadge priority={task.priority} />
            <StatusBadge status={task.status} />

            {task.dueDate && (
              <span
                className={`
                  inline-flex items-center gap-1 text-xs
                  ${isOverdue ? "text-red-500 font-medium" : "text-zinc-400 dark:text-zinc-500"}
                `}
              >
                <Calendar size={12} />
                {formatDate(task.dueDate)}
                {task.dueTime && (
                  <><Clock size={11} /> {task.dueTime}</>
                )}
                {isOverdue && " (overdue)"}
              </span>
            )}

            {task.reminder && task.reminder !== "none" && (
              <span className="inline-flex items-center gap-1 text-xs text-brand-500">
                <Bell size={11} /> Reminder
              </span>
            )}
          </div>

          {(!swipeLeftLabel && !swipeRightLabel) ? null : (
            <p className="text-[10px] text-zinc-300 dark:text-zinc-700 mt-2 text-center select-none">
              <span className="sm:hidden">swipe to change status</span>
              <span className="hidden sm:inline">drag left or right to change status</span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
