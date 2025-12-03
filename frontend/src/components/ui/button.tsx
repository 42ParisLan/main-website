import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-background shadow-xs hover:bg-primary/90",
        destructive:
          "dark bg-destructive text-white shadow-xs hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40",
        outline:
          "border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50",
        secondary:
          "dark bg-secondary text-black shadow-xs hover:bg-secondary/80",
        ghost:
          "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
        link: 
          "text-primary underline-offset-4 hover:underline",
        transparent:
          "bg-transparent whitespace-nowrap font-medium transition-all outline-none",
        gradient:
          "dark text-gray-300 bg-gradient-to-br from-primary via-secondary to-purple-400",
        border:
          "",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        xl: "h-13 gap-1.5 px-3",
        icon: "size-9",
        header: "h-8 gap-1.5 px-3 text-md",
      },
      radius: {
          none: "rounded-none",
          sm: "rounded-sm",
          md: "rounded-md",
          lg: "rounded-lg",
          full: "rounded-full",
      },
      hover: {
        none: "",
        gradient: "hover:bg-gradient-to-br hover:from-primary hover:to-secondary dark",
        border: "hover:bg-gradient-to-br hover:from-primary hover:to-secondary dark"
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      radius: "md",
      hover: "none",
    },
  }
)

function Button({
  className,
  variant,
  size,
  radius,
  hover,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, radius, hover, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
