"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { plantedTended } from "@/lib/time";
import { showToast } from "@/components/toast";
import type { Thought } from "@/lib/supabase";
import Link from "next/link";

const stageLabels = {
  seedling: { label: "SEEDLING", className: "text-[var(--text-dim)]" },
  budding: { label: "BUDDING", className: "text-[var(--accent)] opacity-60" },
  evergreen: { label: "EVERGREEN", className: "text-[var(--accent)]" },
};

const promotionMessages: Record<string, string> = {
  budding: "Promoted to budding.",
  evergreen: "Essay stub created.",
};

export function StreamEntry({
  thought,
  index,
  onTended,
  onProjectClick,
}: {
  thought: Thought;
  index: number;
  onTended: (id: string, updated: Thought) => void;
  onProjectClick: (tag: string) => void;
}) {
  const [hovering, setHovering] = useState(false);
  const [tending, setTending] = useState(false);

  const stage = stageLabels[thought.type] || stageLabels.seedling;

  async function handleTend() {
    if (tending) return;
    setTending(true);
    try {
      const res = await fetch(`/api/thoughts/${thought.id}/tend`, { method: "PATCH" });
      if (res.ok) {
        const data = await res.json();
        onTended(thought.id, data.thought);
        const msg = promotionMessages[data.thought.type] || "Tended.";
        showToast(msg);
      }
    } catch {
      showToast("Something went wrong.");
    }
    setTending(false);
  }

  const isBudding = thought.type === "budding";
  const isEvergreen = thought.type === "evergreen";
  const fontSize = thought.type === "seedling" ? "17px" : thought.type === "budding" ? "18px" : "19px";

  return (
    <motion.article
      initial={index < 8 ? { opacity: 0, y: 8 } : { opacity: 1, y: 0 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.4,
        ease: "easeOut",
        delay: index < 8 ? index * 0.05 : 0,
      }}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      className={`relative border-t border-[var(--border)] py-32 ${
        isBudding ? "border-l-[3px] border-l-[var(--accent-budding)] -ml-[20px] pl-[20px]" : ""
      }`}
    >
      {/* Metadata row */}
      <div className="flex items-start justify-between mb-16">
        <div className="flex items-center gap-8">
          <span className={`font-mono text-[10px] uppercase tracking-[0.12em] ${stage.className}`}>
            {stage.label}
          </span>
          {thought.project_tag && (
            <button
              onClick={() => onProjectClick(thought.project_tag!)}
              className="font-mono text-[11px] italic text-[var(--blue)] hover:underline"
            >
              {thought.project_tag}
            </button>
          )}
          {thought.tag && (
            <span className="font-mono text-[10px] text-[var(--text-muted)]">
              #{thought.tag}
            </span>
          )}
        </div>
        <span className="font-mono text-[11px] text-[var(--text-muted)] shrink-0 ml-16">
          {plantedTended(thought.planted_at, thought.tended_at)}
        </span>
      </div>

      {/* Title for evergreen entries */}
      {isEvergreen && thought.title && (
        <Link
          href={`/writing/${thought.title.toLowerCase().replace(/\s+/g, "-")}`}
          className="block font-serif text-[19px] font-medium text-[var(--text)] hover:text-[var(--accent)] transition-colors mb-8"
        >
          {thought.title}
        </Link>
      )}

      {/* Content */}
      {(!isEvergreen || !thought.title) && (
        <div
          className="prose-stream font-serif leading-[1.75] text-[var(--text)]"
          style={{ fontSize }}
        >
          <ReactMarkdown>{thought.content}</ReactMarkdown>
        </div>
      )}

      {/* Tend button — hover only */}
      <div className="flex justify-end mt-8 h-[24px]">
        {hovering && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
            onClick={isEvergreen ? undefined : handleTend}
            className="font-mono text-[11px] text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors"
          >
            {isEvergreen ? (
              <Link href={`/writing/${(thought.title || "").toLowerCase().replace(/\s+/g, "-")}`}>
                view essay →
              </Link>
            ) : (
              `→ tend`
            )}
          </motion.button>
        )}
      </div>
    </motion.article>
  );
}
