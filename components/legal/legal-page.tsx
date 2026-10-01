import Link from "next/link";
import { Brand } from "@/components/brand";

type LegalSection = { heading: string; paragraphs: string[]; items?: string[] };

export function LegalPage({ label, title, intro, sections }: { label: string; title: string; intro: string; sections: LegalSection[] }) {
  return <main className="min-h-screen bg-background">
    <header className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8"><Brand /><Link href="/" className="text-sm font-semibold text-muted-foreground hover:text-foreground">Back home</Link></header>
    <section className="border-y border-border bg-secondary"><div className="mx-auto max-w-4xl px-4 py-20 sm:px-6 sm:py-24"><p className="text-xs font-semibold uppercase tracking-[.22em] text-primary">{label}</p><h1 className="font-display mt-5 text-5xl font-semibold leading-[.92] tracking-[-.065em] sm:text-7xl">{title}</h1><p className="mt-8 max-w-2xl text-lg leading-8 text-muted-foreground">{intro}</p><p className="mt-6 text-sm text-muted-foreground">Last updated: October 2, 2026</p></div></section>
    <article className="mx-auto max-w-4xl px-4 py-16 sm:px-6 sm:py-20"><div className="space-y-14">{sections.map((section) => <section key={section.heading}><h2 className="font-display text-3xl font-semibold tracking-[-.035em]">{section.heading}</h2><div className="mt-4 space-y-4 leading-7 text-muted-foreground">{section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}{section.items && <ul className="list-disc space-y-2 pl-5">{section.items.map((item) => <li key={item}>{item}</li>)}</ul>}</div></section>)}</div></article>
    <footer className="border-t border-border"><nav aria-label="Legal links" className="mx-auto flex max-w-4xl flex-wrap gap-x-6 gap-y-3 px-4 py-8 text-sm font-semibold sm:px-6"><Link href="/terms" className="hover:text-primary">Terms</Link><Link href="/privacy" className="hover:text-primary">Privacy</Link><Link href="/cookies" className="hover:text-primary">Cookies</Link><Link href="/guidelines" className="hover:text-primary">Guidelines</Link></nav></footer>
  </main>;
}
