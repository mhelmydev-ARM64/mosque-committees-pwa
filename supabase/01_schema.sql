-- =====================================================================
-- 01_schema.sql
-- هيكل قاعدة البيانات الكامل لنظام لجان المسجد
-- شغّل هذا الملف أولاً في Supabase SQL Editor، ثم 02_rls_policies.sql،
-- ثم 03_functions.sql
-- =====================================================================

-- تفعيل الامتدادات المطلوبة
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------
-- جدول اللجان
-- ---------------------------------------------------------------------
create table if not exists committees (
  id uuid primary key default gen_random_uuid(),
  key text unique not null,              -- admin | finance | tech | media | quran
  name text not null,
  color_code text,                        -- مرجعي فقط، اللون الفعلي يُدار من committees.config.js بالواجهة
  icon_name text,
  created_at timestamptz not null default now()
);

insert into committees (key, name, color_code, icon_name) values
  ('admin',   'الإدارة العامة',          '#0f172a', 'ShieldCheck'),
  ('finance', 'اللجنة المالية',           '#10b981', 'Wallet'),
  ('tech',    'اللجنة التقنية',           '#6366f1', 'Cpu'),
  ('media',   'لجنة الإعلام والتنسيق',    '#0ea5e9', 'Megaphone'),
  ('quran',   'لجنة الحلقات والتربية',    '#14b8a6', 'BookOpenCheck')
on conflict (key) do nothing;

-- ---------------------------------------------------------------------
-- جدول المستخدمين (مرتبط بـ auth.users من Supabase Auth)
-- ---------------------------------------------------------------------
create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  auth_id uuid unique not null references auth.users(id) on delete cascade,
  name text not null,
  role text not null default 'finance_member',
     -- admin | finance_head | finance_member | tech_head | tech_member
     -- | media_head | media_member | quran_head | quran_member
  committee_id uuid references committees(id) on delete restrict,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists idx_users_committee on users(committee_id);
create index if not exists idx_users_auth_id on users(auth_id);

-- ---------------------------------------------------------------------
-- جدول ميزانيات اللجان (رصيد كل لجنة — يُستخدم عند اعتماد طلبات الصرف)
-- ---------------------------------------------------------------------
create table if not exists budgets (
  id uuid primary key default gen_random_uuid(),
  committee_id uuid not null references committees(id) on delete restrict,
  balance numeric(14,2) not null default 0 check (balance >= 0),
  updated_at timestamptz not null default now(),
  unique (committee_id)
);

-- ---------------------------------------------------------------------
-- جدول الطلبات (طلبات صرف / طلبات فنية / طلبات تنسيق ... إلخ)
-- ---------------------------------------------------------------------
create table if not exists requests (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  amount numeric(14,2) check (amount is null or amount > 0), -- يمنع القيم السالبة أو الصفرية
  priority text not null default 'normal' check (priority in ('low','normal','high','urgent')),
  status text not null default 'pending' check (status in ('pending','in_progress','approved','rejected')),
  created_by_committee uuid not null references committees(id) on delete restrict,
  target_committee uuid not null references committees(id) on delete restrict,
  created_by uuid references users(id) on delete set null,
  reviewed_by uuid references users(id) on delete set null,
  reviewed_at timestamptz,
  rejection_reason text,
  is_deleted boolean not null default false,   -- حذف لطيف بدلاً من CASCADE DELETE
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_requests_target on requests(target_committee) where is_deleted = false;
create index if not exists idx_requests_status on requests(status) where is_deleted = false;

-- ---------------------------------------------------------------------
-- جدول الحركات المالية (سجل ثابت لا يُحذف — Audit Trail)
-- ---------------------------------------------------------------------
create table if not exists transactions (
  id uuid primary key default gen_random_uuid(),
  request_id uuid references requests(id) on delete restrict, -- منع حذف الطلب إن وجدت حركة مرتبطة به
  committee_id uuid not null references committees(id) on delete restrict,
  amount numeric(14,2) not null check (amount > 0),   -- يمنع مبالغ سالبة أو صفرية
  type text not null check (type in ('IN','OUT')),
  category text,
  created_by uuid references users(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists idx_transactions_committee on transactions(committee_id);
create index if not exists idx_transactions_request on transactions(request_id);

-- ---------------------------------------------------------------------
-- جدول طلاب الحلقات (لجنة الحلقات والتربية)
-- ---------------------------------------------------------------------
create table if not exists quran_students (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  level text,
  teacher_name text,
  is_active boolean not null default true,
  is_deleted boolean not null default false,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- جدول الأنشطة (لجنة الإعلام والتنسيق)
-- ---------------------------------------------------------------------
create table if not exists activities (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  external_entity text,      -- جهة التنسيق الخارجية (أوقاف/مسجد آخر...)
  date date,
  status text not null default 'planned' check (status in ('planned','ongoing','done','cancelled')),
  is_deleted boolean not null default false,
  created_by uuid references users(id) on delete set null,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- Trigger عام لتحديث updated_at تلقائياً
-- ---------------------------------------------------------------------
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_requests_updated_at on requests;
create trigger trg_requests_updated_at
  before update on requests
  for each row execute function set_updated_at();
