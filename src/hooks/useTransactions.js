import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

// آخر الحركات المالية للجنة معيّنة (أو الكل للأدمن/المالية)
export function useTransactions(committeeId = null, limit = 20) {
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    async function load() {
      setLoading(true)
      let query = supabase
        .from('transactions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit)
      if (committeeId) query = query.eq('committee_id', committeeId)
      const { data, error } = await query
      if (error) console.error(error.message)
      if (active) {
        setTransactions(data || [])
        setLoading(false)
      }
    }
    load()
    const channel = supabase
      .channel(`transactions-${committeeId || 'all'}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'transactions' }, load)
      .subscribe()
    return () => {
      active = false
      supabase.removeChannel(channel)
    }
  }, [committeeId, limit])

  return { transactions, loading }
}
