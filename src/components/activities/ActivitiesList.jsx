import React from 'react'
import { Calendar, Trash2 } from 'lucide-react'
import EmptyState from '../shared/EmptyState'

const STATUS_LABELS = {
  planned: { label: 'مخطّط', cls: 'bg-yellow-50 text-yellow-700' },
  ongoing: { label: 'جارٍ الآن', cls: 'bg-blue-50 text-blue-700' },
  done: { label: 'منتهٍ', cls: 'bg-green-50 text-green-700' },
  cancelled: { label: 'ملغى', cls: 'bg-red-50 text-red-700' },
}

export default function ActivitiesList({ activities, loading, onUpdateStatus, onRemove }) {
  if (loading) return <p className="text-gray-400 text-sm">جاري التحميل...</p>
  if (activities.length === 0) return <EmptyState message="لا توجد أنشطة مجدولة" icon={Calendar} />

  return (
    <div className="space-y-3">
      {activities.map((a) => {
        const s = STATUS_LABELS[a.status] || STATUS_LABELS.planned
        return (
          <div key={a.id} className="card flex items-center justify-between">
            <div>
              <p className="font-bold text-gray-700">{a.title}</p>
              <p className="text-xs text-gray-400 mt-1">
                {a.date || 'بدون تاريخ محدد'} {a.external_entity && `· بالتنسيق مع ${a.external_entity}`}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <select
                value={a.status}
                onChange={(e) => onUpdateStatus(a.id, e.target.value)}
                className={`badge border-0 text-xs font-bold ${s.cls}`}
              >
                {Object.entries(STATUS_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v.label}
                  </option>
                ))}
              </select>
              <button onClick={() => onRemove(a.id)} className="text-gray-300 hover:text-red-500">
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}
