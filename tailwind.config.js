/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        cairo: ['Cairo', 'Tajawal', 'sans-serif']
      },
      colors: {
        // اللجنة المالية
        finance: { DEFAULT: '#10b981', dark: '#047857', accent: '#f59e0b' },
        // اللجنة التقنية
        tech: { DEFAULT: '#6366f1', dark: '#4338ca', accent: '#8b5cf6' },
        // لجنة الإعلام والتنسيق
        media: { DEFAULT: '#0ea5e9', dark: '#0369a1', accent: '#f97316' },
        // لجنة الحلقات والتربية
        quran: { DEFAULT: '#14b8a6', dark: '#115e59', accent: '#166534' },
        // حالات الطلبات
        status: {
          approved: '#22c55e',
          rejected: '#ef4444',
          pending: '#eab308',
          inprogress: '#3b82f6'
        }
      }
    }
  },
  plugins: []
}
