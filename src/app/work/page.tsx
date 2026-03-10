import { Header } from "@/components/header";

type Project = {
  name: string;
  oneLiner: string;
  narrative: string;
  status: "Active" | "Exploring" | "Shipped";
};

// Edit your projects here
const projects: Project[] = [
  {
    name: "Signal",
    oneLiner: "Real-time analytics for creator workflows.",
    narrative:
      "Signal started as a side project to understand how creators actually spend their time. It pulls data from tools people already use and surfaces patterns they'd never notice on their own. Currently in closed beta with a handful of power users.",
    status: "Active",
  },
  {
    name: "Latch",
    oneLiner: "Lightweight auth for weekend projects.",
    narrative:
      "Most auth solutions are overkill for small projects. Latch gives you password-free login in under five minutes with a single API call. No SDKs, no dashboards, no pricing tiers — just authentication.",
    status: "Exploring",
  },
  {
    name: "Primer",
    oneLiner: "A reading tool that helps you retain what matters.",
    narrative:
      "Primer watches what you read and surfaces the ideas you're most likely to forget. It uses spaced repetition without the flashcard busywork. Built it for myself, then realized others wanted the same thing.",
    status: "Shipped",
  },
];

const statusColor: Record<Project["status"], string> = {
  Active: "text-green-400",
  Exploring: "text-yellow-400",
  Shipped: "text-blue-400",
};

export default function WorkPage() {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="px-6 max-w-2xl mx-auto w-full pb-20">
        <h1 className="text-2xl font-medium tracking-tight mb-2">Work</h1>
        <p className="text-[#a8a8a8] text-sm mb-12">
          Things I&apos;m building or have built.
        </p>

        <div className="space-y-4">
          {projects.map((project) => (
            <div
              key={project.name}
              className="bg-[#111] border border-[#1a1a1a] rounded-xl p-6"
            >
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-lg font-medium">{project.name}</h2>
                <span className={`text-xs font-medium ${statusColor[project.status]}`}>
                  {project.status}
                </span>
              </div>
              <p className="text-[#a8a8a8] text-sm mb-3">{project.oneLiner}</p>
              <p className="text-[#888] text-sm leading-relaxed">
                {project.narrative}
              </p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
