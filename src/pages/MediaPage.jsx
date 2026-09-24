import React, { useState } from 'react'
import { Plus, Megaphone } from 'lucide-react'
import { useActivities } from '../hooks/useActivities'
import ActivitiesList from '../components/activities/ActivitiesList'
import ActivityForm from '../components/activities/ActivityForm'
import Modal from '../components/shared/Modal'

// صفحة لجنة الإعلام والتنسيق: جدول الأنشطة والتنسيق الخارجي مع الأوقاف والمساجد
export default function MediaPage() {
  const { activities, loading, addActivity, updateActivity, removeActivity } = useActivities()
  const [showForm, setShowForm] = useState(false)

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-extrabold text-gray-800 flex items-center gap-2">
            <Megaphone className="text-sky-600" size={24} />
            الإعلام والتنسيق
          </h2>
          <p className="text-gray-400 text-sm mt-1">جدول الأنشطة والتنسيق الخارجي</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-sky-600 text-white font-bold px-4 py-2.5 rounded-xl hover:bg-sky-700 transition text-sm"
        >
          <Plus size={16} />
          نشاط جديد
        </button>
      </div>

      <ActivitiesList
        activities={activities}
        loading={loading}
        onUpdateStatus={(id, status) => updateActivity(id, { status })}
        onRemove={removeActivity}
      />

      <Modal open={showForm} onClose={() => setShowForm(false)} title="إضافة نشاط جديد">
        <ActivityForm onSubmit={addActivity} onClose={() => setShowForm(false)} />
      </Modal>
    </div>
  )
}
