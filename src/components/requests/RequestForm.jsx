import React, { useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { useAuth } from '../../context/AuthContext'
import { COMMITTEES } from '../../config/committees.config'
import FormField, { inputClass } from '../shared/FormField'

// نموذج موحّد لإنشاء طلب من أي لجنة إلى أي لجنة أخرى (مالي أو فني أو غيره)
export default function RequestForm({ onCreated, onClose }) {
  const { profile } = useAuth()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [priority, setPriority] = useState('normal')
  const [targetCommittee, setTargetCommittee] = useState('finance')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const targetOptions = Object.values(COMMITTEES).filter((c) => c.key !== 'admin')

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (!profile?.committee_id) {
      setError('لا يمكن إنشاء الطلب: لجنتك غير محددة في حسابك')
      return
    }

    setSubmitting(true)

    // نحتاج id اللجنة الهدف (وليس المفتاح النصي) — نجلبه من committees
    const { data: targetRow, error: targetErr } = await supabase
      .from('committees')
      .select('id')
      .eq('key', targetCommittee)
      .single()

    if (targetErr || !targetRow) {
      setError('تعذّر تحديد اللجنة المستهدفة')
      setSubmitting(false)
      return
    }

    const { error: insertErr } = await supabase.from('requests').insert({
      title,
      description,
      amount: amount ? Number(amount) : null,
      priority,
      created_by_committee: profile.committee_id,
      target_committee: targetRow.id,
      created_by: profile.id,
    })

    setSubmitting(false)

    if (insertErr) {
      setError(insertErr.message)
      return
    }

    setTitle('')
    setDescription('')
    setAmount('')
    onCreated?.()
    onClose?.()
  }

  return (
    <form onSubmit={handleSubmit}>
      <FormField label="عنوان الطلب">
        <input
          className={inputClass}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          placeholder="مثال: طلب صرف مستلزمات صوتيات"
        />
      </FormField>

      <FormField label="الوصف">
        <textarea
          className={inputClass}
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="تفاصيل إضافية عن الطلب..."
        />
      </FormField>

      <FormField label="اللجنة المستهدفة">
        <select
          className={inputClass}
          value={targetCommittee}
          onChange={(e) => setTargetCommittee(e.target.value)}
        >
          {targetOptions.map((c) => (
            <option key={c.key} value={c.key}>
              {c.label}
            </option>
          ))}
        </select>
      </FormField>

      <div className="grid grid-cols-2 gap-3">
        <FormField label="المبلغ (اختياري)">
          <input
            type="number"
            min="0.01"
            step="0.01"
            className={inputClass}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="بدون مبلغ إن لم يكن مالياً"
          />
        </FormField>

        <FormField label="الأولوية">
          <select className={inputClass} value={priority} onChange={(e) => setPriority(e.target.value)}>
            <option value="low">منخفضة</option>
            <option value="normal">عادية</option>
            <option value="high">مرتفعة</option>
            <option value="urgent">عاجلة</option>
          </select>
        </FormField>
      </div>

      {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

      <button
        disabled={submitting}
        className="w-full bg-teal-700 text-white font-bold py-2.5 rounded-xl hover:bg-teal-800 transition disabled:opacity-50"
      >
        {submitting ? 'جارٍ الإرسال...' : 'إرسال الطلب'}
      </button>
    </form>
  )
}
