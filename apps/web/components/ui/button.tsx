import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  [
    "group/button inline-flex shrink-0 items-center justify-center whitespace-nowrap select-none",
    "rounded-[var(--radius)] border-2 border-border",
    "font-bold",
    "transition-all duration-200",
    // The aria-haspopup guard keeps dropdown triggers still when popping a menu open.
    "hover:not-aria-[haspopup]:translate-y-1",
    "active:not-aria-[haspopup]:translate-x-1 active:not-aria-[haspopup]:translate-y-2",
    "outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
    "disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none",
    "disabled:hover:translate-y-0 disabled:active:translate-x-0 disabled:active:translate-y-0",
    "aria-invalid:border-destructive aria-invalid:outline-destructive/40",
    "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  ].join(" "),
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-md hover:bg-primary-hover hover:shadow-sm active:shadow-none",
        outline:
          "bg-background text-foreground shadow-md hover:bg-muted hover:shadow-sm active:shadow-none aria-expanded:bg-muted",
        secondary:
          "bg-secondary text-secondary-foreground shadow-md hover:bg-secondary/85 hover:shadow-sm active:shadow-none aria-expanded:bg-secondary",
        accent:
          "bg-accent text-accent-foreground shadow-md hover:bg-accent/85 hover:shadow-sm active:shadow-none",
        destructive:
          "bg-destructive text-destructive-foreground shadow-md hover:bg-destructive/90 hover:shadow-sm focus-visible:outline-destructive active:shadow-none",
        // Ghost and link cancel the base press translate; they have no shadow to sink into.
        ghost:
          "border-transparent shadow-none hover:bg-muted hover:text-foreground hover:not-aria-[haspopup]:translate-y-0 active:not-aria-[haspopup]:translate-x-0 active:not-aria-[haspopup]:translate-y-0 aria-expanded:bg-muted",
        link: "border-transparent px-1 text-primary underline decoration-2 underline-offset-[3px] shadow-none hover:bg-accent hover:text-accent-foreground hover:no-underline hover:not-aria-[haspopup]:translate-y-0 active:not-aria-[haspopup]:translate-x-0 active:not-aria-[haspopup]:translate-y-0",
        inverted:
          "bg-foreground text-background shadow-md hover:bg-foreground/85 hover:shadow-sm active:shadow-none",
      },
      size: {
        default:
          "h-10 gap-1.5 px-4 text-sm has-data-[icon=inline-end]:pr-3 has-data-[icon=inline-start]:pl-3",
        xs: "h-7 gap-1 px-2 text-xs has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-8 gap-1 px-3 text-sm has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2",
        lg: "h-12 gap-2 px-6 text-base shadow-lg hover:shadow-md active:shadow-none has-data-[icon=inline-end]:pr-4 has-data-[icon=inline-start]:pl-4",
        icon: "size-10",
        "icon-xs": "size-7 [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-8",
        "icon-lg": "size-12 shadow-lg hover:shadow-md active:shadow-none",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
