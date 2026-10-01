import Link from "next/link";

export function Brand({ compact = false }: { compact?: boolean }) {
  return <Link href="/" aria-label="Foyer home" className="flex items-center gap-2.5"><span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground"><svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M5 20V4h11v16" /><path d="M10 4v16" /><path d="M13 12h.01" /></svg></span>{!compact && <span className="font-display text-lg font-semibold tracking-[-.04em]">FOYER</span>}</Link>;
}
