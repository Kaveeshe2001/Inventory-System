import React, { useState, useEffect } from 'react'
import { Search } from 'lucide-react'
import type { AuditLog } from '../../utils/mockData'
import { Badge } from '../../components/ui/Badge/Badge'
import { Input } from '../../components/ui/Input/Input'
import { Table, TableBody, TableCell, TableContainer, TableEmpty, TableHead, TableHeader, TablePagination, TableRow } from '../../components/ui/Table/Table'
import { formatDateTime } from '../../utils/format'
import { userService } from '../../services/UserService'

export const SystemLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [search, setSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 8

  useEffect(() => {
    userService.getAuditLogs().then(setLogs)
  }, [])

  const filteredLogs = logs.filter(
    (l) =>
      l.action.toLowerCase().includes(search.toLowerCase()) ||
      l.actor.toLowerCase().includes(search.toLowerCase()) ||
      l.details.toLowerCase().includes(search.toLowerCase())
  )

  const totalPages = Math.ceil(filteredLogs.length / pageSize)
  const paginatedLogs = filteredLogs.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  return (
    <div className="space-y-6">
      <div className="pb-2 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-black text-slate-900 tracking-tight font-display">
            System Security & Audit Logs
          </h1>
          <Badge variant="purple">Compliance Record</Badge>
        </div>
        <p className="text-xs text-slate-500 mt-1">
          Detailed audit trail of authentication events, user registration, and privilege changes.
        </p>
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs max-w-sm">
        <Input
          placeholder="Filter audit logs..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value)
            setCurrentPage(1)
          }}
          leftIcon={<Search className="w-4 h-4" />}
        />
      </div>

      <TableContainer>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Event Action</TableHead>
              <TableHead>Triggered By</TableHead>
              <TableHead>Event Details</TableHead>
              <TableHead>IP Address</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Timestamp</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedLogs.length === 0 ? (
              <TableEmpty title="No log entries" description="No audit log matches your query." colSpan={6} />
            ) : (
              paginatedLogs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell>
                    <span className="font-mono text-xs font-bold text-slate-800 bg-slate-100 px-2 py-1 rounded">
                      {log.action}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="font-semibold text-slate-700 text-xs">{log.actor}</span>
                    <span className="text-[10px] text-slate-400 block">{log.role}</span>
                  </TableCell>
                  <TableCell>
                    <p className="text-xs text-slate-600 max-w-md">{log.details}</p>
                  </TableCell>
                  <TableCell>
                    <span className="font-mono text-xs text-slate-500">{log.ipAddress}</span>
                  </TableCell>
                  <TableCell>
                    <Badge variant={log.status === 'SUCCESS' ? 'success' : 'warning'} size="sm">
                      {log.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-xs text-slate-500">{formatDateTime(log.timestamp)}</span>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {filteredLogs.length > 0 && (
          <TablePagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredLogs.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
          />
        )}
      </TableContainer>
    </div>
  )
}
