import React, { useState } from 'react'
import { Plus } from 'lucide-react'
import { useRequests } from '../hooks/useRequests'
import { useAuth } from '../context/AuthContext'
import RequestCard from '../components/requests/RequestCard'
import RequestForm from '../components/requests/RequestForm'
import Modal from '../components/shared/Modal'
import EmptyState from '../components/shared/EmptyState'

const TABS = [
  { key: 'all', label: 'الكل' },
  { key: 'pending', label: 'بانتظار الموافقة' },
  { key: 'approved', label: 'معتمدة' },
  { key: 'rejected', label: 'مرفوضة' },
]

export default function RequestsPage() {
  const { profile, isAdmin } = useAuth()
  const { requests, loading, approveRequest, rejectRequest, refetch } = useRequests()
  const [tab, setTab] = useState('all')
  const [showForm, setShowForm] = useState(false)
  const [actionError, setActionError] = useState('')

  const canApprove =
    isAdmin || profile?.role === 'finance_head' || profile?.role === 'finance_member'

  const filtered = requests.filter((r) => (tab === 'all' ? true : r.status === tab))

  async function handleApprove(request) {
    setActionError('')
    try {
      await approveRequest(request.id)
    } catch (e) {
      setActionError(e.message)
    }
  }

  async function handleReject(request) {
    setActionError('')
    const reason = window.prompt('سبب الرفض (اختياري):') || null
    try {
      await rejectRequest(request.id, reason)
    } catch (e) {
      setActionError(e.message)
    }
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-extrabold text-gray-800">الطلبات</h2>
          <p className="text-gray-400 text-sm mt-1">
            كل الطلبات الموجّهة إلى لجنتك أو الصادرة منها
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-teal-700 text-white font-bold px-4 py-2.5 rounded-xl hover:bg-teal-800 transition text-sm"
        >
          <Plus size={16} />
          طلب جديد
        </button>
      </div>

      <div className="flex gap-2 mb-5 overflow-x-auto">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition ${
              tab === t.key ? 'bg-teal-700 text-white' : 'bg-white text-gray-500 border border-gray-100'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {actionError && (
        <p className="text-red-500 text-sm mb-4 bg-red-50 border border-red-100 rounded-xl px-4 py-2.5">
          {actionError}
        </p>
      )}

      {loading ? (
        <p className="text-gray-400 text-sm">جاري التحميل...</p>
      ) : filtered.length === 0 ? (
        <EmptyState message="لا توجد طلبات في هذا التصنيف" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((r) => (
            <RequestCard
              key={r.id}
              request={r}
              canApprove={canApprove}
              onApprove={handleApprove}
              onReject={handleReject}
            />
          ))}
        </div>
      )}

      <Modal open={showForm} onClose={() => setShowForm(false)} title="إنشاء طلب جديد">
        <RequestForm onCreated={refetch} onClose={() => setShowForm(false)} />
      </Modal>
    </div>
  )
}
