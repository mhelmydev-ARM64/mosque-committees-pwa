import React, { useState } from 'react'
import { Plus, Cpu } from 'lucide-react'
import { useRequests } from '../hooks/useRequests'
import { useCommittees } from '../hooks/useCommittees'
import RequestCard from '../components/requests/RequestCard'
import RequestForm from '../components/requests/RequestForm'
import Modal from '../components/shared/Modal'
import EmptyState from '../components/shared/EmptyState'

// صفحة اللجنة التقنية: متابعة المخططات والمتطلبات الفنية عبر نظام الطلبات
// الموحّد (نفس آلية requests لكنها هنا مفلترة على الطلبات الموجّهة للتقنية)
export default function TechPage() {
  const { idByKey } = useCommittees()
  const techId = idByKey('tech')
  const { requests, loading, refetch } = useRequests(techId)
  const [showForm, setShowForm] = useState(false)

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-extrabold text-gray-800 flex items-center gap-2">
            <Cpu className="text-indigo-600" size={24} />
            اللجنة التقنية
          </h2>
          <p className="text-gray-400 text-sm mt-1">المخططات والمتطلبات الفنية الواردة من اللجان</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-indigo-600 text-white font-bold px-4 py-2.5 rounded-xl hover:bg-indigo-700 transition text-sm"
        >
          <Plus size={16} />
          طلب فني جديد
        </button>
      </div>

      {loading ? (
        <p className="text-gray-400 text-sm">جاري التحميل...</p>
      ) : requests.length === 0 ? (
        <EmptyState message="لا توجد طلبات فنية حالياً" icon={Cpu} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {requests.map((r) => (
            <RequestCard key={r.id} request={r} canApprove={false} />
          ))}
        </div>
      )}

      <Modal open={showForm} onClose={() => setShowForm(false)} title="طلب فني جديد">
        <RequestForm onCreated={refetch} onClose={() => setShowForm(false)} />
      </Modal>
    </div>
  )
}
