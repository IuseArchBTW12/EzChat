import Link from "next/link";
import { Brand } from "@/components/brand";

export function Footer() { return <footer className="border-t border-border py-8"><div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 text-sm text-muted-foreground sm:px-6 lg:px-8"><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center"><Brand /><nav className="flex gap-4"><Link href="/about">About</Link><Link href="/safety">Safety</Link><Link href="/guidelines">Guidelines</Link><Link href="/faq">FAQ</Link></nav></div><p>© {new Date().getFullYear()} Foyer. Built for live conversation.</p></div></footer>; }
