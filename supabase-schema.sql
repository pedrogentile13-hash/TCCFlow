-- ============================================================
-- TCCFlow - Supabase Database Schema
-- ============================================================
-- Execute this SQL in Supabase Dashboard > SQL Editor
-- ============================================================

-- 1. Users table (profile data linked to auth.users)
create table if not exists users (
    id uuid primary key references auth.users(id) on delete cascade,
    name text not null default '',
    email text not null default '',
    project_id uuid,
    role text not null default 'student' check (role in ('student', 'orientador')),
    created_at timestamptz default now()
);

-- 2. Projects table
create table if not exists projects (
    id uuid primary key default gen_random_uuid(),
    name text not null default 'Meu TCC',
    code text unique not null,
    owner_id uuid references auth.users(id),
    members uuid[] default '{}',
    project_info jsonb default '{}',
    google_drive_folder_id text,
    google_drive_folder_url text,
    created_at timestamptz default now()
);

-- Add max_projects to subscriptions (allows admin to customize per user)
-- Default: free=1, pro=2, but can be overridden
alter table subscriptions add column if not exists max_projects integer default null;

-- 3. Tasks table
create table if not exists tasks (
    id uuid primary key default gen_random_uuid(),
    project_id uuid references projects(id) on delete cascade,
    title text not null default '',
    assigned_to uuid,
    due_date date,
    status text not null default 'todo' check (status in ('todo', 'progress', 'done')),
    created_at timestamptz default now()
);

-- 3b. Add assigned_to_list for multi-assignee tasks (single task, multiple members)
alter table tasks add column if not exists assigned_to_list uuid[] default null;

-- 4. Google Links table
create table if not exists google_links (
    id uuid primary key default gen_random_uuid(),
    project_id uuid references projects(id) on delete cascade,
    name text not null default '',
    url text not null default '',
    type text not null default 'drive',
    created_by uuid references auth.users(id),
    created_at timestamptz default now()
);

-- 5. Saved Papers (AI Research)
create table if not exists saved_papers (
    id uuid primary key default gen_random_uuid(),
    project_id uuid references projects(id) on delete cascade,
    title text not null default '',
    authors text default '',
    year text default '',
    abstract text default '',
    url text default '',
    citations integer default 0,
    source text default '',
    doi text default '',
    saved_by uuid references auth.users(id),
    saved_at timestamptz default now()
);

-- 6. Calendar Goals
create table if not exists calendar_goals (
    id uuid primary key default gen_random_uuid(),
    project_id uuid references projects(id) on delete cascade,
    title text not null default '',
    deadline date,
    completed boolean default false,
    created_by uuid references auth.users(id),
    created_at timestamptz default now()
);

-- 7. Calendar Sessions
create table if not exists calendar_sessions (
    id uuid primary key default gen_random_uuid(),
    project_id uuid references projects(id) on delete cascade,
    subject text default '',
    topic text default '',
    date date,
    time text default '',
    completed boolean default false,
    created_by uuid references auth.users(id),
    created_at timestamptz default now()
);

-- 8. Subscriptions
create table if not exists subscriptions (
    id uuid primary key references auth.users(id) on delete cascade,
    status text not null default 'inactive',
    plan text not null default 'free',
    seats integer default 1,
    payment_id text,
    payment_method text,
    user_id uuid references auth.users(id),
    user_email text default '',
    user_name text default '',
    activated_at timestamptz
);

-- 9. Orientador-Projects (advisor can supervise multiple projects)
create table if not exists orientador_projects (
    id uuid primary key default gen_random_uuid(),
    orientador_id uuid references auth.users(id) on delete cascade,
    project_id uuid references projects(id) on delete cascade,
    invite_code text unique not null,
    status text not null default 'pending' check (status in ('pending', 'accepted')),
    created_at timestamptz default now(),
    unique(orientador_id, project_id)
);

-- 10. Orientador Comments (feedback on project)
create table if not exists orientador_comments (
    id uuid primary key default gen_random_uuid(),
    project_id uuid references projects(id) on delete cascade,
    orientador_id uuid references auth.users(id) on delete cascade,
    comment text not null default '',
    section text default 'geral',
    created_at timestamptz default now()
);

-- 11. AI Usage (Rate Limiting)
create table if not exists ai_usage (
    id text primary key,  -- format: {projectId}_{YYYY-MM}
    project_id uuid references projects(id) on delete cascade,
    month text not null,
    count integer default 0
);

-- 12. Diary entries (diario)
create table if not exists diary_entries (
    id uuid primary key default gen_random_uuid(),
    project_id uuid references projects(id) on delete cascade,
    content text not null default '',
    mood text default 'neutral',
    created_by uuid references auth.users(id),
    created_at timestamptz default now()
);

