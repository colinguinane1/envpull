import { Separator } from "@/components/ui/separator";
import { SiteHeader } from "@/components/home/site-header";
import { SiteFooter } from "@/components/home/site-footer";
import { HeroSection } from "@/components/home/hero-section";
import { PrinciplesSection } from "@/components/home/principles-section";
import { CommandsSection } from "@/components/home/commands-section";
import { InstallSection } from "@/components/home/install-section";

export function HomePage() {
  return (
    <div className="site-bg min-h-full">
      <SiteHeader />
      <main>
        <HeroSection />
        <Separator className="mx-auto max-w-5xl" />
        <PrinciplesSection />
        <Separator className="mx-auto max-w-5xl" />
        <CommandsSection />
        <Separator className="mx-auto max-w-5xl" />
        <InstallSection />
      </main>
      <SiteFooter />
    </div>
  );
}
