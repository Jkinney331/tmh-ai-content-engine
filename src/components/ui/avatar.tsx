import * as React from "react";
import { cn } from "@/lib/utils";

const Avatar = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[color:var(--surface-muted)] text-sm font-semibold",
        className,
      )}
      {...props}
    />
  ),
);
Avatar.displayName = "Avatar";

const AvatarFallback = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex h-full w-full items-center justify-center", className)} {...props} />
  ),
);
AvatarFallback.displayName = "AvatarFallback";

export { Avatar, AvatarFallback };
