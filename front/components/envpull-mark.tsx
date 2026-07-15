import Image from "next/image";
import { cn } from "@/lib/utils";

type EnvPullMarkProps = {
  className?: string;
  size?: number;
  priority?: boolean;
};

export function EnvPullMark({
  className,
  size = 28,
  priority = false,
}: EnvPullMarkProps) {
  return (
    <Image
      src="/envpull-icon.png"
      alt=""
      width={size}
      height={size}
      priority={priority}
      className={cn("rounded-[22%] shadow-sm", className)}
    />
  );
}
