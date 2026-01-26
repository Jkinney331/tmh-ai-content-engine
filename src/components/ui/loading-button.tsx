'use client'

import * as React from "react"
import { Loader2 } from "lucide-react"
import { Button, type ButtonProps } from "./button"
import { cn } from "@/lib/utils"

export interface LoadingButtonProps extends ButtonProps {
  loading?: boolean
  loadingText?: string
}

const LoadingButton = React.forwardRef<HTMLButtonElement, LoadingButtonProps>(
  ({ children, loading, loadingText, disabled, className, ...props }, ref) => (
    <Button
      ref={ref}
      disabled={loading || disabled}
      className={cn(className)}
      {...props}
    >
      {loading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          {loadingText || children}
        </>
      ) : (
        children
      )}
    </Button>
  )
)
LoadingButton.displayName = "LoadingButton"

export { LoadingButton }
