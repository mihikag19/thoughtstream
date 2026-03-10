import { Header } from "@/components/header";
import { createClient } from "@supabase/supabase-js";
import { timeAgo } from "@/lib/time";
import type { Thought } from "@/lib/supabase";

export const dynamic = "force-dynamic";
export const revalidate = 30;

type Project = {
  name: string;
  tag: string;
  oneLiner: string;
  narrative: string;
  status: "Active";
};

const projects: Project[] = [
  {
    name: "Signal",
    tag: "Signal",
    oneLiner: "Making startup intuition empirical.",
    narrative: `I wanted to know if startup intuition could be made empirical.

Signal scrapes Reddit and HN, runs Mom Test analysis on real conversations, and produces a quantitative validation score. The bet: that the internet contains real signals about what people actually hate, and that structured listening can be operationalized. Won Best Technical Under the Hood at IYA Hackathon. Still not sure if the score means anything. That's the interesting part.`,
    status: "Active",
  },
  {
    name: "Latch",
    tag: "Latch",
    oneLiner: "Compliance infrastructure for FDA-regulated biotech.",
    narrative: `FDA-regulated biotech teams are terrified of misconfiguration.

One cloud config drift can set back a drug trial by months. Latch detects it, classifies it against 21 CFR Part 11, and auto-generates remediation PRs. I'm a sophomore. I'm building compliance infrastructure for an industry I'm not from. I think about that a lot.`,
    status: "Active",
  },
  {
    name: "Canvas",
    tag: "Canvas",
    oneLiner: "This site. A place to think in public before I know what I think.",
    narrative: `Built because the gap between what my LLM knows and what the world knows was too wide.

The stream is the thinking. The work page is the building. The writing is what survives.`,
    status: "Active",
  },
];

async function getProjectEntries(tag: string): Promise<Thought[]> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const { data } = await supabase
    .from("thoughts")
    .select("*")
    .eq("published", true)
    .eq("project_tag", tag)
    .order("planted_at", { ascending: false })
    .limit(3);
  return (data as Thought[]) || [];
}

export default async function WorkPage() {
  const projectEntries: Record<string, Thought[]> = {};
  for (const p of projects) {
    projectEntries[p.tag] = await getProjectEntries(p.tag);
  }

  return (
    <div className="min-h-screen">
      <Header />
      <main className="px-24 max-w-[720px] mx-auto w-full pb-80">
        <h1 className="font-serif text-[24px] font-medium tracking-tight mb-8">
          Work
        </h1>
        <p className="font-mono text-[12px] text-[var(--text-muted)] mb-48">
          Not a portfolio. The narrative of what I&apos;m inside right now.
        </p>

        <div className="space-y-48">
          {projects.map((project) => (
            <div
              key={project.name}
              className="bg-[var(--bg-raised)] border border-[var(--border)] rounded-lg p-32"
            >
              <div className="flex items-center justify-between mb-8">
                <h2 className="font-serif text-[24px] font-medium">{project.name}</h2>
                <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-green-400">
                  {project.status}
                </span>
              </div>
              <p className="font-serif italic text-[17px] text-[var(--text-muted)] mb-24">
                {project.oneLiner}
              </p>
              {project.narrative.split("\n\n").map((para, i) => (
                <p
                  key={i}
                  className="font-serif text-[16px] leading-[1.75] text-[var(--text-mid)] mb-16"
                >
                  {para}
                </p>
              ))}

              {/* Live entries from stream */}
              {projectEntries[project.tag]?.length > 0 && (
                <div className="mt-24 pt-24 border-t border-[var(--border)]">
                  <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--text-muted)] mb-16">
                    Recent from stream
                  </p>
                  {projectEntries[project.tag].map((entry) => (
                    <div key={entry.id} className="mb-16 last:mb-0">
                      <p className="font-serif text-[14px] text-[var(--text-mid)] leading-[1.6]">
                        {entry.content.slice(0, 120)}
                        {entry.content.length > 120 ? "..." : ""}
                      </p>
                      <p className="font-mono text-[10px] text-[var(--text-dim)] mt-4">
                        {timeAgo(entry.planted_at)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
