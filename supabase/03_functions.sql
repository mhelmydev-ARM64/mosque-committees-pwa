-- =====================================================================
-- 03_functions.sql
-- الدوال المخزّنة (Stored Procedures) — القلب الأمني للنظام المالي
-- كل دالة تعمل كعملية Atomic واحدة: إما أن تنجح كل خطواتها معاً، أو
-- تفشل كلها معاً (SECURITY DEFINER + transaction ضمنية داخل PL/pgSQL)
-- شغّل هذا الملف بعد 01_schema.sql و 02_rls_policies.sql
-- =====================================================================

-- ---------------------------------------------------------------------
-- دالة: اعتماد طلب صرف
-- تقوم بأربع خطوات كوحدة واحدة غير قابلة للتجزئة:
--   1) قفل صف الطلب (FOR UPDATE) لمنع اعتماده مرتين في نفس اللحظة
--   2) التأكد أن الطلب ما زال pending (لو شخص آخر اعتمده للتو نتوقف فوراً)
--   3) قفل صف ميزانية اللجنة والتأكد من كفاية الرصيد
--   4) خصم المبلغ + تسجيل الحركة المالية + تغيير حالة الطلب معاً
-- ---------------------------------------------------------------------
create or replace function approve_request(p_request_id uuid)
returns requests
language plpgsql
security definer   -- تعمل بصلاحيات الدالة نفسها، لكن يُتحقق من دور المستخدم يدوياً بالأسفل
set search_path = public
as $$
declare
  v_request requests;
  v_budget budgets;
  v_current_user users;
begin
  -- من هو المستخدم الحالي؟
  select * into v_current_user from users where auth_id = auth.uid();

  if v_current_user is null then
    raise exception 'المستخدم غير مسجل دخول أو غير موجود في جدول users';
  end if;

  -- فقط اللجنة المالية أو الأدمن يمكنهم الاعتماد المالي
  if v_current_user.role not in ('finance_head','finance_member','admin') then
    raise exception 'ليست لديك صلاحية اعتماد الطلبات المالية';
  end if;

  -- (1) قفل صف الطلب لمنع Race Condition — أي محاولة اعتماد متزامنة أخرى
  -- ستنتظر هنا حتى تنتهي هذه العملية بالكامل
  select * into v_request from requests where id = p_request_id for update;

  if v_request is null then
    raise exception 'الطلب غير موجود';
  end if;

  -- (2) التأكد أن الحالة ما زالت pending
  if v_request.status <> 'pending' then
    raise exception 'تم التعامل مع هذا الطلب مسبقاً (الحالة الحالية: %)', v_request.status;
  end if;

  -- إن كان الطلب لا يحمل مبلغاً مالياً (طلب فني/إداري فقط) نكتفي بتغيير الحالة
  if v_request.amount is null then
    update requests
      set status = 'approved', reviewed_by = v_current_user.id, reviewed_at = now()
      where id = p_request_id
      returning * into v_request;
    return v_request;
  end if;

  -- (3) قفل صف ميزانية اللجنة المستهدفة والتحقق من كفاية الرصيد
  select * into v_budget from budgets where committee_id = v_request.target_committee for update;

  if v_budget is null then
    raise exception 'لا توجد ميزانية مسجّلة لهذه اللجنة';
  end if;

  if v_budget.balance < v_request.amount then
    raise exception 'الرصيد غير كافٍ لاعتماد هذا الطلب (الرصيد الحالي: %, المطلوب: %)',
      v_budget.balance, v_request.amount;
  end if;

  -- (4) خصم المبلغ + تسجيل الحركة + تحديث حالة الطلب — كلها معاً أو لا شيء
  update budgets
    set balance = balance - v_request.amount, updated_at = now()
    where committee_id = v_request.target_committee;

  insert into transactions (request_id, committee_id, amount, type, category, created_by)
  values (v_request.id, v_request.target_committee, v_request.amount, 'OUT', 'request_approval', v_current_user.id);

  update requests
    set status = 'approved', reviewed_by = v_current_user.id, reviewed_at = now()
    where id = p_request_id
    returning * into v_request;

  return v_request;
end;
$$;

-- ---------------------------------------------------------------------
-- دالة: رفض طلب
-- ---------------------------------------------------------------------
create or replace function reject_request(p_request_id uuid, p_reason text default null)
returns requests
language plpgsql
security definer
set search_path = public
as $$
declare
  v_request requests;
  v_current_user users;
begin
  select * into v_current_user from users where auth_id = auth.uid();
  if v_current_user is null then
    raise exception 'المستخدم غير مسجل دخول';
  end if;

  select * into v_request from requests where id = p_request_id for update;
  if v_request is null then
    raise exception 'الطلب غير موجود';
  end if;

  if v_request.status <> 'pending' then
    raise exception 'تم التعامل مع هذا الطلب مسبقاً';
  end if;

  update requests
    set status = 'rejected', reviewed_by = v_current_user.id, reviewed_at = now(), rejection_reason = p_reason
    where id = p_request_id
    returning * into v_request;

  return v_request;
end;
$$;

-- ---------------------------------------------------------------------
-- دالة: إضافة إيراد لميزانية لجنة (IN) — بشكل Atomic أيضاً
-- ---------------------------------------------------------------------
create or replace function add_income(p_committee_id uuid, p_amount numeric, p_category text default null)
returns budgets
language plpgsql
security definer
set search_path = public
as $$
declare
  v_current_user users;
  v_budget budgets;
begin
  select * into v_current_user from users where auth_id = auth.uid();

  if v_current_user is null or v_current_user.role not in ('finance_head','finance_member','admin') then
    raise exception 'ليست لديك صلاحية تسجيل إيرادات';
  end if;

  if p_amount <= 0 then
    raise exception 'يجب أن يكون المبلغ أكبر من صفر';
  end if;

  select * into v_budget from budgets where committee_id = p_committee_id for update;
  if v_budget is null then
    insert into budgets (committee_id, balance) values (p_committee_id, 0)
    returning * into v_budget;
  end if;

  update budgets set balance = balance + p_amount, updated_at = now()
    where committee_id = p_committee_id
    returning * into v_budget;

  insert into transactions (committee_id, amount, type, category, created_by)
  values (p_committee_id, p_amount, 'IN', p_category, v_current_user.id);

  return v_budget;
end;
$$;

-- ---------------------------------------------------------------------
-- دالة مساعدة: حذف لطيف موحّد (بدلاً من DELETE مباشر من الواجهة)
-- ---------------------------------------------------------------------
create or replace function soft_delete_request(p_request_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_current_user users;
begin
  select * into v_current_user from users where auth_id = auth.uid();
  if v_current_user is null then
    raise exception 'المستخدم غير مسجل دخول';
  end if;

  update requests set is_deleted = true
    where id = p_request_id
      and (created_by = v_current_user.id or v_current_user.role = 'admin');
end;
$$;
