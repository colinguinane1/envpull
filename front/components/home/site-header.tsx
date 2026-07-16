import Link from "next/link";
import { EnvPullMark } from "@/components/envpull-mark";
import { SocialLinks } from "@/components/home/social-links";

export function SiteHeader() {
  return (
    <header className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-6">
      <Link
        href="/"
        className="flex items-center gap-2.5 font-display text-xl font-semibold tracking-tight text-foreground"
      >
        <EnvPullMark size={28} priority />
        envpull
      </Link>
      <nav className="flex items-center gap-1.5" aria-label="Social">
        <SocialLinks />
      </nav>
    </header>
  );
}
