import React from 'react'
import { getStatus } from '../../config/committees.config'

// يعرض شارة حالة الطلب (معتمد / مرفوض / بانتظار / قيد التنفيذ)
export default function StatusBadge({ statusKey }) {
  const status = getStatus(statusKey)
  const Icon = status.icon
  const spin = statusKey === 'in_progress' ? 'animate-spin' : ''

  return (
    <span className={`badge ${status.bg} ${status.text} border ${status.border}`}>
      <Icon size={14} className={spin} />
      {status.label}
    </span>
  )
}
