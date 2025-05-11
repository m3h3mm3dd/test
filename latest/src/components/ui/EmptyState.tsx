import { ReactNode } from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface EmptyStateProps {
  icon?: ReactNode
  title: string
  description?: string
  action?: ReactNode
  className?: string
  variant?: "default" | "error" | "info"
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
  variant = "default",
}: EmptyStateProps) {
  const variantClass = {
    default: "text-primary",
    error: "text-red-500",
    info: "text-blue-500",
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className={cn(
        "flex flex-col items-center justify-center text-center max-w-md mx-auto py-8 gap-5 sm:gap-6",
        className
      )}
    >
      {icon && (
        <div className={cn("mb-1", variantClass[variant])}>
          <div className="h-12 w-12">{icon}</div>
        </div>
      )}

      <div className="space-y-1">
        <h2 className="text-xl font-semibold text-foreground">{title}</h2>
        {description && (
          <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
        )}
      </div>

      {action && (
        <div className="mt-4 animate-fade-in">
          {action}
        </div>
      )}
    </motion.div>
  )
}
