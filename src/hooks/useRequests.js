import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabaseClient'

// هوك موحّد لجلب الطلبات والاشتراك بالتحديثات اللحظية (Realtime)
// + استدعاء الدالة الآمنة approve_request لضمان عدم حدوث Race Condition
// committeeId: uuid الفعلي من جدول committees (وليس المفتاح النصي مثل 'tech').
// مرّر profile.committee_id لعرض طلبات لجنة المستخدم الحالي فقط، أو اتركه
// فارغاً لعرض كل الطلبات التي تسمح بها سياسات RLS (كل ما يخص لجنة المستخدم
// إنشاءً أو استهدافاً، أو الكل للأدمن).
export function useRequests(committeeId = null) {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchRequests = useCallback(async () => {
    setLoading(true)
    let query = supabase
      .from('requests')
      .select('*, created_by_committee_ref:committees!requests_created_by_committee_fkey(key,name), target_committee_ref:committees!requests_target_committee_fkey(key,name)')
      .eq('is_deleted', false)
      .order('created_at', { ascending: false })

    if (committeeId) query = query.eq('target_committee', committeeId)

    const { data, error } = await query
    if (error) setError(error.message)
    setRequests(data || [])
    setLoading(false)
  }, [committeeId])

  useEffect(() => {
    fetchRequests()

    // الاشتراك اللحظي بأي تغيير على جدول requests
    const channel = supabase
      .channel('requests-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'requests' },
        () => fetchRequests()
      )
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [fetchRequests])

  // الاعتماد يتم عبر Stored Procedure وليس تحديث مباشر على الجدول،
  // لضمان أن تحديث حالة الطلب وخصم الميزانية يحدثان معاً كعملية Atomic
  // ولمنع اعتماد نفس الطلب مرتين في نفس اللحظة (Concurrency Control)
  async function approveRequest(requestId) {
    const { data, error } = await supabase.rpc('approve_request', {
      p_request_id: requestId,
    })
    if (error) throw new Error(error.message)
    return data
  }

  async function rejectRequest(requestId, reason = null) {
    const { data, error } = await supabase.rpc('reject_request', {
      p_request_id: requestId,
      p_reason: reason,
    })
    if (error) throw new Error(error.message)
    return data
  }

  return { requests, loading, error, refetch: fetchRequests, approveRequest, rejectRequest }
}