-- 13. Notes (anotacoes)
create table if not exists notes (
    id uuid primary key default gen_random_uuid(),
    project_id uuid references projects(id) on delete cascade,
    title text not null default '',
    content text not null default '',
    color text default 'yellow',
    created_by uuid references auth.users(id),
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- 14. Ideas (ideias)
create table if not exists ideas (
    id uuid primary key default gen_random_uuid(),
    project_id uuid references projects(id) on delete cascade,
    title text not null default '',
    description text default '',
    category text default 'geral',
    votes integer default 0,
    created_by uuid references auth.users(id),
    created_at timestamptz default now()
);

-- 15. References (referencias)
create table if not exists user_references (
    id uuid primary key default gen_random_uuid(),
    project_id uuid references projects(id) on delete cascade,
    type text default 'article',
    title text not null default '',
    authors text default '',
    year text default '',
    source text default '',
    url text default '',
    formatted text default '',
    created_by uuid references auth.users(id),
    created_at timestamptz default now()
);

-- ============================================================
-- Helper function to get current user's project_id (avoids RLS recursion)
-- ============================================================
create or replace function get_my_project_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
    select project_id from users where id = auth.uid();
$$;

-- ============================================================
-- Row Level Security (RLS) Policies
-- ============================================================

-- Enable RLS on all tables
alter table users enable row level security;
alter table projects enable row level security;
alter table tasks enable row level security;
alter table google_links enable row level security;
alter table saved_papers enable row level security;
alter table calendar_goals enable row level security;
alter table calendar_sessions enable row level security;
alter table subscriptions enable row level security;
alter table ai_usage enable row level security;

-- Users: can read/update own profile, read team members (via project_id)
create policy "Users can read own profile" on users for select using (auth.uid() = id);
create policy "Users can update own profile" on users for update using (auth.uid() = id);
create policy "Users can insert own profile" on users for insert with check (auth.uid() = id);
create policy "Users can read team members" on users for select using (
    project_id = get_my_project_id() and get_my_project_id() is not null
);

-- Projects: members can read (via users.project_id), owner can update/create
create policy "Project members can read" on projects for select using (
    id = get_my_project_id()
);
create policy "Project owner can update" on projects for update using (auth.uid() = owner_id);
create policy "Authenticated users can create projects" on projects for insert with check (auth.uid() = owner_id);
create policy "Anyone can read project by code" on projects for select using (true);
create policy "Project owner can delete" on projects for delete using (auth.uid() = owner_id);

-- Tasks: project members can CRUD (membership via users.project_id)
create policy "Tasks readable by project members" on tasks for select using (
    project_id = get_my_project_id() and get_my_project_id() is not null
);
create policy "Tasks insertable by project members" on tasks for insert with check (
    project_id = get_my_project_id() and get_my_project_id() is not null
);
create policy "Tasks updatable by project members" on tasks for update using (
    project_id = get_my_project_id() and get_my_project_id() is not null
);
create policy "Tasks deletable by project members" on tasks for delete using (
    project_id = get_my_project_id() and get_my_project_id() is not null
);

-- Google Links: project members can CRUD
create policy "Google links readable by project members" on google_links for select using (
    project_id = get_my_project_id() and get_my_project_id() is not null
);
create policy "Google links insertable by project members" on google_links for insert with check (
    project_id = get_my_project_id() and get_my_project_id() is not null
);
create policy "Google links deletable by project members" on google_links for delete using (
    project_id = get_my_project_id() and get_my_project_id() is not null
);

-- Saved Papers: project members can CRUD
create policy "Saved papers readable by project members" on saved_papers for select using (
    project_id = get_my_project_id() and get_my_project_id() is not null
);
create policy "Saved papers insertable by project members" on saved_papers for insert with check (
    project_id = get_my_project_id() and get_my_project_id() is not null
);
create policy "Saved papers deletable by project members" on saved_papers for delete using (
    project_id = get_my_project_id() and get_my_project_id() is not null
);

-- Calendar Goals: project members can CRUD
create policy "Calendar goals readable by project members" on calendar_goals for select using (
    project_id = get_my_project_id() and get_my_project_id() is not null
);
create policy "Calendar goals insertable by project members" on calendar_goals for insert with check (
    project_id = get_my_project_id() and get_my_project_id() is not null
);
create policy "Calendar goals updatable by project members" on calendar_goals for update using (
    project_id = get_my_project_id() and get_my_project_id() is not null
);
create policy "Calendar goals deletable by project members" on calendar_goals for delete using (
    project_id = get_my_project_id() and get_my_project_id() is not null
);

-- Calendar Sessions: project members can CRUD
create policy "Calendar sessions readable by project members" on calendar_sessions for select using (
    project_id = get_my_project_id() and get_my_project_id() is not null
);
create policy "Calendar sessions insertable by project members" on calendar_sessions for insert with check (
    project_id = get_my_project_id() and get_my_project_id() is not null
);
create policy "Calendar sessions updatable by project members" on calendar_sessions for update using (
    project_id = get_my_project_id() and get_my_project_id() is not null
);
create policy "Calendar sessions deletable by project members" on calendar_sessions for delete using (
    project_id = get_my_project_id() and get_my_project_id() is not null
);

-- Orientador Projects: orientador can read/manage their own, project members can read
alter table orientador_projects enable row level security;
alter table orientador_comments enable row level security;

create policy "Orientador can read own links" on orientador_projects for select using (auth.uid() = orientador_id);
create policy "Orientador can update own links" on orientador_projects for update using (auth.uid() = orientador_id);
create policy "Project members can read orientador" on orientador_projects for select using (
    project_id = get_my_project_id() and get_my_project_id() is not null
);
create policy "Authenticated can insert orientador_projects" on orientador_projects for insert with check (auth.role() = 'authenticated');
create policy "Orientador can delete own links" on orientador_projects for delete using (auth.uid() = orientador_id);

create policy "Orientador can read own comments" on orientador_comments for select using (auth.uid() = orientador_id);
create policy "Orientador can insert comments" on orientador_comments for insert with check (auth.uid() = orientador_id);
create policy "Orientador can delete own comments" on orientador_comments for delete using (auth.uid() = orientador_id);
create policy "Project members can read comments" on orientador_comments for select using (
    project_id = get_my_project_id() and get_my_project_id() is not null
);

-- Subscriptions: users can read own subscription, anyone authenticated can check
create policy "Users can read own subscription" on subscriptions for select using (auth.uid() = id);
create policy "Users can read subscription by project" on subscriptions for select using (true);

-- AI Usage: project members can read/write
create policy "AI usage readable by all authenticated" on ai_usage for select using (auth.role() = 'authenticated');
create policy "AI usage insertable by authenticated" on ai_usage for insert with check (auth.role() = 'authenticated');
create policy "AI usage updatable by authenticated" on ai_usage for update using (auth.role() = 'authenticated');

-- ============================================================
-- Indexes for performance
-- ============================================================
create index if not exists idx_tasks_project_id on tasks(project_id);
create index if not exists idx_google_links_project_id on google_links(project_id);
create index if not exists idx_saved_papers_project_id on saved_papers(project_id);
create index if not exists idx_calendar_goals_project_id on calendar_goals(project_id);
create index if not exists idx_calendar_sessions_project_id on calendar_sessions(project_id);
create index if not exists idx_calendar_sessions_date on calendar_sessions(project_id, date);
create index if not exists idx_projects_code on projects(code);
create index if not exists idx_users_project_id on users(project_id);
create index if not exists idx_ai_usage_project_month on ai_usage(project_id, month);
create index if not exists idx_orientador_projects_orientador on orientador_projects(orientador_id);
create index if not exists idx_orientador_projects_project on orientador_projects(project_id);
create index if not exists idx_orientador_projects_invite on orientador_projects(invite_code);
create index if not exists idx_orientador_comments_project on orientador_comments(project_id);

-- RLS for new tables (diary, notes, ideas, references)
alter table diary_entries enable row level security;
alter table notes enable row level security;
alter table ideas enable row level security;
alter table user_references enable row level security;

create policy "Diary entries by project members" on diary_entries for all using (
    project_id = get_my_project_id() and get_my_project_id() is not null
);
create policy "Notes by project members" on notes for all using (
    project_id = get_my_project_id() and get_my_project_id() is not null
);
create policy "Ideas by project members" on ideas for all using (
    project_id = get_my_project_id() and get_my_project_id() is not null
);
create policy "References by project members" on user_references for all using (
    project_id = get_my_project_id() and get_my_project_id() is not null
);

-- Subscriptions: allow upsert for max_projects
create policy "Users can upsert own subscription" on subscriptions for insert with check (auth.uid() = id);
create policy "Users can update own subscription" on subscriptions for update using (auth.uid() = id);

-- Allow anyone authenticated to read orientador_projects by invite_code (for accepting invites)
create policy "Anyone can read pending invite by code" on orientador_projects for select using (
    status = 'pending' and auth.role() = 'authenticated'
);

-- Allow project owner to delete orientador_projects (for cleanup on project deletion)
create policy "Project owner can delete orientador links" on orientador_projects for delete using (
    exists (select 1 from projects where projects.id = orientador_projects.project_id and projects.owner_id = auth.uid())
);

-- Allow project owner to delete orientador_comments (for cleanup on project deletion)
create policy "Project owner can delete orientador comments" on orientador_comments for delete using (
    exists (select 1 from projects where projects.id = orientador_comments.project_id and projects.owner_id = auth.uid())
);

-- Indexes for new tables
create index if not exists idx_diary_entries_project on diary_entries(project_id);
create index if not exists idx_notes_project on notes(project_id);
create index if not exists idx_ideas_project on ideas(project_id);
create index if not exists idx_user_references_project on user_references(project_id);
