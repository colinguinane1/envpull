"use client";

import { useState } from "react";
import { CheckIcon, CopyIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const INSTALL_CMD = "npm i -g @colinguinane/envpull-cli";

export function InstallCommand({ className }: { className?: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    await navigator.clipboard.writeText(INSTALL_CMD);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <div
      className={cn(
        "flex w-full max-w-xl items-center gap-2 rounded-xl border border-border bg-card/80 p-2 shadow-none backdrop-blur-sm",
        className,
      )}
    >
      <code className="min-w-0 flex-1 overflow-x-auto px-3 py-2 font-mono text-sm text-foreground">
        {INSTALL_CMD}
      </code>
      <Button
        type="button"
        variant="secondary"
        size="sm"
        onClick={copy}
        className="shrink-0"
        aria-label="Copy install command"
      >
        {copied ? <CheckIcon /> : <CopyIcon />}
        {copied ? "Copied" : "Copy"}
      </Button>
    </div>
  );
}
