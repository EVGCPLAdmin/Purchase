import type { LucideIcon } from 'lucide-react'
import { LayoutDashboard, ShoppingCart, Package, Settings as SettingsIcon, Users, Wrench } from 'lucide-react'

export interface NavItem {
  path: string
  label: string
  icon: LucideIcon
  permission?: string
}

export interface NavGroup {
  label: string
  items: NavItem[]
}

export const NAV_GROUPS: NavGroup[] = [
  {
    label: 'Overview',
    items: [{ path: '/', label: 'Dashboard', icon: LayoutDashboard, permission: 'dashboard:view' }],
  },
  {
    label: 'Supply Chain',
    items: [
      { path: '/purchase', label: 'Purchase', icon: ShoppingCart, permission: 'purchase:view' },
      { path: '/stores', label: 'Stores', icon: Package, permission: 'stores:view' },
    ],
  },
  {
    label: 'Admin',
    items: [
      { path: '/settings', label: 'Settings', icon: SettingsIcon },
      { path: '/admin', label: 'Users & Access', icon: Users, permission: 'admin:access' },
      { path: '/config', label: 'Developer Config', icon: Wrench, permission: 'config:access' },
    ],
  },
]
