import React, { useState, useEffect } from 'react'
import {
  UserPlus,
  Search,
  CheckCircle2,
  Copy,
  Lock,
  Key,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import type { CreateUserDto, User, UserRole, UserStatus } from '../../models/user'
import { userService } from '../../services/UserService'
import { Badge } from '../../components/ui/Badge/Badge'
import { PrimaryButton } from '../../components/ui/Button/PrimaryButton'
import { Input } from '../../components/ui/Input/Input'
import { Select } from '../../components/ui/Select/Select'
import { Table, TableBody, TableCell, TableContainer, TableEmpty, TableHead, TableHeader, TablePagination, TableRow } from '../../components/ui/Table/Table'
import { formatDate, getUserStatusBadge } from '../../utils/format'
import { Modal } from '../../components/ui/Modal/Modal'

export const UserManagementPage: React.FC = () => {
  const { user: currentOfficer } = useAuth()
  const { success, error, info } = useToast()

  const [users, setUsers] = useState<User[]>([])
  const [, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('ALL')
  const [statusFilter, setStatusFilter] = useState<string>('ALL')

  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 6

  // Register Modal State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState<CreateUserDto>({
    username: '',
    fullName: '',
    email: '',
    phone: '',
    password: 'Password@2026',
    department: '',
    role: 'STAFF',
  })

  // Recently Created Credentials Banner
  const [recentCreds, setRecentCreds] = useState<{ username: string; pass: string } | null>(null)

  const loadUsers = async () => {
    try {
      setLoading(true)
      const data = await userService.getUsers()
      setUsers(data)
    } catch (loadError) {
      error(loadError instanceof Error ? loadError.message : 'Failed to load users.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadUsers()
  }, [])

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.username.trim() || !formData.fullName.trim() || !formData.email.trim()) {
      error('Please complete all required fields.')
      return
    }

    setIsSubmitting(true)
    try {
      const newUser = await userService.registerUser(formData, currentOfficer?.username)
      success(`User ${newUser.username} registered successfully!`)
      setUsers((previous) => [newUser, ...previous])
      setRecentCreds({ username: formData.username, pass: formData.password })
      setIsModalOpen(false)
      // Reset form
      setFormData({
        username: '',
        fullName: '',
        email: '',
        phone: '',
        password: 'Password@2026',
        department: '',
        role: 'STAFF',
      })
    } catch (err: any) {
      error(err.message || 'Failed to register user.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleStatusToggle = async (user: User) => {
    const nextStatus: UserStatus =
      user.status === 'ACTIVE' ? 'INACTIVE' : user.status === 'INACTIVE' ? 'SUSPENDED' : 'ACTIVE'
    try {
      await userService.updateUserStatus(user.id, nextStatus)
      success(`Updated ${user.username} status to ${nextStatus}`)
      await loadUsers()
    } catch (err: any) {
      error(err.message || 'Failed to update user status')
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    info('Credentials copied to clipboard! You can share them with the user.')
  }

  // Filtered Users
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.department.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter
    const matchesStatus = statusFilter === 'ALL' || u.status === statusFilter

    return matchesSearch && matchesRole && matchesStatus
  })

  // Pagination Slice
  const totalPages = Math.ceil(filteredUsers.length / pageSize)
  const paginatedUsers = filteredUsers.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight font-display">
              User Directory & Registration
            </h1>
            <Badge variant="purple">IT Officer Exclusive</Badge>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Only the IT Officer can register system accounts and grant role permissions.
          </p>
        </div>

        <PrimaryButton
          variant="primary"
          size="md"
          onClick={() => setIsModalOpen(true)}
          leftIcon={<UserPlus className="w-4 h-4" />}
        >
          Register New User
        </PrimaryButton>
      </div>

      {/* Recently Created Credentials Notification */}
      {recentCreds && (
        <div className="p-4 rounded-xl bg-purple-50 border border-purple-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-600 text-white shrink-0">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-purple-900">
                Credentials Generated for Provisioned Account:
              </p>
              <p className="text-xs text-purple-800 mt-0.5">
                Username: <span className="font-mono font-bold bg-white px-2 py-0.5 rounded border border-purple-200">{recentCreds.username}</span> | Password: <span className="font-mono font-bold bg-white px-2 py-0.5 rounded border border-purple-200">{recentCreds.pass}</span>
              </p>
            </div>
          </div>
          <PrimaryButton
            variant="outline"
            size="sm"
            onClick={() => copyToClipboard(`Username: ${recentCreds.username}\nPassword: ${recentCreds.pass}`)}
            leftIcon={<Copy className="w-3.5 h-3.5" />}
          >
            Copy Credentials
          </PrimaryButton>
        </div>
      )}

      {/* Filters & Search Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="w-full sm:w-80">
          <Input
            placeholder="Search by name, username, or department..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              setCurrentPage(1)
            }}
            leftIcon={<Search className="w-4 h-4" />}
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="w-44">
            <Select
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value)
                setCurrentPage(1)
              }}
              options={[
                { value: 'ALL', label: 'All Roles' },
                { value: 'IT_OFFICER', label: 'IT Officer' },
                { value: 'INVENTORY_MANAGER', label: 'Inventory Manager' },
                { value: 'STAFF', label: 'Staff Member' },
              ]}
            />
          </div>

          <div className="w-36">
            <Select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value)
                setCurrentPage(1)
              }}
              options={[
                { value: 'ALL', label: 'All Statuses' },
                { value: 'ACTIVE', label: 'Active' },
                { value: 'INACTIVE', label: 'Inactive' },
                { value: 'SUSPENDED', label: 'Suspended' },
              ]}
            />
          </div>
        </div>
      </div>

      {/* Users Table */}
      <TableContainer>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User Information</TableHead>
              <TableHead>System Role</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Account Status</TableHead>
              <TableHead>Registered Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedUsers.length === 0 ? (
              <TableEmpty
                title="No users found"
                description="Try modifying your search filter or register a new user above."
                colSpan={6}
              />
            ) : (
              paginatedUsers.map((u) => {
                const statusBadge = getUserStatusBadge(u.status)
                return (
                  <TableRow key={u.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center shrink-0">
                          {u.fullName.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{u.fullName}</p>
                          <p className="text-xs text-slate-500 font-mono">@{u.username} • {u.email}</p>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      {u.role === 'IT_OFFICER' && (
                        <Badge variant="purple" dot>
                          IT Officer
                        </Badge>
                      )}
                      {u.role === 'INVENTORY_MANAGER' && (
                        <Badge variant="primary" dot>
                          Inventory Manager
                        </Badge>
                      )}
                      {u.role === 'STAFF' && (
                        <Badge variant="success" dot>
                          Staff Member
                        </Badge>
                      )}
                    </TableCell>

                    <TableCell>
                      <span className="text-xs font-medium text-slate-700">{u.department}</span>
                    </TableCell>

                    <TableCell>
                      <Badge variant={statusBadge.variant}>{statusBadge.label}</Badge>
                    </TableCell>

                    <TableCell>
                      <span className="text-xs text-slate-500">{formatDate(u.createdAt)}</span>
                    </TableCell>

                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleStatusToggle(u)}
                          className="px-2.5 py-1 rounded text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer"
                          title="Click to cycle status (Active -> Inactive -> Suspended)"
                        >
                          Change Status
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>

        {filteredUsers.length > 0 && (
          <TablePagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredUsers.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
          />
        )}
      </TableContainer>

      {/* IT Officer User Registration Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Register New System User"
        description="Only IT Officers can create user accounts. Issue initial credentials for login."
        size="md"
        footer={
          <>
            <PrimaryButton variant="outline" size="sm" onClick={() => setIsModalOpen(false)}>
              Cancel
            </PrimaryButton>
            <PrimaryButton
              variant="primary"
              size="sm"
              isLoading={isSubmitting}
              onClick={handleRegisterSubmit}
              leftIcon={<CheckCircle2 className="w-4 h-4" />}
            >
              Provision Account
            </PrimaryButton>
          </>
        }
      >
        <form onSubmit={handleRegisterSubmit} className="space-y-4">
          <Input
            label="Full Name"
            placeholder="e.g. Robert Vance"
            value={formData.fullName}
            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Username"
              placeholder="e.g. robert.vance"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              required
            />
            <Input
              label="Email Address"
              type="email"
              placeholder="e.g. robert@itrowin.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>

          <Input
            label="Phone Number"
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Department"
              placeholder="e.g. QA & Logistics"
              value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              required
            />
            <Select
              label="Assigned System Role"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
              options={[
                { value: 'STAFF', label: 'Staff Member (Requisition)' },
                { value: 'INVENTORY_MANAGER', label: 'Inventory Manager (Stock & Approvals)' },
                { value: 'IT_OFFICER', label: 'IT Officer (System Admin)' },
              ]}
              required
            />
          </div>

          <Input
            label="Initial Password (Provided to User)"
            type="text"
            placeholder="Enter temporary password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            helperText="The user will sign in with this password along with their username."
            leftIcon={<Lock className="w-4 h-4" />}
            required
          />
        </form>
      </Modal>
    </div>
  )
}
