import Link from "next/link";
import { Brand } from "@/components/brand";

const guidelines = ["Treat everyone in a room as a person, not content.", "Keep consent clear before recording, sharing screens, or making anyone the focus.", "Do not share private details, dox people, threaten them, or impersonate them.", "Respect the room owner and moderators. Leave when asked."];

export const metadata = { title: "Community guidelines | Foyer" };

export default function GuidelinesPage() { return <main className="min-h-screen bg-background"><header className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8"><Brand /><Link href="/" className="text-sm font-semibold text-muted-foreground hover:text-foreground">Back home</Link></header><section className="border-y border-border"><div className="mx-auto max-w-4xl px-4 py-24 sm:px-6"><p className="text-xs font-semibold uppercase tracking-[.22em] text-primary">Community guidelines</p><h1 className="font-display mt-5 text-5xl font-semibold leading-[.92] tracking-[-.065em] sm:text-7xl">Show up well.</h1><p className="mt-8 max-w-2xl text-lg leading-8 text-muted-foreground">Every room has its own character. These basics apply everywhere.</p></div></section><ol className="mx-auto max-w-4xl divide-y divide-border border-y border-border px-4 py-16 sm:px-6">{guidelines.map((guideline, index) => <li key={guideline} className="grid grid-cols-[3rem_1fr] gap-4 py-7"><span className="font-display text-primary">0{index + 1}</span><p className="text-lg leading-7">{guideline}</p></li>)}</ol></main>; }
