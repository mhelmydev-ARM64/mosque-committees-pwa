import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabaseClient'

// إدارة طلاب الحلقات (لجنة الحلقات والتربية) — CRUD كامل
export function useStudents() {
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchStudents = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('quran_students')
      .select('*')
      .eq('is_deleted', false)
      .order('created_at', { ascending: false })
    if (error) console.error(error.message)
    setStudents(data || [])
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchStudents()
    const channel = supabase
      .channel('quran-students')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'quran_students' }, fetchStudents)
      .subscribe()
    return () => supabase.removeChannel(channel)
  }, [fetchStudents])

  async function addStudent(payload) {
    const { error } = await supabase.from('quran_students').insert(payload)
    if (error) throw new Error(error.message)
  }

  async function updateStudent(id, payload) {
    const { error } = await supabase.from('quran_students').update(payload).eq('id', id)
    if (error) throw new Error(error.message)
  }

  // حذف لطيف — لا يُستخدم DELETE مباشر حتى على جدول الطلاب، حفاظاً على السجل التاريخي
  async function removeStudent(id) {
    const { error } = await supabase.from('quran_students').update({ is_deleted: true }).eq('id', id)
    if (error) throw new Error(error.message)
  }

  return { students, loading, addStudent, updateStudent, removeStudent, refetch: fetchStudents }
}
