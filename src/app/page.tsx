"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/hooks/useTheme";
import Button from "@/components/ui/Button";
import Spinner from "@/components/ui/Spinner";
import { Sun, Moon, CheckCircle2, Zap, Shield, ArrowRight } from "lucide-react";

export default function LandingPage() {
  const { user, loading } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (!loading && user) {
      router.replace("/dashboard");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <Spinner />
      </div>
    );
  }

  if (user) return null; // Redirecting...

  const features = [
    {
      icon: <CheckCircle2 className="w-6 h-6 text-brand-500" />,
      title: "Smart Task Management",
      desc: "Organize tasks with priorities, deadlines, and statuses. Stay on top of everything.",
    },
    {
      icon: <Zap className="w-6 h-6 text-amber-500" />,
      title: "Lightning Fast",
      desc: "Real-time sync powered by Firebase. Your changes appear instantly across all devices.",
    },
    {
      icon: <Shield className="w-6 h-6 text-emerald-500" />,
      title: "Secure & Private",
      desc: "Your data is protected with Firebase Authentication and Firestore security rules.",
    },
  ];

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      {/* Nav */}
      <nav className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <span className="text-xl font-bold text-zinc-900 dark:text-white tracking-tight">
          Bibon<span className="text-brand-600">Task</span>
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={toggleTheme}
            className="p-2.5 rounded-xl text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
          </button>
          <Button variant="ghost" onClick={() => router.push("/auth/login")} size="sm">
            Sign In
          </Button>
          <Button onClick={() => router.push("/auth/register")} size="sm">
            Get Started
          </Button>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 pt-16 sm:pt-24 pb-16 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-400 text-xs font-medium mb-6">
          <Zap size={12} /> Minimal. Powerful. Free.
        </div>

        <h1 className="text-4xl sm:text-6xl font-bold text-zinc-900 dark:text-white leading-tight tracking-tight">
          Your tasks,
          <br />
          <span className="text-brand-600">beautifully organized.</span>
        </h1>

        <p className="text-lg text-zinc-500 dark:text-zinc-400 mt-5 max-w-lg mx-auto leading-relaxed">
          A premium minimal task planner designed for people who value clarity, focus, and
          getting things done.
        </p>

        <div className="flex items-center justify-center gap-3 mt-8">
          <Button onClick={() => router.push("/auth/register")} size="lg">
            Start Free <ArrowRight size={18} />
          </Button>
          <Button variant="secondary" onClick={() => router.push("/auth/login")} size="lg">
            Sign In
          </Button>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 pb-20">
        <div className="grid sm:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <div
              key={i}
              className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl p-6 hover:shadow-md transition-shadow duration-300"
            >
              <div className="w-12 h-12 rounded-xl bg-zinc-50 dark:bg-zinc-800 flex items-center justify-center mb-4">
                {f.icon}
              </div>
              <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
                {f.title}
              </h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-100 dark:border-zinc-800 py-6 text-center">
        <p className="text-xs text-zinc-400">
          BibonTask &mdash; Built with Next.js, Firebase & Tailwind CSS
        </p>
      </footer>
    </div>
  );
}
