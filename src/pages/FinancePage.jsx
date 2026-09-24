import React, { useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../context/AuthContext'
import { useAllBudgets } from '../hooks/useBudget'
import { useTransactions } from '../hooks/useTransactions'
import BudgetCard from '../components/finance/BudgetCard'
import IncomeForm from '../components/finance/IncomeForm'
import TransactionsList from '../components/finance/TransactionsList'
import Modal from '../components/shared/Modal'

export default function FinancePage() {
  const { profile, isAdmin } = useAuth()
  const isFinanceUser = isAdmin || profile?.role?.startsWith('finance')

  const { budgets, loading: budgetsLoading, refetch: refetchBudgets } = useAllBudgets()
  const { transactions, loading: txLoading } = useTransactions(isFinanceUser ? null : profile?.committee_id)
  const [showIncomeForm, setShowIncomeForm] = useState(false)

  // تسجيل إيراد للجنة مختارة عبر الدالة الآمنة add_income (Atomic)
  async function handleAddIncome(committeeKey, amount, category) {
    const target = budgets.find((b) => b.committees?.key === committeeKey)
    const committeeId = target?.committee_id
    if (!committeeId) throw new Error('تعذّر تحديد اللجنة')
    const { error } = await supabase.rpc('add_income', {
      p_committee_id: committeeId,
      p_amount: amount,
      p_category: category,
    })
    if (error) throw new Error(error.message)
    refetchBudgets?.()
  }

  const chartData = budgets.map((b) => ({
    name: b.committees?.name || '—',
    الرصيد: Number(b.balance),
  }))

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-extrabold text-gray-800">اللجنة المالية</h2>
          <p className="text-gray-400 text-sm mt-1">أرصدة اللجان، الإيرادات والمصروفات</p>
        </div>
        {isFinanceUser && (
          <button
            onClick={() => setShowIncomeForm(true)}
            className="bg-emerald-600 text-white font-bold px-4 py-2.5 rounded-xl hover:bg-emerald-700 transition text-sm"
          >
            + تسجيل إيراد
          </button>
        )}
      </div>

      {!budgetsLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {budgets.map((b) => (
            <BudgetCard key={b.id} committeeKey={b.committees?.key} balance={b.balance} />
          ))}
        </div>
      )}

      {chartData.length > 0 && (
        <div className="card mb-8">
          <p className="font-bold text-gray-700 mb-4">مقارنة أرصدة اللجان</p>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" fontSize={12} />
              <YAxis fontSize={12} />
              <Tooltip />
              <Bar dataKey="الرصيد" fill="#10b981" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      <p className="font-bold text-gray-700 mb-3">آخر الحركات المالية</p>
      <TransactionsList transactions={transactions} loading={txLoading} />

      <Modal open={showIncomeForm} onClose={() => setShowIncomeForm(false)} title="تسجيل إيراد جديد">
        <IncomeForm budgets={budgets} onSubmit={handleAddIncome} onClose={() => setShowIncomeForm(false)} />
      </Modal>
    </div>
  )
}
