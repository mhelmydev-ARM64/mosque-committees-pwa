import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

// يجلب كل صفوف committees مع الـ id الفعلي (uuid) لكل مفتاح (key)
// يُستخدم عندما نحتاج uuid اللجنة الحقيقي بدل المفتاح النصي، بصرف النظر
// عن لجنة المستخدم الحالي (مفيد بشكل خاص لعرض الأدمن)
export function useCommittees() {
  const [committees, setCommittees] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    supabase
      .from('committees')
      .select('id, key, name')
      .then(({ data, error }) => {
        if (error) console.error(error.message)
        if (active) {
          setCommittees(data || [])
          setLoading(false)
        }
      })
    return () => {
      active = false
    }
  }, [])

  const idByKey = (key) => committees.find((c) => c.key === key)?.id || null

  return { committees, loading, idByKey }
}
