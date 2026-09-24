import React from 'react'
import { ArrowDownCircle, ArrowUpCircle } from 'lucide-react'
import { format } from 'date-fns'
import EmptyState from '../shared/EmptyState'

export default function TransactionsList({ transactions, loading }) {
  if (loading) return <p className="text-gray-400 text-sm">جاري التحميل...</p>
  if (transactions.length === 0) return <EmptyState message="لا توجد حركات مالية بعد" />

  return (
    <div className="card divide-y divide-gray-50">
      {transactions.map((t) => (
        <div key={t.id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
          <div className="flex items-center gap-3">
            {t.type === 'IN' ? (
              <ArrowUpCircle className="text-green-500" size={22} />
            ) : (
              <ArrowDownCircle className="text-red-500" size={22} />
            )}
            <div>
              <p className="text-sm font-bold text-gray-700">{t.category || (t.type === 'IN' ? 'إيراد' : 'مصروف')}</p>
              <p className="text-xs text-gray-400">{format(new Date(t.created_at), 'yyyy/MM/dd HH:mm')}</p>
            </div>
          </div>
          <span className={`font-extrabold text-sm ${t.type === 'IN' ? 'text-green-600' : 'text-red-600'}`}>
            {t.type === 'IN' ? '+' : '-'} {Number(t.amount).toLocaleString()} ﷼
          </span>
        </div>
      ))}
    </div>
  )
}
