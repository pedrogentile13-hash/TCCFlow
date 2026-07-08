-- ============================================================
-- Phase 1: Orientador Tables & RLS Policies
-- ============================================================

-- Tabela: orientador_projects
-- Tracks advisor invitations and relationships
CREATE TABLE IF NOT EXISTS orientador_projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    orientador_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    invite_code TEXT UNIQUE NOT NULL,
    status TEXT DEFAULT 'pending', -- pending, accepted, expired
    created_at TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT unique_project_orientador UNIQUE(project_id) -- One orientador per project
);

-- Tabela: orientador_comments
-- Comments/feedback from advisor on project
CREATE TABLE IF NOT EXISTS orientador_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    orientador_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    comment TEXT NOT NULL,
    section TEXT DEFAULT 'geral', -- geral, introducao, metodologia, resultados, conclusao, referencias, formatacao
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_orientador_projects_orientador_id ON orientador_projects(orientador_id);
CREATE INDEX IF NOT EXISTS idx_orientador_projects_project_id ON orientador_projects(project_id);
CREATE INDEX IF NOT EXISTS idx_orientador_projects_invite_code ON orientador_projects(invite_code);
CREATE INDEX IF NOT EXISTS idx_orientador_comments_project_id ON orientador_comments(project_id);
CREATE INDEX IF NOT EXISTS idx_orientador_comments_orientador_id ON orientador_comments(orientador_id);

-- ============================================================
-- RLS: orientador_projects
-- ============================================================

ALTER TABLE orientador_projects ENABLE ROW LEVEL SECURITY;

-- Policy: project owner can create/read/update/delete orientador invites
CREATE POLICY orientador_projects_owner_all
ON orientador_projects
FOR ALL
USING (
    project_id IN (
        SELECT id FROM projects WHERE owner_id = auth.uid()
    )
)
WITH CHECK (
    project_id IN (
        SELECT id FROM projects WHERE owner_id = auth.uid()
    )
);

-- Policy: orientador can read their linked projects
CREATE POLICY orientador_projects_self_read
ON orientador_projects
FOR SELECT
USING (
    orientador_id = auth.uid() AND status = 'accepted'
);

-- Policy: anyone can read pending invites by code (for accepting)
CREATE POLICY orientador_projects_pending_read
ON orientador_projects
FOR SELECT
USING (status = 'pending');

-- Policy: orientador can update their own status
CREATE POLICY orientador_projects_self_update
ON orientador_projects
FOR UPDATE
USING (orientador_id = auth.uid())
WITH CHECK (orientador_id = auth.uid());

-- ============================================================
-- RLS: orientador_comments
-- ============================================================

ALTER TABLE orientador_comments ENABLE ROW LEVEL SECURITY;

-- Policy: orientador can create/read/update/delete their own comments
CREATE POLICY orientador_comments_self_crud
ON orientador_comments
FOR ALL
USING (orientador_id = auth.uid())
WITH CHECK (orientador_id = auth.uid());

-- Policy: project members can read comments on their project
CREATE POLICY orientador_comments_project_members_read
ON orientador_comments
FOR SELECT
USING (
    project_id IN (
        SELECT id FROM projects WHERE members @> ARRAY[auth.uid()]::uuid[]
    ) OR
    project_id IN (
        SELECT project_id FROM orientador_projects WHERE orientador_id = auth.uid() AND status = 'accepted'
    )
);

-- ============================================================
-- Add 'role' column to users table (if not exists)
-- ============================================================

ALTER TABLE users ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'student';
-- Values: 'student' or 'orientador'

-- ============================================================
-- Add indexes for better query performance
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- ============================================================
-- Phase 3: Notifications for Orientador Feedback
-- ============================================================

CREATE TABLE IF NOT EXISTS orientador_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    orientador_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    comment_id UUID REFERENCES orientador_comments(id) ON DELETE CASCADE,
    type TEXT DEFAULT 'new_comment', -- new_comment, orientador_joined
    section TEXT, -- which section was commented on
    read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_orientador_notifications_user ON orientador_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_orientador_notifications_read ON orientador_notifications(user_id, read);

ALTER TABLE orientador_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY orientador_notifications_self_read ON orientador_notifications
FOR SELECT USING (user_id = auth.uid());

CREATE POLICY orientador_notifications_all ON orientador_notifications
FOR ALL USING (true) WITH CHECK (true);

-- ============================================================
-- Phase 4: Orientador Dashboard Stats (Materialized View)
-- ============================================================

CREATE TABLE IF NOT EXISTS orientador_stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    orientador_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    total_comments INT DEFAULT 0,
    sections_commented TEXT[], -- array of sections with comments
    students_count INT DEFAULT 0,
    tasks_count INT DEFAULT 0,
    tasks_completed INT DEFAULT 0,
    last_comment_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(orientador_id, project_id)
);

CREATE INDEX IF NOT EXISTS idx_orientador_stats_orientador ON orientador_stats(orientador_id);
CREATE INDEX IF NOT EXISTS idx_orientador_stats_updated ON orientador_stats(updated_at);

ALTER TABLE orientador_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY orientador_stats_self_read ON orientador_stats
FOR SELECT USING (orientador_id = auth.uid());

CREATE POLICY orientador_stats_all ON orientador_stats
FOR ALL USING (true) WITH CHECK (true);

-- ============================================================
-- Phase 5: Feedback Reports (for export/PDF)
-- ============================================================

CREATE TABLE IF NOT EXISTS orientador_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    orientador_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    title TEXT,
    content TEXT, -- JSON or HTML content
    format TEXT DEFAULT 'json', -- json, html, pdf
    generated_at TIMESTAMPTZ DEFAULT now(),
    expiry_at TIMESTAMPTZ, -- when the report expires (for cleanup)
    download_count INT DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_orientador_reports_orientador ON orientador_reports(orientador_id);
CREATE INDEX IF NOT EXISTS idx_orientador_reports_project ON orientador_reports(project_id);

ALTER TABLE orientador_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY orientador_reports_owner_all ON orientador_reports
FOR ALL USING (orientador_id = auth.uid())
WITH CHECK (orientador_id = auth.uid());

CREATE POLICY orientador_reports_students_read ON orientador_reports
FOR SELECT USING (
    project_id IN (
        SELECT id FROM projects WHERE members @> ARRAY[auth.uid()]::uuid[]
    )
);
