import { useState } from 'react'
import { ShieldCheck } from 'lucide-react'
import { useAsyncData } from '../../lib/useAsyncData'
import { loadGroups, loadUsers } from '../../data/repository'
import { UsersTab } from './UsersTab'
import { GroupsPermissionsTab } from './GroupsPermissionsTab'

type Tab = 'users' | 'groups'

export function AdminPage() {
  const [tab, setTab] = useState<Tab>('users')
  const { data: users, setData: setUsers } = useAsyncData(loadUsers)
  const { data: groups, setData: setGroups } = useAsyncData(loadGroups)

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3">
        <span className="rounded-lg bg-primary/10 p-2 text-primary">
          <ShieldCheck className="h-5 w-5" />
        </span>
        <div>
          <h1 className="text-lg font-semibold text-text">Users & Access</h1>
          <p className="text-sm text-muted">Manage users, groups and the permission matrix.</p>
        </div>
      </div>

      <div className="inline-flex rounded-md border border-border bg-surface p-1">
        <button
          type="button"
          className={`rounded px-3 py-1.5 text-sm font-medium ${tab === 'users' ? 'bg-primary/12 text-primary' : 'text-muted hover:text-text'}`}
          onClick={() => setTab('users')}
        >
          Users
        </button>
        <button
          type="button"
          className={`rounded px-3 py-1.5 text-sm font-medium ${tab === 'groups' ? 'bg-primary/12 text-primary' : 'text-muted hover:text-text'}`}
          onClick={() => setTab('groups')}
        >
          Groups & Permissions
        </button>
      </div>

      {tab === 'users' ? (
        <UsersTab users={users} setUsers={setUsers} groups={groups} />
      ) : (
        <GroupsPermissionsTab groups={groups} setGroups={setGroups} />
      )}
    </div>
  )
}
