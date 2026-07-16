import { Button } from "@/components/ui/button";
import { GitHubIcon, NpmIcon } from "@/components/brand-icons";

const GITHUB_URL = "https://github.com/colinguinane1/envpull";
const NPM_URL = "https://www.npmjs.com/package/@colinguinane/envpull-cli";

type SocialLinksProps = {
  size?: "icon" | "icon-lg";
  variant?: "ghost" | "outline";
};

export function SocialLinks({
  size = "icon",
  variant = "ghost",
}: SocialLinksProps) {
  return (
    <>
      <Button
        variant={variant}
        size={size}
        nativeButton={false}
        aria-label="GitHub repository"
        render={
          <a href={GITHUB_URL} target="_blank" rel="noreferrer" />
        }
      >
        <GitHubIcon className="size-5" />
      </Button>
      <Button
        variant={variant}
        size={size}
        nativeButton={false}
        aria-label="npm package"
        render={<a href={NPM_URL} target="_blank" rel="noreferrer" />}
      >
        <NpmIcon className="size-5" />
      </Button>
    </>
  );
}
