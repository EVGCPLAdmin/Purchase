import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { ChevronsLeft, ChevronsRight, Leaf, X } from 'lucide-react'
import { NAV_GROUPS } from './nav'
import { useAccess } from '../../context/AccessContext'
import { useSettings } from '../../context/SettingsContext'

interface Props {
  mobileOpen: boolean
  onCloseMobile: () => void
}

export function Sidebar({ mobileOpen, onCloseMobile }: Props) {
  const [collapsed, setCollapsed] = useState(false)
  const { hasPermission } = useAccess()
  const { settings } = useSettings()

  return (
    <>
      {mobileOpen && <div className="fixed inset-0 z-40 bg-black/40 md:hidden" onClick={onCloseMobile} />}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex h-full w-64 flex-col border-r border-border bg-surface transition-transform md:static md:z-auto md:translate-x-0 md:transition-[width] ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        } ${collapsed ? 'md:w-16' : 'md:w-64'}`}
      >
        <div className="flex items-center gap-2 border-b border-border px-4 py-4">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Leaf className="h-5 w-5" />
          </span>
          <span className={`truncate text-sm font-semibold text-text ${collapsed ? 'md:hidden' : ''}`}>{settings.appName}</span>
          <button type="button" className="btn-ghost ml-auto !p-1.5 md:hidden" onClick={onCloseMobile} aria-label="Close menu">
            <X className="h-4 w-4" />
          </button>
        </div>

        <nav className="flex-1 space-y-4 overflow-auto p-3">
          {NAV_GROUPS.map((group) => {
            const visibleItems = group.items.filter((item) => !item.permission || hasPermission(item.permission))
            if (visibleItems.length === 0) return null
            return (
              <div key={group.label}>
                <div className={`mb-1 px-2 text-[10px] font-semibold uppercase tracking-wider text-muted ${collapsed ? 'md:hidden' : ''}`}>
                  {group.label}
                </div>
                <div className="space-y-0.5">
                  {visibleItems.map((item) => (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      end={item.path === '/'}
                      onClick={onCloseMobile}
                      className={({ isActive }) =>
                        `flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm font-medium transition-colors ${
                          isActive ? 'bg-primary/12 text-primary' : 'text-text hover:bg-surface-2'
                        }`
                      }
                      title={item.label}
                    >
                      <item.icon className="h-4 w-4 shrink-0" />
                      <span className={collapsed ? 'md:hidden' : ''}>{item.label}</span>
                    </NavLink>
                  ))}
                </div>
              </div>
            )
          })}
        </nav>

        <button
          type="button"
          className="btn-ghost m-2 hidden justify-center md:flex"
          onClick={() => setCollapsed((c) => !c)}
          aria-label="Toggle sidebar"
        >
          {collapsed ? <ChevronsRight className="h-4 w-4" /> : <ChevronsLeft className="h-4 w-4" />}
        </button>
      </aside>
    </>
  )
}
