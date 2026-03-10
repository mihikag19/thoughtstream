import { Header } from "@/components/header";
import { createClient } from "@supabase/supabase-js";
import { timeAgo } from "@/lib/time";
import ReactMarkdown from "react-markdown";

export const revalidate = 30;

async function getLatestThought() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data } = await supabase
    .from("thoughts")
    .select("*")
    .eq("published", true)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  return data;
}

export default async function Home() {
  const latest = await getLatestThought();

  return (
    <div className="min-h-screen flex flex-col font-[family-name:var(--font-geist-sans)]">
      <Header />
      <main className="flex-1 flex flex-col justify-center px-6 max-w-2xl mx-auto w-full -mt-20">
        <h1 className="text-3xl sm:text-4xl font-medium tracking-tight mb-2">
          Your Name
        </h1>
        <p className="text-[#a8a8a8] text-lg mb-16">
          Building things. Thinking out loud.
        </p>

        {latest && (
          <div className="border-t border-[#1a1a1a] pt-8">
            <p className="text-xs text-[#a8a8a8] uppercase tracking-wider mb-4">
              Latest thought
            </p>
            <div className="prose-stream text-[#e8e8e8] text-lg leading-relaxed mb-3">
              <ReactMarkdown>{latest.content}</ReactMarkdown>
            </div>
            <div className="flex items-center gap-3 text-sm text-[#666]">
              <span>{timeAgo(latest.created_at)}</span>
              {latest.tag && (
                <span className="text-[#a8a8a8]">#{latest.tag}</span>
              )}
            </div>
          </div>
        )}

        {!latest && (
          <div className="border-t border-[#1a1a1a] pt-8">
            <p className="text-[#666] text-lg">No thoughts yet.</p>
          </div>
        )}
      </main>
    </div>
  );
}
