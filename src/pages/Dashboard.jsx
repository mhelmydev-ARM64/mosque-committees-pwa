import React from 'react'
import { COMMITTEES } from '../config/committees.config'
import { useAuth } from '../context/AuthContext'
import { useRequests } from '../hooks/useRequests'

export default function Dashboard() {
  const { profile } = useAuth()
  const { requests, loading } = useRequests()

  const pendingCount = requests.filter((r) => r.status === 'pending').length

  return (
    <div className="p-6">
      <h2 className="text-2xl font-extrabold text-gray-800 mb-1">
        مرحباً {profile?.name || ''} 👋
      </h2>
      <p className="text-gray-400 mb-6">نظرة عامة على نشاط اللجان اليوم</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {Object.values(COMMITTEES)
          .filter((c) => c.key !== 'admin')
          .map((c) => {
            const Icon = c.icon
            return (
              <div key={c.key} className={`card bg-gradient-to-br ${c.colors.gradient} text-white`}>
                <Icon size={22} />
                <p className="mt-3 font-bold">{c.label}</p>
              </div>
            )
          })}
      </div>

      <div className="card">
        <p className="font-bold text-gray-700">
          {loading ? 'جاري التحميل...' : `عدد الطلبات المعلّقة: ${pendingCount}`}
        </p>
      </div>
    </div>
  )
}
