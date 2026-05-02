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
