"use client";

import { useEffect, useState, useCallback } from "react";
import type { Thought, ThoughtType } from "@/lib/supabase";
import { StreamEntry } from "./stream-entry";
import { ThermalMap } from "./thermal-map";
import { MemorySidebar } from "./memory-sidebar";

type Filter = "all" | ThoughtType;

export function StreamContent() {
  const [thoughts, setThoughts] = useState<Thought[]>([]);
  const [filter, setFilter] = useState<Filter>("all");
  const [projectFilter, setProjectFilter] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchThoughts = useCallback(async () => {
    const params = new URLSearchParams();
    if (filter !== "all") params.set("type", filter);
    if (projectFilter) params.set("project_tag", projectFilter);

    const res = await fetch(`/api/thoughts?${params}`);
    if (res.ok) {
      const data = await res.json();
      setThoughts(data.thoughts || []);
    }
    setLoading(false);
  }, [filter, projectFilter]);

  useEffect(() => {
    fetchThoughts();
  }, [fetchThoughts]);

  const filters: { label: string; value: Filter }[] = [
    { label: "All", value: "all" },
    { label: "Seedlings", value: "seedling" },
    { label: "Budding", value: "budding" },
    { label: "Evergreen", value: "evergreen" },
  ];

  function handleTended(id: string, updated: Thought) {
    setThoughts((prev) =>
      prev.map((t) => (t.id === id ? updated : t))
    );
  }

  return (
    <main className="px-24 max-w-[960px] mx-auto w-full pb-80">
      <h1 className="font-serif text-[24px] font-medium tracking-tight mb-8">
        Stream
      </h1>
      <p className="font-mono text-[12px] text-[var(--text-muted)] mb-48">
        Raw thoughts, in reverse chronological order.
      </p>

      <div className="flex flex-col lg:flex-row gap-48">
        {/* Main stream column */}
        <div className="flex-1 max-w-[660px]">
          {/* Thermal map — desktop only */}
          <div className="hidden md:block mb-32">
            <ThermalMap />
          </div>

          {/* Filter bar */}
          <div className="flex gap-8 mb-24">
            {filters.map((f) => (
              <button
                key={f.value}
                onClick={() => setFilter(f.value)}
                className={`font-mono text-[10px] uppercase tracking-[0.12em] px-8 py-4 rounded transition-colors ${
                  filter === f.value
                    ? "text-[var(--accent)] border border-[var(--accent-border)] bg-[var(--accent-dim)]"
                    : "text-[var(--text-muted)] hover:text-[var(--text-mid)]"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Project filter banner */}
          {projectFilter && (
            <div className="flex items-center gap-8 mb-16 font-mono text-[11px] text-[var(--blue)]">
              <span>Viewing: {projectFilter}</span>
              <button
                onClick={() => setProjectFilter(null)}
                className="text-[var(--text-muted)] hover:text-[var(--text)]"
              >
                ×
              </button>
            </div>
          )}

          {loading && (
            <p className="font-mono text-[12px] text-[var(--text-muted)]">Loading...</p>
          )}

          {!loading && thoughts.length === 0 && (
            <p className="font-serif text-[18px] text-[var(--text-muted)]">Nothing here yet.</p>
          )}

          <div>
            {thoughts.map((thought, i) => (
              <StreamEntry
                key={thought.id}
                thought={thought}
                index={i}
                onTended={handleTended}
                onProjectClick={setProjectFilter}
              />
            ))}
          </div>
        </div>

        {/* Sidebar — desktop only */}
        <aside className="hidden lg:block w-[280px] shrink-0 sticky top-96 self-start">
          <MemorySidebar onProjectClick={setProjectFilter} activeProject={projectFilter} />
        </aside>
      </div>
    </main>
  );
}
