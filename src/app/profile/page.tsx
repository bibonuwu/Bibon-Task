"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/hooks/useTheme";
import { useFCM } from "@/hooks/useFCM";
import { updateProfile } from "firebase/auth";
import AuthGuard from "@/components/auth/AuthGuard";
import Header from "@/components/layout/Header";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { Sun, Moon, ArrowLeft, Bell, BellOff } from "lucide-react";
import toast from "react-hot-toast";

export default function ProfilePage() {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { enabled: pushEnabled, loading: pushLoading, togglePush } = useFCM();
  const router = useRouter();

  const [displayName, setDisplayName] = useState(user?.displayName || "");
  const [loading, setLoading] = useState(false);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    try {
      await updateProfile(user, { displayName });
      toast.success("Profile updated!");
    } catch {
      toast.error("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const initials =
    user?.displayName
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase() || "U";

  return (
    <AuthGuard>
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
        <Header />

        <main className="max-w-lg mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
          {/* Back button */}
          <button
            onClick={() => router.push("/dashboard")}
            className="flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors"
          >
            <ArrowLeft size={16} /> Back to Dashboard
          </button>

          {/* Avatar & info */}
          <div className="flex flex-col items-center text-center">
            <div className="w-20 h-20 rounded-full bg-brand-600 text-white flex items-center justify-center text-2xl font-bold mb-3">
              {initials}
            </div>
            <h1 className="text-xl font-bold text-zinc-900 dark:text-white">
              {user?.displayName || "User"}
            </h1>
            <p className="text-sm text-zinc-500">{user?.email}</p>
          </div>

          {/* Edit form */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl p-5">
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-4">
              Edit Profile
            </h2>
            <form onSubmit={handleUpdate} className="space-y-4">
              <Input
                label="Display Name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Your name"
              />
              <Input label="Email" value={user?.email || ""} disabled />
              <Button type="submit" loading={loading} className="w-full">
                Save Changes
              </Button>
            </form>
          </div>

          {/* Notifications */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl p-5">
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-4">
              Notifications
            </h2>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-700 dark:text-zinc-300">
                  Push Notifications
                </p>
                <p className="text-xs text-zinc-400 mt-0.5">
                  {pushEnabled
                    ? "Reminders will be sent even when browser is closed"
                    : "Enable to get task reminders on your device"}
                </p>
              </div>
              <button
                onClick={togglePush}
                disabled={pushLoading}
                className={`
                  p-3 rounded-xl transition-colors
                  ${pushEnabled
                    ? "bg-brand-50 text-brand-600 dark:bg-brand-900/20 dark:text-brand-400 hover:bg-brand-100 dark:hover:bg-brand-900/30"
                    : "bg-zinc-100 text-zinc-400 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700"}
                  ${pushLoading ? "opacity-50" : ""}
                `}
              >
                {pushEnabled ? <Bell size={20} /> : <BellOff size={20} />}
              </button>
            </div>
          </div>

          {/* Theme */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl p-5">
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-4">
              Appearance
            </h2>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-700 dark:text-zinc-300">Theme</p>
                <p className="text-xs text-zinc-400">
                  {theme === "light" ? "Light mode" : "Dark mode"}
                </p>
              </div>
              <button
                onClick={toggleTheme}
                className="p-3 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
              >
                {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
              </button>
            </div>
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}
