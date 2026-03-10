"use client";

import { useState, useRef, useEffect } from "react";

// Replace with Supabase Auth when multi-user

const dailyPrompts = [
  "what broke today",
  "what are you not saying",
  "what changed your mind this week",
  "what would you build if no one was watching",
  "what's the most interesting thing you read today",
  "what's one thing you're avoiding",
  "what did you learn by doing it wrong",
];

type Mode = "quick" | "note" | "essay";
type GrowthStage = "seedling" | "budding" | "evergreen";

export default function CapturePage() {
  const [password, setPassword] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [mode, setMode] = useState<Mode>("quick");
  const [content, setContent] = useState("");
  const [title, setTitle] = useState("");
  const [tag, setTag] = useState("");
  const [projectTag, setProjectTag] = useState("");
  const [stage, setStage] = useState<GrowthStage>("seedling");
  const [submitting, setSubmitting] = useState(false);
  const [flash, setFlash] = useState<string | null>(null);
  const [existingTags, setExistingTags] = useState<string[]>([]);
  const [showTagSuggestions, setShowTagSuggestions] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const todayPrompt = dailyPrompts[new Date().getDay()];

  useEffect(() => {
    const saved = sessionStorage.getItem("capture_auth");
    if (saved === "true") {
      setAuthenticated(true);
      setPassword(sessionStorage.getItem("capture_pw") || "");
    }
  }, []);

  useEffect(() => {
    if (authenticated) {
      textareaRef.current?.focus();
      // Fetch existing project tags for autocomplete
      fetch("/api/thoughts?limit=500")
        .then((r) => r.json())
        .then((d) => {
          const tags = new Set<string>();
          for (const t of d.thoughts || []) {
            if (t.project_tag) tags.add(t.project_tag);
          }
          setExistingTags(Array.from(tags).sort());
        })
        .catch(() => {});
    }
  }, [authenticated]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/thoughts/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: "__auth_check__", password }),
    });
    if (res.status === 401) {
      setFlash("Wrong password.");
      return;
    }
    setAuthenticated(true);
    sessionStorage.setItem("capture_auth", "true");
    sessionStorage.setItem("capture_pw", password);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim() || submitting) return;

    setSubmitting(true);
    setFlash(null);

    try {
      const body: Record<string, string | null> = {
        content: content.trim(),
        type: stage,
        password,
        tag: tag.trim() || null,
        project_tag: projectTag.trim() || null,
      };

      if (mode !== "quick" && title.trim()) {
        body.title = title.trim();
      }

      const res = await fetch("/api/thoughts/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        setFlash(data.error || "Something went wrong.");
        return;
      }

      // Optimistic clear
      setContent("");
      setTitle("");
      setTag("");
      setStage("seedling");
      setFlash("Published.");
      setTimeout(() => setFlash(null), 2000);
      textareaRef.current?.focus();
    } catch {
      setFlash("Network error. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  const filteredTags = existingTags.filter(
    (t) => t.toLowerCase().includes(projectTag.toLowerCase()) && projectTag.trim()
  );

  if (!authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center px-24">
        <form onSubmit={handleLogin} className="w-full max-w-[320px]">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="password"
            autoFocus
            className="w-full bg-transparent border border-[var(--border)] rounded-lg px-16 py-16 text-[var(--text)] placeholder-[var(--text-dim)] focus:outline-none focus:border-[var(--border-mid)] transition-colors font-mono text-[14px]"
          />
          {flash && <p className="text-red-400 font-mono text-[12px] mt-16">{flash}</p>}
          <button
            type="submit"
            className="mt-16 w-full bg-[var(--bg-raised)] hover:bg-[var(--border-mid)] text-[var(--text)] rounded-lg px-16 py-16 font-mono text-[12px] transition-colors"
          >
            enter
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col px-24">
      <div className="flex-1 flex flex-col justify-center max-w-[660px] mx-auto w-full py-32">
        {/* Daily prompt */}
        <p className="font-mono text-[11px] text-[var(--text-dim)] mb-32">
          {todayPrompt}
        </p>

        {/* Mode tabs */}
        <div className="flex gap-16 mb-24">
          {(["quick", "note", "essay"] as Mode[]).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`font-mono text-[11px] uppercase tracking-[0.12em] transition-colors ${
                mode === m ? "text-[var(--text)]" : "text-[var(--text-muted)] hover:text-[var(--text-mid)]"
              }`}
            >
              {m}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-16">
          {/* Title for note/essay modes */}
          {mode !== "quick" && (
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="title"
              className="w-full bg-transparent border-b border-[var(--border)] pb-8 text-[var(--text)] placeholder-[var(--text-dim)] focus:outline-none focus:border-[var(--border-mid)] transition-colors font-serif text-[24px]"
            />
          )}

          {/* Textarea */}
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="what are you thinking"
            rows={mode === "essay" ? 12 : 6}
            className="w-full bg-transparent focus:outline-none text-[var(--text)] placeholder-[var(--text-dim)] font-serif text-[18px] leading-[1.75] resize-none"
          />

          {/* Growth stage selector */}
          <div className="flex gap-8">
            {(["seedling", "budding", "evergreen"] as GrowthStage[]).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setStage(s)}
                className={`font-mono text-[10px] uppercase tracking-[0.12em] px-12 py-4 rounded-full border transition-colors ${
                  stage === s
                    ? "text-[var(--accent)] border-[var(--accent-border)] bg-[var(--accent-dim)]"
                    : "text-[var(--text-muted)] border-[var(--border)] hover:border-[var(--border-mid)]"
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          {/* Tags row */}
          <div className="flex gap-8">
            <input
              type="text"
              value={tag}
              onChange={(e) => setTag(e.target.value)}
              placeholder="tag"
              className="flex-1 bg-transparent border border-[var(--border)] rounded-lg px-16 py-8 text-[var(--text)] placeholder-[var(--text-dim)] focus:outline-none focus:border-[var(--border-mid)] transition-colors font-mono text-[12px]"
            />
            <div className="relative flex-1">
              <input
                type="text"
                value={projectTag}
                onChange={(e) => {
                  setProjectTag(e.target.value);
                  setShowTagSuggestions(true);
                }}
                onFocus={() => setShowTagSuggestions(true)}
                onBlur={() => setTimeout(() => setShowTagSuggestions(false), 200)}
                placeholder="project"
                className="w-full bg-transparent border border-[var(--border)] rounded-lg px-16 py-8 text-[var(--text)] placeholder-[var(--text-dim)] focus:outline-none focus:border-[var(--border-mid)] transition-colors font-mono text-[12px]"
              />
              {showTagSuggestions && filteredTags.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-4 bg-[var(--bg-raised)] border border-[var(--border-mid)] rounded-lg overflow-hidden z-10">
                  {filteredTags.map((t) => (
                    <button
                      key={t}
                      type="button"
                      onMouseDown={() => {
                        setProjectTag(t);
                        setShowTagSuggestions(false);
                      }}
                      className="block w-full text-left px-16 py-8 font-mono text-[12px] text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--border)] transition-colors"
                    >
                      {t}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Submit */}
          <div className="flex items-center gap-16">
            <button
              type="submit"
              disabled={!content.trim() || submitting}
              className="bg-[var(--text)] text-[var(--bg)] rounded-lg px-24 py-8 font-mono text-[12px] font-medium hover:bg-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              {submitting ? "..." : mode === "essay" ? "publish" : "send"}
            </button>
            {flash && (
              <span
                className={`font-mono text-[12px] ${
                  flash === "Published." ? "text-[var(--text-muted)]" : "text-red-400"
                }`}
              >
                {flash}
              </span>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
