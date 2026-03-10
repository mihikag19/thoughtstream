import { Header } from "@/components/header";
import Link from "next/link";

type Essay = {
  title: string;
  slug: string;
  date: string;
};

const essays: Essay[] = [
  { title: "Independence", slug: "independence", date: "October 2024" },
  { title: "The Quiet", slug: "the-quiet", date: "September 2024" },
];

export default function WritingPage() {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="px-24 max-w-[720px] mx-auto w-full pb-80">
        <h1 className="font-serif text-[24px] font-medium tracking-tight mb-8">
          Writing
        </h1>
        <p className="font-mono text-[12px] text-[var(--text-muted)] mb-48">
          Finished thinking.
        </p>

        <div className="space-y-32">
          {essays.map((essay) => (
            <Link
              key={essay.slug}
              href={`/writing/${essay.slug}`}
              className="block group"
            >
              <h2 className="font-serif text-[20px] text-[var(--text)] group-hover:text-[var(--accent)] transition-colors">
                {essay.title}
              </h2>
              <p className="font-mono text-[12px] text-[var(--text-muted)] mt-4">
                {essay.date}
              </p>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
