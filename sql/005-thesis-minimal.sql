-- ============================================================
-- Criar tabelas de Trabalho Escrito (Thesis) - MINIMAL
-- SEM RLS, SEM POLICIES
-- ============================================================

CREATE TABLE IF NOT EXISTS thesis_chapters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    title TEXT NOT NULL DEFAULT '',
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_thesis_chapters_project ON thesis_chapters(project_id, sort_order);

CREATE TABLE IF NOT EXISTS thesis_sections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chapter_id UUID NOT NULL REFERENCES thesis_chapters(id) ON DELETE CASCADE,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    title TEXT NOT NULL DEFAULT '',
    content TEXT DEFAULT '',
    status TEXT DEFAULT 'draft',
    word_count INTEGER DEFAULT 0,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_thesis_sections_chapter ON thesis_sections(chapter_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_thesis_sections_project ON thesis_sections(project_id);

CREATE TABLE IF NOT EXISTS thesis_feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    section_id UUID NOT NULL REFERENCES thesis_sections(id) ON DELETE CASCADE,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    orientador_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    comment TEXT NOT NULL DEFAULT '',
    grade NUMERIC(4,2),
    status TEXT DEFAULT 'revision',
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_thesis_feedback_section ON thesis_feedback(section_id);
CREATE INDEX IF NOT EXISTS idx_thesis_feedback_project ON thesis_feedback(project_id);
CREATE INDEX IF NOT EXISTS idx_thesis_feedback_orientador ON thesis_feedback(orientador_id);

ALTER TABLE tasks ADD COLUMN IF NOT EXISTS description TEXT DEFAULT '';
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'medium';
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id);
