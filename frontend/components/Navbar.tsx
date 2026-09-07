"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";

const LINKS = [
  { href: "/simulate", label: "Call Simulator" },
  { href: "/detect", label: "Detect" },
  { href: "/verify", label: "Verify" },
  { href: "/research", label: "Research Lab" },
  { href: "/about", label: "About" },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-white/5 bg-navy-950/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
        <Link href="/" className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-cyan-accent shadow-[0_0_12px_2px_rgba(34,211,238,0.6)]" />
          <span className="font-mono-vs text-lg font-semibold tracking-tight text-white">
            VoiceShield<span className="text-cyan-accent">-AI</span>
          </span>
        </Link>
        <nav className="hidden gap-1 md:flex">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={clsx(
                "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                pathname?.startsWith(link.href)
                  ? "bg-white/10 text-cyan-accent"
                  : "text-slate-300 hover:bg-white/5 hover:text-white"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <Link
          href="/detect"
          className="rounded-lg bg-cyan-accent/90 px-4 py-2 text-sm font-semibold text-navy-950 transition hover:bg-cyan-accent"
        >
          Analyze a Voice
        </Link>
      </div>
    </header>
  );
}
