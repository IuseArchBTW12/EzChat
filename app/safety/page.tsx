import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { Brand } from "@/components/brand";

export const metadata = { title: "Room safety | Foyer" };

const principles = ["Use a room's owner and moderator tools to set clear boundaries.", "Do not share personal information or anything you would not want recorded.", "Leave a room if it feels unsafe or unwelcome.", "Room owners can remove messages, ban participants, and maintain blocked-word lists."];

export default function SafetyPage() {
  return <main className="min-h-screen bg-background"><header className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8"><Brand /><Link href="/" className="text-sm font-semibold text-muted-foreground hover:text-foreground">Back home</Link></header><section className="border-y border-border bg-secondary"><div className="mx-auto max-w-4xl px-4 py-24 sm:px-6"><ShieldCheck className="h-7 w-7 text-primary" /><p className="mt-7 text-xs font-semibold uppercase tracking-[.22em] text-primary">Room safety</p><h1 className="font-display mt-5 text-5xl font-semibold leading-[.92] tracking-[-.065em] sm:text-7xl">Good rooms have boundaries.</h1><p className="mt-8 max-w-2xl text-lg leading-8 text-muted-foreground">Foyer gives every room owner practical controls. Participants still make the room safe by using them well.</p></div></section><section className="mx-auto max-w-4xl px-4 py-20 sm:px-6"><ol className="divide-y divide-border border-y border-border">{principles.map((principle, index) => <li key={principle} className="grid grid-cols-[3rem_1fr] gap-4 py-7"><span className="font-display text-primary">0{index + 1}</span><p className="text-lg leading-7">{principle}</p></li>)}</ol></section></main>;
}
