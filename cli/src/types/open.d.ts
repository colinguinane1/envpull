declare module "open" {
  import type { ChildProcess } from "node:child_process";

  export default function open(
    target: string,
    options?: {
      wait?: boolean;
      background?: boolean;
      newInstance?: boolean;
      app?: { name: string | readonly string[]; arguments?: readonly string[] };
      allowNonzeroExitCode?: boolean;
    },
  ): Promise<ChildProcess>;
}
