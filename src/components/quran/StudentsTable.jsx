import React from 'react'
import { Trash2 } from 'lucide-react'
import EmptyState from '../shared/EmptyState'

export default function StudentsTable({ students, loading, onRemove }) {
  if (loading) return <p className="text-gray-400 text-sm">جاري التحميل...</p>
  if (students.length === 0) return <EmptyState message="لا يوجد طلاب مسجّلون بعد" />

  return (
    <div className="card overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-right text-gray-400 border-b border-gray-100">
            <th className="pb-3 font-bold">الاسم</th>
            <th className="pb-3 font-bold">المستوى</th>
            <th className="pb-3 font-bold">المعلم</th>
            <th className="pb-3 font-bold">الحالة</th>
            <th className="pb-3"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {students.map((s) => (
            <tr key={s.id}>
              <td className="py-3 font-semibold text-gray-700">{s.name}</td>
              <td className="py-3 text-gray-500">{s.level || '—'}</td>
              <td className="py-3 text-gray-500">{s.teacher_name || '—'}</td>
              <td className="py-3">
                <span className={`badge ${s.is_active ? 'bg-teal-50 text-teal-700' : 'bg-gray-100 text-gray-400'}`}>
                  {s.is_active ? 'نشط' : 'غير نشط'}
                </span>
              </td>
              <td className="py-3 text-left">
                <button onClick={() => onRemove(s.id)} className="text-gray-300 hover:text-red-500">
                  <Trash2 size={16} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
