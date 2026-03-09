"use client";

import { useEffect, useRef, useCallback } from "react";
import { Task, ReminderOption } from "@/types";

// Check every 30 seconds for precise reminders
const CHECK_INTERVAL = 30 * 1000;

// Minutes before due time
const REMINDER_OFFSET: Record<ReminderOption, number> = {
  none: -1,
  at_time: 0,
  "10min": 10,
  "30min": 30,
  "1hour": 60,
  "1day": 1440,
};

export function useNotifications(tasks: Task[]) {
  const permissionRef = useRef<NotificationPermission>("default");
  const notifiedIds = useRef<Set<string>>(new Set());

  // Request permission on mount
  useEffect(() => {
    if (typeof window === "undefined" || !("Notification" in window)) return;
    permissionRef.current = Notification.permission;
    if (Notification.permission === "default") {
      Notification.requestPermission().then((perm) => {
        permissionRef.current = perm;
      });
    }
  }, []);

  // Send a browser notification
  const notify = useCallback((title: string, body: string, tag: string) => {
    if (permissionRef.current !== "granted") return;
    try {
      new Notification(title, {
        body,
        icon: "/icon-192.png",
        badge: "/icon-192.png",
        tag,
        requireInteraction: true,
        silent: false,
      });
    } catch {
      // fallback
    }
  }, []);

  // ONLY check time-based reminders — no spam on page load
  useEffect(() => {
    if (typeof window === "undefined" || !("Notification" in window)) return;

    const check = () => {
      const nowMs = Date.now();

      const active = tasks.filter(
        (t) => t.status !== "done" && t.dueDate && t.dueTime && t.reminder && t.reminder !== "none"
      );

      for (const task of active) {
        const key = `${task.id}-${task.reminder}-${task.dueDate}-${task.dueTime}`;
        if (notifiedIds.current.has(key)) continue;

        const dueMs = new Date(`${task.dueDate}T${task.dueTime}`).getTime();
        const offsetMin = REMINDER_OFFSET[task.reminder];
        if (offsetMin < 0) continue;

        const triggerMs = dueMs - offsetMin * 60 * 1000;

        // Only fire if we are within a 60-second window of the trigger time
        // AND the trigger time is not in the past (more than 2 min ago = skip)
        if (nowMs >= triggerMs && nowMs < triggerMs + 60 * 1000) {
          const priorityEmoji =
            task.priority === "high" ? "🔴" : task.priority === "medium" ? "🟡" : "🟢";

          const timeLabel =
            task.reminder === "at_time"
              ? "Due now!"
              : task.reminder === "10min"
              ? "Due in 10 minutes"
              : task.reminder === "30min"
              ? "Due in 30 minutes"
              : task.reminder === "1hour"
              ? "Due in 1 hour"
              : "Due tomorrow";

          notify(
            `${priorityEmoji} ${task.title}`,
            `${timeLabel} — ${task.dueTime}\n${task.description || ""}`.trim(),
            key
          );

          notifiedIds.current.add(key);
        }
      }
    };

    check();
    const interval = setInterval(check, CHECK_INTERVAL);
    return () => clearInterval(interval);
  }, [tasks, notify]);
}
