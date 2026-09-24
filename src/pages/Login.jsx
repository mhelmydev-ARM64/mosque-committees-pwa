import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const { signIn, session } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (session) navigate('/', { replace: true })
  }, [session, navigate])

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    const { error } = await signIn(email, password)
    if (error) setError('بيانات الدخول غير صحيحة')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-600 to-emerald-700 p-4">
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-sm">
        <h1 className="text-xl font-extrabold text-center text-teal-700 mb-6">
          نظام لجان المسجد
        </h1>
        <input
          type="email"
          placeholder="البريد الإلكتروني"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full mb-3 px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
          required
        />
        <input
          type="password"
          placeholder="كلمة المرور"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full mb-4 px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
          required
        />
        {error && <p className="text-red-500 text-sm mb-3 text-center">{error}</p>}
        <button className="w-full bg-teal-700 text-white font-bold py-2.5 rounded-xl hover:bg-teal-800 transition">
          تسجيل الدخول
        </button>
      </form>
    </div>
  )
}