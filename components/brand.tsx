import Link from "next/link";
import Image from "next/image";

export function Brand({ compact = false }: { compact?: boolean }) {
  return <Link href="/" aria-label="Foyer home" className="flex items-center gap-2.5"><span className="relative h-9 w-9"><Image src="/brand/foyer-door-mark.png" alt="" fill sizes="36px" className="object-contain" priority /></span>{!compact && <span className="font-display text-lg font-semibold tracking-[-.04em]">FOYER</span>}</Link>;
}
