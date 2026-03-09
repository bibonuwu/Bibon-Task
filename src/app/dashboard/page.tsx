"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useTasks } from "@/hooks/useTasks";
import { createTask, updateTask, deleteTask } from "@/lib/tasks";
import { Task, TaskFormData } from "@/types";
import AuthGuard from "@/components/auth/AuthGuard";
import Header from "@/components/layout/Header";
import TaskCard from "@/components/tasks/TaskCard";
import TaskForm from "@/components/tasks/TaskForm";
import StatsBar from "@/components/tasks/StatsBar";
import DeadlineBanner from "@/components/tasks/DeadlineBanner";
import Modal from "@/components/ui/Modal";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import EmptyState from "@/components/ui/EmptyState";
import Spinner from "@/components/ui/Spinner";
import { Plus } from "lucide-react";
import toast from "react-hot-toast";
import { useNotifications } from "@/hooks/useNotifications";

export default function DashboardPage() {
  const { user } = useAuth();
  const { tasks, allTasks, loading, stats } = useTasks();

  // Browser push notifications for deadlines
  useNotifications(allTasks);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [deletingTask, setDeletingTask] = useState<Task | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // ── CRUD handlers ─────────────────────────────────────

  const handleCreate = async (data: TaskFormData) => {
    if (!user) return;
    try {
      await createTask(user.uid, data);
      toast.success("Task created!");
      setShowCreateModal(false);
    } catch {
      toast.error("Failed to create task");
    }
  };

  const handleUpdate = async (data: TaskFormData) => {
    if (!editingTask) return;
    try {
      await updateTask(editingTask.id, data);
      toast.success("Task updated!");
      setEditingTask(null);
    } catch {
      toast.error("Failed to update task");
    }
  };

  const handleDelete = async () => {
    if (!deletingTask) return;
    setDeleteLoading(true);
    try {
      await deleteTask(deletingTask.id);
      toast.success("Task deleted");
      setDeletingTask(null);
    } catch {
      toast.error("Failed to delete task");
    } finally {
      setDeleteLoading(false);
    }
  };

  // ── Greeting ──────────────────────────────────────────

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  const firstName = user?.displayName?.split(" ")[0] || "there";

  return (
    <AuthGuard>
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 pb-24">
        <Header />

        <main className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
          {/* Greeting */}
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-white">
              {getGreeting()}, {firstName}
            </h1>
            <p className="text-sm text-zinc-500 mt-0.5">
              {stats.total === 0
                ? "Start by creating your first task"
                : `You have ${stats.todo + stats.inProgress} active task${stats.todo + stats.inProgress !== 1 ? "s" : ""}`}
            </p>
          </div>

          {/* Deadline reminders banner */}
          <DeadlineBanner tasks={allTasks} />

          {/* Stats */}
          {stats.total > 0 && <StatsBar stats={stats} />}

          {/* Task list */}
          {loading ? (
            <Spinner className="py-16" />
          ) : tasks.length === 0 ? (
            <EmptyState onAction={() => setShowCreateModal(true)} />
          ) : (
            <div className="space-y-3">
              {tasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onEdit={setEditingTask}
                  onDelete={setDeletingTask}
                />
              ))}
            </div>
          )}
        </main>

        {/* ── Floating Action Button — wide pill, easy to tap ── */}
        <button
          onClick={() => setShowCreateModal(true)}
          className="
            fixed bottom-6 left-1/2 -translate-x-1/2
            sm:bottom-8
            h-14 px-7
            bg-brand-600 hover:bg-brand-700 active:bg-brand-800
            text-white text-base font-semibold
            rounded-full
            shadow-lg shadow-brand-600/30 hover:shadow-xl hover:shadow-brand-600/40
            flex items-center justify-center gap-2.5
            transition-all duration-200 ease-out
            hover:scale-[1.03] active:scale-[0.97]
            z-30
          "
        >
          <Plus size={22} strokeWidth={2.5} />
          New Task
        </button>

        {/* Create Modal */}
        <Modal
          open={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          title="New Task"
        >
          <TaskForm
            onSubmit={handleCreate}
            onCancel={() => setShowCreateModal(false)}
          />
        </Modal>

        {/* Edit Modal */}
        <Modal
          open={!!editingTask}
          onClose={() => setEditingTask(null)}
          title="Edit Task"
        >
          {editingTask && (
            <TaskForm
              initialData={editingTask}
              onSubmit={handleUpdate}
              onCancel={() => setEditingTask(null)}
            />
          )}
        </Modal>

        {/* Delete Confirmation */}
        <ConfirmDialog
          open={!!deletingTask}
          title="Delete Task"
          message={`Are you sure you want to delete "${deletingTask?.title}"? This action cannot be undone.`}
          onConfirm={handleDelete}
          onCancel={() => setDeletingTask(null)}
          loading={deleteLoading}
        />
      </div>
    </AuthGuard>
  );
}
