'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Upload, Clock, Settings, Zap } from 'lucide-react'

const NAV = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/upload', label: 'New Generation', icon: Upload, exact: false },
  { href: '/history', label: 'History', icon: Clock, exact: false },
  { href: '/settings', label: 'Settings', icon: Settings, exact: false },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-56 min-h-screen flex flex-col shrink-0" style={{ background: 'var(--bg-card)', borderRight: '1px solid var(--border)' }}>
      <div className="p-4 flex items-center gap-2" style={{ borderBottom: '1px solid var(--border)' }}>
        <Zap size={18} style={{ color: 'var(--accent)' }} />
        <span className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>Content Engine</span>
      </div>

      <nav className="flex-1 p-3 space-y-0.5">
        {NAV.map(({ href, label, icon: Icon, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors"
              style={{
                background: active ? 'var(--accent-bg)' : 'transparent',
                color: active ? 'var(--accent)' : 'var(--text-muted)',
              }}
            >
              <Icon size={15} />
              {label}
            </Link>
          )
        })}
      </nav>

      <div className="p-4 text-xs" style={{ color: 'var(--text-muted)', borderTop: '1px solid var(--border)' }}>
        Systems Foresight Course
      </div>
    </aside>
  )
}
