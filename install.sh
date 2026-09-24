#!/usr/bin/env bash
# =====================================================================
# install.sh — يثبّت كل متطلبات المشروع دفعة واحدة
# الاستخدام:
#   chmod +x install.sh
#   ./install.sh
# =====================================================================
set -e

echo "🕌  إعداد مشروع نظام لجان المسجد..."
echo ""

# 1) التحقق من Node.js
if ! command -v node &> /dev/null; then
  echo "❌ Node.js غير مثبّت. حمّله من: https://nodejs.org (الإصدار 18 أو أحدث)"
  exit 1
fi
echo "✅ Node.js: $(node -v)"

# 2) تثبيت كل حزم npm (التبعيات + أدوات التطوير) دفعة واحدة
echo ""
echo "📦 تثبيت الحزم (React, Vite, Tailwind, Supabase, PWA, Lucide...)..."
npm install

# 3) إنشاء ملف البيئة المحلي إن لم يكن موجوداً
if [ ! -f .env.local ]; then
  cp .env.example .env.local
  echo ""
  echo "📝 تم إنشاء .env.local — افتحه واملأ VITE_SUPABASE_URL و VITE_SUPABASE_ANON_KEY"
fi

echo ""
echo "🎉 اكتمل التثبيت! الخطوات التالية:"
echo "  1) نفّذ سكريبتات supabase/ بالترتيب (01 ثم 02 ثم 03) داخل Supabase SQL Editor"
echo "  2) عدّل ملف .env.local ببيانات مشروعك في Supabase"
echo "  3) شغّل المشروع محلياً: npm run dev"
echo "  4) للنشر على GitHub Pages: npm run deploy"
