import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabaseClient'

// جلب ميزانية لجنة معيّنة (أو كل الميزانيات لو لم يُمرَّر مفتاح) + Realtime
export function useBudget(committeeId) {
  const [budget, setBudget] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchBudget = useCallback(async () => {
    if (!committeeId) return
    setLoading(true)
    const { data, error } = await supabase
      .from('budgets')
      .select('*')
      .eq('committee_id', committeeId)
      .maybeSingle()
    if (error) console.error(error.message)
    setBudget(data)
    setLoading(false)
  }, [committeeId])

  useEffect(() => {
    fetchBudget()
    if (!committeeId) return
    const channel = supabase
      .channel(`budget-${committeeId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'budgets', filter: `committee_id=eq.${committeeId}` },
        () => fetchBudget()
      )
      .subscribe()
    return () => supabase.removeChannel(channel)
  }, [committeeId, fetchBudget])

  // تسجيل إيراد جديد عبر الدالة الآمنة add_income (Atomic + مرتبط بصلاحيات RLS)
  async function addIncome(amount, category) {
    const { data, error } = await supabase.rpc('add_income', {
      p_committee_id: committeeId,
      p_amount: amount,
      p_category: category,
    })
    if (error) throw new Error(error.message)
    return data
  }

  return { budget, loading, refetch: fetchBudget, addIncome }
}

// كل الميزانيات مجتمعة (للوحة تحكم الأدمن/المالية)
export function useAllBudgets() {
  const [budgets, setBudgets] = useState([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('budgets')
      .select('*, committees(key, name)')
    if (error) console.error(error.message)
    setBudgets(data || [])
    setLoading(false)
  }, [])

  useEffect(() => {
    load()
    const channel = supabase
      .channel('all-budgets')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'budgets' }, load)
      .subscribe()
    return () => supabase.removeChannel(channel)
  }, [load])

  return { budgets, loading, refetch: load }
}
