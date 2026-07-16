"use client";

import { useState } from "react";
import { CheckIcon, CopyIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const PACKAGE = "@colinguinane/envpull-cli";

const MANAGERS = [
  { id: "pnpm", label: "pnpm", command: `pnpm add -g ${PACKAGE}` },
  { id: "npm", label: "npm", command: `npm i -g ${PACKAGE}` },
  { id: "yarn", label: "yarn", command: `yarn global add ${PACKAGE}` },
  { id: "bun", label: "bun", command: `bun add -g ${PACKAGE}` },
] as const;

type ManagerId = (typeof MANAGERS)[number]["id"];

export function InstallCommand({ className }: { className?: string }) {
  const [manager, setManager] = useState<ManagerId>("pnpm");
  const [copied, setCopied] = useState(false);

  const command =
    MANAGERS.find((item) => item.id === manager)?.command ?? MANAGERS[0].command;

  async function copy() {
    await navigator.clipboard.writeText(command);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <div className={cn("flex w-full max-w-xl flex-col gap-3", className)}>
      <div
        role="tablist"
        aria-label="Package manager"
        className="flex w-fit items-center gap-0.5 rounded-lg border border-border bg-card/80 p-1"
      >
        {MANAGERS.map((item) => {
          const selected = item.id === manager;
          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => {
                setManager(item.id);
                setCopied(false);
              }}
              className={cn(
                "rounded-md px-2.5 py-1 font-mono text-xs transition-colors",
                selected
                  ? "bg-jade text-primary-foreground"
                  : "text-ink-soft hover:text-foreground",
              )}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      <div className="flex w-full items-center gap-2 rounded-xl border border-border bg-card/80 p-2 shadow-none backdrop-blur-sm">
        <code className="min-w-0 flex-1 overflow-x-auto px-3 py-2 font-mono text-sm text-foreground">
          {command}
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
    </div>
  );
}
