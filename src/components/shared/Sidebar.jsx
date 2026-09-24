import React from 'react'
import { NavLink } from 'react-router-dom'
import { LayoutDashboard, ListChecks, Wallet, Cpu, Megaphone, BookOpenCheck, ShieldCheck, LogOut } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

const links = [
  { to: '/', label: 'الرئيسية', icon: LayoutDashboard, allow: null },
  { to: '/requests', label: 'الطلبات', icon: ListChecks, allow: null },
  { to: '/finance', label: 'اللجنة المالية', icon: Wallet, allow: 'finance' },
  { to: '/tech', label: 'اللجنة التقنية', icon: Cpu, allow: 'tech' },
  { to: '/media', label: 'الإعلام والتنسيق', icon: Megaphone, allow: 'media' },
  { to: '/quran', label: 'الحلقات والتربية', icon: BookOpenCheck, allow: 'quran' },
]

export default function Sidebar() {
  const { signOut, profile, isAdmin } = useAuth()

  const visibleLinks = links.filter(
    (l) => !l.allow || isAdmin || profile?.role?.startsWith(l.allow)
  )

  return (
    <aside className="w-64 h-screen bg-white border-l border-gray-100 flex flex-col p-4 sticky top-0">
      <div className="mb-8 px-2">
        <h1 className="text-lg font-extrabold text-teal-700">نظام لجان المسجد</h1>
        {profile && <p className="text-xs text-gray-400 mt-1">{profile.name}</p>}
      </div>

      <nav className="flex-1 space-y-1">
        {visibleLinks.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition ${
                isActive ? 'bg-teal-50 text-teal-700' : 'text-gray-500 hover:bg-gray-50'
              }`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}

        {isAdmin && (
          <NavLink
            to="/admin/users"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition ${
                isActive ? 'bg-slate-100 text-slate-800' : 'text-gray-500 hover:bg-gray-50'
              }`
            }
          >
            <ShieldCheck size={18} />
            إدارة المستخدمين
          </NavLink>
        )}
      </nav>

      <button
        onClick={signOut}
        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-red-500 hover:bg-red-50"
      >
        <LogOut size={18} />
        تسجيل الخروج
      </button>
    </aside>
  )
}
