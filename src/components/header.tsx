"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { PulseIndicator } from "./pulse-indicator";

export function Header() {
  const pathname = usePathname();

  const links = [
    { href: "/stream", label: "Stream" },
    { href: "/work", label: "Work" },
    { href: "/writing", label: "Writing" },
  ];

  return (
    <header className="flex items-center justify-between py-32 px-24 max-w-[960px] mx-auto w-full">
      <Link
        href="/"
        className="font-serif text-[var(--text)] text-[14px] hover:text-white transition-colors"
      >
        Mihika Gupta
      </Link>
      <div className="flex items-center gap-24">
        <nav className="flex gap-16">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`font-mono text-[12px] transition-colors ${
                pathname === link.href || pathname.startsWith(link.href + "/")
                  ? "text-[var(--text)]"
                  : "text-[var(--text-muted)] hover:text-[var(--text)]"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <PulseIndicator />
      </div>
    </header>
  );
}
