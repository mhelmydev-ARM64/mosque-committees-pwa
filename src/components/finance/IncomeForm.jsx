import React, { useState } from 'react'
import { COMMITTEES } from '../../config/committees.config'
import FormField, { inputClass } from '../shared/FormField'

// onSubmit(committeeKey, amount, category) — يُمرَّر من الصفحة الأب
export default function IncomeForm({ budgets, onSubmit, onClose }) {
  const [committeeKey, setCommitteeKey] = useState(budgets?.[0]?.committees?.key || 'finance')
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const options = Object.values(COMMITTEES).filter((c) => c.key !== 'admin')

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await onSubmit(committeeKey, Number(amount), category)
      onClose?.()
    } catch (e) {
      setError(e.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <FormField label="اللجنة المستفيدة">
        <select className={inputClass} value={committeeKey} onChange={(e) => setCommitteeKey(e.target.value)}>
          {options.map((c) => (
            <option key={c.key} value={c.key}>
              {c.label}
            </option>
          ))}
        </select>
      </FormField>
      <FormField label="المبلغ">
        <input
          type="number"
          min="0.01"
          step="0.01"
          required
          className={inputClass}
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
      </FormField>
      <FormField label="الفئة / المصدر">
        <input
          className={inputClass}
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          placeholder="مثال: تبرعات الجمعة"
        />
      </FormField>
      {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
      <button
        disabled={submitting}
        className="w-full bg-emerald-600 text-white font-bold py-2.5 rounded-xl hover:bg-emerald-700 transition disabled:opacity-50"
      >
        {submitting ? 'جارٍ الحفظ...' : 'تسجيل الإيراد'}
      </button>
    </form>
  )
}
