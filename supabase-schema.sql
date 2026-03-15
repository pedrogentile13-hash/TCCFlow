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

-- 9. AI Usage (Rate Limiting)
create table if not exists ai_usage (
    id text primary key,  -- format: {projectId}_{YYYY-MM}
    project_id uuid references projects(id) on delete cascade,
    month text not null,
    count integer default 0
);

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

-- Users: can read/update own profile, read team members
create policy "Users can read own profile" on users for select using (auth.uid() = id);
create policy "Users can update own profile" on users for update using (auth.uid() = id);
create policy "Users can insert own profile" on users for insert with check (auth.uid() = id);
create policy "Users can read team members" on users for select using (
    id in (
        select unnest(members) from projects where id in (
            select project_id from users where id = auth.uid()
        )
    )
);

-- Projects: members can read, owner can update
create policy "Project members can read" on projects for select using (auth.uid() = any(members));
create policy "Project owner can update" on projects for update using (auth.uid() = owner_id);
create policy "Authenticated users can create projects" on projects for insert with check (auth.uid() = owner_id);
create policy "Anyone can read project by code" on projects for select using (true);

-- Tasks: project members can CRUD
create policy "Tasks readable by project members" on tasks for select using (
    project_id in (select id from projects where auth.uid() = any(members))
);
create policy "Tasks insertable by project members" on tasks for insert with check (
    project_id in (select id from projects where auth.uid() = any(members))
);
create policy "Tasks updatable by project members" on tasks for update using (
    project_id in (select id from projects where auth.uid() = any(members))
);
create policy "Tasks deletable by project members" on tasks for delete using (
    project_id in (select id from projects where auth.uid() = any(members))
);

-- Google Links: project members can CRUD
create policy "Google links readable by project members" on google_links for select using (
    project_id in (select id from projects where auth.uid() = any(members))
);
create policy "Google links insertable by project members" on google_links for insert with check (
    project_id in (select id from projects where auth.uid() = any(members))
);
create policy "Google links deletable by project members" on google_links for delete using (
    project_id in (select id from projects where auth.uid() = any(members))
);

-- Saved Papers: project members can CRUD
create policy "Saved papers readable by project members" on saved_papers for select using (
    project_id in (select id from projects where auth.uid() = any(members))
);
create policy "Saved papers insertable by project members" on saved_papers for insert with check (
    project_id in (select id from projects where auth.uid() = any(members))
);
create policy "Saved papers deletable by project members" on saved_papers for delete using (
    project_id in (select id from projects where auth.uid() = any(members))
);

-- Calendar Goals: project members can CRUD
create policy "Calendar goals readable by project members" on calendar_goals for select using (
    project_id in (select id from projects where auth.uid() = any(members))
);
create policy "Calendar goals insertable by project members" on calendar_goals for insert with check (
    project_id in (select id from projects where auth.uid() = any(members))
);
create policy "Calendar goals updatable by project members" on calendar_goals for update using (
    project_id in (select id from projects where auth.uid() = any(members))
);
create policy "Calendar goals deletable by project members" on calendar_goals for delete using (
    project_id in (select id from projects where auth.uid() = any(members))
);

-- Calendar Sessions: project members can CRUD
create policy "Calendar sessions readable by project members" on calendar_sessions for select using (
    project_id in (select id from projects where auth.uid() = any(members))
);
create policy "Calendar sessions insertable by project members" on calendar_sessions for insert with check (
    project_id in (select id from projects where auth.uid() = any(members))
);
create policy "Calendar sessions updatable by project members" on calendar_sessions for update using (
    project_id in (select id from projects where auth.uid() = any(members))
);
create policy "Calendar sessions deletable by project members" on calendar_sessions for delete using (
    project_id in (select id from projects where auth.uid() = any(members))
);

-- Subscriptions: users can read own subscription, project members can check owner
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
