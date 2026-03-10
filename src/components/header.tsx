import Link from "next/link";

export function Header() {
  return (
    <header className="flex items-center justify-between py-8 px-6 max-w-2xl mx-auto w-full">
      <Link href="/" className="text-[#e8e8e8] font-medium hover:text-white transition-colors">
        ts
      </Link>
      <nav className="flex gap-6 text-sm text-[#a8a8a8]">
        <Link href="/stream" className="hover:text-[#e8e8e8] transition-colors">
          stream
        </Link>
        <Link href="/work" className="hover:text-[#e8e8e8] transition-colors">
          work
        </Link>
      </nav>
    </header>
  );
}
