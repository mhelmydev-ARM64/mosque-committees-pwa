import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Sidebar from './components/shared/Sidebar'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import RequestsPage from './pages/RequestsPage'
import FinancePage from './pages/FinancePage'
import TechPage from './pages/TechPage'
import MediaPage from './pages/MediaPage'
import QuranPage from './pages/QuranPage'
import UsersAdmin from './pages/UsersAdmin'

function ProtectedLayout({ children }) {
  const { session, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-400">
        جاري التحميل...
      </div>
    )
  }
  if (!session) return <Navigate to="/login" replace />

  return (
    <div className="flex flex-row-reverse min-h-screen">
      <Sidebar />
      <main className="flex-1">{children}</main>
    </div>
  )
}

// يحمي مساراً بعينه بمجموعة أدوار مسموحة (الأدمن مسموح له دائماً)
function RoleGate({ allow, children }) {
  const { profile, isAdmin } = useAuth()
  if (isAdmin) return children
  if (!profile || !allow.some((prefix) => profile.role?.startsWith(prefix))) {
    return (
      <div className="p-10 text-center text-gray-400">
        ليست لديك صلاحية الوصول إلى هذه الصفحة
      </div>
    )
  }
  return children
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/*"
        element={
          <ProtectedLayout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/requests" element={<RequestsPage />} />
              <Route
                path="/finance"
                element={
                  <RoleGate allow={['finance']}>
                    <FinancePage />
                  </RoleGate>
                }
              />
              <Route
                path="/tech"
                element={
                  <RoleGate allow={['tech']}>
                    <TechPage />
                  </RoleGate>
                }
              />
              <Route
                path="/media"
                element={
                  <RoleGate allow={['media']}>
                    <MediaPage />
                  </RoleGate>
                }
              />
              <Route
                path="/quran"
                element={
                  <RoleGate allow={['quran']}>
                    <QuranPage />
                  </RoleGate>
                }
              />
              <Route
                path="/admin/users"
                element={
                  <RoleGate allow={[]}>
                    <UsersAdmin />
                  </RoleGate>
                }
              />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </ProtectedLayout>
        }
      />
    </Routes>
  )
}
