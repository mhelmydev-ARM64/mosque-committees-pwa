import React from 'react'
import { Inbox } from 'lucide-react'

export default function EmptyState({ message = 'لا توجد بيانات حتى الآن', icon: Icon = Inbox }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-gray-300">
      <Icon size={40} />
      <p className="mt-3 text-sm font-semibold text-gray-400">{message}</p>
    </div>
  )
}
