export interface Permission {
  key: string
  label: string
  module: string
}

export interface Group {
  id: string
  name: string
  permissions: string[]
}

export interface User {
  id: string
  name: string
  email: string
  groupId: string
}

export const PERMISSION_CATALOG: Permission[] = [
  { key: 'dashboard:view', label: 'View dashboard', module: 'Dashboard' },
  { key: 'purchase:view', label: 'View', module: 'Purchase' },
  { key: 'purchase:create', label: 'Create', module: 'Purchase' },
  { key: 'purchase:edit', label: 'Edit', module: 'Purchase' },
  { key: 'stores:view', label: 'View', module: 'Stores' },
  { key: 'stores:create', label: 'Create', module: 'Stores' },
  { key: 'admin:access', label: 'Users & Access', module: 'Admin' },
  { key: 'config:access', label: 'Developer Config', module: 'Admin' },
]

export const ALL_PERMISSION_KEYS = PERMISSION_CATALOG.map((p) => p.key)

export function emptyUser(): User {
  return { id: '', name: '', email: '', groupId: '' }
}

export function emptyGroup(): Group {
  return { id: '', name: '', permissions: [] }
}
