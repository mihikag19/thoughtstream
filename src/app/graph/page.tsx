import { Header } from "@/components/header";

// Placeholder for Phase 2 — thought graph visualization.
// Requires D3.js force simulation, UMAP-js for dimensionality reduction,
// and betweenness centrality for identifying bridge ideas.
// Needs ~30 real entries before the graph is meaningful.

export default function GraphPage() {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="px-24 max-w-[640px] mx-auto w-full pb-80 flex flex-col items-center justify-center min-h-[60vh]">
        <p className="font-mono text-[14px] text-[var(--text-muted)] text-center">
          Coming soon — needs 30 entries first.
        </p>
      </main>
    </div>
  );
}
