"use client";

import { useState, useEffect, useMemo } from "react";
import { useAuth } from "./useAuth";
import { subscribeTasks } from "@/lib/tasks";
import { Task, TaskFilters, Priority } from "@/types";
import toast from "react-hot-toast";

const PRIORITY_ORDER: Record<Priority, number> = { high: 3, medium: 2, low: 1 };
const STATUS_ORDER: Record<string, number> = { todo: 0, in_progress: 1, done: 2 };

export function useTasks() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<TaskFilters>({
    status: "all",
    priority: "all",
    search: "",
    sortField: "createdAt",
    sortDirection: "desc",
  });

  // Subscribe to real-time updates
  useEffect(() => {
    if (!user) {
      setTasks([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const unsubscribe = subscribeTasks(
      user.uid,
      (tasks) => {
        setTasks(tasks);
        setLoading(false);
      },
      (error) => {
        toast.error("Failed to load tasks: " + error.message);
        setLoading(false);
      }
    );
    return unsubscribe;
  }, [user]);

  // Apply filters, search, and sorting client-side
  const filteredTasks = useMemo(() => {
    let result = [...tasks];

    // Status filter
    if (filters.status !== "all") {
      result = result.filter((t) => t.status === filters.status);
    }

    // Priority filter
    if (filters.priority !== "all") {
      result = result.filter((t) => t.priority === filters.priority);
    }

    // Search
    if (filters.search.trim()) {
      const q = filters.search.toLowerCase();
      result = result.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q)
      );
    }

    // Sort — done tasks always go to bottom, then sort within groups
    result.sort((a, b) => {
      // First: done tasks sink to bottom
      const statusDiff = STATUS_ORDER[a.status] - STATUS_ORDER[b.status];
      if (statusDiff !== 0) return statusDiff;

      // Then: sort within same status group
      let cmp = 0;
      switch (filters.sortField) {
        case "priority":
          cmp = PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
          break;
        case "dueDate":
          cmp = (a.dueDate || "").localeCompare(b.dueDate || "");
          break;
        case "title":
          cmp = a.title.localeCompare(b.title);
          break;
        default:
          cmp = a.createdAt.localeCompare(b.createdAt);
      }
      return filters.sortDirection === "asc" ? cmp : -cmp;
    });

    return result;
  }, [tasks, filters]);

  // Stats for the dashboard header
  const stats = useMemo(
    () => ({
      total: tasks.length,
      todo: tasks.filter((t) => t.status === "todo").length,
      inProgress: tasks.filter((t) => t.status === "in_progress").length,
      done: tasks.filter((t) => t.status === "done").length,
    }),
    [tasks]
  );

  return { tasks: filteredTasks, allTasks: tasks, loading, filters, setFilters, stats };
}
