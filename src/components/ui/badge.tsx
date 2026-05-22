import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors",
  {
    variants: {
      variant: {
        default: "bg-[#2563EB] text-white",
        secondary: "bg-[#F1F5F9] text-[#64748B]",
        success: "bg-green-100 text-[#16A34A]",
        destructive: "bg-red-100 text-[#DC2626]",
        warning: "bg-amber-100 text-[#D97706]",
        outline: "border border-[#E2E8F0] text-[#0F172A]",
      },
    },
    defaultVariants: { variant: "default" },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
