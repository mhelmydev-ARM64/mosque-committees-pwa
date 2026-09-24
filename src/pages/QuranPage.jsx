import React, { useState } from 'react'
import { Plus, BookOpenCheck } from 'lucide-react'
import { useStudents } from '../hooks/useStudents'
import StudentsTable from '../components/quran/StudentsTable'
import StudentForm from '../components/quran/StudentForm'
import Modal from '../components/shared/Modal'

// صفحة لجنة الحلقات والتربية: إشراف على الطلاب والمعلمين وأعدادهم
export default function QuranPage() {
  const { students, loading, addStudent, removeStudent } = useStudents()
  const [showForm, setShowForm] = useState(false)

  const activeCount = students.filter((s) => s.is_active).length

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-extrabold text-gray-800 flex items-center gap-2">
            <BookOpenCheck className="text-teal-600" size={24} />
            الحلقات والتربية
          </h2>
          <p className="text-gray-400 text-sm mt-1">
            {loading ? '...' : `${activeCount} طالب نشط من إجمالي ${students.length}`}
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-teal-600 text-white font-bold px-4 py-2.5 rounded-xl hover:bg-teal-700 transition text-sm"
        >
          <Plus size={16} />
          إضافة طالب
        </button>
      </div>

      <StudentsTable students={students} loading={loading} onRemove={removeStudent} />

      <Modal open={showForm} onClose={() => setShowForm(false)} title="إضافة طالب جديد">
        <StudentForm onSubmit={addStudent} onClose={() => setShowForm(false)} />
      </Modal>
    </div>
  )
}
