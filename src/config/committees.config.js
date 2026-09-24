// =====================================================================
// هذا الملف هو "المصدر الواحد للحقيقة" (Single Source of Truth) لكل ما
// يخص اللجان: الاسم، اللون، الأيقونة، والصلاحيات.
// لإضافة لجنة جديدة مستقبلاً: أضف عنصراً جديداً هنا فقط، ولن تحتاج لتعديل
// أي كومبوننت آخر في المشروع — كل الواجهات تقرأ من هذا الملف ديناميكياً.
// =====================================================================

import {
  Wallet,
  Cpu,
  Megaphone,
  BookOpenCheck,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
} from 'lucide-react'

// مفاتيح اللجان يجب أن تطابق قيمة العمود committees.key في قاعدة البيانات
export const COMMITTEES = {
  admin: {
    key: 'admin',
    label: 'الإدارة العامة',
    icon: ShieldCheck,
    colors: {
      primary: '#0f172a',
      secondary: '#64748b',
      bg: 'bg-slate-900',
      bgSoft: 'bg-slate-100',
      text: 'text-slate-900',
      border: 'border-slate-300',
      gradient: 'from-slate-800 to-slate-600',
    },
  },
  finance: {
    key: 'finance',
    label: 'اللجنة المالية',
    icon: Wallet,
    colors: {
      primary: '#10b981', // Emerald
      secondary: '#f59e0b', // Amber
      bg: 'bg-emerald-600',
      bgSoft: 'bg-emerald-50',
      text: 'text-emerald-700',
      border: 'border-emerald-300',
      gradient: 'from-emerald-600 to-amber-500',
    },
  },
  tech: {
    key: 'tech',
    label: 'اللجنة التقنية',
    icon: Cpu,
    colors: {
      primary: '#6366f1', // Indigo
      secondary: '#8b5cf6', // Violet
      bg: 'bg-indigo-600',
      bgSoft: 'bg-indigo-50',
      text: 'text-indigo-700',
      border: 'border-indigo-300',
      gradient: 'from-indigo-600 to-violet-500',
    },
  },
  media: {
    key: 'media',
    label: 'لجنة الإعلام والتنسيق',
    icon: Megaphone,
    colors: {
      primary: '#0ea5e9', // Sky
      secondary: '#f97316', // Orange
      bg: 'bg-sky-600',
      bgSoft: 'bg-sky-50',
      text: 'text-sky-700',
      border: 'border-sky-300',
      gradient: 'from-sky-600 to-orange-500',
    },
  },
  quran: {
    key: 'quran',
    label: 'لجنة الحلقات والتربية',
    icon: BookOpenCheck,
    colors: {
      primary: '#14b8a6', // Teal
      secondary: '#166534', // Forest Green
      bg: 'bg-teal-600',
      bgSoft: 'bg-teal-50',
      text: 'text-teal-700',
      border: 'border-teal-300',
      gradient: 'from-teal-600 to-green-800',
    },
  },
}

export const getCommittee = (key) => COMMITTEES[key] || COMMITTEES.admin

// حالات الطلبات — لون وأيقونة موحّدة تُستخدم في كل مكان بالتطبيق
export const REQUEST_STATUSES = {
  pending: {
    key: 'pending',
    label: 'بانتظار الموافقة',
    icon: Clock,
    color: '#eab308',
    bg: 'bg-yellow-50',
    text: 'text-yellow-700',
    border: 'border-yellow-300',
  },
  in_progress: {
    key: 'in_progress',
    label: 'قيد التنفيذ',
    icon: Loader2,
    color: '#3b82f6',
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    border: 'border-blue-300',
  },
  approved: {
    key: 'approved',
    label: 'معتمد',
    icon: CheckCircle2,
    color: '#22c55e',
    bg: 'bg-green-50',
    text: 'text-green-700',
    border: 'border-green-300',
  },
  rejected: {
    key: 'rejected',
    label: 'مرفوض',
    icon: XCircle,
    color: '#ef4444',
    bg: 'bg-red-50',
    text: 'text-red-700',
    border: 'border-red-300',
  },
}

export const getStatus = (key) => REQUEST_STATUSES[key] || REQUEST_STATUSES.pending

// أدوار المستخدمين وربطها باللجان (تُستخدم في التحقق من الصلاحيات بالواجهة
// — التحقق الحقيقي والملزم أمنياً يتم في قاعدة البيانات عبر RLS، هذا فقط
// للتحكم في إظهار/إخفاء عناصر الواجهة)
export const ROLES = {
  admin: { label: 'أدمن / مجلس الإدارة', level: 100 },
  finance_head: { label: 'رئيس اللجنة المالية', level: 80 },
  finance_member: { label: 'عضو اللجنة المالية', level: 50 },
  tech_head: { label: 'رئيس اللجنة التقنية', level: 80 },
  tech_member: { label: 'عضو اللجنة التقنية', level: 50 },
  media_head: { label: 'رئيس لجنة الإعلام', level: 80 },
  media_member: { label: 'عضو لجنة الإعلام', level: 50 },
  quran_head: { label: 'رئيس لجنة الحلقات', level: 80 },
  quran_member: { label: 'عضو لجنة الحلقات', level: 50 },
}
