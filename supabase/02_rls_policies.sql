-- =====================================================================
-- 02_rls_policies.sql
-- سياسات Row Level Security — تمنع أي لجنة من التلاعب ببيانات لجنة أخرى
-- شغّل هذا الملف بعد 01_schema.sql وقبل 03_functions.sql
-- =====================================================================

-- ---------------------------------------------------------------------
-- دالة مساعدة: تُرجع صف المستخدم الحالي (auth.uid() -> users)
-- تُستخدم داخل كل السياسات لتفادي تكرار الاستعلام الفرعي
-- ---------------------------------------------------------------------
create or replace function current_app_user()
returns users
language sql
security definer
stable
set search_path = public
as $$
  select * from users where auth_id = auth.uid() limit 1;
$$;

create or replace function is_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select coalesce((select role = 'admin' from users where auth_id = auth.uid()), false);
$$;

create or replace function my_committee_id()
returns uuid
language sql
security definer
stable
set search_path = public
as $$
  select committee_id from users where auth_id = auth.uid();
$$;

-- ---------------------------------------------------------------------
-- تفعيل RLS على كل الجداول
-- ---------------------------------------------------------------------
alter table committees      enable row level security;
alter table users           enable row level security;
alter table budgets         enable row level security;
alter table requests        enable row level security;
alter table transactions    enable row level security;
alter table quran_students  enable row level security;
alter table activities      enable row level security;

-- ---------------------------------------------------------------------
-- committees: يمكن للجميع القراءة (مرجع عام)، لا أحد يعدّل إلا الأدمن
-- ---------------------------------------------------------------------
create policy "committees_select_all" on committees
  for select using (true);

create policy "committees_admin_write" on committees
  for all using (is_admin()) with check (is_admin());

-- ---------------------------------------------------------------------
-- users: كل مستخدم يرى ملفه الشخصي + أعضاء لجنته، الأدمن يرى الجميع
-- لا أحد يستطيع تعديل role الخاص به بنفسه (فقط الأدمن)
-- ---------------------------------------------------------------------
create policy "users_select" on users
  for select using (
    is_admin() or auth_id = auth.uid() or committee_id = my_committee_id()
  );

create policy "users_update_own_basic_info" on users
  for update using (auth_id = auth.uid() or is_admin())
  with check (
    is_admin() -- الأدمن يعدّل أي شيء
    or (auth_id = auth.uid())  -- المستخدم نفسه، لكن role و committee_id يُضبطان عبر trigger أدناه
  );

create policy "users_admin_insert" on users
  for insert with check (is_admin());

-- منع أي مستخدم عادي (غير أدمن) من تغيير role أو committee_id الخاص به
create or replace function prevent_self_role_escalation()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if not is_admin() then
    if new.role <> old.role or new.committee_id is distinct from old.committee_id then
      raise exception 'لا يمكنك تعديل صلاحياتك أو لجنتك بنفسك';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_prevent_role_escalation on users;
create trigger trg_prevent_role_escalation
  before update on users
  for each row execute function prevent_self_role_escalation();

-- ---------------------------------------------------------------------
-- budgets: فقط اللجنة المالية والأدمن يقرأون/يعدّلون (عبر الدوال فقط عملياً)
-- ---------------------------------------------------------------------
create policy "budgets_select" on budgets
  for select using (
    is_admin()
    or (select role from users where auth_id = auth.uid()) like 'finance%'
    or committee_id = my_committee_id()  -- كل لجنة ترى رصيدها الخاص فقط
  );

-- لا سياسة INSERT/UPDATE/DELETE مباشرة على budgets للمستخدمين العاديين؛
-- التعديل يتم حصراً عبر الدوال (approve_request / add_income) التي تعمل
-- بصلاحية SECURITY DEFINER، فتتجاوز RLS بأمان تحت شروط محكومة بالكود.

-- ---------------------------------------------------------------------
-- requests: كل لجنة ترى الطلبات الموجهة إليها أو التي أنشأتها، الأدمن يرى الكل
-- الإنشاء مسموح للجميع (لطلب شيء من لجنة أخرى)، لكن التعديل على status
-- ممنوع مباشرة ويتم فقط عبر approve_request / reject_request
-- ---------------------------------------------------------------------
create policy "requests_select" on requests
  for select using (
    is_admin()
    or created_by_committee = my_committee_id()
    or target_committee = my_committee_id()
  );

create policy "requests_insert" on requests
  for insert with check (
    created_by_committee = my_committee_id() or is_admin()
  );

-- تعديل الحقول الوصفية فقط (العنوان/الوصف) من قبل صاحب الطلب قبل مراجعته،
-- أما status فمحمي بالكامل ولا يُغيَّر إلا عبر الدوال الآمنة أعلاه
create policy "requests_update_own_pending" on requests
  for update using (
    (created_by_committee = my_committee_id() and status = 'pending') or is_admin()
  )
  with check (
    is_admin() or (created_by_committee = my_committee_id())
  );

create or replace function prevent_direct_status_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if not is_admin() and new.status <> old.status then
    raise exception 'لا يمكن تغيير حالة الطلب مباشرة، استخدم دالة approve_request أو reject_request';
  end if;
  return new;
end;
$$;

drop trigger if exists trg_prevent_status_change on requests;
create trigger trg_prevent_status_change
  before update on requests
  for each row execute function prevent_direct_status_change();

-- منع الحذف الفعلي نهائياً من الواجهة — فقط UPDATE is_deleted عبر soft_delete_request
create policy "requests_no_direct_delete" on requests
  for delete using (false);

-- ---------------------------------------------------------------------
-- transactions: سجل للقراءة فقط من الواجهة، الكتابة حصراً عبر الدوال
-- ---------------------------------------------------------------------
create policy "transactions_select" on transactions
  for select using (
    is_admin()
    or committee_id = my_committee_id()
    or (select role from users where auth_id = auth.uid()) like 'finance%'
  );

-- لا سياسات insert/update/delete للمستخدمين — فقط عبر الدوال SECURITY DEFINER
create policy "transactions_no_direct_delete" on transactions
  for delete using (false);

-- ---------------------------------------------------------------------
-- quran_students: لجنة الحلقات فقط تديرها، الأدمن يرى الكل
-- ---------------------------------------------------------------------
create policy "quran_students_select" on quran_students
  for select using (
    is_admin() or (select role from users where auth_id = auth.uid()) like 'quran%'
  );

create policy "quran_students_write" on quran_students
  for all using (
    is_admin() or (select role from users where auth_id = auth.uid()) like 'quran%'
  )
  with check (
    is_admin() or (select role from users where auth_id = auth.uid()) like 'quran%'
  );

-- ---------------------------------------------------------------------
-- activities: لجنة الإعلام فقط تديرها، الأدمن يرى الكل، باقي اللجان تقرأ فقط
-- ---------------------------------------------------------------------
create policy "activities_select_all" on activities
  for select using (true);

create policy "activities_write" on activities
  for all using (
    is_admin() or (select role from users where auth_id = auth.uid()) like 'media%'
  )
  with check (
    is_admin() or (select role from users where auth_id = auth.uid()) like 'media%'
  );
