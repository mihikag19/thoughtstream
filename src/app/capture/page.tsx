"use client";

import { useState, useRef, useEffect } from "react";

// Password protection: replace with Supabase Auth when multi-user
export default function CapturePage() {
  const [password, setPassword] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [content, setContent] = useState("");
  const [tag, setTag] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [flash, setFlash] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const saved = sessionStorage.getItem("capture_auth");
    if (saved === "true") setAuthenticated(true);
  }, []);

  useEffect(() => {
    if (authenticated && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [authenticated]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    // Verify password via API — the actual check happens server-side
    const res = await fetch("/api/thoughts/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: "__auth_check__", password }),
    });
    // We expect a 400 (content validation) or 201 if it somehow works
    // A 401 means wrong password
    if (res.status === 401) {
      setFlash("Wrong password.");
      return;
    }
    setAuthenticated(true);
    sessionStorage.setItem("capture_auth", "true");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim() || submitting) return;

    setSubmitting(true);
    setFlash(null);

    try {
      const res = await fetch("/api/thoughts/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: content.trim(),
          tag: tag.trim() || null,
          password,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setFlash(data.error || "Something went wrong.");
        return;
      }

      // Optimistic clear
      setContent("");
      setTag("");
      setFlash("Published.");
      setTimeout(() => setFlash(null), 2000);

      if (textareaRef.current) {
        textareaRef.current.focus();
      }
    } catch {
      setFlash("Network error. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (!authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <form onSubmit={handleLogin} className="w-full max-w-sm">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="password"
            autoFocus
            className="w-full bg-transparent border border-[#222] rounded-lg px-4 py-3 text-[#e8e8e8] placeholder-[#444] focus:outline-none focus:border-[#444] transition-colors text-base"
          />
          {flash && (
            <p className="text-red-400 text-sm mt-3">{flash}</p>
          )}
          <button
            type="submit"
            className="mt-4 w-full bg-[#1a1a1a] hover:bg-[#222] text-[#e8e8e8] rounded-lg px-4 py-3 text-sm transition-colors"
          >
            enter
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col px-6 pt-safe">
      <div className="flex-1 flex flex-col justify-center max-w-2xl mx-auto w-full py-8">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 flex-1 justify-center">
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="what are you thinking"
            rows={6}
            className="w-full bg-transparent border border-[#222] rounded-lg px-4 py-4 text-[#e8e8e8] placeholder-[#444] focus:outline-none focus:border-[#444] transition-colors text-base leading-relaxed resize-none"
          />
          <div className="flex gap-3 items-center">
            <input
              type="text"
              value={tag}
              onChange={(e) => setTag(e.target.value)}
              placeholder="tag (optional)"
              className="flex-1 bg-transparent border border-[#222] rounded-lg px-4 py-3 text-[#e8e8e8] placeholder-[#444] focus:outline-none focus:border-[#444] transition-colors text-sm"
            />
            <button
              type="submit"
              disabled={!content.trim() || submitting}
              className="bg-[#e8e8e8] text-[#0a0a0a] rounded-lg px-6 py-3 text-sm font-medium hover:bg-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed shrink-0"
            >
              {submitting ? "..." : "publish"}
            </button>
          </div>
          {flash && (
            <p className={`text-sm ${flash === "Published." ? "text-[#a8a8a8]" : "text-red-400"}`}>
              {flash}
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
