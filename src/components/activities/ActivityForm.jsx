import React, { useState } from 'react'
import FormField, { inputClass } from '../shared/FormField'

export default function ActivityForm({ onSubmit, onClose }) {
  const [title, setTitle] = useState('')
  const [externalEntity, setExternalEntity] = useState('')
  const [date, setDate] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await onSubmit({ title, external_entity: externalEntity, date: date || null, status: 'planned' })
      onClose?.()
    } catch (e) {
      setError(e.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <FormField label="عنوان النشاط">
        <input className={inputClass} value={title} onChange={(e) => setTitle(e.target.value)} required />
      </FormField>
      <FormField label="الجهة الخارجية المنسّقة (إن وجدت)">
        <input
          className={inputClass}
          value={externalEntity}
          onChange={(e) => setExternalEntity(e.target.value)}
          placeholder="مثال: وزارة الأوقاف"
        />
      </FormField>
      <FormField label="التاريخ">
        <input type="date" className={inputClass} value={date} onChange={(e) => setDate(e.target.value)} />
      </FormField>
      {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
      <button
        disabled={submitting}
        className="w-full bg-sky-600 text-white font-bold py-2.5 rounded-xl hover:bg-sky-700 transition disabled:opacity-50"
      >
        {submitting ? 'جارٍ الحفظ...' : 'حفظ النشاط'}
      </button>
    </form>
  )
}
