"use client";

import { useState, useEffect } from "react";
import type { Thought } from "@/lib/supabase";

// Replace with Supabase Auth when multi-user

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [flash, setFlash] = useState<string | null>(null);

  // Site config
  const [name, setName] = useState("");
  const [tagline, setTagline] = useState("");
  const [now, setNow] = useState("");

  // Thoughts
  const [thoughts, setThoughts] = useState<Thought[]>([]);
  const [projectTags, setProjectTags] = useState<{ tag: string; count: number }[]>([]);

  useEffect(() => {
    const saved = sessionStorage.getItem("capture_auth");
    if (saved === "true") {
      setAuthenticated(true);
      setPassword(sessionStorage.getItem("capture_pw") || "");
    }
  }, []);

  useEffect(() => {
    if (authenticated) loadData();
  }, [authenticated]);

  async function loadData() {
    const [configRes, thoughtsRes] = await Promise.all([
      fetch("/api/config"),
      fetch("/api/thoughts?limit=20"),
    ]);

    if (configRes.ok) {
      const { config } = await configRes.json();
      setName(config.name || "");
      setTagline(config.tagline || "");
      setNow(config.now || "");
    }

    if (thoughtsRes.ok) {
      const { thoughts: t } = await thoughtsRes.json();
      setThoughts(t || []);
      const tags: Record<string, number> = {};
      for (const th of t || []) {
        if (th.project_tag) tags[th.project_tag] = (tags[th.project_tag] || 0) + 1;
      }
      setProjectTags(
        Object.entries(tags)
          .map(([tag, count]) => ({ tag, count }))
          .sort((a, b) => b.count - a.count)
      );
    }
  }

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

  async function saveConfig(key: string, value: string) {
    const res = await fetch("/api/config", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key, value, password }),
    });
    if (res.ok) {
      setFlash(`Saved ${key}.`);
      setTimeout(() => setFlash(null), 2000);
    }
  }

  async function tendThought(id: string) {
    const res = await fetch(`/api/thoughts/${id}/tend`, { method: "PATCH" });
    if (res.ok) {
      loadData();
      setFlash("Promoted.");
      setTimeout(() => setFlash(null), 2000);
    }
  }

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

  const buddingThoughts = thoughts.filter((t) => t.type === "budding");

  return (
    <div className="min-h-screen px-24 py-32 max-w-[720px] mx-auto">
      <h1 className="font-serif text-[24px] font-medium mb-48">Admin</h1>

      {flash && (
        <p className="font-mono text-[12px] text-[var(--accent)] mb-24">{flash}</p>
      )}

      {/* Section 1: Site Identity */}
      <section className="mb-64">
        <h2 className="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--text-muted)] mb-24">
          Site Identity
        </h2>
        <div className="space-y-24">
          <div>
            <label className="font-mono text-[11px] text-[var(--text-mid)] block mb-8">Name</label>
            <div className="flex gap-8">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="flex-1 bg-transparent border border-[var(--border)] rounded-lg px-16 py-8 text-[var(--text)] font-serif text-[16px] focus:outline-none focus:border-[var(--border-mid)]"
              />
              <button
                onClick={() => saveConfig("name", name)}
                className="font-mono text-[11px] text-[var(--text-muted)] hover:text-[var(--text)] px-16 border border-[var(--border)] rounded-lg"
              >
                Save
              </button>
            </div>
          </div>
          <div>
            <label className="font-mono text-[11px] text-[var(--text-mid)] block mb-8">Tagline</label>
            <div className="flex gap-8">
              <textarea
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                rows={2}
                className="flex-1 bg-transparent border border-[var(--border)] rounded-lg px-16 py-8 text-[var(--text)] font-serif text-[16px] focus:outline-none focus:border-[var(--border-mid)] resize-none"
              />
              <button
                onClick={() => saveConfig("tagline", tagline)}
                className="font-mono text-[11px] text-[var(--text-muted)] hover:text-[var(--text)] px-16 border border-[var(--border)] rounded-lg self-start"
              >
                Save
              </button>
            </div>
          </div>
          <div>
            <label className="font-mono text-[11px] text-[var(--text-mid)] block mb-8">Now</label>
            <div className="flex gap-8">
              <textarea
                value={now}
                onChange={(e) => setNow(e.target.value)}
                rows={3}
                className="flex-1 bg-transparent border border-[var(--border)] rounded-lg px-16 py-8 text-[var(--text)] font-serif text-[16px] focus:outline-none focus:border-[var(--border-mid)] resize-none"
              />
              <button
                onClick={() => saveConfig("now", now)}
                className="font-mono text-[11px] text-[var(--text-muted)] hover:text-[var(--text)] px-16 border border-[var(--border)] rounded-lg self-start"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: Recent Thoughts */}
      <section className="mb-64">
        <h2 className="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--text-muted)] mb-24">
          Recent Thoughts
        </h2>
        <div className="space-y-8">
          {thoughts.map((t) => (
            <div
              key={t.id}
              className="flex items-start gap-16 py-8 border-b border-[var(--border)]"
            >
              <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--text-dim)] shrink-0 w-[64px]">
                {t.type}
              </span>
              <p className="font-serif text-[14px] text-[var(--text-mid)] flex-1 leading-[1.5]">
                {t.content.slice(0, 100)}{t.content.length > 100 ? "..." : ""}
              </p>
              {t.type !== "evergreen" && (
                <button
                  onClick={() => tendThought(t.id)}
                  className="font-mono text-[10px] text-[var(--text-muted)] hover:text-[var(--accent)] shrink-0"
                >
                  tend →
                </button>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Section 3: Project Tags */}
      {projectTags.length > 0 && (
        <section className="mb-64">
          <h2 className="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--text-muted)] mb-24">
            Project Tags
          </h2>
          <div className="space-y-8">
            {projectTags.map((p) => (
              <div
                key={p.tag}
                className="flex items-center justify-between font-mono text-[12px] text-[var(--text-mid)]"
              >
                <span>{p.tag}</span>
                <span className="text-[var(--text-dim)]">{p.count} entries</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Section 4: Essay Stubs */}
      {buddingThoughts.length > 0 && (
        <section className="mb-64">
          <h2 className="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--text-muted)] mb-24">
            Essay Stubs (Budding)
          </h2>
          <div className="space-y-8">
            {buddingThoughts.map((t) => (
              <div
                key={t.id}
                className="flex items-center gap-16 py-8 border-b border-[var(--border)]"
              >
                <p className="font-serif text-[14px] text-[var(--text-mid)] flex-1">
                  {t.title || t.content.slice(0, 80)}
                </p>
                <button
                  onClick={() => tendThought(t.id)}
                  className="font-mono text-[10px] text-[var(--accent)] hover:text-[var(--text)] shrink-0"
                >
                  promote →
                </button>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
