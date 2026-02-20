"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { LayoutDashboard, Users, Kanban, LogOut } from "lucide-react"
import { cn } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"

const nav = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard },
  { label: "Contacts", href: "/contacts", icon: Users },
  { label: "Deals", href: "/deals", icon: Kanban },
]

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/login")
    router.refresh()
  }

  return (
    <aside className="flex flex-col w-56 min-h-screen border-r bg-card px-3 py-6">
      <div className="mb-8 px-2">
        <span className="text-lg font-semibold tracking-tight">CRM</span>
      </div>
      <nav className="flex flex-col gap-1 flex-1">
        {nav.map(({ label, href, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-3 rounded-md px-2 py-2 text-sm font-medium transition-colors",
              pathname === href
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </Link>
        ))}
      </nav>
      <Button
        variant="ghost"
        className="justify-start gap-3 text-muted-foreground"
        onClick={handleSignOut}
      >
        <LogOut className="h-4 w-4" />
        Sign out
      </Button>
    </aside>
  )
}
