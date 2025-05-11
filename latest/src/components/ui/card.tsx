import { ReactNode } from "react"
import { cn } from "@/lib/utils"

interface CardProps {
  children: ReactNode
  className?: string
  hover?: boolean
  padded?: boolean
  shadow?: "sm" | "md" | "lg"
}

export function Card({
  children,
  className,
  hover = true,
  padded = true,
  shadow = "sm",
}: CardProps) {
  const shadowClass = {
    sm: "shadow-sm",
    md: "shadow-md",
    lg: "shadow-lg",
  }

  return (
    <div
      className={cn(
        "rounded-2xl ring-1 ring-border transition-all bg-white dark:bg-background",
        shadowClass[shadow],
        hover && "hover:shadow-md",
        padded && "p-6",
        className
      )}
    >
      {children}
    </div>
  )
}
