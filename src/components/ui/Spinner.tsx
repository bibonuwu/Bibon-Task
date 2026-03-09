"use client";

export default function Spinner({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className="w-8 h-8 border-[3px] border-zinc-200 dark:border-zinc-700 border-t-brand-500 rounded-full animate-spin" />
    </div>
  );
}
