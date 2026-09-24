import React from 'react'
import { ShieldCheck } from 'lucide-react'
import { useUsers } from '../hooks/useUsers'
import { useCommittees } from '../hooks/useCommittees'
import { ROLES } from '../config/committees.config'
import EmptyState from '../components/shared/EmptyState'

// صفحة إدارة المستخدمين — تُعرض فقط للأدمن (App.jsx يحمي المسار، وRLS
// في قاعدة البيانات يمنع أي تعديل فعلي من غير الأدمن حتى لو وصل للصفحة)
export default function UsersAdmin() {
  const { users, loading, updateUserRole, toggleActive } = useUsers()
  const { committees } = useCommittees()

  async function handleRoleChange(user, role) {
    await updateUserRole(user.id, role, user.committee_id)
  }

  async function handleCommitteeChange(user, committeeId) {
    await updateUserRole(user.id, user.role, committeeId)
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-extrabold text-gray-800 flex items-center gap-2 mb-1">
        <ShieldCheck className="text-slate-700" size={24} />
        إدارة المستخدمين والصلاحيات
      </h2>
      <p className="text-gray-400 text-sm mb-6">هذه الصفحة متاحة للأدمن فقط</p>

      {loading ? (
        <p className="text-gray-400 text-sm">جاري التحميل...</p>
      ) : users.length === 0 ? (
        <EmptyState message="لا يوجد مستخدمون" />
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-right text-gray-400 border-b border-gray-100">
                <th className="pb-3 font-bold">الاسم</th>
                <th className="pb-3 font-bold">اللجنة</th>
                <th className="pb-3 font-bold">الدور</th>
                <th className="pb-3 font-bold">الحالة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {users.map((u) => (
                <tr key={u.id}>
                  <td className="py-3 font-semibold text-gray-700">{u.name}</td>
                  <td className="py-3">
                    <select
                      value={u.committee_id || ''}
                      onChange={(e) => handleCommitteeChange(u, e.target.value)}
                      className="text-xs border border-gray-200 rounded-lg px-2 py-1.5"
                    >
                      <option value="">بدون لجنة</option>
                      {committees.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="py-3">
                    <select
                      value={u.role}
                      onChange={(e) => handleRoleChange(u, e.target.value)}
                      className="text-xs border border-gray-200 rounded-lg px-2 py-1.5"
                    >
                      {Object.entries(ROLES).map(([key, r]) => (
                        <option key={key} value={key}>
                          {r.label}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="py-3">
                    <button
                      onClick={() => toggleActive(u.id, !u.is_active)}
                      className={`badge ${
                        u.is_active ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-400'
                      }`}
                    >
                      {u.is_active ? 'نشط' : 'موقوف'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
