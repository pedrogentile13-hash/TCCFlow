-- ============================================================
-- TCCFlow — SECURITY FIXES (RLS + RPC)
-- ============================================================
-- Run this in Supabase Dashboard > SQL Editor.
-- Fixes:
--   1. Coupons writable/readable by ANY authenticated user  -> admins only
--   2. Users could self-grant PRO by writing subscriptions   -> blocked
--   3. Every subscription readable by everyone (PII leak)     -> own + team owner
--   4. ai_usage counter resettable by anyone                  -> project members
--   5. Atomic, cap-respecting coupon usage increment RPC
-- ============================================================

-- ------------------------------------------------------------
-- 0. Admin infrastructure
-- ------------------------------------------------------------
create table if not exists admin_emails (
    id uuid default gen_random_uuid() primary key,
    user_id uuid not null references auth.users(id),
    email text unique not null,
    role text default 'admin',
    active boolean default true,
    added_at timestamptz default now(),
    created_at timestamptz default now()
);
alter table admin_emails enable row level security;

-- Security-definer helper: is the current user an active admin?
create or replace function is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
    select exists (
        select 1 from admin_emails
        where user_id = auth.uid() and active = true
    );
$$;

-- Admins can read the admin list (needed by is_admin consumers/UI)
drop policy if exists "Admins can view other admins" on admin_emails;
create policy "Admins can view other admins" on admin_emails
    for select using (is_admin());

-- Seed the real admin accounts (matches ADMIN_EMAILS in js/supabase-init.js)
insert into admin_emails (user_id, email, role, active)
select id, email, 'super_admin', true
from auth.users
where email in ('tccflow.contato@gmail.com', 'pedrogentile13@gmail.com')
on conflict (email) do update set active = true, role = 'super_admin';

-- ------------------------------------------------------------
-- 1. COUPONS — admins only (writes AND reads)
--    Server functions use the SERVICE key and bypass RLS, so
--    validate-coupon / checkout keep working for normal users.
-- ------------------------------------------------------------
drop policy if exists "Anyone authenticated can read active coupons" on coupons;
drop policy if exists "Admin can insert coupons" on coupons;
drop policy if exists "Admin can update coupons" on coupons;
drop policy if exists "Admin can delete coupons" on coupons;

create policy "Admins can read coupons"   on coupons for select using (is_admin());
create policy "Admins can insert coupons" on coupons for insert with check (is_admin());
create policy "Admins can update coupons" on coupons for update using (is_admin());
create policy "Admins can delete coupons" on coupons for delete using (is_admin());

-- ------------------------------------------------------------
-- 2 & 3. SUBSCRIPTIONS — no self-granting PRO, no global read
--    Real activation happens via the webhook using the SERVICE
--    key (bypasses RLS). Users may only touch non-plan fields
--    (e.g. max_projects) and can never set plan='pro'/active.
-- ------------------------------------------------------------
drop policy if exists "Users can upsert own subscription"     on subscriptions;
drop policy if exists "Users can update own subscription"     on subscriptions;
drop policy if exists "Users can read subscription by project" on subscriptions;
-- keep "Users can read own subscription" (auth.uid() = id)

create policy "Users can insert own free subscription" on subscriptions
    for insert with check (
        auth.uid() = id and plan = 'free' and status <> 'active'
    );

create policy "Users can update own non-plan fields" on subscriptions
    for update using (auth.uid() = id)
    with check (auth.uid() = id and plan = 'free' and status <> 'active');

-- Team members may read the project OWNER's subscription (to know if the
-- project is PRO) — but not every subscription in the database.
create policy "Members read project owner subscription" on subscriptions
    for select using (
        id = (select owner_id from projects where id = get_my_project_id())
    );

-- Admins can read all subscriptions (admin panel)
drop policy if exists "Admins can read all subscriptions" on subscriptions;
create policy "Admins can read all subscriptions" on subscriptions
    for select using (is_admin());

-- ------------------------------------------------------------
-- 4. AI_USAGE — only members of the project can touch its counter
-- ------------------------------------------------------------
drop policy if exists "AI usage readable by all authenticated"  on ai_usage;
drop policy if exists "AI usage insertable by authenticated"    on ai_usage;
drop policy if exists "AI usage updatable by authenticated"     on ai_usage;

create policy "AI usage readable by project members" on ai_usage
    for select using (project_id = get_my_project_id() and get_my_project_id() is not null);
create policy "AI usage insertable by project members" on ai_usage
    for insert with check (project_id = get_my_project_id() and get_my_project_id() is not null);
create policy "AI usage updatable by project members" on ai_usage
    for update using (project_id = get_my_project_id() and get_my_project_id() is not null);

-- ------------------------------------------------------------
-- 5. Atomic, cap-respecting coupon usage increment
--    Only bumps the counter when the coupon still has uses left.
--    Called by the checkout functions via .rpc('increment_coupon_usage').
-- ------------------------------------------------------------
create or replace function increment_coupon_usage(coupon_code text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
    updated_rows integer;
begin
    update coupons
       set used_count = used_count + 1
     where code = upper(trim(coupon_code))
       and active = true
       and (expires_at is null or expires_at >= now())
       and (max_uses is null or used_count < max_uses);
    get diagnostics updated_rows = row_count;
    return updated_rows > 0;
end;
$$;
