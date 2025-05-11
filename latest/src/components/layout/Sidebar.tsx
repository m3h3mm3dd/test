'use client'

import Link from "next/link"
import { usePathname } from "next/navigation"
import clsx from "clsx"
import { LayoutDashboard, FolderKanban, Users, Settings } from "lucide-react"
import { useUser } from "@/hooks/useUser"

const baseItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Projects", href: "/projects", icon: FolderKanban },
  { label: "Teams", href: "/teams", icon: Users, protected: true },
  { label: "Settings", href: "/settings", icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()
  const { role } = useUser()

  const filtered = baseItems.filter((item) => {
    if (item.protected && role === "member") return false
    return true
  })

  return (
    <aside className="w-64 border-r border-muted bg-background p-4">
      <div className="mb-8 text-2xl font-bold tracking-tight px-2">TaskUp</div>
      <nav className="space-y-1">
        {filtered.map(({ label, href, icon: Icon }) => {
          const isActive = pathname.startsWith(href)
          return (
            <Link
              key={label}
              href={href}
              className={clsx(
                "flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors",
                isActive
                  ? "bg-muted text-primary"
                  : "hover:bg-muted hover:text-primary"
              )}
            >
              <Icon className="w-4 h-4" />
              <span>{label}</span>
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
