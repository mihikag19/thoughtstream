import { Header } from "@/components/header";
import { createClient } from "@supabase/supabase-js";
import { timeAgo } from "@/lib/time";
import ReactMarkdown from "react-markdown";
import { ToastProvider } from "@/components/toast";

export const dynamic = "force-dynamic";
export const revalidate = 30;

async function getSiteConfig() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const { data } = await supabase.from("site_config").select("key, value");
  const config: Record<string, string> = {};
  for (const row of data || []) config[row.key] = row.value;
  return config;
}

async function getLatestThought() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const { data } = await supabase
    .from("thoughts")
    .select("*")
    .eq("published", true)
    .order("planted_at", { ascending: false })
    .limit(1)
    .single();
  return data;
}

export default async function Home() {
  const [config, latest] = await Promise.all([
    getSiteConfig(),
    getLatestThought(),
  ]);

  const name = config.name || "Mihika Gupta";
  const tagline = config.tagline || "I build things and write about what it costs.";

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <ToastProvider />
      <main className="flex-1 flex flex-col justify-center px-24 max-w-[720px] mx-auto w-full -mt-80">
        <h1 className="font-serif font-light text-[42px] text-[var(--text)] tracking-tight">
          {name}
        </h1>
        <p className="font-serif italic text-[18px] text-[var(--text-muted)] mt-24">
          {tagline}
        </p>

        <div className="h-[1px] bg-[var(--border)] my-48" />

        {latest && (
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--text-muted)] mb-16">
              Latest
            </p>
            <div className="prose-stream font-serif text-[18px] leading-[1.75] text-[var(--text)] mb-16">
              <ReactMarkdown>{latest.content}</ReactMarkdown>
            </div>
            <div className="flex items-center gap-16 font-mono text-[11px] text-[var(--text-muted)]">
              <span>{timeAgo(latest.planted_at)}</span>
              {latest.tag && <span className="text-[var(--accent)]">#{latest.tag}</span>}
              {latest.project_tag && (
                <span className="text-[var(--blue)] italic">{latest.project_tag}</span>
              )}
            </div>
          </div>
        )}

        {!latest && (
          <p className="font-serif text-[18px] text-[var(--text-muted)]">
            No thoughts yet.
          </p>
        )}
      </main>
    </div>
  );
}
