import React from 'react'

// حقل نموذج موحّد الشكل عبر كل نماذج التطبيق
export default function FormField({ label, children }) {
  return (
    <label className="block mb-4">
      <span className="block text-sm font-bold text-gray-600 mb-1.5">{label}</span>
      {children}
    </label>
  )
}

export const inputClass =
  'w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm'
