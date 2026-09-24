import React from 'react'
import { getCommittee } from '../../config/committees.config'

// يعرض شارة اللجنة بلونها وأيقونتها المرتبطة ديناميكياً من ملف الإعداد
// الاستخدام: <CommitteeBadge committeeKey="finance" />
export default function CommitteeBadge({ committeeKey, size = 'md' }) {
  const committee = getCommittee(committeeKey)
  const Icon = committee.icon
  const sizeClasses = size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-3 py-1'

  return (
    <span
      className={`badge ${committee.colors.bgSoft} ${committee.colors.text} ${sizeClasses} border ${committee.colors.border}`}
    >
      <Icon size={size === 'sm' ? 12 : 14} />
      {committee.label}
    </span>
  )
}
