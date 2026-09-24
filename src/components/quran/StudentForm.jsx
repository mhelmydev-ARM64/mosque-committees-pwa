import React, { useState } from 'react'
import FormField, { inputClass } from '../shared/FormField'

export default function StudentForm({ initial, onSubmit, onClose }) {
  const [name, setName] = useState(initial?.name || '')
  const [level, setLevel] = useState(initial?.level || '')
  const [teacherName, setTeacherName] = useState(initial?.teacher_name || '')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await onSubmit({ name, level, teacher_name: teacherName, is_active: true })
      onClose?.()
    } catch (e) {
      setError(e.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <FormField label="اسم الطالب">
        <input className={inputClass} value={name} onChange={(e) => setName(e.target.value)} required />
      </FormField>
      <FormField label="المستوى / الجزء الحالي">
        <input className={inputClass} value={level} onChange={(e) => setLevel(e.target.value)} placeholder="مثال: الجزء 5" />
      </FormField>
      <FormField label="اسم المعلم">
        <input className={inputClass} value={teacherName} onChange={(e) => setTeacherName(e.target.value)} />
      </FormField>
      {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
      <button
        disabled={submitting}
        className="w-full bg-teal-600 text-white font-bold py-2.5 rounded-xl hover:bg-teal-700 transition disabled:opacity-50"
      >
        {submitting ? 'جارٍ الحفظ...' : 'حفظ'}
      </button>
    </form>
  )
}
