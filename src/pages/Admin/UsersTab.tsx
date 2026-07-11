import { useEffect, useState } from 'react'
import { Plus } from 'lucide-react'
import { DataTable, type DataTableColumn } from '../../components/ui/DataTable'
import { Drawer } from '../../components/ui/Drawer'
import { FormSection } from '../../components/ui/FormSection'
import { FormField } from '../../components/ui/FormField'
import { emptyUser, type Group, type User } from '../../types/access'
import { saveUser, updateUser } from '../../data/repository'

interface Props {
  users: User[]
  setUsers: React.Dispatch<React.SetStateAction<User[]>>
  groups: Group[]
}

export function UsersTab({ users, setUsers, groups }: Props) {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [selected, setSelected] = useState<User | null>(null)
  const [form, setForm] = useState<User>(emptyUser())
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (drawerOpen) setForm(selected ?? emptyUser())
  }, [drawerOpen, selected])

  function set<K extends keyof User>(key: K) {
    return (value: User[K]) => setForm((f) => ({ ...f, [key]: value }))
  }

  const columns: DataTableColumn<User>[] = [
    { key: 'name', header: 'Name', width: 200 },
    { key: 'email', header: 'Email', width: 240 },
    {
      key: 'group',
      header: 'Group',
      width: 180,
      accessor: (u) => groups.find((g) => g.id === u.groupId)?.name ?? '—',
      toText: (u) => groups.find((g) => g.id === u.groupId)?.name ?? '—',
    },
  ]

  async function handleSave() {
    setSaving(true)
    try {
      if (!form.id) {
        const saved = await saveUser(form)
        setUsers((prev) => [...prev, saved])
      } else {
        const saved = await updateUser(form)
        setUsers((prev) => prev.map((u) => (u.id === saved.id ? saved : u)))
      }
      setDrawerOpen(false)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <button
          type="button"
          className="btn-primary"
          onClick={() => {
            setSelected(null)
            setDrawerOpen(true)
          }}
        >
          <Plus className="h-4 w-4" />
          New User
        </button>
      </div>

      <DataTable
        key="admin-users"
        tableKey="admin-users"
        columns={columns}
        data={users}
        getRowId={(u) => u.id}
        onRowClick={(u) => {
          setSelected(u)
          setDrawerOpen(true)
        }}
        emptyMessage="No users yet."
      />

      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={selected ? form.name || 'User' : 'New User'}
        footer={
          <>
            <button type="button" className="btn-outline" onClick={() => setDrawerOpen(false)}>
              Cancel
            </button>
            <button type="button" className="btn-primary" disabled={saving} onClick={handleSave}>
              {selected ? 'Save Changes' : 'Save'}
            </button>
          </>
        }
      >
        <FormSection title="User Details">
          <FormField label="Name" value={form.name} onChange={set('name')} required />
          <FormField label="Email" type="email" value={form.email} onChange={set('email')} required />
          <FormField
            label="Group"
            type="select"
            value={form.groupId}
            onChange={set('groupId')}
            options={groups.map((g) => ({ value: g.id, label: g.name }))}
            required
            span2
          />
        </FormSection>
      </Drawer>
    </div>
  )
}
