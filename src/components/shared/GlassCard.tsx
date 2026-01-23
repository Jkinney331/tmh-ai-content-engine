import * as React from "react";
import { cn } from "@/lib/utils";

export function GlassCard({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "glass-card rounded-lg border border-[color:var(--surface-border)] transition duration-300 ease-out hover:border-primary/30",
        className,
      )}
      {...props}
    />
  );
}
