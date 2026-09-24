import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabaseClient'

// لوحة إدارة المستخدمين — للأدمن فقط (تُفرض أيضاً عبر RLS في قاعدة البيانات)
export function useUsers() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('users')
      .select('*, committees(key, name)')
      .order('created_at', { ascending: false })
    if (error) console.error(error.message)
    setUsers(data || [])
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  // تحديث دور/لجنة مستخدم — محمي بـ RLS + trigger منع تصعيد الصلاحيات الذاتي
  async function updateUserRole(userId, role, committeeId) {
    const { error } = await supabase
      .from('users')
      .update({ role, committee_id: committeeId })
      .eq('id', userId)
    if (error) throw new Error(error.message)
    fetchUsers()
  }

  async function toggleActive(userId, isActive) {
    const { error } = await supabase.from('users').update({ is_active: isActive }).eq('id', userId)
    if (error) throw new Error(error.message)
    fetchUsers()
  }

  return { users, loading, updateUserRole, toggleActive, refetch: fetchUsers }
}
