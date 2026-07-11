import { ShoppingCart, Package } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAccess } from '../../context/AccessContext'

export function DashboardPage() {
  const { currentUser, hasPermission } = useAccess()

  const cards = [
    {
      to: '/purchase',
      label: 'Purchase',
      description: 'Material Requisitions and Purchase Orders',
      icon: ShoppingCart,
      permission: 'purchase:view',
    },
    {
      to: '/stores',
      label: 'Stores',
      description: 'Stock levels, receipts, issues and transfers',
      icon: Package,
      permission: 'stores:view',
    },
  ].filter((c) => hasPermission(c.permission))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-semibold text-text">Welcome{currentUser ? `, ${currentUser.name}` : ''}</h1>
        <p className="text-sm text-muted">Jump into a module below.</p>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {cards.map((c) => (
          <Link key={c.to} to={c.to} className="card flex items-start gap-3 p-4 hover:bg-surface-2">
            <span className="rounded-lg bg-primary/10 p-2 text-primary">
              <c.icon className="h-5 w-5" />
            </span>
            <span>
              <span className="block text-sm font-semibold text-text">{c.label}</span>
              <span className="block text-xs text-muted">{c.description}</span>
            </span>
          </Link>
        ))}
      </div>
    </div>
  )
}
