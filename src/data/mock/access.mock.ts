import type { Group, User } from '../../types/access'

export const MOCK_GROUPS: Group[] = [
  {
    id: 'grp_admin',
    name: 'Administrator',
    permissions: [
      'dashboard:view',
      'purchase:view',
      'purchase:create',
      'purchase:edit',
      'stores:view',
      'stores:create',
      'admin:access',
      'config:access',
    ],
  },
  {
    id: 'grp_dev',
    name: 'Developer',
    permissions: ['dashboard:view', 'purchase:view', 'stores:view', 'config:access'],
  },
  {
    id: 'grp_purchase',
    name: 'Purchase Officer',
    permissions: ['dashboard:view', 'purchase:view', 'purchase:create', 'purchase:edit', 'stores:view'],
  },
  {
    id: 'grp_stores',
    name: 'Store Keeper',
    permissions: ['dashboard:view', 'stores:view', 'stores:create', 'purchase:view'],
  },
  {
    id: 'grp_viewer',
    name: 'Viewer',
    permissions: ['dashboard:view', 'purchase:view', 'stores:view'],
  },
]

export const MOCK_USERS: User[] = [
  { id: 'usr_1', name: 'Amara Okafor', email: 'amara.okafor@example.com', groupId: 'grp_admin' },
  { id: 'usr_2', name: 'Daniel Mwangi', email: 'daniel.mwangi@example.com', groupId: 'grp_purchase' },
  { id: 'usr_3', name: 'Grace Kimani', email: 'grace.kimani@example.com', groupId: 'grp_stores' },
  { id: 'usr_4', name: 'Dev Account', email: 'dev@example.com', groupId: 'grp_dev' },
]
