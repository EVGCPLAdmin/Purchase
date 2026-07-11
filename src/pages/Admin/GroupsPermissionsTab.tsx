import { Fragment, useState } from 'react'
import { Plus } from 'lucide-react'
import { PERMISSION_CATALOG, emptyGroup, type Group } from '../../types/access'
import { saveGroup, updateGroup } from '../../data/repository'

interface Props {
  groups: Group[]
  setGroups: React.Dispatch<React.SetStateAction<Group[]>>
}

export function GroupsPermissionsTab({ groups, setGroups }: Props) {
  const [newGroupName, setNewGroupName] = useState('')
  const [saving, setSaving] = useState(false)

  const modules = Array.from(new Set(PERMISSION_CATALOG.map((p) => p.module)))

  async function togglePermission(group: Group, permissionKey: string, checked: boolean) {
    const permissions = checked
      ? [...group.permissions, permissionKey]
      : group.permissions.filter((k) => k !== permissionKey)
    const updated = await updateGroup({ ...group, permissions })
    setGroups((prev) => prev.map((g) => (g.id === updated.id ? updated : g)))
  }

  async function addGroup() {
    if (!newGroupName.trim()) return
    setSaving(true)
    try {
      const saved = await saveGroup({ ...emptyGroup(), name: newGroupName.trim() })
      setGroups((prev) => [...prev, saved])
      setNewGroupName('')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-end gap-2">
        <input
          className="input max-w-[220px]"
          placeholder="New group name"
          value={newGroupName}
          onChange={(e) => setNewGroupName(e.target.value)}
        />
        <button type="button" className="btn-primary" disabled={saving} onClick={addGroup}>
          <Plus className="h-4 w-4" />
          New Group
        </button>
      </div>

      <div className="card overflow-auto">
        <table className="w-full min-w-[720px] border-collapse text-sm">
          <thead className="bg-surface-2">
            <tr>
              <th className="sticky left-0 z-[1] bg-surface-2 px-3 py-2 text-left text-xs font-semibold text-muted">
                Permission
              </th>
              {groups.map((g) => (
                <th key={g.id} className="px-3 py-2 text-center text-xs font-semibold text-muted">
                  {g.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {modules.map((mod) => (
              <Fragment key={mod}>
                <tr className="border-b border-border bg-surface-2/40">
                  <td colSpan={groups.length + 1} className="px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-muted">
                    {mod}
                  </td>
                </tr>
                {PERMISSION_CATALOG.filter((p) => p.module === mod).map((perm) => (
                  <tr key={perm.key} className="border-b border-border last:border-b-0">
                    <td className="sticky left-0 bg-surface px-3 py-2 text-text">{perm.label}</td>
                    {groups.map((g) => (
                      <td key={g.id} className="px-3 py-2 text-center">
                        <input
                          type="checkbox"
                          checked={g.permissions.includes(perm.key)}
                          onChange={(e) => togglePermission(g, perm.key, e.target.checked)}
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
