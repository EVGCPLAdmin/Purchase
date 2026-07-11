import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import { ChevronDown, LogOut, Menu, Palette } from 'lucide-react'
import { useAccess } from '../../context/AccessContext'
import { useTheme, THEMES } from '../../context/ThemeContext'
import { NAV_GROUPS } from './nav'

function currentPageLabel(pathname: string) {
  for (const group of NAV_GROUPS) {
    for (const item of group.items) {
      if (item.path === pathname || (item.path !== '/' && pathname.startsWith(item.path))) return item.label
    }
  }
  return 'Dashboard'
}

function initials(name: string) {
  return name
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

export function Topbar({ onOpenMobileNav }: { onOpenMobileNav: () => void }) {
  const location = useLocation()
  const { users, currentUser, currentGroup, switchUser } = useAccess()
  const { themeId, setThemeId } = useTheme()
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [themeMenuOpen, setThemeMenuOpen] = useState(false)

  return (
    <header className="flex items-center justify-between border-b border-border bg-surface px-4 py-3 md:px-6">
      <div className="flex items-center gap-2 text-sm text-muted">
        <button type="button" className="btn-ghost !p-1.5 md:hidden" onClick={onOpenMobileNav} aria-label="Open menu">
          <Menu className="h-4 w-4" />
        </button>
        <span className="text-text">{currentPageLabel(location.pathname)}</span>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative">
          <button type="button" className="btn-ghost" onClick={() => setThemeMenuOpen((o) => !o)}>
            <Palette className="h-4 w-4" />
          </button>
          {themeMenuOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setThemeMenuOpen(false)} />
              <div className="absolute right-0 z-20 mt-1 w-48 rounded-lg border border-border bg-surface p-2 shadow-card">
                {THEMES.map((theme) => (
                  <button
                    key={theme.id}
                    type="button"
                    className={`flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-sm hover:bg-surface-2 ${
                      theme.id === themeId ? 'text-primary' : 'text-text'
                    }`}
                    onClick={() => {
                      setThemeId(theme.id)
                      setThemeMenuOpen(false)
                    }}
                  >
                    <span className="h-3 w-3 rounded-full border border-border" style={{ backgroundColor: theme.swatch }} />
                    {theme.label}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        <div className="relative">
          <button type="button" className="btn-ghost gap-2" onClick={() => setUserMenuOpen((o) => !o)}>
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/15 text-xs font-semibold text-primary">
              {currentUser ? initials(currentUser.name) : '—'}
            </span>
            <span className="hidden text-left sm:block">
              <span className="block text-sm font-medium text-text">{currentUser?.name ?? 'No user'}</span>
              <span className="block text-xs text-muted">{currentGroup?.name ?? '—'}</span>
            </span>
            <ChevronDown className="h-3.5 w-3.5 text-muted" />
          </button>
          {userMenuOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setUserMenuOpen(false)} />
              <div className="absolute right-0 z-20 mt-1 w-56 rounded-lg border border-border bg-surface p-2 shadow-card">
                <div className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted">
                  Switch user (demo)
                </div>
                {users.map((u) => (
                  <button
                    key={u.id}
                    type="button"
                    className={`flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-sm hover:bg-surface-2 ${
                      u.id === currentUser?.id ? 'text-primary' : 'text-text'
                    }`}
                    onClick={() => {
                      switchUser(u.id)
                      setUserMenuOpen(false)
                    }}
                  >
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/15 text-[10px] font-semibold text-primary">
                      {initials(u.name)}
                    </span>
                    {u.name}
                  </button>
                ))}
                <div className="mt-1 border-t border-border pt-1">
                  <button type="button" className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-sm text-danger hover:bg-danger/10">
                    <LogOut className="h-4 w-4" />
                    Sign out
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
