# 🕌 نظام لجان المسجد — PWA متكامل

تطبيق ويب تقدمي (PWA) لإدارة وميكنة عمليات لجان المسجد (المالية، التقنية،
الإعلام والتنسيق، الحلقات والتربية) والربط بينها عبر طلبات موحّدة، مبني
بـ **React + Vite + Tailwind CSS**، ومتصل بـ **Supabase (PostgreSQL)**،
ومُستضاف على **GitHub Pages**.

---

## 1. هيكلية المشروع (Project Structure)

```
mosque-committees-pwa/
│
├── .github/workflows/
│   └── deploy.yml              # نشر تلقائي إلى GitHub Pages عند كل push على main
│
├── public/
│   └── icons/
│       ├── icon.svg            # مصدر الأيقونة (متدرّج أخضر/زمردي + قبة مسجد)
│       ├── icon-192.png        # أيقونة PWA مقاس 192×192
│       └── icon-512.png        # أيقونة PWA مقاس 512×512 (تُستخدم أيضاً maskable)
│
├── src/
│   ├── config/
│   │   └── committees.config.js   # ⭐ ملف الربط الديناميكي: لون + أيقونة + تسمية كل لجنة
│   │                                 وكل حالة طلب. أضف لجنة جديدة هنا فقط.
│   │
│   ├── lib/
│   │   └── supabaseClient.js      # عميل Supabase الموحّد (يقرأ من .env.local)
│   │
│   ├── context/
│   │   └── AuthContext.jsx        # جلسة المستخدم + جلب دوره ولجنته من جدول users
│   │
│   ├── hooks/
│   │   ├── useRequests.js         # جلب الطلبات + Realtime + approve/reject الآمنة
│   │   ├── useBudget.js           # ميزانية لجنة واحدة + كل الميزانيات + تسجيل إيراد
│   │   ├── useTransactions.js     # آخر الحركات المالية (للجنة أو للكل)
│   │   ├── useStudents.js         # CRUD طلاب الحلقات
│   │   ├── useActivities.js       # CRUD أنشطة الإعلام والتنسيق
│   │   ├── useUsers.js            # إدارة المستخدمين (للأدمن)
│   │   └── useCommittees.js       # جلب كل اللجان مع معرفاتها الفعلية (uuid)
│   │
│   ├── components/
│   │   ├── shared/
│   │   │   ├── CommitteeBadge.jsx # شارة لجنة (لون+أيقونة تلقائياً من config)
│   │   │   ├── StatusBadge.jsx    # شارة حالة الطلب (معتمد/مرفوض/بانتظار...)
│   │   │   ├── Sidebar.jsx        # القائمة الجانبية (تُخفي الروابط غير المصرّح بها)
│   │   │   ├── Modal.jsx          # نافذة منبثقة موحّدة لكل النماذج
│   │   │   ├── EmptyState.jsx     # حالة "لا توجد بيانات" موحّدة
│   │   │   └── FormField.jsx      # حقل نموذج موحّد الشكل
│   │   ├── requests/
│   │   │   ├── RequestCard.jsx    # بطاقة عرض/اعتماد/رفض طلب واحد
│   │   │   └── RequestForm.jsx    # نموذج إنشاء طلب جديد لأي لجنة
│   │   ├── finance/
│   │   │   ├── BudgetCard.jsx     # بطاقة رصيد لجنة
│   │   │   ├── IncomeForm.jsx     # نموذج تسجيل إيراد
│   │   │   └── TransactionsList.jsx # سجل الحركات المالية
│   │   ├── quran/
│   │   │   ├── StudentForm.jsx    # نموذج إضافة/تعديل طالب
│   │   │   └── StudentsTable.jsx  # جدول الطلاب
│   │   ├── activities/
│   │   │   ├── ActivityForm.jsx   # نموذج إضافة نشاط
│   │   │   └── ActivitiesList.jsx # قائمة الأنشطة بحالتها
│   │   └── auth/                   # (جاهز لأي مكونات مصادقة إضافية)
│   │
│   ├── pages/
│   │   ├── Login.jsx               # صفحة تسجيل الدخول
│   │   ├── Dashboard.jsx           # الصفحة الرئيسية (نظرة عامة + بطاقات اللجان)
│   │   ├── RequestsPage.jsx        # الطلبات الموحّدة (فلترة + إنشاء + اعتماد/رفض)
│   │   ├── FinancePage.jsx         # اللجنة المالية (أرصدة + رسم بياني + حركات)
│   │   ├── TechPage.jsx            # اللجنة التقنية (طلبات فنية)
│   │   ├── MediaPage.jsx           # الإعلام والتنسيق (الأنشطة)
│   │   ├── QuranPage.jsx           # الحلقات والتربية (الطلاب)
│   │   └── UsersAdmin.jsx          # إدارة المستخدمين والصلاحيات (أدمن فقط)
│   │
│   ├── App.jsx                     # التوجيه (Routing) + حماية المسارات بالدور (RoleGate)
│   ├── main.jsx                    # نقطة الدخول + تسجيل PWA + Router
│   └── index.css                   # Tailwind + الأنماط العامة
│
├── supabase/
│   ├── 01_schema.sql               # ⭐ إنشاء كل الجداول والقيود (CHECK, RESTRICT...)
│   ├── 02_rls_policies.sql         # ⭐ سياسات عزل الصلاحيات بين اللجان (RLS)
│   └── 03_functions.sql            # ⭐ الدوال الآمنة (اعتماد/رفض الطلبات، منع Race Conditions)
│
├── index.html
├── package.json                    # كل التبعيات (React, Supabase, Tailwind, PWA...)
├── vite.config.js                  # إعداد Vite + vite-plugin-pwa (Manifest + Caching)
├── tailwind.config.js              # ⭐ نظام ألوان اللجان (finance/tech/media/quran)
├── postcss.config.js
├── .env.example                    # نموذج متغيرات بيئة Supabase
├── .gitignore
└── install.sh                      # ⭐ تثبيت كل المتطلبات بأمر واحد
```

