import { EnvPullMark } from "@/components/envpull-mark";
import { SocialLinks } from "@/components/home/social-links";

export function SiteFooter() {
  return (
    <footer className="mx-auto flex w-full max-w-5xl flex-col gap-4 border-t border-border px-6 py-10 text-sm text-ink-soft sm:flex-row sm:items-center sm:justify-between">
      <span className="flex items-center gap-2 font-display text-base font-semibold text-foreground">
        <EnvPullMark size={22} />
        envpull
      </span>
      <div className="flex items-center gap-1.5">
        <SocialLinks />
      </div>
    </footer>
  );
}
