import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabaseClient'

// إدارة الأنشطة والفعاليات (لجنة الإعلام والتنسيق)
export function useActivities() {
  const [activities, setActivities] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchActivities = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('activities')
      .select('*')
      .eq('is_deleted', false)
      .order('date', { ascending: true })
    if (error) console.error(error.message)
    setActivities(data || [])
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchActivities()
    const channel = supabase
      .channel('activities')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'activities' }, fetchActivities)
      .subscribe()
    return () => supabase.removeChannel(channel)
  }, [fetchActivities])

  async function addActivity(payload) {
    const { error } = await supabase.from('activities').insert(payload)
    if (error) throw new Error(error.message)
  }

  async function updateActivity(id, payload) {
    const { error } = await supabase.from('activities').update(payload).eq('id', id)
    if (error) throw new Error(error.message)
  }

  async function removeActivity(id) {
    const { error } = await supabase.from('activities').update({ is_deleted: true }).eq('id', id)
    if (error) throw new Error(error.message)
  }

  return { activities, loading, addActivity, updateActivity, removeActivity, refetch: fetchActivities }
}