---

## 2. كيف يعمل نظام الألوان والأيقونات الديناميكي؟

كل شيء يخص "هوية" لجنة معينة (اللون، الأيقونة، الاسم المعروض) موجود في
مكان واحد فقط: **`src/config/committees.config.js`**.

أي كومبوننت في الواجهة (مثل `CommitteeBadge` أو `Sidebar` أو `Dashboard`)
لا يكتب الألوان أو الأيقونات بشكل ثابت (Hardcoded)، بل يستدعي:

```js
import { getCommittee } from '../config/committees.config'
const committee = getCommittee('finance') // أو 'tech' / 'media' / 'quran'
const Icon = committee.icon               // أيقونة Lucide جاهزة
committee.colors.bgSoft                   // كلاس Tailwind جاهز للخلفية
```

**لإضافة لجنة جديدة مستقبلاً** (مثلاً "لجنة الصيانة"):
1. أضف صفاً جديداً في `committees` بقاعدة البيانات (عبر SQL أو لوحة Supabase).
2. أضف عنصراً جديداً في `COMMITTEES` داخل `committees.config.js` بنفس الـ `key`.
3. انتهى — كل الشارات، القوائم، والألوان في التطبيق تتحدّث تلقائياً
   دون لمس أي كومبوننت آخر (هذا هو مبدأ الـ Modular Architecture المطلوب).

---

## 3. حماية قاعدة البيانات — كيف طُبّقت كل نقطة طلبتها؟

| المتطلب | كيف تم تطبيقه | أين |
|---|---|---|
| عمليات مالية Atomic (ACID) | دالة `approve_request()` تنفّذ (قفل الطلب → التحقق → خصم الميزانية → تسجيل الحركة → تغيير الحالة) كوحدة واحدة داخل PL/pgSQL. لو فشلت أي خطوة تتراجع كل الخطوات تلقائياً | `03_functions.sql` |
| منع مبالغ سالبة/صفرية | `CHECK (amount > 0)` على أعمدة `requests.amount` و `transactions.amount`، و `CHECK (balance >= 0)` على `budgets.balance` | `01_schema.sql` |
| منع الحذف الشلالي القاتل | لا يوجد أي `ON DELETE CASCADE` على الجداول المالية؛ استُخدم `ON DELETE RESTRICT` (لن تُحذف لجنة أو مستخدم له طلبات/حركات مرتبطة)، بالإضافة لعمود `is_deleted` للحذف اللطيف على `requests` | `01_schema.sql` |
| عزل الصلاحيات (RLS) | كل جدول مفعّل عليه RLS، مع سياسات تمنع أي لجنة من رؤية أو تعديل بيانات لجنة أخرى، وتقصر الاعتماد المالي على `finance_head/finance_member/admin` فقط | `02_rls_policies.sql` |
| منع Race Conditions | `SELECT ... FOR UPDATE` على صف الطلب وصف الميزانية داخل `approve_request()` — أي محاولة اعتماد متزامنة ثانية تنتظر حتى تنتهي الأولى، ثم تكتشف أن الحالة تغيّرت وتُرفض فوراً | `03_functions.sql` |
| منع تعديل الحالة مباشرة | Trigger يمنع أي `UPDATE` على `requests.status` إلا عبر `approve_request`/`reject_request`، حتى لو حاول أحدهم التعديل مباشرة من لوحة Supabase أو API | `02_rls_policies.sql` |
| منع تصعيد الصلاحيات | Trigger يمنع أي مستخدم (غير أدمن) من تعديل `role` أو `committee_id` الخاص به بنفسه | `02_rls_policies.sql` |

### ترتيب تشغيل سكريبتات SQL (مهم جداً)
```
1) 01_schema.sql        → إنشاء الجداول
2) 02_rls_policies.sql  → تفعيل الحماية والسياسات
3) 03_functions.sql     → الدوال الآمنة (تعتمد على السياسات أعلاه)
```
نفّذها بهذا الترتيب داخل **Supabase Dashboard → SQL Editor**.

