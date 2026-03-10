import { Header } from "@/components/header";

export default function ColophonPage() {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="px-24 max-w-[640px] mx-auto w-full pb-80">
        <h1 className="font-serif text-[24px] font-medium tracking-tight mb-48">
          Colophon
        </h1>

        <article className="prose-essay">
          <p>
            This site exists because I wanted a place where the thinking is primary
            and the projects are evidence of the thinking. Not a portfolio. Not a blog.
            A proof of life.
          </p>
          <p>
            The core thesis: the gap between what an LLM knows about you and what the
            world knows about you is a product problem. This site closes it.
          </p>

          <h2>Architecture</h2>
          <p>
            The stream is a reverse-chronological feed stored in Supabase Postgres.
            Every entry gets an embedding via OpenAI&apos;s text-embedding-3-small model,
            stored as a 1536-dimensional vector using pgvector. This happens
            asynchronously through a Supabase Edge Function — the capture interface
            never waits for it.
          </p>
          <p>
            The embeddings are the foundation for a future thought graph: a
            force-directed visualization where nodes are entries and edges are
            relationships — graduation edges (seedling → budding → evergreen),
            project tag clusters, and semantic similarity computed from cosine
            distance. UMAP will project the high-dimensional space to 2D for layout.
            Betweenness centrality will identify bridge ideas worth developing.
          </p>
          <p>
            None of that exists yet. But every entry published without an embedding
            is data that would need to be backfilled later, so the infrastructure
            runs from day one.
          </p>

          <h2>Tech Stack</h2>
          <p>
            <strong>Next.js 14</strong> — App Router, TypeScript throughout. Server
            components for the public pages, client components for interactivity.
          </p>
          <p>
            <strong>Supabase</strong> — Postgres with pgvector for embeddings, plus
            Edge Functions for async processing. Row Level Security for public reads.
          </p>
          <p>
            <strong>Tailwind CSS</strong> — 8px spacing scale, strictly. The
            constraint forces visual consistency.
          </p>
          <p>
            <strong>Framer Motion</strong> — Animations only, not layout. Staggered
            fade-in on stream entries, toast notifications, memory modal.
          </p>
          <p>
            <strong>Lora</strong> — Serif. For everything that&apos;s meant to be read.
          </p>
          <p>
            <strong>IBM Plex Mono</strong> — For everything that&apos;s meant to be
            scanned: timestamps, tags, metadata, labels.
          </p>
          <p>
            <strong>Vercel</strong> — Deployment. ISR for public pages with
            30-second revalidation.
          </p>

          <h2>Growth Stages</h2>
          <p>
            Borrowed from Maggie Appleton&apos;s digital garden philosophy. Every entry
            is a seedling, budding, or evergreen. Seedlings are raw. Budding entries
            have been tended — revisited, expanded, reconsidered. Evergreen entries
            have graduated into essays.
          </p>
          <p>
            The &ldquo;tend&rdquo; mechanic is a single click that promotes an entry one
            stage. It&apos;s deliberately low-friction — the act of tending should feel
            like noticing, not editing.
          </p>

          <h2>Design Decisions</h2>
          <p>
            Dark mode only. The grain overlay (SVG noise filter at 32% opacity)
            makes the background feel like paper, not a screen. The amber accent
            is used sparingly — active filters, the pulse dot, growth stage tags.
          </p>
          <p>
            No footer. No social links. No analytics. The intentional sparseness
            is the design.
          </p>
        </article>
      </main>
    </div>
  );
}
