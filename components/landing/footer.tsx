import { Brand } from "@/components/brand";

export function Footer() { return <footer className="border-t border-border py-8"><div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8"><Brand /><p>© {new Date().getFullYear()} Foyer. Built for live conversation.</p></div></footer>; }
