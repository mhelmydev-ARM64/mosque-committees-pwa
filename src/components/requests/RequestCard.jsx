import React from 'react'
import { getCommittee } from '../../config/committees.config'
import CommitteeBadge from '../shared/CommitteeBadge'
import StatusBadge from '../shared/StatusBadge'
import { format } from 'date-fns'

export default function RequestCard({ request, onApprove, onReject, canApprove }) {
  const target = getCommittee(request.target_committee_ref?.key)

  return (
    <div className={`card border-r-4 ${target.colors.border}`}>
      <div className="flex items-start justify-between mb-2">
        <div>
          <h3 className="font-bold text-gray-800">{request.title}</h3>
          <p className="text-sm text-gray-500 mt-1">{request.description}</p>
        </div>
        <StatusBadge statusKey={request.status} />
      </div>

      <div className="flex items-center gap-2 mt-3">
        <CommitteeBadge committeeKey={request.created_by_committee_ref?.key} size="sm" />
        <span className="text-gray-300">←</span>
        <CommitteeBadge committeeKey={request.target_committee_ref?.key} size="sm" />
      </div>

      <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-50">
        <div className="text-sm text-gray-400">
          {request.amount ? `${Number(request.amount).toLocaleString()} ﷼` : ''}
          {' · '}
          {format(new Date(request.created_at), 'yyyy/MM/dd')}
        </div>

        {canApprove && request.status === 'pending' && (
          <div className="flex gap-2">
            <button
              onClick={() => onApprove(request)}
              className="text-xs font-bold text-green-600 bg-green-50 px-3 py-1.5 rounded-lg hover:bg-green-100"
            >
              اعتماد
            </button>
            <button
              onClick={() => onReject(request)}
              className="text-xs font-bold text-red-600 bg-red-50 px-3 py-1.5 rounded-lg hover:bg-red-100"
            >
              رفض
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
