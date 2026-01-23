import * as React from "react";
import * as SwitchPrimitives from "@radix-ui/react-switch";
import { cn } from "@/lib/utils";

const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root>
>(({ className, ...props }, ref) => (
  <SwitchPrimitives.Root
    ref={ref}
    className={cn(
      "peer inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border border-[color:var(--surface-border)] bg-[color:var(--surface-muted)] transition data-[state=checked]:bg-primary",
      className,
    )}
    {...props}
  >
    <SwitchPrimitives.Thumb className="pointer-events-none block h-4 w-4 translate-x-0.5 rounded-full bg-white transition data-[state=checked]:translate-x-[18px]" />
  </SwitchPrimitives.Root>
));
Switch.displayName = "Switch";

export { Switch };
