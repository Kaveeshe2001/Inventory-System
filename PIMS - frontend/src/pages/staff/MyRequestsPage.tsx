import React, { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import type { ItemRequest } from '../../models/request'
import { requestService } from '../../services/RequestService'
import { Badge } from '../../components/ui/Badge/Badge'
import { Table, TableBody, TableCell, TableContainer, TableEmpty, TableHead, TableHeader, TablePagination, TableRow } from '../../components/ui/Table/Table'
import { formatDate, getRequestStatusBadge } from '../../utils/format'

export const MyRequestsPage: React.FC = () => {
  const { user } = useAuth()
  const [requests, setRequests] = useState<ItemRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 6

  useEffect(() => {
    if (!user) return
    requestService.getMyRequests(user.id).then((data) => {
      setRequests(data)
      setLoading(false)
    })
  }, [user])

  const totalPages = Math.ceil(requests.length / pageSize)
  const paginated = requests.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  return (
    <div className="space-y-6">
      <div className="pb-2 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-black text-slate-900 tracking-tight font-display">
            My Item Requisitions
          </h1>
          <Badge variant="success">Personal History</Badge>
        </div>
        <p className="text-xs text-slate-500 mt-1">
          Track the approval status and fulfillment progress of your submitted inventory requests.
        </p>
      </div>

      <TableContainer>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Requisition Number</TableHead>
              <TableHead>Requested Item</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead>Submission Date</TableHead>
              <TableHead>Reason / Notes</TableHead>
              <TableHead>Approval Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginated.length === 0 ? (
              <TableEmpty
                title="No requests submitted"
                description="Browse the catalog to create your first item requisition."
                colSpan={6}
              />
            ) : (
              paginated.map((req) => {
                const badge = getRequestStatusBadge(req.status)
                return (
                  <TableRow key={req.id}>
                    <TableCell>
                      <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-1 rounded">
                        {req.requestNumber}
                      </span>
                    </TableCell>

                    <TableCell>
                      <p className="font-bold text-slate-900 text-xs">{req.itemName}</p>
                      <p className="text-[10px] text-slate-400 font-mono">{req.itemCode}</p>
                    </TableCell>

                    <TableCell>
                      <span className="text-sm font-extrabold text-slate-900 font-display">
                        {req.quantity}
                      </span>{' '}
                      <span className="text-xs text-slate-500">{req.unit}</span>
                    </TableCell>

                    <TableCell>
                      <span className="text-xs text-slate-600">{formatDate(req.createdAt)}</span>
                    </TableCell>

                    <TableCell>
                      <p className="text-xs text-slate-600 max-w-sm italic line-clamp-2">"{req.reason}"</p>
                      {req.remarks && (
                        <p className="text-[10px] text-blue-600 font-semibold mt-1">
                          Manager note: {req.remarks}
                        </p>
                      )}
                    </TableCell>

                    <TableCell>
                      <Badge variant={badge.variant}>{badge.label}</Badge>
                      {req.approvedBy && (
                        <span className="text-[10px] text-slate-400 block mt-0.5">
                          Reviewed by {req.approvedBy}
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>

        {requests.length > 0 && (
          <TablePagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={requests.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
          />
        )}
      </TableContainer>
    </div>
  )
}
