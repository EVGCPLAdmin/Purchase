import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
import type { Group, User } from '../types/access'
import { loadGroups, loadUsers } from '../data/repository'

const CURRENT_USER_KEY = 'auth.currentUserId'

interface AccessContextValue {
  users: User[]
  groups: Group[]
  currentUser: User | null
  currentGroup: Group | null
  switchUser: (userId: string) => void
  hasPermission: (key: string) => boolean
  loading: boolean
  refresh: () => Promise<void>
}

const AccessContext = createContext<AccessContextValue | null>(null)

export function AccessProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<User[]>([])
  const [groups, setGroups] = useState<Group[]>([])
  const [currentUserId, setCurrentUserId] = useState(() => localStorage.getItem(CURRENT_USER_KEY) || '')
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    setLoading(true)
    const [u, g] = await Promise.all([loadUsers(), loadGroups()])
    setUsers(u)
    setGroups(g)
    setLoading(false)
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  useEffect(() => {
    if (!loading && !currentUserId && users.length > 0) {
      switchUser(users[0].id)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, users])

  function switchUser(userId: string) {
    setCurrentUserId(userId)
    localStorage.setItem(CURRENT_USER_KEY, userId)
  }

  const currentUser = users.find((u) => u.id === currentUserId) ?? null
  const currentGroup = groups.find((g) => g.id === currentUser?.groupId) ?? null

  function hasPermission(key: string) {
    return currentGroup?.permissions.includes(key) ?? false
  }

  return (
    <AccessContext.Provider value={{ users, groups, currentUser, currentGroup, switchUser, hasPermission, loading, refresh }}>
      {children}
    </AccessContext.Provider>
  )
}

export function useAccess() {
  const ctx = useContext(AccessContext)
  if (!ctx) throw new Error('useAccess must be used within AccessProvider')
  return ctx
}