---

## 4. خطوات التشغيل من الصفر

### أ) تجهيز Supabase
1. أنشئ مشروعاً جديداً على [supabase.com](https://supabase.com).
2. اذهب إلى **SQL Editor** ونفّذ الملفات الثلاثة بالترتيب أعلاه.
3. من **Authentication → Users** أنشئ أول مستخدم (سيكون الأدمن)، ثم من
   **Table Editor → users** أضف صفاً يربط `auth_id` الخاص به بدور `admin`.
4. من **Table Editor → budgets** أضف رصيداً ابتدائياً لكل لجنة.
5. من **Project Settings → API** انسخ `Project URL` و `anon public key`.

### ب) تجهيز المشروع محلياً
```bash
./install.sh
# أو يدوياً:
npm install
cp .env.example .env.local   # ثم املأ القيمتين من الخطوة (أ.5)
npm run dev
```

### ج) النشر على GitHub Pages
1. أنشئ مستودعاً جديداً وارفع المشروع إليه.
2. عدّل `base` في `vite.config.js` ليطابق اسم مستودعك: `'/اسم-المستودع/'`.
3. من **Settings → Pages** اختر المصدر: **GitHub Actions**.
4. من **Settings → Secrets → Actions** أضف `VITE_SUPABASE_URL` و
   `VITE_SUPABASE_ANON_KEY` (نفس قيم `.env.local`).
5. كل `push` على `main` سينشر الموقع تلقائياً عبر
   `.github/workflows/deploy.yml`. أو يدوياً: `npm run deploy`.

---

## 5. ما الذي بُني فعلياً في هذه النسخة وما التالي؟

**جاهز وقابل للتشغيل مباشرة (بعد تنفيذ سكريبتات SQL وملء .env.local):**
- تسجيل الدخول (Supabase Auth) وحماية المسارات حسب الدور (RoleGate)، مع
  إخفاء روابط اللجان في القائمة الجانبية عن غير أعضائها تلقائياً.
- لوحة تحكم رئيسية تعرض بطاقات اللجان بألوانها.
- نظام الألوان/الأيقونات الديناميكي الكامل.
- **صفحة الطلبات الموحّدة** (`/requests`): إنشاء طلب موجّه لأي لجنة، فلترة
  حسب الحالة، واعتماد/رفض آمن عبر `approve_request` / `reject_request`.
- **صفحة اللجنة المالية** (`/finance`): بطاقات أرصدة كل اللجان، رسم بياني
  مقارن (Recharts)، تسجيل إيرادات جديدة، وسجل آخر الحركات المالية —
  كل ذلك Realtime عبر اشتراكات Supabase.
- **صفحة اللجنة التقنية** (`/tech`): عرض الطلبات الفنية الموجّهة إليها
  وإنشاء طلبات جديدة.
- **صفحة الإعلام والتنسيق** (`/media`): جدول الأنشطة، إضافة نشاط جديد،
  وتغيير حالته (مخطّط/جارٍ/منتهٍ/ملغى) مباشرة.
- **صفحة الحلقات والتربية** (`/quran`): جدول الطلاب، إضافة طالب جديد،
  وعدّاد الطلاب النشطين.
- **صفحة إدارة المستخدمين** (`/admin/users`, للأدمن فقط): تغيير لجنة
  ودور أي مستخدم، وتفعيل/إيقاف الحساب.
- قاعدة البيانات كاملة بكل الحمايات المطلوبة (ACID، RLS، منع Race
  Conditions، منع تصعيد الصلاحيات)، جاهزة للتنفيذ فوراً.
- PWA كاملة (Manifest، أيقونات، عمل Offline، تثبيت على الجهاز)، ونشر
  تلقائي على GitHub Pages عبر `.github/workflows/deploy.yml`.

**تحسينات مقترحة للتوسّع لاحقاً (البنية الحالية تدعمها دون إعادة هيكلة):**
- تقارير مالية أكثر تفصيلاً (تصدير PDF/Excel لسجل الحركات).
- إشعارات فورية (Push Notifications) عند وصول طلب جديد أو اعتماده.
- صفحة ملف شخصي لتغيير كلمة المرور والصورة الرمزية.
- سجل تدقيق (Audit Log) كامل لكل تعديل إداري.

---

## 6. ملاحظة حول صورة الأخطاء المرفقة

الصورة التي أرفقتها تُظهر أخطاء ترجمة (Compile Errors) لمشروع **++C**
يستخدم مكتبة **SFML** (أخطاء من نوع `sf::VideoMode`, `sf::RenderWindow`,
`sf::Event`...)، وهي غير متعلقة بهذا المشروع (الذي هو تطبيق ويب
بـ React/Supabase). إن كانت هذه الصورة تخص مشروعاً آخر تريد المساعدة
فيه، أخبرني وسأنظر فيها بشكل منفصل.
