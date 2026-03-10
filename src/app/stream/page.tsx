import { Header } from "@/components/header";
import { createClient } from "@supabase/supabase-js";
import { StreamEntry } from "./stream-entry";
import type { Thought } from "@/lib/supabase";

export const revalidate = 30;

async function getThoughts(): Promise<Thought[]> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data } = await supabase
    .from("thoughts")
    .select("*")
    .eq("published", true)
    .order("created_at", { ascending: false });

  return (data as Thought[]) || [];
}

export default async function StreamPage() {
  const thoughts = await getThoughts();

  return (
    <div className="min-h-screen">
      <Header />
      <main className="px-6 max-w-2xl mx-auto w-full pb-20">
        <h1 className="text-2xl font-medium tracking-tight mb-2">Stream</h1>
        <p className="text-[#a8a8a8] text-sm mb-12">
          Raw thoughts, in reverse chronological order.
        </p>

        {thoughts.length === 0 && (
          <p className="text-[#666] text-lg">Nothing here yet.</p>
        )}

        <div className="space-y-0">
          {thoughts.map((thought, i) => (
            <StreamEntry key={thought.id} thought={thought} index={i} />
          ))}
        </div>
      </main>
    </div>
  );
}
