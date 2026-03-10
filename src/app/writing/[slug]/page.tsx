import { Header } from "@/components/header";
import Link from "next/link";
import fs from "fs";
import path from "path";
import ReactMarkdown from "react-markdown";
import { notFound } from "next/navigation";

const essayMeta: Record<string, { title: string; date: string }> = {
  independence: { title: "Independence", date: "October 2024" },
  "the-quiet": { title: "The Quiet", date: "September 2024" },
};

export function generateStaticParams() {
  return Object.keys(essayMeta).map((slug) => ({ slug }));
}

export default function EssayPage({ params }: { params: { slug: string } }) {
  const meta = essayMeta[params.slug];
  if (!meta) notFound();

  const filePath = path.join(process.cwd(), "content", "essays", `${params.slug}.md`);
  let content = "";
  try {
    content = fs.readFileSync(filePath, "utf-8");
    // Remove the markdown title (first line starting with #) since we render it separately
    content = content.replace(/^#\s+.*\n+/, "");
  } catch {
    notFound();
  }

  return (
    <div className="min-h-screen">
      <Header />
      <main className="px-24 max-w-[640px] mx-auto w-full pb-80">
        <Link
          href="/stream"
          className="font-mono text-[11px] text-[var(--text-muted)] hover:text-[var(--text)] transition-colors"
        >
          ← stream
        </Link>

        <h1 className="font-serif text-[32px] font-medium tracking-tight mt-48 mb-8">
          {meta.title}
        </h1>
        <p className="font-mono text-[12px] text-[var(--text-muted)] mb-48">
          {meta.date}
        </p>

        <article className="prose-essay">
          <ReactMarkdown>{content}</ReactMarkdown>
        </article>

        <div className="mt-64 pt-32 border-t border-[var(--border)]">
          <Link
            href="/colophon"
            className="font-mono text-[11px] text-[var(--text-dim)] hover:text-[var(--text-muted)] transition-colors"
          >
            colophon
          </Link>
        </div>
      </main>
    </div>
  );
}
