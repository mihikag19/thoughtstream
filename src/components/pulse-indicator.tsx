"use client";

import { useEffect, useState } from "react";
import { timeAgo } from "@/lib/time";

export function PulseIndicator() {
  const [lastTime, setLastTime] = useState<string | null>(null);

  useEffect(() => {
    async function fetchLatest() {
      try {
        const res = await fetch("/api/thoughts/latest");
        if (res.ok) {
          const data = await res.json();
          if (data.thought) {
            setLastTime(data.thought.planted_at);
          }
        }
      } catch {
        // silent
      }
    }
    fetchLatest();
    const interval = setInterval(fetchLatest, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center gap-8">
      <div className="relative flex items-center justify-center w-[8px] h-[8px]">
        <div className="absolute w-[8px] h-[8px] rounded-full bg-[var(--accent)]" />
        <div className="absolute w-[8px] h-[8px] rounded-full bg-[var(--accent)] animate-pulse-ring" />
      </div>
      {lastTime && (
        <span className="font-mono text-[11px] text-[var(--text-muted)]">
          {timeAgo(lastTime)}
        </span>
      )}
    </div>
  );
}
