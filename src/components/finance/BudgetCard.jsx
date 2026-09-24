import React from 'react'
import { getCommittee } from '../../config/committees.config'

// بطاقة تعرض رصيد لجنة معيّنة بلونها الخاص
export default function BudgetCard({ committeeKey, balance, onAddIncome }) {
  const committee = getCommittee(committeeKey)
  const Icon = committee.icon

  return (
    <div className={`card bg-gradient-to-br ${committee.colors.gradient} text-white`}>
      <div className="flex items-center justify-between">
        <Icon size={22} />
        {onAddIncome && (
          <button
            onClick={onAddIncome}
            className="text-xs font-bold bg-white/20 hover:bg-white/30 px-3 py-1 rounded-lg transition"
          >
            + إيراد
          </button>
        )}
      </div>
      <p className="mt-4 text-sm opacity-90">{committee.label}</p>
      <p className="text-2xl font-extrabold mt-1">
        {Number(balance ?? 0).toLocaleString()} <span className="text-sm font-normal">﷼</span>
      </p>
    </div>
  )
}
