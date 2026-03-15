-- ============================================================
-- FIX: Migrate ALL RLS policies from projects.members array
--       to users.project_id (source of truth)
-- ============================================================
-- Run this in Supabase Dashboard > SQL Editor
-- ============================================================

-- ==================== USERS ====================
drop policy if exists "Users can read team members" on users;
create policy "Users can read team members" on users for select using (
    project_id in (select project_id from users where id = auth.uid() and project_id is not null)
);

-- ==================== PROJECTS ====================
drop policy if exists "Project members can read" on projects;
create policy "Project members can read" on projects for select using (
    id in (select project_id from users where id = auth.uid())
);

-- ==================== TASKS ====================
drop policy if exists "Tasks readable by project members" on tasks;
create policy "Tasks readable by project members" on tasks for select using (
    project_id in (select project_id from users where id = auth.uid() and project_id is not null)
);

drop policy if exists "Tasks insertable by project members" on tasks;
create policy "Tasks insertable by project members" on tasks for insert with check (
    project_id in (select project_id from users where id = auth.uid() and project_id is not null)
);

drop policy if exists "Tasks updatable by project members" on tasks;
create policy "Tasks updatable by project members" on tasks for update using (
    project_id in (select project_id from users where id = auth.uid() and project_id is not null)
);

drop policy if exists "Tasks deletable by project members" on tasks;
create policy "Tasks deletable by project members" on tasks for delete using (
    project_id in (select project_id from users where id = auth.uid() and project_id is not null)
);

-- ==================== GOOGLE LINKS ====================
drop policy if exists "Google links readable by project members" on google_links;
create policy "Google links readable by project members" on google_links for select using (
    project_id in (select project_id from users where id = auth.uid() and project_id is not null)
);

drop policy if exists "Google links insertable by project members" on google_links;
create policy "Google links insertable by project members" on google_links for insert with check (
    project_id in (select project_id from users where id = auth.uid() and project_id is not null)
);

drop policy if exists "Google links deletable by project members" on google_links;
create policy "Google links deletable by project members" on google_links for delete using (
    project_id in (select project_id from users where id = auth.uid() and project_id is not null)
);

-- ==================== SAVED PAPERS ====================
drop policy if exists "Saved papers readable by project members" on saved_papers;
create policy "Saved papers readable by project members" on saved_papers for select using (
    project_id in (select project_id from users where id = auth.uid() and project_id is not null)
);

drop policy if exists "Saved papers insertable by project members" on saved_papers;
create policy "Saved papers insertable by project members" on saved_papers for insert with check (
    project_id in (select project_id from users where id = auth.uid() and project_id is not null)
);

drop policy if exists "Saved papers deletable by project members" on saved_papers;
create policy "Saved papers deletable by project members" on saved_papers for delete using (
    project_id in (select project_id from users where id = auth.uid() and project_id is not null)
);

-- ==================== CALENDAR GOALS ====================
drop policy if exists "Calendar goals readable by project members" on calendar_goals;
create policy "Calendar goals readable by project members" on calendar_goals for select using (
    project_id in (select project_id from users where id = auth.uid() and project_id is not null)
);

drop policy if exists "Calendar goals insertable by project members" on calendar_goals;
create policy "Calendar goals insertable by project members" on calendar_goals for insert with check (
    project_id in (select project_id from users where id = auth.uid() and project_id is not null)
);

drop policy if exists "Calendar goals updatable by project members" on calendar_goals;
create policy "Calendar goals updatable by project members" on calendar_goals for update using (
    project_id in (select project_id from users where id = auth.uid() and project_id is not null)
);

drop policy if exists "Calendar goals deletable by project members" on calendar_goals;
create policy "Calendar goals deletable by project members" on calendar_goals for delete using (
    project_id in (select project_id from users where id = auth.uid() and project_id is not null)
);

-- ==================== CALENDAR SESSIONS ====================
drop policy if exists "Calendar sessions readable by project members" on calendar_sessions;
create policy "Calendar sessions readable by project members" on calendar_sessions for select using (
    project_id in (select project_id from users where id = auth.uid() and project_id is not null)
);

drop policy if exists "Calendar sessions insertable by project members" on calendar_sessions;
create policy "Calendar sessions insertable by project members" on calendar_sessions for insert with check (
    project_id in (select project_id from users where id = auth.uid() and project_id is not null)
);

drop policy if exists "Calendar sessions updatable by project members" on calendar_sessions;
create policy "Calendar sessions updatable by project members" on calendar_sessions for update using (
    project_id in (select project_id from users where id = auth.uid() and project_id is not null)
);

drop policy if exists "Calendar sessions deletable by project members" on calendar_sessions;
create policy "Calendar sessions deletable by project members" on calendar_sessions for delete using (
    project_id in (select project_id from users where id = auth.uid() and project_id is not null)
);
