"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Thought } from "@/lib/supabase";

// Hardcoded echo notes for early entries — auto-generate later
const echoNotes = [
  "still unresolved",
  "became Signal thesis",
  "turned into the essay",
];

export function MemorySidebar({
  onProjectClick,
  activeProject,
}: {
  onProjectClick: (tag: string) => void;
  activeProject: string | null;
}) {
  const [memories, setMemories] = useState<Thought[]>([]);
  const [projects, setProjects] = useState<{ tag: string; count: number }[]>([]);
  const [budding, setBudding] = useState<Thought[]>([]);
  const [modalThought, setModalThought] = useState<Thought | null>(null);
  const [modalEcho, setModalEcho] = useState("");

  useEffect(() => {
    async function load() {
      const [memRes, allRes, buddingRes] = await Promise.all([
        fetch("/api/thoughts/memory"),
        fetch("/api/thoughts?limit=500"),
        fetch("/api/thoughts?type=budding"),
      ]);

      if (memRes.ok) {
        const d = await memRes.json();
        setMemories(d.thoughts || []);
      }

      if (allRes.ok) {
        const d = await allRes.json();
        const tags: Record<string, number> = {};
        for (const t of d.thoughts || []) {
          if (t.project_tag) tags[t.project_tag] = (tags[t.project_tag] || 0) + 1;
        }
        setProjects(
          Object.entries(tags)
            .map(([tag, count]) => ({ tag, count }))
            .sort((a, b) => b.count - a.count)
        );
      }

      if (buddingRes.ok) {
        const d = await buddingRes.json();
        setBudding(d.thoughts || []);
      }
    }
    load();
  }, []);

  function openModal(thought: Thought, index: number) {
    setModalThought(thought);
    setModalEcho(echoNotes[index] || "");
  }

  return (
    <div className="space-y-48">
      {/* This time last month */}
      {memories.length > 0 && (
        <section>
          <h3 className="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--text-muted)] mb-16">
            This time last month
          </h3>
          <div className="space-y-16">
            {memories.map((m, i) => (
              <button
                key={m.id}
                onClick={() => openModal(m, i)}
                className="block text-left w-full group"
              >
                <p className="font-mono text-[11px] text-[var(--text-muted)] mb-4">
                  {new Date(m.planted_at).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </p>
                <p className="font-serif italic text-[14px] text-[var(--text-mid)] leading-[1.5] group-hover:text-[var(--text)] transition-colors">
                  {m.content.slice(0, 80)}
                  {m.content.length > 80 ? "..." : ""}
                </p>
                {echoNotes[i] && (
                  <p className="font-mono text-[10px] text-[var(--text-dim)] mt-4">
                    {echoNotes[i]}
                  </p>
                )}
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Projects */}
      {projects.length > 0 && (
        <section>
          <h3 className="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--text-muted)] mb-16">
            Projects
          </h3>
          <div className="space-y-8">
            {projects.map((p) => (
              <button
                key={p.tag}
                onClick={() => onProjectClick(p.tag)}
                className={`flex items-center justify-between w-full font-mono text-[12px] transition-colors ${
                  activeProject === p.tag
                    ? "text-[var(--blue)]"
                    : "text-[var(--text-muted)] hover:text-[var(--text)]"
                }`}
              >
                <span>{p.tag}</span>
                <span className="text-[var(--text-dim)]">{p.count}</span>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Being tended */}
      {budding.length > 0 && (
        <section>
          <h3 className="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--text-muted)] mb-16">
            Being tended
          </h3>
          <div className="space-y-8">
            {budding.map((b) => (
              <div key={b.id} className="flex items-center gap-8">
                <span className="font-serif text-[13px] text-[var(--text-mid)]">
                  {b.title || b.content.slice(0, 60)}
                  {!b.title && b.content.length > 60 ? "..." : ""}
                </span>
                <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-[var(--accent)] opacity-60 shrink-0">
                  budding
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Memory modal */}
      <AnimatePresence>
        {modalThought && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[997] flex items-center justify-center p-24 backdrop-blur-[4px] bg-black/60"
            onClick={() => setModalThought(null)}
          >
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[var(--bg-raised)] border border-[var(--border-mid)] rounded-lg p-32 max-w-[560px] w-full max-h-[80vh] overflow-y-auto"
            >
              <div className="flex justify-between items-start mb-24">
                <p className="font-mono text-[11px] text-[var(--text-muted)]">
                  {new Date(modalThought.planted_at).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
                <button
                  onClick={() => setModalThought(null)}
                  className="text-[var(--text-muted)] hover:text-[var(--text)] text-[16px]"
                >
                  ✕
                </button>
              </div>
              <p className="font-serif text-[18px] leading-[1.75] text-[var(--text)] mb-16">
                {modalThought.content}
              </p>
              {modalEcho && (
                <p className="font-mono text-[11px] text-[var(--text-dim)] italic">
                  {modalEcho}
                </p>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
