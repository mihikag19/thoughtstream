"use client";

import ReactMarkdown from "react-markdown";
import { timeAgo } from "@/lib/time";
import type { Thought } from "@/lib/supabase";

export function StreamEntry({ thought, index }: { thought: Thought; index: number }) {
  return (
    <article
      className="border-t border-[#1a1a1a] py-8 animate-fade-in"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <div className="prose-stream text-[#e8e8e8] text-base leading-[1.8] mb-3">
        <ReactMarkdown>{thought.content}</ReactMarkdown>
      </div>
      <div className="flex items-center gap-3 text-sm text-[#666]">
        <span>{timeAgo(thought.created_at)}</span>
        {thought.tag && (
          <span className="text-[#a8a8a8]">#{thought.tag}</span>
        )}
      </div>
    </article>
  );
}
