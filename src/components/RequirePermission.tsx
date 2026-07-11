import type { ReactNode } from 'react'
import { useAccess } from '../context/AccessContext'
import { ShieldAlert } from 'lucide-react'

export function RequirePermission({ permission, children }: { permission: string; children: ReactNode }) {
  const { hasPermission, loading } = useAccess()

  if (loading) return null
  if (!hasPermission(permission)) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2 p-10 text-center text-muted">
        <ShieldAlert className="h-8 w-8" />
        <p className="text-sm font-medium text-text">You don't have access to this page.</p>
        <p className="text-xs">Missing permission: {permission}</p>
      </div>
    )
  }
  return <>{children}</>
}
